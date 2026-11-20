import { getSql } from "../src/lib/db";

for (const file of [".env.local", ".env"]) {
  try {
    process.loadEnvFile(file);
  } catch {
    // Ignore missing env files; DATABASE_URL may come from the environment.
  }
}

if (process.env.DATABASE_URL_UNPOOLED) {
  process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
}

const REQUIRED_TABLES = [
  "organizations",
  "users",
  "profiles",
  "applications",
  "risk_assessments",
  "underwriting_reviews",
];

async function main() {
  const sql = getSql();

  const tableRows = (await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN (
        'organizations', 'users', 'profiles', 'applications',
        'risk_assessments', 'underwriting_reviews'
      )
  `) as Array<{ table_name: string }>;

  const found = new Set(tableRows.map((row) => row.table_name));
  const missing = REQUIRED_TABLES.filter((table) => !found.has(table));
  if (missing.length > 0) {
    throw new Error(
      `Missing required tables: ${missing.join(", ")}. Run \`npm run db:migrate\` first.`,
    );
  }

  const countRows = (await sql`
    SELECT
      (SELECT count(*) FROM organizations) AS organizations,
      (SELECT count(*) FROM users) AS users,
      (SELECT count(*) FROM applications) AS applications,
      (SELECT count(*) FROM risk_assessments) AS assessments,
      (SELECT count(*) FROM underwriting_reviews) AS reviews
  `) as Array<{
    organizations: string;
    users: string;
    applications: string;
    assessments: string;
    reviews: string;
  }>;

  const counts = countRows[0];
  console.log(
    `Records: ${Number(counts?.organizations ?? 0)} organizations, ` +
      `${Number(counts?.users ?? 0)} users, ` +
      `${Number(counts?.applications ?? 0)} applications, ` +
      `${Number(counts?.assessments ?? 0)} assessments, ` +
      `${Number(counts?.reviews ?? 0)} reviews`,
  );
  console.log("Database schema is ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
