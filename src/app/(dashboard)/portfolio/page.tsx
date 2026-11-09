"use client";

import { useMemo, useState } from "react";
import {
  DonutChart,
  DonutLegend,
  HorizontalBarChart,
} from "@/components/charts";
import {
  ChartIcon,
  ClockIcon,
  LayersIcon,
  ShieldIcon,
  TrendIcon,
} from "@/components/icons";
import {
  Card,
  DemoBanner,
  PageHeader,
  RiskBadge,
  SectionCard,
  StatCard,
} from "@/components/ui";
import {
  averageDefaultProbability,
  filterByPeriod,
  PERIOD_LABELS,
  riskCounts,
  statusCounts,
  type Period,
} from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/format";
import { useCredora } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  "Pending Review": "#A3AEA7",
  Assessed: "#B8D9A8",
  "Under Review": "#E5B93F",
  Approved: "#58A878",
  Rejected: "#E45B56",
};

const PERIODS: Period[] = ["30d", "90d", "year", "all"];

export default function PortfolioPage() {
  const { applications, assessments } = useCredora();
  const [period, setPeriod] = useState<Period>("90d");

  const filteredApplications = useMemo(
    () => filterByPeriod(applications, period),
    [applications, period],
  );

  const counts = riskCounts(filteredApplications, assessments);
  const averageProbability = averageDefaultProbability(
    filteredApplications,
    assessments,
  );
  const statuses = statusCounts(filteredApplications).filter(
    (status) => status.value > 0,
  );
  const assessedShare =
    filteredApplications.length === 0
      ? 0
      : Math.round((counts.assessed / filteredApplications.length) * 100);
  const highShare =
    counts.assessed === 0 ? 0 : Math.round((counts.high / counts.assessed) * 100);

  const riskData = [
    { label: "Low Risk", value: counts.low, color: "#58A878" },
    { label: "Medium Risk", value: counts.medium, color: "#E5B93F" },
    { label: "High Risk", value: counts.high, color: "#E45B56" },
  ];

  const statusData = statuses.map((status) => ({
    label: status.label,
    value: status.value,
    color: STATUS_COLORS[status.label] ?? "#A3AEA7",
  }));

  const riskSummary = [
    {
      category: "Low Risk" as const,
      value: counts.low,
      color: "border-risk-low/25 bg-risk-low/[0.07]",
      bar: "bg-risk-low",
    },
    {
      category: "Medium Risk" as const,
      value: counts.medium,
      color: "border-risk-mid/25 bg-risk-mid/[0.07]",
      bar: "bg-risk-mid",
    },
    {
      category: "High Risk" as const,
      value: counts.high,
      color: "border-risk-high/25 bg-risk-high/[0.07]",
      bar: "bg-risk-high",
    },
  ];

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow="Analytics"
        title="Portfolio Analytics"
        description="A summary of application volume, risk distribution, and review status for the selected period. Only metrics computable from available records are shown."
        actions={
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
            className="field w-[170px]"
            aria-label="Select period"
          >
            {PERIODS.map((option) => (
              <option key={option} value={option}>
                {PERIOD_LABELS[option]}
              </option>
            ))}
          </select>
        }
      />

      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={formatNumber(filteredApplications.length)}
          hint={PERIOD_LABELS[period]}
          icon={<LayersIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label="Assessed"
          value={formatNumber(counts.assessed)}
          hint={`${assessedShare}% of applications in period`}
          tone="sage"
          icon={<ShieldIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label="Avg. default probability"
          value={formatPercent(averageProbability, 1)}
          hint="Mean of latest assessments"
          icon={<ChartIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label="High Risk share"
          value={`${highShare}%`}
          hint={`${counts.high} high-risk application(s)`}
          tone="danger"
          icon={<TrendIcon className="h-[18px] w-[18px]" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Risk Distribution"
          subtitle="Latest assessment per application in period"
        >
          {counts.assessed === 0 ? (
            <div className="py-10 text-center text-[12.5px] text-muted">
              No assessed applications in this period.
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <DonutChart
                data={riskData}
                centerValue={formatNumber(counts.assessed)}
                centerLabel="Assessed"
              />
              <div className="w-full max-w-[230px]">
                <DonutLegend data={riskData} />
                <p className="mt-4 border-t border-line-soft pt-3 text-[11px] leading-relaxed text-muted">
                  {counts.unassessed} application(s) in this period have no
                  assessment and are excluded from the distribution.
                </p>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Application Status"
          subtitle="Status mix for applications in period"
        >
          {statusData.length === 0 ? (
            <div className="py-10 text-center text-[12.5px] text-muted">
              No applications in this period.
            </div>
          ) : (
            <HorizontalBarChart data={statusData} />
          )}
          <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
            <ChartIcon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
            <p className="text-[11px] leading-relaxed text-muted">
              Status totals are derived from the current application records.
              Approved and rejected counts reflect recorded review decisions.
            </p>
          </div>
        </SectionCard>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13.5px] font-semibold text-white">
            Risk category summary
          </h2>
          <span className="text-[10.5px] text-muted">
            {counts.assessed} assessed in {PERIOD_LABELS[period].toLowerCase()}
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {riskSummary.map((item) => {
            const share =
              counts.assessed === 0
                ? 0
                : Math.round((item.value / counts.assessed) * 100);
            return (
              <div
                key={item.category}
                className={`rounded-xl border p-4 ${item.color}`}
              >
                <div className="flex items-center justify-between">
                  <RiskBadge category={item.category} />
                  <span className="stat-number text-[20px] font-semibold text-white">
                    {item.value}
                  </span>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/25">
                  <div
                    className={`h-full rounded-full ${item.bar}`}
                    style={{ width: `${Math.max(share, item.value > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <p className="mt-2 text-[10.5px] text-muted">
                  {share}% of assessed applications
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <ClockIcon className="h-3.5 w-3.5" />
          Data reflects the current workspace stored in Neon PostgreSQL and
          updates immediately after assessments or reviews are saved.
        </div>
        <span className="chip inline-flex w-fit items-center gap-1.5 rounded-full border border-line bg-white/[0.02] px-2.5 py-1 text-[10px] text-muted">
          Source: Neon PostgreSQL · LightGBM v1.0
        </span>
      </Card>
    </div>
  );
}
