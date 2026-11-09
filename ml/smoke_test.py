"""Smoke test for a running Credora risk-scoring service.

Usage:
    python ml/smoke_test.py
    ML_SERVICE_URL=https://my-service ML_SERVICE_API_KEY=secret python ml/smoke_test.py
"""

import json
import os
import urllib.error
import urllib.request

BASE_URL = os.environ.get("ML_SERVICE_URL", "http://127.0.0.1:8000").rstrip("/")
API_KEY = os.environ.get("ML_SERVICE_API_KEY", "").strip()

SAMPLE = {
    "person_age": 30,
    "person_income": 60000,
    "person_emp_length": 5,
    "loan_amnt": 15000,
    "loan_int_rate": 11.5,
    "cb_person_cred_hist_length": 6,
    "person_home_ownership": "RENT",
    "loan_intent": "PERSONAL",
    "loan_grade": "B",
    "cb_person_default_on_file": "N",
}


def request(path: str, payload: dict | None = None) -> dict:
    headers = {"Content-Type": "application/json"}
    if API_KEY:
        headers["Authorization"] = f"Bearer {API_KEY}"
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(
        f"{BASE_URL}{path}", data=data, headers=headers, method="POST" if data else "GET"
    )
    with urllib.request.urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode())


def main() -> None:
    health = request("/health")
    assert health.get("status") == "ok", health
    print(f"health: ok ({health.get('model')})")

    info = request("/model/info")
    assert info["feature_count"] == 22, info
    assert len(info["features"]) == 22, info
    print(f"model: {info['model']} {info['model_version']} ({info['algorithm']})")

    prediction = request("/predict", SAMPLE)
    probability = prediction["probability"]
    assert 0.0 <= probability <= 1.0, prediction
    assert prediction["decision"] in {"approve", "review", "reject"}, prediction
    assert len(prediction["contributions"]) == 22, prediction
    print(
        f"predict: p={probability:.4f} decision={prediction['decision']} "
        f"contributions={len(prediction['contributions'])}"
    )

    if API_KEY:
        try:
            urllib.request.urlopen(
                urllib.request.Request(f"{BASE_URL}/model/info"), timeout=10
            )
            raise AssertionError("unauthenticated request unexpectedly succeeded")
        except urllib.error.HTTPError as error:
            assert error.code == 401, error
            print("auth: unauthenticated request rejected")

    print("smoke test passed")


if __name__ == "__main__":
    main()
