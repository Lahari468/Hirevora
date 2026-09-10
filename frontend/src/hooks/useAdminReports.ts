import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { adminReportService } from "../services/adminReportService.js";
import type { AdminReport, AdminReportListFilters, PaginatedResult } from "../types/index.js";

const DEFAULT: AdminReportListFilters = { page: 1, limit: 10, sort: "newest" };

export function useAdminReports(initial: AdminReportListFilters = DEFAULT) {
  const [filters, setFilters] = useState<AdminReportListFilters>(initial);

  const fetcher = useCallback(() => adminReportService.list(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<AdminReport>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<AdminReportListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  return {
    reports: data?.items ?? [],
    pagination: data?.pagination,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch,
  };
}
