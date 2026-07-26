// src/app/(customer)/product/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────
// Fetches product data from the Laravel API. This page is fully
// dynamic (not pre-rendered) because products come from the DB.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiProductToFrontend } from "@/lib/adapters";
import ProductDetailClient from "@/components/product/ProductDetailClient";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

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
  return {
    title: `${product.brand} ${product.name}${product.nickname ? ` "${product.nickname}"` : ""}`,
    description: specs
      ? `${product.brand} ${product.name} \u2013 ${specs.diameter}, ${specs.movement}, ${specs.crystal}. \u20B1${product.price.toLocaleString("en-PH")}.`
      : `${product.brand} ${product.name}. \u20B1${product.price.toLocaleString("en-PH")}.`,
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await fetchProduct(slug);

  if (!data?.product) notFound();

  const product = apiProductToFrontend(data.product);
  const related = (data.related ?? []).map(apiProductToFrontend);

  return <ProductDetailClient product={product} related={related} />;
}
