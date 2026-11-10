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
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { applicationById, assessments, latestAssessment, runAssessment } =
    useCredora();
  const { t, home, intent } = useI18n();
  const [running, setRunning] = useState(false);

  const application = applicationById(params.id);

  if (!application) {
    return (
      <Card>
        <EmptyState
          icon={<FolderIcon className="h-5 w-5" />}
          title={t("detail.notFoundTitle")}
          description={t("detail.notFoundDesc")}
          action={
            <Link href="/applications" className="btn-primary">
              {t("detail.backToApps")}
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
          {t("detail.backToApps")}
        </Link>
        <PageHeader
          eyebrow={displayId(application.id)}
          title={application.applicant_name}
          description={`${application.applicant_email} · ${t("detail.applied", {
            date: formatDate(application.created_at),
          })} · ${t("detail.lastUpdated", {
            date: formatDate(application.updated_at),
          })}`}
          actions={
            <>
              {latest && (
                <Link
                  href={`/underwriting/${application.id}`}
                  className="btn-secondary"
                >
                  <ClipboardCheckIcon className="h-4 w-4" />
                  {t("detail.openReview")}
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
                  ? t("detail.assessing")
                  : latest
                    ? t("detail.rerun")
                    : t("detail.run")}
              </button>
            </>
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.45fr_0.9fr]">
        <div className="space-y-4">
          <SectionCard
            title={t("detail.customerInfo")}
            subtitle={t("detail.customerInfoSub")}
            action={<UserIcon className="h-4 w-4 text-muted" />}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow
                label={t("detail.fullName")}
                value={application.applicant_name}
              />
              <InfoRow
                label={t("detail.email")}
                value={application.applicant_email}
              />
              <InfoRow
                label={t("detail.age")}
                value={t("common.years", { value: application.age })}
              />
              <InfoRow
                label={t("detail.homeOwnership")}
                value={home(application.home_ownership)}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t("detail.financialInfo")}
            subtitle={t("detail.financialInfoSub")}
            action={<WalletIcon className="h-4 w-4 text-muted" />}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow
                label={t("detail.annualIncome")}
                value={formatCurrency(application.person_income)}
              />
              <InfoRow
                label={t("detail.loanAmount")}
                value={formatCurrency(application.loan_amnt)}
              />
              <InfoRow
                label={t("detail.interestRate")}
                value={`${application.loan_int_rate.toFixed(2)}%`}
              />
              <InfoRow
                label={t("detail.loanToIncome")}
                value={formatPercent(application.loan_percent_income)}
              />
              <InfoRow
                label={t("detail.loanPurpose")}
                value={intent(application.loan_intent)}
              />
              <InfoRow
                label={t("detail.loanGrade")}
                value={application.loan_grade}
              />
              <InfoRow
                label={t("detail.creditHistory")}
                value={t("common.years", {
                  value: application.cb_person_cred_hist_length,
                })}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t("detail.employmentInfo")}
            subtitle={t("detail.employmentInfoSub")}
            action={<BuildingIcon className="h-4 w-4 text-muted" />}
          >
            <div className="grid gap-x-8 sm:grid-cols-2">
              <InfoRow
                label={t("detail.employmentLength")}
                value={t("common.years", {
                  value: application.employment_length.toFixed(1),
                })}
              />
              <InfoRow
                label={t("detail.historicalDefault")}
                value={
                  application.cb_person_default_on_file === "Y"
                    ? t("detail.defaultYes")
                    : t("detail.defaultNo")
                }
              />
              <InfoRow
                label={t("detail.organization")}
                value="Nusantara PayLater"
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t("detail.assessmentHistory")}
            subtitle={t("detail.recordsCount", { count: history.length })}
            bodyClassName="p-0"
          >
            {history.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-[12.5px] text-muted">
                  {t("detail.noAssessment")}
                </p>
                <button
                  type="button"
                  onClick={handleRun}
                  disabled={running}
                  className="btn-primary mt-4"
                >
                  <SparkIcon className="h-4 w-4" />
                  {t("detail.run")}
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
                              {t("detail.latest")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] text-muted">
                          {assessment.model_name} · {assessment.model_version} ·{" "}
                          {t("detail.defaultProb")}{" "}
                          {formatPercent(assessment.default_probability, 2)}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <Link
                        href={`/applications/${application.id}/assessment`}
                        className="btn-ghost self-start sm:self-auto"
                      >
                        {t("detail.viewResult")}
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
                {t("detail.appStatus")}
              </h2>
              <StatusBadge status={application.status} />
            </div>
            <div className="mt-4">
              <InfoRow
                label={t("detail.appId")}
                value={displayId(application.id)}
                mono
              />
              <InfoRow
                label={t("detail.appliedOn")}
                value={formatDate(application.created_at)}
              />
              <InfoRow label={t("detail.createdBy")} value="Rani Prameswari" />
              <InfoRow
                label={t("detail.lastUpdatedLabel")}
                value={formatDate(application.updated_at)}
              />
            </div>
          </Card>

          {latest ? (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-white">
                  {t("detail.latestAssessment")}
                </h2>
                <RiskBadge category={latest.risk_category} />
              </div>
              <div className="mt-4 flex flex-col items-center">
                <ProbabilityGauge value={latest.default_probability} />
                <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                  {t("detail.gaugeCaption")}
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                <Link
                  href={`/applications/${application.id}/assessment`}
                  className="btn-primary w-full"
                >
                  {t("detail.viewFull")}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  href={`/underwriting/${application.id}`}
                  className="btn-secondary w-full"
                >
                  <ClipboardCheckIcon className="h-4 w-4" />
                  {t("detail.underwritingReview")}
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              <div className="flex items-start gap-2.5">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
                <div>
                  <p className="text-[12px] font-medium text-white">
                    {t("detail.awaitingTitle")}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    {t("detail.awaitingDesc")}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-5">
            <p className="text-[11px] font-medium text-white">
              {t("detail.decisionSupport")}
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              {t("detail.decisionSupportDesc")}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
