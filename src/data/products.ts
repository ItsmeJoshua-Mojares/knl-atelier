// src/data/products.ts
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// This is your MOCK DATA file. In Phase 2, this data will come
// from a real MySQL database via an API. For now, we hardcode it
// so we can build and test the UI without a backend.
//
// This is a common pattern called "mocking" — you fake the data
// to build the frontend first, then swap in the real API later.
// The TypeScript types ensure the real API returns data in
// exactly the same shape as this mock data.
//
// Notice we import the Product and Category types — TypeScript
// will error if any product below is missing a required field.
// ─────────────────────────────────────────────────────────────

import type { Product, Category } from "@/types";

// ── Categories ───────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  {
    id: "watches",
    name: "Watches",
    slug: "watches",
    description: "High class, high quality timepieces at authentic prices",
    icon: "⌚",
  },
  {
    id: "sole",
    name: "Sole",
    slug: "sole",
    description: "Designer footwear for every occasion",
    icon: "👟",
  },
  {
    id: "fragrance",
    name: "Fragrance",
    slug: "fragrance",
    description: "Signature scents from premium brands",
    icon: "🧴",
  },
  {
    id: "gadgets",
    name: "Gadgets",
    slug: "gadgets",
    description: "Tech accessories and electronics",
    icon: "🎧",
  },
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Belts, bags, sunglasses & more",
    icon: "🕶️",
  },
];

// ── Products ─────────────────────────────────────────────────
// These match exactly what's in the PDF catalog.
// Prices are in PHP (Philippine Pesos).
// Image paths point to /public/images/ — add real photos there.
export const FEATURED_PRODUCTS: Product[] = [
  {
    id: "ssk001",
    name: "SSK001",
    nickname: "Bruce Wayne",
    slug: "seiko-ssk001-bruce-wayne",
    sku: "SSK001",
    brand: "Seiko",
    category: "watches",
    price: 22999,
    images: ["/images/watches/ssk001.jpg"],
    badge: "new",
    specs: {
      type: "watch",
      refNumber: "SSK001",
      caliberNumber: "4R34",
      condition: "New",
      diameter: "42.5mm",
      bezel: "Rotated",
      movement: "Automatic",
      crystal: "Hardlex",
      inclusions: "Box, manuals, & warranty card",
    },
    inStock: true,
    isFeatured: true,
    isBestSeller: false,
    rating: 4.9,
    reviewCount: 42,
  },
  {
    id: "ssk003",
    name: "SSK003",
    nickname: "Batman",
    slug: "seiko-ssk003-batman",
    sku: "SSK003",
    brand: "Seiko",
    category: "watches",
    price: 21499,
    images: ["/images/watches/ssk003.jpg"],
    badge: "hot",
    specs: {
      type: "watch",
      refNumber: "SSK003",
      caliberNumber: "4R34",
      condition: "New",
      diameter: "42.5mm",
      bezel: "Rotated",
      movement: "Automatic",
      crystal: "Hardlex",
      inclusions: "Box, manuals, & warranty card",
    },
    inStock: true,
    isFeatured: true,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 68,
  },
  {
    id: "ssk033",
    name: "SSK033",
    nickname: "White Polar",
    slug: "seiko-ssk033-white-polar",
    sku: "SSK033",
    brand: "Seiko",
    category: "watches",
    price: 22499,
    images: ["/images/watches/ssk033.jpg"],
    badge: "new",
    specs: {
      type: "watch",
      refNumber: "SSK033",
      caliberNumber: "4R34",
      condition: "New",
      diameter: "42.5mm",
      bezel: "Rotated",
      movement: "Automatic",
      crystal: "Hardlex",
      inclusions: "Box, manuals, & warranty card",
    },
    inStock: true,
    isFeatured: true,
    isBestSeller: false,
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: "ssk035",
    name: "SSK035",
    nickname: "Sprite",
    slug: "seiko-ssk035-sprite",
    sku: "SSK035",
    brand: "Seiko",
    category: "watches",
    price: 22499,
    images: ["/images/watches/ssk035.jpg"],
    badge: "discounted",
    specs: {
      type: "watch",
      refNumber: "SSK035",
      caliberNumber: "4R34",
      condition: "New",
      diameter: "42.5mm",
      bezel: "Rotated",
      movement: "Automatic",
      crystal: "Hardlex",
      inclusions: "Box, manuals, & warranty card",
    },
    inStock: true,
    isFeatured: true,
    isBestSeller: false,
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: "srpd63",
    name: "SRPD63",
    nickname: "Hulk",
    slug: "seiko-srpd63-hulk",
    sku: "SRPD63",
    brand: "Seiko",
    category: "watches",
    price: 14499,
    images: ["/images/watches/srpd63.jpg"],
    badge: "bestseller",
    specs: {
      type: "watch",
      refNumber: "SRPD63",
      caliberNumber: "4R36",
      condition: "New",
      diameter: "42.5mm",
      bezel: "Rotated",
      movement: "Automatic",
      crystal: "Hardlex",
      inclusions: "Box, manuals, & warranty card",
    },
    inStock: true,
    isFeatured: false,
    isBestSeller: true,
    rating: 5.0,
    reviewCount: 128,
  },
];

// ── Helper Functions ─────────────────────────────────────────
// In Phase 2, these will call your API instead of filtering arrays.

/** Get all featured products */
export function getFeaturedProducts(): Product[] {
  return FEATURED_PRODUCTS.filter((p) => p.isFeatured);
}

/** Get best sellers, sorted by review count */
export function getBestSellers(): Product[] {
  return FEATURED_PRODUCTS
    .filter((p) => p.isBestSeller)
    .sort((a, b) => b.reviewCount - a.reviewCount);
}

/** Format price as Philippine Peso */
export function formatPrice(amount: number): string {
  return `₱${amount.toLocaleString("en-PH")}`;
}
