import { apiUtils } from "./api.js";
import type {
  RecruiterProfile,
  UpdateRecruiterProfilePayload,
  RecruiterDashboardStats,
} from "../types/index.js";

/** /api/recruiters/me, /api/recruiters/dashboard */
export const recruiterService = {
  getProfile: () => apiUtils.get<RecruiterProfile>("/api/recruiters/me"),

  updateProfile: (payload: UpdateRecruiterProfilePayload) =>
    apiUtils.put<RecruiterProfile>("/api/recruiters/me", payload),

  getDashboard: (recentLimit = 5) =>
    apiUtils.get<RecruiterDashboardStats>("/api/recruiters/dashboard", {
      params: { recentLimit },
    }),
};
