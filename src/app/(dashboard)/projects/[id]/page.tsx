"use client";

import { use } from "react";
import { useProject } from "@/hooks/use-project-queries";
import { useUser } from "@/hooks/use-user-queries";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, User } from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { data: projectResponse, isLoading: isLoadingProject } = useProject(id);
  const project = projectResponse?.data;

  const { data: ownerResponse, isLoading: isLoadingOwner } = useUser(
    project?.ownerId ?? ""
  );
  const owner = ownerResponse?.data;

  if (isLoadingProject) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground mt-2">{project.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Owner:</span>
              {isLoadingOwner ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <span className="text-sm font-medium">
                  {owner?.name || "Unknown"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Created:</span>
              <span className="text-sm font-medium">
                {formatDate(project.createdAt)}
              </span>
            </div>

            {project.updatedAt !== project.createdAt && (
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Updated:</span>
                <span className="text-sm font-medium">
                  {formatDate(project.updatedAt)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Project Members */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Project Members</h2>
        <div className="space-y-4">
          {/* Owner as the first member */}
          {isLoadingOwner ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ) : owner ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                  {owner.name.charAt(0).toUpperCase()}
                </div>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{owner.name}</p>
                <p className="text-xs text-muted-foreground">{owner.email}</p>
                <span className="inline-block mt-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  Owner
                </span>
              </div>
            </div>
          ) : null}

          {/* Placeholder for additional members */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Additional project members will be displayed here once member
              management is implemented.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
