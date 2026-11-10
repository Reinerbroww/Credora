let activeLocale: "en" | "id" = "en";

export function setFormatLocale(locale: "en" | "id"): void {
  activeLocale = locale;
}

export function getFormatLocale(): "en" | "id" {
  return activeLocale;
}

function dateLocale(): string {
  return activeLocale === "id" ? "id-ID" : "en-GB";
}

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const compactCurrencyFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatCompactCurrency(value: number): string {
  return `Rp ${compactCurrencyFormatter.format(value)}`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return new Intl.DateTimeFormat(dateLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = new Date(iso);
  return new Intl.DateTimeFormat(dateLocale(), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function relativeDays(iso: string): string {
  const date = new Date(iso);
  const now = new Date("2026-11-06T09:00:00.000Z");
  const diff = Math.round((now.getTime() - date.getTime()) / 86_400_000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 30) return `${diff} days ago`;
  const months = Math.round(diff / 30);
  return `${months} ${months === 1 ? "month" : "months"} ago`;
}

export function shortId(id: string): string {
  return id.slice(-6).toUpperCase();
}

export function displayId(id: string): string {
  return `CRD-${id.replace(/-/g, "").slice(-8).toUpperCase()}`;
}
