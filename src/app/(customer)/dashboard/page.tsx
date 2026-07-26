// src/app/dashboard/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Protected client-side routes
//
// This page checks useAuthStore on mount. If the user isn't
// logged in, router.replace('/login') immediately redirects.
// We return null to prevent any dashboard UI from flashing.
//
// In Phase 5, we'll add a proper middleware.ts file that
// handles this server-side before the page even loads.
//
// CONCEPT: Tab-based dashboard layout
// All sections (Orders, Profile, Wishlist, Address) live in
// one page. Only `activeTab` state changes. This avoids full
// page reloads between sections and feels app-like.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore, useWishlistStore, useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/data/products";
import { apiProductToFrontend } from "@/lib/adapters";
import { authApi } from "@/lib/api/client";
import type { Product } from "@/types";

type Tab = "orders" | "wishlist" | "profile" | "address" | "password";

const SIDEBAR_TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "orders",   label: "My Orders",     icon: "📦" },
  { id: "wishlist", label: "Wishlist",       icon: "💝" },
  { id: "profile",  label: "Profile",        icon: "👤" },
  { id: "address",  label: "Address Book",   icon: "📍" },
  { id: "password", label: "Change Password",icon: "🔒" },
];

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shipped:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered:  "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { productIds, toggle }        = useWishlistStore();
  const { addItem }                   = useCartStore();
  const [activeTab, setActiveTab]     = useState<Tab>("orders");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [orders, setOrders]           = useState<any[]>([]);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  // Fetch products for wishlist tab
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/products?per_page=48`)
      .then((r) => r.json())
      .then((json) => {
        setAllProducts((json.data?.data ?? []).map(apiProductToFrontend));
      })
      .catch(() => {});
  }, []);

  // Fetch real orders from API
  useEffect(() => {
    if (!isLoggedIn) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
    const token = localStorage.getItem("knl_token");
    fetch(`${apiBase}/orders`, {
      headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : {},
    })
      .then((r) => r.json())
      .then((json) => setOrders(json.data?.data ?? json.data ?? []))
      .catch(() => {});
  }, [isLoggedIn]);

  if (!isLoggedIn || !user) return null;

  async function handleLogout() {
    try { await authApi.logout(); } catch (_) {}
    logout();
    router.push("/");
  }

  const wishlistProducts = allProducts.filter((p) =>
    productIds.includes(p.id)
  );

  return (
    <div className="knl-container py-10 min-h-screen">
      {/* Page heading */}
      <div className="mb-8">
        <span className="section-label block mb-2">Account</span>
        <h1 className="section-title">
          Welcome back, {user.first_name}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">

        {/* ── Sidebar ─────────────────────────────────── */}
        <aside>
          <div className="bg-card border border-white/5 rounded-2xl p-5 sticky top-24">
            {/* Avatar + name */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-green-dark border border-green-mid/40 flex items-center justify-center font-utility text-lg font-bold text-green-light">
                {user.first_name[0]}{user.last_name[0]}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[11px] text-gray-mid truncate max-w-[150px]">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Nav tabs */}
            <nav className="space-y-1">
              {SIDEBAR_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    font-utility text-[13px] tracking-wide transition-all duration-200 text-left
                    ${activeTab === tab.id
                      ? "bg-green-dark/50 border border-green-mid/30 text-white"
                      : "text-gray-mid hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span className="text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-5 pt-5 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-utility text-[13px] tracking-wide text-gray-mid hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <span>🚪</span> Logout
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────── */}
        <main>

          {/* ── ORDERS TAB ─────────────────────────── */}
          {activeTab === "orders" && (
            <DashSection title="My Orders" label="Order History">
              {orders.length === 0 ? (
                <EmptyState
                  icon="📦"
                  title="No orders yet"
                  desc="When you place an order, it will appear here."
                  cta="Start Shopping"
                  href="/shop"
                />
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-card border border-white/5 rounded-2xl p-5"
                    >
                      {/* Order header */}
                      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                        <div>
                          <p className="font-utility text-[13px] font-bold text-white tracking-wider">
                            {order.order_number}
                          </p>
                          <p className="text-[11px] text-gray-mid mt-0.5">
                            Placed on {new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                          </p>
                        </div>
                        <span className={`
                          inline-flex items-center font-utility text-[10px] font-bold
                          tracking-[1.5px] uppercase px-3 py-1 rounded-full border
                          ${STATUS_STYLES[order.status] ?? STATUS_STYLES.pending}
                        `}>
                          {order.status}
                        </span>
                      </div>

                      {/* Order items */}
                      <div className="space-y-2 mb-4">
                        {(order.items ?? []).map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-[13px]">
                            <span className="text-gray-light">
                              {item.product?.name ?? item.product_name ?? `Product #${item.product_id}`} ×{item.quantity}
                            </span>
                            <span className="text-white font-medium">
                              {formatPrice(item.unit_price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Order footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-[12px] text-gray-mid">
                          Total: <span className="text-white font-bold">{formatPrice(order.grand_total)}</span>
                        </span>
                        <div className="flex gap-2">
                          {order.status === "delivered" && (
                            <button className="text-[11px] font-utility font-semibold tracking-wide text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-3 py-1.5 transition-all">
                              Leave Review
                            </button>
                          )}
                          {order.status === "pending" && (
                            <button className="text-[11px] font-utility font-semibold tracking-wide text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-3 py-1.5 transition-all">
                              Cancel Order
                            </button>
                          )}
                          <button className="text-[11px] font-utility font-semibold tracking-wide text-gray-light hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-3 py-1.5 transition-all">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashSection>
          )}

          {/* ── WISHLIST TAB ─────────────────────────── */}
          {activeTab === "wishlist" && (
            <DashSection title="Wishlist" label="Saved Items">
              {wishlistProducts.length === 0 ? (
                <EmptyState
                  icon="💝"
                  title="No saved items"
                  desc="Click the heart on any product to save it here."
                  cta="Browse Products"
                  href="/shop"
                />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-card border border-white/5 rounded-xl overflow-hidden group"
                    >
                      <Link
                        href={`/product/${product.slug}`}
                        className="block aspect-square bg-[#1a3a1f] relative"
                      >
                        <div className="absolute inset-0 flex items-center justify-center font-utility text-2xl font-bold text-green-mid/20">
                          {product.sku}
                        </div>
                      </Link>
                      <div className="p-3">
                        <p className="text-[10px] font-utility tracking-[2px] uppercase text-green-light mb-0.5">
                          {product.brand}
                        </p>
                        <p className="text-[13px] font-semibold text-white truncate">
                          {product.name}
                          {product.nickname && ` "${product.nickname}"`}
                        </p>
                        <p className="font-utility text-[15px] font-bold text-white mt-1 mb-3">
                          {formatPrice(product.price)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { addItem(product); toggle(product.id); }}
                            className="flex-1 btn-primary !py-1.5 !px-2 !text-[10px] justify-center"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggle(product.id)}
                            className="btn-ghost !py-1.5 !px-2 !text-[10px]"
                            title="Remove from wishlist"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashSection>
          )}

          {/* ── PROFILE TAB ──────────────────────────── */}
          {activeTab === "profile" && (
            <DashSection title="Profile" label="Account Details">
              <ProfileForm user={user} />
            </DashSection>
          )}

          {/* ── ADDRESS TAB ──────────────────────────── */}
          {activeTab === "address" && (
            <DashSection title="Address Book" label="Saved Addresses">
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📍</p>
                <h3 className="font-display text-xl text-white mb-2">No addresses saved</h3>
                <p className="text-[13px] text-gray-mid mb-6">
                  Add your delivery address to speed up checkout.
                </p>
                <button className="btn-primary">Add New Address</button>
              </div>
            </DashSection>
          )}

          {/* ── CHANGE PASSWORD TAB ──────────────────── */}
          {activeTab === "password" && (
            <DashSection title="Change Password" label="Security">
              <ChangePasswordForm />
            </DashSection>
          )}

        </main>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function DashSection({
  title,
  label,
  children,
}: {
  title: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-6">
        <span className="section-label block mb-1.5">{label}</span>
        <h2 className="font-display text-2xl font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState({
  icon, title, desc, cta, href,
}: {
  icon: string; title: string; desc: string; cta: string; href: string;
}) {
  return (
    <div className="text-center py-20 bg-card border border-white/5 rounded-2xl">
      <p className="text-5xl mb-4">{icon}</p>
      <h3 className="font-display text-xl text-white mb-2">{title}</h3>
      <p className="text-[13px] text-gray-mid mb-6 max-w-xs mx-auto">{desc}</p>
      <Link href={href} className="btn-primary">{cta}</Link>
    </div>
  );
}

function ProfileForm({ user }: { user: { first_name: string; last_name: string; email: string } }) {
  const [saved, setSaved] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { first_name: user.first_name, last_name: user.last_name, email: user.email },
  });

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 max-w-lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label">First Name</label>
            <input {...register("first_name")} className="form-input"/>
          </div>
          <div>
            <label className="field-label">Last Name</label>
            <input {...register("last_name")} className="form-input"/>
          </div>
        </div>
        <div>
          <label className="field-label">Email Address</label>
          <input type="email" {...register("email")} className="form-input"/>
        </div>
        <button type="submit" className="btn-primary">
          {saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </form>
      <style jsx global>{`
        .form-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; font-size:13px; color:white; outline:none; transition:border-color 0.2s; }
        .form-input:focus { border-color:#2d6a35; }
        .field-label { display:block; font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#888; margin-bottom:6px; }
      `}</style>
    </div>
  );
}

function ChangePasswordForm() {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<{
    current_password: string; new_password: string; new_password_confirmation: string;
  }>();
  const [saved, setSaved] = useState(false);
  const newPw = watch("new_password");

  async function onSubmit() {
    await new Promise((r) => setTimeout(r, 800));
    setSaved(true);
    reset();
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-card border border-white/5 rounded-2xl p-6 max-w-lg">
      {saved && (
        <div className="bg-green-dark/40 border border-green-mid/30 rounded-xl px-4 py-3 mb-5">
          <p className="text-[13px] text-green-light">✓ Password updated successfully.</p>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="field-label">Current Password</label>
          <input type="password" {...register("current_password", { required: "Required" })} className="form-input"/>
          {errors.current_password && <p className="field-error">{errors.current_password.message}</p>}
        </div>
        <div>
          <label className="field-label">New Password</label>
          <input type="password" {...register("new_password", { required: "Required", minLength: { value: 8, message: "At least 8 characters" } })} className="form-input"/>
          {errors.new_password && <p className="field-error">{errors.new_password.message}</p>}
        </div>
        <div>
          <label className="field-label">Confirm New Password</label>
          <input type="password" {...register("new_password_confirmation", { required: "Required", validate: (v: string) => v === newPw || "Passwords do not match" })} className="form-input"/>
          {errors.new_password_confirmation && <p className="field-error">{errors.new_password_confirmation.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-60">
          {isSubmitting ? "Saving…" : "Update Password"}
        </button>
      </form>
      <style jsx global>{`
        .form-input { width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:10px; padding:10px 14px; font-size:13px; color:white; outline:none; transition:border-color 0.2s; }
        .form-input:focus { border-color:#2d6a35; }
        .field-label { display:block; font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#888; margin-bottom:6px; }
        .field-error { font-size:11px; color:#f87171; margin-top:4px; }
      `}</style>
    </div>
  );
}
