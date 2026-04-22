"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, FileText, Folder, Users } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Note, FileRecord, User } from "@/types";

export default function DashboardPage() {
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<User>("/auth/me")).data,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", "recent"],
    queryFn: async () => (await api.get<Note[]>("/notes?limit=3")).data,
  });

  const { data: files = [] } = useQuery({
    queryKey: ["files", "recent"],
    queryFn: async () => (await api.get<FileRecord[]>("/files?limit=5")).data,
  });

  return (
    <ProtectedRoute>
      <DashboardShell isAdmin={me?.role === "admin"}>
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
            <p className="text-slate-500">Welcome back, {me?.full_name || me?.username || "User"}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input placeholder="Search notes, files..." className="w-64 pl-8" />
            </div>
            <Button>New Note</Button>
            <Button variant="outline">Upload File</Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Notes</p>
              <p className="text-2xl font-bold">{notes.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Files</p>
              <p className="text-2xl font-bold">{files.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="text-2xl font-bold capitalize">{me?.role || "user"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Storage</p>
              <p className="text-2xl font-bold">-</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Recent Notes</h2>
              <div className="space-y-2">
                {notes.length ? (
                  notes.map((note) => (
                    <div key={note.id} className="rounded-xl bg-slate-100 p-3">
                      <p className="font-semibold">{note.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-1">{note.content || "No content"}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No notes yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-4 text-lg font-semibold">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <Button className="justify-start gap-2"><FileText size={16} />Create Note</Button>
                <Button variant="outline" className="justify-start gap-2"><Folder size={16} />Upload File</Button>
                <Button variant="secondary" className="justify-start gap-2"><Users size={16} />Manage Users</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
