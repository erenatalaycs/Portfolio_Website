// vitest.config.ts
// Vitest 3 uses Vite 8's resolver; jsdom env is required for the hooks tests
// (matchMedia, popstate, history.replaceState).
//
// Source: 01-03-PLAN.md Task 1 Step 1.2; vitest.dev/config
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
  },
});
