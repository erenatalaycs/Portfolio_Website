// src/ui/ContextLossBar.tsx
//
// Info bar shown after webglcontextlost forces the App to swap from
// <ThreeDShell /> to <TextShell />. Sits as the first child of <main> in
// the text shell. Auto-dismisses after 8 seconds; [×] dismisses
// immediately; [retry 3D] reloads the page with ?view=3d for a fresh
// React tree (D-14, RESEARCH Pitfall 4 — relative href preserves base path).
//
// Copy is verbatim per UI-SPEC § Context-loss info bar (D-13). The UI-SPEC
// also enumerates a list of forbidden alternative copy variants (apologetic
// exclamations, technical jargon, 1995-era CTA phrasing); do NOT swap the
// body string for any of those. The existing copy is recruiter-friendly +
// terminal-aesthetic + non-technical, by design.
//
// Source: 02-UI-SPEC.md § Context-loss info bar (D-13); § <ContextLossBar>
//         layout; 02-CONTEXT.md D-13, D-14; 02-RESEARCH.md Pitfall 4

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { BracketLink } from './BracketLink';

const AUTO_DISMISS_MS = 8000;

export function ContextLossBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return undefined;
    const t = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [dismissed]);

  if (dismissed) return null;

  // D-14: full page reload with ?view=3d. Relative path computed from
  // window.location.pathname preserves GH Pages base prefix
  // /Portfolio_Website/ (RESEARCH Pitfall 4). The onClick handler
  // triggers the actual reload — the href= is for transparency
  // (visible in the status bar on hover) and as a fallback if JS is off.
  const triggerReload = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.assign(window.location.pathname + '?view=3d');
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        'bg-surface-1',
        'border-b border-b-[color-mix(in_srgb,var(--color-warn)_30%,transparent)]',
        'px-4 py-2 font-mono text-fg',
      ].join(' ')}
    >
      <div className="mx-auto max-w-[72ch] flex flex-wrap items-center gap-x-4 gap-y-1">
        <span aria-hidden="true" className="text-warn">
          [!]
        </span>
        <span>3D scene unavailable on this device. You&apos;re on the text shell.</span>
        <BracketLink href="?view=3d" onClick={triggerReload}>
          retry 3D
        </BracketLink>
        <BracketLink
          as="button"
          ariaLabel="Dismiss notification"
          onClick={() => setDismissed(true)}
        >
          ×
        </BracketLink>
      </div>
    </div>
  );
}
