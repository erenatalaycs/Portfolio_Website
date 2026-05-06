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
        {/* TODO(checkpoint): Eren replaces with the real about copy. */}
        <p>
          Junior Cybersecurity Analyst based in the UK. Recent graduate (summer 2025) currently
          working in QA / test on a fintech platform while transitioning into a SOC / blue-team
          role. Comfortable in Linux, Python, and the standard analyst toolchain — Wireshark for
          packet capture, Splunk for log review, nmap for surface mapping. Building a home lab
          (Splunk + pfSense + Wireshark) to practise detection engineering against synthetic
          traffic.
        </p>
        <p>
          Looking for a junior SOC analyst seat in the UK that&apos;ll trade my QA / test instincts
          (reproducibility, edge-case discipline, &quot;if it isn&apos;t documented it didn&apos;t
          happen&quot;) for hands-on incident-response and detection work.
        </p>
      </div>
    </section>
  );
}
