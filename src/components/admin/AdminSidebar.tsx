// src/components/admin/AdminSidebar.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: usePathname for active-link highlighting
//
// usePathname() returns the current URL path (e.g. "/admin/products").
// We compare it against each nav item's href to decide which
// link gets the "active" styling — no manual state tracking needed,
// Next.js gives us the current route directly.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  superAdminOnly?: boolean;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products",   label: "Products",   icon: "⌚" },
      { href: "/admin/categories", label: "Categories", icon: "🗂️" },
      { href: "/admin/brands",     label: "Brands",     icon: "🏷️" },
      { href: "/admin/coupons",    label: "Coupons",     icon: "🎟️" },
    ],
  },
  {
    title: "Operations",
    items: [
      { href: "/admin/orders",    label: "Orders",    icon: "📦" },
      { href: "/admin/payments",  label: "Payments",  icon: "💳" },
      { href: "/admin/customers", label: "Customers", icon: "👥" },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/admin/activity-log", label: "Activity Log", icon: "📋", superAdminOnly: true },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { admin, isSuperAdmin } = useAdminStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`
      flex-shrink-0 bg-[#0e0e0e] border-r border-white/5
      flex flex-col transition-all duration-300
      ${collapsed ? "w-[68px]" : "w-[240px]"}
    `}>
      {/* Logo + collapse toggle */}
      <div className="h-[64px] flex items-center justify-between px-5 border-b border-white/5">
        {!collapsed && (
          <Link href="/admin/dashboard" className="flex flex-col leading-none">
            <span className="font-utility text-lg font-bold">
              <span className="text-green-light">KNL</span>
              <span className="text-gray-mid"> Admin</span>
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="text-gray-mid hover:text-white transition-colors p-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {collapsed
              ? <path d="M9 18l6-6-6-6"/>
              : <path d="M15 18l-6-6 6-6"/>
            }
          </svg>
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="font-utility text-[10px] tracking-[2px] uppercase text-gray-dark px-3 mb-2">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items
                .filter((item) => !item.superAdminOnly || isSuperAdmin())
                .map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                        font-utility text-[13px] tracking-wide transition-all duration-200
                        ${isActive
                          ? "bg-green-dark/40 border border-green-mid/30 text-white"
                          : "text-gray-mid hover:text-white hover:bg-white/5 border border-transparent"
                        }
                      `}
                    >
                      <span className="text-base flex-shrink-0">{item.icon}</span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin user footer */}
      {!collapsed && admin && (
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-green-dark border border-green-mid/40 flex items-center justify-center font-utility text-[12px] font-bold text-green-light flex-shrink-0">
              {admin.first_name[0]}{admin.last_name[0]}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">
                {admin.first_name} {admin.last_name}
              </p>
              <p className="text-[10px] text-gray-mid capitalize">
                {admin.role.name.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
