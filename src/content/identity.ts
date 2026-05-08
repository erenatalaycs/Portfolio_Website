// src/content/identity.ts
//
// Single source of truth for the public-identity record. Consumed by:
//   - src/sections/Hero.tsx       (recruiter contract)
//   - src/sections/Contact.tsx    (email + links)
//   - src/shells/TextShell.tsx    (footer GitHub link, indirectly via repo URL)
//   - Plan 06 / index.html        (JSON-LD Person, OG meta)
//
// The `emailEncoded` string is the rot13+base64 output of `npm run encode-email`.
// The plaintext NEVER appears in any committed source file. The OPSEC checklist
// (.planning/CHECKLIST-OPSEC.md) greps `dist/index.html` and `dist/assets/*.js`
// for the actual TLD to ensure obfuscation survives the build.
//
// D-20 closed in Plan 03-07 — values below are real, not placeholders.
//
// Source: 01-CONTEXT.md D-12; 01-UI-SPEC.md § Source-of-Truth Cross-Reference

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
   *  Updateable as situation changes. */
  status: string;
}

export const identity: Identity = {
  name: 'Eren Atalay',
  role: 'Junior Cybersecurity Analyst',
  location: 'UK',
  github: 'https://github.com/erenatalaycs',
  linkedin: 'https://www.linkedin.com/in/eren-atalay/',
  emailEncoded: 'cmVyYS5uZ255bmwucGZAdHpudnkucGJ6',
  cvFilename: 'Eren-Atalay-CV.pdf',
  homeLocationLabel: 'United Kingdom',
  ogImageFilename: 'og-image.png',
  status: 'Cybersec Engineer at PyramidLedger — open to UK SOC roles',
};
