import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { cn } from "../../lib/cn.js";
import { formatDate } from "../../lib/format.js";
import { useRecruiterApplicationsIndex, type IndexedApplication } from "../../hooks/useRecruiterApplicationsIndex.js";
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

const PAGE_SIZE = 10;

/**
 * The backend has no cross-job "all my applications" endpoint for
 * recruiters — every application list is scoped to a single job. This page
 * aggregates across the recruiter's own jobs (useRecruiterApplicationsIndex)
 * and filters/sorts/paginates the merged, real result client-side.
 */
export function Applications(): JSX.Element {
  const { applications, isLoading, error, refetch } = useRecruiterApplicationsIndex();
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = applications;
    if (statusFilter !== "ALL") {
      items = items.filter((a) => a.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (a) =>
          a.candidate.name.toLowerCase().includes(q) ||
          a.candidate.email.toLowerCase().includes(q) ||
          a.job.title.toLowerCase().includes(q)
      );
    }
    return [...items].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [applications, statusFilter, search]);

  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: TableColumn<IndexedApplication>[] = [
    {
      key: "candidate",
      header: "Candidate",
      render: (a) => (
        <div>
          <p className="font-medium text-navy-800">{a.candidate.name}</p>
          <p className="text-xs text-navy-500">{a.candidate.email}</p>
        </div>
      ),
    },
    { key: "job", header: "Job", render: (a) => a.job.title },
    { key: "applied", header: "Applied Date", render: (a) => formatDate(a.appliedAt) },
    { key: "status", header: "Current Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "updated", header: "Updated Date", render: (a) => formatDate(a.updatedAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (a) => (
        <Link
          to={`/recruiter/applications/${a.id}`}
          className="text-sm font-medium text-accent-600 hover:text-accent-700"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <AppShell title="Applications">
      <PageHeader
        title="Applications"
        description="Every candidate who has applied to your jobs."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={cn(
                "focus-ring shrink-0 rounded-md px-3 py-1.5 text-sm font-medium",
                statusFilter === tab.value
                  ? "bg-navy-900 text-white"
                  : "bg-surface-muted text-navy-600 hover:bg-surface-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Search candidate or job"
            leadingIcon={<SearchIcon className="h-4 w-4" />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {error ? (
        <ErrorState description={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="Try a different filter or search term."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Table columns={columns} data={pageItems} rowKey={(a) => a.id} />
          </div>
          {/* Mobile cards */}
          <div className="divide-y divide-surface-border sm:hidden">
            {pageItems.map((a) => (
              <Link
                key={a.id}
                to={`/recruiter/applications/${a.id}`}
                className="block p-4 hover:bg-surface-muted"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-navy-800">{a.candidate.name}</p>
                    <p className="text-xs text-navy-500">{a.job.title}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <p className="mt-2 text-xs text-navy-400">Applied {formatDate(a.appliedAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
      )}
    </AppShell>
  );
}
