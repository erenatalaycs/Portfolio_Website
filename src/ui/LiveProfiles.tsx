// src/ui/LiveProfiles.tsx
//
// Phase 4 CTC-03 — TryHackMe + HackTheBox evidence-of-practice surface.
// Two named exports:
//   - <LiveProfiles />          → primary placement, sub-list inside <Certs />
//                                 ($ ls certs/live-profiles/ heading + rows)
//   - <LiveProfilesShortcut />  → secondary one-liner inside <Contact /> (See also:)
//
// Visibility rules (CONTEXT D-13):
//   - BOTH urls absent → component returns null (no heading, no rows)
//   - SINGLE url absent → that row omits; the other renders normally; the
//     heading still renders so the section anchor survives
//   - URL set without handle → the BracketLink renders without a @handle suffix
//
// External BracketLink contract (Phase 2 D-09): passing `external` auto-attaches
// `target="_blank" rel="noopener noreferrer"` — OPS-05 is satisfied automatically;
// CHECKLIST-LAUNCH (Plan 04-07) audits the bundle.
//
// Source: 04-CONTEXT.md D-13; 04-UI-SPEC.md § Live profiles sub-list layout
//   (lines 247-258, 419-440); 04-PATTERNS.md § LiveProfiles.tsx (lines 194-246);
//   04-RESEARCH.md Pattern 11 + Pattern 12.

import { identity } from '../content/identity';
import { TerminalPrompt } from './TerminalPrompt';
import { BracketLink } from './BracketLink';

export function LiveProfiles() {
  if (!identity.tryHackMeUrl && !identity.hackTheBoxUrl) return null;
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold font-mono text-fg">
        <TerminalPrompt>
          <span className="text-fg">ls certs/live-profiles/</span>
        </TerminalPrompt>
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {identity.tryHackMeUrl && (
          <li className="flex flex-wrap items-baseline gap-x-3 py-1 font-mono">
            <BracketLink href={identity.tryHackMeUrl} external>
              TryHackMe profile
            </BracketLink>
            {identity.tryHackMeHandle && (
              <span className="text-muted text-sm">@{identity.tryHackMeHandle}</span>
            )}
          </li>
        )}
        {identity.hackTheBoxUrl && (
          <li className="flex flex-wrap items-baseline gap-x-3 py-1 font-mono">
            <BracketLink href={identity.hackTheBoxUrl} external>
              HackTheBox profile
            </BracketLink>
            {identity.hackTheBoxHandle && (
              <span className="text-muted text-sm">@{identity.hackTheBoxHandle}</span>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}

export function LiveProfilesShortcut() {
  if (!identity.tryHackMeUrl && !identity.hackTheBoxUrl) return null;
  return (
    <p className="mt-6 flex flex-wrap items-baseline gap-x-2 text-fg font-mono">
      <span>See also:</span>
      {identity.tryHackMeUrl && (
        <BracketLink href={identity.tryHackMeUrl} external>
          TryHackMe profile
        </BracketLink>
      )}
      {identity.hackTheBoxUrl && (
        <BracketLink href={identity.hackTheBoxUrl} external>
          HackTheBox profile
        </BracketLink>
      )}
    </p>
  );
}
