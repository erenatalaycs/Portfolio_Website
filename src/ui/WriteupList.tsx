// src/ui/WriteupList.tsx
//
// Right-monitor index of write-ups (and text-shell ?focus=writeups
// counterpart by reuse). Renders `$ ls writeups/` heading + per-row
// type marker + title (BracketLink) + date · duration metadata.
//
// Type markers (UI-SPEC § <WriteupList>): [D] detection, [I] cti, [W] web-auth.
//
// Source: 03-UI-SPEC.md § <WriteupList>; 03-CONTEXT.md D-15, D-17

import { TerminalPrompt } from './TerminalPrompt';
import { BracketLink } from './BracketLink';
import { writeups, type WriteupType } from '../content/writeups';

const TYPE_MARKER: Record<WriteupType, string> = {
  detection: '[D]',
  cti: '[I]',
  'web-auth': '[W]',
};

export function WriteupList() {
  return (
    <section className="font-mono">
      <h2 className="text-xl font-semibold font-mono text-fg">
        <TerminalPrompt>
          <span className="text-fg">ls writeups/</span>
        </TerminalPrompt>
      </h2>
      {writeups.length === 0 ? (
        <p className="mt-3 text-muted text-base font-normal">
          # No write-ups published yet — first lands during Phase 3.
        </p>
      ) : (
        <ul aria-label="Write-ups index" className="mt-4 flex flex-col gap-y-3">
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
