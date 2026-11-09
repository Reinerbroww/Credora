"""Model validation / sanity suite for the Credora LightGBM service.

This is a contract and behaviour check, not a statistical evaluation against a
labelled holdout set (no labelled data ships with this repo). Run it before
deploying a new model artifact:

    ml/.venv/Scripts/python.exe ml/validate_model.py
"""

import math
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import app as service  # noqa: E402

DEFAULT = {
    "person_age": 30,
    "person_income": 60000.0,
    "person_emp_length": 5.0,
    "loan_amnt": 15000.0,
    "loan_int_rate": 11.5,
    "cb_person_cred_hist_length": 6,
    "person_home_ownership": "RENT",
    "loan_intent": "PERSONAL",
    "loan_grade": "B",
    "cb_person_default_on_file": "N",
}

failures: list[str] = []


def check(name: str, condition: bool, detail: str = "") -> None:
    if condition:
        print(f"PASS  {name}")
    else:
        failures.append(name)
        print(f"FAIL  {name} {detail}".rstrip())


def predict(**overrides):
    payload = {**DEFAULT, **overrides}
    return service.predict(service.ApplicantRequest(**payload))


def main() -> int:
    check("feature contract has 22 features", len(service.FEATURE_ORDER) == 22)
    check(
        "scaler expects 22 features",
        getattr(service._scaler, "n_features_in_", None) == 22,
        f"(got {getattr(service._scaler, 'n_features_in_', None)})",
    )
    check("model is fitted", hasattr(service._model, "predict_proba"))

    try:
        booster_features = service._model.booster_.feature_name()
    except AttributeError:
        booster_features = None
    if booster_features is not None:
        check(
            "booster feature order matches contract",
            list(booster_features) == service.FEATURE_ORDER,
            f"(got {booster_features})",
        )

    high_income = predict(person_income=80000.0, loan_amnt=20000.0)
    low_income = predict(person_income=20000.0, loan_amnt=5000.0)
    check(
        "higher income lowers default probability",
        low_income.probability > high_income.probability,
        f"({low_income.probability:.4f} vs {high_income.probability:.4f})",
    )

    with_default = predict(cb_person_default_on_file="Y")
    without_default = predict(cb_person_default_on_file="N")
    check(
        "default on file raises default probability",
        with_default.probability > without_default.probability,
        f"({with_default.probability:.4f} vs {without_default.probability:.4f})",
    )

    grade_g = predict(loan_grade="G")
    grade_a = predict(loan_grade="A")
    check(
        "worse loan grade raises default probability",
        grade_g.probability > grade_a.probability,
        f"({grade_g.probability:.4f} vs {grade_a.probability:.4f})",
    )

    high_rate = predict(loan_int_rate=20.0)
    low_rate = predict(loan_int_rate=8.0)
    check(
        "higher interest rate raises default probability",
        high_rate.probability > low_rate.probability,
        f"({high_rate.probability:.4f} vs {low_rate.probability:.4f})",
    )

    decisions = set()
    for income in (10000.0, 25000.0, 45000.0, 80000.0):
        result = predict(person_income=income, loan_amnt=income * 0.25)
        check(
            f"probability in [0,1] for income={income:.0f}",
            0.0 <= result.probability <= 1.0,
        )
        check(
            f"decision matches thresholds for income={income:.0f}",
            result.decision
            == service.classify(
                result.probability, result.threshold_low, result.threshold_high
            ),
        )
        check(
            f"loan_percent_income is consistent for income={income:.0f}",
            math.isclose(result.loan_percent_income, 0.25, abs_tol=1e-9),
        )
        decisions.add(result.decision)

    check(
        "income range spans multiple decision bands",
        len(decisions) >= 2,
        f"(decisions={sorted(decisions)})",
    )

    sample = predict()
    check(
        "contributions cover every feature",
        len(sample.contributions) == 22,
    )
    check(
        "contributions are finite",
        all(math.isfinite(item.value) for item in sample.contributions),
    )

    if failures:
        print(f"\n{len(failures)} check(s) failed: {', '.join(failures)}")
        return 1
    print("\nAll model checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
