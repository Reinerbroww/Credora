import { requireUser } from "@/lib/api-auth";
import { listData } from "@/lib/server-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await listData(user.organizationId);
  return Response.json(data);
}
