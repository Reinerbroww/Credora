"use client";

import { useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

const OPTIONS: Array<{ value: Locale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "id", label: "ID" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("topbar.language")}
      className={cn(
        "inline-flex items-center rounded-lg border border-line bg-white/[0.02] p-0.5",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setLocale(option.value)}
            aria-pressed={active}
            className={cn(
              "rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors",
              active ? "bg-sage/15 text-sage" : "text-muted hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
