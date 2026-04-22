"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { User } from "@/types";

export default function AdminPage() {
  const queryClient = useQueryClient();

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get<User>("/auth/me")).data,
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get<User[]>("/users")).data,
    enabled: me?.role === "admin",
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: "admin" | "user" }) => {
      await api.patch(`/users/${id}/role`, { role });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/users/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <ProtectedRoute requireAdmin>
      <DashboardShell isAdmin>
        <h1 className="mb-6 text-3xl font-extrabold">Admin Panel</h1>

        <Card>
          <CardContent>
            <h2 className="mb-4 text-lg font-semibold">User Management</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-sm text-slate-500">{user.email}</p>
                    <p className="text-xs text-slate-400">Role: {user.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        updateRoleMutation.mutate({
                          id: user.id,
                          role: user.role === "admin" ? "user" : "admin",
                        })
                      }
                    >
                      Make {user.role === "admin" ? "User" : "Admin"}
                    </Button>
                    <Button variant="danger" onClick={() => deleteMutation.mutate(user.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {!users.length && <p className="text-sm text-slate-500">No users found.</p>}
            </div>
          </CardContent>
        </Card>
      </DashboardShell>
    </ProtectedRoute>
  );
}
