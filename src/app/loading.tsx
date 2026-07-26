// src/app/loading.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Next.js loading.tsx (Streaming + Suspense)
//
// loading.tsx is a special file. Next.js shows it automatically
// while a page is fetching its data on the server.
//
// How it works:
//   1. User clicks a link → browser navigates to /shop
//   2. Next.js immediately shows loading.tsx (instant)
//   3. While loading.tsx shows, the server fetches data for
//      the shop page (products, filters, etc.)
//   4. Once data is ready, Next.js swaps loading.tsx out for
//      the real page content
//
// This gives users instant visual feedback instead of staring
// at a blank white screen. It's called "streaming" because
// content streams in progressively.
//
// The skeleton UI below mimics the real page layout so the
// transition feels smooth rather than jarring.
// ─────────────────────────────────────────────────────────────

export default function Loading() {
  return (
    <div className="knl-container py-12 min-h-screen">

      {/* Page header skeleton */}
      <div className="mb-10">
        <div className="skeleton h-3 w-24 rounded mb-3" />
        <div className="skeleton h-8 w-48 rounded" />
      </div>

      {/* Product grid skeleton — 8 cards, 4-column layout */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ── Skeleton card matches the real ProductCard layout ─────────
function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">

      {/* Image placeholder */}
      <div className="skeleton aspect-square" />

      {/* Text lines */}
      <div className="p-4 space-y-2.5">
        <div className="skeleton h-2.5 w-14 rounded" />   {/* brand */}
        <div className="skeleton h-4 w-full rounded" />    {/* name */}
        <div className="skeleton h-3 w-28 rounded" />      {/* ref */}

        {/* Spec tags */}
        <div className="flex gap-1.5 pt-1">
          <div className="skeleton h-5 w-14 rounded" />
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-5 w-12 rounded" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3.5 border-t border-white/5">
        <div className="skeleton h-5 w-20 rounded" />      {/* price */}
        <div className="flex gap-2">
          <div className="skeleton h-8 w-16 rounded" />    {/* buy btn */}
          <div className="skeleton h-8 w-12 rounded" />    {/* save btn */}
        </div>
      </div>
    </div>
  );
}
