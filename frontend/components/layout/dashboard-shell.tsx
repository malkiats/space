"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export function DashboardShell({
  children,
  isAdmin,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} isAdmin={isAdmin} />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
