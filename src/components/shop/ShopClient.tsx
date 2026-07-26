// src/components/shop/ShopClient.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: useRouter + useSearchParams for URL-driven filtering
//
// When a user clicks "Watches" filter, we don't re-fetch the
// page. We update the URL with router.push(), which:
//   1. Updates the browser address bar
//   2. Triggers a server re-render with new searchParams
//   3. Preserves history (Back button works)
//
// CONCEPT: useMemo
// Filters run on every render. useMemo caches the result and
// only recalculates when its dependencies change.
// Without it: products are re-filtered on every keystroke,
// scroll, or unrelated state change — slow on big lists.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import { FEATURED_PRODUCTS, formatPrice } from "@/data/products";
import { useCartStore, useWishlistStore } from "@/store/cartStore";
import type { Category, Product } from "@/types";

interface ShopClientProps {
  initialSearchParams: Record<string, string | undefined>;
  categories: Category[];
  initialProducts?: Product[];
}

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First" },
  { value: "price_asc",  label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popular",    label: "Most Popular" },
  { value: "rating",     label: "Highest Rated" },
];

const BRANDS = ["Seiko", "Calvin Klein", "Reebok", "Adidas", "Guess", "Michael Kors"];

export default function ShopClient({ initialSearchParams, categories, initialProducts }: ShopClientProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();

  // Read current filters from URL
  const activeCategory = searchParams.get("category") ?? "";
  const activeBrand    = searchParams.get("brand") ?? "";
  const activeSort     = searchParams.get("sort") ?? "newest";
  const searchQuery    = searchParams.get("search") ?? "";
  const currentPage    = Number(searchParams.get("page") ?? "1");

  // Local UI state
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [priceRange, setPriceRange]     = useState([0, 50000]);

  const { addItem }     = useCartStore();
  const { toggle, has } = useWishlistStore();

  // ── Update URL helper ─────────────────────────────────────
  // Instead of calling router.push() with a full URL string
  // every time, this helper merges one key into the current params.
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filter changes
      if (key !== "page") params.set("page", "1");
      router.push(`/shop?${params.toString()}`);
    },
    [router, searchParams]
  );

  // ── Filter + sort products ────────────────────────────────
  // In Phase 2: replace FEATURED_PRODUCTS with an API call
  const filtered = useMemo(() => {
    let result = [...(initialProducts ?? FEATURED_PRODUCTS)];

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activeBrand) {
      result = result.filter(
        (p) => p.brand.toLowerCase() === activeBrand.toLowerCase()
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.nickname?.toLowerCase().includes(q)
      );
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // Sort
    switch (activeSort) {
      case "price_asc":  result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "popular":    result.sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "rating":     result.sort((a, b) => b.rating - a.rating); break;
    }

    return result;
  }, [activeCategory, activeBrand, searchQuery, activeSort, priceRange]);

  // ── Pagination ────────────────────────────────────────────
  const PER_PAGE   = 12;
  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className="knl-container py-8">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="mb-8">
        <span className="section-label block mb-2">All Products</span>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <h1 className="section-title">Shop</h1>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search watches, brands…"
              value={searchQuery}
              onChange={(e) => updateParam("search", e.target.value)}
              className={`bg-card border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-gray-mid outline-none w-64 focus:border-green-mid transition-colors`}
            />
            <svg className="absolute left-3.5 top-3 text-gray-mid" width="14" height="14"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
        </div>

        {/* Breadcrumb */}
        <p className="text-[12px] text-gray-dark mt-2">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          {" / "}
          <span className="text-gray-mid">Shop</span>
          {activeCategory && (
            <> {" / "} <span className="text-gray-mid capitalize">{activeCategory}</span></>
          )}
        </p>
      </div>

      <div className="flex gap-8">

        {/* ── Sidebar filters ──────────────────────────── */}
        <aside className={`
          w-64 flex-shrink-0
          ${sidebarOpen ? "block" : "hidden"} lg:block
        `}>
          <div className="bg-card border border-white/5 rounded-2xl p-6 sticky top-24">

            {/* Clear all filters */}
            {(activeCategory || activeBrand || searchQuery) && (
              <button
                onClick={() => router.push("/shop")}
                className="text-[11px] text-green-light hover:text-white mb-4 transition-colors"
              >
                ✕ Clear all filters
              </button>
            )}

            {/* Category filter */}
            <FilterSection title="Category">
              <button
                onClick={() => updateParam("category", "")}
                className={`filter-pill w-full text-left ${!activeCategory ? "active" : ""}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("category", cat.slug)}
                  className={`filter-pill w-full text-left ${activeCategory === cat.slug ? "active" : ""}`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </FilterSection>

            {/* Brand filter */}
            <FilterSection title="Brand">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  onClick={() =>
                    updateParam("brand", activeBrand === brand.toLowerCase() ? "" : brand.toLowerCase())
                  }
                  className={`filter-pill w-full text-left ${activeBrand === brand.toLowerCase() ? "active" : ""}`}
                >
                  {brand}
                </button>
              ))}
            </FilterSection>

            {/* Price range */}
            <FilterSection title="Price Range">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[12px] text-gray-mid">
                  <span>{formatPrice(priceRange[0])}</span>
                  <span>{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={500}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-green-mid"
                />
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* ── Products area ─────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Toolbar: result count + sort + mobile filter toggle */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <p className="text-[13px] text-gray-mid">
              <span className="text-white font-semibold">{filtered.length}</span> products found
            </p>
            <div className="flex items-center gap-3">
              {/* Mobile: toggle sidebar */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden flex items-center gap-1.5 text-[12px] text-gray-light border border-white/10 rounded-full px-3 py-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/>
                  <line x1="4" y1="18" x2="18" y2="18"/>
                </svg>
                Filters
              </button>

              {/* Sort dropdown */}
              <select
                value={activeSort}
                onChange={(e) => updateParam("sort", e.target.value)}
                className={`bg-card border border-white/10 text-[13px] text-white rounded-full px-4 py-1.5 outline-none focus:border-green-mid transition-colors cursor-pointer`}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filter pills */}
          {(activeCategory || activeBrand) && (
            <div className="flex gap-2 flex-wrap mb-5">
              {activeCategory && (
                <ActivePill label={activeCategory} onRemove={() => updateParam("category", "")} />
              )}
              {activeBrand && (
                <ActivePill label={activeBrand} onRemove={() => updateParam("brand", "")} />
              )}
            </div>
          )}

          {/* Product grid */}
          {paginated.length > 0 ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5">
              {paginated.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => addItem(p)}
                  onSaveToWishlist={(p) => toggle(p.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState query={searchQuery} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => updateParam("page", String(page))}
                  className={`
                    w-9 h-9 rounded-full text-[13px] font-semibold transition-all
                    ${page === currentPage
                      ? "bg-green-mid text-white"
                      : "bg-card border border-white/10 text-gray-mid hover:border-green-mid hover:text-white"
                    }
                  `}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter pill styles injected once */}
      <style jsx global>{`
        .filter-pill {
          display: block;
          width: 100%;
          text-align: left;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 13px;
          color: var(--gray-light, #c8c8c8);
          transition: all 0.2s;
          margin-bottom: 2px;
        }
        .filter-pill:hover { background: rgba(255,255,255,0.05); color: white; }
        .filter-pill.active { background: rgba(45,106,53,0.25); color: #5cb85c; }
      `}</style>
    </div>
  );
}

// ── Small helper components ───────────────────────────────────

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="font-utility text-[11px] tracking-[2px] uppercase text-white">
          {title}
        </span>
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`text-gray-mid transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function ActivePill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className={`inline-flex items-center gap-1.5 bg-green-dark/40 border border-green-mid/30 text-green-light text-[11px] font-utility tracking-wide uppercase px-3 py-1 rounded-full`}>
      {label}
      <button onClick={onRemove} className="hover:text-white transition-colors">✕</button>
    </span>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-24">
      <p className="text-6xl mb-4">🔍</p>
      <h3 className="font-display text-2xl text-white mb-2">No products found</h3>
      <p className="text-gray-mid text-[14px] mb-6">
        {query ? `No results for "${query}".` : "Try adjusting your filters."}
      </p>
      <Link href="/shop" className="btn-primary">Clear Filters</Link>
    </div>
  );
}
