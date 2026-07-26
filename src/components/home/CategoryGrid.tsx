// src/components/home/CategoryGrid.tsx
// ─────────────────────────────────────────────────────────────
// CONCEPTS YOU LEARN HERE:
//
// Props — this component receives data from its parent via props.
// Instead of hardcoding the categories inside this component,
// the parent (page.tsx) passes them in. This makes the component
// reusable — you could use it to show ANY list of categories.
//
// interface CategoryGridProps — defines exactly what props this
// component expects. TypeScript will error if you forget to pass
// `categories` when you use <CategoryGrid />.
//
// .map() — the most common React pattern. Takes an array and
// returns a new array of JSX elements. React renders all of them.
// The `key` prop must be unique so React can track which item
// is which when the list updates.
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import type { Category } from "@/types";

// Props interface — what this component expects to receive
interface CategoryGridProps {
  categories: Category[];
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-24 bg-section">
      <div className="knl-container">

        {/* Section header */}
        <div className="text-center mb-14">
          <span className="section-label block mb-3">Explore Our World</span>
          <h2 className="section-title mb-4">Shop by Category</h2>
          <p className="text-[15px] text-gray-mid max-w-[500px] mx-auto">
            From precision timepieces to signature scents — discover curated
            collections for every lifestyle.
          </p>
        </div>

        {/* 5-column grid on desktop, 2 columns on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ── CategoryCard sub-component ───────────────────────────────
// Breaking this out as its own component keeps CategoryGrid clean.
// When you have a repeated element inside a list, always extract
// it into its own component.

interface CategoryCardProps {
  category: Category;
}

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={`group relative flex flex-col justify-end rounded-2xl overflow-hidden border border-white/5 cursor-pointer aspect-[3/4] bg-[linear-gradient(160deg,#1a3a1f_0%,#0f2212_100%)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_8px_48px_rgba(0,0,0,0.65)] hover:border-green-mid/50`}
    >
      {/* Icon — large emoji centered at top */}
      {/* In Phase 2 replace with a real product photo */}
      <div className={`absolute top-0 left-0 right-0 h-[75%] flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300`}>
        {category.icon}
      </div>

      {/* Text overlay at the bottom */}
      <div className={`relative z-10 p-4 bg-[linear-gradient(to_top,rgba(0,0,0,0.7)_0%,transparent_100%)]`}>
        {/* Category name — underlined like in the PDF */}
        <span className={`block font-utility text-[15px] font-bold tracking-[2px] uppercase text-white underline underline-offset-[3px] mb-1`}>
          {category.name}
        </span>

        {/* Short description */}
        <p className="text-[11px] text-gray-light leading-[1.4]">
          {category.description}
        </p>
      </div>
    </Link>
  );
}
