import { describe, expect, it } from "vitest";
import { assessApplication, categoryFromProbability } from "./risk";
import type { Application } from "./types";

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: "application-1",
    organization_id: "organization-1",
    applicant_name: "Test Applicant",
    applicant_email: "test@example.com",
    age: 32,
    person_income: 12_000_000,
    employment_length: 5,
    loan_amnt: 3_000_000,
    loan_int_rate: 10,
    loan_percent_income: 0.25,
    home_ownership: "RENT",
    loan_intent: "PERSONAL",
    loan_grade: "B",
    cb_person_cred_hist_length: 6,
    cb_person_default_on_file: "N",
    status: "Pending Review",
    created_by: "profile-1",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const LOW_RISK: Partial<Application> = {
  age: 50,
  person_income: 30_000_000,
  employment_length: 10,
  loan_amnt: 3_000_000,
  loan_int_rate: 5,
  loan_percent_income: 0.1,
  home_ownership: "OWN",
  loan_intent: "EDUCATION",
};

const HIGH_RISK: Partial<Application> = {
  age: 20,
  person_income: 3_000_000,
  employment_length: 0,
  loan_amnt: 15_000_000,
  loan_int_rate: 30,
  loan_percent_income: 1.5,
  home_ownership: "RENT",
  loan_intent: "DEBTCONSOLIDATION",
};

describe("categoryFromProbability", () => {
  it("uses the documented risk thresholds", () => {
    expect(categoryFromProbability(0)).toBe("Low Risk");
    expect(categoryFromProbability(0.1799)).toBe("Low Risk");
    expect(categoryFromProbability(0.18)).toBe("Medium Risk");
    expect(categoryFromProbability(0.4199)).toBe("Medium Risk");
    expect(categoryFromProbability(0.42)).toBe("High Risk");
    expect(categoryFromProbability(1)).toBe("High Risk");
  });
});

describe("assessApplication", () => {
  it("produces a valid probability and matching category", () => {
    const result = assessApplication(makeApplication());

    expect(result.default_probability).toBeGreaterThanOrEqual(0);
    expect(result.default_probability).toBeLessThanOrEqual(1);
    expect(result.risk_category).toBe(
      categoryFromProbability(result.default_probability),
    );
    expect(result.model_name).toBe("Credora Heuristic");
    expect(result.model_version).toBe("fallback-v1.0");
  });

  it("is deterministic for the same application", () => {
    const application = makeApplication();

    expect(assessApplication(application)).toEqual(
      assessApplication(application),
    );
  });

  it("scores a high-risk profile above a low-risk profile", () => {
    const low = assessApplication(makeApplication(LOW_RISK));
    const high = assessApplication(makeApplication(HIGH_RISK));

    expect(low.default_probability).toBeLessThan(high.default_probability);
    expect(low.risk_category).toBe("Low Risk");
    expect(high.risk_category).toBe("High Risk");
  });

  it("returns at most five ranked contributing factors", () => {
    const result = assessApplication(makeApplication(HIGH_RISK));

    expect(result.contributing_factors.length).toBeGreaterThan(0);
    expect(result.contributing_factors.length).toBeLessThanOrEqual(5);

    const weights = result.contributing_factors.reduce(
      (total, factor) => total + factor.weight,
      0,
    );
    expect(weights).toBeGreaterThanOrEqual(99);
    expect(weights).toBeLessThanOrEqual(100);

    for (const factor of result.contributing_factors) {
      expect(factor.direction).toBe(
        factor.impact >= 0 ? "increases" : "decreases",
      );
      expect(Math.abs(factor.impact)).toBeGreaterThan(0);
    }
  });
});
