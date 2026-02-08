"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProjects } from "@/hooks/use-project-queries";
import { useNotifications, useUnreadNotificationCount } from "@/hooks/use-notification-queries";
import { useGlobalTaskStats } from "@/hooks/use-task-queries";
import { useAuthStore } from "@/stores/auth-store";
import { FolderKanban, ListChecks, Bell, Clock, Plus } from "lucide-react";
import Link from "next/link";
import { CreateTaskDialog } from "@/features/tasks/create-task-dialog";

function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  // Fetch projects data
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ pageSize: 100 });

  // Fetch unread notifications count
  const { data: unreadCountData, isLoading: unreadCountLoading } = useUnreadNotificationCount();

  // Fetch recent notifications for activity feed
  const { data: recentNotifications, isLoading: notificationsLoading } = useNotifications({
    page: 1,
    limit: 5,
  });

  // Fetch global task statistics
  const { data: totalTasksData, isLoading: totalTasksLoading } = useGlobalTaskStats();
  const { data: myTasksData, isLoading: myTasksLoading } = useGlobalTaskStats(
    user?.id ? { assigneeId: user.id } : undefined
  );

  const totalProjects = projectsData?.data.total || 0;
  const unreadCount = unreadCountData?.data.count || 0;
  const totalTasks = totalTasksData?.total || 0;
  const myTasks = myTasksData?.total || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={totalProjects}
          icon={FolderKanban}
          isLoading={projectsLoading}
        />
        <StatCard
          title="Total Tasks"
          value={totalTasks}
          icon={ListChecks}
          isLoading={totalTasksLoading}
        />
        <StatCard
          title="My Tasks"
          value={myTasks}
          icon={Clock}
          isLoading={myTasksLoading}
        />
        <StatCard
          title="Unread Notifications"
          value={unreadCount}
          icon={Bell}
          isLoading={unreadCountLoading}
        />
      </div>

      {/* Quick Actions */}
      {projectsData && projectsData.data.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {projectsData.data.items.slice(0, 5).map((project) => (
              <CreateTaskDialog
                key={project.id}
                projectId={project.id}
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors">
                    <Plus className="size-3.5" />
                    {project.name}
                  </button>
                }
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : recentNotifications?.data.items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {recentNotifications?.data.items.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start space-x-3 pb-4 last:pb-0 border-b last:border-0"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.body}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notification.createdAt).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              ))}
            </div>
          )}
          {recentNotifications && recentNotifications.data.items.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link
                href="/notifications"
                className="text-sm font-medium text-primary hover:underline"
              >
                View all notifications →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
