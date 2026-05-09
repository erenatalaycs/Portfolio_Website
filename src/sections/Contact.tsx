// src/sections/Contact.tsx
//
// Contact section. Phase 1: obfuscated email + GitHub + LinkedIn.
// Phase 4 CTC-01 contact form mounted below the recruiter-fast-path strip
// per UI-SPEC § Form mount-point integration. CTC-03 (TryHackMe + HackTheBox
// shortcut line) lands in Plan 04-03.
//
// Source: 01-UI-SPEC.md § Section headings + § Email obfuscation;
//         04-UI-SPEC.md § Form mount-point integration (text shell).

import { identity } from '../content/identity';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { BracketLink } from '../ui/BracketLink';
import { EmailReveal } from '../ui/EmailReveal';
import { ContactForm } from '../ui/ContactForm';

export function Contact() {
  return (
    <section id="contact" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">cat contact.md</span>
        </TerminalPrompt>
      </h2>
      <div className="mt-3 text-fg text-base font-normal leading-relaxed font-mono space-y-2">
        <p>Looking for a junior SOC / blue-team analyst role in the UK. Best paths to reach me:</p>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <EmailReveal encoded={identity.emailEncoded} />
          <BracketLink href={identity.github} external>
            GitHub
          </BracketLink>
          <BracketLink href={identity.linkedin} external>
            LinkedIn
          </BracketLink>
        </p>
        {/* Phase 4 CTC-01 — contact form mounted below the recruiter-fast-path strip. */}
        <ContactForm />
      </div>
    </section>
  );
}
