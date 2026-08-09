// src/app/admin/orders/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Optimistic vs confirmed UI updates
//
// When an admin changes an order status, we call the API first,
// then reload the list. We DON'T update the local state before
// the API responds (no "optimistic update") because status changes
// have side effects on the server (email sent, stock restored on
// cancel) that we need to confirm succeeded before reflecting in UI.
// Optimistic updates are fine for "save name" but wrong for
// state-machine transitions with irreversible consequences.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { adminApi, downloadFile } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminToolbar, FormField, FormActions, inputCls } from "@/components/admin/AdminForm";
import { formatPrice } from "@/data/products";

// All valid order statuses and which transitions are allowed from each
const NEXT_STATUSES: Record<string, string[]> = {
  pending:    ["confirmed", "cancelled"],
  confirmed:  ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped:    ["delivered"],
  delivered:  ["returned"],
  returned:   ["refunded"],
  cancelled:  [],
  refunded:   [],
};

interface Order {
  id: number;
  order_number: string;
  status: string;
  grand_total: number;
  created_at: string;
  items_count: number;
  user: { first_name: string; last_name: string } | null;
  payment: { payment_method: string; status: string } | null;
}

interface PaginatedResponse {
  data: Order[]; current_page: number; last_page: number; total: number; per_page: number;
}

export default function AdminOrdersPage() {
  const [res, setRes]               = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [statusModal, setStatusModal] = useState<Order | null>(null);
  const [newStatus, setNewStatus]   = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating]     = useState(false);
  const [apiMsg, setApiMsg]         = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.orders.list({
        search: search || undefined,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
      });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [search, statusFilter, dateFrom, dateTo, page]);

  useEffect(() => { load(); }, [load]);

  function openStatusModal(order: Order) {
    setStatusModal(order);
    setNewStatus(NEXT_STATUSES[order.status]?.[0] ?? "");
    setTrackingNo("");
    setStatusNote("");
    setApiMsg("");
  }

  async function handleStatusUpdate() {
    if (!statusModal || !newStatus) return;
    setUpdating(true);
    setApiMsg("");
    try {
      await adminApi.orders.updateStatus(statusModal.id, newStatus, {
        tracking_number: trackingNo || undefined,
        note: statusNote || undefined,
      });
      setStatusModal(null);
      load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Update failed.");
    } finally { setUpdating(false); }
  }

  async function handleExportCsv() {
    const url = adminApi.reports.ordersCsvUrl(dateFrom, dateTo);
    await downloadFile(url, `orders-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  const columns: Column<Order>[] = [
    {
      key: "order_number", header: "Order",
      render: (o) => (
        <div>
          <p className="font-utility font-bold text-white tracking-wider">{o.order_number}</p>
          <p className="text-[11px] text-gray-mid">{new Date(o.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
      ),
    },
    {
      key: "customer", header: "Customer",
      render: (o) => (
        <span className="text-gray-light">
          {o.user ? `${o.user.first_name} ${o.user.last_name}` : "Guest"}
        </span>
      ),
    },
    {
      key: "payment", header: "Payment",
      render: (o) => (
        <div>
          <p className="text-[12px] text-gray-light capitalize">{o.payment?.payment_method?.replace("_", " ") ?? "—"}</p>
          {o.payment && <AdminBadge status={o.payment.status} />}
        </div>
      ),
    },
    {
      key: "items", header: "Items",
      render: (o) => <span className="text-gray-mid">{o.items_count}</span>,
    },
    {
      key: "total", header: "Total",
      render: (o) => <span className="font-utility font-bold text-white">{formatPrice(o.grand_total)}</span>,
    },
    {
      key: "status", header: "Status",
      render: (o) => <AdminBadge status={o.status} size="md" />,
    },
    {
      key: "actions", header: "",
      render: (o) => (
        <div className="flex gap-2">
          {NEXT_STATUSES[o.status]?.length > 0 && (
            <button
              onClick={() => openStatusModal(o)}
              className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all"
            >
              Update
            </button>
          )}
          <a
            href={adminApi.orders.invoicePdfUrl(o.id)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-utility font-semibold text-gray-mid hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-2.5 py-1 transition-all"
          >
            PDF
          </a>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description={`${res?.total ?? 0} total orders`}
        actions={
          <button onClick={handleExportCsv} className="btn-ghost !py-2 !px-4 !text-[12px]">
            ↓ Export CSV
          </button>
        }
      />

      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search order #, customer…">
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid">
          <option value="">All Statuses</option>
          {["pending","confirmed","processing","shipped","delivered","cancelled","returned","refunded"].map((s) => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                 className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid"/>
          <span className="text-gray-dark text-[12px]">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                 className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid"/>
        </div>
      </AdminToolbar>

      <AdminTable columns={columns} rows={res?.data ?? []} loading={loading} emptyMessage="No orders found." />

      {res && (
        <AdminPagination currentPage={res.current_page} lastPage={res.last_page}
                         total={res.total} perPage={res.per_page} onPageChange={setPage} />
      )}

      {/* Status Update Modal */}
      <AdminModal isOpen={!!statusModal} onClose={() => setStatusModal(null)}
                  title={`Update Order: ${statusModal?.order_number}`} size="sm">
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleStatusUpdate(); }} className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
            <span className="text-[12px] text-gray-mid">Current status:</span>
            <AdminBadge status={statusModal?.status ?? ""} />
          </div>

          <FormField label="New Status" required>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                    className={inputCls}>
              {(NEXT_STATUSES[statusModal?.status ?? ""] ?? []).map((s) => (
                <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </FormField>

          {newStatus === "shipped" && (
            <FormField label="Tracking Number" hint="Will be included in the shipping email to the customer.">
              <input value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)}
                     className={inputCls} placeholder="e.g. JRS-12345678"/>
            </FormField>
          )}

          <FormField label="Note (internal)">
            <textarea value={statusNote} onChange={(e) => setStatusNote(e.target.value)}
                      className={`${inputCls} resize-none`} rows={2}
                      placeholder="Optional note for the audit trail…"/>
          </FormField>

          <FormActions onCancel={() => setStatusModal(null)} isSubmitting={updating}
                       submitLabel={`Set to ${newStatus}`} />
        </form>
      </AdminModal>
    </div>
  );
}
