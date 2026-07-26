// src/app/about/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "KNL Atelier & Co. — established 2021. Your trusted Philippine-based source for 100% authentic luxury watches, fragrances, shoes, and accessories.",
};

const MILESTONES = [
  { year: "2021", text: "KNL Atelier & Co. founded in the Philippines." },
  { year: "2022", text: "Became an authorized Seiko reseller. First 100 orders shipped." },
  { year: "2023", text: "Expanded into fragrances, footwear, and gadgets." },
  { year: "2024", text: "Launched online store. Over 1,000 happy customers." },
  { year: "2025", text: "New platform, faster delivery, same authentic promise." },
];

const VALUES = [
  { icon: "🛡️", title: "100% Authentic",   desc: "Every product is genuine and sourced directly from authorized distributors. No fakes, ever." },
  { icon: "💎", title: "Premium Quality",   desc: "We handpick every item for quality. If it doesn't meet our standard, it doesn't reach you." },
  { icon: "🤝", title: "Customer First",    desc: "Real humans answer your questions. We don't hide behind bots or ticket systems." },
  { icon: "🚀", title: "Fast & Reliable",   desc: "Orders are packed same-day and tracked from our door to yours." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative bg-[linear-gradient(135deg,#0d1f10,#152618,#0e1a10)] py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(74,124,82,0.15)_0%,transparent_65%)] pointer-events-none"/>
        <div className="knl-container text-center relative z-10">
          <span className="section-label block mb-4">Our Story</span>
          <h1 className="font-display text-5xl font-semibold text-white mb-6 leading-tight">
            Luxury Made Accessible
          </h1>
          <p className="text-[15px] text-gray-mid max-w-xl mx-auto leading-relaxed">
            KNL Atelier &amp; Co. was born from a simple belief: every Filipino
            deserves access to authentic luxury — without the markup, without the doubt.
          </p>
        </div>
      </section>

      {/* ── Our story ─────────────────────────────────── */}
      <section className="py-24 bg-section">
        <div className="knl-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-label block mb-3">Est. 2021</span>
              <h2 className="section-title mb-6">Who We Are</h2>
              <div className="space-y-4 text-[14px] text-gray-light leading-[1.8]">
                <p>
                  KNL Atelier &amp; Co. started as a passion project between two friends
                  who loved fine watches but were tired of overpaying or worrying about
                  fakes. We decided to build the store we always wished existed.
                </p>
                <p>
                  Today we carry authentic Seiko timepieces, premium fragrances,
                  designer footwear, gadgets, and accessories — all 100% genuine,
                  carefully sourced, and delivered to your door.
                </p>
                <p>
                  We&apos;re based in the Philippines and built for Filipinos who value
                  quality and authenticity as much as we do.
                </p>
              </div>
              <Link href="/shop" className="btn-primary mt-8 inline-flex">
                Shop the Collection
              </Link>
            </div>

            {/* Timeline */}
            <div className="relative pl-6 border-l border-white/10">
              {MILESTONES.map((m) => (
                <div key={m.year} className="relative mb-8 last:mb-0">
                  {/* Dot */}
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-mid border-2 border-dark"/>
                  <p className="font-utility text-[11px] tracking-[2px] uppercase text-green-light mb-1">
                    {m.year}
                  </p>
                  <p className="text-[13px] text-gray-light">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────── */}
      <section className="py-24 bg-dark">
        <div className="knl-container">
          <div className="text-center mb-14">
            <span className="section-label block mb-3">What We Stand For</span>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="bg-card border border-white/5 rounded-2xl p-6 hover:border-green-mid/30 transition-all duration-300 group"
              >
                <span className="text-4xl block mb-4">{v.icon}</span>
                <h3 className="font-utility text-[14px] font-bold tracking-wide uppercase text-white mb-2">
                  {v.title}
                </h3>
                <p className="text-[13px] text-gray-mid leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA strip ─────────────────────────────────── */}
      <section className="py-20 bg-[linear-gradient(135deg,#0d1f10,#1a3a20)]">
        <div className="knl-container text-center">
          <h2 className="font-display text-3xl font-semibold text-white mb-4">
            Ready to find your next timepiece?
          </h2>
          <p className="text-[14px] text-gray-mid mb-8">
            Browse our full collection of authentic Seiko watches and more.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/shop" className="btn-primary">Shop Now</Link>
            <Link href="/contact" className="btn-ghost">Get in Touch</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
