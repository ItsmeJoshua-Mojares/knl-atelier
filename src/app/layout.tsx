// src/app/layout.tsx  (Phase 6 update — full SEO metadata)
// ─────────────────────────────────────────────────────────────
// CONCEPT: Root-level Open Graph + JSON-LD Organization schema
//
// Open Graph (og:*) tags tell Facebook, Messenger, Viber, and
// other social platforms how to render a "link preview card"
// when someone shares your URL. Without them, the preview shows
// the page title and a random image — with them, you control
// the image, description, and title exactly.
//
// Twitter cards work the same way for X/Twitter.
//
// JSON-LD Organization schema tells Google about the business:
// name, logo, contact info, social profiles. Google uses this
// to show a "Knowledge Panel" in search results.
//
// metadataBase is required for all absolute image URLs in
// metadata — Next.js prepends it to relative paths like "/og.png"
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import FacebookPixel, { FacebookPixelPageView } from "@/components/analytics/FacebookPixel";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://knlatelier.com";

export const metadata: Metadata = {
  // metadataBase makes all relative URLs in metadata absolute
  metadataBase: new URL(SITE_URL),

  title: {
    template: "%s | KNL Atelier & Co.",
    default:  "KNL Atelier & Co. | Authentic Luxury Watches & Lifestyle",
  },
  description:
    "KNL Atelier & Co. — your trusted source for 100% authentic Seiko watches, fragrances, footwear, gadgets, and accessories in the Philippines.",
  keywords: [
    "Seiko watches Philippines",
    "authentic luxury watches",
    "KNL Atelier",
    "fragrances Philippines",
    "designer shoes Philippines",
  ],

  // ── Open Graph (Facebook, Viber, Messenger, LinkedIn) ─────
  openGraph: {
    title:       "KNL Atelier & Co. — Authentic Luxury, Delivered",
    description: "100% authentic Seiko watches, fragrances, shoes & accessories. Philippines-based, trusted since 2021.",
    url:         SITE_URL,
    siteName:    "KNL Atelier & Co.",
    type:        "website",
    locale:      "en_PH",
    images: [
      {
        url:    "/og-default.jpg",   // Place a 1200×630 image at /public/og-default.jpg
        width:  1200,
        height: 630,
        alt:    "KNL Atelier & Co. — Authentic Luxury Watches Philippines",
      },
    ],
  },

  // ── Twitter / X card ──────────────────────────────────────
  twitter: {
    card:        "summary_large_image",
    site:        "@knlatelier",
    title:       "KNL Atelier & Co.",
    description: "Authentic Seiko watches, fragrances, shoes & accessories.",
    images:      ["/og-default.jpg"],
  },

  // ── Technical SEO ─────────────────────────────────────────
  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index:               true,
      follow:              true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet":       -1,
    },
  },

  // ── App / PWA hints ───────────────────────────────────────
  manifest:    "/manifest.json",
  icons: {
    icon:    [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple:   [{ url: "/apple-icon.png" }],
  },

  // ── Geographic + language hints ───────────────────────────
  other: {
    "geo.region":      "PH",
    "geo.placename":   "Philippines",
    "content-language": "en-PH",
  },
};

// ── Organization JSON-LD (appears in Google Knowledge Panel) ─
const organizationJsonLd = {
  "@context":       "https://schema.org",
  "@type":          "Organization",
  name:             "KNL Atelier & Co.",
  url:              SITE_URL,
  logo:             `${SITE_URL}/logo.png`,
  description:      "Philippine-based luxury lifestyle retailer. 100% authentic watches, fragrances, shoes and accessories.",
  foundingDate:     "2021",
  areaServed:       "PH",
  contactPoint: {
    "@type":        "ContactPoint",
    telephone:      "+63-917-000-0000",
    contactType:    "customer service",
    availableLanguage: ["English", "Filipino"],
  },
  sameAs: [
    "https://www.facebook.com/knlatelier",
    "https://www.instagram.com/knlatelier",
  ],
};

// ── Website JSON-LD (enables Google Sitelinks search box) ────
const websiteJsonLd = {
  "@context":    "https://schema.org",
  "@type":       "WebSite",
  name:          "KNL Atelier & Co.",
  url:           SITE_URL,
  potentialAction: {
    "@type":      "SearchAction",
    target: {
      "@type":    "EntryPoint",
      urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <head>
        {/* Preconnect to external origins to reduce latency */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* Organization + Website structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-dark text-white antialiased" suppressHydrationWarning>
        {/* Strip browser-extension-injected attributes (e.g. fdprocessedid from password managers) before React hydrates */}
        <Script id="strip-ext-attrs" strategy="beforeInteractive">
          {`document.querySelectorAll('[fdprocessedid]').forEach(function(el){el.removeAttribute('fdprocessedid')});`}
        </Script>

        {/* Analytics — only fires in production (components handle the env check) */}
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ""} />
        <FacebookPixel  pixelId={process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? ""} />
        <FacebookPixelPageView />

        <main>{children}</main>
      </body>
    </html>
  );
}
