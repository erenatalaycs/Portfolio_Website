// src/lib/web3forms.ts
//
// Single source of truth for the Web3Forms POST endpoint, payload shape, and
// failure-envelope contract. No SDK is involved — Web3Forms is a plain HTTP
// API. The access key is PUBLIC by design (per docs.web3forms.com — "Don't
// worry this can be public") so it ships in the bundle via Vite's
// import.meta.env.VITE_* static replacement at build time.
//
// Failure shape: { ok: false, diagnosticForLog?: string }. The
// `diagnosticForLog` field exists ONLY for an `import.meta.env.DEV`-gated
// console.warn at the call site. The UI hardcodes "Network error." (per
// UI-SPEC § Failure state) and MUST NEVER render diagnosticForLog directly
// — leaking the server's actual error string is information disclosure
// (Pitfall 4 + UI-SPEC information-disclosure surface contract).
//
// Source: 04-CONTEXT.md D-10 / D-11 / D-12 (form fields + envelope shape);
//         04-RESEARCH.md Pattern 7 (POST contract verbatim) + Pattern 9
//         (env-var injection) + Pitfall 4 (error redaction);
//         04-UI-SPEC.md § Failure state (verbatim copy "Network error.")

const ENDPOINT_DEFAULT = 'https://api.web3forms.com/submit';

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormResult {
  ok: boolean;
  /** Generic — DO NOT surface the server's actual error string to the user
   *  (Pitfall 4 information disclosure). The UI shows "Network error." for
   *  every non-success branch; this field is only consumed by an
   *  `import.meta.env.DEV` console.warn at the call site. */
  diagnosticForLog?: string;
}

export async function submitContact(payload: ContactFormPayload): Promise<ContactFormResult> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (!accessKey) {
    return { ok: false, diagnosticForLog: 'access_key not configured' };
  }

  const endpoint = import.meta.env.VITE_FORM_ENDPOINT || ENDPOINT_DEFAULT;
  const subject = `[Portfolio enquiry] from ${payload.name || '(name empty)'}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: payload.name,
        email: payload.email,
        message: payload.message,
        subject,
        from_name: 'Portfolio Contact Form',
      }),
    });

    if (response.ok) {
      const json = (await response.json().catch(() => ({}))) as { success?: boolean };
      // Web3Forms returns 200 + { success: true } on accepted submissions.
      // A 200 with success: false is "rejected by Web3Forms" — treat as failure.
      return { ok: json.success === true };
    }

    return { ok: false, diagnosticForLog: `HTTP ${response.status}` };
  } catch (error) {
    return {
      ok: false,
      diagnosticForLog: error instanceof Error ? error.message : String(error),
    };
  }
}
