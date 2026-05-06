// src/ui/BracketLink.tsx
//
// The single source of truth for [bracket] anchors. Used in:
//   - StickyNav (this plan)
//   - Hero (Plan 05) — hero contact links [CV] [GitHub] [LinkedIn]
//   - SkillTag-like usages (Plan 05) — non-interactive variants are separate primitives
//   - NotFound (this plan) — 404 sitemap fallback + [home]
//   - Footer (Plan 05) — [GitHub] repo link
//
// Contract per 01-UI-SPEC.md § Anchor-link styling (5 states):
//   default:        bracket glyphs and inner label both text-accent, no underline
//   hover/focus:    inner label gains underline (decoration-accent, offset 4px)
//                   focus-visible adds a 2px outline-focus ring offset 2px
//   active (click): single-frame inversion: bg-accent text-bg
//   touch target:   ≥ 44×44 via py-2 px-3 -mx-1 (negative margin keeps visual gap tight)
//   external:       target="_blank" + rel="noopener noreferrer" — both or neither (OPSEC)
//
// Source: 01-UI-SPEC.md § Anchor-link styling, § Sticky nav layout (44×44)

import type { ReactNode } from 'react';

interface BracketLinkProps {
  href: string;
  children: ReactNode;
  /** External link → opens in new tab with rel="noopener noreferrer" (OPSEC mandatory). */
  external?: boolean;
  /** Anchor download attribute (e.g. for the CV PDF). */
  download?: boolean | string;
  /** Optional className extension for callers. */
  className?: string;
}

export function BracketLink({ href, children, external, download, className }: BracketLinkProps) {
  // External: target + rel are emitted as a pair, never one without the other.
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const downloadProp =
    download !== undefined ? { download: download === true ? '' : (download as string) } : {};

  return (
    <a
      href={href}
      {...externalProps}
      {...downloadProp}
      className={[
        // Layout / hit-target — 44×44 via py-2 px-3, -mx-1 keeps visual gap tight
        'inline-block py-2 px-3 -mx-1 align-baseline',
        // Color — bracket and label both accent green
        'text-accent no-underline',
        // Hover — underline label, accent-colored decoration
        'hover:underline hover:underline-offset-4 hover:decoration-accent',
        // Focus-visible — same underline plus blue focus ring (UI-SPEC focus-ring spec)
        'focus-visible:underline focus-visible:underline-offset-4',
        'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
        // Active — single-frame inversion (the only permitted bg fill on a link in Phase 1)
        'active:bg-accent active:text-bg',
        className ?? '',
      ].join(' ')}
    >
      [<span className="text-accent">{children}</span>]
    </a>
  );
}
