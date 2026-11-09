import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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

async function main() {
  const sql = getSql();
  const schemaPath = resolve(process.cwd(), "db", "schema.sql");
  const raw = readFileSync(schemaPath, "utf8");
  const withoutComments = raw.replace(/^\s*--.*$/gm, "");
  const statements = withoutComments
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log(`Applied ${statements.length} schema statements.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
