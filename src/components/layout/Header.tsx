// src/components/layout/Header.tsx  (UPDATED — Phase 3 version)
// Changes from Phase 1:
//   - Live cart count badge from useCartStore
//   - Live wishlist count from useWishlistStore
//   - Auth-aware nav (Dashboard when logged in, Sign In when not)
//   - Hydration guard to prevent SSR/client mismatch

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore, useWishlistStore, useAuthStore } from "@/store/cartStore";

const NAV_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/shop",    label: "Shop" },
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq",     label: "FAQ" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [hydrated,   setHydrated]   = useState(false);

  const cartCount     = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.productIds.length);
  const { isLoggedIn, user } = useAuthStore();

  // Hydration guard — runs only after client mount
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 border-b border-white/5 transition-all duration-300
        ${isScrolled ? "bg-black/96 shadow-[0_2px_30px_rgba(0,0,0,0.6)]" : "bg-black/80 backdrop-blur-md"}
      `}>
        <div className="knl-container">
          <div className="flex items-center justify-between h-[68px]">

            <Link href="/" className="flex flex-col leading-none">
              <span className="font-utility text-2xl font-bold tracking-tight">
                <span className="text-green-light">KNL</span>
              </span>
              <span className="font-body text-[9px] tracking-[3.5px] uppercase text-gold mt-0.5">
                Atelier &amp; Co.
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className={`font-utility text-[13px] font-semibold tracking-widest uppercase text-gray-light hover:text-white relative transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-px after:bg-green-light after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">

              <Link href="/shop" aria-label="Search" className={`w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-gray-light hover:border-green-light hover:text-white transition-all duration-300`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </Link>

              <Link href="/wishlist" aria-label="Wishlist" className={`relative w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-gray-light hover:border-green-light hover:text-white transition-all duration-300`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {hydrated && wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-[17px] h-[17px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/cart" aria-label="Cart" className={`relative w-10 h-10 flex items-center justify-center rounded-full border border-white/10 text-gray-light hover:border-green-light hover:text-white transition-all duration-300`}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {hydrated && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-[17px] h-[17px] bg-green-mid text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {hydrated && (
                isLoggedIn ? (
                  <Link href="/dashboard" className="hidden md:inline-flex btn-primary !py-2 !px-4 !text-[11px]">
                    {user?.first_name ?? "Account"}
                  </Link>
                ) : (
                  <Link href="/login" className="hidden md:inline-flex btn-primary !py-2 !px-4 !text-[11px]">
                    Sign In
                  </Link>
                )
              )}

              <button
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden flex flex-col gap-[5px] p-1 ml-1"
              >
                <span className={`block w-[22px] h-[2px] bg-white rounded transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}/>
                <span className={`block w-[22px] h-[2px] bg-white rounded transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}/>
                <span className={`block w-[22px] h-[2px] bg-white rounded transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}/>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className={`
        fixed inset-0 z-40 bg-black/97 flex flex-col items-center justify-center gap-7
        transition-transform duration-400 ${menuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                className="font-display text-4xl font-semibold text-white hover:text-green-light transition-colors duration-300">
            {link.label}
          </Link>
        ))}
        <div className="flex gap-3 mt-4">
          {isLoggedIn ? (
            <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary">My Account</Link>
          ) : (
            <>
              <Link href="/login"    onClick={() => setMenuOpen(false)} className="btn-primary">Sign In</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-ghost">Register</Link>
            </>
          )}
        </div>
      </div>

      <div className="h-[68px]" />
    </>
  );
}
