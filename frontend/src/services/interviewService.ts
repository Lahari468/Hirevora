import { apiUtils } from "./api.js";
import type {
  CompleteInterviewPayload,
  CreateInterviewPayload,
  Interview,
  InterviewListFilters,
  PaginatedResult,
  UpdateInterviewPayload,
} from "../types/index.js";

/** /api/interviews/* — /mine and /:id are role-branched server-side (candidate vs recruiter) */
export const interviewService = {
  listMine: (filters: InterviewListFilters) =>
    apiUtils.get<PaginatedResult<Interview>>("/api/interviews/mine", {
      params: filters,
    }),

  getById: (id: string) => apiUtils.get<Interview>(`/api/interviews/${id}`),

  // Recruiter-facing
  create: (payload: CreateInterviewPayload) =>
    apiUtils.post<Interview>("/api/interviews", payload),

  update: (id: string, payload: UpdateInterviewPayload) =>
    apiUtils.patch<Interview>(`/api/interviews/${id}`, payload),

  cancel: (id: string) => apiUtils.patch<Interview>(`/api/interviews/${id}/cancel`),

  complete: (id: string, payload: CompleteInterviewPayload) =>
    apiUtils.patch<Interview>(`/api/interviews/${id}/complete`, payload),
};
