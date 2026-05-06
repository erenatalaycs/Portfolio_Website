#!/usr/bin/env node
// scripts/encode-email.mjs
//
// CLI helper: read a plaintext email from argv[2] (or stdin if absent) and
// print the rot13+base64 encoded form for paste into src/content/identity.ts.
//
// Usage:
//   npm run encode-email -- eren@example.com
//   echo "eren@example.com" | npm run encode-email
//
// The plaintext NEVER enters the shipped bundle — only the encoded result is
// committed to src/content/identity.ts (Plan 05).
//
// Source: 01-RESEARCH.md Pattern 7

function rot13(s) {
  return s.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

async function readStdin() {
  let data = '';
  for await (const chunk of process.stdin) data += chunk;
  return data.trim();
}

async function main() {
  const argEmail = process.argv[2];
  const plaintext = (argEmail ?? (await readStdin())).trim();
  if (!plaintext) {
    console.error('Usage: npm run encode-email -- <plaintext-email>');
    console.error('   or: echo "<plaintext-email>" | npm run encode-email');
    process.exit(1);
  }
  // rot13 then base64
  const encoded = Buffer.from(rot13(plaintext), 'utf8').toString('base64');
  console.log(encoded);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
