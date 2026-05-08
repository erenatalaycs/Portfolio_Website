// src/content/certs.ts
//
// Earned, in-progress, and planned certifications. In-progress entries MUST
// have a target month/year per D-10 ("studying since 2022 without a target"
// reads as drift).
//
// Date format: YYYY-MM (e.g. '2025-05'). The CertRow component formats this
// as 'Mon YYYY' at render time (e.g. 'May 2025') via Intl.DateTimeFormat.
//
// Source: 01-CONTEXT.md D-10; 01-UI-SPEC.md § Copywriting Contract → cert formats

export type CertStatus = 'earned' | 'in-progress' | 'planned';

export interface Cert {
  name: string;
  status: CertStatus;
  /** YYYY-MM. Mandatory for 'earned' and 'in-progress'. Forbidden for 'planned'. */
  date?: string;
}

export const certs: Cert[] = [
  { name: 'Google Cybersecurity Professional Certificate', status: 'earned', date: '2025-05' },
  { name: 'CompTIA A+ (Cyber Specialization)', status: 'earned', date: '2023-12' },
];
