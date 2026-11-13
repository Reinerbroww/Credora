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
  InfoTip,
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
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";
import type { RiskCategory } from "@/lib/types";

const RISK_SUMMARY_KEYS: Record<RiskCategory, string> = {
  "Low Risk": "assess.summaryLow",
  "Medium Risk": "assess.summaryMedium",
  "High Risk": "assess.summaryHigh",
};

const RISK_THRESHOLDS = [
  { labelKey: "assess.thresholdLow", value: "< 18%", color: "bg-risk-low" },
  { labelKey: "assess.thresholdMedium", value: "18–42%", color: "bg-risk-mid" },
  { labelKey: "assess.thresholdHigh", value: "≥ 42%", color: "bg-risk-high" },
];

export default function AssessmentResultPage() {
  const params = useParams<{ id: string }>();
  const {
    applicationById,
    latestAssessment,
    runAssessment,
    assessments,
    session,
  } = useCredora();
  const { t, risk, role } = useI18n();
  const [running, setRunning] = useState(false);
  const canAssess = session?.role === "Risk Analyst";

  const application = applicationById(params.id);
  const assessment = latestAssessment(params.id);

  if (!application) {
    return (
      <Card>
        <EmptyState
          icon={<FolderIcon className="h-5 w-5" />}
          title={t("assess.notFoundTitle")}
          description={t("assess.notFoundDesc")}
          action={
            <Link href="/applications" className="btn-primary">
              {t("detail.backToApps")}
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
          title={t("assess.title")}
          description={t("assess.noAssessmentFor", {
            name: application.applicant_name,
          })}
        />
        <Card>
          <EmptyState
            icon={<SparkIcon className="h-5 w-5" />}
            title={t("assess.noAvailableTitle")}
            description={
              canAssess ? t("assess.noAvailableDesc") : t("perm.assess")
            }
            action={
              canAssess ? (
                <button
                  type="button"
                  onClick={async () => {
                    await runAssessment(application.id);
                  }}
                  className="btn-primary"
                >
                  <SparkIcon className="h-4 w-4" />
                  {t("assess.run")}
                </button>
              ) : undefined
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
          {t("assess.backToDetail")}
        </Link>
        <PageHeader
          eyebrow={`${displayId(application.id)} · ${t("assess.eyebrowResult")}`}
          title={t("assess.title")}
          description={t("assess.description", {
            name: application.applicant_name,
            date: formatDateTime(assessment.assessed_at),
            count: historyCount,
          })}
          actions={
            <>
              {canAssess && (
                <button
                  type="button"
                  onClick={handleRerun}
                  disabled={running}
                  className="btn-secondary"
                >
                  <RefreshIcon className="h-4 w-4" />
                  {running ? t("assess.assessing") : t("assess.rerun")}
                </button>
              )}
              <Link
                href={`/underwriting/${application.id}`}
                className="btn-primary"
              >
                <ClipboardCheckIcon className="h-4 w-4" />
                {t("assess.continueReview")}
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
            </div>
            <h2 className="mt-3 text-[20px] font-semibold tracking-tight text-white">
              {risk(assessment.risk_category)}
            </h2>
            <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-muted">
              {t(RISK_SUMMARY_KEYS[assessment.risk_category])}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric
                label={t("assess.defaultProb")}
                hint={t("hint.defaultProbability")}
                value={formatPercent(assessment.default_probability, 2)}
              />
              <Metric
                label={t("assess.riskCategory")}
                hint={t("hint.riskCategory")}
                value={risk(assessment.risk_category)}
              />
              <Metric
                label={t("assess.assessedAt")}
                value={formatDateTime(assessment.assessed_at)}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-t border-line-soft sm:grid-cols-3">
          {RISK_THRESHOLDS.map((threshold) => (
            <div
              key={threshold.labelKey}
              className="flex items-center gap-2.5 border-b border-line-soft px-5 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <span className={`h-2 w-2 rounded-full ${threshold.color}`} />
              <span className="text-[11.5px] text-muted">
                {t(threshold.labelKey)}
              </span>
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
            title={t("assess.contributing")}
            subtitle={t("assess.contributingSub")}
          >
            {assessment.contributing_factors.length === 0 ? (
              <p className="text-[12.5px] text-muted">
                {t("assess.noFactors")}
              </p>
            ) : (
              <FactorBars factors={assessment.contributing_factors} />
            )}
          </SectionCard>

          <SectionCard
            title={t("assess.modelInfo")}
            subtitle={t("assess.modelInfoSub")}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow
                label={t("assess.output")}
                value={t("assess.outputValue")}
              />
              <InfoRow
                label={t("assess.assessedBy")}
                value={`Rani Prameswari · ${role("Risk Analyst")}`}
              />
            </div>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-risk-mid/20 bg-risk-mid/[0.06] px-3.5 py-2.5">
              <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
              <p className="text-[11px] leading-relaxed text-muted">
                {t("assess.caveat")}
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
          <Card className="p-5">
            <h2 className="text-[13px] font-semibold text-white">
              {t("assess.appSummary")}
            </h2>
            <div className="mt-3">
              <InfoRow
                label={t("assess.applicant")}
                value={application.applicant_name}
              />
              <InfoRow
                label={t("assess.appId")}
                value={displayId(application.id)}
                mono
              />
              <InfoRow
                label={t("assess.loanAmount")}
                value={formatCurrency(application.loan_amnt)}
              />
              <InfoRow
                label={t("assess.annualIncome")}
                value={formatCurrency(application.person_income)}
              />
              <InfoRow
                label={t("assess.loanToIncome")}
                value={formatPercent(application.loan_percent_income)}
              />
              <InfoRow
                label={t("assess.interestRate")}
                value={`${application.loan_int_rate.toFixed(2)}%`}
              />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-start gap-2.5">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <div>
                <p className="text-[12px] font-medium text-white">
                  {t("assess.officerTitle")}
                </p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">
                  {t("assess.officerDesc")}
                </p>
              </div>
            </div>
            <Link
              href={`/underwriting/${application.id}`}
              className="btn-primary mt-4 w-full"
            >
              <ClipboardCheckIcon className="h-4 w-4" />
              {t("assess.continueReview")}
            </Link>
            <Link
              href={`/applications/${application.id}`}
              className="btn-secondary mt-2 w-full"
            >
              {t("assess.backToApp")}
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5">
      <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted/80">
        {label}
        {hint && <InfoTip text={hint} />}
      </p>
      <p className="stat-number mt-1 text-[13px] font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
