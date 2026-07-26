// src/app/admin/activity-log/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Read-only audit trail
//
// The activity log is intentionally read-only in the UI —
// admins can browse what happened and when, but they cannot
// edit or delete log entries. Audit trails only have value if
// they cannot be tampered with after the fact.
//
// Rows come from the activity_logs table, which is written to
// automatically by LogAdminActivity middleware (every admin
// write request) and explicitly by ActivityLog::record() calls
// inside each admin controller.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState, useEffect, useCallback } from "react";
import { adminApi } from "@/lib/api/client";
import AdminTable, { type Column } from "@/components/admin/AdminTable";
import AdminPagination             from "@/components/admin/AdminPagination";
import AdminModal                  from "@/components/admin/AdminModal";
import { AdminPageHeader, AdminToolbar } from "@/components/admin/AdminForm";

interface LogEntry {
  id: number;
  event: string;
  subject_type: string;
  subject_id: number;
  properties: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user: { first_name: string; last_name: string } | null;
}

interface PaginatedResponse {
  data: LogEntry[]; current_page: number; last_page: number;
  total: number; per_page: number;
}

// Shorten "App\Models\Product" → "Product"
function shortType(type: string): string {
  return type.split("\\").pop() ?? type;
}

// Colour per event type
const EVENT_COLOURS: Record<string, string> = {
  created:      "text-green-400",
  updated:      "text-blue-400",
  deleted:      "text-red-400",
  bulk_deleted: "text-orange-400",
};

export default function AdminActivityLogPage() {
  const [res, setRes]             = useState<PaginatedResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState("");
  const [eventFilter, setEvent]   = useState("");
  const [dateFrom, setDateFrom]   = useState("");
  const [selected, setSelected]   = useState<LogEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminApi.activityLog({
        event:        eventFilter || undefined,
        date_from:    dateFrom    || undefined,
        subject_type: search      || undefined,
        page,
        per_page: 30,
      } as Parameters<typeof adminApi.activityLog>[0]);
      setRes(r.data.data);
    } finally { setLoading(false); }
  }, [search, eventFilter, dateFrom, page]);

  useEffect(() => { load(); }, [load]);

  const columns: Column<LogEntry>[] = [
    {
      key: "when", header: "When",
      render: (l) => (
        <div>
          <p className="text-[12px] text-white">
            {new Date(l.created_at).toLocaleDateString("en-PH", {
              month: "short", day: "numeric", year: "numeric",
            })}
          </p>
          <p className="text-[11px] text-gray-mid">
            {new Date(l.created_at).toLocaleTimeString("en-PH", {
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      ),
    },
    {
      key: "who", header: "Admin",
      render: (l) => (
        <span className="text-gray-light">
          {l.user
            ? `${l.user.first_name} ${l.user.last_name}`
            : <span className="text-gray-dark italic">System</span>
          }
        </span>
      ),
    },
    {
      key: "event", header: "Event",
      render: (l) => (
        <span className={`font-utility text-[12px] font-bold uppercase tracking-wide ${EVENT_COLOURS[l.event] ?? "text-gray-mid"}`}>
          {l.event.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "subject", header: "Subject",
      render: (l) => (
        <div>
          <p className="text-[12px] text-white font-medium">{shortType(l.subject_type)}</p>
          {l.subject_id > 0 && (
            <p className="text-[11px] text-gray-mid">ID: {l.subject_id}</p>
          )}
        </div>
      ),
    },
    {
      key: "ip", header: "IP Address",
      render: (l) => (
        <span className="font-mono text-[11px] text-gray-mid">
          {l.ip_address ?? "—"}
        </span>
      ),
    },
    {
      key: "details", header: "",
      render: (l) =>
        l.properties && Object.keys(l.properties).length > 0 ? (
          <button
            onClick={() => setSelected(l)}
            className="text-[11px] font-utility font-semibold text-green-light hover:text-white border border-green-mid/30 hover:border-green-mid rounded-lg px-2.5 py-1 transition-all"
          >
            Details
          </button>
        ) : null,
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Activity Log"
        description="Audit trail of every admin write action"
      />

      {/* Filters */}
      <AdminToolbar
        search={search}
        onSearch={(v) => { setSearch(v); setPage(1); }}
        placeholder="Filter by model (e.g. Product, Order)…"
      >
        <select
          value={eventFilter}
          onChange={(e) => { setEvent(e.target.value); setPage(1); }}
          className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid"
        >
          <option value="">All Events</option>
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="deleted">Deleted</option>
          <option value="bulk_deleted">Bulk Deleted</option>
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="bg-card border border-white/10 text-[12px] text-gray-light rounded-xl px-3 py-2.5 outline-none focus:border-green-mid"
        />
      </AdminToolbar>

      <AdminTable
        columns={columns}
        rows={res?.data ?? []}
        loading={loading}
        emptyMessage="No activity log entries found."
      />

      {res && (
        <AdminPagination
          currentPage={res.current_page} lastPage={res.last_page}
          total={res.total} perPage={res.per_page} onPageChange={setPage}
        />
      )}

      {/* Detail modal — shows the before/after JSON diff */}
      <AdminModal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Log Entry Details"
        size="md"
      >
        {selected && (
          <div className="space-y-4">
            {/* Summary row */}
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              {[
                ["Event",   selected.event],
                ["Model",   shortType(selected.subject_type)],
                ["Subject ID", String(selected.subject_id)],
                ["Admin",   selected.user ? `${selected.user.first_name} ${selected.user.last_name}` : "System"],
                ["IP",      selected.ip_address ?? "—"],
                ["Time",    new Date(selected.created_at).toLocaleString("en-PH")],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/[0.03] rounded-xl px-3 py-2.5">
                  <p className="text-[10px] font-utility tracking-wide uppercase text-gray-mid mb-1">{label}</p>
                  <p className="text-white font-medium">{value}</p>
                </div>
              ))}
            </div>

            {/* Properties JSON — shown in a readable diff format */}
            {selected.properties && (
              <div>
                <p className="text-[11px] font-utility tracking-[2px] uppercase text-gray-mid mb-2">
                  Change Details
                </p>

                {selected.properties.before && selected.properties.after ? (
                  // Before / after diff view
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-utility tracking-wide uppercase text-red-400 mb-1.5">Before</p>
                      <pre className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[11px] text-gray-light overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(selected.properties.before, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] font-utility tracking-wide uppercase text-green-light mb-1.5">After</p>
                      <pre className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[11px] text-gray-light overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(selected.properties.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  // Flat properties view (e.g. created event just has the name)
                  <pre className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-[11px] text-gray-light overflow-x-auto whitespace-pre-wrap break-all">
                    {JSON.stringify(selected.properties, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
