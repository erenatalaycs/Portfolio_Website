// vite.config.ts
// Source: 01-RESEARCH.md Pattern 1; vite.dev/guide/static-deploy
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Single source of truth for the GH Pages base path.
// If we ever move to a custom domain, change the literal here only.
export default defineConfig({
  base: '/Portfolio_Website/',
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false, // OPSEC — must be false; sourcemaps leak file paths
    target: 'es2022',
  },
});
