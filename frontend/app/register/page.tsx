"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent>
          <h1 className="mb-2 text-2xl font-extrabold">Create Account</h1>
          <p className="mb-6 text-sm text-slate-500">Set up your secure MySpace workspace</p>
          <AuthForm mode="register" />
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{" "}
            <Link className="font-semibold text-blue-600 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
