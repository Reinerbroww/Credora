import { registerAccount } from "@/lib/server-data";
import type { Role } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROLES: Role[] = ["Risk Analyst", "Credit Officer"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        full_name?: unknown;
        organization_name?: unknown;
        email?: unknown;
        password?: unknown;
        role?: unknown;
      }
    | null;

  if (!body) {
    return Response.json({ error: "Invalid registration data." }, { status: 400 });
  }

  const fullName = String(body.full_name ?? "").trim();
  const organizationName = String(body.organization_name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = ROLES.includes(body.role as Role)
    ? (body.role as Role)
    : "Risk Analyst";

  if (
    fullName.length < 2 ||
    organizationName.length < 2 ||
    !EMAIL_PATTERN.test(email) ||
    password.length < 8
  ) {
    return Response.json({ error: "Invalid registration data." }, { status: 400 });
  }

  try {
    const account = await registerAccount({
      full_name: fullName,
      organization_name: organizationName,
      email,
      password,
      role,
    });
    return Response.json({ ok: true, userId: account.id }, { status: 201 });
  } catch (error) {
    if (
      (error instanceof Error && error.message === "EMAIL_EXISTS") ||
      isUniqueViolation(error)
    ) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "Unable to create the account. Please try again." },
      { status: 500 },
    );
  }
}
