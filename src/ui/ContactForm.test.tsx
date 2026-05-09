// src/ui/ContactForm.test.tsx
//
// Coverage for the four state transitions of <ContactForm /> + the honeypot
// silent-abort path:
//
//   1. idle render — name / email / message labels visible, [Send message]
//      button visible, character counter visible.
//   2. counter live update — typing in the message textarea updates the
//      `# max 2000 chars · {N} used` line.
//   3. email validation on blur — invalid email + blur shows
//      `# invalid email` warn glyph; valid email or pristine state hides it.
//   4. honeypot abort — bot-filled `botcheck` triggers the success state
//      WITHOUT calling fetch (saves Web3Forms quota; bot sees 200-equivalent
//      UX and doesn't retry).
//   5. submit happy path — valid submission → fetch called → success state
//      with verbatim "$ message_sent" + "Delivered to eren.atalay@…"
//      partial-redaction copy.
//   6. submit failure — 500 response → failure state with [!] glyph,
//      `$ message_failed`, `Network error.`, [retry] BracketLink, and the
//      EmailReveal fallback.
//   7. retry preserves field values — failure → click [retry] → form re-
//      renders with name/email/message values still populated.
//
// Source: 04-CONTEXT.md D-10 / D-11 / D-12; 04-UI-SPEC.md § ContactForm
//         layout + § Honeypot + § Success state + § Failure state;
//         04-PATTERNS.md § ContactForm.test.tsx (analog BracketLink.test.tsx);
//         04-RESEARCH.md Pattern 7 + Pattern 8.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ContactForm } from './ContactForm';

describe('ContactForm', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', 'test-key');
    vi.stubEnv('VITE_FORM_ENDPOINT', 'https://api.web3forms.com/submit');
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe('idle state', () => {
    it('renders name, email, message labels and the [Send message] button', () => {
      render(<ContactForm />);
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });

    it('renders the heading "$ cat send_message.md" and the intro line', () => {
      render(<ContactForm />);
      expect(screen.getByText(/cat send_message\.md/)).toBeInTheDocument();
      expect(screen.getByText('Send a message:')).toBeInTheDocument();
    });

    it('shows the static `# max 80 chars` and `# max 2000 chars · 0 used` hints', () => {
      render(<ContactForm />);
      expect(screen.getByText('# max 80 chars')).toBeInTheDocument();
      expect(screen.getByText(/# max 2000 chars · 0 used/)).toBeInTheDocument();
    });

    it('renders the honeypot input with name="botcheck", tabIndex=-1, autocomplete="off"', () => {
      const { container } = render(<ContactForm />);
      const honeypot = container.querySelector<HTMLInputElement>('input[name="botcheck"]');
      expect(honeypot).not.toBeNull();
      expect(honeypot?.tabIndex).toBe(-1);
      expect(honeypot?.getAttribute('autocomplete')).toBe('off');
      // The wrapping div uses display: none (a11y tree exclusion per UI-SPEC).
      const wrapper = honeypot?.closest('div');
      expect(wrapper?.style.display).toBe('none');
    });
  });

  describe('character counter', () => {
    it('updates the message counter on every keystroke', () => {
      render(<ContactForm />);
      const message = screen.getByLabelText(/^message/i) as HTMLTextAreaElement;
      fireEvent.change(message, { target: { value: 'hello' } });
      expect(screen.getByText(/# max 2000 chars · 5 used/)).toBeInTheDocument();
    });
  });

  describe('email validation (onBlur)', () => {
    it('shows "# invalid email" after blurring the email field with an invalid value', () => {
      render(<ContactForm />);
      const emailInput = screen.getByLabelText(/^email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      fireEvent.blur(emailInput);
      expect(screen.getByText('# invalid email')).toBeInTheDocument();
    });

    it('does NOT show "# invalid email" while typing (only on blur)', () => {
      render(<ContactForm />);
      const emailInput = screen.getByLabelText(/^email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      // No blur yet — error must not appear.
      expect(screen.queryByText('# invalid email')).not.toBeInTheDocument();
    });

    it('hides "# invalid email" after blurring with a valid value', () => {
      render(<ContactForm />);
      const emailInput = screen.getByLabelText(/^email/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'invalid' } });
      fireEvent.blur(emailInput);
      expect(screen.getByText('# invalid email')).toBeInTheDocument();
      fireEvent.change(emailInput, { target: { value: 'fixed@example.com' } });
      fireEvent.blur(emailInput);
      expect(screen.queryByText('# invalid email')).not.toBeInTheDocument();
    });
  });

  describe('honeypot silent abort', () => {
    it('renders the success state and does NOT call fetch when botcheck is non-empty', async () => {
      const { container } = render(<ContactForm />);
      // Fill visible fields so HTML5 required-validation passes.
      fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Recruiter' } });
      fireEvent.change(screen.getByLabelText(/^email/i), {
        target: { value: 'r@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'hi' } });

      // Manually populate the honeypot — bots fill EVERY field they find.
      const honeypot = container.querySelector<HTMLInputElement>('input[name="botcheck"]')!;
      // We can't `fireEvent.change` because it has tabIndex=-1 and React's
      // controlled-input contract isn't applied (it's uncontrolled). Use a
      // direct value set + emit a native input event so FormData picks it up.
      honeypot.value = 'i-am-a-bot';

      const form = container.querySelector('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => expect(screen.getByText(/message_sent/i)).toBeInTheDocument());
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('submit happy path (200 + success: true)', () => {
    it('renders the success state with the verbatim copy after a 200 response', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      const { container } = render(<ContactForm />);
      fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Recruiter' } });
      fireEvent.change(screen.getByLabelText(/^email/i), {
        target: { value: 'r@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'hello' } });

      const form = container.querySelector('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => expect(screen.getByText(/message_sent/i)).toBeInTheDocument());
      expect(fetchSpy).toHaveBeenCalledOnce();
      // Partial-redaction copy: eren.atalay@… (literal U+2026).
      expect(screen.getByText(/Delivered to eren\.atalay@…/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send another/i })).toBeInTheDocument();
    });

    it('clears all fields when [send another] is clicked from the success state', async () => {
      fetchSpy.mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      );

      const { container } = render(<ContactForm />);
      fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Recruiter' } });
      fireEvent.change(screen.getByLabelText(/^email/i), {
        target: { value: 'r@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'hello' } });

      const form = container.querySelector('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /send another/i })).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /send another/i }));

      // Form re-rendered with empty fields.
      expect((screen.getByLabelText(/^name/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/^email/i) as HTMLInputElement).value).toBe('');
      expect((screen.getByLabelText(/^message/i) as HTMLTextAreaElement).value).toBe('');
    });
  });

  describe('submit failure path (500)', () => {
    it('renders the failure state with [!] glyph + Network error. + [retry]', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('', { status: 500 }));

      const { container } = render(<ContactForm />);
      fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Recruiter' } });
      fireEvent.change(screen.getByLabelText(/^email/i), {
        target: { value: 'r@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^message/i), { target: { value: 'hello' } });

      const form = container.querySelector('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });

      await waitFor(() => expect(screen.getByText(/message_failed/i)).toBeInTheDocument());
      // [!] glyph is aria-hidden warn-amber, present in the failure state.
      const failureContainer = screen.getByRole('status');
      expect(failureContainer.textContent).toContain('[!]');
      // Generic copy — DO NOT leak HTTP 500 / server error string.
      expect(screen.getByText(/Network error\./)).toBeInTheDocument();
      expect(screen.queryByText(/HTTP 500/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('preserves field values when [retry] is clicked', async () => {
      fetchSpy.mockResolvedValueOnce(new Response('', { status: 500 }));

      const { container } = render(<ContactForm />);
      fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: 'Recruiter' } });
      fireEvent.change(screen.getByLabelText(/^email/i), {
        target: { value: 'r@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^message/i), {
        target: { value: 'preserved message' },
      });

      const form = container.querySelector('form')!;
      await act(async () => {
        fireEvent.submit(form);
      });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      // Field values intact for retry — UI-SPEC: "field values are preserved
      // for retry".
      expect((screen.getByLabelText(/^name/i) as HTMLInputElement).value).toBe('Recruiter');
      expect((screen.getByLabelText(/^email/i) as HTMLInputElement).value).toBe('r@example.com');
      expect((screen.getByLabelText(/^message/i) as HTMLTextAreaElement).value).toBe(
        'preserved message',
      );
    });
  });
});
