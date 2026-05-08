// src/ui/CenterMonitorContent.tsx
//
// Composition for the center monitor's <Html transform> overlay (D-04):
//   - sticky <WhoamiGreeting> at top (z-10, bg-bg) — stays visible as
//     user scrolls to read About + Skills below
//   - <About /> body                          — single source of truth
//   - <Skills /> tag list                     — single source of truth
//
// The sticky-inside-scroll-container pattern: <MonitorOverlay> (Plan 02)
// wraps THIS content in a `overflow-y-auto` div; `position: sticky` here
// anchors the WhoamiGreeting block to that scroll container's top, so
// the user's scroll keeps About + Skills accessible while identity-status
// remains pinned.
//
// bg-bg on the sticky div ensures no emissive bleed-through from the
// monitor's screen plane behind (UI-SPEC § Color anti-use).
//
// Source: 03-UI-SPEC.md § <CenterMonitorContent> composition (D-04);
//         03-RESEARCH.md Example 3; 03-CONTEXT.md D-04

import { WhoamiGreeting } from './WhoamiGreeting';
import { About } from '../sections/About';
import { Skills } from '../sections/Skills';

export function CenterMonitorContent() {
  return (
    <div className="space-y-6">
      <div className="sticky top-0 bg-bg z-10">
        <WhoamiGreeting />
      </div>
      <About />
      <Skills />
    </div>
  );
}
