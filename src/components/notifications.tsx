"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertIcon,
  BellIcon,
  CheckIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
} from "@/components/icons";
import { latestAssessments, latestReviews } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";
import { useCredora } from "@/lib/store";

const TONE_CLASSES: Record<string, string> = {
  warning: "border-risk-mid/20 bg-risk-mid/10 text-risk-mid",
  sage: "border-sage/20 bg-sage/[0.08] text-sage",
  low: "border-risk-low/20 bg-risk-low/10 text-risk-low",
};

export function NotificationsMenu() {
  const { applications, assessments, reviews } = useCredora();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const latestAssessmentMap = latestAssessments(assessments);
  const latestReviewMap = latestReviews(reviews);

  const unassessed = applications.filter(
    (application) => !latestAssessmentMap.has(application.id),
  ).length;
  const awaitingReview = applications.filter(
    (application) =>
      latestAssessmentMap.has(application.id) &&
      latestReviewMap.get(application.id)?.review_status !== "Completed",
  ).length;
  const completed = applications.filter(
    (application) =>
      latestReviewMap.get(application.id)?.review_status === "Completed",
  ).length;
  const pending = unassessed + awaitingReview;

  const notices: Array<{
    id: string;
    title: string;
    description: string;
    href: string;
    tone: keyof typeof TONE_CLASSES;
    icon: typeof AlertIcon;
  }> = [];

  if (unassessed > 0) {
    notices.push({
      id: "assessments",
      title: t("notif.assessmentsPending"),
      description: t("notif.assessmentsPendingDesc", { count: unassessed }),
      href: "/applications",
      tone: "warning",
      icon: AlertIcon,
    });
  }

  if (awaitingReview > 0) {
    notices.push({
      id: "reviews",
      title: t("notif.queueTitle"),
      description: t("notif.queueDesc", { count: awaitingReview }),
      href: "/underwriting",
      tone: "sage",
      icon: ClipboardCheckIcon,
    });
  }

  if (completed > 0) {
    notices.push({
      id: "completed",
      title: t("notif.reviewsRecorded"),
      description: t("notif.reviewsRecordedDesc", { count: completed }),
      href: "/underwriting",
      tone: "low",
      icon: CheckIcon,
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={
          pending > 0
            ? t("notif.ariaPending", { count: pending })
            : t("notif.aria")
        }
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="notifications-panel"
        className={cn(
          "relative grid h-9 w-9 place-items-center rounded-lg border text-muted transition-colors",
          open
            ? "border-sage/30 bg-white/[0.04] text-white"
            : "border-line hover:text-white",
        )}
      >
        <BellIcon className="h-[17px] w-[17px]" />
        {pending > 0 && (
          <span className="absolute -right-1.5 -top-1.5 min-w-[16px] rounded-full bg-risk-mid px-1 text-center text-[9px] font-semibold leading-4 text-near-black ring-2 ring-near-black">
            {pending > 9 ? "9+" : pending}
          </span>
        )}
      </button>

      {open && (
        <div
          id="notifications-panel"
          className="fade-in fixed inset-x-4 top-[68px] z-50 overflow-hidden rounded-xl border border-line bg-[#161d19] shadow-2xl shadow-black/50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[340px]"
        >
          <div className="flex items-center justify-between border-b border-line-soft px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">
                {t("notif.title")}
              </p>
              <p className="mt-0.5 text-[11.5px] font-medium text-white">
                {t("notif.workspaceActivity")}
              </p>
            </div>
            <span className="rounded-full border border-line bg-white/[0.02] px-2 py-0.5 text-[10px] text-muted">
              {pending > 0
                ? t("notif.pendingCount", { count: pending })
                : t("notif.allClear")}
            </span>
          </div>

          <div className="divide-y divide-line-soft">
            {notices.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-risk-low/20 bg-risk-low/10 text-risk-low">
                  <CheckIcon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[12px] font-medium text-white">
                  {t("notif.allCaught")}
                </p>
                <p className="mt-1 text-[10.5px] text-muted">
                  {t("notif.noPending")}
                </p>
              </div>
            ) : (
              notices.map((notice) => {
                const Icon = notice.icon;
                return (
                  <Link
                    key={notice.id}
                    href={notice.href}
                    onClick={() => setOpen(false)}
                    className="group flex gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border",
                        TONE_CLASSES[notice.tone],
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[12px] font-medium text-white">
                        {notice.title}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">
                        {notice.description}
                      </span>
                    </span>
                    <ChevronRightIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-muted/50 transition-colors group-hover:text-sage" />
                  </Link>
                );
              })
            )}
          </div>

          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 text-[11px] font-medium text-muted transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            {t("notif.openDashboard")}
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
