"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n";
import type {
  ApplicationStatus,
  FinalDecision,
  ReviewStatus,
  RiskCategory,
} from "@/lib/types";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card-surface rounded-xl", className)}>{children}</div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-sage/80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[22px] font-semibold tracking-tight text-white sm:text-[26px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <Card className={className}>
      <div className="flex items-start justify-between gap-3 border-b border-line-soft px-5 py-4">
        <div>
          <h2 className="text-[13.5px] font-semibold text-white">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[11.5px] text-muted">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </Card>
  );
}

const riskStyles: Record<RiskCategory, string> = {
  "Low Risk": "border-risk-low/30 bg-risk-low/12 text-[#8fd3ab]",
  "Medium Risk": "border-risk-mid/30 bg-risk-mid/12 text-[#f0cf78]",
  "High Risk": "border-risk-high/30 bg-risk-high/12 text-[#f3938f]",
};

const riskDots: Record<RiskCategory, string> = {
  "Low Risk": "bg-risk-low",
  "Medium Risk": "bg-risk-mid",
  "High Risk": "bg-risk-high",
};

export function RiskBadge({
  category,
  className,
}: {
  category: RiskCategory;
  className?: string;
}) {
  const { risk } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        riskStyles[category],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", riskDots[category])} />
      {risk(category)}
    </span>
  );
}

const statusStyles: Record<ApplicationStatus, string> = {
  "Pending Review": "border-line bg-white/[0.04] text-muted",
  Assessed: "border-sage/25 bg-sage/10 text-sage",
  "Under Review": "border-risk-mid/25 bg-risk-mid/10 text-[#f0cf78]",
  Approved: "border-risk-low/25 bg-risk-low/10 text-[#8fd3ab]",
  Rejected: "border-risk-high/25 bg-risk-high/10 text-[#f3938f]",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { status: translate } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        statusStyles[status],
      )}
    >
      {translate(status)}
    </span>
  );
}

const reviewStyles: Record<ReviewStatus, string> = {
  Pending: "border-line bg-white/[0.04] text-muted",
  "In Review": "border-risk-mid/25 bg-risk-mid/10 text-[#f0cf78]",
  Completed: "border-sage/25 bg-sage/10 text-sage",
};

export function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  const { reviewStatus } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        reviewStyles[status],
      )}
    >
      {reviewStatus(status)}
    </span>
  );
}

const decisionStyles: Record<FinalDecision, string> = {
  Approved: "border-risk-low/25 bg-risk-low/10 text-[#8fd3ab]",
  Rejected: "border-risk-high/25 bg-risk-high/10 text-[#f3938f]",
  "Manual Review": "border-risk-mid/25 bg-risk-mid/10 text-[#f0cf78]",
};

export function DecisionBadge({ decision }: { decision: FinalDecision }) {
  const { decision: translate } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        decisionStyles[decision],
      )}
    >
      {translate(decision)}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: "default" | "sage" | "warning" | "danger";
}) {
  const iconTone: Record<string, string> = {
    default: "border-line bg-white/[0.03] text-muted",
    sage: "border-sage/25 bg-sage/10 text-sage",
    warning: "border-risk-mid/25 bg-risk-mid/10 text-risk-mid",
    danger: "border-risk-high/25 bg-risk-high/10 text-risk-high",
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11.5px] font-medium text-muted">{label}</p>
          <p className="stat-number mt-2 text-[26px] font-semibold leading-none text-white">
            {value}
          </p>
          {hint && <p className="mt-2 text-[11px] text-muted/80">{hint}</p>}
        </div>
        <span
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg border",
            iconTone[tone],
          )}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sage/20 bg-sage/10 text-[12px] font-semibold text-sage",
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-line bg-white/[0.03] text-muted">
        {icon}
      </span>
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function InfoTip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "group/info relative inline-flex shrink-0 align-middle",
        className,
      )}
    >
      <span
        tabIndex={0}
        role="note"
        aria-label={text}
        className="grid h-3.5 w-3.5 cursor-help place-items-center rounded-full border border-line text-[8px] font-semibold leading-none text-muted transition-colors hover:border-sage/40 hover:text-sage focus:outline-none focus-visible:border-sage/50 focus-visible:text-sage"
      >
        i
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-60 -translate-x-1/2 rounded-lg border border-line bg-[#0f1712] px-3 py-2 text-left text-[11px] font-normal leading-relaxed text-[#d6e0d9] opacity-0 shadow-xl shadow-black/50 transition-opacity duration-150 group-hover/info:opacity-100 group-focus-within/info:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

export function FieldLabel({
  htmlFor,
  hint,
  children,
}: {
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="label flex items-center gap-1.5">
      <span>{children}</span>
      {hint && <InfoTip text={hint} />}
    </label>
  );
}

export function InfoRow({
  label,
  value,
  mono = false,
  hint,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line-soft py-2.5 last:border-b-0">
      <span className="flex items-center gap-1.5 text-[12px] text-muted">
        {label}
        {hint && <InfoTip text={hint} />}
      </span>
      <span
        className={cn(
          "text-right text-[12.5px] font-medium text-white",
          mono && "font-mono text-[11.5px]",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function DemoBanner({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-sage/15 bg-sage/[0.06] px-3.5 py-2.5",
        className,
      )}
    >
      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
      <p className="text-[11.5px] leading-relaxed text-muted">
        <span className="font-medium text-sage">{t("demo.workspace")}</span>{" "}
        {t("demo.desc")}
      </p>
    </div>
  );
}
