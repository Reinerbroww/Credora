export type Role = "Risk Analyst" | "Credit Officer";

export type RiskCategory = "Low Risk" | "Medium Risk" | "High Risk";

export type ApplicationStatus =
  | "Pending Review"
  | "Assessed"
  | "Under Review"
  | "Approved"
  | "Rejected";

export type ReviewStatus = "Pending" | "In Review" | "Completed";

export type FinalDecision = "Approved" | "Rejected" | "Manual Review";

export type HomeOwnership = "RENT" | "OWN" | "MORTGAGE" | "OTHER";

export type LoanIntent =
  | "PERSONAL"
  | "EDUCATION"
  | "MEDICAL"
  | "VENTURE"
  | "HOMEIMPROVEMENT"
  | "DEBTCONSOLIDATION";

export type LoanGrade = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type DefaultFlag = "N" | "Y";

export interface Application {
  id: string;
  organization_id: string;
  applicant_name: string;
  applicant_email: string;
  age: number;
  person_income: number;
  employment_length: number;
  loan_amnt: number;
  loan_int_rate: number;
  loan_percent_income: number;
  home_ownership: HomeOwnership;
  loan_intent: LoanIntent;
  loan_grade: LoanGrade;
  cb_person_cred_hist_length: number;
  cb_person_default_on_file: DefaultFlag;
  status: ApplicationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContributingFactor {
  key: string;
  label: string;
  value: string;
  direction: "increases" | "decreases";
  impact: number;
  weight: number;
}

export interface RiskAssessment {
  id: string;
  application_id: string;
  model_name: string;
  model_version: string;
  default_probability: number;
  risk_category: RiskCategory;
  contributing_factors: ContributingFactor[];
  assessed_by: string;
  assessed_at: string;
}

export interface UnderwritingReview {
  id: string;
  application_id: string;
  reviewer_id: string;
  review_status: ReviewStatus;
  final_decision: FinalDecision | null;
  decision_reason: string;
  review_notes: string;
  reviewed_at: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  role: Role;
  email: string;
}

export interface Session {
  id: string;
  full_name: string;
  role: Role;
  email: string;
  organization_id: string;
  organization_name: string;
}

export interface CredoraData {
  applications: Application[];
  assessments: RiskAssessment[];
  reviews: UnderwritingReview[];
}

export interface ApplicationInput {
  applicant_name: string;
  applicant_email: string;
  age: number;
  person_income: number;
  employment_length: number;
  loan_amnt: number;
  loan_int_rate: number;
  home_ownership: HomeOwnership;
  loan_intent: LoanIntent;
  loan_grade: LoanGrade;
  cb_person_cred_hist_length: number;
  cb_person_default_on_file: DefaultFlag;
}
