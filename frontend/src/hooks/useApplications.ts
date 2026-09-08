import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { applicationService } from "../services/applicationService.js";
import type { Application, ApplicationListFilters, PaginatedResult } from "../types/index.js";

const DEFAULT: ApplicationListFilters = { page: 1, limit: 10, sort: "newest" };

export function useApplications(initial: ApplicationListFilters = DEFAULT) {
  const [filters, setFilters] = useState<ApplicationListFilters>(initial);

  const fetcher = useCallback(() => applicationService.listMine(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<Application>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<ApplicationListFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  return {
    applications: data?.items ?? [],
    pagination: data?.pagination,
    filters,
    updateFilters,
    isLoading,
    error,
    refetch,
  };
}
