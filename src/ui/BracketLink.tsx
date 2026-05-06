// src/ui/BracketLink.tsx
//
// The single source of truth for [bracket] anchors and toggle buttons.
//
// Phase 2 ADDS to the Phase 1 contract:
//   - `as?: 'a' | 'button'` (default 'a' — Phase 1 behaviour preserved)
//   - `active?: boolean` — persistent inversion (bg-accent text-bg) for toggle-active state
//   - `onClick?: (e) => void` — needed for buttons + retry-link
//   - `ariaLabel?: string` — for buttons whose visible label is a glyph (e.g. ×)
//   - `ariaPressed?: boolean` — for toggle-button pattern (D-09 / UI-SPEC ARIA)
//
// Phase 1 contract preserved verbatim for default 'a' branch (5 visual states).
//
// The `active` prop is for PERSISTENT inversion (UI-SPEC: "the active option
// uses inverted styling" — toggle buttons stay inverted while their value is
// the current state). The :active pseudo-class flash continues to fire for
// the click moment on non-active links; the `active` prop holds the styling
// for the duration of the URL state for active toggles.
//
// Source: 02-UI-SPEC.md § View toggle (D-09); 02-RESEARCH.md Pattern 6;
//         01-UI-SPEC.md § Anchor-link styling (5 states)

import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';

interface BracketLinkBaseProps {
  children: ReactNode;
  className?: string;
  /** Persistent inverted styling (bg-accent text-bg). For toggle-active state. */
  active?: boolean;
  /** Optional aria-label for buttons whose label is a glyph (e.g. ×). */
  ariaLabel?: string;
}

interface BracketLinkAnchorProps extends BracketLinkBaseProps {
  as?: 'a';
  href: string;
  external?: boolean;
  download?: boolean | string;
  onClick?: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
}

interface BracketLinkButtonProps extends BracketLinkBaseProps {
  as: 'button';
  onClick: (e: ReactMouseEvent<HTMLButtonElement>) => void;
  ariaPressed?: boolean;
  // explicitly: NO href, NO external, NO download (TS will reject these)
}

export type BracketLinkProps = BracketLinkAnchorProps | BracketLinkButtonProps;

function sharedClasses(active: boolean | undefined, extra: string | undefined): string {
  return [
    // Layout / hit-target — 44×44 via py-2 px-3, -mx-1 keeps visual gap tight.
    'inline-block py-2 px-3 -mx-1 align-baseline',
    // Color — bracket and label both accent green; inverted when active.
    active ? 'bg-accent text-bg no-underline' : 'text-accent no-underline',
    // Hover — underline label, accent-colored decoration. Active items don't underline on hover.
    active
      ? 'hover:no-underline'
      : 'hover:underline hover:underline-offset-4 hover:decoration-accent',
    // Focus-visible — same underline plus blue focus ring.
    'focus-visible:underline focus-visible:underline-offset-4',
    'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
    // Click flash — single-frame inversion for non-active links.
    active ? '' : 'active:bg-accent active:text-bg',
    // Reset default <button> styling so the button form renders identically to the anchor.
    'cursor-pointer bg-transparent border-0 m-0 font-mono text-base',
    extra ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function innerLabelClasses(active: boolean | undefined): string {
  return active ? 'text-bg' : 'text-accent';
}

export function BracketLink(props: BracketLinkProps) {
  if (props.as === 'button') {
    const { children, className, active, onClick, ariaLabel, ariaPressed } = props;
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        aria-pressed={ariaPressed}
        className={sharedClasses(active, className)}
      >
        [<span className={innerLabelClasses(active)}>{children}</span>]
      </button>
    );
  }

  // 'a' branch (default)
  const { href, children, external, download, className, active, onClick, ariaLabel } = props;
  const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  const downloadProp =
    download !== undefined ? { download: download === true ? '' : (download as string) } : {};

  return (
    <a
      href={href}
      {...externalProps}
      {...downloadProp}
      onClick={onClick}
      aria-label={ariaLabel}
      className={sharedClasses(active, className)}
    >
      [<span className={innerLabelClasses(active)}>{children}</span>]
    </a>
  );
}
