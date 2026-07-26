// next.config.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: next.config.ts
//
// This file controls how Next.js builds and runs your app.
// It's read at startup — changes require restarting `npm run dev`.
//
// Key settings here:
//
// images.remotePatterns — Next.js <Image> component optimises
//   images automatically (resize, compress, convert to WebP).
//   But it only does this for approved domains. If you use an
//   image from an unapproved domain, Next.js throws an error.
//   We approve: your own domain, Cloudinary (Phase 6 storage),
//   and localhost for development.
//
// env — expose server-side env vars to the browser.
//   Variables starting with NEXT_PUBLIC_ are automatically
//   exposed. Others are server-only (more secure).
// ─────────────────────────────────────────────────────────────

import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  // ── Image optimisation domains ──────────────────────────────
  images: {
    remotePatterns: [
      {
        // Your production domain (update when you deploy)
        protocol: "https",
        hostname: "knlatelier.com",
      },
      {
        // Cloudinary — Phase 6 image storage
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        // AWS S3 — alternative image storage
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        // Local Laravel dev server (for uploaded product images)
        protocol: "http",
        hostname: "localhost",
        port:     "8000",
      },
      {
        // Local Laravel dev server via IP (for uploaded product images)
        protocol: "http",
        hostname: "127.0.0.1",
        port:     "8000",
      },
      {
        // Railway production deployment (Laravel API)
        protocol: "https",
        hostname: "*.up.railway.app",
      },
      {
        // Render production deployment (Laravel API)
        protocol: "https",
        hostname: "*.onrender.com",
      },
      {
        // Vercel deployment (self)
        protocol: "https",
        hostname: "*.vercel.app",
      },
      {
        // Netlify deployment (self)
        protocol: "https",
        hostname: "*.netlify.app",
      },
    ],
  },

  // ── TypeScript strict mode ──────────────────────────────────
  // Build will fail if there are type errors (catches bugs early)
  typescript: {
    ignoreBuildErrors: false,
  },

  // ── ESLint ──────────────────────────────────────────────────
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Headers ─────────────────────────────────────────────────
  // Add security headers to every response
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking attacks
          { key: "X-Frame-Options",        value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send referrer for same-origin requests
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────────
  // Permanent redirects for old URLs (useful after site migrations)
  async redirects() {
    return [
      // Example: redirect old /products/* to /product/*
      // { source: "/products/:slug", destination: "/product/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
