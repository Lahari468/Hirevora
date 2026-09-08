import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { recruiterService } from "../services/recruiterService.js";
import type { RecruiterProfile } from "../types/index.js";

export function useRecruiterProfile() {
  const fetcher = useCallback(() => recruiterService.getProfile(), []);
  return useAsync<RecruiterProfile>(fetcher, []);
}
