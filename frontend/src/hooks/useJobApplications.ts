import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { applicationService } from "../services/applicationService.js";
import type {
  JobApplicationListItem,
  PaginatedResult,
  RecruiterApplicationListFilters,
} from "../types/index.js";

const DEFAULT: RecruiterApplicationListFilters = { page: 1, limit: 10, sort: "newest" };

/** Applications for a single job the recruiter owns — backs the Job Details "Applications" tab. */
export function useJobApplications(jobId: string | undefined, initial: RecruiterApplicationListFilters = DEFAULT) {
  const [filters, setFilters] = useState<RecruiterApplicationListFilters>(initial);

  const fetcher = useCallback(() => {
    if (!jobId) return Promise.resolve({ success: false, message: "No job id" } as const);
    return applicationService.listForJob(jobId, filters);
  }, [jobId, filters]);

  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<JobApplicationListItem>>(
    fetcher,
    [jobId, JSON.stringify(filters)]
  );

  const updateFilters = useCallback((next: Partial<RecruiterApplicationListFilters>) => {
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
