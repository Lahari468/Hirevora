import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminCompanyListFilters, AdminCompanyListItem, PaginatedResult } from "../types/index.js";

const DEFAULT: AdminCompanyListFilters = { page: 1, limit: 10 };

export function useAdminCompanies(initial: AdminCompanyListFilters = DEFAULT) {
  const [filters, setFilters] = useState<AdminCompanyListFilters>(initial);

  const fetcher = useCallback(() => adminService.listCompanies(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<AdminCompanyListItem>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<AdminCompanyListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  return {
    companies: data?.items ?? [],
    pagination: data?.pagination,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch,
  };
}
