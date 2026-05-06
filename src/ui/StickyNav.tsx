// src/ui/StickyNav.tsx
//
// DEPRECATED — Phase 2 promoted StickyNav into the shared <Header /> component
// that both shells render. New code MUST use <Header /> directly. This file
// remains as a thin compatibility shim; a future cleanup may delete it
// entirely once Phase 2 ships.
//
// Source: 02-UI-SPEC.md § Shared <Header> component (Phase 2 refactor);
//         02-RESEARCH.md Pattern 6

import { Header } from './Header';

/** @deprecated Use <Header currentView="text" /> directly. */
export function StickyNav() {
  return <Header currentView="text" />;
}
