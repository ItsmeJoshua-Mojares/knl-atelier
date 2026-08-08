// src/components/home/Newsletter.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// React Hook Form — a library for managing form state. It's much
// better than useState for forms because:
// - It doesn't re-render the component on every keystroke
// - It handles validation in one place
// - It gives you built-in error messages
//
// useForm() returns:
//   register — connects an input to the form
//   handleSubmit — wraps your submit function with validation
//   formState — contains errors and submission state
//
// The `{...register("email", { required: true })}` syntax
// spreads event handlers onto the input so React Hook Form
// can track its value without you writing any useState.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import apiClient from "@/lib/api/client";

// The shape of data this form collects
interface NewsletterFormData {
  email: string;
}

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  // Initialize React Hook Form
  const {
    register,        // connects inputs to the form
    handleSubmit,    // wraps submit with validation
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NewsletterFormData>();

  // Called only if validation passes
  async function onSubmit(data: NewsletterFormData) {
    setApiError("");
    try {
      // POST the email to Laravel → saved in newsletter_subscribers
      const res = await apiClient.post("/newsletter/subscribe", {
        email: data.email,
      });
      setSubmitted(true);
      reset(); // Clear the form
    } catch (err: any) {
      setApiError(
        err.response?.data?.message ?? "Something went wrong. Please try again."
      );
    }
  }

  return (
    <section className={`py-20 relative overflow-hidden bg-[linear-gradient(135deg,#0d1f11_0%,#152618_50%,#0e1a10_100%)]`}>
      <div className="knl-container">
        <div className="text-center max-w-[580px] mx-auto">

          <span className="section-label block mb-3">Stay Updated</span>
          <h2 className="section-title mb-4">
            New Arrivals &amp; Exclusive Deals
          </h2>
          <p className="text-[14px] text-gray-mid mb-7">
            Be first to know about new Seiko drops, flash sales,
            and member-only discounts.
          </p>

          {/* Success state */}
          {submitted ? (
            <div className={`flex items-center justify-center gap-3 bg-green-dark/50 border border-green-mid/40 rounded-full py-4 px-6`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="#5cb85c" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="font-utility text-[14px] tracking-wide text-white">
                You&apos;re subscribed! Welcome to KNL Atelier.
              </span>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={`flex overflow-hidden rounded-full border border-white/10`}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  // Register this input with React Hook Form
                  // The options object adds validation rules
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Enter a valid email address",
                    },
                  })}
                  className={`flex-1 bg-white/5 border-none px-6 py-4 text-[14px] text-white placeholder:text-gray-mid outline-none`}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-green-mid text-white font-utility text-[13px] font-bold tracking-[1.5px] uppercase px-7 py-4 flex-shrink-0 hover:bg-green-accent transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? "..." : "Subscribe"}
                </button>
              </div>

              {/* Show validation error below the input */}
              {errors.email && (
                <p className="text-red-400 text-[12px] mt-2 text-left pl-4">
                  {errors.email.message}
                </p>
              )}

              {/* Show API error (e.g. network failure) below the input */}
              {apiError && (
                <p className="text-red-400 text-[12px] mt-2 text-left pl-4">
                  {apiError}
                </p>
              )}
            </form>
          )}

          <p className="text-[11px] text-gray-dark mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
