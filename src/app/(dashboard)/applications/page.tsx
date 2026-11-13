"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ApplicationTable } from "@/components/application-table";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
} from "@/components/icons";
import {
  Card,
  EmptyState,
  PageHeader,
} from "@/components/ui";
import { APPLICATION_STATUSES, latestAssessments } from "@/lib/analytics";
import { displayId } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useSearch } from "@/lib/search";
import { useCredora } from "@/lib/store";
import type { ApplicationStatus, RiskCategory } from "@/lib/types";

const PAGE_SIZE = 8;

type RiskFilter = "all" | RiskCategory | "unassessed";

export default function ApplicationsPage() {
  const { applications, assessments, session } = useCredora();
  const { query: search, setQuery: setSearch } = useSearch();
  const { t, status: translateStatus, risk: translateRisk } = useI18n();
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [page, setPage] = useState(1);
  const canCreate = session?.role === "Risk Analyst";

  const latest = useMemo(() => latestAssessments(assessments), [assessments]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return [...applications]
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .filter((application) => {
        if (status !== "all" && application.status !== status) return false;

        const assessment = latest.get(application.id);
        if (risk === "unassessed" && assessment) return false;
        if (risk !== "all" && risk !== "unassessed" && assessment?.risk_category !== risk) {
          return false;
        }

        if (!term) return true;
        return (
          application.applicant_name.toLowerCase().includes(term) ||
          application.applicant_email.toLowerCase().includes(term) ||
          displayId(application.id).toLowerCase().includes(term) ||
          application.id.toLowerCase().includes(term)
        );
      });
  }, [applications, latest, search, status, risk]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const hasFilters = search.trim() !== "" || status !== "all" || risk !== "all";

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setRisk("all");
    setPage(1);
  };

  return (
    <div className="fade-in space-y-5">
      <PageHeader
        eyebrow={t("apps.eyebrow")}
        title={t("apps.title")}
        description={t("apps.description")}
        actions={
          canCreate ? (
            <Link href="/applications/new" className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              {t("apps.add")}
            </Link>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-line-soft p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={t("apps.searchPlaceholder")}
              className="field pl-9"
              aria-label={t("apps.searchAria")}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <FilterIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as ApplicationStatus | "all");
                  setPage(1);
                }}
                className="field min-w-[160px] pl-8"
                aria-label={t("apps.filterStatusAria")}
              >
                <option value="all">{t("apps.allStatuses")}</option>
                {APPLICATION_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {translateStatus(option)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={risk}
              onChange={(event) => {
                setRisk(event.target.value as RiskFilter);
                setPage(1);
              }}
              className="field min-w-[150px]"
              aria-label={t("apps.filterRiskAria")}
            >
              <option value="all">{t("apps.allRisk")}</option>
              <option value="Low Risk">{translateRisk("Low Risk")}</option>
              <option value="Medium Risk">{translateRisk("Medium Risk")}</option>
              <option value="High Risk">{translateRisk("High Risk")}</option>
              <option value="unassessed">{t("apps.notAssessed")}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <p className="text-[11.5px] text-muted">
            {t("apps.found", { count: filtered.length })}
          </p>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="btn-ghost">
              {t("apps.clearFilters")}
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<FolderIcon className="h-5 w-5" />}
            title={t("apps.noMatchTitle")}
            description={t("apps.noMatchDesc")}
            action={
              hasFilters ? (
                <button type="button" onClick={resetFilters} className="btn-secondary">
                  {t("apps.resetFilters")}
                </button>
              ) : canCreate ? (
                <Link href="/applications/new" className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  {t("apps.add")}
                </Link>
              ) : undefined
            }
          />
        ) : (
          <ApplicationTable applications={visible} assessments={assessments} />
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-line-soft px-4 py-3 sm:flex-row">
            <p className="text-[11.5px] text-muted">
              {t("apps.showing", {
                start: start + 1,
                end: Math.min(start + PAGE_SIZE, filtered.length),
                total: filtered.length,
              })}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="btn-secondary px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t("apps.prev")}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-[11.5px] text-muted">
                {t("apps.pageOf", { page: currentPage, total: totalPages })}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-secondary px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t("apps.next")}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
