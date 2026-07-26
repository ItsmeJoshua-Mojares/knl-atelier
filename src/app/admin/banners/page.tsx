// src/app/admin/banners/page.tsx
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

interface Banner {
  id: number; title: string; subtitle: string | null;
  image_url: string; link_url: string | null;
  position: "hero" | "sidebar" | "promo";
  sort_order: number; is_active: boolean;
  starts_at: string | null; ends_at: string | null;
}
interface PaginatedResponse {
  data: Banner[]; current_page: number; last_page: number; total: number; per_page: number;
}

export default function AdminBannersPage() {
  const [res, setRes]             = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Banner | null>(null);
  const [saving, setSaving]       = useState(false);
  const [apiMsg, setApiMsg]       = useState("");

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<Record<string, unknown>>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.banners.list({ page, per_page: 20 });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditing(null);
    reset({ position: "hero", sort_order: 0, is_active: true });
    setShowModal(true); setApiMsg("");
  }

  function openEdit(b: Banner) {
    setEditing(b);
    reset(b as unknown as Record<string, unknown>);
    setShowModal(true); setApiMsg("");
  }

  async function onSave(data: Record<string, unknown>) {
    setSaving(true); setApiMsg("");
    try {
      editing
        ? await adminApi.banners.update(editing.id, data)
        : await adminApi.banners.create(data);
      setShowModal(false); load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Save failed.");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number, title: string) {
    if (!confirm(`Delete banner "${title}"?`)) return;
    try { await adminApi.banners.delete(id); load(); }
    catch (err: any) { alert(err.response?.data?.message ?? "Delete failed."); }
  }

  const filtered = (res?.data ?? []).filter((b) =>
    !search || b.title.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Banner>[] = [
    {
      key: "title", header: "Banner",
      render: (b) => (
        <div>
          <p className="text-[13px] font-semibold text-white">{b.title}</p>
          {b.subtitle && <p className="text-[11px] text-gray-mid truncate max-w-[200px]">{b.subtitle}</p>}
        </div>
      ),
    },
    {
      key: "position", header: "Position",
      render: (b) => <AdminBadge status={b.position} />,
    },
    {
      key: "sort", header: "Order",
      render: (b) => <span className="text-gray-light">{b.sort_order}</span>,
    },
    {
      key: "status", header: "Status",
      render: (b) => <AdminBadge status={b.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions", header: "",
      render: (b) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(b)}
                  className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all">
            Edit
          </button>
          <button onClick={() => handleDelete(b.id, b.title)}
                  className="text-[11px] font-utility font-semibold text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-2.5 py-1 transition-all">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Banners"
        description={`${res?.total ?? 0} banners`}
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-[12px]">
            + Add Banner
          </button>
        }
      />

      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search banners…" />

      <AdminTable columns={columns} rows={filtered} loading={loading} emptyMessage="No banners found." />

      {res && (
        <AdminPagination currentPage={res.current_page} lastPage={res.last_page}
                         total={res.total} perPage={res.per_page} onPageChange={setPage} />
      )}

      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)}
                  title={editing ? `Edit: ${editing.title}` : "Create Banner"} size="lg">
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <FormField label="Title" required error={errors.title?.message as string}>
            <input {...register("title", { required: "Title is required" })} className={inputCls} />
          </FormField>
          <FormField label="Subtitle">
            <input {...register("subtitle")} className={inputCls} />
          </FormField>
          <FormField label="Image URL" required error={errors.image_url?.message as string}>
            <input {...register("image_url", { required: "Image URL is required" })}
                   className={inputCls} placeholder="https://..." />
          </FormField>
          <FormField label="Link URL">
            <input {...register("link_url")} className={inputCls} placeholder="https://..." />
          </FormField>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Position" required>
              <select {...register("position")} className={inputCls}>
                <option value="hero">Hero</option>
                <option value="sidebar">Sidebar</option>
                <option value="promo">Promo</option>
              </select>
            </FormField>
            <FormField label="Sort Order">
              <input type="number" {...register("sort_order")} className={inputCls} />
            </FormField>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
                <input type="checkbox" {...register("is_active")} defaultChecked className="accent-green-mid" />
                Active
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Starts At">
              <input type="datetime-local" {...register("starts_at")} className={inputCls} />
            </FormField>
            <FormField label="Ends At">
              <input type="datetime-local" {...register("ends_at")} className={inputCls} />
            </FormField>
          </div>
          <FormActions onCancel={() => setShowModal(false)} isSubmitting={saving}
                       submitLabel={editing ? "Update Banner" : "Create Banner"} />
        </form>
      </AdminModal>
    </div>
  );
}
