import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { savedJobService } from "../services/savedJobService.js";
import type { PaginatedResult, SavedJob } from "../types/index.js";

export function useSavedJobs() {
  const [page, setPage] = useState(1);
  const fetcher = useCallback(() => savedJobService.list(page, 10), [page]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<SavedJob>>(fetcher, [page]);

  const unsave = useCallback(
    async (jobId: string) => {
      await savedJobService.unsave(jobId);
      refetch();
    },
    [refetch]
  );

  return {
    savedJobs: data?.items ?? [],
    pagination: data?.pagination,
    page,
    setPage,
    isLoading,
    error,
    refetch,
    unsave,
  };
}
