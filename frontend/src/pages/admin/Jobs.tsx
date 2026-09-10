import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { StatusBadge } from "../../components/ui/StatusBadge.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { useAdminJobs } from "../../hooks/useAdminJobs.js";
import { formatDate } from "../../lib/format.js";
import type { AdminJobListItem, JobStatus } from "../../types/index.js";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
];

export function Jobs(): JSX.Element {
  const { jobs, pagination, filters, updateFilters, isLoading, error, refetch } = useAdminJobs();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: FormEvent): void => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const columns: TableColumn<AdminJobListItem>[] = [
    {
      key: "title",
      header: "Job",
      render: (job) => (
        <Link to={`/admin/jobs/${job.id}`} className="font-medium text-navy-800 hover:text-accent-700">
          {job.title}
        </Link>
      ),
    },
    { key: "company", header: "Company", render: (job) => job.company.name },
    { key: "recruiter", header: "Recruiter", render: (job) => job.recruiter.name },
    { key: "location", header: "Location", render: (job) => job.location },
    { key: "status", header: "Status", render: (job) => <StatusBadge status={job.status} /> },
    { key: "applications", header: "Applications", render: (job) => job.applicationCount },
    { key: "created", header: "Created", render: (job) => formatDate(job.createdAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (job) => (
        <Link to={`/admin/jobs/${job.id}`} className="text-sm font-medium text-accent-600 hover:text-accent-700">
          View
        </Link>
      ),
    },
  ];

  return (
    <AppShell title="Jobs">
      <PageHeader title="Jobs" description="Every job posted across HireLynk." />

      <form
        onSubmit={handleSearchSubmit}
        className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by title, description, or company"
            leadingIcon={<SearchIcon className="h-4 w-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Status"
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={filters.status ?? ""}
            onChange={(e) => updateFilters({ status: (e.target.value as JobStatus) || undefined })}
          />
        </div>
        <Button type="submit" className="sm:w-auto">
          Search
        </Button>
      </form>

      <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
        {error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : isLoading ? (
          <table className="w-full text-left text-sm">
            <tbody>
              <SkeletonTableRows rows={6} cols={8} />
            </tbody>
          </table>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs match your filters" />
        ) : (
          <Table columns={columns} data={jobs} rowKey={(job) => job.id} />
        )}
      </div>

      {!isLoading && !error && pagination && jobs.length > 0 && (
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
