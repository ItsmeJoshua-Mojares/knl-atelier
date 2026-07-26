// src/app/admin/products/[id]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminApi } from "@/lib/api/client";
import AdminBadge from "@/components/admin/AdminBadge";
import { formatPrice } from "@/data/products";

interface ProductImage {
  id: number; image_url: string; thumbnail_url: string | null;
  alt_text: string | null; is_primary: boolean; sort_order: number;
}

interface ProductDetail {
  id: number; name: string; sku: string; slug: string;
  ref_number: string | null; caliber_number: string | null;
  short_desc: string | null; price: number; compare_at_price: number | null;
  stock_quantity: number; low_stock_threshold: number;
  is_active: boolean; is_featured: boolean; is_bestseller: boolean;
  rating_avg: string; rating_count: number;
  category: { id: number; name: string } | null;
  brand: { id: number; name: string } | null;
  images: ProductImage[];
  inventoryLogs: {
    id: number; type: string; quantity_before: number;
    quantity_change: number; quantity_after: number;
    note: string | null; created_at: string;
  }[];
}

export default function AdminProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await adminApi.products.get(Number(params.id));
        setProduct(res.data.data.product ?? res.data.data);
      } catch {
        setError("Product not found.");
      } finally { setLoading(false); }
    }
    load();
  }, [params.id]);

  async function handleAdjustStock() {
    if (!product || !adjustQty) return;
    setAdjusting(true);
    try {
      const res = await adminApi.products.adjustStock(product.id, Number(adjustQty), adjustNote || undefined);
      setProduct(res.data.data.product);
      setAdjustQty(""); setAdjustNote("");
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed.");
    } finally { setAdjusting(false); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const maxAllowed = 8 - (product?.images.length ?? 0) - selectedFiles.length;
    const capped = files.slice(0, maxAllowed);
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

  async function handleUpload() {
    if (!product || selectedFiles.length === 0) return;
    setUploading(true);
    try {
      const res = await adminApi.products.uploadImages(product.id, selectedFiles, 0);
      const newImages = res.data.data?.images ?? [];
      setProduct((prev) => prev ? { ...prev, images: [...prev.images, ...newImages] } : prev);
      setSelectedFiles([]);
      setPreviews([]);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Upload failed.");
    } finally { setUploading(false); }
  }

  async function handleDeleteImage(imageId: number) {
    if (!product) return;
    if (!confirm("Delete this image?")) return;
    try {
      await adminApi.products.deleteImage(product.id, imageId);
      setProduct((prev) => prev ? { ...prev, images: prev.images.filter((img) => img.id !== imageId) } : prev);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to delete image.");
    }
  }

  async function handleSetPrimary(imageId: number) {
    if (!product) return;
    try {
      await adminApi.products.setPrimaryImage(product.id, imageId);
      setProduct((prev) => prev ? {
        ...prev,
        images: prev.images.map((img) => ({ ...img, is_primary: img.id === imageId })),
      } : prev);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Failed to set primary.");
    }
  }

  if (loading) return <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>;
  if (error || !product) return <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 text-center"><p className="text-red-400">{error}</p></div>;

  const isLowStock = product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.back()} className="text-[12px] text-gray-mid hover:text-white mb-2 block">
            ← Back to Products
          </button>
          <h1 className="font-display text-2xl font-bold text-white">{product.name}</h1>
          <p className="text-[12px] text-gray-mid">SKU: {product.sku}</p>
        </div>
        <div className="flex items-center gap-2">
          <AdminBadge status={product.is_active ? "active" : "inactive"} />
          {isLowStock && <AdminBadge status="low_stock" />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product info */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Category" value={product.category?.name ?? "—"} />
              <InfoField label="Brand" value={product.brand?.name ?? "—"} />
              <InfoField label="Price" value={formatPrice(product.price)} />
              <InfoField label="Compare Price" value={product.compare_at_price ? formatPrice(product.compare_at_price) : "—"} />
              <InfoField label="Reference #" value={product.ref_number ?? "—"} />
              <InfoField label="Caliber #" value={product.caliber_number ?? "—"} />
              <InfoField label="Rating" value={`${product.rating_avg} (${product.rating_count} reviews)`} />
              <InfoField label="Featured" value={product.is_featured ? "Yes" : "No"} />
            </div>
            {product.short_desc && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[11px] text-gray-mid mb-1">Description</p>
                <p className="text-[13px] text-gray-light">{product.short_desc}</p>
              </div>
            )}
          </div>

          {/* Images */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">
              Images ({product.images.length})
            </h3>

            {/* Existing images */}
            {product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mb-4">
                {product.images.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-xl bg-white/5 overflow-hidden border border-white/10">
                    <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
                    {img.is_primary && (
                      <span className="absolute top-1.5 left-1.5 bg-green-mid text-[9px] font-utility font-bold text-white px-1.5 py-0.5 rounded-full">
                        PRIMARY
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.is_primary && (
                        <button onClick={() => handleSetPrimary(img.id)}
                                className="text-[10px] font-utility font-semibold text-white bg-green-mid/80 hover:bg-green-mid rounded-lg px-2 py-1">
                          Set Primary
                        </button>
                      )}
                      <button onClick={() => handleDeleteImage(img.id)}
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
                  <div key={i} className="relative group aspect-square rounded-xl bg-white/5 overflow-hidden border border-dashed border-green-mid/30">
                    <img src={src} alt="Preview" className="w-full h-full object-cover"/>
                    <button type="button" onClick={() => removeFile(i)}
                            className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload controls */}
            <div className="flex items-center gap-3">
              {product.images.length + selectedFiles.length < 8 && (
                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-white/10 hover:border-green-mid/50 rounded-xl px-4 py-4 cursor-pointer transition-all flex-1">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-mid">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                  </svg>
                  <span className="text-[12px] text-gray-mid">Click to upload (max 8)</span>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                         multiple className="hidden" onChange={handleFileChange} disabled={uploading}/>
                </label>
              )}
              {selectedFiles.length > 0 && (
                <button onClick={handleUpload} disabled={uploading}
                        className="btn-primary !py-2.5 !px-6 !text-[12px] disabled:opacity-50 whitespace-nowrap">
                  {uploading ? "Uploading…" : `Upload ${selectedFiles.length} Image(s)`}
                </button>
              )}
            </div>
          </div>

          {/* Inventory logs */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Inventory History</h3>
            {product.inventoryLogs.length === 0 ? (
              <p className="text-[13px] text-gray-mid">No inventory changes recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-2 text-[11px] font-utility tracking-wide uppercase text-gray-mid">Date</th>
                      <th className="pb-2 text-[11px] font-utility tracking-wide uppercase text-gray-mid">Type</th>
                      <th className="pb-2 text-[11px] font-utility tracking-wide uppercase text-gray-mid text-right">Change</th>
                      <th className="pb-2 text-[11px] font-utility tracking-wide uppercase text-gray-mid text-right">After</th>
                      <th className="pb-2 text-[11px] font-utility tracking-wide uppercase text-gray-mid">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.inventoryLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 last:border-0">
                        <td className="py-2.5 text-[12px] text-gray-light">
                          {new Date(log.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                        </td>
                        <td className="py-2.5">
                          <AdminBadge status={log.type} />
                        </td>
                        <td className={`py-2.5 text-[13px] font-semibold text-right ${log.quantity_change > 0 ? "text-green-light" : "text-red-400"}`}>
                          {log.quantity_change > 0 ? "+" : ""}{log.quantity_change}
                        </td>
                        <td className="py-2.5 text-[13px] text-white text-right">{log.quantity_after}</td>
                        <td className="py-2.5 text-[11px] text-gray-mid max-w-[200px] truncate">{log.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stock */}
          <div className={`bg-card border rounded-2xl p-6 ${isLowStock ? "border-yellow-500/30" : "border-white/5"}`}>
            <h3 className="font-display text-lg font-semibold text-white mb-4">Stock</h3>
            <div className="text-center mb-4">
              <p className={`font-utility text-4xl font-bold ${isLowStock ? "text-yellow-400" : "text-white"}`}>
                {product.stock_quantity}
              </p>
              <p className="text-[12px] text-gray-mid">units in stock</p>
              <p className="text-[11px] text-gray-dark mt-1">Threshold: {product.low_stock_threshold}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-gray-mid block mb-1">Adjust by (+/-)</label>
                <input type="number" value={adjustQty} onChange={(e) => setAdjustQty(e.target.value)}
                       className="bg-white/5 border border-white/10 text-[13px] text-white rounded-xl px-3 py-2 w-full outline-none focus:border-green-mid"
                       placeholder="e.g. 10 or -5" />
              </div>
              <div>
                <label className="text-[11px] text-gray-mid block mb-1">Note</label>
                <input value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)}
                       className="bg-white/5 border border-white/10 text-[13px] text-white rounded-xl px-3 py-2 w-full outline-none focus:border-green-mid"
                       placeholder="Reason for adjustment" />
              </div>
              <button onClick={handleAdjustStock} disabled={adjusting || !adjustQty}
                      className="w-full btn-primary !py-2.5 !text-[12px] disabled:opacity-50">
                {adjusting ? "Saving…" : "Adjust Stock"}
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-card border border-white/5 rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-mid">Visibility</span>
                <span className={product.is_active ? "text-green-light" : "text-red-400"}>
                  {product.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-mid">Featured</span>
                <span className="text-white">{product.is_featured ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-gray-mid">Bestseller</span>
                <span className="text-white">{product.is_bestseller ? "Yes" : "No"}</span>
              </div>
            </div>
          </div>

          <Link href={`/admin/products`}
                className="block text-center text-[12px] text-green-light hover:text-white transition-colors">
            ← Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-gray-mid mb-0.5">{label}</p>
      <p className="text-[13px] text-white">{value}</p>
    </div>
  );
}
