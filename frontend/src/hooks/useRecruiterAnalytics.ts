import { useCallback, useMemo } from "react";
import { useAsync } from "./useAsync.js";
import { interviewService } from "../services/interviewService.js";
import { offerService } from "../services/offerService.js";
import { useRecruiterDashboard } from "./useRecruiterDashboard.js";
import { useRecruiterApplicationsIndex } from "./useRecruiterApplicationsIndex.js";
import type { PaginatedResult, Interview, Offer } from "../types/index.js";

/**
 * Composes existing endpoints/hooks rather than adding new backend calls:
 * - useRecruiterDashboard() -> real jobs{total,draft,open,closed} and
 *   applications{total,byStatus} across every job the recruiter owns
 *   (GET /recruiters/dashboard).
 * - interviewService.listMine / offerService.listMine with limit=1 just to
 *   read the accurate `pagination.total` the backend already computes —
 *   cheaper than fetching real rows to count them.
 * - useRecruiterApplicationsIndex() (already built for the ATS/Applications
 *   pages) supplies real per-application appliedAt + job for the job
 *   breakdown and time-series sections, capped at the same 50 jobs x 50
 *   applications the rest of the app already documents this limit at.
 */
export function useRecruiterAnalytics() {
  const dashboard = useRecruiterDashboard();

  const interviewTotalFetcher = useCallback(
    () => interviewService.listMine({ page: 1, limit: 1 }),
    []
  );
  const offerTotalFetcher = useCallback(() => offerService.listMine(1, 1), []);

  const interviewTotalState = useAsync<PaginatedResult<Interview>>(interviewTotalFetcher, []);
  const offerTotalState = useAsync<PaginatedResult<Offer>>(offerTotalFetcher, []);

  const { applications, jobs, isLoading: indexLoading, error: indexError, refetch: refetchIndex } =
    useRecruiterApplicationsIndex();

  const isLoading =
    dashboard.isLoading || interviewTotalState.isLoading || offerTotalState.isLoading || indexLoading;
  const error = dashboard.error ?? interviewTotalState.error ?? offerTotalState.error ?? indexError;

  const jobPerformance = useMemo(() => {
    const byJob = new Map<string, { jobId: string; title: string; total: number }>();
    for (const app of applications) {
      const existing = byJob.get(app.job.id);
      if (existing) {
        existing.total += 1;
      } else {
        byJob.set(app.job.id, { jobId: app.job.id, title: app.job.title, total: 1 });
      }
    }
    return Array.from(byJob.values()).sort((a, b) => b.total - a.total);
  }, [applications]);

  return {
    stats: dashboard.data,
    interviewTotal: interviewTotalState.data?.pagination.total,
    offerTotal: offerTotalState.data?.pagination.total,
    applications,
    jobs,
    jobPerformance,
    isLoading,
    error,
    refetch: () => {
      dashboard.refetch();
      interviewTotalState.refetch();
      offerTotalState.refetch();
      refetchIndex();
    },
  };
}
