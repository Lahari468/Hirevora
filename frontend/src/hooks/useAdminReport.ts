import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { adminReportService } from "../services/adminReportService.js";
import type { AdminReport } from "../types/index.js";

export function useAdminReport(reportId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!reportId) return Promise.resolve({ success: false, message: "No report id" } as const);
    return adminReportService.getById(reportId);
  }, [reportId]);

  return useAsync<AdminReport>(fetcher, [reportId]);
}
