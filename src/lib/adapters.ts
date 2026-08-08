// src/lib/adapters.ts
// ─────────────────────────────────────────────────────────────
// Converts Laravel API responses into the frontend Product/Category
// types. The DB schema uses different field names, types, and
// nesting (e.g. brand is a nested object, price is a string).
// This adapter normalises everything so components don't need to
// know about the API shape.
// ─────────────────────────────────────────────────────────────

import type { Product, Category, WatchSpecs, GeneralSpecs } from "@/types";

// ── Emoji map for categories ──────────────────────────────────
// The DB doesn't store icons, so we map slugs to emojis.
const CATEGORY_ICONS: Record<string, string> = {
  watches:     "\u231A",
  sole:        "\uD83D\uDC5F",
  fragrance:   "\uD83E\uDDF4",
  gadgets:     "\uD83C\uDFA7",
  accessories: "\uD83D\uDD76\uFE0F",
};

// ── Raw API types (what Laravel actually returns) ─────────────
interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  products_count?: number;
}
interface ApiBrand {
  id: number;
  name: string;
  slug: string;
}

interface ApiImage {
  image_url: string;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface ApiProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  ref_number?: string | null;
  caliber_number?: string | null;
  short_desc?: string | null;
  description?: string | null;
  specifications?: Record<string, string> | null;
  price: string | number;
  compare_at_price?: string | number | null;
  stock_quantity: number;
  condition_status?: string;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  rating_avg: string | number;
  rating_count: number;
  category?: ApiCategory;
  brand?: ApiBrand;
  primary_image?: ApiImage | null;
  images?: ApiImage[];
  created_at?: string;
}

// ── Category adapter ──────────────────────────────────────────
export function apiCategoryToFrontend(api: ApiCategory): Category {
  return {
    id: api.slug,           // use slug as string ID for frontend compat
    name: api.name,
    slug: api.slug,
    description: api.description ?? "",
    icon: CATEGORY_ICONS[api.slug] ?? "\uD83D\uDCE6",
    image: api.image_url ?? undefined,
  };
}

// ── Product adapter ───────────────────────────────────────────
export function apiProductToFrontend(api: ApiProduct): Product {
  const price = typeof api.price === "string" ? parseFloat(api.price) : api.price;
  const compareAt =
    api.compare_at_price != null
      ? typeof api.compare_at_price === "string"
        ? parseFloat(api.compare_at_price)
        : api.compare_at_price
      : undefined;
  const ratingAvg =
    typeof api.rating_avg === "string" ? parseFloat(api.rating_avg) : api.rating_avg;

  return {
    id: String(api.id),
    name: api.name,
    nickname: api.short_desc ?? undefined,
    slug: api.slug,
    sku: api.sku,
    brand: api.brand?.name ?? "",
    category: api.category?.slug ?? "",
    price,
    compareAtPrice: compareAt && compareAt > 0 ? compareAt : undefined,
    images: buildImageList(api),
    badge: deriveBadge(api),
    specs: buildSpecs(api),
    inStock: api.stock_quantity > 0,
    isFeatured: api.is_featured,
    isBestSeller: api.is_bestseller,
    rating: ratingAvg,
    reviewCount: api.rating_count,
  };
}

// ── Helpers ───────────────────────────────────────────────────

function buildImageList(api: ApiProduct): string[] {
  if (api.images && api.images.length > 0) {
    return api.images
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.image_url);
  }
  if (api.primary_image) return [api.primary_image.image_url];
  return [];
}

function deriveBadge(api: ApiProduct): Product["badge"] {
  if (api.is_bestseller) return "bestseller";
  if (api.compare_at_price != null) {
    const cap =
      typeof api.compare_at_price === "string"
        ? parseFloat(api.compare_at_price)
        : api.compare_at_price;
    if (cap > (typeof api.price === "string" ? parseFloat(api.price) : api.price)) {
      return "discounted";
    }
  }
  if (api.created_at) {
    const created = new Date(api.created_at).getTime();
    if (Date.now() - created < 7 * 24 * 60 * 60 * 1000) return "new";
  }
  return undefined;
}

function buildSpecs(api: ApiProduct): WatchSpecs | GeneralSpecs {
  const spec = api.specifications ?? {};
  const isWatch =
    spec.type === "watch" ||
    !!spec.diameter ||
    !!spec.movement ||
    !!spec.crystal;

  if (isWatch) {
    return {
      type: "watch",
      refNumber: api.ref_number ?? spec.refNumber ?? "",
      caliberNumber: api.caliber_number ?? spec.caliberNumber ?? "",
      condition: api.condition_status ?? spec.condition ?? "New",
      diameter: spec.diameter ?? "",
      bezel: spec.bezel ?? "",
      movement: spec.movement ?? "",
      crystal: spec.crystal ?? "",
      inclusions: spec.inclusions ?? "",
    };
  }

  return { type: "general", ...spec };
}
