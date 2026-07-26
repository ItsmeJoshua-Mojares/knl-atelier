// postcss.config.js
// ─────────────────────────────────────────────────────────────
// CONCEPT: PostCSS
//
// PostCSS is a tool that transforms your CSS using plugins.
// Tailwind CSS is actually a PostCSS plugin — it reads your
// HTML/TSX files, finds every Tailwind class you used, and
// generates the matching CSS rules.
//
// Without this file, Next.js doesn't know to run Tailwind
// on your CSS, so none of your bg-dark, text-green-mid, etc.
// classes would have any effect.
// ─────────────────────────────────────────────────────────────

module.exports = {
  plugins: {
    tailwindcss:  {},
    autoprefixer: {},
  },
};
