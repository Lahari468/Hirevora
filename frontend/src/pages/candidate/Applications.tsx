import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { Button } from "../../components/ui/Button.js";
import { cn } from "../../lib/cn.js";
import { formatDate } from "../../lib/format.js";
import { useApplications } from "../../hooks/useApplications.js";
import type { ApplicationStatus } from "../../types/index.js";

const STATUS_TABS: { value: ApplicationStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCREENING", label: "Screening" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "OFFER", label: "Offer" },
  { value: "HIRED", label: "Hired" },
  { value: "REJECTED", label: "Rejected" },
];

export function Applications(): JSX.Element {
  const { applications, pagination, filters, updateFilters, isLoading, error, refetch } =
    useApplications();

  const activeStatus = filters.status ?? "ALL";

  return (
    <AppShell title="Applications">
      <PageHeader title="Applications" description="Track every job you've applied to." />

      <div className="mb-4 flex flex-wrap gap-1.5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() =>
              updateFilters({ status: tab.value === "ALL" ? undefined : tab.value })
            }
            className={cn(
              "focus-ring shrink-0 rounded-md px-3 py-1.5 text-sm font-medium",
              activeStatus === tab.value
                ? "bg-navy-900 text-white"
                : "bg-surface-muted text-navy-600 hover:bg-surface-border"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <ErrorState description={error} onRetry={refetch} />}

      {!error && !isLoading && applications.length === 0 && (
        <EmptyState
          title="No applications here yet"
          description="Applications you submit will show up in this list."
          action={
            <Link to="/candidate/jobs">
              <Button size="sm">Find jobs</Button>
            </Link>
          }
        />
      )}

      {!error && (isLoading || applications.length > 0) && (
        <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
          {/* Desktop table */}
          <table className="hidden w-full text-left text-sm sm:table">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-navy-400">
                  Job
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-navy-400">
                  Applied
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-navy-400">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-navy-400">
                  Updated
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonTableRows rows={5} cols={5} />
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="border-b border-surface-border last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-navy-800">{app.job?.title}</p>
                      <p className="text-xs text-navy-500">{app.job?.company.name}</p>
                    </td>
                    <td className="px-4 py-3 text-navy-600">{formatDate(app.appliedAt)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="px-4 py-3 text-navy-600">{formatDate(app.updatedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/candidate/applications/${app.id}`}
                        className="focus-ring rounded text-sm font-medium text-accent-600 hover:text-accent-700"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="divide-y divide-surface-border sm:hidden">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse space-y-2 p-4">
                    <div className="h-4 w-2/3 rounded bg-surface-muted" />
                    <div className="h-3 w-1/3 rounded bg-surface-muted" />
                  </div>
                ))
              : applications.map((app) => (
                  <Link
                    key={app.id}
                    to={`/candidate/applications/${app.id}`}
                    className="block p-4 hover:bg-surface-muted"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-navy-800">{app.job?.title}</p>
                        <p className="text-xs text-navy-500">{app.job?.company.name}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="mt-2 text-xs text-navy-400">
                      Applied {formatDate(app.appliedAt)}
                    </p>
                  </Link>
                ))}
          </div>
        </div>
      )}

      {!error && !isLoading && pagination && applications.length > 0 && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.limit}
          total={pagination.total}
          onPageChange={(page) => updateFilters({ page })}
        />
      )}
    </AppShell>
  );
}
