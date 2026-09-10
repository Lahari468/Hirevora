import { useCallback, useMemo } from "react";
import { useAsync } from "./useAsync.js";
import { interviewService } from "../services/interviewService.js";
import { offerService } from "../services/offerService.js";
import type { Interview, Offer, PaginatedResult } from "../types/index.js";

/**
 * Lightweight applicationId -> interview/offer lookup for showing card
 * indicators on the ATS board. Deliberately separate from
 * useRecruiterApplicationsIndex (which aggregates every job's applications
 * for the cross-job Applications/Candidates pages) — the ATS is scoped to
 * one job at a time, so pulling in that full multi-job aggregation just to
 * flag "has an interview" would be wasteful. Capped at the API's 50-item
 * page size per list, same limitation as the existing recruiter
 * Interviews/Offers pages.
 */
export function useApplicationIndicators() {
  const interviewsFetcher = useCallback(() => interviewService.listMine({ page: 1, limit: 50 }), []);
  const offersFetcher = useCallback(() => offerService.listMine(1, 50), []);

  const interviewsState = useAsync<PaginatedResult<Interview>>(interviewsFetcher, []);
  const offersState = useAsync<PaginatedResult<Offer>>(offersFetcher, []);

  const interviewByApplicationId = useMemo(() => {
    const map = new Map<string, Interview>();
    for (const interview of interviewsState.data?.items ?? []) {
      map.set(interview.applicationId, interview);
    }
    return map;
  }, [interviewsState.data]);

  const offerByApplicationId = useMemo(() => {
    const map = new Map<string, Offer>();
    for (const offer of offersState.data?.items ?? []) {
      map.set(offer.applicationId, offer);
    }
    return map;
  }, [offersState.data]);

  return {
    interviewByApplicationId,
    offerByApplicationId,
    isLoading: interviewsState.isLoading || offersState.isLoading,
    refetch: () => {
      interviewsState.refetch();
      offersState.refetch();
    },
  };
}
