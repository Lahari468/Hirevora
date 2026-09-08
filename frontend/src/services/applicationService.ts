import { apiUtils } from "./api.js";
import type {
  Application,
  ApplicationListFilters,
  CreateApplicationPayload,
  JobApplicationListItem,
  PaginatedResult,
  RecruiterApplication,
  RecruiterApplicationListFilters,
  UpdateApplicationStatusPayload,
} from "../types/index.js";

/** /api/applications/* */
export const applicationService = {
  // Candidate-facing
  create: (payload: CreateApplicationPayload) =>
    apiUtils.post<Application>("/api/applications", payload),

  listMine: (filters: ApplicationListFilters) =>
    apiUtils.get<PaginatedResult<Application>>("/api/applications/mine", {
      params: filters,
    }),

  getById: (id: string) => apiUtils.get<Application>(`/api/applications/${id}`),

  // Recruiter-facing (own jobs only)
  listForJob: (jobId: string, filters: RecruiterApplicationListFilters) =>
    apiUtils.get<PaginatedResult<JobApplicationListItem>>(
      `/api/recruiters/jobs/${jobId}/applications`,
      { params: filters }
    ),

  getForRecruiter: (id: string) =>
    apiUtils.get<RecruiterApplication>(`/api/applications/${id}/recruiter`),

  updateStatus: (id: string, payload: UpdateApplicationStatusPayload) =>
    apiUtils.patch<RecruiterApplication>(`/api/applications/${id}/status`, payload),
};
