// src/app/admin/customers/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminToolbar } from "@/components/admin/AdminForm";
import { formatPrice } from "@/data/products";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  orders_count: number;
  total_spent: number | null;
}

interface CustomerDetail extends Customer {
  addresses: {
    id: number; label: string; address_line1: string;
    city: string; province: string; is_default: boolean;
  }[];
  orders: {
    id: number; order_number: string; status: string;
    grand_total: number; created_at: string;
  }[];
}

interface PaginatedResponse {
  data: Customer[]; current_page: number; last_page: number;
  total: number; per_page: number;
}

export default function AdminCustomersPage() {
  const [res, setRes]             = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [detail, setDetail]       = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toggling, setToggling]   = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.customers.list({ search: search || undefined, page, per_page: 20 });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  async function openDetail(id: number) {
    setDetailLoading(true);
    setDetail(null);
    try {
      const r = await adminApi.customers.get(id);
      setDetail(r.data.data.customer);
    } finally { setDetailLoading(false); }
  }

  async function handleToggleActive(id: number) {
    setToggling(id);
    try {
      await adminApi.customers.toggleActive(id);
      // Update local list + detail panel instantly without a full reload
      setRes((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((c) =>
                c.id === id ? { ...c, is_active: !c.is_active } : c
              ),
            }
          : prev
      );
      if (detail?.id === id) {
        setDetail((prev) => prev ? { ...prev, is_active: !prev.is_active } : prev);
      }
    } finally { setToggling(null); }
  }

  const columns: Column<Customer>[] = [
    {
      key: "name", header: "Customer",
      render: (c) => (
        <div>
          <p className="font-semibold text-white">{c.first_name} {c.last_name}</p>
          <p className="text-[11px] text-gray-mid">{c.email}</p>
        </div>
      ),
    },
    {
      key: "phone", header: "Phone",
      render: (c) => <span className="text-gray-light">{c.phone ?? "—"}</span>,
    },
    {
      key: "orders", header: "Orders",
      render: (c) => <span className="text-gray-light">{c.orders_count}</span>,
    },
    {
      key: "spent", header: "Total Spent",
      render: (c) => (
        <span className="font-utility font-bold text-white">
          {c.total_spent ? formatPrice(c.total_spent) : "₱0"}
        </span>
      ),
    },
    {
      key: "joined", header: "Joined",
      render: (c) => (
        <span className="text-[12px] text-gray-mid">
          {new Date(c.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "status", header: "Status",
      render: (c) => <AdminBadge status={c.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions", header: "",
      render: (c) => (
        <div className="flex gap-2">
          <button
            onClick={() => openDetail(c.id)}
            className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all"
          >
            View
          </button>
          <button
            onClick={() => handleToggleActive(c.id)}
            disabled={toggling === c.id}
            className={`text-[11px] font-utility font-semibold rounded-lg px-2.5 py-1 transition-all border disabled:opacity-50 ${
              c.is_active
                ? "text-red-400 border-red-500/30 hover:border-red-500 hover:text-white"
                : "text-green-light border-green-mid/30 hover:border-green-mid hover:text-white"
            }`}
          >
            {c.is_active ? "Suspend" : "Reactivate"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description={`${res?.total ?? 0} registered customers`}
      />

      <AdminToolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search by name, email…"
      />

      <AdminTable
        columns={columns}
        rows={res?.data ?? []}
        loading={loading}
        emptyMessage="No customers found."
      />

      {res && (
        <AdminPagination
          currentPage={res.current_page} lastPage={res.last_page}
          total={res.total} perPage={res.per_page} onPageChange={setPage}
        />
      )}

      {/* Customer Detail Modal */}
      <AdminModal
        isOpen={!!detail || detailLoading}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.first_name} ${detail.last_name}` : "Loading…"}
        size="xl"
      >
        {detailLoading && (
          <div className="py-12 text-center">
            <div className="w-8 h-8 border-2 border-green-mid border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {detail && (
          <div className="space-y-6">
            {/* Profile info */}
            <div className="grid grid-cols-2 gap-4 text-[13px]">
              {[
                ["Email",    detail.email],
                ["Phone",    detail.phone ?? "—"],
                ["Joined",   new Date(detail.created_at).toLocaleDateString("en-PH", { dateStyle: "long" })],
                ["Status",   detail.is_active ? "Active" : "Suspended"],
                ["Orders",   String(detail.orders_count)],
                ["Total Spent", detail.total_spent ? formatPrice(detail.total_spent) : "₱0"],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/[0.03] rounded-xl px-4 py-3">
                  <p className="text-[10px] font-utility tracking-wide uppercase text-gray-mid mb-1">{label}</p>
                  <p className="text-white font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            {detail.orders.length > 0 && (
              <div>
                <p className="text-[11px] font-utility tracking-[2px] uppercase text-gray-mid mb-3">Recent Orders</p>
                <div className="space-y-2">
                  {detail.orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div>
                        <p className="font-utility text-[13px] font-bold text-white tracking-wider">{o.order_number}</p>
                        <p className="text-[11px] text-gray-mid">
                          {new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-utility font-bold text-white">{formatPrice(o.grand_total)}</p>
                        <AdminBadge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Addresses */}
            {detail.addresses.length > 0 && (
              <div>
                <p className="text-[11px] font-utility tracking-[2px] uppercase text-gray-mid mb-3">Saved Addresses</p>
                <div className="space-y-2">
                  {detail.addresses.map((a) => (
                    <div key={a.id} className="flex items-start justify-between bg-white/[0.03] rounded-xl px-4 py-3">
                      <div>
                        <p className="text-[13px] text-white">{a.address_line1}</p>
                        <p className="text-[11px] text-gray-mid">{a.city}, {a.province}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminBadge status={a.label.toLowerCase()} label={a.label} />
                        {a.is_default && <AdminBadge status="active" label="Default" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suspend/Reactivate from detail panel */}
            <div className="flex justify-end pt-2 border-t border-white/5">
              <button
                onClick={() => handleToggleActive(detail.id)}
                disabled={toggling === detail.id}
                className={`text-[12px] font-utility font-semibold rounded-full px-5 py-2 border transition-all disabled:opacity-50 ${
                  detail.is_active
                    ? "text-red-400 border-red-500/30 hover:border-red-500 hover:text-white"
                    : "btn-primary"
                }`}
              >
                {toggling === detail.id ? "…" : detail.is_active ? "Suspend Account" : "Reactivate Account"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
