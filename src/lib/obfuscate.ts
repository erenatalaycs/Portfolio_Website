// src/lib/obfuscate.ts
//
// Email obfuscation utility. JS-decoded; raw `mailto:` never appears in
// source HTML.
//
// Algorithm: rot13 + base64.
//   - rot13 alone is too well-known; bots scan for ROT13(mailto).
//   - base64 alone is the second most-scanned obfuscation.
//   - Combining them (rot13 first, then base64) defeats single-pass naive scanners.
//   - Both are reversible without secrets — this is anti-scrape, NOT encryption.
//
// The encoded string is produced at content-population time by
// `npm run encode-email` (scripts/encode-email.mjs) and stored in
// src/content/identity.ts as `emailEncoded` (Plan 05). The plaintext NEVER
// appears in the shipped JS bundle.
//
// Source: 01-RESEARCH.md Pattern 7; 01-CONTEXT.md D-03 / TXT-04;
//   01-UI-SPEC.md § Email obfuscation

/** ROT13 cipher: rotates A-Z and a-z by 13; everything else passes through. Involution: rot13(rot13(s)) === s. */
export function rot13(s: string): string {
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

/** Decode the rot13+base64 encoded string back to plaintext. */
export function decodeEmail(encoded: string): string {
  // base64 decode → rot13 unscramble → plaintext
  return rot13(atob(encoded));
}

/**
 * Decode the encoded email and best-effort write to the clipboard.
 * Resolves to the decoded address. Clipboard failure is silent (JS-disabled
 * fallback path keeps the button visible but inert; this function is only
 * called from a click handler when JS is running).
 */
export async function revealEmail(encoded: string): Promise<string> {
  const email = decodeEmail(encoded);
  try {
    await navigator.clipboard?.writeText(email);
  } catch {
    /* clipboard blocked — non-fatal */
  }
  return email;
}
