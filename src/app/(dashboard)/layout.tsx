export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar placeholder - DASH-003 */}
      <aside className="hidden w-60 border-r bg-sidebar lg:block">
        <div className="flex h-14 items-center border-b px-4 font-semibold">
          Nexus Dashboard
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        {/* Header placeholder - DASH-003 */}
        <header className="flex h-14 items-center border-b px-6">
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
