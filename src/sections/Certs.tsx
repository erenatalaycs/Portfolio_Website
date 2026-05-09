// src/sections/Certs.tsx
// Source: 01-UI-SPEC.md § Section headings + § Certifications;
//   04-UI-SPEC.md § Live profiles sub-list (Plan 04-03 CTC-03 mount).

import { certs } from '../content/certs';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { CertRow } from '../ui/CertRow';
import { LiveProfiles } from '../ui/LiveProfiles';

export function Certs() {
  return (
    <section id="certs" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">ls certs/</span>
        </TerminalPrompt>
      </h2>
      {certs.length === 0 ? (
        <p className="mt-3 text-muted text-base font-normal font-mono">
          # Certifications pending — populated at content-fill checkpoint.
        </p>
      ) : (
        <ul className="mt-3 text-base font-normal">
          {certs.map((c) => (
            <CertRow key={c.name} cert={c} />
          ))}
        </ul>
      )}
      {/* Phase 4 CTC-03 — live profiles sub-list. <LiveProfiles /> returns null
          when both URLs absent (CONTEXT D-13 fallback). */}
      <LiveProfiles />
    </section>
  );
}
