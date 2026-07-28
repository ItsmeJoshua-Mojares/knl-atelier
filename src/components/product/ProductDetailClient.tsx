// src/components/product/ProductDetailClient.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Controlled image gallery
//
// selectedImage is a piece of state. The main image and the
// thumbnail row are both controlled by it:
//   - Thumbnail onClick → setSelectedImage(index)
//   - Main image src   → product.images[selectedImage]
//
// This is the "single source of truth" pattern — one state
// variable drives multiple UI elements.
//
// CONCEPT: Structured Data (JSON-LD)
// The <script type="application/ld+json"> block tells Google
// about this product: name, price, availability, ratings.
// Google uses this to show rich results (price in search).
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { formatPrice }    from "@/data/products";
import { useCartStore, useWishlistStore } from "@/store/cartStore";
import { productsApi } from "@/lib/api/client";
import ProductCard from "@/components/ui/ProductCard";

interface Props {
  product: Product;
  related: Product[];
}

export default function ProductDetailClient({ product, related }: Props) {
  const router             = useRouter();
  const [selectedImg, setSelectedImg] = useState(0);
  const [quantity, setQuantity]       = useState(1);
  const [activeTab, setActiveTab]     = useState<"specs" | "inclusions" | "reviews">("specs");
  const [toastMsg, setToastMsg]       = useState<string | null>(null);

  const { addItem }     = useCartStore();
  const { toggle, has } = useWishlistStore();

  const specs       = product.specs.type === "watch" ? product.specs : null;
  const isWishlisted = has(product.id);

  function handleAddToCart() {
    addItem(product, quantity);
    setToastMsg(`${product.name} added to cart`);
    setTimeout(() => setToastMsg(null), 3000);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  // Placeholder images if none provided
  const images = product.images.length > 0
    ? product.images
    : ["/images/placeholder-watch.jpg", "/images/placeholder-watch-2.jpg"];

  return (
    <>
      {/* JSON-LD structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type":    "Product",
            name:       `${product.brand} ${product.name}`,
            brand:      { "@type": "Brand", name: product.brand },
            offers: {
              "@type":       "Offer",
              price:         product.price,
              priceCurrency: "PHP",
              availability:  product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
            aggregateRating: {
              "@type":       "AggregateRating",
              ratingValue:   product.rating,
              reviewCount:   product.reviewCount,
            },
          }),
        }}
      />

      <div className="knl-container py-10">

        {/* Breadcrumb */}
        <nav className="text-[12px] text-gray-dark mb-8">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          {" / "}
          <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
          {" / "}
          <Link href={`/shop?category=${product.category}`}
                className="hover:text-white transition-colors capitalize">
            {product.category}
          </Link>
          {" / "}
          <span className="text-gray-mid">{product.sku}</span>
        </nav>

        {/* ── Main product layout ──────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* LEFT: Image gallery */}
          <div>
            {/* Main image */}
            <div className={`relative aspect-square rounded-2xl overflow-hidden bg-[linear-gradient(135deg,#1a3a1f,#1c3020)] mb-4`}>
              {images[selectedImg] ? (
                <Image
                  src={images[selectedImg]}
                  alt={`${product.brand} ${product.name}`}
                  fill
                  className="object-contain p-10"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-utility text-5xl font-bold text-green-mid/20">
                    {product.sku}
                  </span>
                  <span className="font-utility text-[11px] tracking-[3px] text-white/10 uppercase mt-2">
                    {product.brand}
                  </span>
                </div>
              )}

              {/* Badge */}
              {product.badge && (
                <span className={`
                  absolute top-4 left-4 font-utility text-[10px] font-bold
                  tracking-[1.5px] uppercase px-2.5 py-1 rounded
                  ${product.badge === "new"        ? "bg-green-mid text-white" : ""}
                  ${product.badge === "sale"       ? "bg-gold text-dark" : ""}
                  ${product.badge === "hot"        ? "bg-red-700 text-white" : ""}
                  ${product.badge === "bestseller" ? "bg-gold text-dark" : ""}
                `}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Thumbnail row */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`
                      relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0
                      bg-[#1a3a1f] border-2 transition-all
                      ${i === selectedImg
                        ? "border-green-mid"
                        : "border-white/10 hover:border-white/30"
                      }
                    `}
                  >
                    <Image src={img} alt={`View ${i + 1}`} fill
                           className="object-contain p-2" sizes="80px"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product info */}
          <div>
            {/* Brand + rating */}
            <div className="flex items-center justify-between mb-3">
              <span className="font-utility text-[11px] tracking-[3px] uppercase text-green-light">
                {product.brand}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-gold text-sm">★</span>
                <span className="text-[13px] text-white font-semibold">{product.rating}</span>
                <span className="text-[12px] text-gray-mid">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Name */}
            <h1 className="font-display text-3xl font-semibold text-white leading-tight mb-1">
              {product.name}
            </h1>
            {product.nickname && (
              <p className="font-utility text-lg tracking-[2px] text-gold uppercase mb-6">
                &ldquo;{product.nickname}&rdquo;
              </p>
            )}

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-utility text-4xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <span className="text-gray-mid line-through text-lg">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>

            {/* Stock badge */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-[12px] text-green-light">
                  <span className="w-2 h-2 rounded-full bg-green-light animate-pulse"/>
                  In Stock — Ready to ship
                </span>
              ) : (
                <span className="text-[12px] text-red-400">Out of Stock</span>
              )}
            </div>

            {/* Quantity selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[13px] text-gray-mid">Quantity:</span>
              <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-light hover:text-white hover:bg-white/5 transition-colors"
                >
                  −
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-white font-semibold text-[14px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-light hover:text-white hover:bg-white/5 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 mb-8">
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="btn-primary justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="btn-ghost justify-center py-4 text-base disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                onClick={() => toggle(product.id)}
                className={`
                  flex items-center justify-center gap-2 py-3 rounded-full
                  border transition-all duration-300 text-[13px] font-utility font-semibold tracking-wider uppercase
                  ${isWishlisted
                    ? "border-red-500/50 text-red-400 bg-red-500/10"
                    : "border-white/10 text-gray-light hover:border-white/30"
                  }
                `}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"}
                     stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
              {[
                { icon: "🛡️", text: "100% Authentic" },
                { icon: "📦", text: "Full Box & Papers" },
                { icon: "🔄", text: "7-Day Returns" },
                { icon: "🚚", text: "Free Shipping ₱1,500+" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-[11px] text-gray-mid">
                  <span>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs: Specs / Inclusions / Reviews ───────── */}
        <div className="mb-20">
          {/* Tab bar */}
          <div className="flex border-b border-white/10 mb-8">
            {(["specs", "inclusions", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  font-utility text-[13px] font-semibold tracking-[1.5px] uppercase
                  px-6 py-3 border-b-2 transition-all duration-300
                  ${activeTab === tab
                    ? "border-green-mid text-white"
                    : "border-transparent text-gray-mid hover:text-white"
                  }
                `}
              >
                {tab === "specs"      ? "Watch Details"  : ""}
                {tab === "inclusions" ? "What's Included" : ""}
                {tab === "reviews"    ? `Reviews (${product.reviewCount})` : ""}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "specs" && specs && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              {[
                ["Brand",     product.brand],
                ["Ref. No.",  specs.refNumber],
                ["Caliber",   specs.caliberNumber],
                ["Condition", specs.condition],
                ["Diameter",  specs.diameter],
                ["Bezel",     specs.bezel],
                ["Movement",  specs.movement],
                ["Crystal",   specs.crystal],
              ].map(([label, value]) => (
                <div key={label}
                     className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[13px] text-gray-mid">{label}</span>
                  <span className="text-[13px] text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "inclusions" && specs && (
            <div className="max-w-xl">
              <p className="text-[14px] text-gray-light leading-relaxed mb-4">
                Every watch from KNL Atelier & Co. comes complete and genuine:
              </p>
              <ul className="space-y-2">
                {specs.inclusions.split(",").map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[14px] text-gray-light">
                    <span className="text-green-light">✓</span>
                    {item.trim()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewsTab
              slug={product.slug}
              rating={product.rating}
              count={product.reviewCount}
            />
          )}
        </div>

        {/* ── Related products ──────────────────────────── */}
        {related.length > 0 && (
          <div>
            <div className="mb-8">
              <span className="section-label block mb-2">You May Also Like</span>
              <h2 className="section-title">Related Products</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={(prod) => addItem(prod)}
                  onSaveToWishlist={(prod) => toggle(prod.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-7 right-7 z-50 bg-mid border border-white/10 border-l-[3px] border-l-green-light rounded-xl px-4 py-3 flex items-center gap-3 animate-slide-in shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5cb85c" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-[13px] text-white">{toastMsg}</span>
        </div>
      )}
    </>
  );
}

// ── Reviews sub-component ─────────────────────────────────────
interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string;
  is_verified: boolean;
  created_at: string;
  user: { id: number; first_name: string; last_name: string };
}

function ReviewsTab({ slug, rating, count }: { slug: string; rating: number; count: number }) {
  const [reviews, setReviews]       = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg]       = useState<string | null>(null);
  const [formError, setFormError]   = useState<string | null>(null);

  // Form state
  const [starRating, setStarRating] = useState(0);
  const [hoverStar, setHoverStar]   = useState(0);
  const [title, setTitle]           = useState("");
  const [body, setBody]             = useState("");

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("knl_token"));
  }, []);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const r = await productsApi.reviews.list(slug, { page: 1 });
      setReviews(r.data.data?.data ?? []);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  // Compute star distribution from real reviews
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.rating === stars).length,
    pct: reviews.length > 0
      ? Math.round((reviews.filter((r) => r.rating === stars).length / reviews.length) * 100)
      : 0,
  }));

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (starRating === 0 || body.length < 10) return;
    setSubmitting(true);
    setFormError(null);
    setFormMsg(null);
    try {
      await productsApi.reviews.create(slug, {
        rating: starRating,
        title: title || undefined,
        body,
      });
      setFormMsg("Review submitted! It will appear after admin approval.");
      setShowForm(false);
      setStarRating(0);
      setTitle("");
      setBody("");
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? "Failed to submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Rating summary */}
      <div className="flex items-center gap-6 mb-8 p-6 bg-card border border-white/5 rounded-2xl max-w-sm">
        <div className="text-center">
          <div className="font-utility text-5xl font-bold text-white">{rating}</div>
          <div className="flex gap-1 justify-center my-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={s <= Math.round(rating) ? "text-gold" : "text-gray-dark"}>★</span>
            ))}
          </div>
          <div className="text-[12px] text-gray-mid">{count} reviews</div>
        </div>
        <div className="flex-1 space-y-1.5">
          {distribution.map((d) => (
            <div key={d.stars} className="flex items-center gap-2">
              <span className="text-[11px] text-gray-mid w-3">{d.stars}</span>
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${d.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit success message */}
      {formMsg && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-6 max-w-2xl">
          <p className="text-[13px] text-green-light">{formMsg}</p>
        </div>
      )}

      {/* Write a Review button */}
      {isLoggedIn && !showForm && !formMsg && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 text-[13px] font-utility font-semibold text-green-light border border-green-mid/40 hover:border-green-mid rounded-lg px-4 py-2 transition-all"
        >
          Write a Review
        </button>
      )}

      {/* Write a Review form */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-card border border-white/5 rounded-xl p-6 mb-8 max-w-2xl">
          <p className="text-[14px] font-semibold text-white mb-4">Write Your Review</p>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5 mb-4">
              <p className="text-[12px] text-red-400">{formError}</p>
            </div>
          )}

          {/* Star rating selector */}
          <div className="mb-4">
            <label className="text-[12px] text-gray-mid block mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStarRating(s)}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  className="text-2xl transition-colors"
                >
                  <span className={s <= (hoverStar || starRating) ? "text-gold" : "text-gray-dark"}>★</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-[12px] text-gray-mid block mb-2">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="w-full bg-mid border border-white/10 text-[13px] text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-mid"
              maxLength={100}
            />
          </div>

          {/* Body */}
          <div className="mb-4">
            <label className="text-[12px] text-gray-mid block mb-2">Review *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience with this product (min 10 characters)"
              rows={4}
              className="w-full bg-mid border border-white/10 text-[13px] text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-mid resize-none"
              maxLength={2000}
              required
              minLength={10}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting || starRating === 0 || body.length < 10}
              className="text-[12px] font-utility font-semibold text-white bg-green-mid hover:bg-green-light/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-5 py-2.5 transition-all"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormError(null); }}
              className="text-[12px] font-utility font-semibold text-gray-mid hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-5 py-2.5 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Review cards */}
      {loading ? (
        <div className="text-[13px] text-gray-mid py-8">Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className="text-[13px] text-gray-mid py-8">No reviews yet. Be the first to review this product!</div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {reviews.map((r) => (
            <div key={r.id} className="bg-card border border-white/5 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-dark flex items-center justify-center font-utility text-[13px] font-bold text-green-light">
                    {r.user.first_name[0]}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      {r.user.first_name} {r.user.last_name[0]}.
                    </p>
                    <p className="text-[11px] text-gray-mid">
                      {new Date(r.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                      {r.is_verified && <span className="ml-2 text-green-light">✓ Verified Purchase</span>}
                    </p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span key={s} className={s <= r.rating ? "text-gold text-sm" : "text-gray-dark text-sm"}>★</span>
                  ))}
                </div>
              </div>
              {r.title && <p className="text-[13px] font-semibold text-white mb-1">{r.title}</p>}
              <p className="text-[13px] text-gray-light leading-relaxed italic">&ldquo;{r.body}&rdquo;</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
