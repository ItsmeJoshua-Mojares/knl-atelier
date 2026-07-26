// src/components/admin/AdminTable.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Generic components with TypeScript generics
//
// AdminTable<T> is a GENERIC component. The <T> lets TypeScript
// infer the shape of your row data from whatever you pass in.
// When you render <AdminTable columns={...} rows={orders} />,
// TypeScript knows the rows are Order objects and validates that
// every accessor and render function gets the right types.
//
// columns prop defines each column via:
//   key        — unique identifier
//   header     — column heading text
//   render(row)— function that returns JSX for each cell
//   sortable   — whether clicking the header sorts by this column
//
// This generic pattern lets one component power the Products,
// Orders, Customers, Coupons, and Activity Log tables without
// any of them duplicating table/checkbox/sort logic.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";

export interface Column<T> {
  key:        string;
  header:     string;
  render:     (row: T) => React.ReactNode;
  sortable?:  boolean;
  width?:     string;  // Tailwind width class, e.g. "w-32"
}

interface AdminTableProps<T extends { id: number }> {
  columns:        Column<T>[];
  rows:           T[];
  loading?:       boolean;
  /** Called with the array of selected IDs when checkboxes are used */
  onBulkAction?:  (ids: number[]) => void;
  bulkLabel?:     string;
  emptyMessage?:  string;
}

export default function AdminTable<T extends { id: number }>({
  columns,
  rows,
  loading = false,
  onBulkAction,
  bulkLabel = "Delete selected",
  emptyMessage = "No records found.",
}: AdminTableProps<T>) {
  // Set of selected row IDs for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey]         = useState<string | null>(null);
  const [sortAsc, setSortAsc]         = useState(true);

  function toggleAll() {
    if (selectedIds.size === rows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rows.map((r) => r.id)));
    }
  }

  function toggleRow(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(!sortAsc); // flip direction
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  const allChecked = rows.length > 0 && selectedIds.size === rows.length;
  const someChecked = selectedIds.size > 0 && selectedIds.size < rows.length;

  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">

      {/* Bulk action bar — appears when rows are selected */}
      {selectedIds.size > 0 && onBulkAction && (
        <div className="flex items-center gap-4 px-5 py-3 bg-green-dark/30 border-b border-green-mid/20">
          <span className="text-[13px] text-white font-semibold">
            {selectedIds.size} selected
          </span>
          <button
            onClick={() => { onBulkAction(Array.from(selectedIds)); setSelectedIds(new Set()); }}
            className="text-[12px] text-red-400 hover:text-white border border-red-500/30 hover:border-red-500 rounded-lg px-3 py-1 transition-all"
          >
            {bulkLabel}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-[12px] text-gray-mid hover:text-white transition-colors ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              {/* Select-all checkbox */}
              {onBulkAction && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="accent-green-mid w-4 h-4 cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-4 py-3 text-left
                    font-utility text-[10px] tracking-[2px] uppercase text-gray-mid
                    ${col.sortable ? "cursor-pointer hover:text-white select-none" : ""}
                    ${col.width ?? ""}
                  `}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                           stroke="currentColor" strokeWidth="2.5"
                           className={sortAsc ? "" : "rotate-180"}>
                        <polyline points="18 15 12 9 6 15"/>
                      </svg>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.04]">
                  {onBulkAction && <td className="px-4 py-3.5"><div className="skeleton h-4 w-4 rounded" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5">
                      <div className="skeleton h-4 rounded" style={{ width: `${40 + (i * 13 % 50)}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onBulkAction ? 1 : 0)}
                  className="px-4 py-16 text-center text-[13px] text-gray-mid"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-white/[0.04] last:border-0
                    hover:bg-white/[0.02] transition-colors duration-150
                    ${selectedIds.has(row.id) ? "bg-green-dark/10" : ""}
                  `}
                >
                  {onBulkAction && (
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="accent-green-mid w-4 h-4 cursor-pointer"
                        aria-label={`Select row ${row.id}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-[13px] text-gray-light">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
