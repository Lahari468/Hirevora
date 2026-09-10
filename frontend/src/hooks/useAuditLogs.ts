import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminAuditLogItem, AdminAuditLogListFilters, PaginatedResult } from "../types/index.js";

const DEFAULT: AdminAuditLogListFilters = { page: 1, limit: 20, sort: "newest" };

export function useAuditLogs(initial: AdminAuditLogListFilters = DEFAULT) {
  const [filters, setFilters] = useState<AdminAuditLogListFilters>(initial);

  const fetcher = useCallback(() => adminService.listAuditLogs(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<AdminAuditLogItem>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<AdminAuditLogListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  return {
    logs: data?.items ?? [],
    pagination: data?.pagination,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch,
  };
}
