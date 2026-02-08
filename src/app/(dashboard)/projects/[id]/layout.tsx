"use client";

import { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Kanban, LayoutList } from "lucide-react";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = use(params);
  const pathname = usePathname();

  const tabs = [
    { label: "Overview", href: `/projects/${id}`, icon: LayoutDashboard, exact: true },
    { label: "Board", href: `/projects/${id}/board`, icon: Kanban },
    { label: "List", href: `/projects/${id}/list`, icon: LayoutList },
  ];

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 border-b">
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              )}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
