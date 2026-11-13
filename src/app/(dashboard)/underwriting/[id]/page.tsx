"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FactorBars, ProbabilityGauge } from "@/components/charts";
import {
  AlertIcon,
  ArrowRightIcon,
  CheckIcon,
  ClipboardCheckIcon,
  FolderIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import {
  Card,
  DecisionBadge,
  EmptyState,
  InfoRow,
  InfoTip,
  PageHeader,
  ReviewStatusBadge,
  RiskBadge,
  SectionCard,
  StatusBadge,
} from "@/components/ui";
import {
  displayId,
  formatCurrency,
  formatDateTime,
  formatPercent,
} from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";
import type { FinalDecision } from "@/lib/types";

export default function UnderwritingDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    session,
    applicationById,
    latestAssessment,
    latestReview,
    saveReview,
    runAssessment,
  } = useCredora();
  const {
    t,
    home,
    intent,
    status: translateStatus,
    risk,
    decision: translateDecision,
    reviewStatus: translateReviewStatus,
    role,
  } = useI18n();

  const application = applicationById(params.id);
  const assessment = latestAssessment(params.id);
  const review = latestReview(params.id);
  const canAssess = session?.role === "Risk Analyst";
  const canDecide = session?.role === "Credit Officer";

  const [notes, setNotes] = useState(review?.review_notes ?? "");
  const [decision, setDecision] = useState<FinalDecision | "">(
    review?.final_decision ?? "",
  );
  const [reason, setReason] = useState(review?.decision_reason ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  if (!application) {
    return (
      <Card>
        <EmptyState
          icon={<FolderIcon className="h-5 w-5" />}
          title={t("uwDetail.notFoundTitle")}
          description={t("uwDetail.notFoundDesc")}
          action={
            <Link href="/underwriting" className="btn-primary">
              {t("uwDetail.backToReviews")}
            </Link>
          }
        />
      </Card>
    );
  }

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaved(false);

    if (!decision) {
      setError(t("uwDetail.errDecision"));
      return;
    }
    if (reason.trim().length < 10) {
      setError(t("uwDetail.errReason"));
      return;
    }

    const ok = await saveReview(application.id, {
      review_status: decision === "Manual Review" ? "In Review" : "Completed",
      final_decision: decision,
      decision_reason: reason.trim(),
      review_notes: notes.trim(),
    });

    if (!ok) {
      setError(t("uwDetail.errSave"));
      return;
    }

    setSaved(true);
  };

  return (
    <div className="fade-in space-y-5">
      <div>
        <Link
          href="/underwriting"
          className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] font-medium text-muted transition-colors hover:text-white"
        >
          <span className="rotate-180">
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </span>
          {t("uwDetail.backToUnderwriting")}
        </Link>
        <PageHeader
          eyebrow={`${displayId(application.id)} · ${t("uwDetail.eyebrowReview")}`}
          title={application.applicant_name}
          description={`${application.applicant_email} · ${t("detail.applied", {
            date: formatDateTime(application.created_at),
          })}`}
          actions={
            <>
              <Link
                href={`/applications/${application.id}`}
                className="btn-secondary"
              >
                {t("uwDetail.applicationDetail")}
              </Link>
              <StatusBadge status={application.status} />
            </>
          }
        />
      </div>

      {!assessment ? (
        <Card>
          <EmptyState
            icon={<SparkIcon className="h-5 w-5" />}
            title={t("uwDetail.assessmentRequired")}
            description={
              canAssess
                ? t("uwDetail.assessmentRequiredDesc")
                : t("perm.assess")
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
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <SectionCard
              title={t("uwDetail.predictionResult")}
              subtitle={formatDateTime(assessment.assessed_at)}
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <ProbabilityGauge value={assessment.default_probability} />
                <div className="w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge category={assessment.risk_category} />
                    <span className="flex items-center gap-1.5 text-[11px] text-muted">
                      {t("uwDetail.defaultProb")}{" "}
                      <span className="font-medium text-white">
                        {formatPercent(assessment.default_probability, 2)}
                      </span>
                      <InfoTip text={t("hint.defaultProbability")} />
                    </span>
                  </div>
                  <div className="mt-4">
                    <FactorBars factors={assessment.contributing_factors} />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title={t("uwDetail.appCustomerInfo")}
              subtitle={t("uwDetail.verify")}
            >
              <div className="grid gap-x-8 sm:grid-cols-2">
                <InfoRow
                  label={t("uwDetail.fullName")}
                  value={application.applicant_name}
                />
                <InfoRow
                  label={t("uwDetail.email")}
                  value={application.applicant_email}
                />
                <InfoRow
                  label={t("uwDetail.age")}
                  value={t("common.years", { value: application.age })}
                />
                <InfoRow
                  label={t("uwDetail.homeOwnership")}
                  hint={t("hint.homeOwnership")}
                  value={home(application.home_ownership)}
                />
                <InfoRow
                  label={t("uwDetail.annualIncome")}
                  hint={t("hint.annualIncome")}
                  value={formatCurrency(application.person_income)}
                />
                <InfoRow
                  label={t("uwDetail.loanAmount")}
                  hint={t("hint.loanAmount")}
                  value={formatCurrency(application.loan_amnt)}
                />
                <InfoRow
                  label={t("uwDetail.interestRate")}
                  hint={t("hint.interestRate")}
                  value={`${application.loan_int_rate.toFixed(2)}%`}
                />
                <InfoRow
                  label={t("uwDetail.loanToIncome")}
                  hint={t("hint.loanToIncome")}
                  value={formatPercent(application.loan_percent_income)}
                />
                <InfoRow
                  label={t("uwDetail.loanPurpose")}
                  hint={t("hint.loanPurpose")}
                  value={intent(application.loan_intent)}
                />
                <InfoRow
                  label={t("uwDetail.employmentLength")}
                  hint={t("hint.employmentLength")}
                  value={t("common.years", {
                    value: application.employment_length.toFixed(1),
                  })}
                />
              </div>
            </SectionCard>

            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                    <ClipboardCheckIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="text-[13.5px] font-semibold text-white">
                      {t("uwDetail.recordDecision")}
                    </h2>
                    <p className="text-[11px] text-muted">
                      {t("uwDetail.recordDecisionSub")}
                    </p>
                  </div>
                </div>
                {review && (
                  <ReviewStatusBadge status={review.review_status} />
                )}
              </div>

              {canDecide ? (
                <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="review_notes" className="label">
                    {t("uwDetail.reviewNotes")}
                  </label>
                  <textarea
                    id="review_notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="field resize-y"
                    placeholder={t("uwDetail.reviewNotesPlaceholder")}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="final_decision" className="label">
                      {t("uwDetail.finalDecision")}
                    </label>
                    <select
                      id="final_decision"
                      value={decision}
                      onChange={(event) => {
                        setDecision(event.target.value as FinalDecision | "");
                        setSaved(false);
                      }}
                      className="field"
                    >
                      <option value="">{t("uwDetail.selectDecision")}</option>
                      <option value="Approved">
                        {translateDecision("Approved")}
                      </option>
                      <option value="Rejected">
                        {translateDecision("Rejected")}
                      </option>
                      <option value="Manual Review">
                        {translateDecision("Manual Review")}
                      </option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="w-full rounded-lg border border-line bg-white/[0.02] px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted/80">
                        {t("uwDetail.statusAfterSave")}
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-white">
                        {decision === "Manual Review"
                          ? translateReviewStatus("In Review")
                          : decision
                            ? translateReviewStatus("Completed")
                            : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="decision_reason" className="label">
                    {t("uwDetail.decisionReason")}
                  </label>
                  <textarea
                    id="decision_reason"
                    value={reason}
                    onChange={(event) => {
                      setReason(event.target.value);
                      setSaved(false);
                    }}
                    rows={3}
                    className="field resize-y"
                    placeholder={t("uwDetail.decisionReasonPlaceholder")}
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-risk-high/25 bg-risk-high/10 px-3 py-2 text-[11.5px] text-[#f3938f]">
                    {error}
                  </div>
                )}

                {saved && (
                  <div className="flex items-center gap-2 rounded-lg border border-risk-low/25 bg-risk-low/10 px-3 py-2 text-[11.5px] text-[#8fd3ab]">
                    <CheckIcon className="h-4 w-4" />
                    {t("uwDetail.saved")}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button type="submit" className="btn-primary">
                    <CheckIcon className="h-4 w-4" />
                    {t("uwDetail.saveReview")}
                  </button>
                  <Link
                    href={`/applications/${application.id}/assessment`}
                    className="btn-secondary"
                  >
                    {t("uwDetail.viewAssessment")}
                  </Link>
                </div>
              </form>
              ) : (
                <div className="mt-4 rounded-lg border border-line bg-white/[0.02] px-3.5 py-3 text-[11.5px] leading-relaxed text-muted">
                  {t("perm.decide")}
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            <Card className="p-5">
              <h2 className="text-[13px] font-semibold text-white">
                {t("uwDetail.reviewContext")}
              </h2>
              <div className="mt-3">
                <InfoRow
                  label={t("uwDetail.appId")}
                  value={displayId(application.id)}
                  mono
                />
                <InfoRow
                  label={t("uwDetail.status")}
                  value={translateStatus(application.status)}
                />
                <InfoRow
                  label={t("uwDetail.riskCategory")}
                  value={risk(assessment.risk_category)}
                />
                <InfoRow
                  label={t("uwDetail.assessedAt")}
                  value={formatDateTime(assessment.assessed_at)}
                />
                <InfoRow
                  label={t("uwDetail.assessedBy")}
                  value={
                    assessment.assessed_by === session?.id
                      ? session.full_name
                      : role("Risk Analyst")
                  }
                />
              </div>
            </Card>

            {review && (
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold text-white">
                    {t("uwDetail.latestReview")}
                  </h2>
                  {review.final_decision ? (
                    <DecisionBadge decision={review.final_decision} />
                  ) : (
                    <ReviewStatusBadge status={review.review_status} />
                  )}
                </div>
                <div className="mt-3 space-y-2.5 text-[11.5px]">
                  <div>
                    <p className="text-muted">{t("uwDetail.notes")}</p>
                    <p className="mt-0.5 leading-relaxed text-white">
                      {review.review_notes || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">
                      {t("uwDetail.decisionReasonLabel")}
                    </p>
                    <p className="mt-0.5 leading-relaxed text-white">
                      {review.decision_reason || "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
                    <span className="text-muted">
                      {t("uwDetail.reviewedAt")}
                    </span>
                    <span className="text-white">
                      {formatDateTime(review.reviewed_at)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-5">
              <div className="flex items-start gap-2.5">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-risk-mid" />
                <div>
                  <p className="text-[12px] font-medium text-white">
                    {t("uwDetail.humanTitle")}
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    {t("uwDetail.humanDesc")}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-sage" />
                <p className="text-[11px] font-medium text-white">
                  {t("uwDetail.guardrails")}
                </p>
              </div>
              <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-muted">
                <li>• {t("uwDetail.guardrail1")}</li>
                <li>• {t("uwDetail.guardrail2")}</li>
                <li>• {t("uwDetail.guardrail3")}</li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
