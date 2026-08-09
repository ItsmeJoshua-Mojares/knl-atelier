// src/components/home/CategoryGrid.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// "Shop by Category" — restyled to match the New Arrivals gallery
// so the two sections read as one visual system. Same frameless
// carousel: gold counter + round green arrows, edge fades, swipe /
// drag, and product-card style category tiles (image on top, the
// name + "Shop Now" below).
//
// Slide mechanics are identical to ProductGrid — the viewport
// width is measured with a ResizeObserver and the track slides
// exactly one viewport at a time. Categories are chunked into
// groups of up to 4 tiles (grid-cols-2 → lg:grid-cols-4), so the
// counter and arrows stay meaningful.
//
// Drag note: images are draggable={false} and the track is
// select-none so the browser's native image drag can't hijack the
// swipe gesture. The grid markup itself is fixed per slide, so
// server and client HTML stay identical → no hydration mismatch.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

// Slow, luxurious easing curve (matches the hero and New Arrivals)
const LUX_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SWIPE_THRESHOLD = 60;     // px of drag before it counts as a swipe
const TILES_PER_SLIDE = 4;      // category tiles per slide (grid cols on desktop)

interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  // ── Chunk categories into slides of up to 4 tiles ──────────
  const chunks: Category[][] = [];
  for (let i = 0; i < categories.length; i += TILES_PER_SLIDE) {
    chunks.push(categories.slice(i, i + TILES_PER_SLIDE));
  }

  // ── Carousel state ─────────────────────────────────────────
  const [page, setPage] = useState(0);
  const [slideW, setSlideW] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const total = chunks.length;
  const canNavigate = total > 1;

  // Measure the viewport so the track slides exactly one page
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setSlideW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Keep the page index valid if the list ever shrinks
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

  // Hide the whole section when the API returned no categories
  if (categories.length === 0) return null;

  return (
    <section className="py-24 bg-dark">
      <div className="knl-container">

        {/* Section header with counter + navigation arrows — centered */}
        <div className="flex flex-col items-center text-center mb-12 gap-5">
          <div>
            <span className="section-label block mb-2.5">Explore Our World</span>
            <h2 className="section-title">Shop by Category</h2>
          </div>

          {canNavigate && (
            <div className="flex items-center gap-6">
              {/* Hero-style counter — 01 / 02 */}
              <span className="font-utility text-[11px] tracking-[3px] uppercase text-white/50">
                <span className="text-gold">{String(page + 1).padStart(2, "0")}</span>
                {" / "}
                {String(total).padStart(2, "0")}
              </span>

              {/* Prev/Next arrows */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous categories"
                  className="w-11 h-11 rounded-full border border-white/15 text-gray-light flex items-center justify-center hover:bg-green-mid hover:border-green-mid hover:text-white transition-all duration-300"
                >
                  ←
                </button>
                <button
                  onClick={() => go(1)}
                  aria-label="Next categories"
                  className="w-11 h-11 rounded-full border border-white/15 text-gray-light flex items-center justify-center hover:bg-green-mid hover:border-green-mid hover:text-white transition-all duration-300"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slide gallery viewport — frameless, edge fades for depth */}
        <div
          ref={viewportRef}
          className="relative overflow-hidden -my-6 py-6 select-none"
        >
          {/* Edge fades — same depth mask as New Arrivals */}
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
            {chunks.map((group, i) => (
              <div
                key={i}
                style={{ width: slideW || "100%" }}
                className="shrink-0"
              >
                {/* 2 columns mobile, 4 columns desktop — up to 4 tiles per slide */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {group.map((category) => (
                    <CategoryTile key={category.id} category={category} />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* View all CTA */}
        <div className="text-center mt-12">
          <Link href="/shop" className="btn-primary">
            Shop All Categories
            <svg width="14" height="14" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}

// ── CategoryTile sub-component ───────────────────────────────
// A product-card style tile: square image (or gradient + icon
// fallback for categories with no photo yet) with the category
// name and a "Shop Now" affordance below. The whole tile links
// into the shop filtered by that category.

interface CategoryTileProps {
  category: Category;
}

function CategoryTile({ category }: CategoryTileProps) {
  const hasImage = Boolean(category.image);

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group relative bg-card border border-white/5 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
    >
      {/* Image area — real photo or gradient+icon fallback */}
      <div className="relative aspect-[1/1] overflow-hidden">
        {hasImage ? (
          <Image
            src={category.image as string}
            alt={category.name}
            fill
            draggable={false}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#1a3a1f_0%,#0f2212_100%)]">
            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </span>
          </div>
        )}
      </div>

      {/* Category name + Shop Now */}
      <div className="p-4 flex flex-col flex-1">
        <span className="font-utility text-sm font-semibold text-white uppercase tracking-[0.5px] group-hover:text-green-light transition-colors">
          {category.name}
        </span>
        <span className="inline-flex items-center gap-2 mt-2 font-utility text-[10px] tracking-[3px] uppercase text-champagne/90">
          Shop Now
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.5"
               className="transition-transform duration-500 group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
