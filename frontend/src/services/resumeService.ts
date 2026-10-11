import { apiUtils } from "./api.js";
import type { Resume } from "../types/index.js";

/**
 * /api/candidates/me/resumes/* — multipart upload uses field name "resume".
 * The `:id/file` endpoints stream the actual PDF bytes and require
 * authentication — there is no public URL for a resume file (see Phase 26
 * security fix). Use openAuthenticatedFile(resumeService.ownFileUrl(id)) /
 * (...recruiterFileUrl(id)) from lib/fileAccess.ts to open one, rather than
 * linking to these paths directly.
 */
export const resumeService = {
  list: () => apiUtils.get<Resume[]>("/api/candidates/me/resumes"),

  getById: (id: string) => apiUtils.get<Resume>(`/api/candidates/me/resumes/${id}`),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiUtils.post<Resume>("/api/candidates/me/resumes", formData);
  },

  remove: (id: string) => apiUtils.delete<null>(`/api/candidates/me/resumes/${id}`),

  ownFileUrl: (id: string) => `/api/candidates/me/resumes/${id}/file`,

  // Recruiter-facing: read-only lookup of a candidate's resume by id
  getForRecruiter: (id: string) => apiUtils.get<Resume>(`/api/recruiters/resumes/${id}`),

  recruiterFileUrl: (id: string) => `/api/recruiters/resumes/${id}/file`,
};
