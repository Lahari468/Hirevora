import { useCallback, useMemo } from "react";
import { useAsync } from "./useAsync.js";
import { jobService } from "../services/jobService.js";
import { applicationService } from "../services/applicationService.js";
import type { Job, JobApplicationListItem, PaginatedResult } from "../types/index.js";

export interface IndexedApplication extends JobApplicationListItem {
  job: Job;
}

/**
 * Aggregates applications across every job the recruiter owns. The backend
 * only exposes applications scoped to a single job — there's no cross-job
 * recruiter feed — so this hook fetches the recruiter's jobs (first 50,
 * the API's page-size ceiling) and each job's applications (first 50 each)
 * and joins them client-side. All data is real; it's combined from
 * multiple authorized, job-scoped calls rather than a single endpoint the
 * backend doesn't provide. Backs the Applications, Candidates, Interviews,
 * and Offers pages.
 */
export function useRecruiterApplicationsIndex() {
  const jobsFetcher = useCallback(
    () => jobService.listMine({ page: 1, limit: 50, sort: "newest" }),
    []
  );
  const jobsState = useAsync<PaginatedResult<Job>>(jobsFetcher, []);
  const jobs = useMemo(() => jobsState.data?.items ?? [], [jobsState.data]);
  const jobsKey = jobs.map((j) => j.id).join(",");

  const appsFetcher = useCallback(async () => {
    if (jobs.length === 0) {
      return { success: true, message: "", data: [] as IndexedApplication[] };
    }
    const perJob = await Promise.all(
      jobs.map((job) =>
        applicationService
          .listForJob(job.id, { page: 1, limit: 50, sort: "newest" })
          .then((res) =>
            res.success && res.data
              ? res.data.items.map((item): IndexedApplication => ({ ...item, job }))
              : []
          )
          .catch(() => [] as IndexedApplication[])
      )
    );
    return { success: true, message: "", data: perJob.flat() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobsKey]);

  const appsState = useAsync<IndexedApplication[]>(appsFetcher, [jobsKey]);

  return {
    applications: appsState.data ?? [],
    jobs,
    isLoading: jobsState.isLoading || appsState.isLoading,
    error: jobsState.error ?? appsState.error,
    refetch: () => {
      jobsState.refetch();
      appsState.refetch();
    },
  };
}
