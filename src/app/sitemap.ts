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
// MetadataRoute.Sitemap is a TypeScript type from Next.js that
// exactly matches what the sitemap XML format requires.
//
// Priority values (0.0 – 1.0):
//   1.0 = homepage (most important)
//   0.9 = shop, categories (core buying pages)
//   0.8 = individual products (the main content)
//   0.5 = static info pages
//   0.3 = legal pages (privacy, terms)
//
// changeFrequency hints at how often Google should re-crawl.
//   Products change rarely → "monthly"
//   Shop page changes when filters/products update → "weekly"
//   Homepage may change with promotions → "weekly"
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";
import { FEATURED_PRODUCTS, CATEGORIES } from "@/data/products";

export const revalidate = 3600; // Re-generate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://knlatelier.com";

  // ── Static pages ─────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url:               `${baseUrl}/`,
      lastModified:      new Date(),
      changeFrequency:   "weekly",
      priority:          1.0,
    },
    {
      url:               `${baseUrl}/shop`,
      lastModified:      new Date(),
      changeFrequency:   "weekly",
      priority:          0.9,
    },
    {
      url:               `${baseUrl}/about`,
      lastModified:      new Date(),
      changeFrequency:   "monthly",
      priority:          0.5,
    },
    {
      url:               `${baseUrl}/contact`,
      lastModified:      new Date(),
      changeFrequency:   "monthly",
      priority:          0.5,
    },
    {
      url:               `${baseUrl}/faq`,
      lastModified:      new Date(),
      changeFrequency:   "monthly",
      priority:          0.5,
    },
    {
      url:               `${baseUrl}/privacy`,
      lastModified:      new Date(),
      changeFrequency:   "yearly",
      priority:          0.3,
    },
    {
      url:               `${baseUrl}/terms`,
      lastModified:      new Date(),
      changeFrequency:   "yearly",
      priority:          0.3,
    },
  ];

  // ── Category pages (/shop?category=watches etc.) ─────────
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url:             `${baseUrl}/shop?category=${cat.slug}`,
    lastModified:    new Date(),
    changeFrequency: "weekly" as const,
    priority:        0.8,
  }));

  // ── Product pages ─────────────────────────────────────────
  // In production: replace FEATURED_PRODUCTS with a DB query
  //   const products = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/slugs`)
  //   const { data } = await products.json()
  const productPages: MetadataRoute.Sitemap = FEATURED_PRODUCTS.map((product) => ({
    url:             `${baseUrl}/product/${product.slug}`,
    lastModified:    new Date(),
    changeFrequency: "monthly" as const,
    priority:        0.8,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
