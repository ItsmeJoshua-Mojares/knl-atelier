// src/app/register/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Password confirmation field
//
// React Hook Form's `watch("password")` reads the live value
// of the password field. We pass it into the `validate` rule
// of password_confirmation so it can compare both values.
//
// This is cleaner than a manual onChange handler because
// React Hook Form manages both fields simultaneously and
// re-validates automatically when either field changes.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuthStore } from "@/store/cartStore";
import { authApi } from "@/lib/api/client";

interface RegisterForm {
  first_name:            string;
  last_name:             string;
  email:                 string;
  phone:                 string;
  password:              string;
  password_confirmation: string;
}

export default function RegisterPage() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  // Watch the password field so we can compare it in the confirm rule
  const passwordValue = watch("password");

  async function onSubmit(data: RegisterForm) {
    setApiError("");
    try {
      const res = await authApi.register({
        first_name:            data.first_name,
        last_name:             data.last_name,
        email:                 data.email,
        password:              data.password,
        password_confirmation: data.password_confirmation,
        phone:                 data.phone,
      });
      const { user, token } = res.data.data;
      setAuth(user, token);
      router.push("/dashboard");
    } catch (err: any) {
      // Laravel returns validation errors as an object
      const message =
        err.response?.data?.message ??
        Object.values(err.response?.data?.errors ?? {})[0] ??
        "Registration failed. Please try again.";
      setApiError(String(message));
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
            Create an account
          </h1>
          <p className="text-[13px] text-gray-mid mb-7">
            Join KNL Atelier &amp; Co. and start shopping.
          </p>

          {/* API-level error (e.g. email already taken) */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
              <p className="text-[13px] text-red-400">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label">First Name</label>
                <input
                  {...register("first_name", { required: "Required" })}
                  className="form-input"
                  placeholder="Juan"
                />
                {errors.first_name && (
                  <p className="field-error">{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label className="field-label">Last Name</label>
                <input
                  {...register("last_name", { required: "Required" })}
                  className="form-input"
                  placeholder="Dela Cruz"
                />
                {errors.last_name && (
                  <p className="field-error">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="field-label">Email Address</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value:   /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Enter a valid email address",
                  },
                })}
                className="form-input"
                placeholder="juan@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="field-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="field-label">Phone Number</label>
              <input
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value:   /^09\d{9}$/,
                    message: "Enter a valid PH number (09XX XXX XXXX)",
                  },
                })}
                className="form-input"
                placeholder="09XX XXX XXXX"
                autoComplete="tel"
              />
              {errors.phone && (
                <p className="field-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="field-label">Password</label>
              <input
                type="password"
                {...register("password", {
                  required:  "Password is required",
                  minLength: { value: 8, message: "At least 8 characters" },
                })}
                className="form-input"
                placeholder="Min. 8 characters"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="field-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label className="field-label">Confirm Password</label>
              <input
                type="password"
                {...register("password_confirmation", {
                  required: "Please confirm your password",
                  // Compare against the watched password value
                  validate: (val) =>
                    val === passwordValue || "Passwords do not match",
                })}
                className="form-input"
                placeholder="Re-enter your password"
                autoComplete="new-password"
              />
              {errors.password_confirmation && (
                <p className="field-error">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Terms agreement */}
            <p className="text-[11px] text-gray-dark leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="/terms" className="text-green-light hover:underline">
                Terms &amp; Conditions
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-green-light hover:underline">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-mid mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-green-light hover:text-white transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input::placeholder { color: #888; }
        .form-input:focus { border-color: #2d6a35; }
        .field-label {
          display: block;
          font-family: 'Rajdhani', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 6px;
        }
        .field-error {
          font-size: 11px;
          color: #f87171;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}
