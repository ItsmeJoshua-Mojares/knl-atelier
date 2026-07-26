// src/components/analytics/FacebookPixel.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Facebook Pixel for retargeting ads
//
// Facebook Pixel does two things:
//   1. Tracks visitors so you can retarget them with Facebook/
//      Instagram ads ("people who viewed your Seiko SSK001 page")
//   2. Tracks conversions so you can optimize ad campaigns for
//      purchases, not just clicks
//
// The PageView event fires on every page load automatically.
// The standard events (ViewContent, AddToCart, Purchase) match
// Facebook's "Standard Events" spec — using these exact names
// means Facebook's ad platform can optimize delivery for the
// right people automatically without custom setup.
//
// usePathname + useEffect: when Next.js navigates between pages
// (client-side navigation), the page doesn't fully reload, so
// the Pixel script doesn't re-fire. We watch pathname changes
// and manually fire fbq('track', 'PageView') each time.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

interface FacebookPixelProps {
  pixelId: string;
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();

  // Don't load in development
  if (process.env.NODE_ENV !== "production" || !pixelId) {
    return null;
  }

  return (
    <Script
      id="facebook-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `,
      }}
    />
  );
}

// ── Page view tracker (fires on every client-side navigation) ─
export function FacebookPixelPageView() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}

// ─────────────────────────────────────────────────────────────
// Standard event helpers — call these from your pages
// ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq(...args);
  }
}

/** Product detail page load */
export function fbViewContent(product: {
  id: string; name: string; price: number; category: string;
}) {
  fbq("track", "ViewContent", {
    content_ids:  [product.id],
    content_name: product.name,
    content_type: "product",
    value:        product.price,
    currency:     "PHP",
  });
}

/** Add to cart click */
export function fbAddToCart(product: {
  id: string; name: string; price: number;
}, quantity = 1) {
  fbq("track", "AddToCart", {
    content_ids:  [product.id],
    content_name: product.name,
    content_type: "product",
    value:        product.price * quantity,
    currency:     "PHP",
  });
}

/** Order confirmed */
export function fbPurchase(order: {
  orderNumber: string;
  total: number;
  items: { id: string }[];
}) {
  fbq("track", "Purchase", {
    order_id:    order.orderNumber,
    content_ids: order.items.map((i) => i.id),
    content_type:"product",
    value:       order.total,
    currency:    "PHP",
    num_items:   order.items.length,
  });
}

/** Checkout started */
export function fbInitiateCheckout(subtotal: number, itemCount: number) {
  fbq("track", "InitiateCheckout", {
    value:     subtotal,
    currency:  "PHP",
    num_items: itemCount,
  });
}
