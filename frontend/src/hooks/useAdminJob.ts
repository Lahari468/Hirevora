import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminJobDetails } from "../types/index.js";

export function useAdminJob(jobId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!jobId) return Promise.resolve({ success: false, message: "No job id" } as const);
    return adminService.getJob(jobId);
  }, [jobId]);

  return useAsync<AdminJobDetails>(fetcher, [jobId]);
}
