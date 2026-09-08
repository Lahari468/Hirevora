import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { applicationService } from "../services/applicationService.js";
import type { RecruiterApplication } from "../types/index.js";

export function useRecruiterApplicationDetails(applicationId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!applicationId)
      return Promise.resolve({ success: false, message: "No application id" } as const);
    return applicationService.getForRecruiter(applicationId);
  }, [applicationId]);

  return useAsync<RecruiterApplication>(fetcher, [applicationId]);
}
