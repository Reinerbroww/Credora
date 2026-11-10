"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ChevronRightIcon,
  ClipboardCheckIcon,
  FolderIcon,
  SearchIcon,
} from "@/components/icons";
import {
  Card,
  EmptyState,
  PageHeader,
  ReviewStatusBadge,
  RiskBadge,
} from "@/components/ui";
import { latestAssessments, latestReviews } from "@/lib/analytics";
import { displayId, formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";
import type { RiskAssessment, ReviewStatus } from "@/lib/types";

type ReviewFilter = "all" | ReviewStatus;

export default function UnderwritingPage() {
  const { applications, assessments, reviews } = useCredora();
  const { t, reviewStatus: translateReviewStatus } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReviewFilter>("all");

  const latestAssessmentsMap = useMemo(
    () => latestAssessments(assessments),
    [assessments],
  );
  const latestReviewMap = useMemo(() => latestReviews(reviews), [reviews]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return applications
      .filter((application) => latestAssessmentsMap.has(application.id))
      .map((application) => {
        const assessment = latestAssessmentsMap.get(application.id) as RiskAssessment;
        const review = latestReviewMap.get(application.id);
        const reviewStatus: ReviewStatus = review?.review_status ?? "Pending";
        return { application, assessment, review, reviewStatus };
      })
      .filter((row) => {
        if (status !== "all" && row.reviewStatus !== status) return false;
        if (!term) return true;
        return (
          row.application.applicant_name.toLowerCase().includes(term) ||
          row.application.applicant_email.toLowerCase().includes(term) ||
          displayId(row.application.id).toLowerCase().includes(term)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.assessment.assessed_at).getTime() -
          new Date(a.assessment.assessed_at).getTime(),
      );
  }, [applications, latestAssessmentsMap, latestReviewMap, search, status]);

  const pendingCount = applications.filter((application) => {
    if (!latestAssessmentsMap.has(application.id)) return false;
    const review = latestReviewMap.get(application.id);
    return !review || review.review_status !== "Completed";
  }).length;

  const completedCount = Array.from(latestReviewMap.values()).filter(
    (review) => review.review_status === "Completed",
  ).length;

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow={t("uw.eyebrow")}
        title={t("uw.title")}
        description={t("uw.description")}
        actions={
          <Link href="/applications" className="btn-secondary">
            <FolderIcon className="h-4 w-4" />
            {t("uw.allApps")}
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <QueueStat
          label={t("uw.awaitingAction")}
          value={pendingCount}
          tone="warning"
        />
        <QueueStat
          label={t("uw.completedReviews")}
          value={completedCount}
          tone="sage"
        />
        <QueueStat
          label={t("uw.assessedApps")}
          value={latestAssessmentsMap.size}
          tone="default"
        />
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("uw.searchPlaceholder")}
              className="field pl-9"
              aria-label={t("uw.searchAria")}
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ReviewFilter)}
            className="field sm:w-[180px]"
            aria-label={t("uw.filterAria")}
          >
            <option value="all">{t("uw.allStatuses")}</option>
            <option value="Pending">{translateReviewStatus("Pending")}</option>
            <option value="In Review">
              {translateReviewStatus("In Review")}
            </option>
            <option value="Completed">
              {translateReviewStatus("Completed")}
            </option>
          </select>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          <p className="text-[11.5px] text-muted">
            {t("uw.rowsShown", { count: rows.length })}
          </p>
          <p className="hidden text-[10.5px] text-muted/70 sm:block">
            {t("uw.sorted")}
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheckIcon className="h-5 w-5" />}
            title={t("uw.nothingTitle")}
            description={t("uw.nothingDesc")}
            action={
              <Link href="/applications" className="btn-primary">
                {t("uw.goApps")}
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("table.appId")}</th>
                  <th>{t("table.applicant")}</th>
                  <th>{t("table.risk")}</th>
                  <th>{t("uw.colReviewStatus")}</th>
                  <th>{t("table.applied")}</th>
                  <th className="text-right">{t("table.action")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ application, assessment, reviewStatus }) => (
                  <tr key={application.id}>
                    <td>
                      <Link
                        href={`/underwriting/${application.id}`}
                        className="font-mono text-[11.5px] font-medium text-sage transition-colors hover:text-sage-bright"
                      >
                        {displayId(application.id)}
                      </Link>
                    </td>
                    <td>
                      <p className="text-[12.5px] font-medium text-white">
                        {application.applicant_name}
                      </p>
                      <p className="text-[10.5px] text-muted">
                        {application.applicant_email}
                      </p>
                    </td>
                    <td>
                      <RiskBadge category={assessment.risk_category} />
                    </td>
                    <td>
                      <ReviewStatusBadge status={reviewStatus} />
                    </td>
                    <td className="whitespace-nowrap text-muted">
                      {formatDate(application.created_at)}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/underwriting/${application.id}`}
                        className="inline-flex items-center gap-1 text-[11.5px] font-medium text-sage transition-colors hover:text-sage-bright"
                      >
                        {t("table.review")}
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function QueueStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "warning" | "sage" | "default";
}) {
  const toneClass =
    tone === "warning"
      ? "text-risk-mid"
      : tone === "sage"
        ? "text-sage"
        : "text-white";

  return (
    <Card className="px-4 py-3.5">
      <p className="text-[11px] text-muted">{label}</p>
      <p className={`stat-number mt-1 text-[22px] font-semibold ${toneClass}`}>
        {value}
      </p>
    </Card>
  );
}
