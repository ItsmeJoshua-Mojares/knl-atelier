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

import HeroSection, { type HeroBanner } from "@/components/home/HeroSection";
import CategoryGrid   from "@/components/home/CategoryGrid";
import ProductGrid, { type ProductGridSlide } from "@/components/home/ProductGrid";
import Newsletter     from "@/components/home/Newsletter";

import type { Category, Product } from "@/types";
import { apiCategoryToFrontend, apiProductToFrontend } from "@/lib/adapters";
import { safeFetchJson } from "@/lib/api/safeFetch";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Homepage",
  description:
    "Shop authentic Seiko watches, fragrances, shoes & accessories. " +
    "100% genuine. Philippines-based. Fast delivery.",
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const PRODUCTS_PER_SLIDE = 4;

// Pull the products array out of the Laravel response envelope
// ({ success, data: { data: [...] } } — the same shape no matter
// how it's nested) and map each row to a frontend Product.
function extractProducts(json: any): Product[] {
  const arr = Array.isArray(json?.data?.data)
    ? json.data.data
    : Array.isArray(json?.data)
      ? json.data
      : [];
  return arr.map(apiProductToFrontend);
}

// Break one category's products into slides of up to 4, each
// tagged with the category title that the gallery heading shows.
function categorySlides(products: Product[], title: string): ProductGridSlide[] {
  const slides: ProductGridSlide[] = [];
  for (let i = 0; i < products.length; i += PRODUCTS_PER_SLIDE) {
    slides.push({ title, products: products.slice(i, i + PRODUCTS_PER_SLIDE) });
  }
  return slides;
}

export default async function HomePage() {
  // safeFetchJson never throws — if the API is down or times out,
  // we get null and the sections below simply hide themselves.
  const [catJson, featuredJson, bannersJson] = await Promise.all([
    safeFetchJson(`${API}/categories`),
    safeFetchJson(`${API}/products/featured`),
    safeFetchJson(`${API}/banners`),
  ]);

  const catArr = Array.isArray(catJson?.data) ? catJson.data : [];
  const featuredArr = Array.isArray(featuredJson?.data?.products)
    ? featuredJson.data.products
    : [];
  const bannerArr = Array.isArray(bannersJson?.data) ? bannersJson.data : [];

  const categories: Category[] = catArr.map(apiCategoryToFrontend);
  const featured   = featuredArr.map(apiProductToFrontend);

  // Hero banners are admin-managed (position "hero"). When at least
  // one exists the hero carousel shows them; otherwise it falls back
  // to the featured products above.
  const heroBanners: HeroBanner[] = bannerArr
    .filter((b: any) => b.position === "hero" && b.image_url)
    .map((b: any) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle ?? null,
      image_url: b.image_url,
      link_url: b.link_url ?? null,
    }));

  // Build the New Arrivals gallery from the newest few products in
  // EVERY category (in sort_order), so a sell-ready store with 5
  // populated categories shows all of them on the homepage. Empty
  // categories are skipped, so the gallery only shows categories
  // that have products today.
  const categoryPayloads = await Promise.all(
    categories.map((c) =>
      safeFetchJson(`${API}/products?sort=newest&per_page=4&category=${c.slug}`),
    ),
  );
  const slides: ProductGridSlide[] = categories.flatMap((c, i) =>
    categorySlides(extractProducts(categoryPayloads[i]), c.name),
  );

  return (
    <>
      <HeroSection featured={featured} banners={heroBanners} />
      <TrustBar />
      <CategoryGrid categories={categories} />
      <ProductGrid slides={slides} label="New Arrivals" viewAllHref="/shop" />
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
