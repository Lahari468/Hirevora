import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminUserListFilters, AdminUserListItem, PaginatedResult } from "../types/index.js";

const DEFAULT: AdminUserListFilters = { page: 1, limit: 10, sort: "newest" };

export function useAdminUsers(initial: AdminUserListFilters = DEFAULT) {
  const [filters, setFilters] = useState<AdminUserListFilters>(initial);

  const fetcher = useCallback(() => adminService.listUsers(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<AdminUserListItem>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<AdminUserListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  return {
    users: data?.items ?? [],
    pagination: data?.pagination,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch,
  };
}
