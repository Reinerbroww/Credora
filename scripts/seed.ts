import { seedDemoOrganization } from "../src/lib/server-data";

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
  await seedDemoOrganization();
  console.log("Seeded demo organization, users, and sample applications.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
