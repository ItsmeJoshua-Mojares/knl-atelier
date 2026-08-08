// src/types/index.ts
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// TypeScript interfaces define the "shape" of your data.
// If you say a Product has a `price: number`, TypeScript will
// yell at you (at edit time, not runtime) if you accidentally
// pass a string like "22,999" instead of the number 22999.
//
// This is EXTREMELY useful in a real project because:
// - It documents what data looks like
// - Your editor auto-completes field names
// - Bugs are caught before the page even loads
//
// Think of interfaces as "contracts" — any object claiming to
// be a Product MUST have all these fields with the right types.
// ─────────────────────────────────────────────────────────────

// A single product listing
export interface Product {
  id: string;
  name: string;
  nickname?: string;          // e.g. "Bruce Wayne", "Batman"
  slug: string;               // URL-friendly name: "ssk001-bruce-wayne"
  sku: string;                // e.g. "SSK001"
  brand: string;              // e.g. "Seiko"
  category: string;           // e.g. "watches"
  price: number;              // in PHP, e.g. 22999
  compareAtPrice?: number;    // original price if on sale
  images: string[];           // array of image URLs
  badge?: "new" | "discounted" | "hot" | "bestseller";
  specs: WatchSpecs | GeneralSpecs;
  inStock: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  rating: number;             // 0-5
  reviewCount: number;
}

// Watch-specific specifications (extends the general specs)
export interface WatchSpecs {
  type: "watch";
  refNumber: string;          // e.g. "SSK001"
  caliberNumber: string;      // e.g. "4R34"
  condition: string;          // "New"
  diameter: string;           // e.g. "42.5mm"
  bezel: string;              // "Rotated" | "Fixed" | etc.
  movement: string;           // "Automatic" | "Solar" | "Quartz"
  crystal: string;            // "Hardlex" | "Sapphire"
  inclusions: string;         // "Box, manuals, & warranty card"
}

// General product specs (for shoes, fragrances, gadgets)
export interface GeneralSpecs {
  type: "general";
  [key: string]: string;      // Any key-value pairs
}

// A product category (Watches, Sole, Fragrance, etc.)
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;               // Emoji or icon name for now
  image?: string;             // Real product photo (from API, optional)
}

// Cart item
export interface CartItem {
  product: Product;
  quantity: number;
}

// What a toast notification looks like
export interface Toast {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "info";
}
