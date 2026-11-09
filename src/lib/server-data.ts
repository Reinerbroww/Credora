import bcrypt from "bcryptjs";
import { getSql } from "./db";
import { assessWithModel } from "./ml-client";
import {
  ANALYST_ID,
  DEMO_ACCOUNTS,
  DEMO_ORGANIZATION_NAME,
  DEMO_PASSWORD,
  ORGANIZATION_ID,
  createSeedData,
} from "./mock-data";
import type {
  Application,
  ApplicationInput,
  ContributingFactor,
  CredoraData,
  DefaultFlag,
  FinalDecision,
  HomeOwnership,
  LoanGrade,
  LoanIntent,
  ReviewStatus,
  RiskAssessment,
  RiskCategory,
  UnderwritingReview,
} from "./types";

interface ApplicationRow {
  id: string;
  organization_id: string;
  applicant_name: string;
  applicant_email: string;
  age: number | string;
  person_income: number | string;
  employment_length: number | string;
  loan_amnt: number | string;
  loan_int_rate: number | string;
  loan_percent_income: number | string;
  home_ownership: string;
  loan_intent: string;
  loan_grade: string;
  cb_person_cred_hist_length: number | string;
  cb_person_default_on_file: string;
  status: string;
  created_by: string | null;
  created_at: unknown;
  updated_at: unknown;
}

interface AssessmentRow {
  id: string;
  application_id: string;
  model_name: string;
  model_version: string;
  default_probability: number | string;
  risk_category: string;
  contributing_factors: unknown;
  assessed_by: string | null;
  assessed_at: unknown;
}

interface ReviewRow {
  id: string;
  application_id: string;
  reviewer_id: string | null;
  review_status: string;
  final_decision: string | null;
  decision_reason: string;
  review_notes: string;
  reviewed_at: unknown;
  created_at: unknown;
}

export interface ReviewPayload {
  review_status: ReviewStatus;
  final_decision: FinalDecision;
  decision_reason: string;
  review_notes: string;
}

const APPLICATION_COLUMNS = `id, organization_id, applicant_name, applicant_email, age,
  person_income, employment_length, loan_amnt, loan_int_rate, loan_percent_income,
  home_ownership, loan_intent, loan_grade, cb_person_cred_hist_length,
  cb_person_default_on_file, status, created_by, created_at, updated_at`;

const ASSESSMENT_COLUMNS = `id, application_id, model_name, model_version,
  default_probability, risk_category, contributing_factors, assessed_by, assessed_at`;

const REVIEW_COLUMNS = `id, application_id, reviewer_id, review_status, final_decision,
  decision_reason, review_notes, reviewed_at, created_at`;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

function toNullableIso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return toIso(value);
}

function toFactors(value: unknown): ContributingFactor[] {
  if (Array.isArray(value)) return value as ContributingFactor[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as ContributingFactor[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    organization_id: row.organization_id,
    applicant_name: row.applicant_name,
    applicant_email: row.applicant_email,
    age: toNumber(row.age),
    person_income: toNumber(row.person_income),
    employment_length: toNumber(row.employment_length),
    loan_amnt: toNumber(row.loan_amnt),
    loan_int_rate: toNumber(row.loan_int_rate),
    loan_percent_income: toNumber(row.loan_percent_income),
    home_ownership: row.home_ownership as HomeOwnership,
    loan_intent: row.loan_intent as LoanIntent,
    loan_grade: row.loan_grade as LoanGrade,
    cb_person_cred_hist_length: toNumber(row.cb_person_cred_hist_length),
    cb_person_default_on_file: row.cb_person_default_on_file as DefaultFlag,
    status: row.status as Application["status"],
    created_by: row.created_by ?? "",
    created_at: toIso(row.created_at),
    updated_at: toIso(row.updated_at),
  };
}

function mapAssessment(row: AssessmentRow): RiskAssessment {
  return {
    id: row.id,
    application_id: row.application_id,
    model_name: row.model_name,
    model_version: row.model_version,
    default_probability: toNumber(row.default_probability),
    risk_category: row.risk_category as RiskCategory,
    contributing_factors: toFactors(row.contributing_factors),
    assessed_by: row.assessed_by ?? "",
    assessed_at: toIso(row.assessed_at),
  };
}

function mapReview(row: ReviewRow): UnderwritingReview {
  return {
    id: row.id,
    application_id: row.application_id,
    reviewer_id: row.reviewer_id ?? "",
    review_status: row.review_status as ReviewStatus,
    final_decision: (row.final_decision as FinalDecision | null) ?? null,
    decision_reason: row.decision_reason,
    review_notes: row.review_notes,
    reviewed_at: toNullableIso(row.reviewed_at),
    created_at: toIso(row.created_at),
  };
}

export async function listData(organizationId: string): Promise<CredoraData> {
  const sql = getSql();
  const [applicationRows, assessmentRows, reviewRows] = await sql.transaction([
    sql`SELECT ${sql.unsafe(APPLICATION_COLUMNS)} FROM applications
        WHERE organization_id = ${organizationId}
        ORDER BY created_at DESC`,
    sql`SELECT ${sql.unsafe(ASSESSMENT_COLUMNS)} FROM risk_assessments
        WHERE application_id IN (
          SELECT id FROM applications WHERE organization_id = ${organizationId}
        )
        ORDER BY assessed_at DESC`,
    sql`SELECT ${sql.unsafe(REVIEW_COLUMNS)} FROM underwriting_reviews
        WHERE application_id IN (
          SELECT id FROM applications WHERE organization_id = ${organizationId}
        )
        ORDER BY created_at DESC`,
  ]);

  return {
    applications: (applicationRows as ApplicationRow[]).map(mapApplication),
    assessments: (assessmentRows as AssessmentRow[]).map(mapAssessment),
    reviews: (reviewRows as ReviewRow[]).map(mapReview),
  };
}

export async function createApplication(
  organizationId: string,
  userId: string,
  input: ApplicationInput,
): Promise<Application> {
  const sql = getSql();
  const loanPercentIncome = Number(
    (input.loan_amnt / input.person_income).toFixed(4),
  );

  const rows = await sql`
    INSERT INTO applications (
      organization_id, applicant_name, applicant_email, age, person_income,
      employment_length, loan_amnt, loan_int_rate, loan_percent_income,
      home_ownership, loan_intent, loan_grade, cb_person_cred_hist_length,
      cb_person_default_on_file, status, created_by
    ) VALUES (
      ${organizationId}, ${input.applicant_name}, ${input.applicant_email},
      ${input.age}, ${input.person_income}, ${input.employment_length},
      ${input.loan_amnt}, ${input.loan_int_rate}, ${loanPercentIncome},
      ${input.home_ownership}, ${input.loan_intent}, ${input.loan_grade},
      ${input.cb_person_cred_hist_length}, ${input.cb_person_default_on_file},
      'Pending Review', ${userId}
    )
    RETURNING ${sql.unsafe(APPLICATION_COLUMNS)}
  `;

  return mapApplication((rows as ApplicationRow[])[0]);
}

export async function createAssessment(
  organizationId: string,
  userId: string,
  applicationId: string,
): Promise<RiskAssessment | null> {
  if (!isUuid(applicationId)) return null;

  const sql = getSql();
  const applicationRows = await sql`
    SELECT ${sql.unsafe(APPLICATION_COLUMNS)} FROM applications
    WHERE id = ${applicationId} AND organization_id = ${organizationId}
    LIMIT 1
  `;
  const applicationRow = (applicationRows as ApplicationRow[])[0];
  if (!applicationRow) return null;

  const application = mapApplication(applicationRow);
  const result = await assessWithModel(application);

  const assessmentRows = await sql`
    INSERT INTO risk_assessments (
      application_id, model_name, model_version, default_probability,
      risk_category, contributing_factors, assessed_by
    ) VALUES (
      ${applicationId}, ${result.model_name}, ${result.model_version},
      ${result.default_probability}, ${result.risk_category},
      ${JSON.stringify(result.contributing_factors)}::jsonb, ${userId}
    )
    RETURNING ${sql.unsafe(ASSESSMENT_COLUMNS)}
  `;

  await sql`
    UPDATE applications
    SET status = CASE WHEN status = 'Pending Review' THEN 'Assessed' ELSE status END,
        updated_at = now()
    WHERE id = ${applicationId} AND organization_id = ${organizationId}
  `;

  return mapAssessment((assessmentRows as AssessmentRow[])[0]);
}

export async function saveReview(
  organizationId: string,
  userId: string,
  applicationId: string,
  payload: ReviewPayload,
): Promise<{ review: UnderwritingReview; application: Application } | null> {
  if (!isUuid(applicationId)) return null;

  const sql = getSql();
  const applicationRows = await sql`
    SELECT id FROM applications
    WHERE id = ${applicationId} AND organization_id = ${organizationId}
    LIMIT 1
  `;
  if (!applicationRows[0]) return null;

  const nextStatus: Application["status"] =
    payload.final_decision === "Manual Review"
      ? "Under Review"
      : payload.final_decision === "Approved"
        ? "Approved"
        : payload.final_decision === "Rejected"
          ? "Rejected"
          : "Assessed";

  const reviewStatus: ReviewStatus =
    payload.review_status === "Pending" ? "In Review" : payload.review_status;

  const existingRows = await sql`
    SELECT id FROM underwriting_reviews
    WHERE application_id = ${applicationId}
    ORDER BY created_at DESC
    LIMIT 1
  `;

  const existing = existingRows[0];
  let reviewRows;

  if (existing) {
    reviewRows = await sql`
      UPDATE underwriting_reviews
      SET review_status = ${reviewStatus},
          final_decision = ${payload.final_decision},
          decision_reason = ${payload.decision_reason},
          review_notes = ${payload.review_notes},
          reviewed_at = now()
      WHERE id = ${existing.id}
      RETURNING ${sql.unsafe(REVIEW_COLUMNS)}
    `;
  } else {
    reviewRows = await sql`
      INSERT INTO underwriting_reviews (
        application_id, reviewer_id, review_status, final_decision,
        decision_reason, review_notes, reviewed_at
      ) VALUES (
        ${applicationId}, ${userId}, ${reviewStatus}, ${payload.final_decision},
        ${payload.decision_reason}, ${payload.review_notes}, now()
      )
      RETURNING ${sql.unsafe(REVIEW_COLUMNS)}
    `;
  }

  const updatedApplicationRows = await sql`
    UPDATE applications
    SET status = ${nextStatus}, updated_at = now()
    WHERE id = ${applicationId} AND organization_id = ${organizationId}
    RETURNING ${sql.unsafe(APPLICATION_COLUMNS)}
  `;

  return {
    review: mapReview((reviewRows as ReviewRow[])[0]),
    application: mapApplication((updatedApplicationRows as ApplicationRow[])[0]),
  };
}

export interface ProfileInfo {
  full_name: string;
  email: string;
  role: string;
  organization_id: string;
  organization_name: string;
}

export async function getProfile(userId: string): Promise<ProfileInfo | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT p.full_name, u.email, p.role, p.organization_id,
           o.name AS organization_name
    FROM profiles p
    JOIN users u ON u.id = p.id
    JOIN organizations o ON o.id = p.organization_id
    WHERE p.id = ${userId}
    LIMIT 1
  `;

  return (rows[0] as ProfileInfo | undefined) ?? null;
}

export async function updateProfile(
  userId: string,
  patch: { full_name?: string; email?: string },
): Promise<ProfileInfo | null> {
  const sql = getSql();
  const fullName = patch.full_name?.trim();
  const email = patch.email?.trim().toLowerCase();

  if (fullName) {
    await sql`UPDATE profiles SET full_name = ${fullName} WHERE id = ${userId}`;
    await sql`UPDATE users SET name = ${fullName} WHERE id = ${userId}`;
  }
  if (email) {
    await sql`UPDATE users SET email = ${email} WHERE id = ${userId}`;
  }

  return getProfile(userId);
}

export async function resetOrganizationData(
  organizationId: string,
  fallbackUserId: string,
): Promise<CredoraData> {
  const sql = getSql();

  const profileRows = await sql`
    SELECT id, role FROM profiles WHERE organization_id = ${organizationId}
  `;
  const analystId =
    (profileRows.find((row) => row.role === "Risk Analyst")?.id as
      | string
      | undefined) ?? fallbackUserId;
  const officerId =
    (profileRows.find((row) => row.role === "Credit Officer")?.id as
      | string
      | undefined) ?? fallbackUserId;

  await sql`DELETE FROM applications WHERE organization_id = ${organizationId}`;

  const seed = createSeedData();

  for (const application of seed.applications) {
    await sql`
      INSERT INTO applications (
        id, organization_id, applicant_name, applicant_email, age,
        person_income, employment_length, loan_amnt, loan_int_rate,
        loan_percent_income, home_ownership, loan_intent, loan_grade,
        cb_person_cred_hist_length, cb_person_default_on_file, status,
        created_by, created_at, updated_at
      ) VALUES (
        ${application.id}, ${organizationId}, ${application.applicant_name},
        ${application.applicant_email}, ${application.age},
        ${application.person_income}, ${application.employment_length},
        ${application.loan_amnt}, ${application.loan_int_rate},
        ${application.loan_percent_income}, ${application.home_ownership},
        ${application.loan_intent}, ${application.loan_grade},
        ${application.cb_person_cred_hist_length},
        ${application.cb_person_default_on_file}, ${application.status},
        ${analystId}, ${application.created_at}, ${application.updated_at}
      )
    `;
  }

  const rescoreWithMl = process.env.SEED_RESCORE_ML === "1";
  const applicationsById = new Map(
    seed.applications.map((application) => [application.id, application]),
  );

  for (const assessment of seed.assessments) {
    let record = assessment;
    if (rescoreWithMl) {
      const application = applicationsById.get(assessment.application_id);
      if (application) {
        const result = await assessWithModel(application);
        record = {
          ...assessment,
          model_name: result.model_name,
          model_version: result.model_version,
          default_probability: result.default_probability,
          risk_category: result.risk_category,
          contributing_factors: result.contributing_factors,
        };
      }
    }

    await sql`
      INSERT INTO risk_assessments (
        id, application_id, model_name, model_version, default_probability,
        risk_category, contributing_factors, assessed_by, assessed_at
      ) VALUES (
        ${record.id}, ${record.application_id}, ${record.model_name},
        ${record.model_version}, ${record.default_probability},
        ${record.risk_category},
        ${JSON.stringify(record.contributing_factors)}::jsonb,
        ${analystId}, ${record.assessed_at}
      )
    `;
  }

  for (const review of seed.reviews) {
    await sql`
      INSERT INTO underwriting_reviews (
        id, application_id, reviewer_id, review_status, final_decision,
        decision_reason, review_notes, reviewed_at, created_at
      ) VALUES (
        ${review.id}, ${review.application_id}, ${officerId},
        ${review.review_status}, ${review.final_decision},
        ${review.decision_reason}, ${review.review_notes},
        ${review.reviewed_at}, ${review.created_at}
      )
    `;
  }

  return listData(organizationId);
}

export async function seedDemoOrganization(): Promise<void> {
  const sql = getSql();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await sql`
    INSERT INTO organizations (id, name)
    VALUES (${ORGANIZATION_ID}, ${DEMO_ORGANIZATION_NAME})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
  `;

  for (const account of DEMO_ACCOUNTS) {
    await sql`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (${account.id}, ${account.full_name}, ${account.email}, ${passwordHash})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash
    `;
    await sql`
      INSERT INTO profiles (id, organization_id, full_name, role)
      VALUES (${account.id}, ${ORGANIZATION_ID}, ${account.full_name}, ${account.role})
      ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role
    `;
  }

  await resetOrganizationData(ORGANIZATION_ID, ANALYST_ID);
}
