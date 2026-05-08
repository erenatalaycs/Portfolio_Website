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
  {
    institution: 'City, University of London',
    credential: 'BSc Computer Science',
    date: '2022 — 2025',
  },
  {
    institution: 'Kaplan International College London',
    credential: 'Foundation Certificate in Science and Engineering',
    date: '2021 — 2022',
  },
];
