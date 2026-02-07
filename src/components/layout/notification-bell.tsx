"use client";

import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
} from "@/hooks/use-notification-queries";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Notification, NotificationType } from "@/types";

const TYPE_ICONS: Record<NotificationType, string> = {
  task_assigned: "👤",
  task_status_changed: "🔄",
  comment_added: "💬",
  project_invited: "📨",
  task_due_soon: "⏰",
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
}) {
  return (
    <button
      className={`flex w-full gap-3 rounded-md p-2 text-left text-sm transition-colors hover:bg-accent ${
        !notification.read ? "bg-accent/50" : ""
      }`}
      onClick={() => {
        if (!notification.read) {
          onMarkRead(notification.id);
        }
      }}
    >
      <span className="mt-0.5 text-base leading-none">
        {TYPE_ICONS[notification.type] ?? "🔔"}
      </span>
      <div className="flex-1 space-y-1">
        <p className={notification.read ? "text-muted-foreground" : "font-medium"}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {timeAgo(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}

export function NotificationBell() {
  const { data: countData } = useUnreadNotificationCount();
  const { data: notificationsData } = useNotifications({ limit: 5 });
  const markRead = useMarkNotificationRead();

  const unreadCount = countData?.data?.count ?? 0;
  const notifications = notificationsData?.data?.items ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCheck className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={(id) => markRead.mutate(id)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="border-t px-4 py-2">
          <Link
            href="/notifications"
            className="block text-center text-xs text-primary hover:underline"
          >
            View all notifications
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
