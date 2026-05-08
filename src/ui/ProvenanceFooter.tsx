// src/ui/ProvenanceFooter.tsx
//
// Auto-mounted at the bottom of every <WriteupView> (NOT included in MDX
// bodies — UI-SPEC § <ProvenanceFooter>). Reads frontmatter; renders
// # sources + # attack-techniques + # meta + optional disclaimer.
//
// Pitfall 7 mitigation: every write-up cites sources + ATT&CK techniques.
// Pitfall 8 mitigation: missing ATT&CK ids render a fallback so they are
// recruiter-visible (forces author discipline).
//
// Source: 03-RESEARCH.md Pattern 10c; 03-UI-SPEC.md § <ProvenanceFooter>
//         copy + color contract; 03-CONTEXT.md D-15

import { BracketLink } from './BracketLink';
import { ATTACK_TECHNIQUES } from '../content/attack-techniques';
import { identity } from '../content/identity';
import type { WriteupFrontmatter } from '../content/writeups';

interface ProvenanceFooterProps {
  frontmatter: WriteupFrontmatter;
}

export function ProvenanceFooter({ frontmatter }: ProvenanceFooterProps) {
  const { sources, attack_techniques, author, date, disclaimer } = frontmatter;
  return (
    <footer
      role="contentinfo"
      className="mt-12 pt-6 border-t font-mono text-base"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)',
      }}
    >
      <div className="space-y-2">
        <section>
          <h3 className="text-fg">
            <span className="text-muted"># </span>sources
          </h3>
          <ul className="space-y-1">
            {sources.map((s) => {
              const idx = s.indexOf(': ');
              const name = idx >= 0 ? s.slice(0, idx) : s;
              const url = idx >= 0 ? s.slice(idx + 2) : '';
              return (
                <li key={s}>
                  {url ? (
                    <BracketLink href={url} external>
                      {name}
                    </BracketLink>
                  ) : (
                    <span className="text-fg">{name}</span>
                  )}
                  {url && <span className="text-muted ml-2">{url}</span>}
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="text-fg">
            <span className="text-muted"># </span>attack-techniques
          </h3>
          <ul className="space-y-1">
            {attack_techniques.map((id) => {
              const name =
                ATTACK_TECHNIQUES[id] ?? '(unknown technique — add to attack-techniques.ts)';
              return (
                <li key={id}>
                  <BracketLink
                    href={`https://attack.mitre.org/techniques/${id.replace('.', '/')}/`}
                    external
                  >
                    {id}
                  </BracketLink>
                  <span className="text-muted ml-2">{name}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="text-fg">
            <span className="text-muted"># </span>meta
          </h3>
          <p className="text-muted">
            — {author ?? identity.name}, {date}
          </p>
          {disclaimer === 'home-lab' && (
            <p className="text-muted">
              <span className="text-muted"># </span>
              disclaimer: home lab — synthetic data, no live targets engaged
            </p>
          )}
        </section>
      </div>
    </footer>
  );
}
