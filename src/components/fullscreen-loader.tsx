"use client";

import { Logo } from "@/components/logo";
import { useI18n } from "@/lib/i18n";

export function FullscreenLoader() {
  const { t } = useI18n();

  return (
    <div className="app-shell-bg grid min-h-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage" />
          {t("loader.preparing")}
        </div>
      </div>
    </div>
  );
}
