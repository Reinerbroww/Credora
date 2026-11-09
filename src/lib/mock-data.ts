import { assessApplication } from "./risk";
import type {
  Application,
  CredoraData,
  DefaultFlag,
  HomeOwnership,
  LoanGrade,
  LoanIntent,
  RiskAssessment,
  UnderwritingReview,
} from "./types";

export const ORGANIZATION_ID = "0f0b6f1e-2f4a-4c1a-9a1e-000000000001";
export const ANALYST_ID = "8a1c3e5f-7b9d-4f2a-8c4e-000000000001";
export const OFFICER_ID = "9b2d4f6a-8c0e-4a3b-9d5f-000000000002";
export const DEMO_ORGANIZATION_NAME = "Nusantara PayLater";
export const DEMO_ACCOUNTS = [
  { id: ANALYST_ID, email: "analyst@credora.id", full_name: "Rani Prameswari", role: "Risk Analyst" as const },
  { id: OFFICER_ID, email: "officer@credora.id", full_name: "Bayu Santoso", role: "Credit Officer" as const },
];
export const DEMO_PASSWORD = "credora123";

const BASE_DATE = new Date("2026-11-04T09:00:00.000Z");
const DAY = 86_400_000;

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeUuid(random: () => number): string {
  const hex = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < 32; i += 1) {
    if (i === 8 || i === 12 || i === 16 || i === 20) out += "-";
    out += hex[Math.floor(random() * 16)];
  }
  return out;
}

const APPLICANTS: Array<{ name: string; email: string }> = [
  { name: "Aisyah Putri", email: "aisyah.putri@mail.com" },
  { name: "Bagas Pratama", email: "bagas.pratama@mail.com" },
  { name: "Citra Lestari", email: "citra.lestari@mail.com" },
  { name: "Dimas Saputra", email: "dimas.saputra@mail.com" },
  { name: "Eka Maharani", email: "eka.maharani@mail.com" },
  { name: "Fajar Nugroho", email: "fajar.nugroho@mail.com" },
  { name: "Gita Permata", email: "gita.permata@mail.com" },
  { name: "Hendra Wijaya", email: "hendra.wijaya@mail.com" },
  { name: "Indah Kusuma", email: "indah.kusuma@mail.com" },
  { name: "Joko Susilo", email: "joko.susilo@mail.com" },
  { name: "Kirana Dewi", email: "kirana.dewi@mail.com" },
  { name: "Lukman Hakim", email: "lukman.hakim@mail.com" },
  { name: "Maya Anggraini", email: "maya.anggraini@mail.com" },
  { name: "Naufal Rizky", email: "naufal.rizky@mail.com" },
  { name: "Olivia Tan", email: "olivia.tan@mail.com" },
  { name: "Putra Aditya", email: "putra.aditya@mail.com" },
  { name: "Qory Amalia", email: "qory.amalia@mail.com" },
  { name: "Raka Pradana", email: "raka.pradana@mail.com" },
  { name: "Sinta Marlina", email: "sinta.marlina@mail.com" },
  { name: "Taufik Ramadhan", email: "taufik.ramadhan@mail.com" },
  { name: "Umi Kalsum", email: "umi.kalsum@mail.com" },
  { name: "Vino Alfarizi", email: "vino.alfarizi@mail.com" },
  { name: "Wulan Sari", email: "wulan.sari@mail.com" },
  { name: "Xander Lim", email: "xander.lim@mail.com" },
  { name: "Yuni Astuti", email: "yuni.astuti@mail.com" },
  { name: "Zaki Firmansyah", email: "zaki.firmansyah@mail.com" },
  { name: "Nadia Rahma", email: "nadia.rahma@mail.com" },
  { name: "Reza Maulana", email: "reza.maulana@mail.com" },
];

const HOME_OWNERSHIPS: HomeOwnership[] = ["RENT", "OWN", "MORTGAGE", "RENT", "MORTGAGE", "OWN"];
const INTENTS: LoanIntent[] = [
  "PERSONAL",
  "EDUCATION",
  "MEDICAL",
  "DEBTCONSOLIDATION",
  "HOMEIMPROVEMENT",
  "VENTURE",
];

function gradeFromRate(rate: number): LoanGrade {
  if (rate < 8) return "A";
  if (rate < 10) return "B";
  if (rate < 12.5) return "C";
  if (rate < 15) return "D";
  if (rate < 18) return "E";
  if (rate < 21) return "F";
  return "G";
}

const DECISION_REASONS = [
  "Income and repayment capacity are within the accepted threshold for this product.",
  "Loan-to-income ratio exceeds the tolerance for unsecured PayLater exposure.",
  "Manual review requested because the applicant is a first-time borrower.",
  "Stable employment history and low default probability support approval.",
  "High default probability combined with a large requested amount requires rejection.",
];

export function createSeedData(): CredoraData {
  const random = mulberry32(20261106);
  const applications: Application[] = [];
  const assessments: RiskAssessment[] = [];
  const reviews: UnderwritingReview[] = [];

  APPLICANTS.forEach((applicant, index) => {
    const ratio = 0.1 + random() * 0.4;
    const income =
      36_000_000 +
      Math.round((Math.pow(random(), 1.6) * 264_000_000) / 1_000_000) *
        1_000_000;
    const loanAmount = Math.max(
      1_000_000,
      Math.round((income * ratio) / 100_000) * 100_000,
    );
    const interestRate = Number((8 + random() * 18).toFixed(2));
    const employment = Number((random() * 12).toFixed(1));
    const age = 21 + Math.floor(random() * 35);
    const createdAt = new Date(
      BASE_DATE.getTime() - index * 5 * DAY - Math.floor(random() * 2) * DAY,
    ).toISOString();

    const application: Application = {
      id: makeUuid(random),
      organization_id: ORGANIZATION_ID,
      applicant_name: applicant.name,
      applicant_email: applicant.email,
      age,
      person_income: income,
      employment_length: employment,
      loan_amnt: loanAmount,
      loan_int_rate: interestRate,
      loan_percent_income: Number((loanAmount / income).toFixed(4)),
      home_ownership: HOME_OWNERSHIPS[index % HOME_OWNERSHIPS.length],
      loan_intent: INTENTS[index % INTENTS.length],
      loan_grade: gradeFromRate(interestRate),
      cb_person_cred_hist_length: Math.max(
        1,
        Math.min(age - 18, 1 + Math.floor(random() * 15)),
      ),
      cb_person_default_on_file: (random() < 0.15 ? "Y" : "N") as DefaultFlag,
      status: "Pending Review",
      created_by: ANALYST_ID,
      created_at: createdAt,
      updated_at: createdAt,
    };

    const hasAssessment = index % 4 !== 0;

    if (hasAssessment) {
      const result = assessApplication(application);
      const assessedAt = new Date(
        new Date(createdAt).getTime() + DAY,
      ).toISOString();

      const assessment: RiskAssessment = {
        id: makeUuid(random),
        application_id: application.id,
        model_name: result.model_name,
        model_version: result.model_version,
        default_probability: result.default_probability,
        risk_category: result.risk_category,
        contributing_factors: result.contributing_factors,
        assessed_by: ANALYST_ID,
        assessed_at: assessedAt,
      };
      assessments.push(assessment);
      application.status = "Assessed";

      if (index % 6 === 1) {
        const approved = index % 12 === 1;
        reviews.push({
          id: makeUuid(random),
          application_id: application.id,
          reviewer_id: OFFICER_ID,
          review_status: "Completed",
          final_decision: approved ? "Approved" : "Rejected",
          decision_reason: DECISION_REASONS[index % DECISION_REASONS.length],
          review_notes: approved
            ? "Applicant profile and supporting documents have been verified."
            : "Decline recommendation confirmed after manual checking.",
          reviewed_at: new Date(new Date(assessedAt).getTime() + DAY).toISOString(),
          created_at: assessedAt,
        });
        application.status = approved ? "Approved" : "Rejected";
      } else if (index % 9 === 2) {
        reviews.push({
          id: makeUuid(random),
          application_id: application.id,
          reviewer_id: OFFICER_ID,
          review_status: "In Review",
          final_decision: null,
          decision_reason: "",
          review_notes: "Waiting for the officer to confirm supporting documents.",
          reviewed_at: null,
          created_at: assessedAt,
        });
        application.status = "Under Review";
      }
    }

    applications.push(application);
  });

  return { applications, assessments, reviews };
}
