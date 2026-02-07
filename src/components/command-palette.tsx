"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjects } from "@/hooks/use-project-queries";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText } from "lucide-react";

export function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch projects with search
  const { data, isLoading } = useProjects({ search });
  const projects = data?.data.items || [];

  // Handle keyboard shortcut (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectProject = (projectId: string) => {
    router.push(`/projects/${projectId}`);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Search Projects"
      description="Search across all your projects"
      showCloseButton={false}
    >
      <CommandInput
        placeholder="Search projects..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isLoading && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        )}

        {!isLoading && search && projects.length === 0 && (
          <CommandEmpty>No projects found</CommandEmpty>
        )}

        {!isLoading && search && projects.length > 0 && (
          <CommandGroup heading="Projects">
            {projects.map((project) => (
              <CommandItem
                key={project.id}
                value={`${project.name} ${project.description}`}
                onSelect={() => handleSelectProject(project.id)}
              >
                <FileText />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{project.name}</span>
                  {project.description && (
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {project.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!search && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Start typing to search projects...
          </div>
        )}
      </CommandList>
    </CommandDialog>
  );
}
