// src/app/admin/brands/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import {
  AdminPageHeader, FormField, FormActions, inputCls,
} from "@/components/admin/AdminForm";

interface Brand {
  id: number; name: string; slug: string;
  website: string | null; is_active: boolean;
  products_count: number;
}
interface PaginatedResponse {
  data: Brand[]; current_page: number; last_page: number;
  total: number; per_page: number;
}

export default function AdminBrandsPage() {
  const [res, setRes]           = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Brand | null>(null);
  const [saving, setSaving]     = useState(false);
  const [apiMsg, setApiMsg]     = useState("");

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<Record<string, unknown>>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.brands.list({ page, per_page: 20 });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    reset({ is_active: true });
    setShowModal(true);
    setApiMsg("");
  }

  function openEdit(b: Brand) {
    setEditing(b);
    reset(b as unknown as Record<string, unknown>);
    setShowModal(true);
    setApiMsg("");
  }

  async function onSave(data: Record<string, unknown>) {
    setSaving(true); setApiMsg("");
    try {
      editing
        ? await adminApi.brands.update(editing.id, data)
        : await adminApi.brands.create(data);
      setShowModal(false);
      load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Save failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete brand "${name}"? Only possible if no products are assigned.`)) return;
    try {
      await adminApi.brands.delete(id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Delete failed.");
    }
  }

  const columns: Column<Brand>[] = [
    {
      key: "name", header: "Brand",
      render: (b) => (
        <div>
          <p className="font-semibold text-white">{b.name}</p>
          <p className="text-[11px] text-gray-mid">{b.slug}</p>
        </div>
      ),
    },
    {
      key: "website", header: "Website",
      render: (b) =>
        b.website
          ? <a href={b.website} target="_blank" rel="noopener noreferrer"
               className="text-green-light hover:underline text-[12px]">
              {b.website}
            </a>
          : <span className="text-gray-dark">—</span>,
    },
    {
      key: "products", header: "Products",
      render: (b) => <span className="text-gray-light">{b.products_count}</span>,
    },
    {
      key: "status", header: "Status",
      render: (b) => <AdminBadge status={b.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions", header: "",
      render: (b) => (
        <div className="flex gap-2">
          <button
            onClick={() => openEdit(b)}
            className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(b.id, b.name)}
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
        title="Brands"
        description={`${res?.total ?? 0} brands`}
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-[12px]">
            + Add Brand
          </button>
        }
      />

      <AdminTable
        columns={columns}
        rows={res?.data ?? []}
        loading={loading}
        emptyMessage="No brands found."
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
        title={editing ? `Edit: ${editing.name}` : "Add Brand"}
        size="md"
      >
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <FormField label="Brand Name" required error={errors.name?.message as string}>
            <input
              {...register("name", { required: "Brand name is required" })}
              className={inputCls}
              placeholder="e.g. Seiko"
            />
          </FormField>

          <FormField label="Website URL" hint="Optional — include https://">
            <input
              {...register("website")}
              className={inputCls}
              placeholder="https://www.seikowatches.com"
            />
          </FormField>

          <FormField label="Description">
            <textarea
              {...register("description")}
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Brief brand description…"
            />
          </FormField>

          <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
            <input
              type="checkbox"
              {...register("is_active")}
              defaultChecked
              className="accent-green-mid"
            />
            Active (visible on the storefront)
          </label>

          <FormActions
            onCancel={() => setShowModal(false)}
            isSubmitting={saving}
            submitLabel={editing ? "Update Brand" : "Create Brand"}
          />
        </form>
      </AdminModal>
    </div>
  );
}
