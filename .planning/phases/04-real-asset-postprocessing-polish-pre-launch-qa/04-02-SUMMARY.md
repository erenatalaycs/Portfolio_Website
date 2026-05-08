---
phase: 04-real-asset-postprocessing-polish-pre-launch-qa
plan: 02
subsystem: ui
tags: [contact-form, web3forms, csp, honeypot, html5-validation, react-19, vitest, opsec]

# Dependency graph
requires:
  - phase: 01-foundation-2d-recruiter-grade-shell
    provides: BracketLink, TerminalPrompt, EmailReveal, identity.ts, obfuscate.ts, baseline CSP <meta>
  - phase: 03-content-integration-mdx-write-ups-camera-choreography
    provides: parity gate (TXT-06 / CNT-03 / Pitfall 8), real identity.ts values
provides:
  - submitContact() Web3Forms POST helper with redacted-error envelope
  - <ContactForm /> with idle/submitting/sent/failed states + honeypot silent abort
  - CSP <meta> extension allowing https://api.web3forms.com (connect-src + form-action)
  - <ContactForm /> mounted in src/sections/Contact.tsx (text shell)
  - .env.example documentation for VITE_WEB3FORMS_KEY + VITE_FORM_ENDPOINT
  - BracketLink button branch extended with optional type + disabled props
affects: [04-05 (3D-shell ContactForm mount), 04-03 (Contact "See also:" line for THM/HTB), 04-08 (Gmail/Outlook delivery verification)]

# Tech tracking
tech-stack:
  added: []  # zero new deps — Web3Forms is plain fetch; no SDK
  patterns:
    - "HTML5-only form validation (required + pattern + maxLength) — no zod, no react-hook-form"
    - "Honeypot silent-abort: bot-filled botcheck → success state without fetch (saves quota, defeats retry)"
    - "Redacted-error envelope: { ok, diagnosticForLog? } — UI hardcodes 'Network error.', diagnosticForLog only logged in import.meta.env.DEV"
    - "Per-form-state outer container layout (mt-6 p-6 border border-surface-1 rounded-none) for idle/sent/failed"
    - "Email validation onBlur (not onChange) — UI-SPEC: typing-while-validating reads as nagging"

key-files:
  created:
    - src/lib/web3forms.ts
    - src/lib/web3forms.test.ts
    - src/ui/ContactForm.tsx
    - src/ui/ContactForm.test.tsx
    - .env.example
  modified:
    - index.html
    - src/sections/Contact.tsx
    - src/ui/BracketLink.tsx

key-decisions:
  - "Honeypot field is type=text (UI-SPEC + CONTEXT D-11) — Web3Forms canonical example uses checkbox but only checks 'non-empty', so type=text matches the locked spec and gives a bot-friendlier surface for naive 'fill-every-text-input' bots"
  - "BracketLink button branch extended (not forked) — added optional `type` and `disabled` props; default type='button' preserves Phase 1/2 toggle/dismiss/retry contract verbatim. Backward compat verified: all 11 BracketLink tests still pass"
  - "Honeypot wrapper uses display:none (not visibility:hidden) — display:none removes from a11y tree entirely so screen readers never announce it; tabIndex=-1 + autoComplete=off are belt-and-braces for stylesheet-override or browser-autofill edge cases"
  - "diagnosticForLog gated on import.meta.env.DEV — production builds tree-shake out the console.warn call; recruiters never see HTTP status codes or server error strings (Pitfall 4 information disclosure)"
  - "Empty access_key short-circuits before fetch — saves a wasted network call and surfaces misconfiguration via the same 'Network error.' UX. Prevents the form from looking 'broken' when env var is missing in a misconfigured local dev env"
  - "Subject line falls back to '(name empty)' when name is blank — covers the edge case where a bot fills email/message but skips name, so Eren's inbox still sees a labeled subject"

patterns-established:
  - "Pattern: Web3Forms POST helper as single-source-of-truth lib/ module — ContactForm imports submitContact only; endpoint URL + payload shape + access_key handling all live in lib/web3forms.ts"
  - "Pattern: failure-state UX uses partial-redaction email (eren.atalay@…) for delivery confirmation, full <EmailReveal> for fallback — never re-leaks the obfuscated address that Phase 1 defends"
  - "Pattern: per-state outer container reused across idle/sent/failed branches — same mt-6 p-6 border classes, role='status' aria-live='polite' on success/failed for screen-reader announcement"
  - "Pattern: BracketLink as form-submit button via type='submit' + disabled — HTML5 native validation fires before onSubmit handler, fields preserve values during submitting state for retry"

requirements-completed: [CTC-01, OPS-05]

# Metrics
duration: 11 min
completed: 2026-05-08
---

# Phase 4 Plan 02: Web3Forms ContactForm (text-shell mount + CSP extension + tests) Summary

**Web3Forms-wired contact form with honeypot silent-abort, redacted-error envelope, HTML5-only validation, and CSP-extended cross-origin POST — text-shell mount complete; end-to-end Gmail/Outlook delivery deferred to Plan 04-08.**

## Performance

- **Duration:** 11 min
- **Started:** 2026-05-08T13:30:58Z
- **Completed:** 2026-05-08T13:42:06Z
- **Tasks:** 3
- **Files created:** 5
- **Files modified:** 3

## Accomplishments

- **CTC-01 ContactForm shipped** — `<ContactForm />` renders idle/submitting/sent/failed states with verbatim UI-SPEC copy. Honeypot `botcheck` (display:none + tabIndex=-1 + autoComplete=off) silently aborts on non-empty submission.
- **CSP Pitfall 3 mitigated** — `index.html` `<meta>` CSP extended with `https://api.web3forms.com` in BOTH `connect-src` and `form-action`. Verified: extension survives into `dist/index.html` post-build.
- **Pitfall 4 information-disclosure mitigated** — `submitContact()` returns `{ ok, diagnosticForLog? }`; `ContactForm` only renders hardcoded `Network error.`, with `diagnosticForLog` gated on `import.meta.env.DEV` console.warn (tree-shaken in production).
- **OPS-05 carried forward** — zero `mailto:` references in source, zero hCaptcha imports, zero new runtime deps. Acceptance grep verifies all three guards.
- **21 new tests** — 8 in `web3forms.test.ts` + 13 in `ContactForm.test.tsx`. Total project test count: 75 → still 100% passing.

## Task Commits

Each task was committed atomically:

1. **Task 1: web3forms POST helper + tests + CSP extension + .env.example** — `515c151` (feat)
2. **Task 2: ContactForm — 4 states + honeypot silent abort + tests** — `98a7442` (feat)
3. **Task 3: Mount ContactForm in Contact.tsx (text-shell wiring)** — `322e511` (feat)

## Files Created/Modified

### Created

- `src/lib/web3forms.ts` — `submitContact(payload)` POSTs to `import.meta.env.VITE_FORM_ENDPOINT ?? 'https://api.web3forms.com/submit'`. Returns `{ ok: true }` on 200+success:true, `{ ok: false, diagnosticForLog: 'HTTP <status>' }` on non-2xx, `{ ok: false, diagnosticForLog: <err.message> }` on network error, `{ ok: false, diagnosticForLog: 'access_key not configured' }` when `VITE_WEB3FORMS_KEY` is unset (skips fetch).
- `src/lib/web3forms.test.ts` — 8 tests: URL/method/headers/body shape, 200 happy path, 200+success:false (Web3Forms rejection), 4xx/5xx, network error, missing-env-var skip-fetch path, default endpoint fallback, name="" → '(name empty)' subject fallback.
- `src/ui/ContactForm.tsx` — Renders idle (form), submitting (form with disabled fields + `[Sending…]`), sent (terminal block: `$ message_sent` + `Delivered to eren.atalay@… — I'll reply within 48h.` + `[send another]`), failed (`[!]` + `$ message_failed` + `Network error. Try email instead: <EmailReveal>` + `[retry]`). Honeypot `botcheck` with `display: none` wrapper. Email validation on blur with `# invalid email` warn-amber.
- `src/ui/ContactForm.test.tsx` — 13 tests: idle render, heading + intro, hints + counter, honeypot DOM properties, counter live update, email blur invalid → error shown, email no-blur → no error, email re-blur valid → error hidden, honeypot abort (no fetch), happy path → success copy, [send another] clears fields, failure path → [!] + Network error. + [retry] (no HTTP 500 leak), [retry] preserves field values.
- `.env.example` — Documents `VITE_WEB3FORMS_KEY=` and `VITE_FORM_ENDPOINT=https://api.web3forms.com/submit`.

### Modified

- `index.html` — CSP `<meta>` extended verbatim per RESEARCH § CSP extension: `connect-src 'self' https://api.web3forms.com` and `form-action 'self' https://api.web3forms.com`. Surrounding HTML comment updated to reference Phase 4 CTC-01 + Pitfall 3.
- `src/sections/Contact.tsx` — Imported `<ContactForm>` and rendered below the existing email/GitHub/LinkedIn recruiter-fast-path strip. Header comment updated from "lands here" future-tense to "mounted below recruiter-fast-path strip" present-tense.
- `src/ui/BracketLink.tsx` — Extended button-branch type union with optional `type?: 'button' | 'submit'` (default `'button'`) and `disabled?: boolean`. Disabled state adds `disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline` classes. Backward-compatible: all 11 existing BracketLink tests pass unchanged. (See Deviations §1.)

## Decisions Made

See `key-decisions` in frontmatter — six decisions covering honeypot field type, BracketLink extension shape, display:none rationale, env-DEV gating of diagnostics, env-var-empty short-circuit, and subject-line fallback.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] BracketLink button branch missing `type` and `disabled` props**

- **Found during:** Task 2 (ContactForm.tsx authoring)
- **Issue:** Plan task 2 step 4 instructs `<BracketLink as="button" type="submit" disabled={submitting}>` but `BracketLink.tsx`'s button branch (Phase 2) only accepted `onClick`/`active`/`ariaPressed`/`ariaLabel` — both `type` and `disabled` were rejected by the TypeScript discriminated union. The form needs `type="submit"` so HTML5 native validation (`required` + `pattern=".+@.+\..+"`) fires before `onSubmit` runs, and `disabled={submitting}` so the user cannot double-click while a fetch is in flight (UI-SPEC § Disabled state during submit).
- **Fix:** Extended `BracketLinkButtonProps` with optional `type?: 'button' | 'submit'` (default `'button'` — preserves Phase 1/2 ViewToggle/CameraToggle/ContextLossBar contract verbatim) and `disabled?: boolean` (also optional — Phase 1/2 consumers unchanged). Render path adds `disabled` attribute and `disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline` classes when `disabled` is truthy. `onClick` made optional in the button branch (a submit button doesn't need it; the form's `onSubmit` is the handler).
- **Files modified:** `src/ui/BracketLink.tsx`
- **Verification:** All 11 existing `BracketLink.test.tsx` tests pass unchanged (backward compat). New ContactForm tests verify the submit button works (happy path + failure path + retry preserve, all using the BracketLink-rendered submit button). Typecheck + lint + format clean.
- **Committed in:** `98a7442` (Task 2 commit — bundled with ContactForm.tsx as the consumer)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Single backward-compatible component extension required to satisfy the plan's literal JSX. No scope creep, no new runtime deps, no design-system changes. The extension is reusable for any future bracket-styled form-submit button (e.g., 3D-shell mount in Plan 04-05).

## Issues Encountered

None — plan-level verification clean:

- `npm run typecheck` ✓
- `npm run lint` ✓
- `npm run format` ✓ (prettier did normalize a stylistic double-space between `…  —` to single space in success-state copy; functionally identical at HTML render — browsers collapse whitespace in JSX text nodes either way; not a copy regression)
- `npm run parity` ✓ (TXT-06 / CNT-03 / Pitfall 8 all green — adding `<ContactForm />` does not touch the `id="contact"` anchor)
- `npm test` ✓ (75/75 — was 54, +21 new)
- `npm run build` ✓
- `npm run size` ✓ — text shell entry chunk **63.29 KB gz** (budget 120 KB, ample headroom; +0.18 KB gz vs. pre-plan baseline). 3D chunk 268.66 KB gz (budget 450 KB).
- `dist/index.html` post-build CSP extension verified: contains both `connect-src 'self' https://api.web3forms.com` AND `form-action 'self' https://api.web3forms.com`.
- `dist/` plaintext-email scan: **no plaintext `eren.atalay@pyramidledger` anywhere** in `dist/index.html` or any `dist/assets/*.js` chunk (Phase 1 OPSEC carry-over preserved). The partial-redaction `eren.atalay@…` (literal U+2026) does ship in the bundle as designed.

## User Setup Required

External Web3Forms account configuration required for end-to-end delivery (see Plan 04-08). For dependency awareness:

1. **Sign up at https://web3forms.com** → dashboard issues an access key per form. Free tier 250 submissions/month (per CLAUDE.md citation; Eren verifies live at Plan 04-08).
2. **Set notification email** to `eren.atalay@…` so submissions land in the right inbox: Web3Forms dashboard → Form Settings → Notification Email.
3. **Set repo Variable** in GitHub Settings → Secrets and variables → Actions → Variables → `VITE_WEB3FORMS_KEY=<key>`. (Path A from RESEARCH Pattern 9 — preferred over `.env`-committed because rotation requires only a Settings UI edit, not a git commit.) The key is **PUBLIC by design** per docs.web3forms.com — not a secret. Plan 04-07 deploy.yml will reference `${{ vars.VITE_WEB3FORMS_KEY }}` at build time.
4. **Create local `.env.local`** (gitignored) with the same key for `npm run dev` testing: `cp .env.example .env.local` and fill in `VITE_WEB3FORMS_KEY`. Plan 04-08 Task 3 verifies the dev → local fetch path.

End-to-end Gmail + Outlook delivery verification (Pattern 10 in RESEARCH) is `human_needed` — deferred to Plan 04-08.

## Threat Flags

None — no new security-relevant surface introduced beyond what the plan's `<threat_model>` already covers (T-04-02-01 through T-04-02-08 all addressed: information disclosure mitigated via dev-DEV gating + hardcoded UI copy, plaintext-email leak grep clean, CSP misconfiguration mitigated, honeypot field-name leak treated as accept per existing threat register).

## Self-Check

- [x] `src/lib/web3forms.ts` exists on disk
- [x] `src/lib/web3forms.test.ts` exists on disk
- [x] `src/ui/ContactForm.tsx` exists on disk
- [x] `src/ui/ContactForm.test.tsx` exists on disk
- [x] `.env.example` exists on disk
- [x] `index.html` modified (CSP extension)
- [x] `src/sections/Contact.tsx` modified (`<ContactForm />` mount)
- [x] `src/ui/BracketLink.tsx` modified (button branch extension)
- [x] Commit `515c151` (Task 1) in git log
- [x] Commit `98a7442` (Task 2) in git log
- [x] Commit `322e511` (Task 3) in git log
- [x] All 12 acceptance grep gates pass (10 positive + 2 negative)
- [x] All plan-level verification commands pass (build, CSP-in-dist, no-plaintext-email-in-dist, .env.example present)

## Self-Check: PASSED

## Next Phase Readiness

- **Plan 04-03 (CTC-03 + Live profiles + See-also shortcut):** Ready. The `<Contact />` section now has the form mounted; Plan 04-03 appends the `See also: [TryHackMe profile] [HackTheBox profile]` line BELOW the form, which is the planned ordering per UI-SPEC § Form mount-point integration.
- **Plan 04-05 (3D-shell ContactForm mount):** Ready. `<ContactForm />` is a single-source-of-truth shared component — Plan 04-05 imports it from `src/ui/ContactForm` and mounts it inside the 3D-shell center-monitor `<Html>` overlay. The form's intrinsic `mt-6 p-6` outer container fits inside the ~600px monitor width per UI-SPEC § ContactForm layout.
- **Plan 04-08 (Pre-launch QA + Gmail/Outlook delivery test):** Blocked on Eren's external Web3Forms account setup (see User Setup Required above). Once the access key is set as a repo Variable, Plan 04-08 Task 3 runs Pattern 10 protocol against the live deployed URL.
- **No blockers introduced** for parallel Plan 04-01 (real GLB asset pipeline) — distinct file scopes (3D scene vs. text-shell form).

---

*Phase: 04-real-asset-postprocessing-polish-pre-launch-qa*
*Plan: 02*
*Completed: 2026-05-08*
