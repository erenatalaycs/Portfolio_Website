// src/ui/TerminalPrompt.tsx
//
// The `$ ` prompt glyph + its command-text children. Used by:
//   - Hero (Plan 05): `$ whoami`, `$ links --all`
//   - StickyNav (this plan): `$ goto`
//   - Section headings (Plan 05): `$ cat about.md`, `$ ls projects/`, etc.
//   - NotFound (this plan): `$ cd /Portfolio_Website/<requested-path>`, `$ goto`
//
// The `$ ` glyph renders in accent green; children render in the caller's
// surrounding color (typically text-fg). Contract: a span wrapper so it can be
// used inline inside <pre>, <p>, <h2>, or other prompt-style containers.
//
// Source: 01-UI-SPEC.md § Color § Accent reserved for #1 (the $ prompt glyph)

import type { ReactNode } from 'react';

interface TerminalPromptProps {
  children: ReactNode;
  className?: string;
}

export function TerminalPrompt({ children, className }: TerminalPromptProps) {
  return (
    <span className={className}>
      <span className="text-accent">$ </span>
      {children}
    </span>
  );
}
