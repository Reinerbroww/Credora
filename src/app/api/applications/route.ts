import { requireRole } from "@/lib/api-auth";
import { createApplication } from "@/lib/server-data";
import type {
  ApplicationInput,
  DefaultFlag,
  HomeOwnership,
  LoanGrade,
  LoanIntent,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOME_OWNERSHIPS: HomeOwnership[] = ["RENT", "OWN", "MORTGAGE", "OTHER"];
const LOAN_INTENTS: LoanIntent[] = [
  "PERSONAL",
  "EDUCATION",
  "MEDICAL",
  "VENTURE",
  "HOMEIMPROVEMENT",
  "DEBTCONSOLIDATION",
];
const LOAN_GRADES: LoanGrade[] = ["A", "B", "C", "D", "E", "F", "G"];
const DEFAULT_FLAGS: DefaultFlag[] = ["N", "Y"];

function parseInput(body: unknown): ApplicationInput | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Record<string, unknown>;

  const applicantName = String(value.applicant_name ?? "").trim();
  const applicantEmail = String(value.applicant_email ?? "").trim();
  const age = Number(value.age);
  const personIncome = Number(value.person_income);
  const employmentLength = Number(value.employment_length);
  const loanAmount = Number(value.loan_amnt);
  const loanInterestRate = Number(value.loan_int_rate);
  const homeOwnership = String(value.home_ownership ?? "") as HomeOwnership;
  const loanIntent = String(value.loan_intent ?? "") as LoanIntent;
  const loanGrade = String(value.loan_grade ?? "") as LoanGrade;
  const creditHistoryLength = Number(value.cb_person_cred_hist_length);
  const defaultOnFile = String(
    value.cb_person_default_on_file ?? "",
  ) as DefaultFlag;

  if (applicantName.length < 3) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applicantEmail)) return null;
  if (!Number.isFinite(age) || age < 18 || age > 80) return null;
  if (!Number.isFinite(personIncome) || personIncome <= 0) return null;
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null;
  if (!Number.isFinite(loanInterestRate) || loanInterestRate <= 0 || loanInterestRate > 60) {
    return null;
  }
  if (
    !Number.isFinite(employmentLength) ||
    employmentLength < 0 ||
    employmentLength > 60
  ) {
    return null;
  }
  if (!HOME_OWNERSHIPS.includes(homeOwnership)) return null;
  if (!LOAN_INTENTS.includes(loanIntent)) return null;
  if (!LOAN_GRADES.includes(loanGrade)) return null;
  if (
    !Number.isFinite(creditHistoryLength) ||
    creditHistoryLength < 0 ||
    creditHistoryLength > 80
  ) {
    return null;
  }
  if (!DEFAULT_FLAGS.includes(defaultOnFile)) return null;

  return {
    applicant_name: applicantName,
    applicant_email: applicantEmail,
    age: Math.round(age),
    person_income: personIncome,
    employment_length: employmentLength,
    loan_amnt: loanAmount,
    loan_int_rate: loanInterestRate,
    home_ownership: homeOwnership,
    loan_intent: loanIntent,
    loan_grade: loanGrade,
    cb_person_cred_hist_length: Math.round(creditHistoryLength),
    cb_person_default_on_file: defaultOnFile,
  };
}

export async function POST(request: Request) {
  const gate = await requireRole("Risk Analyst");
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const input = parseInput(await request.json().catch(() => null));
  if (!input) {
    return Response.json({ error: "Invalid application data." }, { status: 400 });
  }

  const application = await createApplication(
    user.organizationId,
    user.id,
    input,
  );
  return Response.json({ application }, { status: 201 });
}
