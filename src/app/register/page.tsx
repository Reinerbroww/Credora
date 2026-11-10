"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRightIcon,
  BuildingIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/components/icons";
import { AuthShell } from "@/components/auth-shell";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();
  const { login, session, ready } = useCredora();
  const { t } = useI18n();
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("Risk Analyst");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && session) {
      router.replace("/dashboard");
    }
  }, [ready, session, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    const name = fullName.trim();
    const organization = organizationName.trim();
    const address = email.trim().toLowerCase();

    if (name.length < 2) {
      setError(t("register.errName"));
      return;
    }
    if (organization.length < 2) {
      setError(t("register.errOrg"));
      return;
    }
    if (!EMAIL_PATTERN.test(address)) {
      setError(t("register.errEmail"));
      return;
    }
    if (password.length < 8) {
      setError(t("register.errPassword"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("register.errConfirm"));
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name,
          organization_name: organization,
          email: address,
          password,
          role,
        }),
      });

      if (response.status === 409) {
        setError(t("register.errExists"));
        setSubmitting(false);
        return;
      }
      if (!response.ok) {
        setError(t("register.errGeneric"));
        setSubmitting(false);
        return;
      }

      const result = await login(address, password);
      if (!result.ok) {
        setError(t("register.errSignIn"));
        setSubmitting(false);
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError(t("register.errGeneric"));
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow={t("register.eyebrow")}
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <p className="text-[12px] text-muted">
          {t("register.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-medium text-sage transition-colors hover:text-sage-bright"
          >
            {t("register.signIn")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fullName" className="label">
            {t("register.fullName")}
          </label>
          <div className="relative">
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="field pl-9"
              placeholder={t("register.fullNamePlaceholder")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="organizationName" className="label">
            {t("register.organization")}
          </label>
          <div className="relative">
            <BuildingIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="organizationName"
              type="text"
              autoComplete="organization"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="field pl-9"
              placeholder={t("register.organizationPlaceholder")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="role" className="label">
            {t("register.role")}
          </label>
          <select
            id="role"
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="field"
          >
            <option value="Risk Analyst">{t("role.Risk Analyst")}</option>
            <option value="Credit Officer">{t("role.Credit Officer")}</option>
          </select>
        </div>

        <div>
          <label htmlFor="email" className="label">
            {t("login.workEmail")}
          </label>
          <div className="relative">
            <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="field pl-9"
              placeholder={t("login.emailPlaceholder")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="label">
            {t("login.password")}
          </label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field pl-9"
              placeholder={t("register.passwordPlaceholder")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">
            {t("register.confirmPassword")}
          </label>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="field pl-9"
              placeholder={t("register.confirmPasswordPlaceholder")}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-risk-high/25 bg-risk-high/10 px-3 py-2 text-[11.5px] text-[#f3938f]">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? t("register.submitting") : t("register.submit")}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-4 text-[10px] leading-relaxed text-muted/60">
        {t("register.note")}
      </p>
    </AuthShell>
  );
}
