import { describe, expect, it } from "vitest";
import {
  displayId,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
} from "./format";

describe("formatCurrency", () => {
  it("formats IDR amounts without decimals", () => {
    const formatted = formatCurrency(12_000_000);

    expect(formatted).toContain("Rp");
    expect(formatted).toContain("12");
    expect(formatted).not.toContain(",00");
  });
});

describe("formatNumber", () => {
  it("uses Indonesian thousands separators", () => {
    expect(formatNumber(1_234_567)).toBe("1.234.567");
    expect(formatNumber(0)).toBe("0");
  });
});

describe("formatPercent", () => {
  it("converts a probability into a percentage", () => {
    expect(formatPercent(0.1234)).toBe("12.3%");
    expect(formatPercent(0.1234, 2)).toBe("12.34%");
    expect(formatPercent(0)).toBe("0.0%");
  });
});

describe("formatDate", () => {
  it("formats ISO dates and handles empty values", () => {
    expect(formatDate("2026-11-06T12:00:00.000Z")).toBe("06 Nov 2026");
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("formatDateTime", () => {
  it("includes the time of day", () => {
    const formatted = formatDateTime("2026-11-06T12:34:00.000Z");

    expect(formatted).toContain("06 Nov 2026");
    expect(formatted).toMatch(/\d{2}[:.]\d{2}/);
  });
});

describe("displayId", () => {
  it("builds a short, readable application reference", () => {
    expect(displayId("4d9fefed-5cd9-e16d-f8cb-0bcc282ea708")).toBe(
      "CRD-282EA708",
    );
    expect(displayId("abc-12345678")).toBe("CRD-12345678");
  });
});
