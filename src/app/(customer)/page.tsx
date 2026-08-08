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
import type { SVGProps } from "react";

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
  const [catRes, productsRes, featuredRes] = await Promise.all([
    fetch(`${API}/categories`,                        { cache: "no-store" }),
    fetch(`${API}/products?sort=newest&per_page=48&category=watches`, { cache: "no-store" }),
    fetch(`${API}/products/featured`,                 { cache: "no-store" }),
  ]);

  const catJson      = catRes.ok      ? await catRes.json()      : null;
  const productsJson = productsRes.ok ? await productsRes.json() : null;
  const featuredJson = featuredRes.ok ? await featuredRes.json() : null;

  const catArr = Array.isArray(catJson?.data) ? catJson.data : [];
  const productsArr = Array.isArray(productsJson?.data?.data)
    ? productsJson.data.data
    : Array.isArray(productsJson?.data)
      ? productsJson.data
      : [];
  const featuredArr = Array.isArray(featuredJson?.data?.products)
    ? featuredJson.data.products
    : [];

  const categories   = catArr.map(apiCategoryToFrontend);
  const latestProducts = productsArr.map(apiProductToFrontend);
  const featured = featuredArr.map(apiProductToFrontend);

  return (
    <>
      <HeroSection featured={featured} />
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
  { key: "authentic", label: "100% Authentic", icon: ShieldIcon },
  { key: "shipping",  label: "Free Shipping ₱1,500+", icon: TruckIcon },
  { key: "cod",       label: "Cash on Delivery", icon: CardIcon },
  { key: "returns",   label: "7-Day Returns", icon: ReturnIcon },
  { key: "support",   label: "Expert Support", icon: HeadsetIcon },
];

function TrustBar() {
  return (
    <div className="bg-[#0e0e0c] border-y border-white/[0.07] py-5">
      <div className="knl-container">
        <div className="flex items-center justify-center gap-8 lg:gap-14 flex-wrap">
          {TRUST_ITEMS.map((item, i) => (
            <div key={item.key} className="flex items-center gap-3">
              <div className="flex items-center gap-2.5">
                <item.icon className="text-champagne/80 shrink-0" width="16" height="16" strokeWidth="1.25" />
                <span className="font-utility text-[11px] tracking-[2px] uppercase text-white/60">
                  {item.label}
                </span>
              </div>
              {i < TRUST_ITEMS.length - 1 && (
                <span className="hidden lg:block w-px h-4 bg-white/10 mx-3" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function TruckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M1 6h13v10H1zM14 9h4l3 3v4h-7z" />
      <circle cx="6" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function CardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </svg>
  );
}

function ReturnIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7v5h5" />
      <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
    </svg>
  );
}

function HeadsetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="3" y="13" width="4" height="7" rx="1.5" />
      <rect x="17" y="13" width="4" height="7" rx="1.5" />
      <path d="M20 20a3 3 0 0 1-3 3h-4" />
    </svg>
  );
}
