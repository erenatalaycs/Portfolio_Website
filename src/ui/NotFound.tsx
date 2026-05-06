// src/ui/NotFound.tsx
//
// 404 page. Reuses SECTIONS (single source of truth) — sitemap fallback
// cannot drift from the live nav. Reuses BracketLink and TerminalPrompt.
//
// Renders the verbatim 404 copy from 01-UI-SPEC.md § Error / 404 state:
//
//   $ cd /Portfolio_Website/<requested-path>
//   bash: cd: <requested-path>: No such file or directory
//
//   Try one of:
//     $ goto [about] [skills] [projects] [certs] [writeups] [contact]
//
//   or [home]
//
// The bash error line uses text-negative — the ONLY Phase 1 use of the
// negative color (UI-SPEC § Color § Negative). The `<requested-path>` is
// derived from window.location.pathname with the BASE prefix stripped so
// the user sees what they typed (not the GH Pages base).
//
// Source: 01-UI-SPEC.md § Error / 404 state; 01-CONTEXT.md D-14;
//   01-RESEARCH.md Pattern 6

import { SECTIONS } from '../content/sections';
import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';
import { BASE } from '../lib/baseUrl';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function NotFound() {
  // Strip the BASE prefix so the user sees what they typed, not the GH Pages
  // prefix. SSR guard included for safety — Phase 1 has no SSR but the
  // typeof-window check makes the component render-safe in any future jsdom
  // SSR snapshot.
  const requested =
    typeof window !== 'undefined'
      ? window.location.pathname.replace(new RegExp('^' + escapeRegExp(BASE)), '/')
      : '/';

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-[72ch] px-4 md:px-6 py-12 font-mono">
      <pre className="text-fg whitespace-pre-wrap text-2xl font-semibold">
        <TerminalPrompt>
          <span className="text-fg">cd </span>
          <span className="text-fg">
            {BASE}
            {requested.replace(/^\//, '')}
          </span>
        </TerminalPrompt>
        {'\n'}
        <span className="text-negative">bash: cd: {requested}: No such file or directory</span>
      </pre>
      <p className="mt-6 text-fg text-base font-normal">Try one of:</p>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-normal">
        <TerminalPrompt>
          <span className="text-fg">goto</span>
        </TerminalPrompt>
        {SECTIONS.map((s) => (
          <BracketLink key={s.id} href={`${BASE}#${s.id}`}>
            {s.label}
          </BracketLink>
        ))}
      </p>
      <p className="mt-4 text-base font-normal">
        or <BracketLink href={BASE}>home</BracketLink>
      </p>
    </main>
  );
}
