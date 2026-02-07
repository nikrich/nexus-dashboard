"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notification-queries";
import type { NotificationChannel, NotificationPreferences } from "@/types";

type NotificationTypeKey = keyof Omit<NotificationPreferences, "userId">;

const notificationTypes: Array<{ key: NotificationTypeKey; label: string }> = [
  { key: "taskAssigned", label: "Task Assigned" },
  { key: "taskStatusChanged", label: "Status Changed" },
  { key: "commentAdded", label: "Comment Added" },
  { key: "projectInvited", label: "Project Invited" },
  { key: "taskDueSoon", label: "Task Due Soon" },
];

const channels: Array<{ key: NotificationChannel; label: string }> = [
  { key: "in_app", label: "In-App" },
  { key: "email", label: "Email" },
  { key: "webhook", label: "Webhook" },
];

export default function PreferencesPage() {
  const { data, isLoading, error } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const [localPreferences, setLocalPreferences] = useState<Partial<
    Omit<NotificationPreferences, "userId">
  > | null>(null);

  // Use server data as the source of truth, local state for unsaved changes
  const preferences = localPreferences ?? (data?.data ? (() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { userId, ...prefs } = data.data;
    return prefs;
  })() : null);

  const toggleChannel = (
    notificationType: NotificationTypeKey,
    channel: NotificationChannel
  ) => {
    if (!preferences) return;

    setLocalPreferences((prev) => {
      const base = prev ?? preferences;
      if (!base) return prev;

      const currentChannels = base[notificationType] || [];
      const hasChannel = currentChannels.includes(channel);

      return {
        ...base,
        [notificationType]: hasChannel
          ? currentChannels.filter((c) => c !== channel)
          : [...currentChannels, channel],
      };
    });
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      await updatePreferences.mutateAsync(preferences);
      toast.success("Preferences saved successfully");
      setLocalPreferences(null); // Reset to server state after successful save
    } catch (err) {
      toast.error("Failed to save preferences");
      console.error("Error saving preferences:", err);
    }
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">
              Failed to load preferences. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground mt-1">
          Configure how you want to receive notifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose which channels you want to receive notifications through for
            each event type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-40" />
                  <div className="flex gap-8 ml-auto">
                    <Skeleton className="h-5 w-9" />
                    <Skeleton className="h-5 w-9" />
                    <Skeleton className="h-5 w-9" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 pr-4 font-medium">
                        Notification Type
                      </th>
                      {channels.map((channel) => (
                        <th
                          key={channel.key}
                          className="text-center py-3 px-4 font-medium"
                        >
                          {channel.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {notificationTypes.map((notificationType) => (
                      <tr key={notificationType.key} className="border-b">
                        <td className="py-4 pr-4 font-medium">
                          {notificationType.label}
                        </td>
                        {channels.map((channel) => {
                          const isEnabled =
                            preferences?.[notificationType.key]?.includes(
                              channel.key
                            ) || false;

                          return (
                            <td
                              key={channel.key}
                              className="text-center py-4 px-4"
                            >
                              <div className="flex justify-center">
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={() =>
                                    toggleChannel(
                                      notificationType.key,
                                      channel.key
                                    )
                                  }
                                  disabled={!preferences}
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  onClick={handleSave}
                  disabled={updatePreferences.isPending || !preferences}
                >
                  {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
