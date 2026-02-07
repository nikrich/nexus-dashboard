"use client";

import { useState } from "react";
import {
  useWebhooks,
  useCreateWebhook,
  useDeleteWebhook,
  useToggleWebhook,
} from "@/hooks/use-webhook-queries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NotificationType } from "@/types";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const EVENT_TYPES: NotificationType[] = [
  "task_assigned",
  "task_status_changed",
  "comment_added",
  "project_invited",
  "task_due_soon",
];

export default function WebhooksPage() {
  const [isAddingWebhook, setIsAddingWebhook] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    secret: "",
    events: [] as NotificationType[],
    active: true,
  });

  const { data: webhooksResponse, isLoading } = useWebhooks();
  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const toggleWebhook = useToggleWebhook();

  const webhooks = webhooksResponse?.data ?? [];

  const handleEventToggle = (event: NotificationType) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter((e) => e !== event)
        : [...prev.events, event],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.url) {
      toast.error("URL is required");
      return;
    }

    if (!formData.secret) {
      toast.error("Secret is required");
      return;
    }

    if (formData.events.length === 0) {
      toast.error("Please select at least one event");
      return;
    }

    try {
      await createWebhook.mutateAsync(formData);
      toast.success("Webhook created successfully");
      setFormData({ url: "", secret: "", events: [], active: true });
      setIsAddingWebhook(false);
    } catch (error) {
      toast.error("Failed to create webhook");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) {
      return;
    }

    try {
      await deleteWebhook.mutateAsync(id);
      toast.success("Webhook deleted successfully");
    } catch (error) {
      toast.error("Failed to delete webhook");
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleWebhook.mutateAsync({ id, active });
      toast.success(active ? "Webhook activated" : "Webhook deactivated");
    } catch (error) {
      toast.error("Failed to toggle webhook");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your webhook configurations for receiving notifications.
          </p>
        </div>
        {!isAddingWebhook && (
          <Button onClick={() => setIsAddingWebhook(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Webhook
          </Button>
        )}
      </div>

      {isAddingWebhook && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Webhook</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAddingWebhook(false);
                  setFormData({ url: "", secret: "", events: [], active: true });
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Webhook URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://api.example.com/webhooks"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret">Secret Key</Label>
              <Input
                id="secret"
                type="text"
                placeholder="your-secret-key"
                value={formData.secret}
                onChange={(e) =>
                  setFormData({ ...formData, secret: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                Used to sign webhook payloads for verification
              </p>
            </div>

            <div className="space-y-2">
              <Label>Events to Subscribe</Label>
              <div className="space-y-2">
                {EVENT_TYPES.map((event) => (
                  <label
                    key={event}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.events.includes(event)}
                      onChange={() => handleEventToggle(event)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {event.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label>Active</Label>
            </div>

            <Button type="submit" disabled={createWebhook.isPending}>
              {createWebhook.isPending ? "Creating..." : "Create Webhook"}
            </Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading webhooks...</p>
        </Card>
      ) : webhooks.length === 0 ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            No webhooks configured. Add one to get started.
          </p>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((webhook) => (
                <TableRow key={webhook.id}>
                  <TableCell className="font-medium">
                    <div className="max-w-xs truncate" title={webhook.url}>
                      {webhook.url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                        >
                          {event.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={webhook.active}
                      onCheckedChange={(checked) =>
                        handleToggle(webhook.id, checked)
                      }
                      disabled={toggleWebhook.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(webhook.id)}
                      disabled={deleteWebhook.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
