// src/components/ui/ToastContainer.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Separating logic from UI
//
// useToast (the hook) manages the STATE — the list of toasts,
// adding/removing them, the timer.
//
// ToastContainer (this file) manages the DISPLAY — where toasts
// appear on screen, what they look like, the animation.
//
// They're kept separate because:
// - You might want the same logic with a different visual style
// - The hook can be tested independently of the UI
// - Each component only does ONE thing (Single Responsibility)
//
// USAGE in any component:
//   const { toasts, showToast } = useToast()
//   ...
//   showToast("Added to Cart", "SSK001 Bruce Wayne added")
//   ...
//   <ToastContainer toasts={toasts} onRemove={removeToast} />
// ─────────────────────────────────────────────────────────────

"use client";

import type { Toast } from "@/hooks/useToast";

// Icon map — different icon per toast type
const ICONS: Record<Toast["type"], React.ReactNode> = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="#5cb85c" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="#f87171" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
  warning: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

// Left border colour per type
const BORDER_COLOURS: Record<Toast["type"], string> = {
  success: "border-l-green-light",
  error:   "border-l-red-400",
  warning: "border-l-yellow-400",
  info:    "border-l-blue-400",
};

interface ToastContainerProps {
  toasts:   Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    // Fixed bottom-right, above everything (z-[9999])
    <div
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      className="fixed bottom-7 right-7 z-[9999] flex flex-col gap-2.5 pointer-events-none"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto
            flex items-start gap-3
            bg-mid border border-white/10 border-l-[3px]
            ${BORDER_COLOURS[toast.type]}
            rounded-xl px-4 py-3.5
            min-w-[260px] max-w-[340px]
            shadow-[0_8px_32px_rgba(0,0,0,0.6)]
            animate-slide-in
          `}
        >
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {ICONS[toast.type]}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-utility text-[13px] font-semibold text-white leading-snug">
              {toast.title}
            </p>
            {toast.message && (
              <p className="text-[12px] text-gray-mid mt-0.5 leading-snug">
                {toast.message}
              </p>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => onRemove(toast.id)}
            aria-label="Dismiss notification"
            className="flex-shrink-0 text-gray-dark hover:text-white transition-colors mt-0.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
