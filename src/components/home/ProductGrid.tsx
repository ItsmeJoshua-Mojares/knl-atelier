// src/components/home/ProductGrid.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// Toast notifications — when a user clicks "Add to Cart",
// we don't navigate to a new page. Instead we show a small
// pop-up at the bottom right ("Added to cart!") that disappears
// after a few seconds. This is called a "toast".
//
// We manage the toast list with useState — it's an array that
// grows when we add a toast, and shrinks when a toast expires.
//
// setTimeout — browser function that runs code after a delay.
// We use it to auto-remove toasts after 3 seconds.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import type { Product, Toast } from "@/types";

interface ProductGridProps {
  products: Product[];
  title?: string;
  label?: string;
  viewAllHref?: string;
}

export default function ProductGrid({
  products,
  title = '"Watches"',
  label = "New Arrivals",
  viewAllHref = "/shop/watches",
}: ProductGridProps) {

  // Array of active toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Show a toast, then auto-remove it after 3.2 seconds
  function showToast(title: string, message: string) {
    // crypto.randomUUID() generates a unique ID for this toast
    const id = crypto.randomUUID();

    // Add new toast to the front of the array
    setToasts((prev) => [{ id, title, message, type: "success" }, ...prev]);

    // Remove after 3.2 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }

  function handleAddToCart(product: Product) {
    showToast("Added to Cart", `${product.name} has been added to your cart`);
  }

  function handleSaveToWishlist(product: Product) {
    showToast("Saved", `${product.name} added to your wishlist`);
  }

  return (
    <>
      <section className="py-24 bg-dark">
        <div className="knl-container">

          {/* Section header with navigation arrows */}
          <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
            <div>
              <span className="section-label block mb-2.5">{label}</span>
              <h2 className="section-title">{title}</h2>
            </div>

            {/* Prev/Next arrows */}
            <div className="flex gap-2.5">
              {["prev", "next"].map((dir) => (
                <button
                  key={dir}
                  aria-label={dir === "prev" ? "Previous" : "Next"}
                  className={`w-11 h-11 rounded-full border border-white/15 text-gray-light flex items-center justify-center hover:bg-green-mid hover:border-green-mid hover:text-white transition-all duration-300`}
                >
                  {dir === "prev" ? "←" : "→"}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid — 2 columns mobile, 4 columns desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onSaveToWishlist={handleSaveToWishlist}
              />
            ))}
          </div>

          {/* View All link */}
          <div className="text-center mt-12">
            <Link href={viewAllHref} className="btn-primary">
              View All Watches
              <svg width="14" height="14" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Toast Notifications ───────────────────────────── */}
      {/* Fixed to bottom-right, stacks vertically */}
      <div className="fixed bottom-7 right-7 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`bg-mid border border-white/10 border-l-[3px] border-l-green-light rounded-xl px-4 py-3.5 flex items-center gap-3 min-w-[260px] shadow-[0_8px_24px_rgba(0,0,0,0.5)] animate-slide-in`}
          >
            {/* Check icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="#5cb85c" strokeWidth="2" className="flex-shrink-0">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div>
              <p className="font-utility text-[13px] font-semibold text-white">
                {toast.title}
              </p>
              <p className="text-[12px] text-gray-mid mt-0.5">
                {toast.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
