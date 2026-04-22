"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Folder,
  Users,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isAdmin?: boolean;
}

interface Item {
  href: string;
  label: string;
  icon: React.ReactNode;
  admin?: boolean;
}

const items: Item[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/notes", label: "Notes", icon: <FileText size={18} /> },
  { href: "/files", label: "Files", icon: <Folder size={18} /> },
  { href: "/admin", label: "Admin", icon: <Users size={18} />, admin: true },
];

export function Sidebar({ collapsed, onToggle, isAdmin = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      router.push("/login");
    }
  };

  return (
    <div
      className={cn(
        "h-screen border-r border-slate-200 bg-white/90 p-4 backdrop-blur transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="mb-8 flex items-center justify-between">
        {!collapsed && <h2 className="text-xl font-extrabold tracking-tight text-slate-900">MySpace</h2>}
        <button
          onClick={onToggle}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      <nav className="flex flex-col gap-2">
        {items
          .filter((item) => (item.admin ? isAdmin : true))
          .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
      </nav>

      <div className="mt-auto flex flex-col gap-2 pt-8">
        <button className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </button>
        <Button variant="outline" onClick={onLogout} className="justify-start gap-3">
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
}
