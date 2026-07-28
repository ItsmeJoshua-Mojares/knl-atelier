// src/lib/api/client.ts  (add this to your Phase 1 Next.js project)
// ─────────────────────────────────────────────────────────────
// CONCEPT: Axios Interceptors
//
// An interceptor is a function that runs on EVERY request or
// response automatically — you don't have to call it manually.
//
// Request interceptor: runs before every request is sent.
//   → We use it to attach the JWT token to the Authorization header.
//   → So you never have to write `headers: { Authorization: ... }`
//     in every single API call — the interceptor does it once.
//
// Response interceptor: runs after every response arrives.
//   → We use it to handle 401 errors globally. If ANY request
//     gets a 401 (token expired), we redirect to /login.
//   → Again, you never have to handle this in each component.
//
// This is the DRY principle (Don't Repeat Yourself) applied to API calls.
// ─────────────────────────────────────────────────────────────

import axios from "axios";

// Create a custom Axios instance for our API.
// All requests made with this instance automatically go to the
// Laravel backend URL set in .env.local
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
    "Accept":       "application/json",
  },
  // Include cookies in cross-origin requests
  withCredentials: true,
});

// ── Request Interceptor ──────────────────────────────────────
// Runs before every request. Attaches JWT token.
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (we'll use a more secure cookie in Phase 6)
    const token = typeof window !== "undefined"
      ? localStorage.getItem("knl_token")
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────
// Runs after every response. Handles auth errors globally.
apiClient.interceptors.response.use(
  // Success: just pass the response through
  (response) => response,

  // Error: check if it's a 401 (unauthorized)
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("knl_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// ── File download helper ────────────────────────────────────────
// Report URLs (CSV/Excel/PDF) require the JWT Authorization header,
// which a plain <a href="..."> can't send. This helper fetches the
// file as a blob through our authenticated apiClient instance, then
// triggers a browser download — used by all report buttons in the
// admin dashboard.
export async function downloadFile(url: string, filename: string) {
  const token = localStorage.getItem("knl_token");
  const response = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new Error("Download failed. Please try again.");
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

// ─────────────────────────────────────────────────────────────
// API function modules — organized by feature
// Usage: import { authApi } from "@/lib/api/client"
//        const result = await authApi.login(email, password)
// ─────────────────────────────────────────────────────────────

// ── Auth API ─────────────────────────────────────────────────
export const authApi = {
  register: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
  }) => apiClient.post("/auth/register", data),

  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  logout: () => apiClient.post("/auth/logout"),

  refresh: () => apiClient.post("/auth/refresh"),

  me: () => apiClient.get("/auth/me"),
};

// ── Products API ──────────────────────────────────────────────
export const productsApi = {
  list: (params?: {
    category?: string;
    brand?: string;
    min_price?: number;
    max_price?: number;
    search?: string;
    sort?: "price_asc" | "price_desc" | "newest" | "popular";
    featured?: boolean;
    page?: number;
    per_page?: number;
  }) => apiClient.get("/products", { params }),

  show: (slug: string) =>
    apiClient.get(`/products/${slug}`),

  featured: () => apiClient.get("/products/featured"),

  bestsellers: () => apiClient.get("/products/bestsellers"),

  // Reviews
  reviews: {
    list: (slug: string, params?: { page?: number }) =>
      apiClient.get(`/products/${slug}/reviews`, { params }),
    create: (slug: string, data: { rating: number; title?: string; body: string }) =>
      apiClient.post(`/products/${slug}/reviews`, data),
  },
};

// ── Cart API ──────────────────────────────────────────────────
export const cartApi = {
  get: () => apiClient.get("/cart"),

  add: (productId: string | number, quantity = 1) =>
    apiClient.post("/cart/add", { product_id: productId, quantity }),

  update: (itemId: string | number, quantity: number) =>
    apiClient.put(`/cart/${itemId}`, { quantity }),

  remove: (itemId: string | number) =>
    apiClient.delete(`/cart/${itemId}`),

  clear: () => apiClient.delete("/cart"),
};

// ── Coupon API (Phase 4) ─────────────────────────────────────
export const couponApi = {
  // Validates a coupon code against the cart subtotal.
  // Returns { code, type, discount } if valid.
  validate: (code: string, subtotal: number) =>
    apiClient.post("/coupons/validate", { code, subtotal }),
};

// ── Wishlist API ──────────────────────────────────────────────
export const wishlistApi = {
  get: () => apiClient.get("/wishlist"),

  toggle: (productId: string | number) =>
    apiClient.post(`/wishlist/${productId}`),
};

// ── Admin API (Phase 5) ───────────────────────────────────────
// All requests here require a JWT belonging to an admin/super_admin
// user — enforced server-side by the role:admin middleware.
export const adminApi = {
  // Auth
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),

  // Dashboard
  dashboard: (period: "today" | "7days" | "30days" | "year" = "30days") =>
    apiClient.get("/admin/dashboard", { params: { period } }),

  // Products
  products: {
    list: (params?: {
      search?: string; category_id?: number; status?: string; trashed?: boolean;
      sort_by?: string; sort_dir?: "asc" | "desc"; page?: number; per_page?: number;
    }) => apiClient.get("/admin/products", { params }),

    get: (id: number) => apiClient.get(`/admin/products/${id}`),

    create: (data: Record<string, unknown>) => apiClient.post("/admin/products", data),

    update: (id: number, data: Record<string, unknown>) =>
      apiClient.put(`/admin/products/${id}`, data),

    delete: (id: number) => apiClient.delete(`/admin/products/${id}`),

    bulkDelete: (ids: number[]) =>
      apiClient.post("/admin/products/bulk-delete", { ids }),

    bulkUpdateStatus: (ids: number[], isActive: boolean) =>
      apiClient.put("/admin/products/bulk-update-status", { ids, is_active: isActive }),

    adjustStock: (id: number, quantityChange: number, note?: string) =>
      apiClient.post(`/admin/products/${id}/adjust-stock`, {
        quantity_change: quantityChange,
        note,
      }),

    // Image management
    uploadImages: (id: number, files: File[], setPrimaryIndex?: number) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("images[]", file));
      if (setPrimaryIndex !== undefined) {
        formData.append("set_primary_index", String(setPrimaryIndex));
      }
      // Do NOT set Content-Type — browser auto-detects FormData
      // and sets multipart/form-data with the correct boundary
      return apiClient.post(`/admin/products/${id}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: [(data, headers) => {
          delete headers["Content-Type"];
          return data;
        }],
      });
    },

    deleteImage: (productId: number, imageId: number) =>
      apiClient.delete(`/admin/products/${productId}/images/${imageId}`),

    setPrimaryImage: (productId: number, imageId: number) =>
      apiClient.put(`/admin/products/${productId}/images/${imageId}/set-primary`),

    restore: (id: number) => apiClient.put(`/admin/products/${id}/restore`),

    forceDelete: (id: number) => apiClient.delete(`/admin/products/${id}/force-delete`),
  },

  // Categories
  categories: {
    list: (params?: { page?: number; per_page?: number }) =>
      apiClient.get("/admin/categories", { params }),
    create: (data: Record<string, unknown>) => apiClient.post("/admin/categories", data),
    update: (id: number, data: Record<string, unknown>) =>
      apiClient.put(`/admin/categories/${id}`, data),
    delete: (id: number) => apiClient.delete(`/admin/categories/${id}`),
  },

  // Brands
  brands: {
    list: (params?: { page?: number; per_page?: number }) =>
      apiClient.get("/admin/brands", { params }),
    create: (data: Record<string, unknown>) => apiClient.post("/admin/brands", data),
    update: (id: number, data: Record<string, unknown>) =>
      apiClient.put(`/admin/brands/${id}`, data),
    delete: (id: number) => apiClient.delete(`/admin/brands/${id}`),
  },

  // Coupons
  coupons: {
    list: (params?: { status?: string; page?: number; per_page?: number }) =>
      apiClient.get("/admin/coupons", { params }),
    create: (data: Record<string, unknown>) => apiClient.post("/admin/coupons", data),
    update: (id: number, data: Record<string, unknown>) =>
      apiClient.put(`/admin/coupons/${id}`, data),
    delete: (id: number) => apiClient.delete(`/admin/coupons/${id}`),
  },

  // Orders
  orders: {
    list: (params?: {
      status?: string; payment_method?: string; search?: string;
      date_from?: string; date_to?: string; page?: number;
    }) => apiClient.get("/admin/orders", { params }),

    get: (id: number) => apiClient.get(`/admin/orders/${id}`),

    updateStatus: (id: number, status: string, opts?: { tracking_number?: string; note?: string }) =>
      apiClient.put(`/admin/orders/${id}/status`, { status, ...opts }),

    invoicePdfUrl: (id: number) =>
      `${apiClient.defaults.baseURL}/admin/orders/${id}/invoice-pdf`,
  },

  // Payments — manual verification queue
  payments: {
    list: (params?: { status?: string; method?: string; page?: number }) =>
      apiClient.get("/admin/payments", { params }),
    verify: (id: number, note?: string) =>
      apiClient.post(`/admin/payments/${id}/verify`, { note }),
    reject: (id: number, reason: string) =>
      apiClient.post(`/admin/payments/${id}/reject`, { reason }),
    refund: (id: number, amount: number, reason: string) =>
      apiClient.post(`/admin/payments/${id}/refund`, { amount, reason }),
  },

  // Reviews management
  reviews: {
    list: (params?: { status?: string; product_id?: number; search?: string; page?: number; per_page?: number }) =>
      apiClient.get("/admin/reviews", { params }),
    approve: (id: number) => apiClient.post(`/admin/reviews/${id}/approve`),
    reject: (id: number) => apiClient.post(`/admin/reviews/${id}/reject`),
    reply: (id: number, reply: string) => apiClient.post(`/admin/reviews/${id}/reply`, { reply }),
    delete: (id: number) => apiClient.delete(`/admin/reviews/${id}`),
  },

  // Banners
  banners: {
    list: (params?: { position?: string; status?: string; page?: number; per_page?: number }) =>
      apiClient.get("/admin/banners", { params }),
    create: (data: Record<string, unknown>) => apiClient.post("/admin/banners", data),
    update: (id: number, data: Record<string, unknown>) =>
      apiClient.put(`/admin/banners/${id}`, data),
    delete: (id: number) => apiClient.delete(`/admin/banners/${id}`),
  },

  // Customers
  customers: {
    list: (params?: { search?: string; active_only?: boolean; page?: number; per_page?: number }) =>
      apiClient.get("/admin/customers", { params }),
    get: (id: number) => apiClient.get(`/admin/customers/${id}`),
    toggleActive: (id: number) =>
      apiClient.put(`/admin/customers/${id}/toggle-active`),
  },

  // Activity log
  activityLog: (params?: { subject_type?: string; event?: string; page?: number }) =>
    apiClient.get("/admin/activity-log", { params }),

  // Reports — these trigger file downloads, so we return the
  // full URL rather than making the request through axios.
  reports: {
    ordersCsvUrl: (from?: string, to?: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to)   params.set("to", to);
      return `${apiClient.defaults.baseURL}/admin/reports/orders/csv?${params}`;
    },
    productsCsvUrl: () => `${apiClient.defaults.baseURL}/admin/reports/products/csv`,
    salesExcelUrl: (from: string, to: string) =>
      `${apiClient.defaults.baseURL}/admin/reports/sales/excel?from=${from}&to=${to}`,
    salesPdfUrl: (from: string, to: string) =>
      `${apiClient.defaults.baseURL}/admin/reports/sales/pdf?from=${from}&to=${to}`,
  },
};
export interface CreateOrderPayload {
  first_name:        string;
  last_name:         string;
  phone:             string;
  address_line1:     string;
  address_line2?:    string;
  city:              string;
  province:          string;
  postal_code:       string;
  payment_method:    "gcash" | "maya" | "bank_transfer" | "cod";
  reference_number?: string;
  coupon_code?:      string;
  customer_notes?:   string;
}

export const ordersApi = {
  list: (params?: { status?: string; page?: number }) =>
    apiClient.get("/orders", { params }),

  get: (orderNumber: string) =>
    apiClient.get(`/orders/${orderNumber}`),

  create: (data: CreateOrderPayload) =>
    apiClient.post("/orders", data),

  cancel: (orderNumber: string) =>
    apiClient.post(`/orders/${orderNumber}/cancel`),
};
