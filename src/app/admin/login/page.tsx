// src/app/admin/login/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Why a separate login page from the customer /login?
//
// Both hit the SAME /auth/login endpoint — Laravel doesn't have
// a separate "admin login" API. The difference is entirely on
// the frontend:
//   1. After login, we check user.role.name client-side
//   2. If it's not admin/super_admin, we reject the session
//      EVEN THOUGH the JWT itself is technically valid — a
//      customer's correct password still shouldn't grant access
//      to /admin/*
//   3. We store into useAdminStore, not useAuthStore, so the
//      admin section's auth state is independent of any customer
//      session that might exist in the same browser
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAdminStore } from "@/store/adminStore";
import { authApi } from "@/lib/api/client";

interface LoginForm {
  email:    string;
  password: string;
}

export default function AdminLoginPage() {
  const router    = useRouter();
  const setAdmin  = useAdminStore((s) => s.setAdmin);
  const [apiError, setApiError] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginForm>();

  async function onSubmit(data: LoginForm) {
    setApiError("");
    try {
      const res = await authApi.login(data.email, data.password);
      const { user, token } = res.data.data;

      // Client-side role gate — reject non-admin accounts even
      // though their credentials were valid. The API itself also
      // enforces this on every subsequent admin request via
      // role:admin middleware, so this check is a UX nicety,
      // not the actual security boundary.
      const roleName = user.role?.name;
      if (roleName !== "admin" && roleName !== "super_admin") {
        setApiError("This account does not have admin access.");
        return;
      }

      setAdmin(user, token);
      router.push("/admin/dashboard");

    } catch (err: any) {
      setApiError(
        err.response?.data?.message ?? "Login failed. Please try again."
      );
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-utility text-3xl font-bold mb-1">
            <span className="text-green-light">KNL</span>
          </div>
          <div className="font-body text-[9px] tracking-[3.5px] uppercase text-gold">
            Atelier &amp; Co. — Admin
          </div>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8">
          <h1 className="font-display text-xl font-semibold text-white mb-1">
            Admin Sign In
          </h1>
          <p className="text-[13px] text-gray-mid mb-6">
            Authorized personnel only.
          </p>

          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-[13px] text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="field-label">Email Address</label>
              <input
                suppressHydrationWarning
                type="email"
                {...register("email", { required: "Required" })}
                className="form-input"
                placeholder="admin@knlatelier.com"
                autoComplete="email"
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="field-label">Password</label>
              <input
                suppressHydrationWarning
                type="password"
                {...register("password", { required: "Required" })}
                className="form-input"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {errors.password && <p className="field-error">{errors.password.message}</p>}
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
        </div>

        <p className="text-center text-[11px] text-gray-dark mt-6">
          KNL Atelier &amp; Co. internal system. Unauthorized access is prohibited.
        </p>
      </div>

      <style jsx global>{`
        .form-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; font-size:13px; color:white; outline:none; transition:border-color 0.2s; }
        .form-input:focus { border-color:#2d6a35; }
        .field-label { display:block; font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#888; margin-bottom:6px; }
        .field-error { font-size:11px; color:#f87171; margin-top:4px; }
      `}</style>
    </div>
  );
}
