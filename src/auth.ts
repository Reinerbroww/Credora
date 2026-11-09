import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getSql } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        const sql = getSql();
        const rows = await sql`
          SELECT u.id, u.email, u.password_hash, p.full_name, p.role,
                 p.organization_id, o.name AS organization_name
          FROM users u
          JOIN profiles p ON p.id = u.id
          JOIN organizations o ON o.id = p.organization_id
          WHERE lower(u.email) = ${email}
          LIMIT 1
        `;

        const row = rows[0] as
          | {
              id: string;
              email: string;
              password_hash: string;
              full_name: string;
              role: string;
              organization_id: string;
              organization_name: string;
            }
          | undefined;
        if (!row) return null;

        const valid = await bcrypt.compare(password, row.password_hash);
        if (!valid) return null;

        return {
          id: row.id,
          email: row.email,
          name: row.full_name,
          role: row.role,
          organizationId: row.organization_id,
          organizationName: row.organization_name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.organizationName = user.organizationName;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? "";
        session.user.role = (token.role as string | undefined) ?? "Risk Analyst";
        session.user.organizationId =
          (token.organizationId as string | undefined) ?? "";
        session.user.organizationName =
          (token.organizationName as string | undefined) ?? "";
      }
      return session;
    },
  },
});
