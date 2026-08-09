// src/app/admin/dashboard/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: useEffect data fetching with loading/error states
//
// This is the classic three-state pattern for any page that
// loads data from an API:
//   1. loading = true  → show skeleton
//   2. error           → show error message
//   3. data loaded     → show the real UI
//
// We fetch once on mount via useEffect with an empty dependency
// array, plus a `period` dependency so changing the date range
// dropdown re-fetches automatically.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminApi } from "@/lib/api/client";
import { formatPrice } from "@/data/products";

type Period = "today" | "7days" | "30days" | "year";

interface DashboardData {
  summary: {
    revenue: number;
    order_count: number;
    new_customers: number;
    average_order_value: number;
  };
  revenue_chart: { date: string; total: number; orders: number }[];
  order_status: Record<string, number>;
  recent_orders: {
    id: number; order_number: string; status: string;
    grand_total: number; created_at: string;
    user: { first_name: string; last_name: string } | null;
  }[];
  low_stock: { id: number; name: string; sku: string; stock_quantity: number; low_stock_threshold: number }[];
  top_products: { product_name: string; product_sku: string; units_sold: number; revenue: number }[];
  pending_payments: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-500",
  confirmed:  "bg-blue-500",
  processing: "bg-purple-500",
  shipped:    "bg-cyan-500",
  delivered:  "bg-green-500",
  cancelled:  "bg-red-500",
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<Period>("30days");
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await adminApi.dashboard(period);
        if (!cancelled) setData(res.data.data);
      } catch (err) {
        if (!cancelled) setError("Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; }; // avoid setting state after unmount
  }, [period]);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <ErrorState message={error} />;

  const maxRevenue = Math.max(...data.revenue_chart.map((d) => d.total), 1);

  return (
    <div className="space-y-6">

      {/* Period selector */}
      <div className="flex justify-end">
        <div className="flex bg-card border border-white/10 rounded-full p-1">
          {([
            { value: "today",  label: "Today" },
            { value: "7days",  label: "7 Days" },
            { value: "30days", label: "30 Days" },
            { value: "year",   label: "This Year" },
          ] as const).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`
                px-4 py-1.5 rounded-full text-[12px] font-utility font-semibold tracking-wide transition-all
                ${period === opt.value ? "bg-green-mid text-white" : "text-gray-mid hover:text-white"}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Revenue" value={formatPrice(data.summary.revenue)} icon="💰" />
        <SummaryCard label="Orders" value={String(data.summary.order_count)} icon="📦" />
        <SummaryCard label="New Customers" value={String(data.summary.new_customers)} icon="👥" />
        <SummaryCard label="Avg Order Value" value={formatPrice(data.summary.average_order_value)} icon="📈" />
      </div>

      {/* Pending payments alert */}
      {data.pending_payments > 0 && (
        <Link
          href="/admin/payments"
          className="flex items-center justify-between bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4 hover:border-yellow-500/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="text-[13px] font-semibold text-white">
                {data.pending_payments} payment{data.pending_payments !== 1 ? "s" : ""} awaiting verification
              </p>
              <p className="text-[11px] text-gray-mid">COD, MEET UP, and Chat orders — confirm when payment is received</p>
            </div>
          </div>
          <span className="text-[12px] text-yellow-400 font-utility font-semibold">Review now →</span>
        </Link>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border border-white/5 rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-5">Revenue Over Time</h3>
          {data.revenue_chart.length === 0 ? (
            <p className="text-[13px] text-gray-mid py-12 text-center">No orders in this period.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-48">
              {data.revenue_chart.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-1.5 group relative">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-9 bg-mid border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-white whitespace-nowrap z-10">
                    {formatPrice(day.total)}
                  </div>
                  <div
                    className="w-full bg-green-mid hover:bg-green-accent rounded-t transition-colors"
                    style={{ height: `${Math.max((day.total / maxRevenue) * 100, 3)}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-5">Order Status</h3>
          <div className="space-y-3">
            {Object.entries(data.order_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLORS[status] ?? "bg-gray-500"}`} />
                <span className="text-[13px] text-gray-light capitalize flex-1">{status}</span>
                <span className="text-[13px] font-semibold text-white">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent orders */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-[12px] text-green-light hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {data.recent_orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors"
              >
                <div>
                  <p className="text-[13px] font-semibold text-white">{order.order_number}</p>
                  <p className="text-[11px] text-gray-mid">
                    {order.user ? `${order.user.first_name} ${order.user.last_name}` : "Guest"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-bold text-white">{formatPrice(order.grand_total)}</p>
                  <span className={`text-[10px] capitalize px-1.5 py-0.5 rounded ${STATUS_COLORS[order.status] ?? "bg-gray-500"} bg-opacity-20`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low stock alerts */}
        <div className="bg-card border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold text-white">Low Stock Alerts</h3>
            <Link href="/admin/products?status=low_stock" className="text-[12px] text-green-light hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          {data.low_stock.length === 0 ? (
            <p className="text-[13px] text-gray-mid py-8 text-center">All products well-stocked.</p>
          ) : (
            <div className="space-y-3">
              {data.low_stock.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded transition-colors"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-white">{product.name}</p>
                    <p className="text-[11px] text-gray-mid">SKU: {product.sku}</p>
                  </div>
                  <span className="text-[12px] font-bold text-yellow-400">
                    {product.stock_quantity} left
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-5">Top Selling Products</h3>
        <table className="w-full">
          <thead>
            <tr className="text-left border-b border-white/5">
              <th className="pb-3 text-[11px] font-utility tracking-wide uppercase text-gray-mid">Product</th>
              <th className="pb-3 text-[11px] font-utility tracking-wide uppercase text-gray-mid text-right">Units Sold</th>
              <th className="pb-3 text-[11px] font-utility tracking-wide uppercase text-gray-mid text-right">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.top_products.map((p) => (
              <tr key={p.product_sku} className="border-b border-white/5 last:border-0">
                <td className="py-3">
                  <p className="text-[13px] text-white font-medium">{p.product_name}</p>
                  <p className="text-[11px] text-gray-mid">{p.product_sku}</p>
                </td>
                <td className="py-3 text-right text-[13px] text-gray-light">{p.units_sold}</td>
                <td className="py-3 text-right text-[13px] font-bold text-white">{formatPrice(p.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-utility tracking-wide uppercase text-gray-mid">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="font-utility text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center">
      <p className="text-[14px] text-red-400">{message || "Something went wrong."}</p>
    </div>
  );
}
