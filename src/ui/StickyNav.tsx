// src/ui/StickyNav.tsx
//
// Sticky terminal command-list nav. Renders `$ goto [about] [skills] ...`
// pulling SECTIONS from the single source of truth — same const consumed by
// NotFound (404 sitemap fallback) so the two cannot drift.
//
// Layout (D-04 / D-05 / 01-UI-SPEC.md § Sticky nav layout):
//   - <header role="banner"> sticky top-0 z-10 spans full viewport width
//   - inner <nav aria-label="Primary"> row: flex flex-wrap items-center
//     gap-x-4 gap-y-2 px-6 py-3
//   - bottom border: 1px solid color-mix(--color-accent 20%, transparent)
//     (the ONE permitted opacity-derived accent variant in Phase 1)
//   - same container on mobile: flex-wrap pushes overflow to subsequent lines
//     (D-05 — wraps, no horizontal scroll, no hamburger)
//
// Source: 01-UI-SPEC.md § Sticky nav layout; 01-CONTEXT.md D-04, D-05

import { SECTIONS } from '../content/sections';
import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';

export function StickyNav() {
  return (
    <header
      role="banner"
      className={[
        'sticky top-0 z-10',
        'bg-bg',
        // Faint accent rule between nav and content.
        // Tailwind v4 supports color-mix via arbitrary value.
        'border-b border-b-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]',
      ].join(' ')}
    >
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3 font-mono"
      >
        <TerminalPrompt>
          <span className="text-fg">goto</span>
        </TerminalPrompt>
        {SECTIONS.map((s) => (
          <BracketLink key={s.id} href={`#${s.id}`}>
            {s.label}
          </BracketLink>
        ))}
      </nav>
    </header>
  );
}
