// src/store/cartStore.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Zustand — global state management
//
// React's useState only works INSIDE one component. When two
// components need the same data (e.g. cart count in Header AND
// cart page), you need a GLOBAL store.
//
// Zustand is the simplest option. You define:
//   - State: the data (items, total, etc.)
//   - Actions: functions that change the state
//
// Any component anywhere calls:
//   const { items, addItem } = useCartStore()
// ...and automatically re-renders when items changes.
//
// persist() wraps the store so it saves to localStorage.
// Your cart survives a page refresh.
//
// INSTALL FIRST:
//   npm install zustand
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";

// Shape of one item in the cart
interface CartItem {
  product: Product;
  quantity: number;
}

// Shape of the entire cart store
interface CartStore {
  // ── State ──────────────────────────────────────────────────
  items: CartItem[];
  couponCode: string | null;
  couponDiscount: number; // amount in PHP

  // ── Computed getters ───────────────────────────────────────
  // These are functions that calculate values from state.
  // Call them like: useCartStore(s => s.getTotal())
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;

  // ── Actions ────────────────────────────────────────────────
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
}

export const useCartStore = create<CartStore>()(
  // persist() saves state to localStorage automatically
  persist(
    (set, get) => ({
      // ── Initial state ────────────────────────────────────
      items: [],
      couponCode: null,
      couponDiscount: 0,

      // ── Getters ──────────────────────────────────────────
      getItemCount: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getSubtotal: () =>
        get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        ),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = subtotal >= 1500 ? 0 : 150; // free shipping over ₱1500
        const tax      = subtotal * 0.12;             // 12% VAT
        return subtotal - get().couponDiscount + shipping + tax;
      },

      // ── Actions ──────────────────────────────────────────
      addItem: (product, quantity = 1) => {
        set((state) => {
          // Check if product already in cart
          const existing = state.items.find(
            (i) => i.product.id === product.id
          );

          if (existing) {
            // Increase quantity
            return {
              items: state.items.map((i) =>
                i.product.id === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }

          // Add new item
          return { items: [...state.items, { product, quantity }] };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),

      removeCoupon: () => set({ couponCode: null, couponDiscount: 0 }),
    }),
    {
      name: "knl-cart", // localStorage key
      // Only persist items and coupon (not functions)
      partialize: (state) => ({
        items:          state.items,
        couponCode:     state.couponCode,
        couponDiscount: state.couponDiscount,
      }),
    }
  )
);

// ── Wishlist store ────────────────────────────────────────────
interface WishlistStore {
  productIds: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        })),

      has: (productId) => get().productIds.includes(productId),
    }),
    { name: "knl-wishlist" }
  )
);

// ── Auth store ────────────────────────────────────────────────
interface AuthUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,

      setAuth: (user, token) => {
        localStorage.setItem("knl_token", token);
        document.cookie = `knl_token=${token}; path=/; max-age=86400`;
        set({ user, token, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem("knl_token");
        document.cookie = "knl_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        set({ user: null, token: null, isLoggedIn: false });
      },
    }),
    {
      name: "knl-auth",
      partialize: (state) => ({ user: state.user, token: state.token, isLoggedIn: state.isLoggedIn }),
    }
  )
);
