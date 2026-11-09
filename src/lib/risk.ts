import type {
  Application,
  ContributingFactor,
  RiskCategory,
} from "./types";

const MODEL_NAME = "Credora Heuristic";
const MODEL_VERSION = "fallback-v1.0";

interface RawFactor {
  key: string;
  label: string;
  value: string;
  impact: number;
}

function sigmoid(value: number): number {
  return 1 / (1 + Math.exp(-value));
}

function incomeImpact(income: number): number {
  if (income < 5_000_000) return 0.75;
  if (income < 8_000_000) return 0.4;
  if (income > 20_000_000) return -0.35;
  if (income > 15_000_000) return -0.15;
  return 0;
}

function ageImpact(age: number): number {
  if (age < 23) return 0.4;
  if (age < 27) return 0.18;
  if (age > 48) return -0.2;
  if (age > 40) return -0.08;
  return 0;
}

function homeImpact(home: Application["home_ownership"]): number {
  if (home === "RENT") return 0.28;
  if (home === "OWN") return -0.22;
  if (home === "MORTGAGE") return -0.08;
  return 0.05;
}

function intentImpact(intent: Application["loan_intent"]): number {
  switch (intent) {
    case "DEBTCONSOLIDATION":
      return 0.32;
    case "VENTURE":
      return 0.24;
    case "MEDICAL":
      return 0.16;
    case "HOMEIMPROVEMENT":
      return -0.05;
    case "EDUCATION":
      return -0.14;
    default:
      return 0;
  }
}

function gradeImpact(grade: Application["loan_grade"]): number {
  switch (grade) {
    case "A":
      return -0.35;
    case "B":
      return -0.18;
    case "C":
      return 0;
    case "D":
      return 0.2;
    case "E":
      return 0.4;
    case "F":
      return 0.58;
    case "G":
      return 0.75;
    default:
      return 0;
  }
}

function creditHistoryImpact(length: number): number {
  return Math.max(-0.3, Math.min(0.35, (6 - length) * 0.05));
}

function homeLabel(home: Application["home_ownership"]): string {
  switch (home) {
    case "RENT":
      return "Renting";
    case "OWN":
      return "Owned";
    case "MORTGAGE":
      return "Mortgage";
    default:
      return "Other";
  }
}

function intentLabel(intent: Application["loan_intent"]): string {
  switch (intent) {
    case "DEBTCONSOLIDATION":
      return "Debt consolidation";
    case "HOMEIMPROVEMENT":
      return "Home improvement";
    case "VENTURE":
      return "Business venture";
    case "PERSONAL":
      return "Personal";
    case "EDUCATION":
      return "Education";
    case "MEDICAL":
      return "Medical";
    default:
      return intent;
  }
}

export interface RiskResult {
  default_probability: number;
  risk_category: RiskCategory;
  contributing_factors: ContributingFactor[];
  model_name: string;
  model_version: string;
}

export function categoryFromProbability(probability: number): RiskCategory {
  if (probability < 0.18) return "Low Risk";
  if (probability < 0.42) return "Medium Risk";
  return "High Risk";
}

export function assessApplication(application: Application): RiskResult {
  const ratio = application.loan_percent_income;
  const rate = application.loan_int_rate;
  const employment = application.employment_length;

  const rawFactors: RawFactor[] = [
    {
      key: "loan_percent_income",
      label: "Loan-to-income ratio",
      value: `${(ratio * 100).toFixed(1)}% of income`,
      impact: (ratio - 0.25) * 4,
    },
    {
      key: "loan_int_rate",
      label: "Interest rate",
      value: `${rate.toFixed(2)}%`,
      impact: (rate - 12) * 0.09,
    },
    {
      key: "employment_length",
      label: "Employment length",
      value: `${employment.toFixed(1)} yrs`,
      impact: (6 - employment) * 0.06,
    },
    {
      key: "person_income",
      label: "Annual income",
      value: `Rp ${Math.round(application.person_income).toLocaleString("id-ID")}`,
      impact: incomeImpact(application.person_income),
    },
    {
      key: "age",
      label: "Applicant age",
      value: `${application.age} yrs`,
      impact: ageImpact(application.age),
    },
    {
      key: "home_ownership",
      label: "Home ownership",
      value: homeLabel(application.home_ownership),
      impact: homeImpact(application.home_ownership),
    },
    {
      key: "loan_intent",
      label: "Loan purpose",
      value: intentLabel(application.loan_intent),
      impact: intentImpact(application.loan_intent),
    },
    {
      key: "loan_grade",
      label: "Loan grade",
      value: `Grade ${application.loan_grade}`,
      impact: gradeImpact(application.loan_grade),
    },
    {
      key: "cb_person_cred_hist_length",
      label: "Credit history length",
      value: `${application.cb_person_cred_hist_length} yrs`,
      impact: creditHistoryImpact(application.cb_person_cred_hist_length),
    },
    {
      key: "cb_person_default_on_file",
      label: "Historical default",
      value:
        application.cb_person_default_on_file === "Y" ? "Yes" : "No record",
      impact: application.cb_person_default_on_file === "Y" ? 0.6 : 0,
    },
  ];

  const logit =
    -2.4 + rawFactors.reduce((total, factor) => total + factor.impact, 0);
  const probability = sigmoid(logit);

  const ranked = [...rawFactors]
    .filter((factor) => Math.abs(factor.impact) > 0.001)
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5);

  const totalImpact = ranked.reduce(
    (total, factor) => total + Math.abs(factor.impact),
    0,
  );

  const contributingFactors: ContributingFactor[] = ranked.map((factor) => ({
    key: factor.key,
    label: factor.label,
    value: factor.value,
    direction: factor.impact >= 0 ? "increases" : "decreases",
    impact: Number(factor.impact.toFixed(4)),
    weight: totalImpact === 0 ? 0 : Math.round((Math.abs(factor.impact) / totalImpact) * 100),
  }));

  return {
    default_probability: Number(probability.toFixed(6)),
    risk_category: categoryFromProbability(probability),
    contributing_factors: contributingFactors,
    model_name: MODEL_NAME,
    model_version: MODEL_VERSION,
  };
}
