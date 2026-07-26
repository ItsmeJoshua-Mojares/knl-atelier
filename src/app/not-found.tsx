// src/app/not-found.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Next.js not-found.tsx
//
// Any file named not-found.tsx in your app/ directory becomes
// the 404 page for that route segment and all children below it.
//
// When you call notFound() inside a page (like we do in
// product/[slug]/page.tsx when the slug doesn't match), Next.js
// automatically renders THIS file instead.
//
// It also renders when someone visits a URL that has no
// matching page file at all (e.g. /random-url-that-doesnt-exist).
//
// No need to export metadata here — Next.js sets the HTTP
// status to 404 automatically.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-6">
      <div className="text-center max-w-md">

        {/* Large 404 number */}
        <p className="font-utility font-bold text-[120px] leading-none text-white/[0.04] select-none mb-2">
          404
        </p>

        {/* KNL logo mark */}
        <div className="mb-6">
          <div className="font-utility text-3xl font-bold">
            <span className="text-green-light">KNL</span>
          </div>
          <div className="font-body text-[9px] tracking-[3.5px] uppercase text-gold mt-1">
            Atelier &amp; Co.
          </div>
        </div>

        <h1 className="font-display text-3xl font-semibold text-white mb-3">
          Page not found
        </h1>
        <p className="text-[14px] text-gray-mid leading-relaxed mb-10">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        {/* Quick links */}
        <div className="flex flex-col gap-3 items-center">
          <Link href="/" className="btn-primary w-full justify-center py-3.5">
            Go to Homepage
          </Link>
          <Link href="/shop" className="btn-ghost w-full justify-center py-3.5">
            Browse the Shop
          </Link>
          <Link
            href="/contact"
            className="text-[13px] text-gray-mid hover:text-white transition-colors mt-2"
          >
            Contact support →
          </Link>
        </div>
      </div>
    </div>
  );
}
