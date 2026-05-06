// src/content/certs.ts
//
// Earned, in-progress, and planned certifications. In-progress entries MUST
// have a target month/year per D-10 ("studying since 2022 without a target"
// reads as drift).
//
// Date format: YYYY-MM (e.g. '2025-05'). The CertRow component formats this
// as 'Mon YYYY' at render time (e.g. 'May 2025') via Intl.DateTimeFormat.
//
// Phase 1 ships an empty list — the schema is the contract, the render
// shows the empty-state placeholder. Eren fills real cert data at the
// Plan 05 checkpoint (Task 3).
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
  // TODO(checkpoint): Eren replaces with real cert names + dates.
  // The placeholders below are illustrative ONLY of the expected shape; uncomment
  // and edit in place at the Plan 05 checkpoint. Plan 07 OPSEC re-verifies before
  // launch.
  // { name: 'CompTIA Security+',         status: 'earned',      date: '2025-05' },
  // { name: 'BTL1 (Blue Team Level 1)',  status: 'in-progress', date: '2026-07' },
  // { name: 'OSCP',                      status: 'planned' },
];
