import { apiUtils } from "./api.js";
import type { Resume } from "../types/index.js";

/** /api/candidates/me/resumes/* — multipart upload uses field name "resume" */
export const resumeService = {
  list: () => apiUtils.get<Resume[]>("/api/candidates/me/resumes"),

  getById: (id: string) => apiUtils.get<Resume>(`/api/candidates/me/resumes/${id}`),

  upload: (file: File) => {
    const formData = new FormData();
    formData.append("resume", file);
    return apiUtils.post<Resume>("/api/candidates/me/resumes", formData);
  },

  remove: (id: string) => apiUtils.delete<null>(`/api/candidates/me/resumes/${id}`),

  // Recruiter-facing: read-only lookup of a candidate's resume by id
  getForRecruiter: (id: string) => apiUtils.get<Resume>(`/api/recruiters/resumes/${id}`),
};
