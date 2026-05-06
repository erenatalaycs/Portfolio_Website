// src/sections/Education.tsx
// Source: 01-UI-SPEC.md § Section headings — `$ cat education.md`

import { education } from '../content/education';
import { TerminalPrompt } from '../ui/TerminalPrompt';

export function Education() {
  return (
    <section id="education" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">cat education.md</span>
        </TerminalPrompt>
      </h2>
      <ul className="mt-3 text-fg text-base font-normal leading-relaxed font-mono">
        {education.length === 0 ? (
          <li className="text-muted">
            # Education entries pending — populated at content-fill checkpoint.
          </li>
        ) : (
          education.map((e, idx) => (
            <li key={`${e.institution}-${idx}`} className="mt-1">
              <span className="text-fg">{e.institution}</span> —{' '}
              <span className="text-fg">{e.credential}</span>{' '}
              <span className="text-muted">({e.date})</span>
              {e.honors && <span className="text-muted"> — {e.honors}</span>}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
