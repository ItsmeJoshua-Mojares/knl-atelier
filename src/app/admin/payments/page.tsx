// src/app/admin/payments/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: The verification queue pattern
//
// This page IS the core of how KNL handles Philippine e-wallets.
// Since GCash/Maya don't always offer instant API callbacks for
// small merchants, the flow is:
//   1. Customer pays and enters their reference number at checkout
//   2. The reference number is stored in payments.transaction_id
//   3. Admin opens this page, sees all "pending" e-wallet payments
//   4. Admin checks their GCash/Maya app for each reference number
//   5. If found → clicks "Verify" → status becomes 'paid'
//      If not found → clicks "Reject" → customer is notified
//
// This page shows ONLY e-wallet/bank pending payments — COD
// payments are confirmed differently (on delivery, by the courier).
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminToolbar, FormField, FormActions, inputCls } from "@/components/admin/AdminForm";
import { formatPrice } from "@/data/products";

interface Payment {
  id: number;
  payment_method: string;
  status: string;
  amount: number;
  transaction_id: string | null;
  created_at: string;
  order: { id: number; order_number: string; grand_total: number } | null;
}

interface PaginatedResponse {
  data: Payment[]; current_page: number; last_page: number; total: number; per_page: number;
}

type ActionType = "verify" | "reject" | "refund";

export default function AdminPaymentsPage() {
  const [res, setRes]             = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [statusFilter, setStatus] = useState("pending");
  const [methodFilter, setMethod] = useState("");
  const [action, setAction]       = useState<{ payment: Payment; type: ActionType } | null>(null);
  const [note, setNote]           = useState("");
  const [refundAmt, setRefundAmt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [apiMsg, setApiMsg]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.payments.list({
        status: statusFilter || undefined,
        method: methodFilter || undefined,
        page,
      });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [statusFilter, methodFilter, page]);

  useEffect(() => { load(); }, [load]);

  function openAction(payment: Payment, type: ActionType) {
    setAction({ payment, type });
    setNote("");
    setRefundAmt(String(payment.amount));
    setApiMsg("");
  }

  async function handleSubmit() {
    if (!action) return;
    setSubmitting(true);
    setApiMsg("");
    try {
      if (action.type === "verify") {
        await adminApi.payments.verify(action.payment.id, note || undefined);
      } else if (action.type === "reject") {
        if (!note) { setApiMsg("A reason is required when rejecting."); setSubmitting(false); return; }
        await adminApi.payments.reject(action.payment.id, note);
      } else {
        await adminApi.payments.refund(action.payment.id, parseFloat(refundAmt), note);
      }
      setAction(null);
      load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Action failed.");
    } finally { setSubmitting(false); }
  }

  const columns: Column<Payment>[] = [
    {
      key: "order", header: "Order",
      render: (p) => (
        <div>
          <p className="font-utility font-bold text-white tracking-wider">{p.order?.order_number ?? "—"}</p>
          <p className="text-[11px] text-gray-mid">{new Date(p.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
      ),
    },
    {
      key: "method", header: "Method",
      render: (p) => (
        <span className="font-utility text-[12px] font-semibold text-white capitalize">
          {p.payment_method.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "reference", header: "Reference #",
      render: (p) => (
        <span className="font-mono text-[12px] text-gold">
          {p.transaction_id ?? <span className="text-gray-dark italic">None provided</span>}
        </span>
      ),
    },
    {
      key: "amount", header: "Amount",
      render: (p) => <span className="font-utility font-bold text-white">{formatPrice(p.amount)}</span>,
    },
    {
      key: "status", header: "Status",
      render: (p) => <AdminBadge status={p.status} size="md" />,
    },
    {
      key: "actions", header: "",
      render: (p) => (
        <div className="flex gap-2">
          {p.status === "pending" && (
            <>
              <button onClick={() => openAction(p, "verify")}
                      className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all">
                ✓ Verify
              </button>
              <button onClick={() => openAction(p, "reject")}
                      className="text-[11px] font-utility font-semibold text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-2.5 py-1 transition-all">
                ✕ Reject
              </button>
            </>
          )}
          {p.status === "paid" && (
            <button onClick={() => openAction(p, "refund")}
                    className="text-[11px] font-utility font-semibold text-gray-mid hover:text-white border border-white/10 hover:border-white/30 rounded-lg px-2.5 py-1 transition-all">
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  const modalTitles: Record<ActionType, string> = {
    verify: "Verify Payment",
    reject: "Reject Payment",
    refund: "Process Refund",
  };

  return (
    <div>
      <AdminPageHeader
        title="Payment Verification"
        description="Manually verify GCash, Maya, and bank transfer payments"
      />

      {/* Pending count alert */}
      {statusFilter === "pending" && res && res.total > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <p className="text-[13px] text-yellow-400 font-semibold">
            {res.total} payment{res.total !== 1 ? "s" : ""} awaiting verification
          </p>
        </div>
      )}

      <div className="flex gap-3 mb-5 flex-wrap">
        {["pending", "paid", "failed", "refunded", ""].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-[12px] font-utility font-semibold tracking-wide transition-all border ${
              statusFilter === s
                ? "bg-green-mid text-white border-green-mid"
                : "border-white/10 text-gray-mid hover:text-white hover:border-white/30"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}

        <select value={methodFilter} onChange={(e) => { setMethod(e.target.value); setPage(1); }}
                className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-1.5 outline-none focus:border-green-mid ml-auto">
          <option value="">All Methods</option>
          <option value="gcash">GCash</option>
          <option value="maya">Maya</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cod">COD</option>
        </select>
      </div>

      <AdminTable columns={columns} rows={res?.data ?? []} loading={loading}
                  emptyMessage="No payments found for this filter." />

      {res && (
        <AdminPagination currentPage={res.current_page} lastPage={res.last_page}
                         total={res.total} perPage={res.per_page} onPageChange={setPage} />
      )}

      {/* Action Modal */}
      <AdminModal isOpen={!!action} onClose={() => setAction(null)}
                  title={action ? modalTitles[action.type] : ""} size="sm">
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}

        {action && (
          <div className="space-y-4">
            {/* Payment summary */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-[13px]">
              <div className="flex justify-between">
                <span className="text-gray-mid">Order</span>
                <span className="text-white font-semibold">{action.payment.order?.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-mid">Method</span>
                <span className="text-white capitalize">{action.payment.payment_method.replace("_", " ")}</span>
              </div>
              {action.payment.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-mid">Reference #</span>
                  <span className="font-mono text-gold">{action.payment.transaction_id}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-mid">Amount</span>
                <span className="text-white font-bold">{formatPrice(action.payment.amount)}</span>
              </div>
            </div>

            {action.type === "refund" && (
              <FormField label="Refund Amount (₱)" required>
                <input type="number" step="0.01" value={refundAmt}
                       onChange={(e) => setRefundAmt(e.target.value)}
                       className={inputCls} max={action.payment.amount}/>
              </FormField>
            )}

            <FormField
              label={action.type === "verify" ? "Note (optional)" : "Reason (required)"}
              required={action.type !== "verify"}
            >
              <textarea value={note} onChange={(e) => setNote(e.target.value)}
                        className={`${inputCls} resize-none`} rows={2}
                        placeholder={
                          action.type === "verify"   ? "Optional admin note…" :
                          action.type === "reject"   ? "e.g. Reference number not found in GCash" :
                          "Reason for refund…"
                        }/>
            </FormField>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setAction(null)} className="btn-ghost flex-1 justify-center py-2.5 text-[13px]">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                      className={`flex-1 justify-center py-2.5 text-[13px] font-utility font-semibold rounded-full border disabled:opacity-60 transition-all ${
                        action.type === "verify" ? "bg-green-mid text-white border-green-mid hover:bg-green-accent" :
                        action.type === "reject" ? "bg-red-600/20 text-red-400 border-red-500/30 hover:border-red-500" :
                        "bg-card text-white border-white/10 hover:border-white/30"
                      }`}>
                {submitting ? "Processing…" :
                  action.type === "verify" ? "✓ Verify Payment" :
                  action.type === "reject" ? "✕ Reject Payment" : "Process Refund"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
