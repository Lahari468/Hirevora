import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { Select } from "../../components/ui/Select.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { useAdminUsers } from "../../hooks/useAdminUsers.js";
import { formatDate } from "../../lib/format.js";
import type { AdminUserListItem, UserRole } from "../../types/index.js";

const ROLE_OPTIONS = [
  { value: "CANDIDATE", label: "Candidate" },
  { value: "RECRUITER", label: "Recruiter" },
  { value: "ADMIN", label: "Admin" },
];

export function Users(): JSX.Element {
  const { users, pagination, filters, updateFilters, isLoading, error, refetch } = useAdminUsers();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: FormEvent): void => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const columns: TableColumn<AdminUserListItem>[] = [
    {
      key: "name",
      header: "Name",
      render: (u) => (
        <Link to={`/admin/users/${u.id}`} className="font-medium text-navy-800 hover:text-accent-700">
          {u.name}
        </Link>
      ),
    },
    { key: "email", header: "Email", render: (u) => u.email },
    { key: "role", header: "Role", render: (u) => <Badge variant="accent">{u.role}</Badge> },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <Badge variant={u.isActive ? "success" : "neutral"}>{u.isActive ? "Active" : "Inactive"}</Badge>
      ),
    },
    { key: "created", header: "Created", render: (u) => formatDate(u.createdAt) },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (u) => (
        <Link to={`/admin/users/${u.id}`} className="text-sm font-medium text-accent-600 hover:text-accent-700">
          View
        </Link>
      ),
    },
  ];

  return (
    <AppShell title="Users">
      <PageHeader title="Users" description="Everyone with a HireLynk account." />

      <form
        onSubmit={handleSearchSubmit}
        className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by name or email"
            leadingIcon={<SearchIcon className="h-4 w-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            label="Role"
            placeholder="All roles"
            options={ROLE_OPTIONS}
            value={filters.role ?? ""}
            onChange={(e) => updateFilters({ role: (e.target.value as UserRole) || undefined })}
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
              <SkeletonTableRows rows={6} cols={6} />
            </tbody>
          </table>
        ) : users.length === 0 ? (
          <EmptyState title="No users match your filters" />
        ) : (
          <Table columns={columns} data={users} rowKey={(u) => u.id} />
        )}
      </div>

      {!isLoading && !error && pagination && users.length > 0 && (
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
