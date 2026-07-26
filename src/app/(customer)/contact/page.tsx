// src/app/contact/page.tsx
"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { useForm } from "react-hook-form";

interface ContactForm {
  name:    string;
  email:   string;
  phone?:  string;
  subject: string;
  message: string;
}

const CONTACT_INFO = [
  {
    icon: "📍",
    title: "Visit Us",
    lines: ["123 Anywhere St.", "Any City, State, Any Country"],
  },
  {
    icon: "📞",
    title: "Call Us",
    lines: ["(123) 456 7890", "Mon–Sat, 9am–6pm PST"],
  },
  {
    icon: "✉️",
    title: "Email Us",
    lines: ["hello@reallygreatsite.com", "We reply within 24 hours"],
  },
  {
    icon: "💬",
    title: "Social Media",
    lines: ["Facebook: KNL Atelier & Co.", "Instagram: @knlatelier"],
  },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>();

  async function onSubmit(data: ContactForm) {
    // Phase 2: await axios.post('/api/messages', data)
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    reset();
  }

  return (
    <div className="min-h-screen bg-dark">

      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#0d1f10,#152618)] py-24">
        <div className="knl-container text-center">
          <span className="section-label block mb-3">Get in Touch</span>
          <h1 className="section-title mb-4">Contact Us</h1>
          <p className="text-[14px] text-gray-mid max-w-md mx-auto">
            Have a question about a product? Want to check availability?
            We&apos;re here to help.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="knl-container">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-14">

            {/* Contact form */}
            <div>
              <h2 className="font-display text-2xl font-semibold text-white mb-6">
                Send us a message
              </h2>

              {submitted ? (
                <div className="bg-green-dark/30 border border-green-mid/30 rounded-2xl p-8 text-center">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="font-display text-xl text-white mb-2">Message received!</h3>
                  <p className="text-[13px] text-gray-mid mb-6">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-ghost"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="field-label">Your Name</label>
                      <input
                        {...register("name", { required: "Required" })}
                        className="form-input"
                        placeholder="Juan Dela Cruz"
                      />
                      {errors.name && <p className="field-error">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label className="field-label">Email</label>
                      <input
                        type="email"
                        {...register("email", {
                          required: "Required",
                          pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                        })}
                        className="form-input"
                        placeholder="juan@email.com"
                      />
                      {errors.email && <p className="field-error">{errors.email.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Phone (Optional)</label>
                    <input
                      {...register("phone")}
                      className="form-input"
                      placeholder="09XX XXX XXXX"
                    />
                  </div>

                  <div>
                    <label className="field-label">Subject</label>
                    <select
                      {...register("subject", { required: "Please select a subject" })}
                      className="form-input"
                    >
                      <option value="" disabled>Select a topic</option>
                      <option value="product_inquiry">Product Inquiry</option>
                      <option value="order_status">Order Status</option>
                      <option value="return_refund">Return / Refund</option>
                      <option value="authentication">Authenticity Question</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && <p className="field-error">{errors.subject.message}</p>}
                  </div>

                  <div>
                    <label className="field-label">Message</label>
                    <textarea
                      {...register("message", {
                        required:  "Message is required",
                        minLength: { value: 10, message: "At least 10 characters" },
                      })}
                      rows={5}
                      className="form-input resize-none"
                      placeholder="Tell us how we can help you…"
                    />
                    {errors.message && <p className="field-error">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary py-3.5 disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Contact info cards */}
            <div className="space-y-4">
              {CONTACT_INFO.map((item) => (
                <div
                  key={item.title}
                  className="bg-card border border-white/5 rounded-2xl p-5 flex gap-4 items-start hover:border-green-mid/30 transition-all"
                >
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-utility text-[11px] tracking-[2px] uppercase text-green-light mb-1">
                      {item.title}
                    </p>
                    {item.lines.map((line) => (
                      <p key={line} className="text-[13px] text-gray-light">{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Business hours */}
              <div className="bg-card border border-white/5 rounded-2xl p-5">
                <p className="font-utility text-[11px] tracking-[2px] uppercase text-green-light mb-3">
                  Business Hours
                </p>
                {[
                  ["Monday – Friday", "9:00 AM – 6:00 PM"],
                  ["Saturday",        "10:00 AM – 4:00 PM"],
                  ["Sunday",          "Closed"],
                ].map(([day, hours]) => (
                  <div key={day} className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-gray-mid">{day}</span>
                    <span className="text-white">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .form-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; font-size:13px; color:white; outline:none; transition:border-color 0.2s; }
        .form-input::placeholder { color:#888; }
        .form-input:focus { border-color:#2d6a35; }
        .field-label { display:block; font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#888; margin-bottom:6px; }
        .field-error { font-size:11px; color:#f87171; margin-top:4px; }
      `}</style>
    </div>
  );
}
