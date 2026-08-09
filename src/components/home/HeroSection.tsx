// src/components/home/HeroSection.tsx
// ─────────────────────────────────────────────────────────────
// DESIGN: "Museum Spotlight" — now a featured-product carousel.
//
// A rotating set of featured pieces in near-black, dramatically
// lit, huge negative space. Editorial type on the left, the
// current product floats in a soft-edged spotlight mask on the
// right. Swipe (touch), drag, or use the arrow buttons to move
// between products. Gold hairlines, champagne/ivory type, slow
// cinematic motion.
//
// If no featured products come from the API, we fall back to a
// refined CSS watch dial so the hero still looks intentional.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/format";

// Slow, luxurious easing curve (cubic-bezier "ease-out-expo")
const LUX_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: LUX_EASE },
});

const CATEGORY_RAIL = [
  { n: "01", label: "Watches",     slug: "watches" },
  { n: "02", label: "Fragrance",   slug: "fragrance" },
  { n: "03", label: "Sole",        slug: "sole" },
  { n: "04", label: "Accessories", slug: "accessories" },
];

const SWIPE_THRESHOLD = 60;

export interface HeroBanner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link_url: string | null;
}

interface HeroSectionProps {
  featured?: Product[];
  banners?: HeroBanner[];
}

export default function HeroSection({ featured = [], banners = [] }: HeroSectionProps) {
  const [index, setIndex] = useState(0);

  // Admin-managed hero banners win when present; otherwise we fall
  // back to featured products from the catalog.
  const heroBanners = banners.filter((b) => b.image_url);
  const useBanners = heroBanners.length > 0;

  const count = useBanners ? heroBanners.length : featured.length;
  const currentBanner = useBanners ? heroBanners[index % heroBanners.length] : null;
  const current = !useBanners && featured.length > 0 ? featured[index % featured.length] : null;

  const heroImage = currentBanner?.image_url ?? current?.images?.[0] ?? null;
  const canSwipe = count > 1;

  // Unified "micro card" — a banner (title/subtitle/link) or a product
  // (name/sku/price/link to its page), whichever is on screen.
  const micro = currentBanner
    ? {
        key: `banner-${currentBanner.id}`,
        href: currentBanner.link_url ?? "/shop",
        eyebrow: "Featured Promo",
        title: currentBanner.title,
        sub: currentBanner.subtitle ?? "Shop the collection",
        thumb: currentBanner.image_url ?? "",
      }
    : current
      ? {
          key: `product-${current.id}`,
          href: `/product/${current.slug}`,
          eyebrow: "Featured Piece",
          title: current.name,
          sub: `${current.sku} · ${formatPrice(current.price)}`,
          thumb: current.images[0] ?? "",
        }
      : null;

  const go = (dir: 1 | -1) => {
    if (!canSwipe) return;
    setIndex((i) => (i + dir + count) % count);
  };

  const onPanEnd = (_: unknown, info: PanInfo) => {
    if (!canSwipe) return;
    if (info.offset.x < -SWIPE_THRESHOLD) go(1);
    else if (info.offset.x > SWIPE_THRESHOLD) go(-1);
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0a0b0a]">
      {/* ── Ambient wash — soft champagne glow behind the spotlight ── */}
      <div className="absolute top-1/2 right-[-10%] w-[55%] h-[80%] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(216,196,154,0.08)_0%,transparent_62%)] pointer-events-none" />

      {/* ── Giant serif watermark ───────────────────────────── */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
        aria-hidden
        className="absolute -bottom-[8%] left-1/2 -translate-x-1/2 font-display font-semibold text-[clamp(220px,38vw,520px)] leading-none text-champagne/[0.035] select-none pointer-events-none whitespace-nowrap"
      >
        KNL
      </motion.span>

      {/* ── Film grain — adds expensive texture ─────────────── */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      <div className="knl-container relative z-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-10 items-center min-h-[82vh]">

          {/* ── Left: editorial type ───────────────────────── */}
          <div className="relative">
            {/* Eyebrow — hairline + tracked caps */}
            <div className="flex items-center gap-4 mb-8">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.1, delay: 0.2, ease: LUX_EASE }}
                className="block h-px w-14 bg-champagne origin-left"
              />
              <motion.p
                {...fadeUp(0.3)}
                className="font-utility text-[11px] tracking-[4px] uppercase text-champagne/80"
              >
                Est. 2021 · Makati, PH
              </motion.p>
            </div>

            {/* Headline */}
            <motion.h1
              {...fadeUp(0.45)}
              className="font-display font-light leading-[1.05] text-[clamp(44px,6.2vw,92px)]"
            >
              <span className="block text-ivory">Authentic Luxury,</span>
              <span className="block italic text-champagne">Yours to Wear</span>
            </motion.h1>

            {/* Sub copy */}
            <motion.p
              {...fadeUp(0.6)}
              className="text-[15px] font-light text-white/55 max-w-[400px] leading-[1.8] mt-7"
            >
              Curated watches, fragrances, shoes &amp; accessories — all
              genuine, all exceptional. Every piece chosen, verified, and
              yours to wear.
            </motion.p>

            {/* CTAs */}
            <motion.div
              {...fadeUp(0.75)}
              className="flex items-center gap-8 mt-11 flex-wrap"
            >
              <Link href="/shop" className="btn-lux group">
                Discover the Collection
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="transition-transform duration-500 group-hover:translate-x-1">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/shop" className="text-link-lux group">
                Explore Categories
                <span className="text-champagne/70 transition-transform duration-500 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>

            {/* Featured micro-card — follows the current slide */}
            {micro && (
              <motion.div
                key={micro.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: LUX_EASE }}
                className="mt-12"
              >
                <Link
                  href={micro.href}
                  className="group inline-flex items-center gap-4 border border-white/10 bg-white/[0.03] rounded-xl p-3 pr-5 hover:border-champagne/50 hover:bg-white/[0.05] transition-all duration-500"
                >
                  <span className="w-14 h-14 rounded-lg overflow-hidden bg-black/40 shrink-0">
                    {micro.thumb ? (
                      <Image
                        src={micro.thumb}
                        alt={micro.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : null}
                  </span>
                  <span>
                    <span className="block font-utility text-[9px] tracking-[3px] uppercase text-champagne/70 mb-1">
                      {micro.eyebrow}
                    </span>
                    <span className="block font-display text-[15px] text-ivory leading-tight">
                      {micro.title}
                    </span>
                    <span className="block font-utility text-[11px] tracking-[1px] text-white/50 mt-1">
                      {micro.sub}
                    </span>
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-champagne/70 ml-2 transition-transform duration-500 group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            )}
          </div>

          {/* ── Right: spotlight product carousel ──────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.5, ease: LUX_EASE }}
            className="relative flex flex-col items-center py-10"
          >
            {/* Swipe/drag target */}
            <motion.div
              onPanEnd={onPanEnd}
              style={{ touchAction: "pan-y" }}
              className="relative w-[min(78vw,440px)] aspect-square rounded-full overflow-hidden border border-champagne/30 cursor-grab active:cursor-grabbing"
            >
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "0 40px 120px rgba(0,0,0,0.85), inset 0 0 80px rgba(0,0,0,0.9)",
                }}
              />

              {heroImage && micro ? (
                <AnimatePresence initial={false}>
                  <motion.div
                    key={micro.key}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: LUX_EASE }}
                    className="absolute inset-0"
                  >
                    {/* Entrance zoom — settles static, no scroll drift */}
                    <motion.div
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 2.2, ease: LUX_EASE }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={heroImage}
                        alt={micro.title}
                        fill
                        priority={index === 0}
                        sizes="440px"
                        className="object-cover"
                      />
                    </motion.div>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <FallbackDial />
              )}

              {/* Warm grade — harmonises studio-white shots with the dark page */}
              <div className="absolute inset-0 bg-champagne/10 mix-blend-overlay pointer-events-none" />
              {/* Feather edges into black */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  maskImage: "radial-gradient(circle, transparent 58%, black 100%)",
                  WebkitMaskImage: "radial-gradient(circle, transparent 58%, black 100%)",
                  background: "radial-gradient(circle, transparent 55%, rgba(10,11,10,0.9) 100%)",
                }}
              />
            </motion.div>

            {/* Controls — arrows + counter */}
            {canSwipe && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
                className="flex items-center gap-6 mt-8"
              >
                <button
                  onClick={() => go(-1)}
                  aria-label="Previous product"
                  className="w-11 h-11 rounded-full border border-champagne/30 text-champagne flex items-center justify-center hover:bg-champagne/10 hover:border-champagne/60 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>

                <span className="font-utility text-[11px] tracking-[3px] uppercase text-white/50">
                  <span className="text-champagne">{String(index + 1).padStart(2, "0")}</span>
                  {" / "}
                  {String(count).padStart(2, "0")}
                </span>

                <button
                  onClick={() => go(1)}
                  aria-label="Next product"
                  className="w-11 h-11 rounded-full border border-champagne/30 text-champagne flex items-center justify-center hover:bg-champagne/10 hover:border-champagne/60 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>

      {/* ── Bottom metadata rail (desktop) ─────────────────── */}
      <div className="absolute bottom-0 inset-x-0 hidden lg:block z-10">
        <div className="knl-container">
          <div className="flex items-center justify-between border-t border-white/[0.08] pt-6 pb-7">
            <div className="flex items-center gap-10">
              {CATEGORY_RAIL.map((cat) => (
                <Link
                  key={cat.n}
                  href={`/shop?category=${cat.slug}`}
                  className="flex items-baseline gap-2 font-utility text-[11px] tracking-[3px] uppercase text-white/40 hover:text-champagne transition-colors duration-300"
                >
                  <span className="text-champagne/70">{cat.n}</span>
                  {cat.label}
                </Link>
              ))}
            </div>
            <span className="font-utility text-[10px] tracking-[3px] uppercase text-white/30">
              Seiko · Fragrance · Footwear
            </span>
          </div>
        </div>
      </div>

      {/* ── Scroll cue (mobile + desktop) ─────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 lg:bottom-[72px] flex flex-col items-center gap-2"
      >
        <span className="font-utility text-[9px] tracking-[3px] uppercase text-white/40">
          Scroll
        </span>
        <div className="h-8 w-px bg-white/20 relative overflow-hidden">
          <motion.span
            animate={{ y: [-16, 32] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 top-0 h-2 w-px bg-champagne"
          />
        </div>
      </motion.div>
    </section>
  );
}

// ── Fallback: refined CSS watch dial ─────────────────────────
// Used when the API has no featured products. Gold ticks, gold
// hands, gently rotating seconds hand — quiet, still intentional.
function FallbackDial() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="w-[68%] h-[68%] rounded-full relative"
        style={{
          background:
            "radial-gradient(circle at 40% 30%, #1c1e1a 0%, #0c0d0b 65%, #050605 100%)",
          boxShadow:
            "0 0 0 1px rgba(216,196,154,0.25), 0 0 0 10px rgba(216,196,154,0.04), inset 0 0 40px rgba(0,0,0,0.8)",
          backgroundImage: `
            repeating-conic-gradient(rgba(216,196,154,0.35) 0deg 1deg, transparent 1deg 6deg)
          `,
          WebkitMaskImage: "radial-gradient(circle, black 0%, black 60%, transparent 61%)",
          maskImage: "radial-gradient(circle, black 0%, black 60%, transparent 61%)",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[clamp(28px,4vw,44px)] text-champagne/80 tracking-[0.12em]">
          KNL
        </span>
      </div>
      {/* Hour hand — pivots from the dial centre */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-px h-[20%] pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 600, ease: "linear", repeat: Infinity }}
          className="absolute inset-0 origin-bottom bg-champagne/80"
        />
      </div>
    </div>
  );
}
