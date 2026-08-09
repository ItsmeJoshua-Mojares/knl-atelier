// src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "KNL Atelier & Co. Privacy Policy — how we collect, use, and protect your personal data.",
};

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `When you create an account or place an order, we collect: your name, email address, phone number, shipping address, and payment reference numbers. We also collect device and browsing data (browser type, pages visited, IP address) through cookies and analytics tools to improve your experience.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use your information to: process and fulfil your orders, send order confirmation and shipping updates via email or SMS, respond to customer service inquiries, improve our website and product catalog, and send promotional emails (only if you have opted in). We do not sell or rent your personal data to third parties.`,
  },
  {
    title: "3. Payment Security",
    body: `We do not store credit card numbers or full payment credentials on our servers. Orders are settled by cash on delivery, meet-up (available in Laguna, Batangas, and Metro Manila), or arranged directly with us via chat. We only record the information you provide for order verification.`,
  },
  {
    title: "4. Cookies",
    body: `We use essential cookies and browser storage (localStorage) to keep your cart, wishlist, and login session active. We also use analytical cookies from Google Analytics and advertising cookies from Meta (Facebook Pixel) to understand how visitors use our site and measure our ads — these analytics fire only on our live site. You can disable cookies in your browser settings, though some features may not function correctly without them.`,
  },
  {
    title: "5. Data Sharing",
    body: `We share your data only with trusted service providers necessary to run our business: shipping partners (to deliver your order), email service providers (to send transactional emails), and analytics platforms. All third parties are contractually bound to handle your data securely and only for the purposes we specify.`,
  },
  {
    title: "6. Data Retention",
    body: `We retain your account data for as long as your account is active or as needed to provide services. Order records are kept for a minimum of 5 years for legal and tax purposes. You may request deletion of your personal data at any time (subject to legal retention requirements) by contacting us.`,
  },
  {
    title: "7. Your Rights",
    body: `Under applicable Philippine data privacy law (Republic Act 10173), you have the right to: access the personal data we hold about you, correct inaccurate data, request deletion of your data, withdraw consent at any time, and lodge a complaint with the National Privacy Commission. To exercise these rights, email us at hello@reallygreatsite.com.`,
  },
  {
    title: "8. Changes to This Policy",
    body: `We may update this policy from time to time. We will notify you of significant changes via email or a prominent notice on our website. Continued use of our services after changes take effect constitutes your acceptance of the revised policy.`,
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark">
      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#0d1f10,#152618)] py-24">
        <div className="knl-container text-center">
          <span className="section-label block mb-3">Legal</span>
          <h1 className="section-title mb-4">Privacy Policy</h1>
          <p className="text-[13px] text-gray-mid">
            Last updated: June 1, 2025
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="knl-container max-w-3xl">
          <p className="text-[14px] text-gray-mid leading-relaxed mb-10">
            KNL Atelier &amp; Co. (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;)
            is committed to protecting your privacy. This policy explains how we
            collect, use, and safeguard your personal information when you visit
            our website or make a purchase.
          </p>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title} className="border-t border-white/5 pt-8">
                <h2 className="font-utility text-[14px] font-bold tracking-wide uppercase text-white mb-3">
                  {s.title}
                </h2>
                <p className="text-[13px] text-gray-light leading-[1.85]">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 p-5 bg-card border border-white/5 rounded-2xl">
            <p className="text-[13px] text-gray-mid">
              Questions about this policy?{" "}
              <Link href="/contact" className="text-green-light hover:underline">
                Contact us
              </Link>{" "}
              or email{" "}
              <a href="mailto:hello@reallygreatsite.com" className="text-green-light hover:underline">
                hello@reallygreatsite.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
