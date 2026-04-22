"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthFormProps {
  mode: "login" | "register";
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string" && detail.length > 0) return detail;
  }
  return fallback;
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      setError(getErrorMessage(error, "Failed to login"));
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/register/request-otp", {
        email,
        username,
        full_name: fullName || null,
      });
      return true;
    },
    onSuccess: () => {
      setOtpRequested(true);
      setSuccess("Verification code sent to your email");
    },
    onError: (error: unknown) => {
      setError(getErrorMessage(error, "Failed to register"));
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      await api.post("/auth/register/verify", {
        email,
        otp_code: otpCode,
        password,
      });
      const loginResponse = await api.post("/auth/login", { email, password });
      return loginResponse.data;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      setError(getErrorMessage(error, "Failed to verify code"));
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "login") {
      loginMutation.mutate();
    } else {
      if (otpRequested) {
        verifyOtpMutation.mutate();
      } else {
        registerMutation.mutate();
      }
    }
  };

  const isPending =
    loginMutation.isPending || registerMutation.isPending || verifyOtpMutation.isPending;

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {mode === "register" && (
        <>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            disabled={otpRequested}
          />
          <Input
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={otpRequested}
          />
        </>
      )}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={otpRequested}
      />
      {mode === "register" && otpRequested && (
        <Input
          placeholder="Verification code"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          required
          minLength={6}
          maxLength={6}
        />
      )}
      <Input
        type="password"
        placeholder={mode === "register" ? "Set Password" : "Password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required={mode === "login" || otpRequested}
        minLength={8}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending
          ? "Please wait..."
          : mode === "login"
          ? "Sign In"
          : otpRequested
          ? "Verify Code & Create Account"
          : "Send Verification Code"}
      </Button>
    </form>
  );
}
