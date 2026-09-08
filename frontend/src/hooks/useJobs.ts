import { useCallback, useMemo, useState } from "react";
import { useAsync } from "./useAsync.js";
import { jobService } from "../services/jobService.js";
import type { Job, JobSearchFilters, PaginatedResult } from "../types/index.js";

const DEFAULT_FILTERS: JobSearchFilters = { page: 1, limit: 10, sort: "newest" };

/** Backs the Find Jobs page: search/filter state + the paginated result. */
export function useJobs(initial: JobSearchFilters = DEFAULT_FILTERS) {
  const [filters, setFilters] = useState<JobSearchFilters>(initial);

  const fetcher = useCallback(() => jobService.search(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<Job>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<JobSearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: next.page ?? 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const jobs = useMemo(() => data?.items ?? [], [data]);

  return {
    jobs,
    pagination: data?.pagination,
    filters,
    updateFilters,
    setPage,
    isLoading,
    error,
    refetch,
  };
}
