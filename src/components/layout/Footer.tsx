// src/components/layout/Footer.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// This is a "Server Component" — notice there's no "use client".
// Server components render on the server and send plain HTML to
// the browser. They're faster and better for SEO because search
// engines can read the content immediately.
//
// Use server components when you DON'T need:
//  - useState or useEffect
//  - onClick or other browser event handlers
//  - Browser-only APIs like window or document
//
// The Footer never changes based on user interaction, so it's
// a perfect candidate for a server component.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";

// Column data stored as arrays — much cleaner than repeating JSX
const QUICK_LINKS = [
  { href: "/",        label: "Home" },
  { href: "/shop",    label: "Shop" },
  { href: "/about",   label: "About Us" },
  { href: "/contact", label: "Contact" },
];

const CUSTOMER_LINKS = [
  { href: "/dashboard", label: "My Account" },
  { href: "/dashboard", label: "Order History" },
  { href: "/wishlist",  label: "Wishlist" },
  { href: "/faq",       label: "FAQ" },
];

const PAYMENT_METHODS = ["GCash", "Maya", "COD", "Bank"];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080808] border-t border-white/5">

      {/* ── Main Footer Grid ─────────────────────────────────── */}
      <div className="knl-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1: Brand info */}
          <div>
            {/* Logo */}
            <div className="mb-5">
              <div className="font-utility text-2xl font-bold">
                <span className="text-green-light">KNL</span>
              </div>
              <div className="font-body text-[9px] tracking-[3.5px] uppercase text-gold mt-1">
                Atelier &amp; Co.
              </div>
            </div>

            <p className="text-[13px] text-gray-mid leading-relaxed mb-6 max-w-[280px]">
              Your premier destination for authentic luxury watches, fragrances,
              footwear, and accessories. Genuine products, exceptional service.
            </p>

            {/* Social links */}
            <div className="flex gap-3">
              {[
                { label: "Facebook",  icon: "f" },
                { label: "Instagram", icon: "in" },
                { label: "Twitter",   icon: "tw" },
              ].map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className={`w-9 h-9 rounded-full border border-white/10 text-gray-mid flex items-center justify-center text-xs font-bold hover:border-green-light hover:text-green-light transition-all duration-300`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-utility text-[11px] tracking-[3px] uppercase text-white mb-5">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-mid hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care */}
          <div>
            <h4 className="font-utility text-[11px] tracking-[3px] uppercase text-white mb-5">
              Customer Care
            </h4>
            <ul className="space-y-2.5">
              {CUSTOMER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[13px] text-gray-mid hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact + Payments */}
          <div>
            <h4 className="font-utility text-[11px] tracking-[3px] uppercase text-white mb-5">
              Main Office
            </h4>

            {/* Contact items */}
            <div className="space-y-3 mb-6">
              <p className="text-[13px] text-gray-mid leading-relaxed">
                📍 123 Anywhere St., Any City, State, Any Country
              </p>
              <p className="text-[13px] text-gray-mid">
                📞 (123) 456 7890
              </p>
              <p className="text-[13px] text-gray-mid">
                ✉️ hello@reallygreatsite.com
              </p>
            </div>

            {/* Payment methods */}
            <h4 className="font-utility text-[11px] tracking-[2px] uppercase text-gray-dark mb-3">
              Payment Methods
            </h4>
            <div className="flex gap-2 flex-wrap">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className={`text-[11px] text-gray-mid border border-white/10 rounded px-2.5 py-1 bg-white/5`}
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer Bottom Bar ────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="knl-container py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12px] text-gray-dark">
            © {currentYear} KNL Atelier &amp; Co. All rights reserved. Est. 2021
          </p>
          <div className="flex gap-5">
            {[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms",   label: "Terms & Conditions" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[12px] text-gray-dark hover:text-gray-mid transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
