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
import { useI18n, type Locale } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

const subscribeToNothing = () => () => {};

function useToday(locale: Locale): string {
  return useSyncExternalStore(
    subscribeToNothing,
    () =>
      new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    () => "",
  );
}

export default function DashboardPage() {
  const { applications, assessments, reviews, session } = useCredora();
  const { t, risk, locale } = useI18n();
  const canCreate = session?.role === "Risk Analyst";

  const counts = riskCounts(applications, assessments);
  const pendingReview = awaitingReviewCount(applications, reviews);
  const trend = applicationTrend(
    applications,
    6,
    locale === "id" ? "id-ID" : "en-GB",
  ).map((point) => ({
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
    { label: risk("Low Risk"), value: counts.low, color: "#58A878" },
    { label: risk("Medium Risk"), value: counts.medium, color: "#E5B93F" },
    { label: risk("High Risk"), value: counts.high, color: "#E45B56" },
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

  const today = useToday(locale);

  return (
    <div className="fade-in space-y-6">
      <PageHeader
        eyebrow={t("dash.eyebrow")}
        title={t("dash.title")}
        description={t("dash.description", {
          today: today ? `${today}.` : "",
        })}
        actions={
          <>
            <Link href="/portfolio" className="btn-secondary">
              <TrendIcon className="h-4 w-4" />
              {t("dash.viewPortfolio")}
            </Link>
            {canCreate && (
              <Link href="/applications/new" className="btn-primary">
                <PlusIcon className="h-4 w-4" />
                {t("dash.newApplication")}
              </Link>
            )}
          </>
        }
      />

      <DemoBanner />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dash.statTotal")}
          value={formatNumber(applications.length)}
          hint={t("dash.hintTotal", { count: counts.unassessed })}
          icon={<UsersIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label={t("dash.statPending")}
          value={formatNumber(pendingReview)}
          hint={t("dash.hintPending")}
          tone="warning"
          icon={<ClockIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label={t("dash.statAssessed")}
          value={formatNumber(counts.assessed)}
          hint={t("dash.hintAssessed", { percent: assessedShare })}
          tone="sage"
          icon={<ShieldIcon className="h-[18px] w-[18px]" />}
        />
        <StatCard
          label={t("dash.statHigh")}
          value={formatNumber(counts.high)}
          hint={t("dash.hintHigh", { percent: highRiskShare })}
          tone="danger"
          icon={<AlertIcon className="h-[18px] w-[18px]" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.35fr]">
        <SectionCard
          title={t("dash.riskDistTitle")}
          subtitle={t("dash.riskDistSubtitle")}
          action={
            <Link href="/portfolio" className="btn-ghost">
              {t("dash.details")}
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          }
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            <DonutChart
              data={riskData}
              centerValue={formatNumber(counts.assessed)}
              centerLabel={t("dash.assessed")}
            />
            <div className="w-full max-w-[210px]">
              <DonutLegend data={riskData} />
              <div className="mt-4 border-t border-line-soft pt-3 text-[11px] text-muted">
                {counts.unassessed > 0
                  ? t("dash.unassessedNote", { count: counts.unassessed })
                  : t("dash.allAssessedNote")}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title={t("dash.trendTitle")}
          subtitle={t("dash.trendSubtitle", { count: trendTotal })}
          action={
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sage/15 bg-sage/[0.06] px-2.5 py-1 text-[10px] font-medium text-sage">
              <TrendIcon className="h-3 w-3" />
              {t("dash.monthly")}
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
              {t("dash.recentTitle")}
            </h2>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {t("dash.recentSubtitle")}
            </p>
          </div>
          <Link href="/applications" className="btn-ghost">
            <LayersIcon className="h-3.5 w-3.5" />
            {t("common.viewAll")}
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-10 text-center text-[12.5px] text-muted">
            {t("dash.empty")}
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
