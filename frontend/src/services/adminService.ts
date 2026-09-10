import { apiUtils } from "./api.js";
import type {
  AdminAuditLogItem,
  AdminAuditLogListFilters,
  AdminCompanyListFilters,
  AdminCompanyListItem,
  AdminDashboardStats,
  AdminJobDetails,
  AdminJobListFilters,
  AdminJobListItem,
  AdminUserDetails,
  AdminUserListFilters,
  AdminUserListItem,
  PaginatedResult,
} from "../types/index.js";

/** /api/admin/* (excluding report moderation, which lives in adminReportService.ts) */
export const adminService = {
  getDashboard: () => apiUtils.get<AdminDashboardStats>("/api/admin/dashboard"),

  listUsers: (filters: AdminUserListFilters) =>
    apiUtils.get<PaginatedResult<AdminUserListItem>>("/api/admin/users", { params: filters }),

  getUser: (id: string) => apiUtils.get<AdminUserDetails>(`/api/admin/users/${id}`),

  listJobs: (filters: AdminJobListFilters) =>
    apiUtils.get<PaginatedResult<AdminJobListItem>>("/api/admin/jobs", { params: filters }),

  getJob: (id: string) => apiUtils.get<AdminJobDetails>(`/api/admin/jobs/${id}`),

  listCompanies: (filters: AdminCompanyListFilters) =>
    apiUtils.get<PaginatedResult<AdminCompanyListItem>>("/api/admin/companies", {
      params: filters,
    }),

  listAuditLogs: (filters: AdminAuditLogListFilters) =>
    apiUtils.get<PaginatedResult<AdminAuditLogItem>>("/api/admin/audit-logs", {
      params: filters,
    }),
};
