import { auth } from "@/auth";

export async function requireUser() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.organizationId) return null;
  return user;
}
