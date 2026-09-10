import { useState, type FormEvent } from "react";
import { Search as SearchIcon } from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Input } from "../../components/ui/Input.js";
import { Button } from "../../components/ui/Button.js";
import { Table, type TableColumn } from "../../components/ui/Table.js";
import { SkeletonTableRows } from "../../components/ui/Skeleton.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { useAdminCompanies } from "../../hooks/useAdminCompanies.js";
import { formatDate } from "../../lib/format.js";
import type { AdminCompanyListItem } from "../../types/index.js";

/**
 * The backend has no admin company-details endpoint (only list, per
 * adminService.listCompanies) — company rows aren't clickable, and only the
 * fields the list endpoint actually returns (name, location, created) are
 * shown. See the Phase 23 report for this limitation.
 */
export function Companies(): JSX.Element {
  const { companies, pagination, updateFilters, isLoading, error, refetch } = useAdminCompanies();
  const [searchInput, setSearchInput] = useState("");

  const handleSearchSubmit = (e: FormEvent): void => {
    e.preventDefault();
    updateFilters({ search: searchInput || undefined });
  };

  const columns: TableColumn<AdminCompanyListItem>[] = [
    { key: "name", header: "Company", render: (c) => <span className="font-medium text-navy-800">{c.name}</span> },
    { key: "location", header: "Location", render: (c) => c.location ?? "—" },
    { key: "created", header: "Created", render: (c) => formatDate(c.createdAt) },
  ];

  return (
    <AppShell title="Companies">
      <PageHeader title="Companies" description="Companies registered on HireVora." />

      <form
        onSubmit={handleSearchSubmit}
        className="mb-4 flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-card p-4 shadow-card sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <Input
            label="Search"
            placeholder="Search by name or location"
            leadingIcon={<SearchIcon className="h-4 w-4" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
              <SkeletonTableRows rows={6} cols={3} />
            </tbody>
          </table>
        ) : companies.length === 0 ? (
          <EmptyState title="No companies found" />
        ) : (
          <Table columns={columns} data={companies} rowKey={(c) => c.id} />
        )}
      </div>

      {!isLoading && !error && pagination && companies.length > 0 && (
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
