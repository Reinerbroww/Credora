import { requireRole } from "@/lib/api-auth";
import { saveReview, type ReviewPayload } from "@/lib/server-data";
import type { FinalDecision, ReviewStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REVIEW_STATUSES: ReviewStatus[] = ["Pending", "In Review", "Completed"];
const FINAL_DECISIONS: FinalDecision[] = [
  "Approved",
  "Rejected",
  "Manual Review",
];

function parsePayload(body: unknown): ReviewPayload | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Record<string, unknown>;

  const reviewStatus = String(value.review_status ?? "") as ReviewStatus;
  const finalDecision = String(value.final_decision ?? "") as FinalDecision;
  const decisionReason = String(value.decision_reason ?? "").trim();
  const reviewNotes = String(value.review_notes ?? "").trim();

  if (!REVIEW_STATUSES.includes(reviewStatus)) return null;
  if (!FINAL_DECISIONS.includes(finalDecision)) return null;
  if (decisionReason.length < 10) return null;

  return {
    review_status: reviewStatus,
    final_decision: finalDecision,
    decision_reason: decisionReason,
    review_notes: reviewNotes,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireRole("Credit Officer");
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const payload = parsePayload(await request.json().catch(() => null));
  if (!payload) {
    return Response.json({ error: "Invalid review data." }, { status: 400 });
  }

  const { id } = await params;
  const result = await saveReview(
    user.organizationId,
    user.id,
    id,
    payload,
  );

  if (!result) {
    return Response.json({ error: "Application not found." }, { status: 404 });
  }

  return Response.json(result);
}
