"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/icons";
import { RiskBadge, StatusBadge } from "@/components/ui";
import { latestAssessments } from "@/lib/analytics";
import {
  displayId,
  formatCurrency,
  formatDate,
} from "@/lib/format";
import type { Application, RiskAssessment } from "@/lib/types";

export function ApplicationTable({
  applications,
  assessments,
  showApplicant = true,
}: {
  applications: Application[];
  assessments: RiskAssessment[];
  showApplicant?: boolean;
}) {
  const latest = latestAssessments(assessments);

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>Application ID</th>
            {showApplicant && <th>Applicant</th>}
            <th>Applied</th>
            <th>Loan amount</th>
            <th>Status</th>
            <th>Risk category</th>
            <th className="text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => {
            const assessment = latest.get(application.id);
            return (
              <tr key={application.id}>
                <td>
                  <Link
                    href={`/applications/${application.id}`}
                    className="font-mono text-[11.5px] font-medium text-sage transition-colors hover:text-sage-bright"
                  >
                    {displayId(application.id)}
                  </Link>
                </td>
                {showApplicant && (
                  <td>
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-sage/15 bg-sage/[0.08] text-[10px] font-semibold text-sage">
                        {application.applicant_name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium text-white">
                          {application.applicant_name}
                        </p>
                        <p className="truncate text-[10.5px] text-muted">
                          {application.applicant_email}
                        </p>
                      </div>
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap text-muted">
                  {formatDate(application.created_at)}
                </td>
                <td className="stat-number whitespace-nowrap">
                  {formatCurrency(application.loan_amnt)}
                </td>
                <td>
                  <StatusBadge status={application.status} />
                </td>
                <td>
                  {assessment ? (
                    <RiskBadge category={assessment.risk_category} />
                  ) : (
                    <span className="text-[11.5px] text-muted/70">
                      Not assessed
                    </span>
                  )}
                </td>
                <td className="text-right">
                  <Link
                    href={`/applications/${application.id}`}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-sage transition-colors hover:text-sage-bright"
                  >
                    View
                    <ChevronRightIcon className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
