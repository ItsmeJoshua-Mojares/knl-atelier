// src/app/forgot-password/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Two-phase UI (form → success state)
//
// Instead of navigating to a new page after submission, we swap
// the JSX inside the same component by toggling a `submitted`
// boolean. This is fast (no page load) and keeps the user on
// the same URL so they can retry easily.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface ForgotForm {
  email: string;
}

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>();

  async function onSubmit(data: ForgotForm) {
    // Phase 2: call authApi.forgotPassword(data.email)
    await new Promise((r) => setTimeout(r, 1000));
    setSentEmail(data.email);
    setSubmitted(true);
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

          {!submitted ? (
            /* ── Request form ─────────────────────────────── */
            <>
              {/* Back arrow */}
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[12px] text-gray-mid hover:text-white transition-colors mb-6"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back to Login
              </Link>

              <h1 className="font-display text-2xl font-semibold text-white mb-2">
                Forgot your password?
              </h1>
              <p className="text-[13px] text-gray-mid mb-7">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:   /\S+@\S+\.\S+/,
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full justify-center py-3.5 disabled:opacity-60"
                >
                  {isSubmitting ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ────────────────────────────── */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-dark border border-green-mid/40 flex items-center justify-center mx-auto mb-6">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="#5cb85c" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>

              <h2 className="font-display text-2xl font-semibold text-white mb-3">
                Check your email
              </h2>
              <p className="text-[13px] text-gray-mid leading-relaxed mb-2">
                We sent a password reset link to:
              </p>
              <p className="text-[14px] text-white font-semibold mb-6">
                {sentEmail}
              </p>
              <p className="text-[12px] text-gray-dark mb-8">
                Didn&apos;t receive it? Check your spam folder or{" "}
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-green-light hover:text-white transition-colors underline"
                >
                  try again
                </button>
                .
              </p>
              <Link href="/login" className="btn-primary justify-center">
                Back to Login
              </Link>
            </div>
          )}
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
        .field-label {
          display: block; font-family: 'Rajdhani', sans-serif;
          font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
          color: #888; margin-bottom: 6px;
        }
        .field-error { font-size: 11px; color: #f87171; margin-top: 4px; }
      `}</style>
    </div>
  );
}
