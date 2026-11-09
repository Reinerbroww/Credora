import { requireUser } from "@/lib/api-auth";
import { getProfile, updateProfile } from "@/lib/server-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  return Response.json({ profile });
}

export async function PATCH(request: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { full_name?: unknown; email?: unknown }
    | null;
  if (!body) {
    return Response.json({ error: "Invalid profile data." }, { status: 400 });
  }

  const fullName = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Invalid profile data." }, { status: 400 });
  }

  try {
    const profile = await updateProfile(user.id, {
      full_name: fullName,
      email,
    });
    if (!profile) {
      return Response.json({ error: "Profile not found." }, { status: 404 });
    }
    return Response.json({ profile });
  } catch {
    return Response.json(
      { error: "Unable to update profile. The email may already be in use." },
      { status: 409 },
    );
  }
}
