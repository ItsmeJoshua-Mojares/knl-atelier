// src/app/checkout/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Multi-step form with step state
//
// Complex forms are split into steps to avoid overwhelming users.
// The current step is stored in state. Each step renders its own
// form section. The "Next" button validates the current step
// before advancing.
//
// This pattern (wizard / stepper) is very common in e-commerce:
//   Step 1: Customer info
//   Step 2: Shipping address
//   Step 3: Payment method
//   Step 4: Review & place order
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm }   from "react-hook-form";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/cartStore";
import { formatPrice }  from "@/data/products";
import { ordersApi, productsApi, type CreateOrderPayload } from "@/lib/api/client";
import { apiProductToFrontend } from "@/lib/adapters";

type Step = 1 | 2 | 3 | 4;

interface CheckoutForm {
  // Step 1: Customer info
  first_name: string;
  last_name:  string;
  email:      string;
  phone:      string;
  // Step 2: Shipping
  address_line1: string;
  address_line2: string;
  city:          string;
  province:      string;
  postal_code:   string;
  // Step 3: Payment
  payment_method: "gcash" | "maya" | "bank_transfer" | "cod";
  // GCash/Maya reference number
  reference_number?: string;
}

const PAYMENT_OPTIONS = [
  { value: "gcash",         label: "GCash",         icon: "💚", desc: "Pay via GCash mobile wallet" },
  { value: "maya",          label: "Maya",           icon: "💙", desc: "Pay via Maya (formerly PayMaya)" },
  { value: "bank_transfer", label: "Bank Transfer",  icon: "🏦", desc: "Direct bank transfer" },
  { value: "cod",           label: "Cash on Delivery", icon: "💵", desc: "Pay when your order arrives" },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const buySlug = searchParams.get("buy");
  const [step, setStep] = useState<Step>(1);
  const [isPlacing, setIsPlacing] = useState(false);
  const [buyLoading, setBuyLoading] = useState(!!buySlug);

  const { items, addItem, getSubtotal, couponDiscount, couponCode, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const { register, handleSubmit, watch, trigger,
          formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      first_name:     user?.first_name ?? "",
      last_name:      user?.last_name  ?? "",
      email:          user?.email      ?? "",
      payment_method: "cod",
    },
  });

  const subtotal  = getSubtotal();
  const shipping  = subtotal >= 1500 ? 0 : 150;
  const tax       = subtotal * 0.12;
  const total     = subtotal - couponDiscount + shipping + tax;
  const payMethod = watch("payment_method");

  // Handle ?buy=slug — fetch product and add to cart
  useEffect(() => {
    if (!buySlug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await productsApi.show(buySlug);
        const api = res.data.data?.product ?? res.data.data;
        if (api && !cancelled) {
          addItem(apiProductToFrontend(api));
        }
      } catch {
        // product not found — will fall through to empty cart redirect
      } finally {
        if (!cancelled) {
          setBuyLoading(false);
          // Remove the ?buy= param from URL without reload
          const url = new URL(window.location.href);
          url.searchParams.delete("buy");
          window.history.replaceState({}, "", url.toString());
        }
      }
    })();
    return () => { cancelled = true; };
  }, [buySlug, addItem]);

  // Validate current step fields before advancing
  async function handleNext() {
    const fieldsPerStep: Record<Step, (keyof CheckoutForm)[]> = {
      1: ["first_name", "last_name", "email", "phone"],
      2: ["address_line1", "city", "province", "postal_code"],
      3: ["payment_method"],
      4: [],
    };
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => (s < 4 ? (s + 1) as Step : s));
  }

  const [orderError, setOrderError] = useState("");

  // Final order submission — now calls the real Phase 4 Laravel API
  // instead of the Phase 3 setTimeout mock.
  async function onSubmit(data: CheckoutForm) {
    setIsPlacing(true);
    setOrderError("");

    try {
      const payload: CreateOrderPayload = {
        first_name:        data.first_name,
        last_name:         data.last_name,
        phone:             data.phone,
        address_line1:     data.address_line1,
        address_line2:     data.address_line2,
        city:              data.city,
        province:          data.province,
        postal_code:       data.postal_code,
        payment_method:    data.payment_method,
        reference_number:  data.reference_number,
        coupon_code:       couponCode ?? undefined,
      };

      const res = await ordersApi.create(payload);
      const { order_number } = res.data.data;

      clearCart();
      router.push(`/order-success?order=${order_number}`);

    } catch (err: any) {
      // Laravel returns 422 for stock/validation errors with a message
      const message =
        err.response?.data?.message ??
        "Something went wrong placing your order. Please try again.";
      setOrderError(message);
      setIsPlacing(false);
    }
  }

  if (buyLoading) {
    return (
      <div className="knl-container py-10 min-h-screen flex items-center justify-center">
        <p className="text-[13px] text-gray-mid">Adding item to cart…</p>
      </div>
    );
  }

  if (items.length === 0) {
    if (typeof window !== "undefined") {
      router.replace("/cart");
    }
    return null;
  }

  return (
    <div className="knl-container py-10 min-h-screen">
      <div className="mb-8">
        <span className="section-label block mb-2">Secure Checkout</span>
        <h1 className="section-title">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">

        {/* LEFT: Form steps */}
        <div>
          {/* Step indicator */}
          <div className="flex items-center gap-0 mb-10">
            {(["Customer Info", "Shipping", "Payment", "Review"] as const).map((label, i) => {
              const s = (i + 1) as Step;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      font-utility text-[12px] font-bold transition-all duration-300
                      ${step > s  ? "bg-green-mid text-white" : ""}
                      ${step === s ? "bg-green-mid text-white ring-2 ring-green-mid/30" : ""}
                      ${step < s  ? "bg-white/5 text-gray-mid border border-white/10" : ""}
                    `}>
                      {step > s ? "✓" : s}
                    </div>
                    <span className={`text-[10px] mt-1 font-utility tracking-wide uppercase ${step === s ? "text-white" : "text-gray-dark"}`}>
                      {label}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-[1px] mx-2 mb-5 transition-colors ${step > s ? "bg-green-mid" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* ── Step 1: Customer info ─────────────────── */}
            {step === 1 && (
              <FormSection title="Customer Information">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="First Name" error={errors.first_name?.message}>
                    <input {...register("first_name", { required: "Required" })}
                           className="form-input" placeholder="Juan"/>
                  </FormField>
                  <FormField label="Last Name" error={errors.last_name?.message}>
                    <input {...register("last_name",  { required: "Required" })}
                           className="form-input" placeholder="Dela Cruz"/>
                  </FormField>
                </div>
                <FormField label="Email Address" error={errors.email?.message}>
                  <input type="email"
                         {...register("email", { required: "Required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })}
                         className="form-input" placeholder="juan@email.com"/>
                </FormField>
                <FormField label="Phone Number" error={errors.phone?.message}>
                  <input {...register("phone", { required: "Required" })}
                         className="form-input" placeholder="09XX XXX XXXX"/>
                </FormField>
              </FormSection>
            )}

            {/* ── Step 2: Shipping address ──────────────── */}
            {step === 2 && (
              <FormSection title="Shipping Address">
                <FormField label="Address Line 1" error={errors.address_line1?.message}>
                  <input {...register("address_line1", { required: "Required" })}
                         className="form-input" placeholder="House/Unit No., Street Name"/>
                </FormField>
                <FormField label="Address Line 2 (Optional)">
                  <input {...register("address_line2")}
                         className="form-input" placeholder="Barangay, Subdivision"/>
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="City / Municipality" error={errors.city?.message}>
                    <input {...register("city", { required: "Required" })}
                           className="form-input" placeholder="Quezon City"/>
                  </FormField>
                  <FormField label="Province" error={errors.province?.message}>
                    <input {...register("province", { required: "Required" })}
                           className="form-input" placeholder="Metro Manila"/>
                  </FormField>
                </div>
                <FormField label="Postal Code" error={errors.postal_code?.message}>
                  <input {...register("postal_code", { required: "Required" })}
                         className="form-input w-40" placeholder="1100"/>
                </FormField>
              </FormSection>
            )}

            {/* ── Step 3: Payment ───────────────────────── */}
            {step === 3 && (
              <FormSection title="Payment Method">
                <div className="space-y-3">
                  {PAYMENT_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`
                        flex items-center gap-4 p-4 rounded-xl border cursor-pointer
                        transition-all duration-200
                        ${payMethod === opt.value
                          ? "border-green-mid bg-green-dark/20"
                          : "border-white/10 hover:border-white/20 bg-card"
                        }
                      `}
                    >
                      <input type="radio" value={opt.value}
                             {...register("payment_method")}
                             className="accent-green-mid"/>
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <p className="font-utility text-[14px] font-semibold text-white">{opt.label}</p>
                        <p className="text-[12px] text-gray-mid">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Reference number for GCash / Maya */}
                {(payMethod === "gcash" || payMethod === "maya") && (
                  <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                    <p className="text-[13px] text-gray-light mb-3">
                      Send payment to: <span className="text-white font-semibold">0917-XXX-XXXX</span>
                    </p>
                    <FormField label="Reference Number" error={errors.reference_number?.message}>
                      <input
                        {...register("reference_number", { required: "Please enter your reference number" })}
                        className="form-input"
                        placeholder="e.g. 1234567890"
                      />
                    </FormField>
                  </div>
                )}
              </FormSection>
            )}

            {/* ── Step 4: Review order ──────────────────── */}
            {step === 4 && (
              <FormSection title="Review Your Order">
                <div className="space-y-3 mb-6">
                  {items.map(({ product, quantity }) => (
                    <div key={product.id}
                         className="flex items-center justify-between py-2 border-b border-white/5">
                      <div>
                        <p className="text-[13px] text-white font-medium">
                          {product.brand} {product.name}
                          {product.nickname && ` "${product.nickname}"`}
                        </p>
                        <p className="text-[11px] text-gray-mid">Qty: {quantity}</p>
                      </div>
                      <span className="font-utility text-[14px] font-bold text-white">
                        {formatPrice(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-[13px]">
                  <p className="text-gray-mid mb-1">Payment: <span className="text-white capitalize">{payMethod?.replace("_", " ")}</span></p>
                  <p className="text-gray-mid">Total: <span className="text-white font-bold text-lg">{formatPrice(total)}</span></p>
                </div>

                {orderError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mt-4">
                    <p className="text-[13px] text-red-400">{orderError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isPlacing}
                  className="btn-primary w-full justify-center py-4 text-base mt-6 disabled:opacity-60"
                >
                  {isPlacing ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Placing Order…
                    </span>
                  ) : "Place Order"}
                </button>
              </FormSection>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button type="button" onClick={() => setStep((s) => (s - 1) as Step)}
                        className="btn-ghost flex-1 justify-center">
                  ← Back
                </button>
              )}
              {step < 4 && (
                <button type="button" onClick={handleNext}
                        className="btn-primary flex-1 justify-center">
                  Continue →
                </button>
              )}
            </div>
          </form>
        </div>

        {/* RIGHT: Order summary */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h2 className="font-display text-lg font-semibold text-white mb-5">Order Summary</h2>
            <div className="space-y-3 mb-5">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-[12px]">
                  <span className="text-gray-mid flex-1 truncate pr-2">
                    {product.name} ×{quantity}
                  </span>
                  <span className="text-white font-medium flex-shrink-0">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 space-y-2.5">
              {couponDiscount > 0 && (
                <div className="flex justify-between text-[12px]">
                  <span className="text-green-light">Coupon ({couponCode})</span>
                  <span className="text-green-light">−{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-mid">Shipping</span>
                <span className={shipping === 0 ? "text-green-light" : "text-white"}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-gray-mid">VAT (12%)</span>
                <span className="text-white">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                <span>Total</span>
                <span className="font-utility text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .form-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: white;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input::placeholder { color: #888; }
        .form-input:focus { border-color: #2d6a35; }
      `}</style>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-4">
      <h2 className="font-display text-xl font-semibold text-white mb-2">{title}</h2>
      {children}
    </div>
  );
}

function FormField({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-utility tracking-wide uppercase text-gray-mid mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}
