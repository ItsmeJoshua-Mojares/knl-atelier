// src/app/login/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/cartStore";
import { authApi } from "@/lib/api/client";
import type { Metadata } from "next";

interface LoginForm {
  email:    string;
  password: string;
}

export default function LoginPage() {
  const router  = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const { isLoggedIn } = useAuthStore();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>();

  async function onSubmit(data: LoginForm) {
    setApiError("");
    try {
      const res    = await authApi.login(data.email, data.password);
      const { user, token } = res.data.data;
      setAuth(user, token);
      router.push(redirectTo);
    } catch (err: any) {
      setApiError(
        err.response?.data?.message ?? "Login failed. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-utility text-3xl font-bold mb-1">
            <span className="text-green-light">KNL</span>
          </div>
          <div className="font-body text-[9px] tracking-[3.5px] uppercase text-gold">
            Atelier &amp; Co.
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8">
          <h1 className="font-display text-2xl font-semibold text-white mb-1">
            Welcome back
          </h1>
          <p className="text-[13px] text-gray-mid mb-7">
            Sign in to your account to continue.
          </p>

          {isLoggedIn && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-5 text-center">
              <p className="text-[13px] text-green-400">You are already signed in.</p>
              <Link href="/" className="text-[11px] font-utility font-semibold tracking-wide text-green-light hover:text-white transition-colors mt-2 inline-block">
                Back to Home →
              </Link>
            </div>
          )}

          {/* API error */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-[13px] text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[12px] font-utility tracking-wide uppercase text-gray-mid mb-1.5">
                Email Address
              </label>
              <input
                suppressHydrationWarning
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                })}
                className="form-input"
                placeholder="juan@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[12px] font-utility tracking-wide uppercase text-gray-mid">
                  Password
                </label>
                <Link href="/forgot-password"
                      className="text-[11px] text-green-light hover:text-white transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                suppressHydrationWarning
                type="password"
                {...register("password", { required: "Password is required" })}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && (
                <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3.5 mt-2 disabled:opacity-60"
            >
              {isSubmitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-mid mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-green-light hover:text-white transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 10px 14px; font-size: 13px; color: white; outline: none;
          transition: border-color 0.2s;
        }
        .form-input::placeholder { color: #888; }
        .form-input:focus { border-color: #2d6a35; }
      `}</style>
    </div>
  );
}
