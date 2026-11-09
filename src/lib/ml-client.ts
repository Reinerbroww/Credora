import { assessApplication, type RiskResult } from "./risk";
import type { Application, ContributingFactor, RiskCategory } from "./types";

interface MlContribution {
  feature: string;
  value: number;
}

export interface MlPrediction {
  probability: number;
  decision: "approve" | "review" | "reject";
  loan_percent_income: number;
  contributions: MlContribution[];
  model: string;
  model_version: string;
  threshold_low: number;
  threshold_high: number;
}

const DEFAULT_IDR_PER_USD = 4_000;
const DEFAULT_TIMEOUT_MS = 8_000;

function idrPerUsd(): number {
  const parsed = Number(process.env.ML_IDR_PER_USD ?? DEFAULT_IDR_PER_USD);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_IDR_PER_USD;
}

function serviceTimeout(): number {
  const parsed = Number(process.env.ML_SERVICE_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
}

export async function predictRisk(
  application: Application,
): Promise<MlPrediction | null> {
  const baseUrl = process.env.ML_SERVICE_URL?.trim();
  if (!baseUrl) return null;

  const scale = idrPerUsd();
  const apiKey = process.env.ML_SERVICE_API_KEY?.trim();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), serviceTimeout());

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        person_age: application.age,
        person_income: application.person_income / scale,
        person_emp_length: application.employment_length,
        loan_amnt: application.loan_amnt / scale,
        loan_int_rate: application.loan_int_rate,
        cb_person_cred_hist_length: application.cb_person_cred_hist_length,
        person_home_ownership: application.home_ownership,
        loan_intent: application.loan_intent,
        loan_grade: application.loan_grade,
        cb_person_default_on_file: application.cb_person_default_on_file,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as MlPrediction;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

type FactorGroup = {
  key: string;
  label: string;
  value: string;
  impact: number;
};

const FEATURE_GROUPS: Record<string, { key: string; label: string }> = {
  person_age: { key: "person_age", label: "Applicant age" },
  person_income: { key: "person_income", label: "Annual income" },
  person_emp_length: { key: "person_emp_length", label: "Employment length" },
  loan_amnt: { key: "loan_amnt", label: "Requested loan amount" },
  loan_int_rate: { key: "loan_int_rate", label: "Interest rate" },
  loan_percent_income: {
    key: "loan_percent_income",
    label: "Loan-to-income ratio",
  },
  cb_person_cred_hist_length: {
    key: "cb_person_cred_hist_length",
    label: "Credit history length",
  },
  person_home_ownership_OTHER: {
    key: "home_ownership",
    label: "Home ownership",
  },
  person_home_ownership_OWN: { key: "home_ownership", label: "Home ownership" },
  person_home_ownership_RENT: { key: "home_ownership", label: "Home ownership" },
  loan_intent_EDUCATION: { key: "loan_intent", label: "Loan purpose" },
  loan_intent_HOMEIMPROVEMENT: { key: "loan_intent", label: "Loan purpose" },
  loan_intent_MEDICAL: { key: "loan_intent", label: "Loan purpose" },
  loan_intent_PERSONAL: { key: "loan_intent", label: "Loan purpose" },
  loan_intent_VENTURE: { key: "loan_intent", label: "Loan purpose" },
  loan_grade_B: { key: "loan_grade", label: "Loan grade" },
  loan_grade_C: { key: "loan_grade", label: "Loan grade" },
  loan_grade_D: { key: "loan_grade", label: "Loan grade" },
  loan_grade_E: { key: "loan_grade", label: "Loan grade" },
  loan_grade_F: { key: "loan_grade", label: "Loan grade" },
  loan_grade_G: { key: "loan_grade", label: "Loan grade" },
  cb_person_default_on_file_Y: {
    key: "cb_person_default_on_file",
    label: "Historical default",
  },
};

const HOME_LABELS: Record<string, string> = {
  RENT: "Renting",
  OWN: "Owned",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

const INTENT_LABELS: Record<string, string> = {
  PERSONAL: "Personal",
  EDUCATION: "Education",
  MEDICAL: "Medical",
  VENTURE: "Business venture",
  HOMEIMPROVEMENT: "Home improvement",
  DEBTCONSOLIDATION: "Debt consolidation",
};

function factorValue(application: Application, key: string): string {
  switch (key) {
    case "person_age":
      return `${application.age} yrs`;
    case "person_income":
      return `Rp ${Math.round(application.person_income).toLocaleString("id-ID")}`;
    case "person_emp_length":
      return `${application.employment_length.toFixed(1)} yrs`;
    case "loan_amnt":
      return `Rp ${Math.round(application.loan_amnt).toLocaleString("id-ID")}`;
    case "loan_int_rate":
      return `${application.loan_int_rate.toFixed(2)}%`;
    case "loan_percent_income":
      return `${(application.loan_percent_income * 100).toFixed(1)}% of income`;
    case "cb_person_cred_hist_length":
      return `${application.cb_person_cred_hist_length} yrs`;
    case "home_ownership":
      return HOME_LABELS[application.home_ownership] ?? application.home_ownership;
    case "loan_intent":
      return INTENT_LABELS[application.loan_intent] ?? application.loan_intent;
    case "loan_grade":
      return `Grade ${application.loan_grade}`;
    case "cb_person_default_on_file":
      return application.cb_person_default_on_file === "Y" ? "Yes" : "No record";
    default:
      return "";
  }
}

function categoryFromThresholds(prediction: MlPrediction): RiskCategory {
  if (prediction.probability < prediction.threshold_low) return "Low Risk";
  if (prediction.probability <= prediction.threshold_high) return "Medium Risk";
  return "High Risk";
}

function buildFactors(
  application: Application,
  prediction: MlPrediction,
): ContributingFactor[] {
  const grouped = new Map<string, FactorGroup>();

  for (const contribution of prediction.contributions) {
    const group = FEATURE_GROUPS[contribution.feature];
    if (!group) continue;

    const existing = grouped.get(group.key);
    if (existing) {
      existing.impact += contribution.value;
    } else {
      grouped.set(group.key, {
        key: group.key,
        label: group.label,
        value: factorValue(application, group.key),
        impact: contribution.value,
      });
    }
  }

  const ranked = [...grouped.values()]
    .filter((factor) => Math.abs(factor.impact) > 0.001)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5);

  const totalImpact = ranked.reduce(
    (total, factor) => total + Math.abs(factor.impact),
    0,
  );

  return ranked.map((factor) => ({
    key: factor.key,
    label: factor.label,
    value: factor.value,
    direction: factor.impact >= 0 ? "increases" : "decreases",
    impact: Number(factor.impact.toFixed(4)),
    weight:
      totalImpact === 0
        ? 0
        : Math.round((Math.abs(factor.impact) / totalImpact) * 100),
  }));
}

function riskResultFromPrediction(
  application: Application,
  prediction: MlPrediction,
): RiskResult {
  return {
    default_probability: Number(prediction.probability.toFixed(6)),
    risk_category: categoryFromThresholds(prediction),
    contributing_factors: buildFactors(application, prediction),
    model_name: prediction.model,
    model_version: prediction.model_version,
  };
}

export async function assessWithModel(
  application: Application,
): Promise<RiskResult> {
  const prediction = await predictRisk(application);
  if (!prediction) {
    return assessApplication(application);
  }
  return riskResultFromPrediction(application, prediction);
}
