"""Credora risk-scoring service.

Wraps the trained LightGBM PayLater classifier from
https://github.com/Reinerbroww/paylater-credit-scoring-engine.

The monetary features (person_income, loan_amnt) are expected in the training
distribution (USD-scale). The Next.js adapter converts IDR before calling this
service.
"""

from pathlib import Path
from typing import Dict, List, Literal
import os

import joblib
import pandas as pd
from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "lightgbm_paylater.pkl"
SCALER_PATH = BASE_DIR / "model" / "credit_data_scaler.pkl"

FEATURE_ORDER = [
    "person_age",
    "person_income",
    "person_emp_length",
    "loan_amnt",
    "loan_int_rate",
    "loan_percent_income",
    "cb_person_cred_hist_length",
    "person_home_ownership_OTHER",
    "person_home_ownership_OWN",
    "person_home_ownership_RENT",
    "loan_intent_EDUCATION",
    "loan_intent_HOMEIMPROVEMENT",
    "loan_intent_MEDICAL",
    "loan_intent_PERSONAL",
    "loan_intent_VENTURE",
    "loan_grade_B",
    "loan_grade_C",
    "loan_grade_D",
    "loan_grade_E",
    "loan_grade_F",
    "loan_grade_G",
    "cb_person_default_on_file_Y",
]

MODEL_NAME = "LightGBM PayLater"
MODEL_VERSION = "v1.0"
DECISION_LOW = 0.35
DECISION_HIGH = 0.70
API_KEY = os.environ.get("ML_SERVICE_API_KEY", "").strip()

HomeOwnership = Literal["RENT", "OWN", "MORTGAGE", "OTHER"]
LoanIntent = Literal[
    "DEBTCONSOLIDATION",
    "EDUCATION",
    "HOMEIMPROVEMENT",
    "MEDICAL",
    "PERSONAL",
    "VENTURE",
]
LoanGrade = Literal["A", "B", "C", "D", "E", "F", "G"]
DefaultFlag = Literal["N", "Y"]

app = FastAPI(title="Credora Risk Scoring Service", version=MODEL_VERSION)

_model = joblib.load(MODEL_PATH)
_scaler = joblib.load(SCALER_PATH)


class ApplicantRequest(BaseModel):
    person_age: int = Field(..., ge=18, le=100)
    person_income: float = Field(..., gt=0, description="Annual income, USD-scale")
    person_emp_length: float = Field(..., ge=0)
    loan_amnt: float = Field(..., gt=0, description="Requested amount, USD-scale")
    loan_int_rate: float = Field(..., gt=0)
    cb_person_cred_hist_length: int = Field(..., ge=0)
    person_home_ownership: HomeOwnership = "RENT"
    loan_intent: LoanIntent = "MEDICAL"
    loan_grade: LoanGrade = "A"
    cb_person_default_on_file: DefaultFlag = "N"
    threshold_low: float = Field(DECISION_LOW, ge=0.0, le=1.0)
    threshold_high: float = Field(DECISION_HIGH, ge=0.0, le=1.0)


class Contribution(BaseModel):
    feature: str
    value: float


class PredictionResponse(BaseModel):
    probability: float
    decision: Literal["approve", "review", "reject"]
    loan_percent_income: float
    contributions: List[Contribution]
    model: str
    model_version: str
    threshold_low: float
    threshold_high: float


def build_feature_vector(request: ApplicantRequest) -> pd.DataFrame:
    row: Dict[str, float] = {key: 0.0 for key in FEATURE_ORDER}
    row["person_age"] = float(request.person_age)
    row["person_income"] = float(request.person_income)
    row["person_emp_length"] = float(request.person_emp_length)
    row["loan_amnt"] = float(request.loan_amnt)
    row["loan_int_rate"] = float(request.loan_int_rate)
    row["loan_percent_income"] = float(request.loan_amnt / request.person_income)
    row["cb_person_cred_hist_length"] = float(request.cb_person_cred_hist_length)

    home_key = f"person_home_ownership_{request.person_home_ownership}"
    if home_key in row:
        row[home_key] = 1.0

    intent_key = f"loan_intent_{request.loan_intent}"
    if intent_key in row:
        row[intent_key] = 1.0

    grade_key = f"loan_grade_{request.loan_grade}"
    if grade_key in row:
        row[grade_key] = 1.0

    if request.cb_person_default_on_file == "Y":
        row["cb_person_default_on_file_Y"] = 1.0

    return pd.DataFrame([[row[key] for key in FEATURE_ORDER]], columns=FEATURE_ORDER)


def require_api_key(authorization: str | None = Header(default=None)) -> None:
    if not API_KEY:
        return
    if authorization != f"Bearer {API_KEY}":
        raise HTTPException(status_code=401, detail="Invalid or missing API key")


def classify(probability: float, low: float, high: float) -> str:
    if probability < low:
        return "approve"
    if probability <= high:
        return "review"
    return "reject"


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_NAME}


@app.get("/model/info", dependencies=[Depends(require_api_key)])
def model_info() -> dict:
    return {
        "model": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "algorithm": type(_model).__name__,
        "feature_count": len(FEATURE_ORDER),
        "features": FEATURE_ORDER,
        "default_thresholds": {"low": DECISION_LOW, "high": DECISION_HIGH},
    }


@app.post(
    "/predict",
    response_model=PredictionResponse,
    dependencies=[Depends(require_api_key)],
)
def predict(request: ApplicantRequest) -> PredictionResponse:
    features = build_feature_vector(request)
    scaled = pd.DataFrame(
        _scaler.transform(features), columns=FEATURE_ORDER
    )
    probability = float(_model.predict_proba(scaled)[0, 1])
    contributions = _model.booster_.predict(scaled, pred_contrib=True)[0][:-1]

    return PredictionResponse(
        probability=probability,
        decision=classify(probability, request.threshold_low, request.threshold_high),
        loan_percent_income=float(request.loan_amnt / request.person_income),
        contributions=[
            Contribution(feature=name, value=float(value))
            for name, value in zip(FEATURE_ORDER, contributions)
        ],
        model=MODEL_NAME,
        model_version=MODEL_VERSION,
        threshold_low=request.threshold_low,
        threshold_high=request.threshold_high,
    )
