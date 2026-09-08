import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { recruiterService } from "../services/recruiterService.js";
import type { RecruiterDashboardStats } from "../types/index.js";

export function useRecruiterDashboard() {
  const fetcher = useCallback(() => recruiterService.getDashboard(5), []);
  return useAsync<RecruiterDashboardStats>(fetcher, []);
}
