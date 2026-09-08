import { apiUtils } from "./api.js";
import type { CandidateProfile, UpdateCandidateProfilePayload } from "../types/index.js";

/** GET/PUT /api/candidates/me */
export const candidateService = {
  getProfile: () => apiUtils.get<CandidateProfile>("/api/candidates/me"),
  updateProfile: (payload: UpdateCandidateProfilePayload) =>
    apiUtils.put<CandidateProfile>("/api/candidates/me", payload),
};
