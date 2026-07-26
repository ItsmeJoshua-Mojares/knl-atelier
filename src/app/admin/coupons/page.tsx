// src/app/admin/coupons/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import {
  AdminPageHeader, AdminToolbar, FormField, FormActions, inputCls,
} from "@/components/admin/AdminForm";
import { formatPrice } from "@/data/products";

interface Coupon {
  id: number; code: string; description: string | null;
  type: "percentage" | "fixed" | "free_shipping";
  value: number; min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null; used_count: number;
  is_active: boolean; expires_at: string | null;
}
interface PaginatedResponse {
  data: Coupon[]; current_page: number; last_page: number;
  total: number; per_page: number;
}

export default function AdminCouponsPage() {
  const [res, setRes]           = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Coupon | null>(null);
  const [saving, setSaving]     = useState(false);
  const [apiMsg, setApiMsg]     = useState("");
  const [watchType, setWatchType] = useState<string>("percentage");

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<Record<string, unknown>>();

  const typeValue = watch("type") as string;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.coupons.list({ page, per_page: 20 });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setWatchType(typeValue ?? "percentage"); }, [typeValue]);

  function openCreate() {
    setEditing(null);
    reset({ type: "percentage", value: 10, is_active: true, min_order_amount: 0 });
    setShowModal(true);
    setApiMsg("");
  }

  function openEdit(c: Coupon) {
    setEditing(c);
    reset(c as unknown as Record<string, unknown>);
    setShowModal(true);
    setApiMsg("");
  }

  async function onSave(data: Record<string, unknown>) {
    setSaving(true); setApiMsg("");
    try {
      editing
        ? await adminApi.coupons.update(editing.id, data)
        : await adminApi.coupons.create(data);
      setShowModal(false);
      load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Save failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number, code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try { await adminApi.coupons.delete(id); load(); }
    catch (err: any) { alert(err.response?.data?.message ?? "Delete failed."); }
  }

  // Format the value column based on coupon type
  function formatValue(c: Coupon): string {
    if (c.type === "percentage")    return `${c.value}% off`;
    if (c.type === "fixed")         return `${formatPrice(c.value)} off`;
    if (c.type === "free_shipping") return "Free shipping";
    return String(c.value);
  }

  const columns: Column<Coupon>[] = [
    {
      key: "code", header: "Code",
      render: (c) => (
        <div>
          <p className="font-mono font-bold text-white tracking-wider">{c.code}</p>
          {c.description && <p className="text-[11px] text-gray-mid">{c.description}</p>}
        </div>
      ),
    },
    {
      key: "type", header: "Type",
      render: (c) => <AdminBadge status={c.type} />,
    },
    {
      key: "value", header: "Discount",
      render: (c) => <span className="font-semibold text-white">{formatValue(c)}</span>,
    },
    {
      key: "min_order", header: "Min Order",
      render: (c) => (
        <span className="text-gray-light">
          {c.min_order_amount > 0 ? formatPrice(c.min_order_amount) : "—"}
        </span>
      ),
    },
    {
      key: "usage", header: "Usage",
      render: (c) => (
        <span className="text-gray-light">
          {c.used_count}
          {c.usage_limit ? ` / ${c.usage_limit}` : ""}
        </span>
      ),
    },
    {
      key: "expires", header: "Expires",
      render: (c) =>
        c.expires_at
          ? <span className="text-[12px] text-gray-light">
              {new Date(c.expires_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          : <span className="text-gray-dark">Never</span>,
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
            onClick={() => openEdit(c)}
            className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(c.id, c.code)}
            className="text-[11px] font-utility font-semibold text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-2.5 py-1 transition-all"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description={`${res?.total ?? 0} coupons`}
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-[12px]">
            + Add Coupon
          </button>
        }
      />

      <AdminToolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        placeholder="Search coupon code…"
      />

      <AdminTable
        columns={columns}
        rows={(res?.data ?? []).filter((c) =>
          !search || c.code.toLowerCase().includes(search.toLowerCase())
        )}
        loading={loading}
        emptyMessage="No coupons found."
      />

      {res && (
        <AdminPagination
          currentPage={res.current_page} lastPage={res.last_page}
          total={res.total} perPage={res.per_page} onPageChange={setPage}
        />
      )}

      {/* Create / Edit Modal */}
      <AdminModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `Edit: ${editing.code}` : "Create Coupon"}
        size="lg"
      >
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Coupon Code" required error={errors.code?.message as string}>
              <input
                {...register("code", { required: "Code is required" })}
                className={`${inputCls} uppercase`}
                placeholder="WELCOME10"
                style={{ textTransform: "uppercase" }}
              />
            </FormField>
            <FormField label="Type" required>
              <select {...register("type")} className={inputCls}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₱)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </FormField>
          </div>

          {watchType !== "free_shipping" && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={watchType === "percentage" ? "Discount (%)" : "Discount Amount (₱)"}
                required
                error={errors.value?.message as string}
              >
                <input
                  type="number"
                  step="0.01"
                  {...register("value", { required: "Value is required", min: 0 })}
                  className={inputCls}
                  placeholder={watchType === "percentage" ? "10" : "500"}
                />
              </FormField>
              <FormField
                label="Max Discount Cap (₱)"
                hint={watchType === "percentage" ? "Leave blank for no cap" : undefined}
              >
                <input
                  type="number"
                  step="0.01"
                  {...register("max_discount_amount")}
                  className={inputCls}
                  placeholder="5000"
                />
              </FormField>
            </div>
          )}

          <FormField label="Description">
            <input
              {...register("description")}
              className={inputCls}
              placeholder="10% off your first order"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Min Order Amount (₱)" hint="0 = no minimum">
              <input
                type="number"
                step="0.01"
                {...register("min_order_amount")}
                className={inputCls}
                placeholder="0"
              />
            </FormField>
            <FormField label="Usage Limit" hint="Blank = unlimited">
              <input
                type="number"
                {...register("usage_limit")}
                className={inputCls}
                placeholder="100"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Valid From">
              <input type="datetime-local" {...register("starts_at")} className={inputCls} />
            </FormField>
            <FormField label="Expires At">
              <input type="datetime-local" {...register("expires_at")} className={inputCls} />
            </FormField>
          </div>

          <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
            <input
              type="checkbox"
              {...register("is_active")}
              defaultChecked
              className="accent-green-mid"
            />
            Active (usable at checkout)
          </label>

          <FormActions
            onCancel={() => setShowModal(false)}
            isSubmitting={saving}
            submitLabel={editing ? "Update Coupon" : "Create Coupon"}
          />
        </form>
      </AdminModal>
    </div>
  );
}
