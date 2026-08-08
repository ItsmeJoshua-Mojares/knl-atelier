// src/lib/auth/cookies.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Shared JWT cookie helpers
//
// The Next.js middleware only checks the `knl_token` COOKIE to
// decide whether a protected route (e.g. /dashboard) is allowed.
// The auth stores (customer + admin) save the same token to
// localStorage so axios can attach it as a Bearer header.
//
// These helpers keep those two sources of truth in sync. The
// Secure flag is added ONLY over HTTPS — over plain HTTP
// (localhost dev, 127.0.0.1, LAN IP) Secure cookies are dropped
// by the browser, which silently breaks the middleware check.
// ─────────────────────────────────────────────────────────────

const COOKIE_NAME = "knl_token";

function cookieFlags() {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `path=/; max-age=86400${secure}; SameSite=Lax`;
}

export function setAuthCookie(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; ${cookieFlags()}`;
}

export function clearAuthCookie() {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
}

export function hasAuthCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}
