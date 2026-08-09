// src/app/(customer)/product/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────
// Fetches product data from the Laravel API. This page is fully
// dynamic (not pre-rendered) because products come from the DB.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiProductToFrontend } from "@/lib/adapters";
import type { Product } from "@/types";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://knlatelier.com";

async function fetchProduct(slug: string) {
  const data = await fetch(`${API_BASE}/products/${slug}`, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null));
  return data?.data ?? null;
}

export async function generateMetadata(
  { params }: ProductPageProps
): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchProduct(slug);
  if (!data?.product) return { title: "Product not found" };

  const product = apiProductToFrontend(data.product);
  const specs = product.specs.type === "watch" ? product.specs : null;
  const description = specs
    ? `${product.brand} ${product.name} \u2013 ${specs.diameter}, ${specs.movement}, ${specs.crystal}. \u20B1${product.price.toLocaleString("en-PH")}.`
    : `${product.brand} ${product.name}. \u20B1${product.price.toLocaleString("en-PH")}.`;

  return {
    title: `${product.brand} ${product.name}${product.nickname ? ` "${product.nickname}"` : ""}`,
    description,
    alternates: { canonical: `${SITE_URL}/product/${slug}` },
    openGraph: {
      title: `${product.brand} ${product.name}`,
      description,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: "summary_large_image",
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

// ── Structured data (Product + BreadcrumbList JSON-LD) ────────
function productJsonLd(product: Product, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.brand ? `${product.brand} ${product.name}` : product.name,
    image: product.images,
    description: product.nickname ?? undefined,
    sku: product.sku,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/product/${slug}`,
      priceCurrency: "PHP",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };
}

function breadcrumbJsonLd(name: string, slug: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/product/${slug}` },
    ],
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await fetchProduct(slug);

  if (!data?.product) notFound();

  const product = apiProductToFrontend(data.product);
  const related = (data.related ?? []).map(apiProductToFrontend);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd(product, slug)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(product.name, slug)) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
