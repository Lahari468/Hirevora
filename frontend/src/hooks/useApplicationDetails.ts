import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { applicationService } from "../services/applicationService.js";
import type { Application } from "../types/index.js";

export function useApplicationDetails(applicationId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!applicationId)
      return Promise.resolve({ success: false, message: "No application id" } as const);
    return applicationService.getById(applicationId);
  }, [applicationId]);

  return useAsync<Application>(fetcher, [applicationId]);
}
