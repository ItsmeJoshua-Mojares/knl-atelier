// src/app/(customer)/wishlist/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useWishlistStore, useCartStore } from "@/store/cartStore";
import { apiProductToFrontend } from "@/lib/adapters";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { productIds, toggle } = useWishlistStore();
  const { addItem }            = useCartStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/products?per_page=48`)
      .then((r) => r.json())
      .then((json) => {
        const products = (json.data?.data ?? []).map(apiProductToFrontend);
        setAllProducts(products);
      })
      .catch(() => {});
  }, []);

  const wishlistProducts = allProducts.filter((p) =>
    productIds.includes(p.id)
  );

  return (
    <div className="knl-container py-10 min-h-screen">
      <div className="mb-8">
        <span className="section-label block mb-2">Saved Items</span>
        <div className="flex items-end justify-between">
          <h1 className="section-title">Wishlist</h1>
          <p className="text-[13px] text-gray-mid">
            <span className="text-white font-semibold">{wishlistProducts.length}</span> items saved
          </p>
        </div>
      </div>

      {wishlistProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlistProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(p) => { addItem(p); toggle(p.id); }}
              onSaveToWishlist={(p) => toggle(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="text-6xl mb-6">💝</div>
          <h2 className="font-display text-3xl font-semibold text-white mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-gray-mid text-[14px] mb-8 max-w-sm mx-auto">
            Save items you love by clicking the heart icon on any product.
          </p>
          <Link href="/shop" className="btn-primary">Browse Products</Link>
        </div>
      )}
    </div>
  );
}
