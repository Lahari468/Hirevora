import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { candidateService } from "../services/candidateService.js";
import type { CandidateProfile } from "../types/index.js";

export function useCandidateProfile() {
  const fetcher = useCallback(() => candidateService.getProfile(), []);
  return useAsync<CandidateProfile>(fetcher, []);
}
