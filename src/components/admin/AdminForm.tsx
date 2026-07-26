// src/components/admin/AdminForm.tsx
// ─────────────────────────────────────────────────────────────
// A small set of form-building helpers used by every admin
// create/edit modal to avoid repeating label + error-message
// markup in every single form. All components here are small
// and composable rather than a large opinionated form library.
// ─────────────────────────────────────────────────────────────

import React from "react";

// ── Field wrapper (label + input slot + error message) ────────
interface FormFieldProps {
  label:    string;
  error?:   string;
  required?: boolean;
  children: React.ReactNode;
  hint?:    string;
}

export function FormField({ label, error, required, children, hint }: FormFieldProps) {
  return (
    <div>
      <label className={`block font-utility text-[11px] tracking-[0.1em] uppercase text-gray-mid mb-1.5`}>
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-gray-dark mt-1">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}

// ── Shared input classes ───────────────────────────────────────
// Exported as a constant so all inputs across the admin panel
// look identical without duplicating a long Tailwind string.
export const inputCls = `
  w-full bg-white/[0.04] border border-white/10 rounded-xl
  px-3.5 py-2.5 text-[13px] text-white placeholder:text-gray-dark
  outline-none transition-colors duration-200
  focus:border-green-mid
`;

// ── Form action row (Cancel + Submit) ─────────────────────────
interface FormActionsProps {
  onCancel:       () => void;
  isSubmitting?:  boolean;
  submitLabel?:   string;
}

export function FormActions({ onCancel, isSubmitting, submitLabel = "Save" }: FormActionsProps) {
  return (
    <div className="flex gap-3 pt-4 border-t border-white/5">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="btn-ghost flex-1 justify-center py-2.5 text-[13px]"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary flex-1 justify-center py-2.5 text-[13px] disabled:opacity-60"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}

// ── Page header used by every admin list page ──────────────────
interface AdminPageHeaderProps {
  title:       string;
  description?: string;
  actions?:    React.ReactNode;
}

export function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-white">{title}</h1>
        {description && (
          <p className="text-[13px] text-gray-mid mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

// ── Search + filter toolbar ────────────────────────────────────
interface AdminToolbarProps {
  search:        string;
  onSearch:      (v: string) => void;
  placeholder?:  string;
  children?:     React.ReactNode; // extra filter selects / buttons
}

export function AdminToolbar({ search, onSearch, placeholder = "Search…", children }: AdminToolbarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-5">
      <div className="relative flex-1 min-w-[200px]">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-white placeholder:text-gray-dark outline-none focus:border-green-mid transition-colors"
        />
        <svg className="absolute left-3 top-3 text-gray-mid" width="13" height="13"
             viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
      </div>
      {children}
    </div>
  );
}
