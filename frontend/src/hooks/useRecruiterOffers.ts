import { useCallback, useMemo } from "react";
import { useAsync } from "./useAsync.js";
import { offerService } from "../services/offerService.js";
import { useRecruiterApplicationsIndex, type IndexedApplication } from "./useRecruiterApplicationsIndex.js";
import type { Offer, PaginatedResult } from "../types/index.js";

export interface RecruiterOfferRow extends Offer {
  context?: IndexedApplication;
}

/** Offer rows enriched with job/candidate context via the applications index (see useRecruiterApplicationsIndex). */
export function useRecruiterOffers() {
  const fetcher = useCallback(() => offerService.listMine(1, 50), []);
  const offersState = useAsync<PaginatedResult<Offer>>(fetcher, []);
  const {
    applications,
    isLoading: indexLoading,
    error: indexError,
    refetch: refetchIndex,
  } = useRecruiterApplicationsIndex();

  const offers = useMemo<RecruiterOfferRow[]>(() => {
    const items = offersState.data?.items ?? [];
    const map = new Map(applications.map((a) => [a.id, a]));
    return items.map((offer) => ({ ...offer, context: map.get(offer.applicationId) }));
  }, [offersState.data, applications]);

  return {
    offers,
    isLoading: offersState.isLoading || indexLoading,
    error: offersState.error ?? indexError,
    refetch: () => {
      offersState.refetch();
      refetchIndex();
    },
  };
}
