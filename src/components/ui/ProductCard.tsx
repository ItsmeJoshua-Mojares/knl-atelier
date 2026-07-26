// src/components/ui/ProductCard.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// This is the most reused component in the project.
// It appears on: homepage, shop, search results, best sellers.
// Building it once and reusing it = less code to maintain.
//
// Optional props with `?` — some props have a `?` which means
// they're optional. If not provided, we use a default value.
// Example: `showSpecs?: boolean` defaults to true.
//
// Event handlers as props — the parent decides what happens
// when "Buy Now" or "Add to Cart" is clicked. This component
// doesn't know about the cart or navigation — it just fires
// the function the parent gave it. This is called "lifting state up".
//
// formatPrice() — we import this helper from our data file.
// Always format currency in ONE place so you never have to fix
// it in 20 different components.
// ─────────────────────────────────────────────────────────────

"use client";

import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/data/products";

interface ProductCardProps {
  product: Product;
  // Optional: show the watch specs table below the image
  showSpecs?: boolean;
  // Optional: callback when user clicks Add to Cart
  // The parent component decides what to do with it
  onAddToCart?: (product: Product) => void;
  onSaveToWishlist?: (product: Product) => void;
}

export default function ProductCard({
  product,
  showSpecs = true,
  onAddToCart,
  onSaveToWishlist,
}: ProductCardProps) {

  // Cast specs to watch type for conditional rendering
  const isWatch = product.specs.type === "watch";
  const watchSpecs = isWatch ? product.specs : null;

  return (
    <article className={`group relative bg-card border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_48px_rgba(0,0,0,0.65)] hover:border-green-mid/30`}>

      {/* ── Badge (New / Sale / Hot) ─────────────────────── */}
      {product.badge && (
        <span className={`
          absolute top-3 left-3 z-10
          font-utility text-[10px] font-bold tracking-[1.5px] uppercase
          px-2.5 py-1 rounded
          ${product.badge === "new"        ? "bg-green-mid text-white" : ""}
          ${product.badge === "sale"       ? "bg-gold text-dark" : ""}
          ${product.badge === "hot"        ? "bg-red-700 text-white" : ""}
          ${product.badge === "bestseller" ? "bg-gold text-dark" : ""}
        `}>
          {product.badge === "bestseller" ? "Best Seller" : product.badge}
        </span>
      )}

      {/* ── Wishlist button ──────────────────────────────── */}
      <button
        onClick={() => onSaveToWishlist?.(product)}
        aria-label={`Save ${product.name} to wishlist`}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center text-gray-mid hover:text-red-400 hover:border-red-400 transition-all duration-300`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>

      {/* ── Product image ────────────────────────────────── */}
      <Link href={`/product/${product.slug}`}>
        <div className={`relative pt-[100%] bg-[linear-gradient(135deg,#1a3a1f_0%,#1c3020_100%)] overflow-hidden`}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={`${product.brand} ${product.name} ${product.nickname ?? ""}`}
              fill
              className={`object-contain p-6 transition-transform duration-300 group-hover:scale-105`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            // Placeholder when no image is available
            <div className={`absolute inset-0 flex flex-col items-center justify-center text-green-mid/30`}>
              <span className="font-utility text-3xl font-bold">
                {product.sku}
              </span>
              <span className="font-utility text-[10px] tracking-[3px] uppercase mt-2">
                {product.brand}
              </span>
            </div>
          )}

          {/* "Add to Cart" bar — slides up on hover */}
          <button
            onClick={(e) => {
              e.preventDefault(); // Don't follow the Link href
              onAddToCart?.(product);
            }}
            className={`absolute bottom-0 left-0 right-0 bg-green-mid text-white font-utility text-[12px] font-bold tracking-[2px] uppercase py-3 text-center translate-y-full group-hover:translate-y-0 transition-transform duration-300`}
          >
            + Add to Cart
          </button>
        </div>
      </Link>

      {/* ── Product info ─────────────────────────────────── */}
      <div className="p-4">
        <p className="font-utility text-[10px] tracking-[2.5px] uppercase text-green-light mb-1.5">
          {product.brand}
        </p>

        <Link href={`/product/${product.slug}`}>
          <h3 className="font-display text-[15px] font-semibold text-white leading-[1.3] hover:text-green-light transition-colors">
            {product.name}
            {product.nickname && (
              <span className="text-gray-mid"> &quot;{product.nickname}&quot;</span>
            )}
          </h3>
        </Link>

        <p className="text-[11px] text-gray-mid mt-1">
          Ref: {product.sku}
          {watchSpecs && ` · Caliber: ${watchSpecs.caliberNumber}`}
        </p>

        {/* Watch specs tags — shown when showSpecs is true */}
        {showSpecs && watchSpecs && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {[watchSpecs.diameter, watchSpecs.movement, watchSpecs.crystal].map((spec) => (
              <span
                key={spec}
                className={`font-utility text-[10px] tracking-[1px] text-gray-mid bg-white/5 border border-white/8 rounded px-2 py-0.5`}
              >
                {spec}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Price & action buttons ───────────────────────── */}
      <div className={`flex items-center justify-between px-4 py-3.5 border-t border-white/5`}>
        <div className="flex flex-col">
          <span className="font-utility text-[18px] font-bold text-white">
            {formatPrice(product.price)}
          </span>
          {/* Strike-through original price if on sale */}
          {product.compareAtPrice && (
            <span className="text-[12px] text-gray-mid line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href={`/checkout?buy=${product.slug}`}
            className={`font-utility text-[11px] font-bold tracking-[1px] uppercase px-3.5 py-2 rounded bg-green-mid text-white border border-green-light hover:bg-green-accent transition-colors duration-300`}
          >
            Buy Now
          </Link>
          <button
            onClick={() => onSaveToWishlist?.(product)}
            className={`font-utility text-[11px] font-bold tracking-[1px] uppercase px-3.5 py-2 rounded bg-transparent text-gray-light border border-white/15 hover:border-white hover:text-white transition-all duration-300`}
          >
            Save
          </button>
        </div>
      </div>
    </article>
  );
}
