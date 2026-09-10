import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminDashboardStats } from "../types/index.js";

export function useAdminDashboard() {
  const fetcher = useCallback(() => adminService.getDashboard(), []);
  return useAsync<AdminDashboardStats>(fetcher, []);
}
