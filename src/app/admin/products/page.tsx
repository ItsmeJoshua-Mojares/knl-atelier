// src/app/admin/products/page.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column }  from "@/components/admin/AdminTable";
import AdminPagination              from "@/components/admin/AdminPagination";
import AdminModal                   from "@/components/admin/AdminModal";
import AdminBadge                   from "@/components/admin/AdminBadge";
import { AdminPageHeader, AdminToolbar, FormField, FormActions, inputCls } from "@/components/admin/AdminForm";
import { formatPrice }              from "@/data/products";

interface ProductImage {
  id: number; image_url: string; thumbnail_url: string | null;
  alt_text: string | null; is_primary: boolean; sort_order: number;
}

interface Product {
  id: number; name: string; sku: string;
  price: number; compare_at_price?: number; stock_quantity: number;
  is_active: boolean; is_featured: boolean; is_bestseller: boolean;
  category?: { id: number; name: string };
  brand?:    { id: number; name: string };
  category_id?: number; brand_id?: number;
  ref_number?: string; caliber_number?: string;
  short_desc?: string; description?: string;
  condition_status?: string;
  specifications?: Record<string, string> | string;
  images?: ProductImage[];
}

interface PaginatedResponse {
  data: Product[]; current_page: number; last_page: number; total: number; per_page: number;
}

interface Category { id: number; name: string; }
interface Brand    { id: number; name: string; }

export default function AdminProductsPage() {
  const [res, setRes]           = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]   = useState<Product | null>(null);
  const [saving, setSaving]     = useState(false);
  const [apiMsg, setApiMsg]     = useState("");

  // Image state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews]           = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category / Brand options
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands]         = useState<Brand[]>([]);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<Record<string, unknown>>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.products.list({ search, status: statusFilter || undefined, page, per_page: 20 });
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  // Load categories & brands for the form dropdowns
  useEffect(() => {
    adminApi.categories.list({ per_page: 100 }).then((r) => setCategories(r.data.data?.data ?? [])).catch(() => {});
    adminApi.brands.list({ per_page: 100 }).then((r) => setBrands(r.data.data?.data ?? [])).catch(() => {});
  }, []);

  function openCreate() {
    setEditing(null);
    reset({});
    setSelectedFiles([]);
    setPreviews([]);
    setExistingImages([]);
    setShowModal(true);
    setApiMsg("");
  }

  async function openEdit(p: Product) {
    setEditing(p);

    // Fetch full product details including images and specs
    let fullProduct = p;
    try {
      const r = await adminApi.products.get(p.id);
      fullProduct = r.data.data ?? p;
      setExistingImages(fullProduct.images ?? []);
    } catch { setExistingImages([]); }

    // Parse specifications if stored as JSON string
    let specs: Record<string, string> = {};
    if (fullProduct.specifications) {
      if (typeof fullProduct.specifications === "string") {
        try { specs = JSON.parse(fullProduct.specifications); } catch { specs = {}; }
      } else {
        specs = fullProduct.specifications;
      }
    }

    reset({
      name: fullProduct.name,
      sku: fullProduct.sku,
      price: fullProduct.price,
      compare_at_price: fullProduct.compare_at_price ?? "",
      stock_quantity: fullProduct.stock_quantity,
      short_desc: fullProduct.short_desc ?? "",
      description: fullProduct.description ?? "",
      ref_number: fullProduct.ref_number ?? "",
      caliber_number: fullProduct.caliber_number ?? "",
      condition_status: fullProduct.condition_status ?? "New",
      nickname: specs.nickname ?? "",
      diameter: specs.diameter ?? "",
      bezel: specs.bezel ?? "",
      movement: specs.movement ?? "",
      crystal: specs.crystal ?? "",
      inclusions: specs.inclusions ?? "",
      is_active: fullProduct.is_active,
      is_featured: fullProduct.is_featured,
      is_bestseller: fullProduct.is_bestseller,
      category_id: fullProduct.category_id ?? fullProduct.category?.id ?? "",
      brand_id: fullProduct.brand_id ?? fullProduct.brand?.id ?? "",
    });

    setShowModal(true);
    setApiMsg("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const capped = files.slice(0, 8 - existingImages.length);
    setSelectedFiles((prev) => [...prev, ...capped]);

    capped.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSave(data: Record<string, unknown>) {
    setSaving(true);
    setApiMsg("");
    try {
      // Pack watch spec fields into specifications JSON
      const specFields = ["nickname", "diameter", "bezel", "movement", "crystal", "inclusions"];
      const specs: Record<string, string> = {};
      for (const field of specFields) {
        if (data[field]) {
          specs[field] = String(data[field]);
          delete data[field];
        }
      }
      if (Object.keys(specs).length > 0) {
        data.specifications = specs;
      }

      // Convert empty strings to null for nullable fields
      for (const key of ["compare_at_price", "ref_number", "caliber_number", "description", "condition_status"]) {
        if (data[key] === "" || data[key] === undefined) delete data[key];
      }

      let productId: number;
      if (editing) {
        await adminApi.products.update(editing.id, data);
        productId = editing.id;
      } else {
        const r = await adminApi.products.create(data);
        productId = r.data.data?.product?.id ?? r.data.data?.id ?? r.data.id;
      }

      // Upload images if any selected
      if (selectedFiles.length > 0 && productId) {
        setUploadingImages(true);
        try {
          await adminApi.products.uploadImages(productId, selectedFiles, 0);
        } catch (imgErr: any) {
          setApiMsg("Product saved but image upload failed: " + (imgErr.response?.data?.message ?? imgErr.message));
          setSaving(false);
          setUploadingImages(false);
          load();
          setShowModal(false);
          return;
        }
        setUploadingImages(false);
      }

      setShowModal(false);
      load();
    } catch (err: any) {
      setApiMsg(err.response?.data?.message ?? "Save failed.");
    } finally { setSaving(false); }
  }

  async function handleDeleteImage(imageId: number) {
    if (!editing) return;
    if (!confirm("Delete this image?")) return;
    try {
      await adminApi.products.deleteImage(editing.id, imageId);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete image.");
    }
  }

  async function handleSetPrimary(imageId: number) {
    if (!editing) return;
    try {
      await adminApi.products.setPrimaryImage(editing.id, imageId);
      setExistingImages((prev) =>
        prev.map((img) => ({ ...img, is_primary: img.id === imageId }))
      );
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to set primary.");
    }
  }

  async function handleBulkDelete(ids: number[]) {
    if (!confirm(`Delete ${ids.length} product(s)? This cannot be undone.`)) return;
    await adminApi.products.bulkDelete(ids);
    load();
  }

  const columns: Column<Product>[] = [
    {
      key: "name", header: "Product",
      render: (p) => (
        <div>
          <p className="font-semibold text-white">{p.name}</p>
          <p className="text-[11px] text-gray-mid">{p.sku}</p>
        </div>
      ),
    },
    { key: "category", header: "Category", render: (p) => p.category?.name ?? "—" },
    { key: "brand",    header: "Brand",    render: (p) => p.brand?.name ?? "—" },
    {
      key: "price", header: "Price", sortable: true,
      render: (p) => <span className="font-utility font-bold text-white">{formatPrice(p.price)}</span>,
    },
    {
      key: "stock", header: "Stock", sortable: true,
      render: (p) => (
        <span className={p.stock_quantity === 0 ? "text-red-400" : p.stock_quantity <= 5 ? "text-yellow-400" : "text-white"}>
          {p.stock_quantity}
        </span>
      ),
    },
    {
      key: "status", header: "Status",
      render: (p) => <AdminBadge status={p.is_active ? "active" : "inactive"} />,
    },
    {
      key: "actions", header: "",
      render: (p) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(p)} className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all">
            Edit
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${res?.total ?? 0} total products`}
        actions={
          <button onClick={openCreate} className="btn-primary !py-2 !px-4 !text-[12px]">
            + Add Product
          </button>
        }
      />

      <AdminToolbar search={search} onSearch={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or SKU…">
        <select value={statusFilter} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={res?.data ?? []}
        loading={loading}
        onBulkAction={handleBulkDelete}
        bulkLabel="Delete selected"
        emptyMessage="No products found."
      />

      {res && (
        <AdminPagination currentPage={res.current_page} lastPage={res.last_page}
                         total={res.total} perPage={res.per_page} onPageChange={setPage} />
      )}

      {/* Create / Edit Modal */}
      <AdminModal isOpen={showModal} onClose={() => setShowModal(false)}
                  title={editing ? `Edit: ${editing.name}` : "Add New Product"} size="lg">
        {apiMsg && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 mb-4">
            <p className="text-[12px] text-red-400">{apiMsg}</p>
          </div>
        )}
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product Name" required error={errors.name?.message as string}>
              <input {...register("name", { required: "Required" })} className={inputCls} placeholder="Seiko SSK001"/>
            </FormField>
            <FormField label="SKU" required error={errors.sku?.message as string}>
              <input {...register("sku", { required: "Required" })} className={inputCls} placeholder="SSK001"/>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" error={errors.category_id?.message as string}>
              <select {...register("category_id")} className={inputCls}>
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Brand" error={errors.brand_id?.message as string}>
              <select {...register("brand_id")} className={inputCls}>
                <option value="">Select brand</option>
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price (₱)" required error={errors.price?.message as string}>
              <input type="number" step="0.01" {...register("price", { required: "Required", min: 0 })} className={inputCls} placeholder="22999"/>
            </FormField>
            <FormField label="Stock Quantity" required>
              <input type="number" {...register("stock_quantity", { required: "Required", min: 0 })} className={inputCls} placeholder="10"/>
            </FormField>
          </div>
          <FormField label="Short Description">
            <textarea {...register("short_desc")} className={`${inputCls} resize-none`} rows={2} placeholder="Brand new, 100% authentic…"/>
          </FormField>
          <FormField label="Long Description">
            <textarea {...register("description")} className={`${inputCls} resize-none`} rows={4} placeholder="Full product description…"/>
          </FormField>

          {/* ── Watch Details ───────────────────────────── */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-[12px] font-utility font-semibold text-white tracking-wide mb-3">
              Watch Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Ref. Number">
                <input {...register("ref_number")} className={inputCls} placeholder="SSK001"/>
              </FormField>
              <FormField label="Caliber Number">
                <input {...register("caliber_number")} className={inputCls} placeholder="4R34"/>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField label="Nickname">
                <input {...register("nickname")} className={inputCls} placeholder="Bruce Wayne"/>
              </FormField>
              <FormField label="Condition">
                <select {...register("condition_status")} className={inputCls}>
                  <option value="New">New</option>
                  <option value="Pre-owned">Pre-owned</option>
                  <option value="Unworn">Unworn</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField label="Diameter">
                <input {...register("diameter")} className={inputCls} placeholder="42.5mm"/>
              </FormField>
              <FormField label="Bezel">
                <input {...register("bezel")} className={inputCls} placeholder="Rotated"/>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <FormField label="Movement">
                <input {...register("movement")} className={inputCls} placeholder="Automatic"/>
              </FormField>
              <FormField label="Crystal">
                <input {...register("crystal")} className={inputCls} placeholder="Hardlex"/>
              </FormField>
            </div>
            <div className="mt-4">
              <FormField label="Inclusions (What's Included)">
                <input {...register("inclusions")} className={inputCls} placeholder="Box, manuals, & warranty card"/>
              </FormField>
            </div>
          </div>

          {/* ── Pricing ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Compare at Price (₱)">
              <input type="number" step="0.01" {...register("compare_at_price")} className={inputCls} placeholder="0"/>
            </FormField>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
              <input type="checkbox" {...register("is_active")} className="accent-green-mid"/>
              Active
            </label>
            <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
              <input type="checkbox" {...register("is_featured")} className="accent-green-mid"/>
              Featured
            </label>
            <label className="flex items-center gap-2 text-[12px] text-gray-light cursor-pointer">
              <input type="checkbox" {...register("is_bestseller")} className="accent-green-mid"/>
              Best Seller
            </label>
          </div>

          {/* ── Image Upload Section ───────────────────── */}
          <div className="border-t border-white/5 pt-4">
            <p className="text-[12px] font-utility font-semibold text-white tracking-wide mb-3">
              Product Images {existingImages.length > 0 && `(${existingImages.length})`}
            </p>

            {/* Existing images (edit mode) */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover"/>
                    {img.is_primary && (
                      <span className="absolute top-1.5 left-1.5 bg-green-mid text-[9px] font-utility font-bold text-white px-1.5 py-0.5 rounded-full">
                        PRIMARY
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.is_primary && (
                        <button type="button" onClick={() => handleSetPrimary(img.id)}
                                className="text-[10px] font-utility font-semibold text-white bg-green-mid/80 hover:bg-green-mid rounded-lg px-2 py-1">
                          Set Primary
                        </button>
                      )}
                      <button type="button" onClick={() => handleDeleteImage(img.id)}
                              className="text-[10px] font-utility font-semibold text-red-400 bg-red-500/20 hover:bg-red-500/40 rounded-lg px-2 py-1">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New file previews */}
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-square bg-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="Preview" className="w-full h-full object-cover"/>
                    <button type="button" onClick={() => removeFile(i)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File input */}
            {existingImages.length + selectedFiles.length < 8 && (
              <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-green-mid/50 rounded-xl px-4 py-6 cursor-pointer transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-mid">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <span className="text-[12px] text-gray-mid">
                  {uploadingImages ? "Uploading…" : "Click to upload (max 8 images, 5MB each)"}
                </span>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                       multiple className="hidden" onChange={handleFileChange} disabled={uploadingImages}/>
              </label>
            )}
          </div>

          <FormActions onCancel={() => setShowModal(false)} isSubmitting={saving} submitLabel={editing ? "Update Product" : "Create Product"} />
        </form>
      </AdminModal>
    </div>
  );
}
