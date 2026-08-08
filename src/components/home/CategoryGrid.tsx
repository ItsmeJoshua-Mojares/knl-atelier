// src/components/home/CategoryGrid.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// Props — this component receives data from its parent via props.
// Instead of hardcoding the categories inside this component,
// the parent (page.tsx) passes them in. This makes the component
// reusable — you could use it to show ANY list of categories.
//
// interface CategoryGridProps — defines exactly what props this
// component expects. TypeScript will error if you forget to pass
// `categories` when you use <CategoryGrid />.
//
// .map() — the most common React pattern. Takes an array and
// returns a new array of JSX elements. React renders all of them.
// The `key` prop must be unique so React can track which item
// is which when the list updates.
//
// Native scroll-snap — instead of a JS-drag carousel we use
// `scroll-snap-type` with a horizontally scrolling container.
// This gives us free swipe/trackpad support with zero drag
// logic, plus prev/next buttons that `scrollBy()` the strip.
// ─────────────────────────────────────────────────────────────

"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types";

// Props interface — what this component expects to receive
interface CategoryGridProps {
  categories: Category[];
}

const GAP_REM = 1.25; // matches the `gap-5` below, used to compute scroll step

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const step = card ? card.offsetWidth + GAP_REM * 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-section overflow-hidden">
      <div className="knl-container">

        {/* Section header */}
        <div className="flex items-end justify-between mb-14 flex-wrap gap-6">
          <div>
            <span className="section-label block mb-3">Explore Our World</span>
            <h2 className="section-title mb-4">Shop by Category</h2>
            <p className="text-[15px] text-gray-mid max-w-[460px]">
              From precision timepieces to signature scents — discover curated
              collections for every lifestyle.
            </p>
          </div>

          {/* Desktop-only arrow controls */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous categories"
              className="w-11 h-11 rounded-full border border-white/15 text-white/70 flex items-center justify-center hover:border-champagne/60 hover:text-champagne transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next categories"
              className="w-11 h-11 rounded-full border border-white/15 text-white/70 flex items-center justify-center hover:border-champagne/60 hover:text-champagne transition-all duration-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Swipeable carousel strip */}
        <div className="relative">
          {/* Edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-10 lg:w-24 z-10 bg-gradient-to-r from-[#0c0e0d] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 lg:w-24 z-10 bg-gradient-to-l from-[#0c0e0d] to-transparent" />

          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory px-2 -mx-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category, i) => (
              <CategoryCard key={category.id} category={category} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

// ── CategoryCard sub-component ───────────────────────────────
// Breaking this out as its own component keeps CategoryGrid clean.
// When you have a repeated element inside a list, always extract
// it into its own component.

interface CategoryCardProps {
  category: Category;
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  const hasImage = Boolean(category.image);

  return (
    <Link
      href={`/shop?category=${category.slug}`}
      data-card
      className="group relative flex flex-col justify-end rounded-2xl overflow-hidden border border-white/5 cursor-pointer basis-[72%] sm:basis-[46%] lg:basis-[23.5%] shrink-0 snap-start aspect-[3/4] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_48px_rgba(0,0,0,0.65)] hover:border-champagne/50"
    >
      {/* Image (real product photo from the API) or gradient+icon fallback */}
      {hasImage ? (
        <div className="absolute inset-0">
          <Image
            src={category.image as string}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 72vw, (max-width: 1024px) 46vw, 24vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            unoptimized
          />
          {/* Always-on dark grade so text stays legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
          <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors duration-500" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#1a3a1f_0%,#0f2212_100%)]">
          <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
            {category.icon}
          </span>
        </div>
      )}

      {/* Index number — editorial watermark */}
      <span className="absolute top-4 left-4 font-utility text-[11px] tracking-[3px] text-champagne/80 z-10">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Text overlay at the bottom */}
      <div className="relative z-10 p-5">
        {/* Category name — underlined like in the PDF */}
        <span className="block font-utility text-[15px] font-bold tracking-[2px] uppercase text-white underline underline-offset-[3px] mb-1.5">
          {category.name}
        </span>

        {/* Short description */}
        <p className="text-[11px] text-gray-light leading-[1.4]">
          {category.description}
        </p>

        {/* Shop affordance */}
        <span className="inline-flex items-center gap-2 mt-3 font-utility text-[10px] tracking-[3px] uppercase text-champagne/90">
          Shop Now
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-500 group-hover:translate-x-1">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
