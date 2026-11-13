"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { LogoutIcon, SparkIcon } from "@/components/icons";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useCredora();
  const { t } = useI18n();

  const handleLogout = async () => {
    await logout();
    onNavigate?.();
    router.replace("/login");
  };

  return (
    <div className="sidebar-surface flex h-full w-full flex-col border-r border-line">
      <div className="px-5 pb-5 pt-5">
        <Link href="/dashboard" onClick={onNavigate} className="inline-flex">
          <Logo />
        </Link>
      </div>

      <div className="mx-4 rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2.5">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-sage/70">
          {t("sidebar.workspace")}
        </p>
        <p className="mt-1 truncate text-[12.5px] font-medium text-white">
          {session?.organization_name ?? "Nusantara PayLater"}
        </p>
        <p className="mt-0.5 text-[10.5px] text-muted">
          {t("sidebar.orgSubtitle")}
        </p>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted/70">
          {t("sidebar.navigation")}
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12.5px] font-medium transition-colors",
                    active
                      ? "border border-sage/20 bg-sage/12 text-sage"
                      : "border border-transparent text-[#c5d0c9] hover:bg-white/[0.05] hover:text-white",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[17px] w-[17px]",
                      active ? "text-sage" : "text-muted group-hover:text-white",
                    )}
                  />
                  <span className="truncate">{t(item.labelKey)}</span>
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sage" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-4 px-3">
        <div className="rounded-lg border border-line/70 bg-black/20 p-3">
          <div className="flex items-center gap-2">
            <SparkIcon className="h-3.5 w-3.5 text-sage" />
            <p className="text-[11px] font-medium text-white">{t("sidebar.riskEngine")}</p>
            <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-risk-low" />
              {t("sidebar.online")}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-[12.5px] font-medium text-muted transition-colors hover:bg-risk-high/10 hover:text-[#f3938f]"
        >
          <LogoutIcon className="h-[17px] w-[17px]" />
          {t("sidebar.logout")}
        </button>
        <p className="mt-2 px-3 text-[9.5px] leading-relaxed text-muted/55">
          {t("common.tagline")}
        </p>
      </div>
    </div>
  );
}
