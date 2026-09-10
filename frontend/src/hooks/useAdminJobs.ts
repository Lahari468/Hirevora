import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminJobListFilters, AdminJobListItem, PaginatedResult } from "../types/index.js";

const DEFAULT: AdminJobListFilters = { page: 1, limit: 10, sort: "newest" };

export function useAdminJobs(initial: AdminJobListFilters = DEFAULT) {
  const [filters, setFilters] = useState<AdminJobListFilters>(initial);

  const fetcher = useCallback(() => adminService.listJobs(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<AdminJobListItem>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<AdminJobListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  return {
    jobs: data?.items ?? [],
    pagination: data?.pagination,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch,
  };
}
