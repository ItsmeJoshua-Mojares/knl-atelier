// src/components/ui/MotionProvider.tsx
// ─────────────────────────────────────────────────────────────
// Low-end phone performance guard.
//
// MotionConfig reducedMotion="user" tells framer-motion to
// SKIP transform/layout animations for anyone who has turned on
// "reduce motion" in their OS (very common on low-end Android
// phones, battery saver, and for accessibility). Opacity fades
// still run, so the hero crossfade and drag carousels keep
// working — they just stop doing expensive layout animation.
// ─────────────────────────────────────────────────────────────

"use client";

import { MotionConfig } from "framer-motion";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
