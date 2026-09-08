import { apiUtils } from "./api.js";
import type {
  CreateJobPayload,
  Job,
  JobSearchFilters,
  PaginatedResult,
  RecruiterJobListFilters,
  UpdateJobPayload,
} from "../types/index.js";

/** GET /api/jobs (public search/filter), GET /api/jobs/:id (public detail), plus recruiter job management */
export const jobService = {
  search: (filters: JobSearchFilters) =>
    apiUtils.get<PaginatedResult<Job>>("/api/jobs", { params: filters }),

  getById: (jobId: string) => apiUtils.get<Job>(`/api/jobs/${jobId}`),

  // Recruiter-facing (own jobs only)
  listMine: (filters: RecruiterJobListFilters) =>
    apiUtils.get<PaginatedResult<Job>>("/api/jobs/mine", { params: filters }),

  getMineById: (jobId: string) => apiUtils.get<Job>(`/api/jobs/${jobId}/recruiter`),

  create: (payload: CreateJobPayload) => apiUtils.post<Job>("/api/jobs", payload),

  update: (jobId: string, payload: UpdateJobPayload) =>
    apiUtils.put<Job>(`/api/jobs/${jobId}`, payload),

  publish: (jobId: string) => apiUtils.patch<Job>(`/api/jobs/${jobId}/publish`),

  close: (jobId: string) => apiUtils.patch<Job>(`/api/jobs/${jobId}/close`),

  remove: (jobId: string) => apiUtils.delete<null>(`/api/jobs/${jobId}`),
};
