// src/middleware.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Next.js Middleware
//
// middleware.ts runs on the SERVER before every request reaches
// a page. It's the right place to handle auth redirects because:
//
//   1. It runs BEFORE the page renders — no flash of content
//   2. It runs on the Edge (faster than a Node.js server)
//   3. It can redirect without the client even knowing the
//      protected page existed
//
// Compare this to the client-side approach in dashboard/page.tsx:
//   useEffect(() => { if (!isLoggedIn) router.replace('/login') })
//   → The page briefly renders before the redirect. Users with
//     slow connections see a flash of the dashboard.
//
// Middleware approach:
//   → Request for /dashboard hits middleware first
//   → Middleware checks for token in cookies
//   → If no token → redirect to /login (page never loads)
//   → If token exists → let request through to the page
//
// IMPORTANT: Middleware runs on the Edge Runtime, which means:
//   - No access to Node.js APIs (fs, path, etc.)
//   - No access to Zustand stores (those are browser-only)
//   - Can only read cookies and headers
//
// config.matcher tells Next.js WHICH routes run this middleware.
// Routes not in the matcher skip middleware entirely (faster).
// ─────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require the user to be logged in
const PROTECTED_ROUTES = [
  "/dashboard",
  "/checkout",
  "/orders",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read the JWT token from cookies
  // (We store it as a cookie in Phase 6 for better security.
  //  For now we rely on the client-side localStorage check in
  //  each page as a fallback.)
  const token = request.cookies.get("knl_token")?.value;
  const adminToken = request.cookies.get("knl_admin_token")?.value;

  // ── Protect the admin section ─────────────────────────────
  // Admin pages must only be reachable with the ADMIN account's
  // JWT (knl_admin_token). A valid customer session must never
  // unlock /admin/*.
  const isAdminRoute = pathname.startsWith("/admin");
  if (isAdminRoute && pathname !== "/admin/login" && !adminToken) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // ── Protect routes that need auth ──────────────────────────
  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    // Redirect to login, preserving the intended destination
    // so after login we can send them back: /login?redirect=/dashboard
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // All other routes — let them through
  return NextResponse.next();
}

// ── Matcher config ────────────────────────────────────────────
// Only run middleware on these paths.
// Skipping static files (_next, images, fonts) keeps it fast.
export const config = {
  matcher: [
    // Match all routes EXCEPT:
    "/((?!_next/static|_next/image|favicon.ico|images/|fonts/).*)",
  ],
};
