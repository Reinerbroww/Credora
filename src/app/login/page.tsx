"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRightIcon, LockIcon, MailIcon } from "@/components/icons";
import { AuthShell } from "@/components/auth-shell";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { login, session, ready } = useCredora();
  const { t } = useI18n();
  const [email, setEmail] = useState("analyst@credora.id");
  const [password, setPassword] = useState("credora123");
  const [showPassword, setShowPassword] = useState(false);
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
    setSubmitting(true);

    if (!email.trim() || !password) {
      setError(t("login.errRequired"));
      setSubmitting(false);
      return;
    }

    const result = await login(email, password);
    if (!result.ok) {
      const message = result.error ?? "";
      if (/reach/i.test(message)) setError(t("login.errReach"));
      else if (/match/i.test(message)) setError(t("login.errInvalid"));
      else setError(t("login.errGeneric"));
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <AuthShell
      eyebrow={t("login.secureAccess")}
      title={t("login.signInTitle")}
      subtitle={t("login.signInSubtitle")}
      footer={
        <p className="text-[12px] text-muted">
          {t("login.newHere")}{" "}
          <Link
            href="/register"
            className="font-medium text-sage transition-colors hover:text-sage-bright"
          >
            {t("login.createAccount")}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">
              {t("login.password")}
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="mb-1.5 text-[10.5px] font-medium text-sage/80 transition-colors hover:text-sage"
            >
              {showPassword ? t("login.hide") : t("login.show")}
            </button>
          </div>
          <div className="relative">
            <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="field pl-9"
              placeholder={t("login.passwordPlaceholder")}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-risk-high/25 bg-risk-high/10 px-3 py-2 text-[11.5px] text-[#f3938f]">
            {error}
          </div>
        )}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? t("login.signingIn") : t("login.signIn")}
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 border-t border-line-soft pt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted/70">
          {t("login.demoAccounts")}
        </p>
        <div className="mt-2.5 grid gap-2">
          <button
            type="button"
            onClick={() => {
              setEmail("analyst@credora.id");
              setPassword("credora123");
              setError("");
            }}
            className="flex items-center justify-between rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-sage/25 hover:bg-white/[0.04]"
          >
            <span>
              <span className="block text-[11.5px] font-medium text-white">
                {t("role.Risk Analyst")}
              </span>
              <span className="block text-[10.5px] text-muted">
                analyst@credora.id
              </span>
            </span>
            <span className="text-[10px] text-sage">{t("login.use")}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail("officer@credora.id");
              setPassword("credora123");
              setError("");
            }}
            className="flex items-center justify-between rounded-lg border border-line bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-sage/25 hover:bg-white/[0.04]"
          >
            <span>
              <span className="block text-[11.5px] font-medium text-white">
                {t("role.Credit Officer")}
              </span>
              <span className="block text-[10.5px] text-muted">
                officer@credora.id
              </span>
            </span>
            <span className="text-[10px] text-sage">{t("login.use")}</span>
          </button>
        </div>
        <p className="mt-2.5 text-[10px] leading-relaxed text-muted/60">
          {t("login.demoPassword")}{" "}
          <span className="font-mono text-muted">credora123</span>.{" "}
          {t("login.demoSeededA")}{" "}
          <span className="font-mono text-muted">npm run db:seed</span>
          {t("login.demoSeededB")}
        </p>
      </div>
    </AuthShell>
  );
}
