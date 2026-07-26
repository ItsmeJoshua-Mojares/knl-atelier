// src/app/admin/orders/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api/client";
import AdminBadge from "@/components/admin/AdminBadge";
import { formatPrice } from "@/data/products";

interface OrderDetail {
  id: number; order_number: string; status: string;
  subtotal: number; discount_amount: number; shipping_fee: number;
  tax_amount: number; grand_total: number;
  ship_first_name: string; ship_last_name: string; ship_phone: string;
  ship_address_line1: string; ship_address_line2: string | null;
  ship_city: string; ship_province: string; ship_postal_code: string;
  coupon_code: string | null; customer_notes: string | null;
  created_at: string; shipped_at: string | null; delivered_at: string | null;
  user: { id: number; first_name: string; last_name: string; email: string } | null;
  items: {
    id: number; product_name: string; product_sku: string;
    unit_price: number; quantity: number; total_price: number;
    product_image: string | null;
  }[];
  payment: { payment_method: string; status: string; amount: number; reference_number: string | null } | null;
  statusHistory: { status: string; note: string | null; created_at: string }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500", confirmed: "bg-blue-500", processing: "bg-purple-500",
  shipped: "bg-cyan-500", delivered: "bg-green-500", cancelled: "bg-red-500",
  returned: "bg-orange-500", refunded: "bg-gray-500",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.orders.get(Number(params.id));
        setOrder(res.data.data.order ?? res.data.data);
      } catch {
        setError("Order not found.");
      } finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (error || !order) return <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"><p className="text-red-400">{error}</p></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-[12px] text-gray-mid hover:text-white mb-2 block">
            ← Back to Orders
          </button>
          <h1 className="font-display text-2xl font-bold text-white">{order.order_number}</h1>
          <p className="text-[12px] text-gray-mid">
            Placed {new Date(order.created_at).toLocaleString("en-PH")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AdminBadge status={order.status} size="md" />
          <a href={adminApi.orders.invoicePdfUrl(order.id)} target="_blank" rel="noopener noreferrer"
             className="text-[12px] font-utility font-semibold text-gray-mid hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-3 py-2 transition-all">
            ↓ PDF Invoice
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-[11px] text-gray-mid">
                    {item.product_image ? (
                      <img src={item.product_image} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{item.product_name}</p>
                    <p className="text-[11px] text-gray-mid">SKU: {item.product_sku} × {item.quantity}</p>
                  </div>
                  <p className="text-[13px] font-bold text-white">{formatPrice(item.total_price)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-light">Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-green-light">Discount ({order.coupon_code})</span>
                  <span className="text-green-light">-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-light">Shipping</span>
                <span className="text-white">{order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : "FREE"}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-light">VAT (12%)</span>
                <span className="text-white">{formatPrice(order.tax_amount)}</span>
              </div>
              <div className="flex justify-between text-[15px] font-bold pt-2 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-white">{formatPrice(order.grand_total)}</span>
              </div>
            </div>
          </div>

          {/* Status history */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLORS[h.status] ?? "bg-gray-500"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-white capitalize">{h.status}</span>
                      <span className="text-[11px] text-gray-mid">
                        {new Date(h.created_at).toLocaleString("en-PH")}
                      </span>
                    </div>
                    {h.note && <p className="text-[12px] text-gray-mid mt-0.5">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Customer</h3>
            {order.user ? (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-white">{order.user.first_name} {order.user.last_name}</p>
                <p className="text-[12px] text-gray-mid">{order.user.email}</p>
                <Link href={`/admin/customers/${order.user.id}`}
                      className="text-[12px] text-green-light hover:text-white block mt-2">
                  View customer →
                </Link>
              </div>
            ) : (
              <p className="text-[13px] text-gray-mid">Guest checkout</p>
            )}
          </div>

          {/* Shipping */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Shipping Address</h3>
            <div className="text-[13px] text-gray-light leading-relaxed">
              <p>{order.ship_first_name} {order.ship_last_name}</p>
              <p>{order.ship_address_line1}</p>
              {order.ship_address_line2 && <p>{order.ship_address_line2}</p>}
              <p>{order.ship_city}, {order.ship_province} {order.ship_postal_code}</p>
              <p className="mt-2">{order.ship_phone}</p>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Payment</h3>
            {order.payment ? (
              <div className="space-y-2">
                <p className="text-[13px] text-white capitalize">{order.payment.payment_method.replace("_", " ")}</p>
                <AdminBadge status={order.payment.status} />
                {order.payment.reference_number && (
                  <p className="text-[12px] text-gray-mid mt-1">Ref: {order.payment.reference_number}</p>
                )}
                <p className="text-[13px] font-bold text-white mt-2">{formatPrice(order.payment.amount)}</p>
              </div>
            ) : (
              <p className="text-[13px] text-gray-mid">No payment recorded</p>
            )}
          </div>

          {order.customer_notes && (
            <div className="bg-card border border-white/5 rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-white mb-2">Customer Notes</h3>
              <p className="text-[13px] text-gray-light">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
