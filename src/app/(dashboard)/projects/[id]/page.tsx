"use client";

import { use } from "react";
import { useProject, useProjectMembers, useRemoveProjectMember } from "@/hooks/use-project-queries";
import { useUser } from "@/hooks/use-user-queries";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CalendarDays, User, Trash2 } from "lucide-react";
import { AddMemberDialog } from "@/features/projects/add-member-dialog";
import { toast } from "sonner";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

interface MemberRowProps {
  member: {
    id: string;
    userId: string;
    role: string;
  };
  onRemove: (memberId: string) => void;
  getRoleBadgeColor: (role: string) => string;
}

function MemberRow({ member, onRemove, getRoleBadgeColor }: MemberRowProps) {
  const { data: userResponse, isLoading } = useUser(member.userId);
  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <span className={`inline-block mt-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getRoleBadgeColor(member.role)}`}>
            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(member.id)}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { data: projectResponse, isLoading: isLoadingProject } = useProject(id);
  const project = projectResponse?.data;

  const { data: ownerResponse, isLoading: isLoadingOwner } = useUser(
    project?.ownerId ?? ""
  );
  const owner = ownerResponse?.data;

  const { data: membersResponse, isLoading: isLoadingMembers } = useProjectMembers(id);
  const members = membersResponse?.data || [];

  const removeMember = useRemoveProjectMember(id);

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

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      await removeMember.mutateAsync(memberId);
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove member");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-blue-50 text-blue-700 ring-blue-700/10";
      case "admin":
        return "bg-purple-50 text-purple-700 ring-purple-700/10";
      case "member":
        return "bg-green-50 text-green-700 ring-green-700/10";
      case "viewer":
        return "bg-gray-50 text-gray-700 ring-gray-700/10";
      default:
        return "bg-gray-50 text-gray-700 ring-gray-700/10";
    }
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Project Members</h2>
          {project && (
            <AddMemberDialog
              projectId={project.id}
              ownerId={project.ownerId}
              existingMemberIds={[
                project.ownerId,
                ...members.map((m) => m.userId),
              ]}
            />
          )}
        </div>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{owner.name}</p>
                  <p className="text-xs text-muted-foreground">{owner.email}</p>
                  <span className={`inline-block mt-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getRoleBadgeColor("owner")}`}>
                    Owner
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Additional members */}
          {isLoadingMembers ? (
            <div className="pt-4 border-t space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length > 0 ? (
            <div className="pt-4 border-t space-y-4">
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onRemove={handleRemoveMember}
                  getRoleBadgeColor={getRoleBadgeColor}
                />
              ))}
            </div>
          ) : (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                No additional members yet. Add members to collaborate on this project.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
