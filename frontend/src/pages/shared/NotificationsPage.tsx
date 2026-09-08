import {
  Bell,
  FileCheck,
  CalendarClock,
  CalendarX,
  HeartHandshake,
  MessageSquare,
  Star,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { AppShell } from "../../components/layout/AppShell.js";
import { PageHeader } from "../../components/layout/PageHeader.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner.js";
import { EmptyState } from "../../components/ui/EmptyState.js";
import { ErrorState } from "../../components/ui/ErrorState.js";
import { Pagination } from "../../components/ui/Pagination.js";
import { cn } from "../../lib/cn.js";
import { formatRelativeTime } from "../../lib/format.js";
import { useNotifications } from "../../hooks/useNotifications.js";
import type { NotificationType } from "../../types/index.js";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  APPLICATION_SUBMITTED: FileCheck,
  APPLICATION_STATUS_CHANGED: FileCheck,
  INTERVIEW_SCHEDULED: CalendarClock,
  INTERVIEW_CANCELLED: CalendarX,
  NEW_APPLICATION: FileCheck,
  OFFER_RECEIVED: HeartHandshake,
  OFFER_ACCEPTED: HeartHandshake,
  OFFER_REJECTED: HeartHandshake,
  OFFER_WITHDRAWN: HeartHandshake,
  MESSAGE_RECEIVED: MessageSquare,
  FEEDBACK_RECEIVED: Star,
  REPORT_STATUS_UPDATED: ShieldCheck,
};

export function NotificationsPage(): JSX.Element {
  const {
    notifications,
    pagination,
    setPage,
    isLoading,
    error,
    refetch,
    markRead,
    markAllRead,
    remove,
  } = useNotifications();

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <AppShell title="Notifications">
      <PageHeader
        title="Notifications"
        description="Updates about your applications, interviews, and messages."
        actions={
          hasUnread ? (
            <Button variant="outline" size="sm" onClick={() => void markAllRead()}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : notifications.length === 0 ? (
          <EmptyState icon={<Bell className="h-5 w-5" />} title="You're all caught up" />
        ) : (
          <ul className="divide-y divide-surface-border">
            {notifications.map((notification) => {
              const Icon = TYPE_ICON[notification.type] ?? Bell;
              return (
                <li
                  key={notification.id}
                  className={cn(
                    "flex items-start gap-3 px-5 py-3",
                    !notification.isRead && "bg-accent-50/40"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-600">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-navy-800">{notification.title}</p>
                    <p className="text-sm text-navy-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-navy-400">
                      {formatRelativeTime(notification.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {!notification.isRead && (
                      <button
                        type="button"
                        onClick={() => void markRead(notification.id)}
                        className="focus-ring rounded-md px-2 py-1 text-xs font-medium text-accent-600 hover:bg-accent-50"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void remove(notification.id)}
                      aria-label="Delete notification"
                      className="focus-ring rounded-md p-1.5 text-navy-400 hover:bg-danger-50 hover:text-danger-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {!isLoading && !error && pagination && notifications.length > 0 && (
        <Pagination
          page={pagination.page}
          pageSize={pagination.limit}
          total={pagination.total}
          onPageChange={setPage}
        />
      )}
    </AppShell>
  );
}
