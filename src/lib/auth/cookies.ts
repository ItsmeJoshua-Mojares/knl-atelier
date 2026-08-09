// src/lib/auth/cookies.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Separate JWT cookies for admin vs customer auth
//
// The admin panel and the customer storefront run in the SAME
// browser but use different accounts. They must therefore use
// different JWT storage keys — otherwise logging into one side
// overwrites the token the other side sends to the API.
//
//   knl_token       → customer storefront JWT
//   knl_admin_token → admin panel JWT
//
// The Next.js middleware checks these COOKIES to decide whether
// a protected route is allowed. The auth stores save the same
// tokens to localStorage so axios can attach them as Bearer
// headers. These helpers keep those two sources of truth in sync.
//
// The Secure flag is added ONLY over HTTPS — over plain HTTP
// (localhost dev, 127.0.0.1, LAN IP) Secure cookies are dropped
// by the browser, which silently breaks the middleware check.
// ─────────────────────────────────────────────────────────────

export const CUSTOMER_COOKIE = "knl_token";
export const ADMIN_COOKIE = "knl_admin_token";

function cookieFlags() {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `path=/; max-age=86400${secure}; SameSite=Lax`;
}

function writeCookie(name: string, token: string) {
  document.cookie = `${name}=${token}; ${cookieFlags()}`;
}

function clearCookie(name: string) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
}

function hasCookie(name: string) {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim().startsWith(`${name}=`));
}

// ── Customer storefront ──────────────────────────────────────
export function setAuthCookie(token: string) {
  writeCookie(CUSTOMER_COOKIE, token);
}

export function clearAuthCookie() {
  clearCookie(CUSTOMER_COOKIE);
}

export function hasAuthCookie() {
  return hasCookie(CUSTOMER_COOKIE);
}

// ── Admin panel ──────────────────────────────────────────────
export function setAdminAuthCookie(token: string) {
  writeCookie(ADMIN_COOKIE, token);
}

export function clearAdminAuthCookie() {
  clearCookie(ADMIN_COOKIE);
}

export function hasAdminAuthCookie() {
  return hasCookie(ADMIN_COOKIE);
}
