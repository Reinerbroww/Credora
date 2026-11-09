import { requireUser } from "@/lib/api-auth";
import { resetOrganizationData } from "@/lib/server-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await resetOrganizationData(user.organizationId, user.id);
  return Response.json(data);
}
