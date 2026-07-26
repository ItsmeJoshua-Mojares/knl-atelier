// src/app/shop/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: URL-based state (searchParams)
//
// Filters like ?category=watches&sort=price_asc live in the URL.
// Why not useState? Because:
//   1. Shareable — user can copy URL and share exact filter view
//   2. Bookmarkable — browser Back button works correctly
//   3. SEO — Google can index /shop?category=watches
//
// In Next.js App Router, server components receive searchParams
// as a prop. We read them and pass to the API call.
//
// useRouter + useSearchParams (in client components) let you
// update the URL without a page reload.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import ShopClient from "@/components/shop/ShopClient";
import { apiCategoryToFrontend, apiProductToFrontend } from "@/lib/adapters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse authentic Seiko watches, fragrances, shoes and accessories. Filter by category, brand and price.",
};

// searchParams comes from the URL: /shop?category=watches&sort=newest
interface ShopPageProps {
  searchParams: Promise<{
    category?: string;
    brand?: string;
    sort?: string;
    min_price?: string;
    max_price?: string;
    search?: string;
    page?: string;
  }>;
}

// Server component — reads searchParams, passes to client component
export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  const [categories, products] = await Promise.all([
    fetch(`${apiBase}/categories`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((j) => (j.data ?? []).map(apiCategoryToFrontend)),
    fetch(`${apiBase}/products?per_page=48`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { data: { data: [] } }))
      .then((j) => (j.data?.data ?? []).map(apiProductToFrontend)),
  ]);

  return (
    <div className="min-h-screen bg-dark pt-8">
      <ShopClient
        initialSearchParams={params}
        categories={categories}
        initialProducts={products}
      />
    </div>
  );
}
