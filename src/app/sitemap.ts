// src/app/sitemap.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Next.js sitemap.ts (App Router)
//
// sitemap.ts is a special Next.js file. When a request hits
// /sitemap.xml, Next.js calls this function and streams the XML
// response automatically — no manual XML building needed.
//
// Why sitemaps matter for SEO:
//   Google discovers pages by crawling links. But for a store
//   with 100+ products, Google might never find product pages
//   buried 3 clicks deep. A sitemap tells Google "here are ALL
//   the pages that exist on my site, and here's how important
//   each one is." Google then prioritises crawling them.
//
// Since this build went live, product + category URLs come from
// the LIVE Laravel API (only active items), with the static
// seed catalog as a graceful fallback when the API is down.
//
// Priority values (0.0 – 1.0):
//   1.0 = homepage (most important)
//   0.9 = shop, categories (core buying pages)
//   0.8 = individual products (the main content)
//   0.5 = static info pages
//   0.3 = legal pages (privacy, terms)
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { FEATURED_PRODUCTS, CATEGORIES } from "@/data/products";

export const revalidate = 3600; // Re-generate sitemap every hour

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL ?? "https://knlatelier.com";
const API_BASE  = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static pages ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:             `${SITE_URL}/`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        1.0,
    },
    {
      url:             `${SITE_URL}/shop`,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        0.9,
    },
    {
      url:             `${SITE_URL}/about`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${SITE_URL}/contact`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${SITE_URL}/faq`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
    {
      url:             `${SITE_URL}/privacy`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
    {
      url:             `${SITE_URL}/terms`,
      lastModified:    new Date(),
      changeFrequency: "yearly",
      priority:        0.3,
    },
  ];

  // ── Live products + categories from the API ─────────────
  // Both fetches fail soft: if the API is unreachable the static
  // seed catalog below keeps the sitemap valid.
  const [products, categories] = await Promise.all([
    fetch(`${API_BASE}/products?per_page=200`, { next: { revalidate: 3600 } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetch(`${API_BASE}/categories`, { next: { revalidate: 3600 } })
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
  ]);

  const liveProducts: any[] = products?.data?.data ?? products?.data ?? [];
  const liveCategories: any[] = categories?.data ?? [];

  const categoryPages: MetadataRoute.Sitemap = (liveCategories.length > 0
    ? liveCategories
    : CATEGORIES
  )
    .filter((cat: any) => cat.is_active !== false)
    .map((cat: any) => ({
      url:             `${SITE_URL}/shop?category=${cat.slug}`,
      lastModified:    new Date(cat.updated_at ?? Date.now()),
      changeFrequency: "weekly" as const,
      priority:        0.8,
    }));

  const productPages: MetadataRoute.Sitemap = (liveProducts.length > 0
    ? liveProducts
    : FEATURED_PRODUCTS
  )
    .filter((p: any) => p.is_active !== false)
    .map((product: any) => ({
      url:             `${SITE_URL}/product/${product.slug}`,
      lastModified:    new Date(product.updated_at ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority:        0.8,
    }));

  return [...staticPages, ...categoryPages, ...productPages];
}
