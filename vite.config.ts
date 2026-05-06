// vite.config.ts
// Source: 01-RESEARCH.md Pattern 1 (Phase 1 base config); 02-RESEARCH.md
//         Pattern 9 Option A (explicit chunk filenames for size-limit globs);
//         02-RESEARCH.md Pattern 1 (automatic chunking ONLY — manual-chunks
//         option must not be set; see Vite issue #17653).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Single source of truth for the GH Pages base path.
// If we ever move to a custom domain, change the literal here only.
//
// !! DO NOT ADD a manual-chunks declaration to rollupOptions.output !!
// Phase 2 ships a React.lazy boundary around ThreeDShell. A static
// manual-chunk entry forces those vendor bundles into the entry chunk,
// defeating capability-gated lazy-loading and blowing the size budget
// (Vite issue 17653 / 5189). The acceptance grep enforces this at CI.
export default defineConfig({
  base: '/Portfolio_Website/',
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false, // OPSEC — must be false; sourcemaps leak file paths
    target: 'es2022',
    rollupOptions: {
      output: {
        // Explicit (but Vite-default) filename patterns. The lazy-imported
        // <ThreeDShell> component (Plan 02-02) produces
        // dist/assets/ThreeDShell-[hash].js — Plan 02-05's size-limit glob
        // depends on this pattern.
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
