import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { jobService } from "../services/jobService.js";
import type { Job } from "../types/index.js";

export function useJobDetails(jobId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!jobId) return Promise.resolve({ success: false, message: "No job id" } as const);
    return jobService.getById(jobId);
  }, [jobId]);

  return useAsync<Job>(fetcher, [jobId]);
}
