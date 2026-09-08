import { apiUtils } from "./api.js";
import type { SavedJob, PaginatedResult } from "../types/index.js";

/** /api/candidates/me/saved-jobs/* */
export const savedJobService = {
  list: (page = 1, limit = 10) =>
    apiUtils.get<PaginatedResult<SavedJob>>("/api/candidates/me/saved-jobs", {
      params: { page, limit },
    }),

  save: (jobId: string) =>
    apiUtils.post<SavedJob>(`/api/candidates/me/saved-jobs/${jobId}`),

  unsave: (jobId: string) =>
    apiUtils.delete<null>(`/api/candidates/me/saved-jobs/${jobId}`),

  checkSaved: (jobId: string) =>
    apiUtils.get<{ saved: boolean }>(`/api/candidates/me/saved-jobs/${jobId}`),
};
