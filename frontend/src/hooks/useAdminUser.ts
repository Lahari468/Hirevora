import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { adminService } from "../services/adminService.js";
import type { AdminUserDetails } from "../types/index.js";

export function useAdminUser(userId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!userId) return Promise.resolve({ success: false, message: "No user id" } as const);
    return adminService.getUser(userId);
  }, [userId]);

  return useAsync<AdminUserDetails>(fetcher, [userId]);
}
