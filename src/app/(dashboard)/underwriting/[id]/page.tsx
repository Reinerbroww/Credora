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
import { useCredora } from "@/lib/store";
import type { FinalDecision } from "@/lib/types";

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

  const application = applicationById(params.id);
  const assessment = latestAssessment(params.id);
  const review = latestReview(params.id);

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
          title="Application not found"
          description="The requested application is not available in this workspace."
          action={
            <Link href="/underwriting" className="btn-primary">
              Back to Reviews
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
      setError("Select a final decision before saving the review.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Provide a decision reason of at least 10 characters.");
      return;
    }

    const ok = await saveReview(application.id, {
      review_status: decision === "Manual Review" ? "In Review" : "Completed",
      final_decision: decision,
      decision_reason: reason.trim(),
      review_notes: notes.trim(),
    });

    if (!ok) {
      setError("Unable to save the review. Please try again.");
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
          Back to Underwriting Reviews
        </Link>
        <PageHeader
          eyebrow={`${displayId(application.id)} · Underwriting review`}
          title={application.applicant_name}
          description={`${application.applicant_email} · Applied ${formatDateTime(
            application.created_at,
          )}`}
          actions={
            <>
              <Link
                href={`/applications/${application.id}`}
                className="btn-secondary"
              >
                Application detail
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
            title="Assessment required"
            description="This application does not have a risk assessment yet. Run an assessment before recording an underwriting decision."
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
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <SectionCard
              title="Prediction result"
              subtitle={`${assessment.model_name} · ${assessment.model_version} · ${formatDateTime(
                assessment.assessed_at,
              )}`}
            >
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                <ProbabilityGauge value={assessment.default_probability} />
                <div className="w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <RiskBadge category={assessment.risk_category} />
                    <span className="text-[11px] text-muted">
                      Default probability{" "}
                      <span className="font-medium text-white">
                        {formatPercent(assessment.default_probability, 2)}
                      </span>
                    </span>
                  </div>
                  <div className="mt-4">
                    <FactorBars factors={assessment.contributing_factors} />
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Application and customer information"
              subtitle="Verify this information against supporting documents."
            >
              <div className="grid gap-x-8 sm:grid-cols-2">
                <InfoRow label="Full name" value={application.applicant_name} />
                <InfoRow label="Email" value={application.applicant_email} />
                <InfoRow label="Age" value={`${application.age} years`} />
                <InfoRow
                  label="Home ownership"
                  value={
                    HOME_LABELS[application.home_ownership] ??
                    application.home_ownership
                  }
                />
                <InfoRow
                  label="Annual income"
                  value={formatCurrency(application.person_income)}
                />
                <InfoRow
                  label="Loan amount"
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
                  value={
                    INTENT_LABELS[application.loan_intent] ??
                    application.loan_intent
                  }
                />
                <InfoRow
                  label="Employment length"
                  value={`${application.employment_length.toFixed(1)} years`}
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
                      Record review decision
                    </h2>
                    <p className="text-[11px] text-muted">
                      The final decision is made by the officer, not the model.
                    </p>
                  </div>
                </div>
                {review && (
                  <ReviewStatusBadge status={review.review_status} />
                )}
              </div>

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="review_notes" className="label">
                    Review notes
                  </label>
                  <textarea
                    id="review_notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={3}
                    className="field resize-y"
                    placeholder="Record verification steps, supporting documents, and observations."
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="final_decision" className="label">
                      Final decision *
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
                      <option value="">Select a decision</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Manual Review">Manual Review</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="w-full rounded-lg border border-line bg-white/[0.02] px-3 py-2.5">
                      <p className="text-[10px] uppercase tracking-[0.14em] text-muted/80">
                        Review status after save
                      </p>
                      <p className="mt-1 text-[12px] font-medium text-white">
                        {decision === "Manual Review"
                          ? "In Review"
                          : decision
                            ? "Completed"
                            : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="decision_reason" className="label">
                    Decision reason *
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
                    placeholder="Explain the reason for the final decision."
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
                    Review saved. The application status has been updated.
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <button type="submit" className="btn-primary">
                    <CheckIcon className="h-4 w-4" />
                    Save Review
                  </button>
                  <Link
                    href={`/applications/${application.id}/assessment`}
                    className="btn-secondary"
                  >
                    View assessment result
                  </Link>
                </div>
              </form>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">
            <Card className="p-5">
              <h2 className="text-[13px] font-semibold text-white">
                Review context
              </h2>
              <div className="mt-3">
                <InfoRow label="Application ID" value={displayId(application.id)} mono />
                <InfoRow label="Status" value={application.status} />
                <InfoRow label="Risk category" value={assessment.risk_category} />
                <InfoRow
                  label="Assessed at"
                  value={formatDateTime(assessment.assessed_at)}
                />
                <InfoRow
                  label="Assessed by"
                  value={
                    assessment.assessed_by === session?.id
                      ? session.full_name
                      : "Risk Analyst"
                  }
                />
              </div>
            </Card>

            {review && (
              <Card className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[13px] font-semibold text-white">
                    Latest review
                  </h2>
                  {review.final_decision ? (
                    <DecisionBadge decision={review.final_decision} />
                  ) : (
                    <ReviewStatusBadge status={review.review_status} />
                  )}
                </div>
                <div className="mt-3 space-y-2.5 text-[11.5px]">
                  <div>
                    <p className="text-muted">Notes</p>
                    <p className="mt-0.5 leading-relaxed text-white">
                      {review.review_notes || "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Decision reason</p>
                    <p className="mt-0.5 leading-relaxed text-white">
                      {review.decision_reason || "—"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-line-soft pt-2.5">
                    <span className="text-muted">Reviewed at</span>
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
                    Human accountability
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">
                    Record a clear reason for every decision. Reviews are stored
                    in the workspace database as a demo record, not a production
                    audit trail.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5">
              <div className="flex items-center gap-2">
                <ShieldIcon className="h-4 w-4 text-sage" />
                <p className="text-[11px] font-medium text-white">
                  Decision guardrails
                </p>
              </div>
              <ul className="mt-2 space-y-1.5 text-[10.5px] leading-relaxed text-muted">
                <li>• Model output is advisory only.</li>
                <li>• Verify customer data before deciding.</li>
                <li>• Decisions and reasons are logged.</li>
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
