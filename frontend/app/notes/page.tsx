"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Note, User } from "@/types";

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [search, setSearch] = useState("");

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<User>("/auth/me")).data,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ["notes", search],
    queryFn: async () => (await api.get<Note[]>(`/notes?q=${encodeURIComponent(search)}`)).data,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      await api.post("/notes", {
        title,
        content,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
    },
    onSuccess: () => {
      setTitle("");
      setContent("");
      setTags("");
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/notes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <ProtectedRoute>
      <DashboardShell isAdmin={me?.role === "admin"}>
        <h1 className="mb-6 text-3xl font-extrabold">Notes</h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardContent>
              <h2 className="mb-4 font-semibold">Create Note</h2>
              <div className="space-y-3">
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <textarea
                  className="min-h-32 w-full rounded-xl border border-slate-300 p-3 text-sm"
                  placeholder="Write your note..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Input
                  placeholder="Tags (comma separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <Button onClick={() => createMutation.mutate()} disabled={!title || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold">Your Notes</h2>
                <Input
                  placeholder="Search notes"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold">{note.title}</h3>
                      <Button variant="danger" size="sm" onClick={() => deleteMutation.mutate(note.id)}>
                        Delete
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">{note.content || "No content"}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {note.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {!notes.length && <p className="text-sm text-slate-500">No notes found.</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
