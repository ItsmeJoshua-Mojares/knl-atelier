// src/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "KNL Atelier & Co. Terms and Conditions — rules governing your use of our website and services.",
};

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: `By accessing or using the KNL Atelier & Co. website and placing orders, you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our services.`,
  },
  {
    title: "2. Product Authenticity Guarantee",
    body: `All products sold by KNL Atelier & Co. are guaranteed to be 100% authentic. We source exclusively from authorized distributors and brand-official channels. Any product found to be inauthentic after purchase will be replaced or fully refunded, no questions asked.`,
  },
  {
    title: "3. Pricing & Payment",
    body: `All prices are listed in Philippine Pesos (₱) and include applicable VAT. We reserve the right to update prices without prior notice. Orders are only confirmed after payment has been received and verified. In the event of a pricing error, we will contact you before fulfilling the order.`,
  },
  {
    title: "4. Order Acceptance",
    body: `Placing an order constitutes an offer to purchase. We reserve the right to refuse or cancel any order at our discretion, including cases of suspected fraud, stock errors, or pricing mistakes. You will be notified and fully refunded if we cancel your order.`,
  },
  {
    title: "5. Shipping & Delivery",
    body: `Estimated delivery times are provided as guides and are not guaranteed. KNL Atelier & Co. is not responsible for delays caused by third-party courier services, weather, natural disasters, or other factors outside our control. Risk of loss passes to you when the courier confirms delivery.`,
  },
  {
    title: "6. Returns & Refunds",
    body: `Items may be returned within 7 days of delivery in original, unused condition with all original packaging. Return shipping costs are the buyer's responsibility unless the item is defective or incorrectly sent. Refunds are processed within 3–5 business days after we receive and inspect the return.`,
  },
  {
    title: "7. Intellectual Property",
    body: `All content on this website — including logos, images, text, and design — is the property of KNL Atelier & Co. or its licensors and is protected by applicable intellectual property law. You may not reproduce, distribute, or use any content without our written permission.`,
  },
  {
    title: "8. Limitation of Liability",
    body: `To the maximum extent permitted by law, KNL Atelier & Co. shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability to you shall not exceed the purchase price of the relevant order.`,
  },
  {
    title: "9. Governing Law",
    body: `These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the courts of the Philippines.`,
  },
  {
    title: "10. Contact",
    body: `For questions about these Terms, contact us at hello@reallygreatsite.com or through our Contact page.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark">
      <section className="bg-[linear-gradient(135deg,#0d1f10,#152618)] py-24">
        <div className="knl-container text-center">
          <span className="section-label block mb-3">Legal</span>
          <h1 className="section-title mb-4">Terms &amp; Conditions</h1>
          <p className="text-[13px] text-gray-mid">Last updated: June 1, 2025</p>
        </div>
      </section>

      <section className="py-20">
        <div className="knl-container max-w-3xl">
          <p className="text-[14px] text-gray-mid leading-relaxed mb-10">
            Please read these Terms and Conditions carefully before using the
            KNL Atelier &amp; Co. website or placing an order.
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
              Questions?{" "}
              <Link href="/contact" className="text-green-light hover:underline">
                Contact us
              </Link>{" "}
              or visit our{" "}
              <Link href="/faq" className="text-green-light hover:underline">
                FAQ page
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
