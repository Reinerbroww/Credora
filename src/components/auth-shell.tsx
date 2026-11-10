"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";

interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  const { t } = useI18n();

  return (
    <div className="app-shell-bg relative flex min-h-screen flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-sage/[0.06] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-forest/25 blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-6 sm:px-8">
        <Link href="/" aria-label={t("landing.home")}>
          <Logo />
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-[440px]">
          <div className="card-surface rounded-2xl p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sage/80">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
              {subtitle}
            </p>

            <div className="mt-6">{children}</div>
          </div>

          {footer && <div className="mt-5 text-center">{footer}</div>}
        </div>
      </main>

      <footer className="relative z-10 px-5 py-6 text-center text-[10px] text-muted/50 sm:px-8">
        {t("login.footer")}
      </footer>
    </div>
  );
}
