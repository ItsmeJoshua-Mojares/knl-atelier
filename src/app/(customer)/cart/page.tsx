// src/app/cart/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatPrice }  from "@/data/products";
import { couponApi }    from "@/lib/api/client";

// ─────────────────────────────────────────────────────────────
// CONCEPT: Derived state
//
// Never store calculated values in state if you can derive them.
//   BAD:  const [total, setTotal] = useState(0)  ← gets out of sync
//   GOOD: const total = subtotal - discount + shipping + tax  ← always correct
//
// Our Zustand store exposes getSubtotal() and getTotal() which
// are derived from items[] — they're never stored separately,
// so they're always in sync with the cart.
// ─────────────────────────────────────────────────────────────

const SHIPPING_THRESHOLD = 1500; // free shipping above this
const SHIPPING_FEE       = 150;
const TAX_RATE           = 0.12;

export default function CartPage() {
  const router = useRouter();
  const {
    items, updateQuantity, removeItem,
    getSubtotal, couponCode, couponDiscount,
    applyCoupon, removeCoupon, clearCart,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Derived values (never stored in state)
  const subtotal = getSubtotal();
  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax      = subtotal * TAX_RATE;
  const total    = subtotal - couponDiscount + shipping + tax;

  // Real coupon validation against the Phase 4 Laravel API.
  // The backend checks: active, within date range, under usage
  // limit, and meets min_order_amount — all server-side, so a
  // user can't bypass rules by editing the frontend.
  async function handleApplyCoupon() {
    setCouponError("");
    setCouponLoading(true);

    try {
      const res = await couponApi.validate(couponInput.trim(), subtotal);
      const { code, discount } = res.data.data;
      applyCoupon(code, discount);
    } catch (err: any) {
      const message =
        err.response?.data?.message ?? "Invalid or expired coupon code.";
      setCouponError(message);
    } finally {
      setCouponLoading(false);
    }
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="knl-container py-10 min-h-screen">
      <div className="mb-8">
        <span className="section-label block mb-2">Your Cart</span>
        <div className="flex items-end justify-between">
          <h1 className="section-title">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-[12px] text-gray-mid hover:text-red-400 transition-colors"
          >
            Clear Cart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">

        {/* ── Cart items ───────────────────────────────── */}
        <div className="space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id}
                 className="flex gap-5 bg-card border border-white/5 rounded-2xl p-5">

              {/* Product image */}
              <Link href={`/product/${product.slug}`}
                    className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#1a3a1f]">
                {product.images[0] ? (
                  <Image src={product.images[0]} alt={product.name}
                         fill className="object-contain p-2" sizes="96px"/>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center font-utility text-[10px] text-green-mid/30 uppercase tracking-widest">
                    {product.sku}
                  </div>
                )}
              </Link>

              {/* Product details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-utility text-[10px] tracking-[2px] uppercase text-green-light mb-0.5">
                      {product.brand}
                    </p>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className="font-display text-[15px] font-semibold text-white hover:text-green-light transition-colors">
                        {product.name}
                        {product.nickname && ` "${product.nickname}"`}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-gray-mid mt-0.5">SKU: {product.sku}</p>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-gray-dark hover:text-red-400 transition-colors flex-shrink-0 mt-1"
                    aria-label="Remove item"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>

                {/* Qty + price row */}
                <div className="flex items-center justify-between mt-4">
                  {/* Quantity stepper */}
                  <div className="flex items-center border border-white/10 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-light hover:text-white hover:bg-white/5 transition-colors text-lg leading-none"
                    >
                      −
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-white text-[13px] font-semibold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-light hover:text-white hover:bg-white/5 transition-colors text-lg leading-none"
                    >
                      +
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right">
                    <p className="font-utility text-[16px] font-bold text-white">
                      {formatPrice(product.price * quantity)}
                    </p>
                    {quantity > 1 && (
                      <p className="text-[11px] text-gray-mid">
                        {formatPrice(product.price)} each
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary sidebar ────────────────────── */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="font-display text-xl font-semibold text-white mb-6">
              Order Summary
            </h2>

            {/* Coupon input */}
            <div className="mb-6">
              {couponCode ? (
                <div className="flex items-center justify-between bg-green-dark/30 border border-green-mid/30 rounded-lg px-4 py-2.5">
                  <span className="text-[12px] text-green-light font-utility tracking-wide">
                    ✓ {couponCode} applied
                  </span>
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] text-gray-mid hover:text-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError("");
                      }}
                      placeholder="Coupon code"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[13px] text-white placeholder:text-gray-mid outline-none focus:border-green-mid transition-colors"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={!couponInput || couponLoading}
                      className="btn-primary !py-2 !px-4 !text-[11px] disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-red-400 mt-1.5">{couponError}</p>
                  )}
                  <p className="text-[10px] text-gray-dark mt-1">
                    Try: WELCOME10 · KNL500 · SEIKO20
                  </p>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 mb-6">
              <SummaryRow label="Subtotal"  value={formatPrice(subtotal)} />
              {couponDiscount > 0 && (
                <SummaryRow label={`Coupon (${couponCode})`}
                            value={`−${formatPrice(couponDiscount)}`}
                            className="text-green-light" />
              )}
              <SummaryRow
                label="Shipping"
                value={shipping === 0 ? "FREE" : formatPrice(shipping)}
                className={shipping === 0 ? "text-green-light" : ""}
              />
              {shipping > 0 && (
                <p className="text-[11px] text-gray-dark">
                  Free shipping on orders over {formatPrice(SHIPPING_THRESHOLD)}
                </p>
              )}
              <SummaryRow label="VAT (12%)" value={formatPrice(tax)} />
              <div className="border-t border-white/10 pt-3">
                <SummaryRow label="Total" value={formatPrice(total)} bold />
              </div>
            </div>

            {/* Checkout button */}
            <button
              onClick={() => router.push("/checkout")}
              className="btn-primary w-full justify-center py-4 text-base mb-3"
            >
              Proceed to Checkout
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <Link href="/shop" className="btn-ghost w-full justify-center py-3 text-[13px]">
              Continue Shopping
            </Link>

            {/* Payment methods */}
            <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
              {["COD", "MEET UP", "Chat"].map((m) => (
                <span key={m} className="text-[10px] text-gray-dark border border-white/5 rounded px-2 py-0.5">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label, value, bold = false, className = "",
}: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13px] ${bold ? "text-white font-semibold" : "text-gray-mid"}`}>
        {label}
      </span>
      <span className={`text-[13px] font-semibold ${bold ? "text-white text-lg" : ""} ${className}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="knl-container py-24 min-h-screen flex flex-col items-center justify-center text-center">
      <div className="text-6xl mb-6">🛒</div>
      <h2 className="font-display text-3xl font-semibold text-white mb-3">Your cart is empty</h2>
      <p className="text-gray-mid text-[14px] mb-8 max-w-sm">
        Looks like you haven&apos;t added anything yet. Browse our collections to find something you love.
      </p>
      <Link href="/shop" className="btn-primary">Start Shopping</Link>
    </div>
  );
}
