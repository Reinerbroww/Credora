import { getSql } from "../src/lib/db";
import {
  DEMO_ACCOUNTS,
  ORGANIZATION_ID,
} from "../src/lib/mock-data";

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

async function main() {
  const sql = getSql();

  const [orgRows, countRows, accountRows] = await sql.transaction([
    sql`SELECT id, name FROM organizations WHERE id = ${ORGANIZATION_ID} LIMIT 1`,
    sql`SELECT
      (SELECT count(*) FROM applications WHERE organization_id = ${ORGANIZATION_ID}) AS applications,
      (SELECT count(*) FROM risk_assessments WHERE application_id IN (
        SELECT id FROM applications WHERE organization_id = ${ORGANIZATION_ID}
      )) AS assessments,
      (SELECT count(*) FROM underwriting_reviews WHERE application_id IN (
        SELECT id FROM applications WHERE organization_id = ${ORGANIZATION_ID}
      )) AS reviews`,
    sql`SELECT u.email, p.role, p.full_name
        FROM users u
        JOIN profiles p ON p.id = u.id
        WHERE p.organization_id = ${ORGANIZATION_ID}
        ORDER BY p.role`,
  ]);

  const organization = orgRows[0] as
    | { id: string; name: string }
    | undefined;
  const counts = countRows[0] as
    | { applications: string; assessments: string; reviews: string }
    | undefined;
  const accounts = accountRows as Array<{
    email: string;
    role: string;
    full_name: string;
  }>;

  if (!organization) {
    throw new Error(
      "Demo organization not found. Run `npm run db:setup` first.",
    );
  }

  console.log(`Organization: ${organization.name} (${organization.id})`);
  console.log(
    `Records: ${Number(counts?.applications ?? 0)} applications, ` +
      `${Number(counts?.assessments ?? 0)} assessments, ` +
      `${Number(counts?.reviews ?? 0)} reviews`,
  );

  for (const account of DEMO_ACCOUNTS) {
    const found = accounts.find(
      (row) => row.email.toLowerCase() === account.email.toLowerCase(),
    );
    if (!found) {
      throw new Error(
        `Missing demo account ${account.email}. Run \`npm run db:seed\`.`,
      );
    }
    console.log(
      `Account: ${found.email} — ${found.full_name} (${found.role})`,
    );
  }

  console.log("Database looks ready.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
