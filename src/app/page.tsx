"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  ChartIcon,
  CheckIcon,
  ClipboardCheckIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

const FEATURES = [
  {
    icon: ClipboardCheckIcon,
    titleKey: "login.f1title",
    descriptionKey: "login.f1desc",
  },
  {
    icon: ChartIcon,
    titleKey: "login.f2title",
    descriptionKey: "login.f2desc",
  },
  {
    icon: ShieldIcon,
    titleKey: "login.f3title",
    descriptionKey: "login.f3desc",
  },
];

const STEPS = [
  { titleKey: "landing.step1Title", descriptionKey: "landing.step1Desc" },
  { titleKey: "landing.step2Title", descriptionKey: "landing.step2Desc" },
  { titleKey: "landing.step3Title", descriptionKey: "landing.step3Desc" },
  { titleKey: "landing.step4Title", descriptionKey: "landing.step4Desc" },
];

const HIGHLIGHTS = [
  "landing.point1",
  "landing.point2",
  "landing.point3",
];

export default function LandingPage() {
  const { t } = useI18n();
  const { ready, session } = useCredora();
  const signedIn = ready && Boolean(session);

  return (
    <div className="app-shell-bg relative min-h-screen overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-56 -top-32 h-[520px] w-[520px] rounded-full bg-forest/30 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-40 h-[460px] w-[460px] rounded-full bg-sage/[0.07] blur-3xl"
      />

      <header className="sticky top-0 z-30 border-b border-line/50 bg-near-black/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" aria-label={t("landing.home")}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 text-[12px] text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              {t("landing.navFeatures")}
            </a>
            <a href="#workflow" className="transition-colors hover:text-white">
              {t("landing.navWorkflow")}
            </a>
            <a href="#why" className="transition-colors hover:text-white">
              {t("landing.navWhy")}
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            {signedIn ? (
              <Link href="/dashboard" className="btn-primary text-[12.5px]">
                {t("landing.openDashboard")}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-[12.5px]">
                  {t("landing.signIn")}
                </Link>
                <Link href="/register" className="btn-primary text-[12.5px]">
                  {t("landing.getStarted")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-[1180px] items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sage/20 bg-sage/[0.08] px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.16em] text-sage">
              <SparkIcon className="h-3.5 w-3.5" />
              {t("landing.badge")}
            </span>

            <h1 className="mt-6 text-[42px] font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-[52px] xl:text-[58px]">
              {t("landing.titleA")}
              <br />
              <span className="text-sage">{t("landing.titleB")}</span>
            </h1>

            <p className="mt-6 max-w-[520px] text-[14px] leading-relaxed text-muted">
              {t("landing.intro")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary">
                {t("landing.ctaPrimary")}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-secondary">
                {t("landing.ctaSecondary")}
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
              {HIGHLIGHTS.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-2 text-[11.5px] text-muted"
                >
                  <CheckIcon className="h-3.5 w-3.5 text-sage" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="card-surface rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sage/80">
                    {t("landing.previewEyebrow")}
                  </p>
                  <p className="mt-1.5 text-[17px] font-semibold tracking-tight text-white">
                    {t("landing.previewTitle")}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full border border-risk-low/30 bg-risk-low/10 px-2.5 py-1 text-[9.5px] font-medium text-risk-low">
                  <span className="h-1.5 w-1.5 rounded-full bg-risk-low" />
                  {t("sidebar.online")}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {[
                  { label: "landing.previewTotal", value: "128", hint: "landing.previewTotalHint" },
                  { label: "landing.previewPending", value: "24", hint: "landing.previewPendingHint" },
                  { label: "landing.previewAssessed", value: "104", hint: "landing.previewAssessedHint" },
                  { label: "landing.previewHigh", value: "12%", hint: "landing.previewHighHint" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-line bg-white/[0.02] p-3.5"
                  >
                    <p className="text-[9.5px] uppercase tracking-[0.12em] text-muted/80">
                      {t(item.label)}
                    </p>
                    <p className="mt-1.5 text-[22px] font-semibold tracking-tight text-white">
                      {item.value}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">{t(item.hint)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-line bg-white/[0.02] p-4">
                <div className="flex items-center justify-between text-[10.5px] text-muted">
                  <span>{t("landing.previewDist")}</span>
                  <span>{t("landing.previewDistSub")}</span>
                </div>
                <div className="mt-3 flex h-2.5 overflow-hidden rounded-full">
                  <span className="h-full w-[62%] bg-risk-low" />
                  <span className="h-full w-[26%] bg-risk-mid" />
                  <span className="h-full w-[12%] bg-risk-high" />
                </div>
                <div className="mt-2.5 flex items-center gap-4 text-[9.5px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-risk-low" />
                    {t("risk.Low Risk")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-risk-mid" />
                    {t("risk.Medium Risk")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-risk-high" />
                    {t("risk.High Risk")}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-2.5 rounded-xl border border-line bg-near-black/90 px-4 py-3 shadow-2xl sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                <ShieldIcon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[11px] font-medium text-white">
                  {t("landing.previewGuardTitle")}
                </span>
                <span className="block text-[9.5px] text-muted">
                  {t("landing.previewGuardDesc")}
                </span>
              </span>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-line/50 py-20">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="max-w-[560px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
                {t("landing.featuresEyebrow")}
              </p>
              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-white sm:text-[34px]">
                {t("landing.featuresTitle")}
              </h2>
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">
                {t("landing.featuresIntro")}
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.titleKey}
                    className="card-surface rounded-xl p-6"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg border border-sage/20 bg-sage/[0.08] text-sage">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <h3 className="mt-4 text-[14px] font-medium text-white">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-muted">
                      {t(feature.descriptionKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-t border-line/50 py-20">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[540px]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
                  {t("landing.workflowEyebrow")}
                </p>
                <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-white sm:text-[34px]">
                  {t("landing.workflowTitle")}
                </h2>
              </div>
              <p className="max-w-[380px] text-[12.5px] leading-relaxed text-muted">
                {t("landing.workflowIntro")}
              </p>
            </div>

            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <li key={step.titleKey} className="card-surface rounded-xl p-5">
                  <span className="text-[11px] font-semibold tracking-[0.18em] text-sage/60">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-[13.5px] font-medium text-white">
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">
                    {t(step.descriptionKey)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="why" className="border-t border-line/50 py-20">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
                  {t("landing.whyEyebrow")}
                </p>
                <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.02em] text-white sm:text-[34px]">
                  {t("landing.whyTitle")}
                </h2>
                <p className="mt-3 max-w-[460px] text-[13.5px] leading-relaxed text-muted">
                  {t("landing.whyIntro")}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { title: "landing.why1Title", desc: "landing.why1Desc" },
                  { title: "landing.why2Title", desc: "landing.why2Desc" },
                  { title: "landing.why3Title", desc: "landing.why3Desc" },
                  { title: "landing.why4Title", desc: "landing.why4Desc" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-line bg-white/[0.02] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <CheckIcon className="h-4 w-4 shrink-0 text-sage" />
                      <h3 className="text-[12.5px] font-medium text-white">
                        {t(item.title)}
                      </h3>
                    </div>
                    <p className="mt-1.5 pl-6 text-[11px] leading-relaxed text-muted">
                      {t(item.desc)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-line/50 py-20">
          <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
            <div className="card-surface relative overflow-hidden rounded-2xl px-6 py-12 text-center sm:px-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 w-[520px] rounded-full bg-sage/[0.08] blur-3xl"
              />
              <p className="relative text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
                {t("landing.ctaEyebrow")}
              </p>
              <h2 className="relative mx-auto mt-3 max-w-[620px] text-[28px] font-semibold tracking-[-0.02em] text-white sm:text-[34px]">
                {t("landing.ctaTitle")}
              </h2>
              <p className="relative mx-auto mt-3 max-w-[520px] text-[13px] leading-relaxed text-muted">
                {t("landing.ctaIntro")}
              </p>
              <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className="btn-primary">
                  {t("landing.ctaButton")}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn-secondary">
                  {t("landing.signIn")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-line/50 px-5 py-8 sm:px-8">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <div className="flex flex-col gap-1 text-[10.5px] text-muted/60 sm:items-end">
            <span>{t("landing.footer")}</span>
            <span>{t("demo.workspace")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
