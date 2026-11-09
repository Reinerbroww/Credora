import { describe, expect, it } from "vitest";
import {
  ANALYST_ID,
  DEMO_ACCOUNTS,
  OFFICER_ID,
  ORGANIZATION_ID,
  createSeedData,
} from "./mock-data";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

describe("seed identifiers", () => {
  it("uses UUIDs accepted by PostgreSQL", () => {
    expect(ORGANIZATION_ID).toMatch(UUID_PATTERN);
    expect(ANALYST_ID).toMatch(UUID_PATTERN);
    expect(OFFICER_ID).toMatch(UUID_PATTERN);
    for (const account of DEMO_ACCOUNTS) {
      expect(account.id).toMatch(UUID_PATTERN);
    }
  });

  it("generates UUIDs for every seeded record", () => {
    const seed = createSeedData();

    for (const application of seed.applications) {
      expect(application.id).toMatch(UUID_PATTERN);
    }
    for (const assessment of seed.assessments) {
      expect(assessment.id).toMatch(UUID_PATTERN);
      expect(assessment.application_id).toMatch(UUID_PATTERN);
    }
    for (const review of seed.reviews) {
      expect(review.id).toMatch(UUID_PATTERN);
      expect(review.application_id).toMatch(UUID_PATTERN);
    }
  });

  it("keeps assessments and reviews tied to seeded applications", () => {
    const seed = createSeedData();
    const applicationIds = new Set(seed.applications.map((item) => item.id));

    for (const assessment of seed.assessments) {
      expect(applicationIds.has(assessment.application_id)).toBe(true);
    }
    for (const review of seed.reviews) {
      expect(applicationIds.has(review.application_id)).toBe(true);
    }
  });
});
