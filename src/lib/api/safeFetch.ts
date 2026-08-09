// src/lib/api/safeFetch.ts
// ─────────────────────────────────────────────────────────────
// Server-side fetch helper that NEVER throws.
//
// Why? Server components fetch from the Laravel API on every
// request. If the API is briefly down (restarting, timeout,
// connection refused), a raw `fetch` rejects with
// "TypeError: fetch failed" and the whole page crashes with an
// RSC error. This helper turns every failure mode — network
// error, timeout, or non-200 response — into a `null` return
// value so pages can degrade gracefully (empty sections) instead
// of throwing.
//
// AbortSignal.timeout(8s) guarantees a hung API can't stall the
// page render forever.
// ─────────────────────────────────────────────────────────────

const REQUEST_TIMEOUT_MS = 8000;

export async function safeFetchJson<T = any>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    // Network error, DNS failure, timeout, aborted request, ...
    // Never let this crash a server component.
    return null;
  }
}
