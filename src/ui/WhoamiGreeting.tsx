// src/ui/WhoamiGreeting.tsx
//
// Animated 3-prompt typing greeting on the center monitor's drei <Html
// transform> overlay. Reuses Phase 1's BracketLink + EmailReveal +
// TerminalPrompt — single source of truth for the 4 contact links (D-01).
//
// Sequence (D-05):
//   $ whoami            → identity.name — identity.role (identity.location)
//   $ status            → Currently: identity.status
//   $ links --all       → [CV]  [GitHub]  [LinkedIn]  [email]
//                          █  ← blinking cursor (1Hz; static when reduced)
//
// Timing (D-06): 30-40 ms / char on prompt lines (CHAR_MS=35 — middle of
// range); 200 ms inter-line pause; total ~5 s. Output lines render
// INSTANTLY when their preceding prompt completes (no synthetic typing on
// body content — anti-pattern carried from Phase 1 D-07).
//
// Reduced-motion (D-07 + UI-SPEC § Reduced-motion handling):
//   - initial state = final state (step=3, charIdx=0)
//   - useEffect early-returns; no setTimeout chain runs
//   - cursor blink disabled via Phase 1's motion-safe:animate-cursor-blink
//     class (CSS handles the gate; no extra JS branch)
//
// Cleanup on unmount: every setTimeout in the chain returns a cleanup
// that clearTimeout-s the id — prevents orphan setState warnings if the
// user toggles to text shell mid-typing.
//
// Source: 03-RESEARCH.md Pattern 13; 03-UI-SPEC.md § <WhoamiGreeting>;
//         03-CONTEXT.md D-05, D-06, D-07; Phase 1 src/sections/Hero.tsx

import { useEffect, useState } from 'react';
import { identity } from '../content/identity';
import { assetUrl } from '../lib/baseUrl';
import { BracketLink } from './BracketLink';
import { EmailReveal } from './EmailReveal';
import { TerminalPrompt } from './TerminalPrompt';
import { useReducedMotion } from '../lib/useReducedMotion';

const COMMANDS = ['whoami', 'status', 'links --all'] as const;
const CHAR_MS = 35;
const INTER_LINE_MS = 200;

interface WhoamiState {
  step: number;
  charIdx: number;
}

export function WhoamiGreeting() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<WhoamiState>(() =>
    reduced ? { step: COMMANDS.length, charIdx: 0 } : { step: 0, charIdx: 0 },
  );

  useEffect(() => {
    if (reduced) return;
    if (state.step >= COMMANDS.length) return;

    const cmd = COMMANDS[state.step];
    if (state.charIdx < cmd.length) {
      const id = window.setTimeout(() => {
        setState((s) => ({ ...s, charIdx: s.charIdx + 1 }));
      }, CHAR_MS);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => {
      setState({ step: state.step + 1, charIdx: 0 });
    }, INTER_LINE_MS);
    return () => window.clearTimeout(id);
  }, [state, reduced]);

  const sequenceDone = state.step >= COMMANDS.length;
  const renderPrompt = (i: number) =>
    state.step > i ? COMMANDS[i] : COMMANDS[i].slice(0, state.charIdx);

  return (
    <pre
      className="text-fg whitespace-pre-wrap text-base font-mono m-0"
      aria-label="Terminal greeting: identity, status, and contact links"
    >
      {/* Line 1: $ whoami → identity */}
      <TerminalPrompt>
        <span className="text-fg">{renderPrompt(0)}</span>
      </TerminalPrompt>
      {state.step >= 1 && (
        <>
          {'\n'}
          <span className="text-muted">eren@workstation:~$</span>
          {'\n'}
          {identity.name} — {identity.role} ({identity.location})
        </>
      )}

      {/* Line 2: $ status → status */}
      {state.step >= 1 && (
        <>
          {'\n\n'}
          <TerminalPrompt>
            <span className="text-fg">{renderPrompt(1)}</span>
          </TerminalPrompt>
        </>
      )}
      {state.step >= 2 && (
        <>
          {'\n'}
          Currently: {identity.status}
        </>
      )}

      {/* Line 3: $ links --all → 4 brackets */}
      {state.step >= 2 && (
        <>
          {'\n\n'}
          <TerminalPrompt>
            <span className="text-fg">{renderPrompt(2)}</span>
          </TerminalPrompt>
        </>
      )}
      {sequenceDone && (
        <>
          {'\n'}
          <BracketLink href={assetUrl(identity.cvFilename)} download>
            CV
          </BracketLink>
          {'  '}
          <BracketLink href={identity.github} external>
            GitHub
          </BracketLink>
          {'  '}
          <BracketLink href={identity.linkedin} external>
            LinkedIn
          </BracketLink>
          {'  '}
          <EmailReveal encoded={identity.emailEncoded} />
          {'\n'}
          <span className="text-accent motion-safe:animate-cursor-blink" aria-hidden="true">
            █
          </span>
        </>
      )}
    </pre>
  );
}
