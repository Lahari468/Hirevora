import { useCallback } from "react";
import { useAsync } from "./useAsync.js";
import { useAdminDashboard } from "./useAdminDashboard.js";
import { adminReportService } from "../services/adminReportService.js";
import type { ReportStatus } from "../types/index.js";

const REPORT_STATUSES: ReportStatus[] = ["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"];

/**
 * Composes the existing /admin/dashboard endpoint (users/jobs/applications
 * aggregates — see useAdminDashboard) with cheap pagination.total reads
 * from /admin/reports, one per real ReportStatus value, to build an
 * accurate moderation breakdown without fetching report bodies. No new
 * backend endpoints; no historical/time-series data exists anywhere in the
 * backend, so no growth chart is built here (see Phase 25 report).
 */
export function useAdminAnalytics() {
  const dashboard = useAdminDashboard();

  const reportCountsFetcher = useCallback(async () => {
    const results = await Promise.all(
      REPORT_STATUSES.map((status) => adminReportService.list({ page: 1, limit: 1, status }))
    );
    const counts: Record<ReportStatus, number> = {
      PENDING: 0,
      REVIEWING: 0,
      RESOLVED: 0,
      DISMISSED: 0,
    };
    results.forEach((res, i) => {
      if (res.success && res.data) {
        counts[REPORT_STATUSES[i]] = res.data.pagination.total;
      }
    });
    return { success: true, message: "", data: counts };
  }, []);

  const reportCountsState = useAsync<Record<ReportStatus, number>>(reportCountsFetcher, []);

  return {
    stats: dashboard.data,
    reportCounts: reportCountsState.data,
    isLoading: dashboard.isLoading || reportCountsState.isLoading,
    error: dashboard.error ?? reportCountsState.error,
    refetch: () => {
      dashboard.refetch();
      reportCountsState.refetch();
    },
  };
}
