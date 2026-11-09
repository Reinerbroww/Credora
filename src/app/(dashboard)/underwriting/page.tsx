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
import { useCredora } from "@/lib/store";
import type { RiskAssessment, ReviewStatus } from "@/lib/types";

type ReviewFilter = "all" | ReviewStatus;

export default function UnderwritingPage() {
  const { applications, assessments, reviews } = useCredora();
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
        eyebrow="Manual review"
        title="Underwriting Reviews"
        description="Review assessed applications, verify supporting information, and record the final credit decision with a clear reason."
        actions={
          <Link href="/applications" className="btn-secondary">
            <FolderIcon className="h-4 w-4" />
            All applications
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <QueueStat label="Awaiting action" value={pendingCount} tone="warning" />
        <QueueStat label="Completed reviews" value={completedCount} tone="sage" />
        <QueueStat
          label="Assessed applications"
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
              placeholder="Search by applicant or application ID..."
              className="field pl-9"
              aria-label="Search reviews"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as ReviewFilter)}
            className="field sm:w-[180px]"
            aria-label="Filter by review status"
          >
            <option value="all">All review statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Review">In Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex items-center justify-between px-4 py-2.5">
          <p className="text-[11.5px] text-muted">
            <span className="font-medium text-white">{rows.length}</span> review
            {rows.length === 1 ? "" : "s"} shown
          </p>
          <p className="hidden text-[10.5px] text-muted/70 sm:block">
            Sorted by latest assessment
          </p>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheckIcon className="h-5 w-5" />}
            title="Nothing to review"
            description="Assessed applications will appear here for manual underwriting review."
            action={
              <Link href="/applications" className="btn-primary">
                Go to Applications
              </Link>
            }
          />
        ) : (
          <div className="table-shell">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Applicant</th>
                  <th>Risk category</th>
                  <th>Review status</th>
                  <th>Applied</th>
                  <th className="text-right">Action</th>
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
                        Review
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
