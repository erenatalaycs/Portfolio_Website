// src/content/sections.ts
//
// SINGLE SOURCE OF TRUTH for the section list. Consumed by:
//   - src/ui/StickyNav.tsx          (Plan 04)
//   - src/ui/NotFound.tsx           (Plan 06 — 404 sitemap fallback)
//   - (Phase 2) the 3D camera focus presets
// Never hardcode this list a second time.
//
// Education has its own anchor (`#education`) but is NOT in the sticky nav
// per UI-SPEC § Section headings (the nav lists exactly 6 destinations).
// Plan 05's Education section component owns its heading + anchor as local
// constants, not via this file.
//
// Source: 01-CONTEXT.md D-04, D-06, D-14; 01-UI-SPEC.md § Section headings

export const SECTIONS = [
  { id: 'about', label: 'about', heading: '$ cat about.md' },
  { id: 'skills', label: 'skills', heading: '$ ls skills/' },
  { id: 'projects', label: 'projects', heading: '$ ls projects/' },
  { id: 'certs', label: 'certs', heading: '$ ls certs/' },
  { id: 'writeups', label: 'writeups', heading: '$ ls writeups/' },
  { id: 'contact', label: 'contact', heading: '$ cat contact.md' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
