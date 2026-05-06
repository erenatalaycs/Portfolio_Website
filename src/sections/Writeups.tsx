// src/sections/Writeups.tsx
//
// Phase 1 stub. Phase 3 (CNT-02) introduces the MDX pipeline + 2-3
// CTF/lab write-ups. The exact placeholder copy is locked by UI-SPEC.
//
// Source: 01-UI-SPEC.md § Empty/placeholder states; 01-CONTEXT.md D-11

import { TerminalPrompt } from '../ui/TerminalPrompt';

export function Writeups() {
  return (
    <section id="writeups" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">ls writeups/</span>
        </TerminalPrompt>
      </h2>
      <p className="mt-3 text-muted text-base font-normal font-mono">
        # No write-ups published yet — first lands during Phase 3.
      </p>
    </section>
  );
}
