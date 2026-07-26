// src/app/faq/page.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Accordion with controlled open state
//
// openIndex stores which FAQ item is expanded. Clicking one
// closes the previously open item and opens the new one.
// Setting openIndex to null closes all items.
//
// This is "controlled accordion" — the parent (FAQ page) owns
// the state, not the individual items. This is the correct
// React pattern when items need to be mutually exclusive.
// ─────────────────────────────────────────────────────────────

"use client";

import { useState } from "react";
import type { Metadata } from "next";
import Link from "next/link";

const FAQ_GROUPS = [
  {
    group: "Products & Authenticity",
    items: [
      {
        q: "Are all products 100% authentic?",
        a: "Yes — absolutely. Every product sold by KNL Atelier & Co. is 100% genuine and sourced from authorized distributors. We never sell replicas, grey-market, or unverified items. Each Seiko watch comes with the original box, manuals, and warranty card.",
      },
      {
        q: "How can I verify my watch is authentic?",
        a: "Every Seiko watch we sell includes the original Seiko warranty card, instruction manual, and box. You can register your watch directly on the official Seiko website using the serial number on the case back. If you ever have doubts, our team is happy to walk you through the verification process.",
      },
      {
        q: "Do the watches come with a warranty?",
        a: "Yes. All Seiko watches come with the manufacturer's international warranty card included in the box. The standard Seiko warranty is 3 years for movements and 1 year for the case and bracelet. KNL Atelier & Co. also provides local after-sales support.",
      },
      {
        q: "What brands do you carry?",
        a: "Currently our main collection is Seiko watches (SSK series, SRPD series, solar/quartz models). We also carry fragrances (Calvin Klein, Guess, Michael Kors), footwear (Reebok, Adidas), and select gadgets and accessories. Our catalog is growing regularly.",
      },
    ],
  },
  {
    group: "Orders & Shipping",
    items: [
      {
        q: "How long does delivery take?",
        a: "For Metro Manila orders: 1–3 business days. Provincial orders: 3–7 business days. Orders placed before 2:00 PM are processed same-day. You'll receive a tracking number via email once your order is shipped.",
      },
      {
        q: "Do you offer free shipping?",
        a: "Yes! Orders totaling ₱1,500 or more qualify for free standard shipping nationwide. Orders below ₱1,500 have a flat shipping fee of ₱150.",
      },
      {
        q: "Can I track my order?",
        a: "Yes. Once your order is shipped, we'll send a tracking number to your email. You can also track your order in real time through your account dashboard under 'My Orders'.",
      },
      {
        q: "Can I cancel my order?",
        a: "Orders can be cancelled within 2 hours of placement, as long as they haven't been packed yet. To cancel, go to your dashboard and click 'Cancel Order', or contact us immediately via the contact page. Once an order is shipped, it cannot be cancelled.",
      },
    ],
  },
  {
    group: "Payment",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept GCash, Maya (formerly PayMaya), Bank Transfer (BPI, BDO, Metrobank), and Cash on Delivery (COD). For GCash and Maya, please send payment to the number shown at checkout and enter your reference number.",
      },
      {
        q: "Is Cash on Delivery available everywhere?",
        a: "COD is available for all areas served by our courier partners, which covers most of the Philippines. A small COD handling fee of ₱50 may apply for provincial orders. If COD is unavailable in your area, our checkout will notify you.",
      },
      {
        q: "Is it safe to pay online?",
        a: "Yes. Our website uses HTTPS encryption and we do not store your payment details on our servers. GCash and Maya transactions are processed through their secure platforms — we only receive a reference number for verification.",
      },
    ],
  },
  {
    group: "Returns & Refunds",
    items: [
      {
        q: "What is your return policy?",
        a: "We accept returns within 7 days of delivery. Items must be unused, in original condition, and returned with all original packaging (box, manuals, warranty card). Watches with removed tags or signs of use cannot be returned.",
      },
      {
        q: "How do I request a return or refund?",
        a: "Contact us via the contact page or email us at hello@reallygreatsite.com within 7 days of receiving your order. Include your order number and photos of the item. Our team will respond within 24 hours with instructions.",
      },
      {
        q: "How long do refunds take?",
        a: "Once we receive and inspect the returned item, refunds are processed within 3–5 business days. GCash and Maya refunds are typically instant once processed. Bank transfers take 3–5 banking days.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenIndex((prev) => (prev === key ? null : key));
  }

  return (
    <div className="min-h-screen bg-dark">

      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#0d1f10,#152618)] py-24">
        <div className="knl-container text-center">
          <span className="section-label block mb-3">Help Center</span>
          <h1 className="section-title mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[14px] text-gray-mid max-w-md mx-auto">
            Can&apos;t find your answer? Reach out via our{" "}
            <Link href="/contact" className="text-green-light hover:underline">
              contact page
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="knl-container max-w-3xl">
          {FAQ_GROUPS.map((group) => (
            <div key={group.group} className="mb-12">
              {/* Group heading */}
              <h2 className="font-utility text-[11px] tracking-[3px] uppercase text-green-light mb-5">
                {group.group}
              </h2>

              <div className="space-y-3">
                {group.items.map((item, i) => {
                  const key  = `${group.group}-${i}`;
                  const open = openIndex === key;

                  return (
                    <div
                      key={key}
                      className={`
                        bg-card border rounded-xl overflow-hidden transition-all duration-300
                        ${open ? "border-green-mid/40" : "border-white/5"}
                      `}
                    >
                      {/* Question (always visible) */}
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <span
                          className={`
                            font-utility text-[14px] font-semibold tracking-wide
                            transition-colors duration-200
                            ${open ? "text-white" : "text-gray-light"}
                          `}
                        >
                          {item.q}
                        </span>
                        {/* +/− toggle icon */}
                        <span
                          className={`
                            ml-4 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center
                            transition-all duration-300
                            ${open
                              ? "border-green-mid bg-green-dark/40 text-green-light rotate-45"
                              : "border-white/15 text-gray-mid"
                            }
                          `}
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="2.5">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5"  y1="12" x2="19" y2="12"/>
                          </svg>
                        </span>
                      </button>

                      {/* Answer (revealed when open) */}
                      <div
                        className={`
                          overflow-hidden transition-all duration-300
                          ${open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
                        `}
                      >
                        <p className="text-[13px] text-gray-mid leading-[1.8] px-5 pb-5">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="text-center mt-10 pt-10 border-t border-white/5">
            <p className="text-[14px] text-gray-mid mb-4">
              Still have questions?
            </p>
            <Link href="/contact" className="btn-primary">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
