// src/ui/ContactForm.tsx
//
// CTC-01 — the only new form in v1. Four states (idle / submitting / sent /
// failed) + honeypot silent abort. HTML5-only validation: `required` +
// `pattern=".+@.+\..+"` + `maxLength`. NO zod, NO react-hook-form, NO
// vee-validate. NO hCaptcha (CONTEXT D-11 picked honeypot — UI-SPEC §
// Anti-Pattern Audit explicitly rejects).
//
// Honeypot mechanics:
//   - Field name `botcheck` (Web3Forms canonical name).
//   - `display: none` on the wrapping div (NOT visibility:hidden — display:none
//     removes the field from the accessibility tree entirely; legitimate
//     humans never see, hear, or tab to it).
//   - On submit, if `botcheck` is non-empty: re-render the SUCCESS state
//     silently and DO NOT call fetch. Bots see a 200-equivalent UX and don't
//     retry; we save a Web3Forms quota slot per probe (defense-in-depth
//     against quota-exhaustion attacks).
//
// Failure-state copy is hardcoded "Network error." per UI-SPEC § Failure
// state. The server's actual error string is sent ONLY to dev console under
// `import.meta.env.DEV` (Pitfall 4 information disclosure mitigation). The
// success-state copy uses partial-redaction `eren.atalay@…` (literal U+2026)
// — never the full email; the failure state's email-fallback uses the
// existing Phase 1 <EmailReveal> obfuscation.
//
// Source: 04-CONTEXT.md D-10 / D-11 / D-12;
//         04-UI-SPEC.md § ContactForm + § Honeypot + § Success state +
//                       § Failure state + § Copywriting Contract;
//         04-PATTERNS.md § ContactForm.tsx (analogs: ContextLossBar, EmailReveal);
//         04-RESEARCH.md Pattern 7 + Pattern 8 + Pitfall 4.

import { useState, type FormEvent } from 'react';
import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';
import { EmailReveal } from './EmailReveal';
import { identity } from '../content/identity';
import { submitContact } from '../lib/web3forms';

type SubmitState = 'idle' | 'submitting' | 'sent' | 'failed';

const INPUT_BASE_CLASSES = [
  'bg-transparent text-fg font-mono',
  'border-0 border-b border-b-surface-1',
  'focus-visible:border-b-2 focus-visible:border-b-accent',
  'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2',
  'py-3 px-3',
  'disabled:opacity-60 disabled:cursor-not-allowed',
].join(' ');

export function ContactForm() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [emailError, setEmailError] = useState(false);

  const submitting = submitState === 'submitting';

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    // CONTEXT D-11 silent honeypot abort. Bots fill every field; legitimate
    // humans never see this one (display:none + tabIndex=-1 + autocomplete=off).
    if (data.get('botcheck')) {
      setSubmitState('sent');
      return;
    }

    setSubmitState('submitting');
    const result = await submitContact({ name, email, message });
    if (!result.ok && import.meta.env.DEV) {
      // Dev-only console diagnostic. UI shows "Network error." regardless
      // (Pitfall 4 — never leak the server's actual error string to users).
      console.warn('[ContactForm] submit failed:', result.diagnosticForLog);
    }
    setSubmitState(result.ok ? 'sent' : 'failed');
  }

  function handleEmailBlur(e: React.FocusEvent<HTMLInputElement>) {
    const value = e.currentTarget.value;
    // UI-SPEC § Form Validation Timing — only validate on blur (typing-while-
    // validating reads as nagging). Empty value is valid (the `required`
    // attribute handles that on actual submit).
    if (value === '') {
      setEmailError(false);
      return;
    }
    setEmailError(!/.+@.+\..+/.test(value));
  }

  function reset() {
    setName('');
    setEmail('');
    setMessage('');
    setEmailError(false);
    setSubmitState('idle');
  }

  function retry() {
    // UI-SPEC § Failure state — preserve field values for retry.
    setSubmitState('idle');
  }

  if (submitState === 'sent') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-6 p-6 border border-surface-1 rounded-none font-mono text-fg flex flex-col gap-2"
      >
        <h2 className="text-xl font-semibold">
          <TerminalPrompt>
            <span className="text-fg">message_sent</span>
          </TerminalPrompt>
        </h2>
        <p>Delivered to eren.atalay@… — I&apos;ll reply within 48h.</p>
        <BracketLink as="button" onClick={reset}>
          send another
        </BracketLink>
      </div>
    );
  }

  if (submitState === 'failed') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="mt-6 p-6 border border-surface-1 rounded-none font-mono text-fg flex flex-col gap-2"
      >
        <span aria-hidden="true" className="text-warn">
          [!]
        </span>
        <h2 className="text-xl font-semibold">
          <TerminalPrompt>
            <span className="text-fg">message_failed</span>
          </TerminalPrompt>
        </h2>
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span>Network error. Try email instead:</span>
          <EmailReveal encoded={identity.emailEncoded} />
        </p>
        <BracketLink as="button" onClick={retry}>
          retry
        </BracketLink>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate={false}
      className="mt-6 p-6 border border-surface-1 rounded-none font-mono flex flex-col gap-4"
    >
      <h2 className="text-xl font-semibold">
        <TerminalPrompt>
          <span className="text-fg">cat send_message.md</span>
        </TerminalPrompt>
      </h2>
      <p className="text-fg">Send a message:</p>

      <label className="flex flex-col gap-1">
        <span className="text-fg">
          name{' '}
          <span className="text-accent" aria-hidden="true">
            *
          </span>
        </span>
        <input
          name="name"
          type="text"
          required
          maxLength={80}
          value={name}
          disabled={submitting}
          onChange={(e) => setName(e.currentTarget.value)}
          className={INPUT_BASE_CLASSES}
        />
        <span className="text-muted text-sm"># max 80 chars</span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-fg">
          email{' '}
          <span className="text-accent" aria-hidden="true">
            *
          </span>
        </span>
        <input
          name="email"
          type="email"
          required
          pattern=".+@.+\..+"
          value={email}
          disabled={submitting}
          onChange={(e) => setEmail(e.currentTarget.value)}
          onBlur={handleEmailBlur}
          className={INPUT_BASE_CLASSES}
        />
        {emailError && <span className="text-warn text-sm"># invalid email</span>}
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-fg">
          message{' '}
          <span className="text-accent" aria-hidden="true">
            *
          </span>
        </span>
        <textarea
          name="message"
          required
          maxLength={2000}
          rows={6}
          value={message}
          disabled={submitting}
          onChange={(e) => setMessage(e.currentTarget.value)}
          className={`${INPUT_BASE_CLASSES} resize-y`}
        />
        <span className="text-muted text-sm"># max 2000 chars · {message.length} used</span>
      </label>

      {/* Honeypot — display: none removes from the a11y tree entirely
          (UI-SPEC § Honeypot). tabIndex=-1 keeps the field unreachable
          even if a stylesheet override re-displays it. autocomplete="off"
          prevents 1Password / Apple Keychain / Chrome saved-form data
          from accidentally populating it. */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label>
          Don&apos;t fill this out if you&apos;re human:
          <input name="botcheck" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <BracketLink as="button" type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send message'}
      </BracketLink>
    </form>
  );
}
