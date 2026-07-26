// src/app/order-success/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function OrderSuccessPage() {
  const searchParams  = useSearchParams();
  const orderNumber   = searchParams.get("order") ?? "KNL-XXXXXXXX";
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Small delay so animation is visible
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-full bg-green-dark border-2 border-green-mid flex items-center justify-center mx-auto mb-8"
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="#5cb85c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="section-label mb-3 block">Order Confirmed</p>
          <h1 className="font-display text-4xl font-semibold text-white mb-4">
            Thank you!
          </h1>
          <p className="text-gray-mid text-[15px] leading-relaxed mb-2">
            Your order has been placed successfully.
          </p>

          {/* Order number badge */}
          <div className="inline-block bg-white/[0.04] border border-white/10 rounded-xl px-6 py-3 mb-8">
            <p className="text-[11px] text-gray-dark font-utility tracking-[2px] uppercase mb-1">
              Order Number
            </p>
            <p className="font-utility text-xl font-bold text-white tracking-widest">
              {orderNumber}
            </p>
          </div>

          {/* What happens next */}
          <div className="bg-card border border-white/5 rounded-2xl p-6 text-left mb-8">
            <h3 className="font-utility text-[11px] tracking-[2px] uppercase text-gray-mid mb-4">
              What happens next
            </h3>
            <div className="space-y-4">
              {[
                { step: "1", title: "Order Review", desc: "We verify your order and payment details." },
                { step: "2", title: "Preparation",  desc: "Your watch is carefully inspected and packaged." },
                { step: "3", title: "Shipping",     desc: "Tracked delivery to your address." },
                { step: "4", title: "Delivered",    desc: "Enjoy your authentic timepiece!" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-dark border border-green-mid/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="font-utility text-[10px] font-bold text-green-light">{item.step}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-white">{item.title}</p>
                    <p className="text-[12px] text-gray-mid">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="btn-primary justify-center py-3.5">
              Track My Order
            </Link>
            <Link href="/shop" className="btn-ghost justify-center py-3.5">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
