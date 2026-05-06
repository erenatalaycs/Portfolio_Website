// src/ui/EmailReveal.tsx
//
// Pre-click: button labeled `[email (click to reveal)]`.
// On click: revealEmail() decodes the rot13+base64 string, replaces the
// button with `<a href="mailto:decoded">[decoded]</a>`, writes to clipboard,
// and shows a muted `(copied)` toast for 1.5s.
//
// JS-disabled fallback: button stays inert. No raw `mailto:` ever appears in
// source HTML — the encoded prop is rot13(base64) so the plaintext only
// materialises after a user click runs JS.
//
// The reveal is one-way per pageview: once decoded, the button does not
// restore itself. A page refresh resets the state.
//
// Source: 01-UI-SPEC.md § Email obfuscation (TXT-04, hero `[email …]` button);
//   01-RESEARCH.md Pattern 7; 01-CONTEXT.md D-03

import { useState } from 'react';
import { revealEmail } from '../lib/obfuscate';

interface EmailRevealProps {
  /** rot13+base64 encoded email; produced by `npm run encode-email`
   *  and stored in src/content/identity.ts (Plan 05). */
  encoded: string;
}

export function EmailReveal({ encoded }: EmailRevealProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (email) {
    return (
      <span className="inline-flex items-baseline gap-2">
        <a
          href={`mailto:${email}`}
          className={[
            'inline-block py-2 px-3 -mx-1 align-baseline',
            'text-accent no-underline',
            'hover:underline hover:underline-offset-4 hover:decoration-accent',
            'focus-visible:underline focus-visible:underline-offset-4',
            'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
            'active:bg-accent active:text-bg',
          ].join(' ')}
        >
          [<span className="text-accent">{email}</span>]
        </a>
        {copied && (
          <span aria-live="polite" className="text-muted text-sm">
            (copied)
          </span>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const decoded = await revealEmail(encoded);
        setEmail(decoded);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className={[
        'inline-block py-2 px-3 -mx-1 align-baseline',
        'text-accent bg-transparent border-0 cursor-pointer font-mono',
        'hover:underline hover:underline-offset-4 hover:decoration-accent',
        'focus-visible:underline focus-visible:underline-offset-4',
        'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
        'active:bg-accent active:text-bg',
      ].join(' ')}
    >
      [<span className="text-accent">email (click to reveal)</span>]
    </button>
  );
}
