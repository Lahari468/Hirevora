import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { applicationService } from "../services/applicationService.js";
import { interviewService } from "../services/interviewService.js";
import { offerService } from "../services/offerService.js";
import { savedJobService } from "../services/savedJobService.js";
import type { Application, Interview, Offer, PaginatedResult, SavedJob } from "../types/index.js";

const PAGE_LIMIT = 50;

/**
 * Loads the candidate's complete application history (looping all pages,
 * same approach as useJobPipeline) plus real totals for interviews, offers,
 * and saved jobs via each endpoint's accurate `pagination.total` — no new
 * backend endpoints, just composing what /applications/mine, /interviews/mine,
 * /offers/mine, and /candidates/me/saved-jobs already return.
 */
export function useCandidateAnalytics() {
  const [reloadToken, setReloadToken] = useState(0);

  const applicationsFetcher = useCallback(async () => {
    const all: Application[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const res = await applicationService.listMine({ page, limit: PAGE_LIMIT, sort: "newest" });
      if (!res.success || !res.data) {
        return { success: false as const, message: res.message, error: res.error };
      }
      all.push(...res.data.items);
      totalPages = res.data.pagination.totalPages;
      page += 1;
    } while (page <= totalPages);
    return { success: true, message: "", data: all };
  }, []);

  const interviewTotalFetcher = useCallback(
    () => interviewService.listMine({ page: 1, limit: 1 }),
    []
  );
  const offerTotalFetcher = useCallback(() => offerService.listMine(1, 1), []);
  const savedJobsFetcher = useCallback(() => savedJobService.list(1, 1), []);

  const applicationsState = useAsync<Application[]>(applicationsFetcher, [reloadToken]);
  const interviewTotalState = useAsync<PaginatedResult<Interview>>(interviewTotalFetcher, [
    reloadToken,
  ]);
  const offerTotalState = useAsync<PaginatedResult<Offer>>(offerTotalFetcher, [reloadToken]);
  const savedJobsState = useAsync<PaginatedResult<SavedJob>>(savedJobsFetcher, [reloadToken]);

  return {
    applications: applicationsState.data ?? [],
    interviewTotal: interviewTotalState.data?.pagination.total,
    offerTotal: offerTotalState.data?.pagination.total,
    savedJobsTotal: savedJobsState.data?.pagination.total,
    isLoading:
      applicationsState.isLoading ||
      interviewTotalState.isLoading ||
      offerTotalState.isLoading ||
      savedJobsState.isLoading,
    error:
      applicationsState.error ?? interviewTotalState.error ?? offerTotalState.error ?? savedJobsState.error,
    refetch: () => setReloadToken((t) => t + 1),
  };
}
