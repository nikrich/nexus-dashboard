import { FolderKanban } from "lucide-react";

export function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <FolderKanban className="size-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating your first project.
      </p>
    </div>
  );
}
