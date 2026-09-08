import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { jobService } from "../services/jobService.js";
import type { Job, PaginatedResult, RecruiterJobListFilters } from "../types/index.js";

const DEFAULT: RecruiterJobListFilters = { page: 1, limit: 10, sort: "newest" };

export function useRecruiterJobs(initial: RecruiterJobListFilters = DEFAULT) {
  const [filters, setFilters] = useState<RecruiterJobListFilters>(initial);

  const fetcher = useCallback(() => jobService.listMine(filters), [filters]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<Job>>(
    fetcher,
    [JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<RecruiterJobListFilters>) => {
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
