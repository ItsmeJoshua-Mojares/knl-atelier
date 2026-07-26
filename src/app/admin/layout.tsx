// src/app/admin/layout.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Nested layouts in Next.js App Router
//
// This layout.tsx lives at app/admin/layout.tsx, so it wraps
// EVERY page under /admin/* (dashboard, products, orders, etc.)
// without you needing to repeat the sidebar/guard logic in each
// page file. The root layout.tsx (Phase 1) still wraps THIS
// layout too — layouts nest.
//
// CONCEPT: Client-side auth guard with a loading state
//
// We can't synchronously know if the user is an admin during
// server rendering (Zustand reads from localStorage, which only
// exists in the browser). So we:
//   1. Render nothing meaningful until hydrated (checking)
//   2. Once hydrated, check isAdminLoggedIn + role
//   3. Redirect to /admin/login if the check fails
//
// This mirrors the Phase 3 dashboard guard pattern, but is now
// shared across the ENTIRE admin section via the layout instead
// of being repeated in every admin page.
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminStore } from "@/store/adminStore";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router    = useRouter();
  const { isAdminLoggedIn, admin } = useAdminStore();

  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  // The login page is the one admin route that should NOT be
  // wrapped in the sidebar/guard — it's how you GET authenticated.
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!hydrated || isLoginPage) return;

    if (!isAdminLoggedIn) {
      router.replace("/admin/login");
      return;
    }

    // Extra guard: a logged-in CUSTOMER should never see /admin/*
    // even if they somehow navigate here directly.
    const role = admin?.role.name;
    if (role !== "admin" && role !== "super_admin") {
      router.replace("/admin/login");
    }
  }, [hydrated, isAdminLoggedIn, admin, isLoginPage, router]);

  // Login page renders standalone — full-screen, no sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  // While we're checking auth, show nothing rather than a flash
  // of the dashboard (which would briefly expose admin UI/data
  // shapes to an unauthenticated visitor).
  if (!hydrated || !isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-mid border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] text-gray-mid font-utility tracking-wide uppercase">
            Verifying access…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
