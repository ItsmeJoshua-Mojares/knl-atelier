// src/app/admin/reports/page.tsx
"use client";

import { useState } from "react";
import { adminApi, downloadFile } from "@/lib/api/client";
import { AdminPageHeader, FormField, inputCls } from "@/components/admin/AdminForm";
import { formatPrice } from "@/data/products";

export default function AdminReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");

  async function handleDownload(type: string, url: string, filename: string) {
    setDownloading(type); setError("");
    try {
      await downloadFile(url, filename);
    } catch (err: any) {
      setError(err.message ?? "Download failed.");
    } finally { setDownloading(""); }
  }

  const reports = [
    {
      id: "orders-csv",
      title: "Orders Report",
      description: "Export all orders as CSV. Includes order number, status, totals, and customer info.",
      icon: "📦",
      format: "CSV",
      needsDates: true,
      getUrl: () => adminApi.reports.ordersCsvUrl(dateFrom, dateTo),
      filename: `orders-${new Date().toISOString().slice(0, 10)}.csv`,
    },
    {
      id: "products-csv",
      title: "Products Report",
      description: "Export all products with stock levels, pricing, and category info.",
      icon: "⌚",
      format: "CSV",
      needsDates: false,
      getUrl: () => adminApi.reports.productsCsvUrl(),
      filename: `products-${new Date().toISOString().slice(0, 10)}.csv`,
    },
    {
      id: "sales-excel",
      title: "Sales Report",
      description: "Detailed sales breakdown by product, exported as Excel workbook.",
      icon: "📊",
      format: "Excel",
      needsDates: true,
      getUrl: () => adminApi.reports.salesExcelUrl(dateFrom, dateTo),
      filename: `sales-${new Date().toISOString().slice(0, 10)}.xlsx`,
    },
    {
      id: "sales-pdf",
      title: "Sales Report (PDF)",
      description: "Professional PDF sales report suitable for printing or sharing.",
      icon: "📄",
      format: "PDF",
      needsDates: true,
      getUrl: () => adminApi.reports.salesPdfUrl(dateFrom, dateTo),
      filename: `sales-${new Date().toISOString().slice(0, 10)}.pdf`,
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Reports & Exports"
        description="Download business reports in various formats"
      />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-3">
          <p className="text-[13px] text-red-400">{error}</p>
        </div>
      )}

      {/* Date range filter */}
      <div className="bg-card border border-white/5 rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold text-white mb-4">Date Range</h3>
        <p className="text-[12px] text-gray-mid mb-4">
          Select a date range for reports that require it. Leave blank for all-time data.
        </p>
        <div className="flex items-center gap-4">
          <FormField label="From">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                   className={inputCls} />
          </FormField>
          <FormField label="To">
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                   className={inputCls} />
          </FormField>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div key={report.id}
               className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <span className="text-3xl">{report.icon}</span>
              <div className="flex-1">
                <h4 className="font-display text-[15px] font-semibold text-white">{report.title}</h4>
                <p className="text-[12px] text-gray-mid mt-1">{report.description}</p>
              </div>
              <span className="text-[10px] font-utility tracking-wider uppercase text-gray-dark bg-white/5 px-2 py-1 rounded">
                {report.format}
              </span>
            </div>

            {report.needsDates && (
              <p className="text-[11px] text-gray-dark mb-3">
                {!dateFrom && !dateTo ? "⚠ No date range selected — will export all data" : ""}
              </p>
            )}

            <div className="mt-auto">
              <button
                onClick={() => handleDownload(report.id, report.getUrl(), report.filename)}
                disabled={downloading === report.id}
                className="w-full btn-primary !py-2.5 !text-[12px] disabled:opacity-50"
              >
                {downloading === report.id
                  ? "Downloading…"
                  : `↓ Download ${report.format}`
                }
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
