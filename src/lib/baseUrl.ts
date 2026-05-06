// src/lib/baseUrl.ts
//
// Single import for the GH Pages base path. Every asset URL in JSX must
// use this constant — hardcoding `/assets/...` works in dev (where base = '/')
// but breaks in prod (where base = '/Portfolio_Website/').
//
// Vite statically replaces import.meta.env.BASE_URL at build time; the bracket
// form (import.meta.env['BASE_URL']) does NOT work — use the dot form only.
//
// Source: 01-RESEARCH.md Pitfall 1; vite.dev/guide/build

export const BASE: string = import.meta.env.BASE_URL;

/** Build an asset URL: assetUrl('Eren-Atalay-CV.pdf') → '/Portfolio_Website/assets/Eren-Atalay-CV.pdf' in prod. */
export function assetUrl(filename: string): string {
  return `${BASE}assets/${filename}`;
}
