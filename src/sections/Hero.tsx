// src/sections/Hero.tsx
//
// Above-the-fold recruiter contract block. Renders synchronously; the four
// contact anchors MUST be in the React tree at first paint with no Suspense
// / lazy boundary above. (TXT-02 / RESEARCH.md Pattern 5.)
//
// Static `whoami` markup in Phase 1; Phase 3 (3D-07) wraps the same markup
// structure in a typing animation without rewriting it.
//
// Source: 01-UI-SPEC.md § Hero block; 01-CONTEXT.md D-02, D-03;
//   01-RESEARCH.md Pattern 5

import { identity } from '../content/identity';
import { assetUrl } from '../lib/baseUrl';
import { BracketLink } from '../ui/BracketLink';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { EmailReveal } from '../ui/EmailReveal';

export function Hero() {
  return (
    <section id="hero" className="pt-12 md:pt-16 pb-8 font-mono">
      <pre className="text-fg whitespace-pre-wrap text-xl font-semibold m-0">
        <TerminalPrompt>
          <span className="text-fg">whoami</span>
        </TerminalPrompt>
        {'\n'}
        {identity.name} — {identity.role} ({identity.location}){'\n'}
        <span className="text-accent motion-safe:animate-cursor-blink" aria-hidden="true">
          █
        </span>
      </pre>

      <pre className="text-fg whitespace-pre-wrap text-xl font-semibold mt-6 m-0">
        <TerminalPrompt>
          <span className="text-fg">links --all</span>
        </TerminalPrompt>
        {'\n'}
      </pre>

      <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-base font-normal">
        <BracketLink href={assetUrl(identity.cvFilename)} download>
          CV
        </BracketLink>
        <BracketLink href={identity.github} external>
          GitHub
        </BracketLink>
        <BracketLink href={identity.linkedin} external>
          LinkedIn
        </BracketLink>
        <EmailReveal encoded={identity.emailEncoded} />
      </p>
    </section>
  );
}
