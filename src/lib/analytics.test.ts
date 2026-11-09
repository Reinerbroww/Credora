import { describe, expect, it } from "vitest";
import {
  applicationTrend,
  awaitingReviewCount,
  averageDefaultProbability,
  filterByPeriod,
  latestAssessments,
  latestReviews,
  riskCounts,
  statusCounts,
} from "./analytics";
import type {
  Application,
  ApplicationStatus,
  RiskAssessment,
  RiskCategory,
  UnderwritingReview,
} from "./types";

let sequence = 0;

function makeApplication(
  overrides: Partial<Application> = {},
): Application {
  sequence += 1;
  return {
    id: `application-${sequence}`,
    organization_id: "organization-1",
    applicant_name: `Applicant ${sequence}`,
    applicant_email: `applicant${sequence}@example.com`,
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

function makeAssessment(
  applicationId: string,
  assessedAt: string,
  category: RiskCategory = "Low Risk",
  probability = 0.1,
): RiskAssessment {
  sequence += 1;
  return {
    id: `assessment-${sequence}`,
    application_id: applicationId,
    model_name: "LightGBM",
    model_version: "v1.0-demo",
    default_probability: probability,
    risk_category: category,
    contributing_factors: [],
    assessed_by: "profile-1",
    assessed_at: assessedAt,
  };
}

function makeReview(
  applicationId: string,
  createdAt: string,
  status: UnderwritingReview["review_status"] = "Completed",
): UnderwritingReview {
  sequence += 1;
  return {
    id: `review-${sequence}`,
    application_id: applicationId,
    reviewer_id: "profile-1",
    review_status: status,
    final_decision: status === "Completed" ? "Approved" : null,
    decision_reason: "Test decision",
    review_notes: "Test notes",
    reviewed_at: createdAt,
    created_at: createdAt,
  };
}

describe("latestAssessments", () => {
  it("keeps the most recent assessment per application", () => {
    const older = makeAssessment(
      "application-a",
      "2026-01-01T00:00:00.000Z",
      "High Risk",
      0.8,
    );
    const newer = makeAssessment(
      "application-a",
      "2026-02-01T00:00:00.000Z",
      "Low Risk",
      0.1,
    );
    const other = makeAssessment(
      "application-b",
      "2026-01-15T00:00:00.000Z",
      "Medium Risk",
      0.3,
    );

    const map = latestAssessments([older, other, newer]);

    expect(map.get("application-a")).toBe(newer);
    expect(map.get("application-b")).toBe(other);
    expect(map.size).toBe(2);
  });
});

describe("latestReviews", () => {
  it("keeps the most recent review per application", () => {
    const older = makeReview("application-a", "2026-01-01T00:00:00.000Z");
    const newer = makeReview(
      "application-a",
      "2026-02-01T00:00:00.000Z",
      "In Review",
    );

    const map = latestReviews([older, newer]);

    expect(map.get("application-a")).toBe(newer);
    expect(map.size).toBe(1);
  });
});

describe("riskCounts", () => {
  it("counts the latest risk category and unassessed applications", () => {
    const low = makeApplication();
    const medium = makeApplication();
    const high = makeApplication();
    const unassessed = makeApplication();
    const reassessed = makeApplication();

    const assessments = [
      makeAssessment(low.id, "2026-01-01T00:00:00.000Z", "Low Risk"),
      makeAssessment(medium.id, "2026-01-01T00:00:00.000Z", "Medium Risk"),
      makeAssessment(high.id, "2026-01-01T00:00:00.000Z", "High Risk"),
      makeAssessment(
        reassessed.id,
        "2026-01-01T00:00:00.000Z",
        "High Risk",
        0.9,
      ),
      makeAssessment(
        reassessed.id,
        "2026-02-01T00:00:00.000Z",
        "Low Risk",
        0.1,
      ),
    ];

    expect(
      riskCounts([low, medium, high, unassessed, reassessed], assessments),
    ).toEqual({
      low: 2,
      medium: 1,
      high: 1,
      assessed: 4,
      unassessed: 1,
    });
  });
});

describe("awaitingReviewCount", () => {
  it("counts assessed applications without a completed review", () => {
    const pending = makeApplication({ status: "Assessed" });
    const underReview = makeApplication({ status: "Under Review" });
    const completed = makeApplication({ status: "Approved" });
    const unassessed = makeApplication({ status: "Pending Review" });

    expect(
      awaitingReviewCount(
        [pending, underReview, completed, unassessed],
        [makeReview(completed.id, "2026-01-01T00:00:00.000Z")],
      ),
    ).toBe(2);
  });
});

describe("averageDefaultProbability", () => {
  it("averages only the latest probabilities for matching applications", () => {
    const application = makeApplication();
    const second = makeApplication();
    const assessments = [
      makeAssessment(
        application.id,
        "2026-01-01T00:00:00.000Z",
        "High Risk",
        0.9,
      ),
      makeAssessment(
        application.id,
        "2026-02-01T00:00:00.000Z",
        "Low Risk",
        0.2,
      ),
      makeAssessment(
        second.id,
        "2026-01-01T00:00:00.000Z",
        "Medium Risk",
        0.4,
      ),
    ];

    expect(
      averageDefaultProbability([application, second], assessments),
    ).toBeCloseTo(0.3);
    expect(averageDefaultProbability([], assessments)).toBe(0);
  });
});

describe("filterByPeriod", () => {
  it("filters applications by the selected window", () => {
    const recent = makeApplication({
      created_at: new Date(Date.now() - 5 * 86_400_000).toISOString(),
    });
    const middle = makeApplication({
      created_at: new Date(Date.now() - 60 * 86_400_000).toISOString(),
    });
    const old = makeApplication({
      created_at: new Date(Date.now() - 400 * 86_400_000).toISOString(),
    });
    const applications = [recent, middle, old];

    expect(filterByPeriod(applications, "30d")).toEqual([recent]);
    expect(filterByPeriod(applications, "90d")).toEqual([recent, middle]);
    expect(filterByPeriod(applications, "all")).toEqual(applications);
  });
});

describe("applicationTrend", () => {
  it("returns the requested number of monthly buckets, including now", () => {
    const points = applicationTrend([], 6);
    const now = new Date();

    expect(points).toHaveLength(6);
    expect(points.at(-1)?.key).toBe(
      `${now.getFullYear()}-${now.getMonth()}`,
    );
    expect(points.every((point) => point.value === 0)).toBe(true);
  });
});

describe("statusCounts", () => {
  it("returns a count for every application status", () => {
    const statuses: ApplicationStatus[] = [
      "Pending Review",
      "Assessed",
      "Under Review",
      "Approved",
      "Rejected",
    ];
    const applications = statuses.map((status) =>
      makeApplication({ status }),
    );

    const counts = statusCounts(applications);

    expect(counts).toHaveLength(statuses.length);
    expect(counts.map((entry) => entry.label)).toEqual(statuses);
    expect(counts.every((entry) => entry.value === 1)).toBe(true);
  });
});
