import { useCallback, useMemo } from "react";
import { useAsync } from "./useAsync.js";
import { interviewService } from "../services/interviewService.js";
import { applicationService } from "../services/applicationService.js";
import type { Application, Interview, PaginatedResult } from "../types/index.js";

export interface InterviewWithContext extends Interview {
  job?: Application["job"];
}

/**
 * The interview list endpoint returns bare rows (id, applicationId,
 * scheduledAt, ...) with no job/company info. This hook cross-references
 * each interview's applicationId against the candidate's own applications
 * (already scoped to them via /applications/mine) to attach job context —
 * entirely from real data, no backend guessing involved.
 */
export function useInterviews() {
  const interviewFetcher = useCallback(() => interviewService.listMine({ page: 1, limit: 50 }), []);
  const appsFetcher = useCallback(() => applicationService.listMine({ page: 1, limit: 100 }), []);

  const interviewsState = useAsync<PaginatedResult<Interview>>(interviewFetcher, []);
  const appsState = useAsync<PaginatedResult<Application>>(appsFetcher, []);

  const interviews = useMemo<InterviewWithContext[]>(() => {
    const items = interviewsState.data?.items ?? [];
    const appMap = new Map((appsState.data?.items ?? []).map((a) => [a.id, a]));
    return items.map((interview) => ({
      ...interview,
      job: appMap.get(interview.applicationId)?.job,
    }));
  }, [interviewsState.data, appsState.data]);

  return {
    interviews,
    isLoading: interviewsState.isLoading || appsState.isLoading,
    error: interviewsState.error ?? appsState.error,
    refetch: () => {
      interviewsState.refetch();
      appsState.refetch();
    },
  };
}
