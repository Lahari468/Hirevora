import { useState, type FormEvent } from "react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { useAuditLogs } from "../../hooks/useAuditLogs.js";
import { formatDateTime } from "../../lib/format.js";
import type { AdminAuditLogItem, AuditAction } from "../../types/index.js";

/** Real enum values from backend/prisma/schema.prisma AuditAction. */
const ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: "LOGIN", label: "Login" },
  { value: "JOB_CREATED", label: "Job created" },
  { value: "JOB_UPDATED", label: "Job updated" },
  { value: "JOB_PUBLISHED", label: "Job published" },
  { value: "APPLICATION_CREATED", label: "Application created" },
  { value: "APPLICATION_STATUS_CHANGED", label: "Application status changed" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview scheduled" },
  { value: "USER_SUSPENDED", label: "User suspended" },
  { value: "REPORT_CREATED", label: "Report created" },
  { value: "REPORT_REVIEWED", label: "Report reviewed" },
  { value: "REPORT_RESOLVED", label: "Report resolved" },
  { value: "REPORT_DISMISSED", label: "Report dismissed" },
];

export function AuditLogs(): JSX.Element {
  const { logs, pagination, filters, updateFilters, isLoading, error, refetch } = useAuditLogs();
  const [entityTypeInput, setEntityTypeInput] = useState("");

  const handleEntityTypeSubmit = (e: FormEvent): void => {
    e.preventDefault();
    updateFilters({ entityType: entityTypeInput || undefined });
  };

  const columns: TableColumn<AdminAuditLogItem>[] = [
    { key: "timestamp", header: "Timestamp", render: (log) => formatDateTime(log.createdAt) },
    { key: "actor", header: "Actor", render: (log) => log.user?.name ?? "System" },
    {
      key: "action",
      header: "Action",
      render: (log) => <span className="font-mono text-xs text-navy-700">{log.action}</span>,
    },
    { key: "entity", header: "Entity", render: (log) => log.entityType },
    {
      key: "entityId",
      header: "Entity ID",
      render: (log) => (
        <span className="font-mono text-xs text-navy-500">{log.entityId ? log.entityId.slice(0, 8) : "—"}</span>
      ),
    },
  ];

  return (
    <AppShell title="Audit Logs">
      <PageHeader title="Audit Logs" description="A record of significant actions across the platform." />

      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end">
        <div className="w-full sm:w-64">
          <Select
            label="Action"
            placeholder="All actions"
            options={ACTION_OPTIONS}
            value={filters.action ?? ""}
            onChange={(e) => updateFilters({ action: e.target.value || undefined })}
          />
        </div>
        <form onSubmit={handleEntityTypeSubmit} className="flex flex-1 items-end gap-3">
          <div className="flex-1">
            <Input
              label="Entity type"
              placeholder="e.g. Job, Report, User"
              value={entityTypeInput}
              onChange={(e) => setEntityTypeInput(e.target.value)}
            />
          </div>
          <Button type="submit">Filter</Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-card">
        {error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : isLoading ? (
          <table className="w-full text-left text-sm">
            <tbody>
              <SkeletonTableRows rows={8} cols={5} />
            </tbody>
          </table>
        ) : logs.length === 0 ? (
          <EmptyState title="No audit log entries match your filters" />
        ) : (
          <Table columns={columns} data={logs} rowKey={(log) => log.id} />
        )}
      </div>

      {!isLoading && !error && pagination && logs.length > 0 && (
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
