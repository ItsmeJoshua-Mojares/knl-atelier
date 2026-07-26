// src/app/robots.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: robots.txt
//
// robots.txt is a text file at the root of your domain that tells
// web crawlers (Googlebot, Bingbot, etc.) which pages they are
// and aren't allowed to crawl.
//
// WHY THIS MATTERS FOR KNL:
//   - /admin/* should NEVER be indexed by Google. If it were,
//     someone could search "site:knlatelier.com/admin" and
//     discover your admin panel URL structure.
//   - /checkout, /cart, /dashboard are personal user pages.
//     Indexing them wastes crawl budget and creates duplicate
//     content issues.
//   - /api/* is your JSON API — not useful as a search result.
//
// Next.js robots.ts generates /robots.txt at build time and
// serves it from the same domain. No manual file needed.
//
// Sitemap pointer: we tell crawlers where our sitemap lives
// so Google can find all product pages directly.
// ─────────────────────────────────────────────────────────────

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://knlatelier.com";

  return {
    rules: [
      {
        // Default rule for all crawlers
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/shop/*",
          "/product/*",
          "/about",
          "/contact",
          "/faq",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/admin",
          "/admin/*",
          "/dashboard",
          "/cart",
          "/checkout",
          "/order-success",
          "/api/*",
          "/login",
          "/register",
          "/forgot-password",
          "/wishlist",
        ],
      },
      {
        // Block AI training crawlers — optional but increasingly common
        userAgent: ["GPTBot", "Google-Extended", "CCBot", "anthropic-ai"],
        disallow: ["/"],
      },
    ],
    // Point crawlers to our dynamically-generated sitemap
    sitemap: `${baseUrl}/sitemap.xml`,
    // Host declaration helps with crawl budget allocation
    host: baseUrl,
  };
}
