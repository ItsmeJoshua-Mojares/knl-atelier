// tailwind.config.ts
// ─────────────────────────────────────────────────────────────
// This file defines EVERY color, font, and spacing value used
// across the entire KNL Atelier website.
//
// Think of it as a "dictionary" Tailwind reads before it builds
// your CSS. Instead of writing `color: #2d6a35` scattered across
// dozens of files, you write `text-green-mid` and Tailwind knows
// exactly what color that is because it's defined here.
// ─────────────────────────────────────────────────────────────

import type { Config } from "tailwindcss";

const config: Config = {
  // Tell Tailwind WHERE to look for class names.
  // It only includes CSS for classes it actually finds in these files.
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // ── COLORS ──────────────────────────────────────────────
      // We add these ON TOP of Tailwind's default colors.
      // Usage: bg-dark, text-gold, border-green-mid, etc.
      colors: {
        // Dark backgrounds
        dark:    "#0e0e0e",   // deepest background
        mid:     "#1a1a1a",   // slightly lighter background
        card:    "#141414",   // card/panel background
        section: "#111111",   // alternating section background

        // KNL signature green (from the logo)
        green: {
          dark:    "#1a3a1f",
          mid:     "#2d6a35",
          accent:  "#3d8b46",
          light:   "#5cb85c",
          hero:    "#4a7c52",
        },

        // Luxury gold accent
        gold: {
          DEFAULT: "#c9a84c",
          light:   "#e0c068",
          dark:    "#a07830",
        },

        // Text shades
        "off-white": "#f5f2ed",
        "gray-light": "#c8c8c8",
        "gray-mid":   "#888888",
        "gray-dark":  "#444444",
      },

      // ── FONTS ───────────────────────────────────────────────
      // These match the Google Fonts we load in layout.tsx.
      // Usage: font-display (headings), font-body (paragraphs),
      //        font-utility (labels, buttons, badges)
      fontFamily: {
        display: ["Playfair Display", "Georgia", "serif"],
        body:    ["Inter", "system-ui", "sans-serif"],
        utility: ["Rajdhani", "system-ui", "sans-serif"],
      },

      // ── ANIMATIONS ──────────────────────────────────────────
      // Custom keyframe animations used for the floating watch
      // on the hero section and skeleton loading states.
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        "slide-in": {
          from: { transform: "translateX(40px)", opacity: "0" },
          to:   { transform: "translateX(0)",    opacity: "1" },
        },
        "fade-up": {
          from: { transform: "translateY(30px)", opacity: "0" },
          to:   { transform: "translateY(0)",    opacity: "1" },
        },
      },
      animation: {
        float:      "float 6s ease-in-out infinite",
        shimmer:    "shimmer 1.5s infinite",
        "slide-in": "slide-in 0.3s ease",
        "fade-up":  "fade-up 0.5s ease forwards",
      },

      // ── BORDER RADIUS ───────────────────────────────────────
      borderRadius: {
        "4xl": "2rem",   // very large cards
      },
    },
  },

  plugins: [],
};

export default config;
