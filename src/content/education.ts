// src/content/education.ts
//
// Education entries. Eren is a summer-2025 graduate (PROJECT.md context).
//
// Source: 01-UI-SPEC.md § Section headings (Education has anchor #education,
//   heading `$ cat education.md`)

export interface EducationEntry {
  institution: string;
  credential: string;
  /** Free-form date range or single graduation date; e.g. "2022 — 2025" */
  date: string;
  /** Optional honors / classification, e.g. "First Class Honours" */
  honors?: string;
}

export const education: EducationEntry[] = [
  // TODO(checkpoint): Eren fills with the real institution + degree at the
  // Plan 05 checkpoint (Task 3). Schema below is final.
];
