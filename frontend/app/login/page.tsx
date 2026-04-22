"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent>
          <h1 className="mb-2 text-2xl font-extrabold">Welcome Back</h1>
          <p className="mb-6 text-sm text-slate-500">Sign in to access your workspace</p>
          <AuthForm mode="login" />
          <p className="mt-4 text-sm text-slate-600">
            No account?{" "}
            <Link className="font-semibold text-blue-600 hover:underline" href="/register">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
