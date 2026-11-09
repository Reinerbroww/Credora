"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRightIcon,
  ChartIcon,
  ClipboardCheckIcon,
  LockIcon,
  MailIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { Logo } from "@/components/logo";
import { useCredora } from "@/lib/store";

const FEATURES = [
  {
    icon: ClipboardCheckIcon,
    title: "Structured underwriting",
    description: "Keep applications, assessments, and review decisions in one workflow.",
  },
  {
    icon: ChartIcon,
    title: "Portfolio visibility",
    description: "Monitor risk distribution and application trends from live records.",
  },
  {
    icon: ShieldIcon,
    title: "Human-led decisions",
    description: "Model output supports officers; final credit decisions stay with people.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login, session, ready } = useCredora();
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
      setError("Email and password are required.");
      setSubmitting(false);
      return;
    }

    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <section className="app-shell-bg relative hidden flex-col justify-between overflow-hidden border-r border-line p-10 lg:flex xl:p-14">
        <div>
          <Logo />
        </div>

        <div className="max-w-[500px]">
          <span className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-sage/[0.08] px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-sage">
            <SparkIcon className="h-3.5 w-3.5" />
            Credit Risk Intelligence
          </span>
          <h1 className="mt-6 text-[40px] font-semibold leading-[1.12] tracking-[-0.03em] text-white xl:text-[46px]">
            Smarter credit.
            <br />
            <span className="text-sage">Better decisions.</span>
          </h1>
          <p className="mt-5 max-w-[430px] text-[13.5px] leading-relaxed text-muted">
            Credora brings application management, AI-assisted default risk
            assessment, portfolio analytics, and underwriting review into a single
            workspace for PayLater teams.
          </p>

          <ul className="mt-9 space-y-5">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <li key={feature.title} className="flex gap-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <div>
                    <p className="text-[13px] font-medium text-white">
                      {feature.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-6 text-[10.5px] text-muted/70">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-low" />
            LightGBM risk engine
          </span>
          <span>Organization-isolated workspace</span>
          <span>MVP · v1.0</span>
        </div>
      </section>

      <section className="app-shell-bg flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <div className="card-surface rounded-2xl p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
              Secure access
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-white">
              Sign in to Credora
            </h2>
            <p className="mt-1.5 text-[12.5px] text-muted">
              Use your organization account to continue to the risk workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Work email
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
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="mb-1.5 text-[10.5px] font-medium text-sage/80 transition-colors hover:text-sage"
                  >
                    {showPassword ? "Hide" : "Show"}
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
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-risk-high/25 bg-risk-high/10 px-3 py-2 text-[11.5px] text-[#f3938f]">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary w-full">
                {submitting ? "Signing in..." : "Sign in"}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 border-t border-line-soft pt-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted/70">
                Demo accounts
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
                      Risk Analyst
                    </span>
                    <span className="block text-[10.5px] text-muted">
                      analyst@credora.id
                    </span>
                  </span>
                  <span className="text-[10px] text-sage">Use</span>
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
                      Credit Officer
                    </span>
                    <span className="block text-[10.5px] text-muted">
                      officer@credora.id
                    </span>
                  </span>
                  <span className="text-[10px] text-sage">Use</span>
                </button>
              </div>
              <p className="mt-2.5 text-[10px] leading-relaxed text-muted/60">
                Demo password: <span className="font-mono text-muted">credora123</span>.
                Accounts are seeded with <span className="font-mono text-muted">npm run db:seed</span>;
                change or remove them before a public deployment.
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-[10px] text-muted/50">
            Credora · Smarter Credit. Better Decisions.
          </p>
        </div>
      </section>
    </div>
  );
}
