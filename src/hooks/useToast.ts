// src/hooks/useToast.ts
// ─────────────────────────────────────────────────────────────
// CONCEPT: Custom Hooks
//
// A custom hook is a function whose name starts with "use" and
// that calls other React hooks inside it.
//
// Right now, toast logic is copy-pasted in multiple components:
//   - ProductGrid.tsx has its own toasts array + showToast fn
//   - ProductDetailClient.tsx has its own version
//   - Cart, Checkout, etc. will need it too
//
// Instead of repeating useState + setTimeout everywhere, we
// extract it into ONE custom hook. Every component that needs
// toasts just calls:
//   const { toasts, showToast } = useToast()
//
// This is the DRY principle (Don't Repeat Yourself) applied
// to React logic — the same way components prevent repeating JSX.
//
// IMPORTANT: Custom hooks are NOT shared instances.
// Each component that calls useToast() gets its OWN separate
// state. If you need toasts to be visible site-wide (e.g.
// "Added to cart" shown in the header), use a Zustand store
// instead (which IS a shared global instance).
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";

export interface Toast {
  id:      string;
  title:   string;
  message: string;
  type:    "success" | "error" | "info" | "warning";
}

interface UseToastReturn {
  toasts:      Toast[];
  showToast:   (title: string, message: string, type?: Toast["type"]) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export function useToast(duration = 3200): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // useCallback prevents this function from being recreated on
  // every render, which would cause unnecessary re-renders in
  // child components that receive it as a prop.
  const showToast = useCallback(
    (title: string, message: string, type: Toast["type"] = "success") => {
      const id = crypto.randomUUID();

      setToasts((prev) => [{ id, title, message, type }, ...prev]);

      // Auto-remove after `duration` ms
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    [duration]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => setToasts([]), []);

  return { toasts, showToast, removeToast, clearToasts };
}
