// src/components/admin/AdminPagination.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPT: Lifting pagination state to the parent
//
// AdminPagination doesn't manage its own page number — it
// receives `currentPage` and an `onPageChange` callback from
// its parent. The parent owns the state; this component just
// renders buttons and fires the callback.
//
// This "controlled component" pattern means the parent can
// also update the page from OTHER sources (URL params, API
// response metadata) without the component fighting back with
// its own internal state.
// ─────────────────────────────────────────────────────────────

interface AdminPaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function AdminPagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
}: AdminPaginationProps) {
  if (lastPage <= 1) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to   = Math.min(currentPage * perPage, total);

  // Build visible page numbers: always show first, last, and
  // a window around the current page. Gaps become "…".
  function buildPages(): (number | "...")[] {
    const pages: (number | "...")[] = [];
    const WINDOW = 2; // pages to show either side of current

    for (let i = 1; i <= lastPage; i++) {
      if (
        i === 1 ||
        i === lastPage ||
        (i >= currentPage - WINDOW && i <= currentPage + WINDOW)
      ) {
        pages.push(i);
      } else if (pages.at(-1) !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
      <p className="text-[12px] text-gray-mid">
        Showing <span className="text-white">{from}–{to}</span> of{" "}
        <span className="text-white">{total}</span> results
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-mid text-[13px] hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200`}
        >
          ←
        </button>

        {/* Page numbers */}
        {buildPages().map((page, i) =>
          page === "..." ? (
            <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-gray-dark text-[12px]">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                w-8 h-8 flex items-center justify-center rounded-lg
                text-[13px] font-semibold transition-all duration-200
                ${page === currentPage
                  ? "bg-green-mid text-white border border-green-mid"
                  : "border border-white/10 text-gray-mid hover:border-white/30 hover:text-white"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-gray-mid text-[13px] hover:border-white/30 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200`}
        >
          →
        </button>
      </div>
    </div>
  );
}
