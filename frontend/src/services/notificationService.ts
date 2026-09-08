import { apiUtils } from "./api.js";
import type { AppNotification, PaginatedResult } from "../types/index.js";

/** /api/notifications/* */
export const notificationService = {
  list: (page = 1, limit = 10, unread?: boolean) =>
    apiUtils.get<PaginatedResult<AppNotification>>("/api/notifications", {
      params: { page, limit, unread },
    }),

  unreadCount: () => apiUtils.get<{ unreadCount: number }>("/api/notifications/unread-count"),

  markRead: (id: string) => apiUtils.patch<AppNotification>(`/api/notifications/${id}/read`),

  markAllRead: () => apiUtils.patch<null>("/api/notifications/read-all"),

  remove: (id: string) => apiUtils.delete<null>(`/api/notifications/${id}`),
};
