// src/components/admin/AdminTopbar.tsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import { authApi } from "@/lib/api/client";

// Maps a URL segment to a human-readable page title.
// Falls back to capitalizing the segment if not listed.
const PAGE_TITLES: Record<string, string> = {
  dashboard:      "Dashboard",
  products:       "Products",
  categories:     "Categories",
  brands:         "Brands",
  coupons:        "Coupons",
  orders:         "Orders",
  payments:       "Payment Verification",
  customers:      "Customers",
  "activity-log": "Activity Log",
};

export default function AdminTopbar() {
  const router    = useRouter();
  const pathname  = usePathname();
  const { logout } = useAdminStore();

  const segment = pathname.split("/")[2] ?? "dashboard";
  const title   = PAGE_TITLES[segment] ?? segment;

  async function handleLogout() {
    try { await authApi.logout(); } catch (_) {}
    logout();
    router.push("/admin/login");
  }

  return (
    <header className="h-[64px] bg-[#0e0e0e] border-b border-white/5 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <h1 className="font-display text-xl font-semibold text-white">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Link back to the live store */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-gray-mid hover:text-white transition-colors flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          View Store
        </a>

        <div className="w-px h-5 bg-white/10" />

        <button
          onClick={handleLogout}
          className="text-[12px] text-gray-mid hover:text-red-400 transition-colors flex items-center gap-1.5"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
