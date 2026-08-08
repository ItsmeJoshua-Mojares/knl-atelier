"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthSync from "@/components/auth/AuthSync";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthSync />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
