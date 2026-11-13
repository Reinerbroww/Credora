import { requireRole } from "@/lib/api-auth";
import { createAssessment } from "@/lib/server-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireRole("Risk Analyst");
  if (!gate.ok) return gate.response;
  const user = gate.user;

  const { id } = await params;
  const assessment = await createAssessment(
    user.organizationId,
    user.id,
    id,
  );

  if (!assessment) {
    return Response.json({ error: "Application not found." }, { status: 404 });
  }

  return Response.json({ assessment }, { status: 201 });
}
