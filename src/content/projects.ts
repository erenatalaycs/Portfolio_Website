// src/content/projects.ts
//
// Phase 1: 1-2 real GitHub repos + 1 honest 'in-progress' stub per D-13.
// Phase 3 expands to 3-5 with full provenance (CNT-03).
//
// Provenance rule: every tool/tech in skills.ts must have at least one
// project tagline (case-insensitive substring) or write-up frontmatter `tags:`
// entry that mentions it. The parity script (scripts/check-parity.mjs) enforces.
//
// Source: 01-CONTEXT.md D-13; 01-UI-SPEC.md § Project rows;
//   REQUIREMENTS.md "Out of Scope: Listing every tool ever opened…"

export type ProjectStatus = 'shipped' | 'in-progress' | 'planned';

export interface Project {
  /** URL-safe slug; e.g. 'home-lab' */
  slug: string;
  /** Single line, ≤ 80 chars; the em-dash-aligned text */
  tagline: string;
  status: ProjectStatus;
  /** GitHub repo URL or in-page anchor (#slug); omit if unset */
  href?: string;
}

export const projects: Project[] = [
  {
    slug: 'wazuh-siem',
    tagline:
      'Wazuh SIEM + correlation rules across Microsoft 365, Azure AD, Cloudflare on Linux at PyramidLedger',
    status: 'shipped',
  },
  {
    slug: 'ai-phishing-detection',
    tagline: 'AI-assisted phishing-detection tool — Python email-header analysis at PyramidLedger',
    status: 'in-progress',
  },
  {
    slug: 'ai-network-threat-detection',
    tagline:
      'ML IDS — Python + Scikit-learn + Pandas; 90%+ F1 on CICIDS2017 detecting DDoS + PortScan',
    status: 'shipped',
  },
  {
    slug: 'portfolio-website',
    tagline:
      'this site — terminal-styled React + Tailwind portfolio with 2D shell + 3D R3F workstation',
    status: 'in-progress',
    href: 'https://github.com/erenatalaycs/Portfolio_Website',
  },
];
