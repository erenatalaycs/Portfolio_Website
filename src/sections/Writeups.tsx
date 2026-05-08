// src/sections/Writeups.tsx
//
// Text-shell index of write-ups. Reads writeups[] (frontmatter only —
// does NOT mount MDX runtime; that's the lazy <WriteupsRoute>). Each
// row links to ?focus=writeups/<slug> — TextShell intercepts that URL
// and lazy-loads <WriteupsRoute> for the actual MDX render.
//
// Empty-state copy (UI-SPEC) preserved when writeups[] is empty.
//
// Source: 03-RESEARCH.md Pattern 7 Option A; 03-UI-SPEC.md §
//         <WriteupList>; 03-CONTEXT.md D-19

import { TerminalPrompt } from '../ui/TerminalPrompt';
import { BracketLink } from '../ui/BracketLink';
import { writeups, type WriteupType } from '../content/writeups';

const TYPE_MARKER: Record<WriteupType, string> = {
  detection: '[D]',
  cti: '[I]',
  'web-auth': '[W]',
};

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
      {writeups.length === 0 ? (
        <p className="mt-3 text-muted text-base font-normal font-mono">
          # No write-ups published yet — first lands during Phase 3.
        </p>
      ) : (
        <ul aria-label="Write-ups index" className="mt-4 flex flex-col gap-y-3 font-mono">
          {writeups.map((w) => (
            <li key={w.slug} className="text-base">
              <span className="text-accent">{TYPE_MARKER[w.type]}</span>
              {'  '}
              <BracketLink href={`?focus=writeups/${w.slug}`}>{w.title}</BracketLink>
              <div className="text-muted text-base mt-1" style={{ paddingLeft: '5ch' }}>
                {w.date} · {w.duration}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
