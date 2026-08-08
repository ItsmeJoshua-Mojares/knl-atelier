// src/components/auth/AuthSync.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Keep the auth STORE and the auth COOKIE in sync.
//
// The header reads useAuthStore (persisted to localStorage with
// no expiry) while the /dashboard middleware only trusts the
// `knl_token` COOKIE (24h lifetime). When the cookie dies first,
// the header still shows "logged in" and clicking the name gets
// redirected back to /login — the bug this component fixes.
//
// It renders nothing; on mount it reconciles the two sources:
//   - cookie gone + store says logged in  → stale localStorage,
//     so we log out (header shows "Sign In" instead of a broken
//     dashboard link)
//   - cookie alive + store logged out     → fresh tab after login;
//     restore the session from /auth/me
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/cartStore";
import { authApi } from "@/lib/api/client";
import { hasAuthCookie, clearAuthCookie } from "@/lib/auth/cookies";

export default function AuthSync() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const setAuth = useAuthStore((s) => s.setAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const cookiePresent = hasAuthCookie();
    const token = localStorage.getItem("knl_token");

    // 1. Store says logged in but the cookie is gone (or the token
    //    was wiped) — stale session. Clear it so the header matches
    //    what the middleware would actually allow.
    if (isLoggedIn && (!cookiePresent || !token)) {
      logout();
      return;
    }

    // 2. Cookie alive but the store lost its state (e.g. fresh tab).
    //    Restore from the API; on failure, clear the dead session.
    if (cookiePresent && !isLoggedIn) {
      if (!token) {
        clearAuthCookie();
        return;
      }
      authApi
        .me()
        .then((res) => {
          const { user: freshUser } = res.data.data;
          setAuth(freshUser, token);
        })
        .catch(() => {
          logout();
        });
    }
  }, [isLoggedIn, setAuth, logout]);

  return null;
}
