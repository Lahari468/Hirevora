import { Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Select } from "../../components/ui/Select.js";
import { Badge } from "../../components/ui/Badge.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { useAdminReports } from "../../hooks/useAdminReports.js";
import { formatDate } from "../../lib/format.js";
import type { AdminReport, ReportStatus, ReportTargetType } from "../../types/index.js";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "REVIEWING", label: "Reviewing" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

const TARGET_TYPE_OPTIONS = [
  { value: "JOB", label: "Job" },
  { value: "USER", label: "User" },
  { value: "APPLICATION", label: "Application" },
  { value: "MESSAGE", label: "Message" },
  { value: "FEEDBACK", label: "Feedback" },
];

const STATUS_VARIANT: Record<ReportStatus, "warning" | "info" | "success" | "neutral"> = {
  PENDING: "warning",
  REVIEWING: "info",
  RESOLVED: "success",
  DISMISSED: "neutral",
};

export function Reports(): JSX.Element {
  const { reports, pagination, filters, updateFilters, isLoading, error, refetch } = useAdminReports();

  const columns: TableColumn<AdminReport>[] = [
    {
      key: "id",
      header: "Report ID",
      render: (r) => <span className="font-mono text-xs text-navy-500">{r.id.slice(0, 8)}</span>,
    },
    { key: "target", header: "Target", render: (r) => `${r.targetType} · ${r.targetId.slice(0, 8)}` },
    { key: "reason", header: "Reason", render: (r) => r.reason.replace(/_/g, " ") },
    {
      key: "status",
      header: "Status",
      render: (r) => <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>,
    },
    { key: "created", header: "Created", render: (r) => formatDate(r.createdAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <Link to={`/admin/reports/${r.id}`} className="text-sm font-medium text-accent-600 hover:text-accent-700">
          Review
        </Link>
      ),
    },
  ];

  return (
    <AppShell title="Reports">
      <PageHeader title="Reports" description="User-submitted reports awaiting moderation." />

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row">
        <div className="w-full sm:w-48">
          <Select
            label="Status"
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={filters.status ?? ""}
            onChange={(e) => updateFilters({ status: (e.target.value as ReportStatus) || undefined })}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Target type"
            placeholder="All types"
            options={TARGET_TYPE_OPTIONS}
            value={filters.targetType ?? ""}
            onChange={(e) =>
              updateFilters({ targetType: (e.target.value as ReportTargetType) || undefined })
            }
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
        {error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : isLoading ? (
          <table className="w-full text-left text-sm">
            <tbody>
              <SkeletonTableRows rows={6} cols={6} />
            </tbody>
          </table>
        ) : reports.length === 0 ? (
          <EmptyState title="No reports require review" />
        ) : (
          <Table columns={columns} data={reports} rowKey={(r) => r.id} />
        )}
      </div>

      {!isLoading && !error && pagination && reports.length > 0 && (
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
