// src/app/(customer)/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// This file IS the homepage. In Next.js App Router, any file
// named `page.tsx` inside the `app/` folder becomes a URL.
//
//   app/(customer)/page.tsx     →  yoursite.com/
//   app/shop/page.tsx           →  yoursite.com/shop
//   app/product/[slug]/page.tsx →  yoursite.com/product/ssk001
//
// Server Component by default — no "use client" here.
// This file fetches data and passes it DOWN to child components.
// The children handle their own interactivity (buttons, animations).
//
// Metadata export — we export a `metadata` object here to set
// the page-specific <title> and <description>. Next.js merges
// this with the root layout's metadata automatically.
//
// This is called the "Smart Parent, Dumb Children" pattern:
// The page.tsx is smart (knows about data), child components
// are dumb (just display whatever they receive as props).
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";

import HeroSection    from "@/components/home/HeroSection";
import CategoryGrid   from "@/components/home/CategoryGrid";
import ProductGrid    from "@/components/home/ProductGrid";
import Newsletter     from "@/components/home/Newsletter";

import { apiCategoryToFrontend, apiProductToFrontend } from "@/lib/adapters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Homepage",
  description:
    "Shop authentic Seiko watches, fragrances, shoes & accessories. " +
    "100% genuine. Philippines-based. Fast delivery.",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default async function HomePage() {
  const [catRes, productsRes] = await Promise.all([
    fetch(`${API}/categories`,                    { cache: "no-store" }),
    fetch(`${API}/products?sort=newest&per_page=48`, { cache: "no-store" }),
  ]);

  const catJson      = catRes.ok      ? await catRes.json()      : null;
  const productsJson = productsRes.ok ? await productsRes.json() : null;

  const catArr = Array.isArray(catJson?.data) ? catJson.data : [];
  const productsArr = Array.isArray(productsJson?.data?.data)
    ? productsJson.data.data
    : Array.isArray(productsJson?.data)
      ? productsJson.data
      : [];

  const categories   = catArr.map(apiCategoryToFrontend);
  const latestProducts = productsArr.map(apiProductToFrontend);

  return (
    <>
      <HeroSection />
      <TrustBar />
      <CategoryGrid categories={categories} />
      <ProductGrid
        products={latestProducts}
        title='"Watches"'
        label="New Arrivals"
        viewAllHref="/shop"
      />
      <Newsletter />
    </>
  );
}

// ── TrustBar ─────────────────────────────────────────────────
// Small component, only used here, so we define it in the same file.
// No need to create a separate file for every tiny thing.

const TRUST_ITEMS = [
  { icon: "🛡️", text: "100% Authentic" },
  { icon: "🚚", text: "Free Shipping ₱1,500+" },
  { icon: "💳", text: "Cash on Delivery" },
  { icon: "↩️", text: "7-Day Returns" },
  { icon: "📞", text: "Expert Support" },
];

function TrustBar() {
  return (
    <div className="bg-mid border-y border-white/5 py-4">
      <div className="knl-container">
        <div className="flex items-center justify-center gap-8 md:gap-14 flex-wrap">
          {TRUST_ITEMS.map((item) => (
            <div
              key={item.text}
              className={`flex items-center gap-2.5 font-utility text-[12px] tracking-[1.5px] uppercase text-gray-mid`}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
