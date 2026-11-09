import { requireUser } from "@/lib/api-auth";
import { createAssessment } from "@/lib/server-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
