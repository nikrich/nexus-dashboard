"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, Bell, Webhook } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: Settings,
  },
  {
    title: "Preferences",
    href: "/settings/preferences",
    icon: Bell,
  },
  {
    title: "Webhooks",
    href: "/settings/webhooks",
    icon: Webhook,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* Settings Navigation Sidebar */}
        <nav className="w-full lg:w-48 flex-shrink-0">
          <div className="space-y-1">
            {settingsNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <div className="rounded-lg border bg-card p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
