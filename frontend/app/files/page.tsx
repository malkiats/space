"use client";

import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { FileRecord, User } from "@/types";

export default function FilesPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<User>("/auth/me")).data,
  });

  const { data: files = [] } = useQuery({
    queryKey: ["files"],
    queryFn: async () => (await api.get<FileRecord[]>("/files")).data,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);
      await api.post("/files/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["files"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/files/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["files"] }),
  });

  const onPick = () => inputRef.current?.click();

  return (
    <ProtectedRoute>
      <DashboardShell isAdmin={me?.role === "admin"}>
        <h1 className="mb-6 text-3xl font-extrabold">Files</h1>

        <Card className="mb-6">
          <CardContent className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Upload to Cloudflare R2</p>
              <p className="text-sm text-slate-500">Max file size is 50MB</p>
            </div>
            <>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                }}
              />
              <Button onClick={onPick} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Select File"}
              </Button>
            </>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">Your Files</h2>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium">{file.original_filename}</p>
                    <p className="text-sm text-slate-500">{(file.size_bytes / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const response = await api.get(`/files/${file.id}/download`);
                        window.open(response.data.download_url, "_blank");
                      }}
                    >
                      Download
                    </Button>
                    <Button variant="danger" onClick={() => deleteMutation.mutate(file.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {!files.length && <p className="text-sm text-slate-500">No files uploaded yet.</p>}
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
