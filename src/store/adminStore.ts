// src/store/adminStore.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Why a SEPARATE store from useAuthStore (Phase 3)?
//
// useAuthStore (customer-facing) and useAdminStore both hold
// "who is logged in" data, but they serve different purposes:
//
//   useAuthStore  → drives the customer header, checkout,
//                   wishlist — assumes role_id 3 (customer)
//   useAdminStore → drives the ENTIRE /admin section, needs to
//                   know the user's role to gate UI elements
//                   (e.g. only super_admin sees "Delete Brand")
//
// Keeping them separate means a developer accidentally working
// on customer auth can't break admin auth and vice versa — the
// blast radius of a bug is contained to one store.
//
// They also use SEPARATE tokens. The admin panel stores its JWT
// as 'knl_admin_token' and the customer storefront as
// 'knl_token'. Sharing one key meant logging into one side
// silently invalidated the other — every admin request would
// then be rejected by the role:admin middleware (403). Admin
// requests always send the admin token; customer requests send
// the customer token.
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAdminAuthCookie, clearAdminAuthCookie } from "@/lib/auth/cookies";

export interface AdminUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: {
    id: number;
    name: "super_admin" | "admin" | "customer";
  };
}

interface AdminStore {
  admin: AdminUser | null;
  token: string | null;
  isAdminLoggedIn: boolean;

  setAdmin: (admin: AdminUser, token: string) => void;
  logout: () => void;

  // Permission helpers — UI components call these instead of
  // checking role.name === '...' everywhere, so the actual
  // permission rules live in ONE place.
  isSuperAdmin: () => boolean;
  canManageStaff: () => boolean; // reserved for a future Roles/Permissions phase
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isAdminLoggedIn: false,

      setAdmin: (admin, token) => {
        localStorage.setItem("knl_admin_token", token);
        setAdminAuthCookie(token);
        set({ admin, token, isAdminLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem("knl_admin_token");
        clearAdminAuthCookie();
        set({ admin: null, token: null, isAdminLoggedIn: false });
      },

      isSuperAdmin: () => get().admin?.role.name === "super_admin",
      canManageStaff: () => get().admin?.role.name === "super_admin",
    }),
    {
      name: "knl-admin-auth",
      partialize: (state) => ({
        admin: state.admin,
        token: state.token,
        isAdminLoggedIn: state.isAdminLoggedIn,
      }),
    }
  )
);
