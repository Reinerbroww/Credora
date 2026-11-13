import { auth } from "@/auth";
import type { Role } from "@/lib/types";

export async function requireUser() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.organizationId) return null;
  return user;
}

export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!user) {
    return {
      ok: false as const,
      response: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (!roles.includes(user.role as Role)) {
    return {
      ok: false as const,
      response: Response.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { ok: true as const, user };
}
