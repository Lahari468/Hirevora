import { useCallback, useMemo } from "react";
import { useAsync } from "./useAsync.js";
import { interviewService } from "../services/interviewService.js";
import { useRecruiterApplicationsIndex, type IndexedApplication } from "./useRecruiterApplicationsIndex.js";
import type { Interview, PaginatedResult } from "../types/index.js";

export interface RecruiterInterviewRow extends Interview {
  context?: IndexedApplication;
}

/** Interview rows enriched with job/candidate context via the applications index (see useRecruiterApplicationsIndex). */
export function useRecruiterInterviews() {
  const fetcher = useCallback(() => interviewService.listMine({ page: 1, limit: 50 }), []);
  const interviewsState = useAsync<PaginatedResult<Interview>>(fetcher, []);
  const {
    applications,
    isLoading: indexLoading,
    error: indexError,
    refetch: refetchIndex,
  } = useRecruiterApplicationsIndex();

  const interviews = useMemo<RecruiterInterviewRow[]>(() => {
    const items = interviewsState.data?.items ?? [];
    const map = new Map(applications.map((a) => [a.id, a]));
    return items.map((interview) => ({ ...interview, context: map.get(interview.applicationId) }));
  }, [interviewsState.data, applications]);

  return {
    interviews,
    isLoading: interviewsState.isLoading || indexLoading,
    error: interviewsState.error ?? indexError,
    refetch: () => {
      interviewsState.refetch();
      refetchIndex();
    },
  };
}
