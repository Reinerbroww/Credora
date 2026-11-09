"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FactorBars, ProbabilityGauge } from "@/components/charts";
import {
  AlertIcon,
  ArrowRightIcon,
  ClipboardCheckIcon,
  FolderIcon,
  RefreshIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import {
  Card,
  EmptyState,
  InfoRow,
  PageHeader,
  RiskBadge,
  SectionCard,
} from "@/components/ui";
import {
  displayId,
  formatCurrency,
  formatDateTime,
  formatPercent,
} from "@/lib/format";
import { useCredora } from "@/lib/store";
import type { RiskCategory } from "@/lib/types";

const RISK_SUMMARY: Record<RiskCategory, string> = {
  "Low Risk":
    "The estimated default probability is below the low-risk threshold. Routine handling is appropriate, while the officer still records the final decision.",
  "Medium Risk":
    "The estimate sits in the medium-risk band. Consider repayment capacity, employment stability, and supporting documents before deciding.",
  "High Risk":
    "The estimate is above the high-risk threshold. A detailed manual review and additional verification are recommended before approval.",
};

const RISK_THRESHOLDS = [
  { label: "Low", value: "< 18%", color: "bg-risk-low" },
  { label: "Medium", value: "18–42%", color: "bg-risk-mid" },
  { label: "High", value: "≥ 42%", color: "bg-risk-high" },
];

export default function AssessmentResultPage() {
  const params = useParams<{ id: string }>();
  const {
    applicationById,
    latestAssessment,
    runAssessment,
    assessments,
  } = useCredora();
  const [running, setRunning] = useState(false);

  const application = applicationById(params.id);
  const assessment = latestAssessment(params.id);

  if (!application) {
    return (
      <Card>
        <EmptyState
          icon={<FolderIcon className="h-5 w-5" />}
          title="Application not found"
          description="The requested application is not available in this workspace."
          action={
            <Link href="/applications" className="btn-primary">
              Back to Applications
            </Link>
          }
        />
      </Card>
    );
  }

  if (!assessment) {
    return (
      <div className="fade-in space-y-5">
        <PageHeader
          eyebrow={displayId(application.id)}
          title="Credit Risk Assessment"
          description={`No assessment has been recorded for ${application.applicant_name} yet.`}
        />
        <Card>
          <EmptyState
            icon={<SparkIcon className="h-5 w-5" />}
            title="No assessment available"
            description="Run the risk assessment to generate a default probability, risk category, and contributing factors."
            action={
              <button
                type="button"
                onClick={async () => {
                  await runAssessment(application.id);
                }}
                className="btn-primary"
              >
                <SparkIcon className="h-4 w-4" />
                Run Risk Assessment
              </button>
            }
          />
        </Card>
      </div>
    );
  }

  const historyCount = assessments.filter(
    (item) => item.application_id === application.id,
  ).length;

  const handleRerun = async () => {
    setRunning(true);
    await runAssessment(application.id);
    setRunning(false);
  };

  return (
    <div className="fade-in space-y-5">
      <div>
        <Link
          href={`/applications/${application.id}`}
          className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-white"
        >
          <span className="rotate-180">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
          Back to Application Detail
        </Link>
        <PageHeader
          eyebrow={`${displayId(application.id)} · Assessment result`}
          title="Credit Risk Assessment"
          description={`${application.applicant_name} · Assessed ${formatDateTime(
            assessment.assessed_at,
          )} · ${historyCount} assessment${historyCount === 1 ? "" : "s"} on record`}
          actions={
            <>
              <button
                type="button"
                onClick={handleRerun}
                disabled={running}
                className="btn-secondary"
              >
                <RefreshIcon className="h-4 w-4" />
                {running ? "Assessing..." : "Re-run"}
              </button>
              <Link
                href={`/underwriting/${application.id}`}
                className="btn-primary"
              >
                <ClipboardCheckIcon className="h-4 w-4" />
                Continue to Review
              </Link>
            </>
          }
        />
      </div>

      <Card className="overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[auto_1fr] md:items-center">
          <div className="flex justify-center">
            <ProbabilityGauge value={assessment.default_probability} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <RiskBadge category={assessment.risk_category} />
              <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-muted">
                {assessment.model_name} · {assessment.model_version}
              </span>
            </div>
            <h2 className="mt-3 text-[20px] font-semibold tracking-tight text-white">
              {assessment.risk_category}
            </h2>
            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              {RISK_SUMMARY[assessment.risk_category]}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric
                label="Default probability"
                value={formatPercent(assessment.default_probability, 2)}
              />
              <Metric label="Risk category" value={assessment.risk_category} />
              <Metric
                label="Assessed at"
                value={formatDateTime(assessment.assessed_at)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-t border-line-soft sm:grid-cols-3">
          {RISK_THRESHOLDS.map((threshold) => (
            <div
              key={threshold.label}
              className="flex items-center gap-2.5 border-b border-line-soft px-5 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <span className={`h-2 w-2 rounded-full ${threshold.color}`} />
              <span className="text-[11.5px] text-muted">{threshold.label}</span>
              <span className="ml-auto text-[11.5px] font-medium text-white">
                {threshold.value}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-4">
          <SectionCard
            title="Contributing factors"
            subtitle="Model signals that move the estimate up or down"
          >
            {assessment.contributing_factors.length === 0 ? (
              <p className="text-[12.5px] text-muted">
                No dominant factors were identified for this application.
              </p>
            ) : (
              <FactorBars factors={assessment.contributing_factors} />
            )}
          </SectionCard>

          <SectionCard
            title="Model information"
            subtitle="Metadata recorded with this assessment"
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow label="Model" value={assessment.model_name} />
              <InfoRow label="Version" value={assessment.model_version} />
              <InfoRow
                label="Output"
                value="Default probability (0–1)"
              />
              <InfoRow label="Assessed by" value="Rani Prameswari · Risk Analyst" />
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-risk-mid/20 bg-risk-mid/[0.06] px-3.5 py-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
              <p className="text-[11px] leading-relaxed text-muted">
                This workspace uses a deterministic demo scoring engine that
                stands in for the LightGBM service. Before production, outputs
                must come from the validated model artifact and be monitored.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold text-white">
              Application summary
            </h2>
            <div className="mt-3">
              <InfoRow label="Applicant" value={application.applicant_name} />
              <InfoRow label="Application ID" value={displayId(application.id)} mono />
              <InfoRow
                label="Loan amount"
                value={formatCurrency(application.loan_amnt)}
              />
              <InfoRow
                label="Annual income"
                value={formatCurrency(application.person_income)}
              />
              <InfoRow
                label="Loan-to-income"
                value={formatPercent(application.loan_percent_income)}
              />
              <InfoRow
                label="Interest rate"
                value={`${application.loan_int_rate.toFixed(2)}%`}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2.5">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <div>
                <p className="text-[12px] font-medium text-white">
                  Officer decides, not the model
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  Continue to the underwriting review to add notes, select the
                  final decision, and record the reason.
                </p>
              </div>
            </div>
            <Link
              href={`/underwriting/${application.id}`}
              className="btn-primary mt-4 w-full"
            >
              <ClipboardCheckIcon className="h-4 w-4" />
              Continue to Review
            </Link>
            <Link
              href={`/applications/${application.id}`}
              className="btn-secondary mt-2 w-full"
            >
              Back to application
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-muted/80">
        {label}
      </p>
      <p className="stat-number mt-1 text-[13px] font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
