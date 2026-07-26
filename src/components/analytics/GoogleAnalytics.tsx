// src/components/analytics/GoogleAnalytics.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Next.js Script strategy — "afterInteractive"
//
// Next.js has four script loading strategies:
//
//   beforeInteractive — loads BEFORE the page hydrates. For
//     critical scripts that must run first (rare). Blocks rendering.
//
//   afterInteractive  — loads AFTER hydration. Page is usable
//     before the script runs. Best for analytics (you don't need
//     GA to load before a user can click Buy Now).
//
//   lazyOnload        — loads during browser idle time. For
//     non-critical third-party widgets (live chat, reviews).
//
//   worker            — loads in a Web Worker (experimental).
//
// For Google Analytics, "afterInteractive" is the correct choice:
//   - Users can interact with the store immediately
//   - Analytics capture still works correctly
//   - Google's Core Web Vitals score isn't hurt by the script
//
// The MEASUREMENT_ID (G-XXXXXXXXXX) comes from your GA4 property.
// We pass it through an environment variable so it's never
// hardcoded and can differ between dev (no tracking) and prod.
// ─────────────────────────────────────────────────────────────

"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  measurementId: string;
}

export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  // Don't load analytics in development — keeps your own visits
  // out of production reports and avoids polluting data.
  if (process.env.NODE_ENV !== "production" || !measurementId) {
    return null;
  }

  return (
    <>
      {/* Load the GA4 script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />

      {/* Initialize GA4 — runs immediately after the script loads */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              // Anonymise IPs for GDPR compliance
              anonymize_ip: true,
              // Cookie expires in 1 year (reduced from GA default of 2)
              cookie_expires: 31536000,
            });
          `,
        }}
      />
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// CONCEPT: Custom event tracking helpers
//
// You export these functions and call them from anywhere:
//   trackAddToCart(product)   → when user clicks "Add to Cart"
//   trackPurchase(order)      → when order-success page loads
//   trackViewItem(product)    → when product detail page loads
//
// GA4 uses an "event + parameters" model. These wrap the raw
// gtag() calls so you have one consistent interface and don't
// scatter gtag() calls through your component files.
// ─────────────────────────────────────────────────────────────

// Safely call gtag — window.gtag may not exist in SSR or tests
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

/** Fire when a product is viewed (product detail page) */
export function trackViewItem(product: {
  id: string; name: string; brand: string; price: number; category: string;
}) {
  gtag("event", "view_item", {
    currency: "PHP",
    value:    product.price,
    items: [
      {
        item_id:       product.id,
        item_name:     product.name,
        item_brand:    product.brand,
        item_category: product.category,
        price:         product.price,
        quantity:      1,
      },
    ],
  });
}

/** Fire when a product is added to cart */
export function trackAddToCart(product: {
  id: string; name: string; brand: string; price: number; category: string;
}, quantity = 1) {
  gtag("event", "add_to_cart", {
    currency: "PHP",
    value:    product.price * quantity,
    items: [
      {
        item_id:       product.id,
        item_name:     product.name,
        item_brand:    product.brand,
        item_category: product.category,
        price:         product.price,
        quantity,
      },
    ],
  });
}

/** Fire on the order-success page after purchase */
export function trackPurchase(order: {
  orderNumber: string;
  total: number;
  items: { id: string; name: string; brand: string; price: number; quantity: number }[];
}) {
  gtag("event", "purchase", {
    transaction_id: order.orderNumber,
    currency:       "PHP",
    value:          order.total,
    items:          order.items.map((item) => ({
      item_id:    item.id,
      item_name:  item.name,
      item_brand: item.brand,
      price:      item.price,
      quantity:   item.quantity,
    })),
  });
}

/** Fire when checkout is initiated */
export function trackBeginCheckout(subtotal: number) {
  gtag("event", "begin_checkout", {
    currency: "PHP",
    value:    subtotal,
  });
}
