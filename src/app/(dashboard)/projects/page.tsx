"use client";

import { useProjects } from "@/hooks/use-project-queries";
import { CreateProjectDialog } from "@/features/projects/create-project-dialog";
import { ProjectCard } from "@/features/projects/project-card";
import { ProjectListSkeleton } from "@/features/projects/project-list-skeleton";
import { EmptyProjects } from "@/features/projects/empty-projects";

export default function ProjectsPage() {
  const { data, isLoading, isError } = useProjects();
  const projects = data?.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            View and manage your projects.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {isLoading && <ProjectListSkeleton />}

      {isError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load projects. Please try again.
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && <EmptyProjects />}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
