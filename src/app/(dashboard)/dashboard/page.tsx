"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ApplicationTable } from "@/components/application-table";
import { DonutChart, DonutLegend, TrendChart } from "@/components/charts";
import {
  AlertIcon,
  ChevronRightIcon,
  ClockIcon,
  LayersIcon,
  PlusIcon,
  ShieldIcon,
  TrendIcon,
  UsersIcon,
} from "@/components/icons";
import {
  Card,
  DemoBanner,
  PageHeader,
  SectionCard,
  StatCard,
} from "@/components/ui";
import {
  applicationTrend,
  awaitingReviewCount,
  riskCounts,
} from "@/lib/analytics";
import { formatNumber } from "@/lib/format";
import { useCredora } from "@/lib/store";

const subscribeToNothing = () => () => {};

function useToday(): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () =>
      new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    () => "",
  );
}

export default function DashboardPage() {
  const { applications, assessments, reviews } = useCredora();

  const counts = riskCounts(applications, assessments);
  const pendingReview = awaitingReviewCount(applications, reviews);
  const trend = applicationTrend(applications, 6).map((point) => ({
    label: point.label,
    value: point.value,
  }));
  const recent = [...applications]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 6);

  const riskData = [
    { label: "Low Risk", value: counts.low, color: "#58A878" },
    { label: "Medium Risk", value: counts.medium, color: "#E5B93F" },
    { label: "High Risk", value: counts.high, color: "#E45B56" },
  ];

  const assessedShare =
    applications.length === 0
      ? 0
      : Math.round((counts.assessed / applications.length) * 100);
  const highRiskShare =
    counts.assessed === 0
      ? 0
      : Math.round((counts.high / counts.assessed) * 100);
  const trendTotal = trend.reduce((sum, point) => sum + point.value, 0);

  const today = useToday();

  return (
    <div className="fade-in space-y-6">
      <PageHeader
        eyebrow="Dashboard"
        title="Portfolio overview"
        description={`Monitor application flow and credit risk across the organization.${today ? ` ${today}.` : ""}`}
        actions={
          <>
            <Link href="/portfolio" className="btn-secondary">
              <TrendIcon className="h-4 w-4" />
              View portfolio
            </Link>
            <Link href="/applications/new" className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              New application
            </Link>
          </>
        }
      />

      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Applications"
          value={formatNumber(applications.length)}
          hint={`${counts.unassessed} awaiting first assessment`}
          icon={<UsersIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label="Pending Review"
          value={formatNumber(pendingReview)}
          hint="Awaiting underwriting action"
          tone="warning"
          icon={<ClockIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label="Assessed"
          value={formatNumber(counts.assessed)}
          hint={`${assessedShare}% of all applications`}
          tone="sage"
          icon={<ShieldIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label="High Risk"
          value={formatNumber(counts.high)}
          hint={`${highRiskShare}% of assessed portfolio`}
          tone="danger"
          icon={<AlertIcon className="h-[18px] w-[18px]" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.35fr]">
        <SectionCard
          title="Risk Portfolio Distribution"
          subtitle="Latest assessment per application"
          action={
            <Link href="/portfolio" className="btn-ghost">
              Details
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <DonutChart
              data={riskData}
              centerValue={formatNumber(counts.assessed)}
              centerLabel="Assessed"
            />
            <div className="w-full max-w-[210px]">
              <DonutLegend data={riskData} />
              <div className="mt-4 border-t border-line-soft pt-3 text-[11px] text-muted">
                {counts.unassessed > 0
                  ? `${counts.unassessed} application(s) have no assessment yet.`
                  : "Every application has at least one assessment."}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Application Trend"
          subtitle={`${trendTotal} applications created in the last 6 months`}
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/15 bg-sage/[0.06] px-2.5 py-1 text-[10px] font-medium text-sage">
              <TrendIcon className="h-3 w-3" />
              Monthly
            </span>
          }
        >
          <TrendChart data={trend} />
        </SectionCard>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-4">
          <div>
            <h2 className="text-[13.5px] font-semibold text-white">
              Recent Applications
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              The most recently submitted applications.
            </p>
          </div>
          <Link href="/applications" className="btn-ghost">
            <LayersIcon className="h-3.5 w-3.5" />
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12.5px] text-muted">
            No applications yet. Create the first application to begin.
          </div>
        ) : (
          <ApplicationTable
            applications={recent}
            assessments={assessments}
          />
        )}
      </Card>
    </div>
  );
}
