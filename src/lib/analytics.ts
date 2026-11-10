import type {
  Application,
  ApplicationStatus,
  RiskAssessment,
  RiskCategory,
  UnderwritingReview,
} from "./types";

export function latestAssessments(
  assessments: RiskAssessment[],
): Map<string, RiskAssessment> {
  const map = new Map<string, RiskAssessment>();
  const sorted = [...assessments].sort(
    (a, b) =>
      new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime(),
  );
  for (const assessment of sorted) {
    if (!map.has(assessment.application_id)) {
      map.set(assessment.application_id, assessment);
    }
  }
  return map;
}

export function latestReviews(
  reviews: UnderwritingReview[],
): Map<string, UnderwritingReview> {
  const map = new Map<string, UnderwritingReview>();
  const sorted = [...reviews].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  for (const review of sorted) {
    if (!map.has(review.application_id)) {
      map.set(review.application_id, review);
    }
  }
  return map;
}

export interface RiskCounts {
  low: number;
  medium: number;
  high: number;
  assessed: number;
  unassessed: number;
}

export function riskCounts(
  applications: Application[],
  assessments: RiskAssessment[],
): RiskCounts {
  const latest = latestAssessments(assessments);
  const counts: RiskCounts = {
    low: 0,
    medium: 0,
    high: 0,
    assessed: 0,
    unassessed: 0,
  };

  for (const application of applications) {
    const assessment = latest.get(application.id);
    if (!assessment) {
      counts.unassessed += 1;
      continue;
    }
    counts.assessed += 1;
    if (assessment.risk_category === "Low Risk") counts.low += 1;
    else if (assessment.risk_category === "Medium Risk") counts.medium += 1;
    else counts.high += 1;
  }

  return counts;
}

export function awaitingReviewCount(
  applications: Application[],
  reviews: UnderwritingReview[],
): number {
  const completed = new Set(
    reviews
      .filter((review) => review.review_status === "Completed")
      .map((review) => review.application_id),
  );

  return applications.filter(
    (application) =>
      (application.status === "Assessed" || application.status === "Under Review") &&
      !completed.has(application.id),
  ).length;
}

export interface TrendPoint {
  label: string;
  value: number;
  key: string;
}

export function applicationTrend(
  applications: Application[],
  months = 6,
  locale = "en-GB",
): TrendPoint[] {
  const now = new Date();
  const points: TrendPoint[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    points.push({
      key,
      label: new Intl.DateTimeFormat(locale, { month: "short" }).format(date),
      value: 0,
    });
  }

  const indexByKey = new Map(points.map((point) => [point.key, point]));
  for (const application of applications) {
    const created = new Date(application.created_at);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    const point = indexByKey.get(key);
    if (point) point.value += 1;
  }

  return points;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  "Pending Review",
  "Assessed",
  "Under Review",
  "Approved",
  "Rejected",
];

export function statusCounts(
  applications: Application[],
): Array<{ label: ApplicationStatus; value: number }> {
  return APPLICATION_STATUSES.map((status) => ({
    label: status,
    value: applications.filter((application) => application.status === status)
      .length,
  }));
}

export function riskCountList(counts: RiskCounts): Array<{
  label: RiskCategory;
  value: number;
}> {
  return [
    { label: "Low Risk", value: counts.low },
    { label: "Medium Risk", value: counts.medium },
    { label: "High Risk", value: counts.high },
  ];
}

export function averageDefaultProbability(
  applications: Application[],
  assessments: RiskAssessment[],
): number {
  const latest = latestAssessments(assessments);
  const probabilities = applications
    .map((application) => latest.get(application.id)?.default_probability)
    .filter((value): value is number => typeof value === "number");

  if (probabilities.length === 0) return 0;
  return probabilities.reduce((sum, value) => sum + value, 0) / probabilities.length;
}

export type Period = "30d" | "90d" | "year" | "all";

export function filterByPeriod(
  applications: Application[],
  period: Period,
): Application[] {
  if (period === "all") return applications;
  const now = new Date();
  const start = new Date(now);

  if (period === "30d") start.setDate(now.getDate() - 30);
  else if (period === "90d") start.setDate(now.getDate() - 90);
  else start.setFullYear(now.getFullYear(), 0, 1);

  return applications.filter(
    (application) => new Date(application.created_at) >= start,
  );
}

export const PERIOD_LABELS: Record<Period, string> = {
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  year: "This year",
  all: "All time",
};
