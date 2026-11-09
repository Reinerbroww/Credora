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
import { useSearch } from "@/lib/search";
import { useCredora } from "@/lib/store";
import type { ApplicationStatus, RiskCategory } from "@/lib/types";

const PAGE_SIZE = 8;

type RiskFilter = "all" | RiskCategory | "unassessed";

export default function ApplicationsPage() {
  const { applications, assessments } = useCredora();
  const { query: search, setQuery: setSearch } = useSearch();
  const [status, setStatus] = useState<ApplicationStatus | "all">("all");
  const [risk, setRisk] = useState<RiskFilter>("all");
  const [page, setPage] = useState(1);

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
        eyebrow="Credit operations"
        title="Application Management"
        description="Create, search, and track customer credit applications. Assessment results are attached to each application as a history."
        actions={
          <Link href="/applications/new" className="btn-primary">
            <PlusIcon className="h-4 w-4" />
            Add Application
          </Link>
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
              placeholder="Search by applicant name, email, or application ID..."
              className="field pl-9"
              aria-label="Search applications"
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
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                {APPLICATION_STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
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
              aria-label="Filter by risk category"
            >
              <option value="all">All risk levels</option>
              <option value="Low Risk">Low Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="High Risk">High Risk</option>
              <option value="unassessed">Not assessed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <p className="text-[11.5px] text-muted">
            <span className="font-medium text-white">{filtered.length}</span>{" "}
            application{filtered.length === 1 ? "" : "s"} found
          </p>
          {hasFilters && (
            <button type="button" onClick={resetFilters} className="btn-ghost">
              Clear filters
            </button>
          )}
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<FolderIcon className="h-5 w-5" />}
            title="No applications match"
            description="Adjust the search term or filters, or create a new credit application."
            action={
              hasFilters ? (
                <button type="button" onClick={resetFilters} className="btn-secondary">
                  Reset filters
                </button>
              ) : (
                <Link href="/applications/new" className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  Add Application
                </Link>
              )
            }
          />
        ) : (
          <ApplicationTable applications={visible} assessments={assessments} />
        )}

        {filtered.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-line-soft px-4 py-3 sm:flex-row">
            <p className="text-[11.5px] text-muted">
              Showing{" "}
              <span className="font-medium text-white">
                {start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)}
              </span>{" "}
              of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
                className="btn-secondary px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <span className="text-[11.5px] text-muted">
                Page <span className="font-medium text-white">{currentPage}</span> of{" "}
                {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                disabled={currentPage === totalPages}
                className="btn-secondary px-2.5 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
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
