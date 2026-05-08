// src/content/identity.ts
//
// Single source of truth for the public-identity record. Consumed by:
//   - src/sections/Hero.tsx       (recruiter contract)
//   - src/sections/Contact.tsx    (email + links)
//   - src/shells/TextShell.tsx    (footer GitHub link, indirectly via repo URL)
//   - Plan 06 / index.html        (JSON-LD Person, OG meta)
//
// The `emailEncoded` string is the rot13+base64 output of `npm run encode-email`.
// The plaintext NEVER appears in any committed source file. Plan 07's OPSEC
// checklist greps `dist/index.html` and `dist/assets/*.js` for the actual TLD
// to ensure obfuscation survives the build.
//
// The values below are HONEST PLACEHOLDERS — the schema is final, but each
// `TODO(checkpoint):` line marks a value Eren confirms or replaces at Plan 05's
// human-verify checkpoint (Task 3) before Plan 07 OPSEC sign-off.
//
// Source: 01-CONTEXT.md D-12; 01-UI-SPEC.md § Source-of-Truth Cross-Reference;
//   01-RESEARCH.md "Code Examples → Identity content type"

export interface Identity {
  name: string;
  role: string;
  location: string;
  github: string;
  linkedin: string;
  emailEncoded: string;
  cvFilename: string;
  /** Used by Plan 06 JSON-LD homeLocation.name */
  homeLocationLabel: string;
  /** OG image filename in public/assets/ */
  ogImageFilename: string;
  /** Phase 3 D-05 — drives the `$ status` line in <WhoamiGreeting>.
   *  Updateable as situation changes; Plan 03-07 fills the real value
   *  during D-20 content fill. */
  status: string;
}

export const identity: Identity = {
  name: 'Eren Atalay',
  role: 'Junior Cybersecurity Analyst',
  location: 'UK',
  // TODO(checkpoint): replace with real GitHub profile URL.
  github: 'https://github.com/erenatalaycs',
  // TODO(checkpoint): replace `handle-pending` with the real LinkedIn slug.
  // OPSEC checklist (Plan 07) verifies no `handle-pending` string remains in dist.
  linkedin: 'https://www.linkedin.com/in/handle-pending',
  // TODO(checkpoint): produced by `npm run encode-email -- '<your-real-email>'`.
  // Current value encodes a placeholder address so the build is green; replace
  // before Plan 07 OPSEC sign-off.
  emailEncoded: 'cmVyYS5uZ255bmwucXJpQHJrbnpjeXIucGJ6',
  cvFilename: 'Eren-Atalay-CV.pdf',
  homeLocationLabel: 'United Kingdom',
  ogImageFilename: 'og-image.png',
  // TODO(checkpoint): Plan 03-07 confirms the exact phrasing during D-20
  // content fill. Phase 3 default below matches D-05 lock.
  status: 'QA at Fin-On — studying Security+ — available for SOC analyst roles',
};
