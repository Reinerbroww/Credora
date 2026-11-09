import { afterEach, describe, expect, it, vi } from "vitest";
import { assessWithModel, predictRisk } from "./ml-client";
import type { Application } from "./types";

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: "application-1",
    organization_id: "organization-1",
    applicant_name: "Test Applicant",
    applicant_email: "test@example.com",
    age: 30,
    person_income: 120_000_000,
    employment_length: 5,
    loan_amnt: 30_000_000,
    loan_int_rate: 11.5,
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

const ML_RESPONSE = {
  probability: 0.42,
  decision: "review" as const,
  loan_percent_income: 0.25,
  contributions: [
    { feature: "person_income", value: 1.2 },
    { feature: "loan_grade_B", value: 0.5 },
    { feature: "person_home_ownership_RENT", value: 0.3 },
    { feature: "loan_intent_VENTURE", value: -0.2 },
    { feature: "cb_person_default_on_file_Y", value: 0 },
  ],
  model: "LightGBM PayLater",
  model_version: "v1.0",
  threshold_low: 0.35,
  threshold_high: 0.7,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("predictRisk", () => {
  it("returns null when ML_SERVICE_URL is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(predictRisk(makeApplication())).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("converts IDR money fields to the calibrated USD scale", async () => {
    vi.stubEnv("ML_SERVICE_URL", "http://ml.local:8000/");
    vi.stubEnv("ML_IDR_PER_USD", "4000");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(ML_RESPONSE));
    vi.stubGlobal("fetch", fetchMock);

    const result = await predictRisk(makeApplication());

    expect(result).toEqual(ML_RESPONSE);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://ml.local:8000/predict");
    const payload = JSON.parse(init.body as string);
    expect(payload.person_income).toBe(30_000);
    expect(payload.loan_amnt).toBe(7_500);
    expect(payload.loan_grade).toBe("B");
    expect(payload.cb_person_cred_hist_length).toBe(6);
    expect(payload.cb_person_default_on_file).toBe("N");
    expect(init.headers.Authorization).toBeUndefined();
  });

  it("sends the API key when configured", async () => {
    vi.stubEnv("ML_SERVICE_URL", "http://ml.local:8000");
    vi.stubEnv("ML_SERVICE_API_KEY", "secret-key");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(ML_RESPONSE));
    vi.stubGlobal("fetch", fetchMock);

    await predictRisk(makeApplication());

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer secret-key");
  });

  it("returns null when the service responds with an error", async () => {
    vi.stubEnv("ML_SERVICE_URL", "http://ml.local:8000");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({}, 503)));

    await expect(predictRisk(makeApplication())).resolves.toBeNull();
  });
});

describe("assessWithModel", () => {
  it("maps a prediction into a risk result with grouped factors", async () => {
    vi.stubEnv("ML_SERVICE_URL", "http://ml.local:8000");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(ML_RESPONSE)));

    const result = await assessWithModel(makeApplication());

    expect(result.model_name).toBe("LightGBM PayLater");
    expect(result.model_version).toBe("v1.0");
    expect(result.default_probability).toBe(0.42);
    expect(result.risk_category).toBe("Medium Risk");
    expect(result.contributing_factors).toHaveLength(4);
    expect(result.contributing_factors[0]).toMatchObject({
      label: "Annual income",
      direction: "increases",
      weight: 55,
    });
    expect(
      result.contributing_factors.find((factor) => factor.label === "Loan purpose"),
    ).toMatchObject({ direction: "decreases" });
    expect(
      result.contributing_factors.some(
        (factor) => factor.key === "cb_person_default_on_file",
      ),
    ).toBe(false);
  });

  it("uses the heuristic fallback when the service is unreachable", async () => {
    vi.stubEnv("ML_SERVICE_URL", "http://ml.local:8000");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const result = await assessWithModel(makeApplication());

    expect(result.model_name).toBe("Credora Heuristic");
    expect(result.model_version).toBe("fallback-v1.0");
  });

  it("maps probabilities onto the service thresholds", async () => {
    vi.stubEnv("ML_SERVICE_URL", "http://ml.local:8000");
    const cases = [
      { probability: 0.1, expected: "Low Risk" },
      { probability: 0.5, expected: "Medium Risk" },
      { probability: 0.9, expected: "High Risk" },
    ];

    for (const testCase of cases) {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            jsonResponse({ ...ML_RESPONSE, probability: testCase.probability }),
          ),
      );
      const result = await assessWithModel(makeApplication());
      expect(result.risk_category).toBe(testCase.expected);
    }
  });
});
