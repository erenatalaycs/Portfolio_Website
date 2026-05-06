// src/content/projects.ts
//
// Phase 1: 1-2 real GitHub repos + 1 honest 'in-progress' stub per D-13.
// Phase 3 expands to 3-5 with full provenance (CNT-03).
//
// Provenance rule: every tool/tech in skills.ts must have at least one
// project or write-up demonstrating it. Don't list tools you haven't shipped.
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
  // Honest in-progress stub per D-13. Eren may refine the tagline at the
  // Plan 05 checkpoint with whatever the home-lab actually runs today.
  {
    slug: 'home-lab',
    tagline: 'Splunk + pfSense + Wireshark home SOC, write-up planned',
    status: 'in-progress',
  },
  // This portfolio site itself — honest, in-progress, real repo URL.
  {
    slug: 'portfolio-website',
    tagline:
      'this site — terminal-styled portfolio with 2D recruiter shell + 3D workstation (Phase 2+)',
    status: 'in-progress',
    href: 'https://github.com/erenatalaycs/Portfolio_Website',
  },
];
