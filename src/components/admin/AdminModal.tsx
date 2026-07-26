// src/components/admin/AdminModal.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Portals and accessibility
//
// Modals should render at the ROOT of the document (above all
// other content in the DOM) rather than nested inside the button
// that opened them. In React this is called a "Portal" — but for
// simplicity here we use fixed positioning + z-index instead.
//
// Accessibility requirements for modals:
//   - Escape key closes the modal (useEffect keyboard listener)
//   - Click on the backdrop closes the modal
//   - The "close" button has an aria-label for screen readers
//   - The dialog has role="dialog" and aria-modal="true"
// ─────────────────────────────────────────────────────────────

"use client";

import { useEffect, useRef } from "react";

interface AdminModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  title:      string;
  size?:      "sm" | "md" | "lg" | "xl";
  children:   React.ReactNode;
}

const SIZE_CLASSES = {
  sm:  "max-w-sm",
  md:  "max-w-md",
  lg:  "max-w-lg",
  xl:  "max-w-2xl",
};

export default function AdminModal({
  isOpen, onClose, title, size = "md", children,
}: AdminModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Semi-transparent backdrop — click closes modal */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel */}
      <div
        ref={panelRef}
        className={`
          relative z-10 w-full ${SIZE_CLASSES[size]}
          bg-[#111] border border-white/10 rounded-2xl
          shadow-[0_24px_80px_rgba(0,0,0,0.7)]
          max-h-[85vh] overflow-y-auto
          animate-fade-up
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2
            id="modal-title"
            className="font-display text-xl font-semibold text-white"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-gray-mid hover:text-white hover:bg-white/10 transition-all duration-200`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6"  y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
