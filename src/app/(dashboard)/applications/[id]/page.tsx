"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ProbabilityGauge } from "@/components/charts";
import {
  ArrowRightIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  ClockIcon,
  FolderIcon,
  RefreshIcon,
  ShieldIcon,
  SparkIcon,
  UserIcon,
  WalletIcon,
} from "@/components/icons";
import {
  Card,
  EmptyState,
  InfoRow,
  PageHeader,
  RiskBadge,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import {
  displayId,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPercent,
} from "@/lib/format";
import { useCredora } from "@/lib/store";

const HOME_LABELS: Record<string, string> = {
  RENT: "Rent",
  OWN: "Own",
  MORTGAGE: "Mortgage",
  OTHER: "Other",
};

const INTENT_LABELS: Record<string, string> = {
  PERSONAL: "Personal",
  EDUCATION: "Education",
  MEDICAL: "Medical",
  VENTURE: "Business venture",
  HOMEIMPROVEMENT: "Home improvement",
  DEBTCONSOLIDATION: "Debt consolidation",
};

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { applicationById, assessments, latestAssessment, runAssessment } =
    useCredora();
  const [running, setRunning] = useState(false);

  const application = applicationById(params.id);

  if (!application) {
    return (
      <Card>
        <EmptyState
          icon={<FolderIcon className="h-5 w-5" />}
          title="Application not found"
          description="The requested application is not available in this workspace. It may have been removed or the link is incorrect."
          action={
            <Link href="/applications" className="btn-primary">
              Back to Applications
            </Link>
          }
        />
      </Card>
    );
  }

  const latest = latestAssessment(application.id);
  const history = assessments
    .filter((assessment) => assessment.application_id === application.id)
    .sort(
      (a, b) =>
        new Date(b.assessed_at).getTime() - new Date(a.assessed_at).getTime(),
    );

  const handleRun = async () => {
    setRunning(true);
    const assessment = await runAssessment(application.id);
    if (assessment) {
      router.push(`/applications/${application.id}/assessment`);
    } else {
      setRunning(false);
    }
  };

  return (
    <div className="fade-in space-y-5">
      <div>
        <Link
          href="/applications"
          className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-white"
        >
          <span className="rotate-180">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
          Back to Applications
        </Link>
        <PageHeader
          eyebrow={displayId(application.id)}
          title={application.applicant_name}
          description={`${application.applicant_email} · Applied ${formatDate(
            application.created_at,
          )} · Last updated ${formatDate(application.updated_at)}`}
          actions={
            <>
              {latest && (
                <Link
                  href={`/underwriting/${application.id}`}
                  className="btn-secondary"
                >
                  <ClipboardCheckIcon className="h-4 w-4" />
                  Open review
                </Link>
              )}
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                className="btn-primary"
              >
                {latest ? (
                  <RefreshIcon className="h-4 w-4" />
                ) : (
                  <SparkIcon className="h-4 w-4" />
                )}
                {running
                  ? "Assessing..."
                  : latest
                    ? "Re-run Assessment"
                    : "Run Risk Assessment"}
              </button>
            </>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-4">
          <SectionCard
            title="Customer information"
            subtitle="Identity and household details"
            action={<UserIcon className="h-4 w-4 text-muted" />}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow label="Full name" value={application.applicant_name} />
              <InfoRow label="Email address" value={application.applicant_email} />
              <InfoRow label="Age" value={`${application.age} years`} />
              <InfoRow
                label="Home ownership"
                value={HOME_LABELS[application.home_ownership] ?? application.home_ownership}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Financial information"
            subtitle="Loan request and repayment indicators"
            action={<WalletIcon className="h-4 w-4 text-muted" />}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow
                label="Annual income"
                value={formatCurrency(application.person_income)}
              />
              <InfoRow
                label="Requested loan amount"
                value={formatCurrency(application.loan_amnt)}
              />
              <InfoRow
                label="Interest rate"
                value={`${application.loan_int_rate.toFixed(2)}%`}
              />
              <InfoRow
                label="Loan-to-income"
                value={formatPercent(application.loan_percent_income)}
              />
              <InfoRow
                label="Loan purpose"
                value={INTENT_LABELS[application.loan_intent] ?? application.loan_intent}
              />
              <InfoRow label="Loan grade" value={application.loan_grade} />
              <InfoRow
                label="Credit history length"
                value={`${application.cb_person_cred_hist_length} years`}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Employment information"
            subtitle="Stability indicators used by the risk engine"
            action={<BuildingIcon className="h-4 w-4 text-muted" />}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow
                label="Employment length"
                value={`${application.employment_length.toFixed(1)} years`}
              />
              <InfoRow
                label="Historical default"
                value={
                  application.cb_person_default_on_file === "Y"
                    ? "Yes — default on file"
                    : "No record"
                }
              />
              <InfoRow label="Organization" value="Nusantara PayLater" />
            </div>
          </SectionCard>

          <SectionCard
            title="Assessment history"
            subtitle={`${history.length} assessment${history.length === 1 ? "" : "s"} recorded`}
            bodyClassName="p-0"
          >
            {history.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12.5px] text-muted">
                  No risk assessment has been recorded for this application yet.
                </p>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={running}
                  className="btn-primary mt-4"
                >
                  <SparkIcon className="h-4 w-4" />
                  Run Risk Assessment
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-line-soft">
                {history.map((assessment, index) => (
                  <li
                    key={assessment.id}
                    className="flex flex-col gap-2 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.03] text-muted">
                        <ShieldIcon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[12.5px] font-medium text-white">
                            {formatDateTime(assessment.assessed_at)}
                          </p>
                          <RiskBadge category={assessment.risk_category} />
                          {index === 0 && (
                            <span className="rounded-full border border-sage/20 bg-sage/[0.08] px-2 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-sage">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-muted">
                          {assessment.model_name} · {assessment.model_version} ·
                          Default probability{" "}
                          {formatPercent(assessment.default_probability, 2)}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Link
                        href={`/applications/${application.id}/assessment`}
                        className="btn-ghost self-start sm:self-auto"
                      >
                        View result
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-white">
                Application status
              </h2>
              <StatusBadge status={application.status} />
            </div>
            <div className="mt-4">
              <InfoRow label="Application ID" value={displayId(application.id)} mono />
              <InfoRow label="Applied on" value={formatDate(application.created_at)} />
              <InfoRow label="Created by" value="Rani Prameswari" />
              <InfoRow label="Last updated" value={formatDate(application.updated_at)} />
            </div>
          </Card>

          {latest ? (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-white">
                  Latest assessment
                </h2>
                <RiskBadge category={latest.risk_category} />
              </div>
              <div className="mt-4 flex flex-col items-center">
                <ProbabilityGauge value={latest.default_probability} />
                <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                  Estimated default probability for the requested PayLater
                  exposure. Use with review notes, not as an automatic decision.
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href={`/applications/${application.id}/assessment`}
                  className="btn-primary w-full"
                >
                  View full result
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={`/underwriting/${application.id}`}
                  className="btn-secondary w-full"
                >
                  <ClipboardCheckIcon className="h-4 w-4" />
                  Underwriting review
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex items-start gap-2.5">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
                <div>
                  <p className="text-[12px] font-medium text-white">
                    Awaiting assessment
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    Run the risk assessment to generate a default probability,
                    risk category, and contributing factors for this application.
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-[11px] font-medium text-white">Decision support</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Model output is an estimate. Final approval or rejection must be
              recorded by an authorized Credit Officer after manual review.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
