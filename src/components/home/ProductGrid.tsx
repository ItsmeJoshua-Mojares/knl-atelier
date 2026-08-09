// src/components/home/ProductGrid.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// Slide gallery carousel — the parent passes `slides`, one per
// category, and the track translates sideways one slide at a
// time. The left/right arrows actually work now, you can
// swipe/drag, and a hero-style counter shows where you are
// ("01 / 03"). No autoplay — the content stays put until the
// customer chooses to move it.
//
// The big heading follows the slide — it renders the current
// slide's category title, so as you advance from Watches to
// Gadgets to Accessories the heading changes to match.
//
// Measuring the viewport — a ResizeObserver reports the carousel
// width in pixels so the track always slides exactly one slide on
// every breakpoint. The slide markup itself is fixed
// (grid-cols-2 lg:grid-cols-4), keeping server and client HTML
// identical → no hydration mismatch.
//
// Toast notifications — small pop-up at the bottom-right after
// adding to cart / saving to wishlist, auto-removed after 3.2s.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { useCartStore, useWishlistStore } from "@/store/cartStore";
import type { Product, Toast } from "@/types";

// Slow, luxurious easing curve (matches the hero section)
const LUX_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SWIPE_THRESHOLD = 60;    // px of drag before it counts as a swipe

export interface ProductGridSlide {
  title: string;      // category name shown in the heading while on this slide
  products: Product[];
}

interface ProductGridProps {
  slides: ProductGridSlide[];
  label?: string;
  viewAllHref?: string;
}

export default function ProductGrid({
  slides,
  label = "New Arrivals",
  viewAllHref = "/shop",
}: ProductGridProps) {

  // ── Global stores ──────────────────────────────────────────
  // The header badge listens to the same stores, so the cart /
  // wishlist counts update the moment we add or save here.
  const addToCart      = useCartStore((s) => s.addItem);
  const wishlistToggle = useWishlistStore((s) => s.toggle);
  const wishlistHas    = useWishlistStore((s) => s.has);

  // ── Toast notifications ────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(title: string, message: string) {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ id, title, message, type: "success" }, ...prev]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }

  function handleAddToCart(product: Product) {
    addToCart(product);
    showToast("Added to Cart", `${product.name} has been added to your cart`);
  }

  function handleSaveToWishlist(product: Product) {
    const wasSaved = wishlistHas(product.id);
    wishlistToggle(product.id);
    showToast(
      wasSaved ? "Removed" : "Saved to Wishlist",
      wasSaved
        ? `${product.name} removed from your wishlist`
        : `${product.name} added to your wishlist`
    );
  }

  // ── Carousel state ─────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [slideW, setSlideW] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Each slide is already one category — no chunking needed here.
  const total = slides.length;
  const canNavigate = total > 1;

  // Measure the carousel width so the track slides exactly one page
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setSlideW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the page index valid if the product list ever shrinks
  useEffect(() => {
    if (total > 0 && page >= total) setPage(total - 1);
  }, [total, page]);

  const go = (dir: 1 | -1) => {
    if (!canNavigate) return;
    setPage((p) => (p + dir + total) % total);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (!canNavigate) return;
    if (info.offset.x < -SWIPE_THRESHOLD) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
  };

  // Hide the whole section when no categories had products
  if (slides.length === 0) return null;

  return (
    <>
      <section className="py-24 bg-dark">
        <div className="knl-container">

          {/* Section header with counter + navigation arrows — centered */}
          <div className="flex flex-col items-center text-center mb-12 gap-5">
            <div>
              <span className="section-label block mb-2.5">{label}</span>
              <h2 className="section-title">{slides[page].title}</h2>
            </div>

            {canNavigate && (
              <div className="flex items-center gap-6">
                {/* Hero-style counter — 01 / 12 */}
                <span className="font-utility text-[11px] tracking-[3px] uppercase text-white/50">
                  <span className="text-gold">{String(page + 1).padStart(2, "0")}</span>
                  {" / "}
                  {String(total).padStart(2, "0")}
                </span>

                {/* Prev/Next arrows */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => go(-1)}
                    aria-label="Previous"
                    className="w-11 h-11 rounded-full border border-white/15 text-gray-light flex items-center justify-center hover:bg-green-mid hover:border-green-mid hover:text-white transition-all duration-300"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => go(1)}
                    aria-label="Next"
                    className="w-11 h-11 rounded-full border border-white/15 text-gray-light flex items-center justify-center hover:bg-green-mid hover:border-green-mid hover:text-white transition-all duration-300"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Slide gallery viewport */}
          <div
            ref={viewportRef}
            className="relative overflow-hidden -my-6 py-6"
          >
            {/* Edge fades — depth mask, same idea as CategoryGrid */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-10 lg:w-24 z-10 bg-gradient-to-r from-[#0e0e0e] to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 lg:w-24 z-10 bg-gradient-to-l from-[#0e0e0e] to-transparent" />

            {/* Animated track — slides one page at a time */}
            <motion.div
              drag={canNavigate ? "x" : false}
              dragConstraints={{ left: -(total - 1) * slideW, right: 0 }}
              dragElastic={0.12}
              dragMomentum={false}
              onDragEnd={onDragEnd}
              animate={{ x: -page * slideW }}
              transition={{ duration: 0.7, ease: LUX_EASE }}
              className="flex"
            >
              {slides.map((slide, i) => (
                <div
                  key={i}
                  style={{ width: slideW || "100%" }}
                  className="shrink-0"
                >
                  {/* 2 columns mobile, 4 columns desktop — one category per slide */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {slide.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onSaveToWishlist={handleSaveToWishlist}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* View All link */}
          <div className="text-center mt-12">
            <Link href={viewAllHref} className="btn-primary">
              View All Products
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
