// src/lib/web3forms.test.ts
//
// Coverage for the Web3Forms POST helper:
//   1. Happy path: 200 + { success: true } → { ok: true }
//   2. 4xx/5xx response: returns { ok: false, diagnosticForLog: 'HTTP <status>' }
//   3. Network error: returns { ok: false, diagnosticForLog: <err.message> }
//   4. Missing access_key env var: returns { ok: false, diagnosticForLog: 'access_key not configured' }
//      and does NOT call fetch.
//   5. Request shape: URL, method, headers, body fields (access_key, name, email,
//      message, subject, from_name) all sent verbatim.
//
// Source: 04-CONTEXT.md D-10/D-11/D-12; 04-RESEARCH.md Pattern 7 + Pattern 9;
//         04-PATTERNS.md § ContactForm.test.tsx pattern;
//         04-UI-SPEC.md § Failure state (Pitfall 4 — diagnosticForLog dev-only)

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('submitContact (Web3Forms helper)', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', 'test-access-key-123');
    vi.stubEnv('VITE_FORM_ENDPOINT', 'https://api.web3forms.com/submit');
    fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('POSTs to the configured endpoint with JSON content-type and the canonical payload shape', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { submitContact } = await import('./web3forms');
    const result = await submitContact({
      name: 'Recruiter Name',
      email: 'recruiter@example.com',
      message: 'Hello, are you available for a SOC role?',
    });

    expect(result.ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.web3forms.com/submit');
    expect(init.method).toBe('POST');
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['Accept']).toBe('application/json');
    const body = JSON.parse(init.body as string);
    expect(body.access_key).toBe('test-access-key-123');
    expect(body.name).toBe('Recruiter Name');
    expect(body.email).toBe('recruiter@example.com');
    expect(body.message).toBe('Hello, are you available for a SOC role?');
    expect(body.subject).toBe('[Portfolio enquiry] from Recruiter Name');
    expect(body.from_name).toBe('Portfolio Contact Form');
  });

  it('falls back to "(name empty)" in subject when name is empty string', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const { submitContact } = await import('./web3forms');
    await submitContact({ name: '', email: 'a@b.co', message: 'm' });

    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(init.body as string);
    expect(body.subject).toBe('[Portfolio enquiry] from (name empty)');
  });

  it('returns { ok: false, diagnosticForLog: "HTTP 500" } on a 500 response', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: 'server boom' }), {
        status: 500,
      }),
    );

    const { submitContact } = await import('./web3forms');
    const result = await submitContact({ name: 'n', email: 'a@b.co', message: 'm' });

    expect(result.ok).toBe(false);
    expect(result.diagnosticForLog).toBe('HTTP 500');
  });

  it('returns { ok: false, diagnosticForLog: "HTTP 400" } on a 400 response', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('', { status: 400 }));

    const { submitContact } = await import('./web3forms');
    const result = await submitContact({ name: 'n', email: 'a@b.co', message: 'm' });

    expect(result.ok).toBe(false);
    expect(result.diagnosticForLog).toBe('HTTP 400');
  });

  it('returns { ok: false } when 200 response has success: false (Web3Forms rejected)', async () => {
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: false, message: 'rejected' }), {
        status: 200,
      }),
    );

    const { submitContact } = await import('./web3forms');
    const result = await submitContact({ name: 'n', email: 'a@b.co', message: 'm' });

    expect(result.ok).toBe(false);
  });

  it('returns { ok: false, diagnosticForLog: <err.message> } when fetch rejects', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('network unreachable'));

    const { submitContact } = await import('./web3forms');
    const result = await submitContact({ name: 'n', email: 'a@b.co', message: 'm' });

    expect(result.ok).toBe(false);
    expect(result.diagnosticForLog).toBe('network unreachable');
  });

  it('returns { ok: false, diagnosticForLog: "access_key not configured" } and skips fetch when env var is unset', async () => {
    vi.stubEnv('VITE_WEB3FORMS_KEY', '');
    vi.resetModules();

    const { submitContact } = await import('./web3forms');
    const result = await submitContact({ name: 'n', email: 'a@b.co', message: 'm' });

    expect(result.ok).toBe(false);
    expect(result.diagnosticForLog).toBe('access_key not configured');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('uses default endpoint https://api.web3forms.com/submit when VITE_FORM_ENDPOINT is unset', async () => {
    vi.stubEnv('VITE_FORM_ENDPOINT', '');
    vi.resetModules();
    fetchSpy.mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );

    const { submitContact } = await import('./web3forms');
    await submitContact({ name: 'n', email: 'a@b.co', message: 'm' });

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.web3forms.com/submit');
  });
});
