-- Credora database schema (Neon PostgreSQL)
-- Run with: npm run db:migrate

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150),
  email VARCHAR(255) NOT NULL UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  token_type VARCHAR(255),
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  CONSTRAINT accounts_provider_account_unique UNIQUE (provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  CONSTRAINT verification_tokens_pk PRIMARY KEY (identifier, token)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('Risk Analyst', 'Credit Officer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  applicant_name VARCHAR(150) NOT NULL,
  applicant_email VARCHAR(150) NOT NULL,
  age INTEGER NOT NULL,
  person_income NUMERIC(15,2) NOT NULL,
  employment_length NUMERIC(5,2) NOT NULL,
  loan_amnt NUMERIC(15,2) NOT NULL,
  loan_int_rate NUMERIC(7,4) NOT NULL,
  loan_percent_income NUMERIC(8,4) NOT NULL,
  home_ownership VARCHAR(30) NOT NULL,
  loan_intent VARCHAR(50) NOT NULL,
  loan_grade VARCHAR(2) NOT NULL DEFAULT 'A',
  cb_person_cred_hist_length INTEGER NOT NULL DEFAULT 0,
  cb_person_default_on_file VARCHAR(1) NOT NULL DEFAULT 'N',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending Review',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS applications_org_created_idx
  ON applications (organization_id, created_at DESC);

-- Columns added for the LightGBM feature contract (idempotent for existing databases).
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS loan_grade VARCHAR(2) NOT NULL DEFAULT 'A';
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cb_person_cred_hist_length INTEGER NOT NULL DEFAULT 0;
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cb_person_default_on_file VARCHAR(1) NOT NULL DEFAULT 'N';

CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  model_name VARCHAR(100) NOT NULL,
  model_version VARCHAR(50) NOT NULL,
  default_probability NUMERIC(8,6) NOT NULL,
  risk_category VARCHAR(30) NOT NULL,
  contributing_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  assessed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS risk_assessments_application_idx
  ON risk_assessments (application_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS underwriting_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_status VARCHAR(30) NOT NULL,
  final_decision VARCHAR(30),
  decision_reason TEXT NOT NULL DEFAULT '',
  review_notes TEXT NOT NULL DEFAULT '',
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS underwriting_reviews_application_idx
  ON underwriting_reviews (application_id, created_at DESC);
