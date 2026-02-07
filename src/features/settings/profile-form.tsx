"use client";

import { useState, useMemo } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useCurrentUser, useUpdateUser } from "@/hooks/use-user-queries";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatarUrl: z.string().url("Invalid URL").or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user } = useAuthStore();
  const { data: currentUserData, isLoading: isLoadingUser } = useCurrentUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(
    user?.id || ""
  );

  // Derive initial form data from the most up-to-date user data
  const initialFormData = useMemo(() => {
    const userData = currentUserData?.data || user;
    if (userData) {
      return {
        name: userData.name,
        avatarUrl: userData.avatarUrl || "",
      };
    }
    return { name: "", avatarUrl: "" };
  }, [currentUserData?.data, user]);

  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ProfileFormData, string>>
  >({});

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ProfileFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProfileFormData;
        fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    if (!user?.id) {
      toast.error("User ID not found");
      return;
    }

    updateUser(
      {
        name: result.data.name,
        avatarUrl: result.data.avatarUrl || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update profile");
        },
      }
    );
  }

  const initials = formData.name
    ? formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile Information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update your profile information.
        </p>
      </div>

      <div className="space-y-4">
        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ""}
            readOnly
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">
            Contact support to change your email address.
          </p>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            disabled={isUpdating}
            required
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Avatar URL */}
        <div className="space-y-2">
          <Label htmlFor="avatarUrl">Avatar URL</Label>
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            value={formData.avatarUrl}
            onChange={handleChange}
            disabled={isUpdating}
          />
          {errors.avatarUrl && (
            <p className="text-sm text-destructive">{errors.avatarUrl}</p>
          )}
        </div>

        {/* Avatar Preview */}
        {formData.avatarUrl && (
          <div className="space-y-2">
            <Label>Avatar Preview</Label>
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatarUrl} alt={formData.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        )}
      </div>

      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
