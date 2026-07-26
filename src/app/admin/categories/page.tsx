// src/app/admin/categories/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import AdminBadge                  from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminToolbar, FormField, FormActions, inputCls } from "@/components/admin/AdminForm";

interface Category {
  id: number; name: string; slug: string;
  products_count: number; is_active: boolean; sort_order: number;
  parent?: { name: string } | null;
}
interface PaginatedResponse {
  data: Category[]; current_page: number; last_page: number; total: number; per_page: number;
}

export default function AdminCategoriesPage() {
  const [res, setRes]           = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Category | null>(null);
  const [saving, setSaving]     = useState(false);
  const [apiMsg, setApiMsg]     = useState("");
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Record<string, unknown>>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.categories.list({ page, per_page: 20 });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() { setEditing(null); reset({ is_active: true, sort_order: 0 }); setShowModal(true); setApiMsg(""); }
  function openEdit(c: Category) { setEditing(c); reset(c as unknown as Record<string, unknown>); setShowModal(true); setApiMsg(""); }

  async function onSave(data: Record<string, unknown>) {
    setSaving(true); setApiMsg("");
    try {
      editing
        ? await adminApi.categories.update(editing.id, data)
        : await adminApi.categories.create(data);
      setShowModal(false); load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Save failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? Only possible if no products are assigned.`)) return;
    try {
      await adminApi.categories.delete(id);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Delete failed.");
    }
  }

  const columns: Column<Category>[] = [
    {
      key: "name", header: "Category",
      render: (c) => (
        <div>
          <p className="font-semibold text-white">{c.name}</p>
          <p className="text-[11px] text-gray-mid">{c.slug}</p>
        </div>
      ),
    },
    { key: "parent", header: "Parent", render: (c) => c.parent?.name ?? <span className="text-gray-dark">—</span> },
    { key: "products", header: "Products", render: (c) => <span className="text-gray-light">{c.products_count}</span> },
    { key: "sort", header: "Sort", render: (c) => <span className="text-gray-mid">{c.sort_order}</span> },
    { key: "status", header: "Status", render: (c) => <AdminBadge status={c.is_active ? "active" : "inactive"} /> },
    {
      key: "actions", header: "",
      render: (c) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(c)} className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all">Edit</button>
          <button onClick={() => handleDelete(c.id, c.name)} className="text-[11px] font-utility font-semibold text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-2.5 py-1 transition-all">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description={`${res?.total ?? 0} categories`}
        actions={<button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-[12px]">+ Add Category</button>}
      />

      <AdminTable columns={columns} rows={res?.data ?? []} loading={loading} emptyMessage="No categories found." />

      {res && <AdminPagination currentPage={res.current_page} lastPage={res.last_page} total={res.total} perPage={res.per_page} onPageChange={setPage} />}

      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? `Edit: ${editing.name}` : "Add Category"} size="md">
        {apiMsg && <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4"><p className="text-[12px] text-red-400">{apiMsg}</p></div>}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <FormField label="Category Name" required error={errors.name?.message as string}>
            <input {...register("name", { required: "Required" })} className={inputCls} placeholder="Watches"/>
          </FormField>
          <FormField label="Description">
            <textarea {...register("description")} className={`${inputCls} resize-none`} rows={2} placeholder="Brief description…"/>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Sort Order" hint="Lower = appears first">
              <input type="number" {...register("sort_order", { min: 0 })} className={inputCls} placeholder="0"/>
            </FormField>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
                <input type="checkbox" {...register("is_active")} defaultChecked className="accent-green-mid"/>
                Active
              </label>
            </div>
          </div>
          <FormActions onCancel={() => setShowModal(false)} isSubmitting={saving} submitLabel={editing ? "Update" : "Create"} />
        </form>
      </AdminModal>
    </div>
  );
}
