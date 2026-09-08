import { useCallback, useState } from "react";
import { useAsync } from "./useAsync.js";
import { notificationService } from "../services/notificationService.js";
import type { AppNotification, PaginatedResult } from "../types/index.js";

export function useNotifications() {
  const [page, setPage] = useState(1);
  const fetcher = useCallback(() => notificationService.list(page, 10), [page]);
  const { data, isLoading, error, refetch } = useAsync<PaginatedResult<AppNotification>>(
    fetcher,
    [page]
  );

  const markRead = useCallback(
    async (id: string) => {
      await notificationService.markRead(id);
      refetch();
    },
    [refetch]
  );

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    refetch();
  }, [refetch]);

  const remove = useCallback(
    async (id: string) => {
      await notificationService.remove(id);
      refetch();
    },
    [refetch]
  );

  return {
    notifications: data?.items ?? [],
    pagination: data?.pagination,
    page,
    setPage,
    isLoading,
    error,
    refetch,
    markRead,
    markAllRead,
    remove,
  };
}
