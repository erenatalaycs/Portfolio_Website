// src/app/App.tsx
//
// Phase 2 App: shell selector with capability gate, lazy 3D import,
// Suspense fallback to TextShell, and context-loss state lift.
//
// Decision tree (locked by 02-CONTEXT.md D-02 + UI-SPEC):
//   1. !isKnownPath()        → <NotFound />            (Phase 1)
//   2. contextLost === true  → <TextShell /><ContextLossBar />  (D-13)
//   3. ?view=3d              → <Suspense><ThreeDShell /></Suspense>  (D-02 — capability check SKIPPED)
//   4. ?view=text            → <TextShell />
//   5. (no view param)       → detectCapability().pass ? 3D : TextShell
//
// Source: 02-RESEARCH.md Pattern 1 (lazy + Suspense), Pattern 5 (context-loss state lift);
//         02-CONTEXT.md D-02, D-12, D-13; 02-UI-SPEC.md § ?view=3d URL bypass

import { lazy, Suspense, useEffect, useState } from 'react';
import { TextShell } from '../shells/TextShell';
import { NotFound } from '../ui/NotFound';
import { ContextLossBar } from '../ui/ContextLossBar';
import { useQueryParams, setQueryParams } from '../lib/useQueryParams';
import { useReducedMotion } from '../lib/useReducedMotion';
import { detectCapability } from '../lib/detectCapability';
import { BASE } from '../lib/baseUrl';

// Lazy import — Vite/Rollup auto-chunks this into dist/assets/ThreeDShell-*.js.
// DO NOT import ThreeDShell statically anywhere in this module — that would
// ship R3F to text-shell users (defeats the lazy-load contract — 3D-01).
const ThreeDShell = lazy(() => import('../shells/ThreeDShell'));

function isKnownPath(): boolean {
  const p = window.location.pathname;
  // Accept exactly the base, the base without trailing slash, or '/' (dev with no base).
  return p === BASE || p === BASE.slice(0, -1) || p === '/';
}

export default function App() {
  const params = useQueryParams();
  const reduced = useReducedMotion();
  const [contextLost, setContextLost] = useState(false);

  // Phase 1 behaviour preserved for text shell; 3D shell handles its own
  // focus via <FocusController> (Plan 03-03), so we MUST NOT clear the
  // ?focus= param here when view === '3d' — the controller is subscribed
  // to it.
  useEffect(() => {
    const focus = params.get('focus');
    if (!focus) return;
    if (params.get('view') === '3d') return;
    const el = document.getElementById(focus);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    const heading = el.querySelector<HTMLElement>('h2');
    heading?.focus({ preventScroll: true });
    setQueryParams({ focus: null });
  }, [params, reduced]);

  if (!isKnownPath()) return <NotFound />;

  // D-13: a webglcontextlost forces text shell + info bar regardless of
  // ?view. Plan 04 wires the actual <Canvas onCreated> listener that
  // calls setContextLost(true) via the onContextLost prop.
  if (contextLost) {
    return (
      <>
        <TextShell />
        <ContextLossBar />
      </>
    );
  }

  const view = params.get('view');

  // D-02: explicit ?view=3d skips capability check. User knows best.
  if (view === '3d') {
    return (
      <Suspense fallback={<TextShell />}>
        <ThreeDShell onContextLost={() => setContextLost(true)} />
      </Suspense>
    );
  }

  // D-02: explicit ?view=text always serves text shell.
  if (view === 'text') return <TextShell />;

  // No explicit view — capability check decides.
  const cap = detectCapability();
  if (cap.pass) {
    return (
      <Suspense fallback={<TextShell />}>
        <ThreeDShell onContextLost={() => setContextLost(true)} />
      </Suspense>
    );
  }
  return <TextShell />;
}
