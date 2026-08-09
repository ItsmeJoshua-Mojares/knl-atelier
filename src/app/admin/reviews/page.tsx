// src/app/admin/reviews/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import {
  AdminPageHeader, AdminToolbar, FormField, FormActions, inputCls,
} from "@/components/admin/AdminForm";

interface Review {
  id: number; rating: number; title: string | null; body: string;
  is_approved: boolean; admin_reply: string | null;
  product: { id: number; name: string; sku: string } | null;
  user: { first_name: string; last_name: string; email: string } | null;
  created_at: string;
}
interface PaginatedResponse {
  data: Review[]; current_page: number; last_page: number; total: number; per_page: number;
}

export default function AdminReviewsPage() {
  const [res, setRes]             = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("");
  const [replyModal, setReplyModal] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving]       = useState(false);
  const [apiMsg, setApiMsg]       = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.reviews.list({
        status: statusFilter || undefined,
        search: search || undefined,
        page,
      });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: number) {
    try { await adminApi.reviews.approve(id); load(); }
    catch (err: any) { alert(err.response?.data?.message ?? "Failed."); }
  }

  async function handleReject(id: number) {
    try { await adminApi.reviews.reject(id); load(); }
    catch (err: any) { alert(err.response?.data?.message ?? "Failed."); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this review?")) return;
    try { await adminApi.reviews.delete(id); load(); }
    catch (err: any) { alert(err.response?.data?.message ?? "Failed."); }
  }

  async function handleReply() {
    if (!replyModal || !replyText.trim()) return;
    setSaving(true); setApiMsg("");
    try {
      await adminApi.reviews.reply(replyModal.id, replyText);
      setReplyModal(null);
      load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Failed.");
    } finally { setSaving(false); }
  }

  const columns: Column<Review>[] = [
    {
      key: "product", header: "Product",
      render: (r) => (
        <div>
          <p className="text-[13px] font-semibold text-white">{r.product?.name ?? "—"}</p>
          <p className="text-[11px] text-gray-mid">{r.product?.sku}</p>
        </div>
      ),
    },
    {
      key: "user", header: "Customer",
      render: (r) => (
        <span className="text-gray-light">
          {r.user ? `${r.user.first_name} ${r.user.last_name}` : "—"}
        </span>
      ),
    },
    {
      key: "rating", header: "Rating",
      render: (r) => (
        <span className="text-yellow-400 font-semibold">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
      ),
    },
    {
      key: "review", header: "Review",
      render: (r) => (
        <div className="max-w-xs">
          {r.title && <p className="text-[12px] font-semibold text-white truncate">{r.title}</p>}
          <p className="text-[11px] text-gray-mid truncate">{r.body}</p>
        </div>
      ),
    },
    {
      key: "status", header: "Status",
      render: (r) => <AdminBadge status={r.is_approved ? "approved" : "pending"} />,
    },
    {
      key: "reply", header: "Reply",
      render: (r) => r.admin_reply
        ? <span className="text-[11px] text-green-light">Replied</span>
        : <button onClick={() => { setReplyModal(r); setReplyText(""); setApiMsg(""); }}
                  className="text-[11px] text-gray-mid hover:text-white">Reply</button>,
    },
    {
      key: "actions", header: "",
      render: (r) => (
        <div className="flex gap-2">
          {!r.is_approved && (
            <button onClick={() => handleApprove(r.id)}
                    className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all">
              Approve
            </button>
          )}
          {r.is_approved && (
            <button onClick={() => handleReject(r.id)}
                    className="text-[11px] font-utility font-semibold text-yellow-400 hover:text-white border border-yellow-500/30 hover:border-yellow-500 rounded-lg px-2.5 py-1 transition-all">
              Reject
            </button>
          )}
          <button onClick={() => handleDelete(r.id)}
                  className="text-[11px] font-utility font-semibold text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-2.5 py-1 transition-all">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Reviews" description={`${res?.total ?? 0} reviews`} />

      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search reviews…">
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </AdminToolbar>

      <AdminTable columns={columns} rows={res?.data ?? []} loading={loading} emptyMessage="No reviews found." />

      {res && (
        <AdminPagination currentPage={res.current_page} lastPage={res.last_page}
                         total={res.total} perPage={res.per_page} onPageChange={setPage} />
      )}

      <AdminModal isOpen={!!replyModal} onClose={() => setReplyModal(null)}
                  title={`Reply to ${replyModal?.user?.first_name ?? "review"}`} size="sm">
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleReply(); }} className="space-y-4">
          <div className="p-3 bg-white/[0.03] rounded-xl">
            <p className="text-[12px] text-gray-mid">Original review:</p>
            <p className="text-[13px] text-white mt-1">{replyModal?.body}</p>
          </div>
          <FormField label="Your Reply" required>
            <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                      className={`${inputCls} resize-none`} rows={3}
                      placeholder="Write your reply…" />
          </FormField>
          <FormActions onCancel={() => setReplyModal(null)} isSubmitting={saving}
                       submitLabel="Save Reply" />
        </form>
      </AdminModal>
    </div>
  );
}
