// src/components/home/HeroSection.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// "use client" is needed because we use Framer Motion, which
// requires the browser to run its animations.
//
// Framer Motion (motion.div, motion.h1) — a React animation
// library. You add animation props directly to elements:
//   initial  — the starting state (invisible, offset down)
//   animate  — the ending state (visible, in position)
//   transition — HOW it animates (duration, delay, easing)
//
// This creates a "staggered reveal" — each element fades in
// slightly after the previous one, which looks polished and
// professional compared to everything appearing at once.
// ─────────────────────────────────────────────────────────────

"use client";

import { motion } from "framer-motion";
import Link from "next/link";

// Reusable animation variant — items fade up into view
// We define this once and reuse it for each element
const fadeUp = {
  initial:    { opacity: 0, y: 30 },
  animate:    { opacity: 1, y: 0 },
  // transition goes on the element itself, not here
};

export default function HeroSection() {
  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden bg-[#0d1f10]`}>
      {/* ── Background leaf decorations ───────────────────── */}
      {/* These are pure CSS shapes that mimic the PDF's botanical theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-right glow */}
        <div className={`absolute top-0 right-0 w-[55%] h-full bg-[radial-gradient(ellipse_at_top_right,rgba(74,124,82,0.15)_0%,transparent_65%)]`} />
        {/* Bottom-left glow */}
        <div className={`absolute bottom-0 left-0 w-[45%] h-[70%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(30,60,34,0.2)_0%,transparent_70%)]`} />
      </div>

      {/* ── Main content grid ──────────────────────────────── */}
      {/* Two columns on desktop, one column on mobile */}
      <div className="knl-container relative z-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

          {/* Left column: Text content */}
          <div>
            {/* Breadcrumb */}
            <motion.p
              {...fadeUp}
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-utility text-[11px] tracking-[3px] uppercase text-green-light opacity-80 mb-6"
            >
              &gt;&gt; KNL Atelier &amp; Co.
            </motion.p>

            {/* "Welcome to" label */}
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-utility text-[11px] tracking-[4px] uppercase text-gray-mid block mb-2"
            >
              Welcome to
            </motion.span>

            {/* KNL monogram — the big logo */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <span className={`block font-utility font-bold leading-[0.85] text-[clamp(72px,10vw,120px)] tracking-[-6px] text-white`}>
                <span className="text-green-light">K</span>NL
              </span>
              <span className={`block font-utility text-[clamp(14px,2vw,20px)] tracking-[8px] uppercase text-gray-light mt-2`}>
                Atelier &amp; Co.
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className={`font-display text-[clamp(22px,3vw,34px)] font-normal text-off-white italic leading-[1.4] mt-7 mb-3`}
            >
              Authentic Luxury, Yours to Wear
            </motion.h1>

            {/* Sub-text */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-[14px] text-gray-mid max-w-[340px] leading-[1.7] mb-9"
            >
              Curated watches, fragrances, shoes &amp; accessories —
              all genuine, all exceptional.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex gap-4 flex-wrap"
            >
              <Link href="/shop" className="btn-primary">
                Browse Now
                {/* Arrow icon */}
                <svg width="14" height="14" viewBox="0 0 24 24"
                     fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/categories" className="btn-ghost">
                Shop by Category
              </Link>
            </motion.div>
          </div>

          {/* Right column: Floating product visual */}
          {/* hidden on mobile (lg:flex shows on large screens only) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex items-center justify-center"
          >
            {/*
              In Phase 1, we use a placeholder SVG watch illustration.
              In Phase 2, replace this with:
              <Image src="/images/hero-watch.png" alt="Featured watch" ... />
            */}
            <div className="relative w-full max-w-[460px] animate-float">
              {/* Placeholder watch circle */}
              <div className={`w-72 h-72 mx-auto rounded-full border-[3px] border-green-mid/40 bg-[#1a2a1c] flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.7)]`}>
                <div className={`w-56 h-56 rounded-full bg-[#0e1a10] border border-green-dark flex items-center justify-center flex-col gap-1`}>
                  <span className="font-utility text-[10px] tracking-[4px] text-green-light/60 uppercase">
                    Seiko
                  </span>
                  <span className="font-display text-5xl font-bold text-white/10">
                    KNL
                  </span>
                  <span className="font-utility text-[8px] tracking-[2px] text-white/20 uppercase">
                    Automatic
                  </span>
                </div>
              </div>

              {/* KNL watermark badge */}
              <div className={`absolute bottom-4 right-4 bg-green-dark/80 border border-green-mid/40 rounded-lg px-3 py-2`}>
                <span className="font-utility text-[10px] tracking-[2px] text-green-light uppercase">
                  100% Authentic
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Scroll hint ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2`}
      >
        <span className="font-utility text-[10px] tracking-[3px] uppercase text-white">
          Scroll
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="white" strokeWidth="2"
             className="animate-bounce">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
