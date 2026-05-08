// src/sections/About.tsx
// Source: 01-UI-SPEC.md § Section headings — `$ cat about.md`

import { TerminalPrompt } from '../ui/TerminalPrompt';

export function About() {
  return (
    <section id="about" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">cat about.md</span>
        </TerminalPrompt>
      </h2>
      <div className="mt-3 text-fg text-base font-normal leading-relaxed font-mono space-y-3">
        <p>
          Junior cybersecurity analyst based in the UK. Currently building Wazuh-based SIEM
          detections and investigating cloud + identity telemetry (Microsoft 365, Azure AD,
          Cloudflare) at PyramidLedger after a BSc in Computer Science at City, University of
          London. Final-year project applied supervised + unsupervised ML to network intrusion
          detection (90%+ F1 on CICIDS2017 — DDoS, PortScan).
        </p>
        <p>
          Open to SOC / detection-focused roles in the UK that trade my engineering instincts
          (reproducibility, telemetry-first thinking, &quot;if it isn&apos;t documented it
          didn&apos;t happen&quot;) for hands-on incident-response, threat-hunting, and detection
          work.
        </p>
      </div>
    </section>
  );
}
