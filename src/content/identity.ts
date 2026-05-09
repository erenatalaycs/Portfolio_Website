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
// Phase 4 CTC-03 (Plan 04-03) — adds four optional live-profile fields:
//   tryHackMeUrl, tryHackMeHandle, hackTheBoxUrl, hackTheBoxHandle
// Consumers: src/ui/LiveProfiles.tsx (<LiveProfiles /> + <LiveProfilesShortcut />).
// Visibility / fallback rules (CONTEXT D-13): if BOTH URLs are absent the
// entire LiveProfiles block omits; single-platform absence omits only that
// row. The Identity type keeps the four fields OPTIONAL so consumers must
// gate on truthiness before reading.
//
// Source: 01-CONTEXT.md D-12; 01-UI-SPEC.md § Source-of-Truth Cross-Reference;
//   04-CONTEXT.md D-13; 04-UI-SPEC.md § Live profiles sub-list layout

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
  /** Phase 4 CTC-03 — TryHackMe profile URL. Consumed by <LiveProfiles /> +
   *  <LiveProfilesShortcut />. Omit if no THM presence (CONTEXT D-13). */
  tryHackMeUrl?: string;
  /** Phase 4 CTC-03 — display handle, rendered as @{handle} in muted color
   *  next to the TryHackMe BracketLink. Optional even if URL is set. */
  tryHackMeHandle?: string;
  /** Phase 4 CTC-03 — HackTheBox profile URL. Consumed by <LiveProfiles /> +
   *  <LiveProfilesShortcut />. Omit if no HTB presence (CONTEXT D-13). */
  hackTheBoxUrl?: string;
  /** Phase 4 CTC-03 — display handle, rendered as @{handle} in muted color
   *  next to the HackTheBox BracketLink. Optional even if URL is set. */
  hackTheBoxHandle?: string;
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
  // Phase 4 CTC-03 — real handles supplied by Eren at execution time
  // (recorded in STATE.md "Phase 4 Human Decisions Captured" section).
  tryHackMeUrl: 'https://tryhackme.com/p/volvoxkill',
  tryHackMeHandle: 'volvoxkill',
  hackTheBoxUrl: 'https://app.hackthebox.com/users/1704641',
  hackTheBoxHandle: 'volvoxkill',
};
