import { apiUtils } from "./api.js";
import type {
  AdminReport,
  AdminReportListFilters,
  PaginatedResult,
  UpdateReportPayload,
} from "../types/index.js";

/** /api/admin/reports/* — report moderation */
export const adminReportService = {
  list: (filters: AdminReportListFilters) =>
    apiUtils.get<PaginatedResult<AdminReport>>("/api/admin/reports", { params: filters }),

  getById: (id: string) => apiUtils.get<AdminReport>(`/api/admin/reports/${id}`),

  updateStatus: (id: string, payload: UpdateReportPayload) =>
    apiUtils.patch<AdminReport>(`/api/admin/reports/${id}`, payload),
};
