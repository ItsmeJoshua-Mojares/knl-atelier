// src/components/admin/AdminBadge.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: A "dumb" presentational component
//
// AdminBadge takes a status string and maps it to colours.
// It has NO logic, NO state, NO side effects — it just renders.
// These are called "presentational" or "dumb" components.
//
// Every admin page uses this for order statuses, payment
// statuses, active/inactive toggles. Keeping colour-mapping
// in ONE place means you only edit it here to change every
// badge across the whole admin panel.
// ─────────────────────────────────────────────────────────────

interface AdminBadgeProps {
  status: string;
  /** Optional: override the displayed text (defaults to status) */
  label?: string;
  size?: "sm" | "md";
}

// Map of status → Tailwind classes for background + text colour
const STATUS_CLASSES: Record<string, string> = {
  // Order statuses
  pending:    "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  confirmed:  "bg-blue-500/15 text-blue-400 border-blue-500/30",
  processing: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shipped:    "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  delivered:  "bg-green-500/15 text-green-400 border-green-500/30",
  cancelled:  "bg-red-500/15 text-red-400 border-red-500/30",
  returned:   "bg-orange-500/15 text-orange-400 border-orange-500/30",
  refunded:   "bg-gray-500/15 text-gray-400 border-gray-500/30",

  // Payment statuses
  paid:                "bg-green-500/15 text-green-400 border-green-500/30",
  failed:              "bg-red-500/15 text-red-400 border-red-500/30",
  partially_refunded:  "bg-orange-500/15 text-orange-400 border-orange-500/30",

  // Boolean-like
  active:   "bg-green-500/15 text-green-400 border-green-500/30",
  inactive: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  true:     "bg-green-500/15 text-green-400 border-green-500/30",
  false:    "bg-gray-500/15 text-gray-400 border-gray-500/30",

  // Coupon types
  percentage:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  fixed:         "bg-purple-500/15 text-purple-400 border-purple-500/30",
  free_shipping: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
};

export default function AdminBadge({ status, label, size = "sm" }: AdminBadgeProps) {
  const classes = STATUS_CLASSES[status.toLowerCase()] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30";

  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-[11px] px-2.5 py-1";

  return (
    <span className={`
      inline-flex items-center font-utility font-bold tracking-[1.5px] uppercase
      rounded-full border ${sizeClasses} ${classes}
    `}>
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
