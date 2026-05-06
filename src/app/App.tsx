// src/app/App.tsx
//
// Phase 1 App: TextShell-only on known paths, NotFound on unknown paths.
// Reads ?focus=<section> on mount and scrolls to that section's <h2>.
//
// Phase 2 will add the lazy <ThreeDShell /> branch here keyed off
// useQueryParams().get('view') === '3d' — keep this component's structure
// stable so the diff is small.
//
// Source: 01-RESEARCH.md "Code Examples → <App /> skeleton (Phase 1)";
//   01-CONTEXT.md D-06 (?focus= scroll behaviour with reduced-motion fallback)

import { useEffect } from 'react';
import { TextShell } from '../shells/TextShell';
import { NotFound } from '../ui/NotFound';
import { useQueryParams, setQueryParams } from '../lib/useQueryParams';
import { useReducedMotion } from '../lib/useReducedMotion';
import { BASE } from '../lib/baseUrl';

function isKnownPath(): boolean {
  const p = window.location.pathname;
  // Accept exactly the base, the base without trailing slash, or '/' (dev with no base).
  return p === BASE || p === BASE.slice(0, -1) || p === '/';
}

export default function App() {
  const params = useQueryParams();
  const reduced = useReducedMotion();

  // ?focus=projects → scroll to #projects after first paint, then clear the
  // param so refresh doesn't re-scroll.
  useEffect(() => {
    const focus = params.get('focus');
    if (!focus) return;
    const el = document.getElementById(focus);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    // Move keyboard focus to the heading.
    const heading = el.querySelector<HTMLElement>('h2');
    heading?.focus({ preventScroll: true });
    // Clear ?focus so a manual refresh doesn't re-trigger the scroll.
    setQueryParams({ focus: null });
  }, [params, reduced]);

  if (!isKnownPath()) return <NotFound />;
  return <TextShell />;
}
