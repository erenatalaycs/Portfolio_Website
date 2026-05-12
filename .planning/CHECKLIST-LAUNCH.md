# Pre-Launch Checklist

> Owned by Phase 4 (Plan 04-07 created; Plan 04-08 fills). Run before
> tagging v1.0 release. Distinct from CHECKLIST-OPSEC.md which stays
> OPSEC-only. Phase 4 verification reads BOTH; both must be fully
> checked before milestone-complete.
>
> Items prefixed `**[CI]**` are auto-enforced by the build job in
> `.github/workflows/deploy.yml` (Plan 04-07) — a green CI run means
> the row's gate passed. Tick the box during sign-off as confirmation,
> not as the gate itself. Items without `**[CI]**` are author-owned
> manual checks.

## Lighthouse on Deployed URL (OPS-03 + CONTEXT D-17)

Manual median-of-3 is the OPS-03 sign-off source of truth (CONTEXT D-17).
The `lighthouse` job in `.github/workflows/deploy.yml` is advisory only
(`continue-on-error: true`) — its scores are an early-warning trend, not
the gate.

Warmup protocol (RESEARCH Pitfall 8): curl the deployed URLs once to
warm the GH-Pages CDN cache, sleep 5s, then run Lighthouse 3x in a
clean Chrome profile (incognito, no extensions, throttled to Slow-4G).
Median across runs is the score of record.

- [ ] Lighthouse on deployed text shell — Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90 — runs documented (3 runs, median):
  - URL: `https://erenatalaycs.github.io/Portfolio_Website/?view=text`
  - Run 1: Perf=__, A11y=__, BP=__, SEO=__
  - Run 2: Perf=__, A11y=__, BP=__, SEO=__
  - Run 3: Perf=__, A11y=__, BP=__, SEO=__
  - Median: Perf=__, A11y=__, BP=__, SEO=__
  - Verdict: PASS / FAIL
- [ ] Lighthouse on deployed 3D shell (advisory — see CONTEXT D-17) — no error / no blank page; numbers documented:
  - URL: `https://erenatalaycs.github.io/Portfolio_Website/?view=3d`
  - Run 1: Perf=__, A11y=__, BP=__, SEO=__
  - Run 2: Perf=__, A11y=__, BP=__, SEO=__
  - Run 3: Perf=__, A11y=__, BP=__, SEO=__
  - Median: Perf=__, A11y=__, BP=__, SEO=__
  - Notes: ___

## Bundle Hygiene

- [ ] **[CI]** Dev-helper strip — `dist/assets/*.js` does not contain `<Stats>`, `<Perf>`, `console.log`, `console.debug`, `leva`, `r3f-perf` (or all gated by `import.meta.env.DEV`, marked `// dev-only`).
- [ ] **[CI]** `npm audit --production --audit-level=high` returns no high or critical advisories.
- [ ] `npm ls` shows no unexpected dependencies (e.g. transitive deps that pull analytics).
- [ ] Bundle size budgets pass — `npx size-limit` reports text shell ≤120 KB gz, 3D chunk ≤450 KB gz, postprocessing chunk ≤100 KB gz, GLB workstation files within per-asset budgets.

## External Links

- [ ] **[CI]** Every `target="_blank"` in `dist/index.html` carries `rel="noopener noreferrer"`.
- [ ] **[CI]** Every `target="_blank"` in `dist/assets/*.js` carries `rel="noopener noreferrer"`.
- [ ] LinkedIn URL is the public profile URL, not a logged-in-state URL with tracking params.
- [ ] GitHub URL is the user profile (`https://github.com/<handle>`), not a starred-from / search URL. Username consistency reviewed (deferred-items.md tracks the `erenatalaycs` vs `eren-atalay` discrepancy from STATE.md).

## Security Headers

- [ ] **[CI]** CSP `<meta http-equiv="Content-Security-Policy">` present in `dist/index.html` and includes `https://api.web3forms.com` in `connect-src` (Pitfall 3 verification — ContactForm submit blocked silently in production without this).
- [ ] CSP `<meta>` includes `form-action 'self' https://api.web3forms.com`.
- [ ] Sourcemaps disabled in `vite.config.ts` (`build.sourcemap: false`).
- [ ] `frame-ancestors 'none'` in CSP (clickjacking defense).

## SEO + Sharing

- [ ] OG image (1200×630) verified — opens in browser at the deployed URL, dimensions correct, no GH-Pages-base-path 404:
  ```bash
  curl -I https://erenatalaycs.github.io/Portfolio_Website/assets/og-image.png
  # Expect 200 OK, content-type: image/png
  ```
- [ ] OG card preview verified by pasting deployed URL into LinkedIn DM compose AND Slack DM compose (manual visual check — preview renders with title, description, and image).
- [ ] OG image full-resolution OPSEC review (RESEARCH Pitfall 4 + CHECKLIST-OPSEC § Screenshot Review): no notification banners (Slack / Discord / Mail), no extension badges, no autofill suggestions, no `localhost` in URL bar, no employer-NDA content, no partial face / room reflection. If OG image is still the Phase 1 placeholder, swap in the real terminal screenshot before tagging v1.0.
- [ ] **[CI]** JSON-LD Person schema present in `dist/index.html` AND does NOT contain `"email"` field (Phase 1 OPSEC carry-over per Pitfall 4 + STATE.md `[Phase 1] Plan 01-06: JSON-LD Person omits email field`).
- [ ] JSON-LD Person schema validates on https://validator.schema.org/ — no errors, no warnings on required fields.
- [ ] `<title>` is `Eren Atalay — Junior Cybersecurity Analyst (UK)` (UI-SPEC verbatim).
- [ ] `<meta name="description">` is `Junior cybersecurity analyst from the UK — CV, projects, CTF write-ups, and a 3D hacker workstation portfolio.` (UI-SPEC verbatim, ≤155 chars).
- [ ] Canonical link tag points to `https://erenatalaycs.github.io/Portfolio_Website/` (post-Plan-04-04 host).

## Sitemap + Robots

- [ ] **[CI]** `dist/sitemap.xml` present, lists exactly 6 URLs (`/`, `/?view=3d`, and 4 `?focus=…` deep-links), each with `<loc>` and `<lastmod>` only (no `<changefreq>` / `<priority>` — Plan 04-04 dropped them).
- [ ] **[CI]** `dist/robots.txt` present, includes `Sitemap:` line pointing to the deployed sitemap.xml.
- [ ] Sitemap `<lastmod>` reflects the actual release date, not a stale placeholder.

## CTC-01 Web3Forms Verification (RESEARCH Pattern 10)

- [ ] Web3Forms account created; access key set in repo Variables (Settings → Secrets and variables → Actions → Variables → `VITE_WEB3FORMS_KEY`) — key matches `f2193ff4-…` per STATE.md Phase 4 D-4a.
- [ ] Web3Forms notification email set to `eren.atalay.cs@gmail.com` in the Web3Forms dashboard (STATE.md Phase 4 D-4b — cyber-specific address, NOT `pyramidledger`).
- [ ] Web3Forms domain restriction set to `erenatalaycs.github.io` (STATE.md Phase 4 D-4c — domain-locked rate-limit guard).
- [ ] Real submission tested end-to-end → arrived in **Gmail** inbox, NOT spam:
  - Date/time: __
  - Inbox / Spam: __
  - Reply-to set correctly (Reply target = submitter's email): __
- [ ] Real submission tested end-to-end → arrived in **Outlook/Hotmail** inbox, NOT spam:
  - Date/time: __
  - Inbox / Spam: __
  - Reply-to set correctly: __
- [ ] Subject line verified: arrives as `[Portfolio enquiry] from <Submitter Name>`.
- [ ] Honeypot manual test — fill `botcheck` via DevTools, click submit, confirm: success UI shows BUT no submission arrives in inbox (silent abort behavior from Plan 04-02).

## Reviews (CONTEXT D-15)

- [ ] Cyber peer review — Reviewer: ___, Date: ___, Verdict: ___, Notes: ___
- [ ] Non-cyber usability review — Reviewer: ___, Date: ___, Verdict: ___, Notes: ___

## Real-Device QA (OPS-04 + CONTEXT D-16) — RESEARCH Pattern 16 protocol

Per-device protocol (run in order):

1. Cold-load text shell on cellular (target <5s to interactive).
2. Reveal email by clicking the obfuscated address; copy to clipboard.
3. Submit a real test message via the ContactForm; verify it lands in the inbox row above.
4. Open `?view=3d` shell; verify 3D scene loads OR refuses gracefully (capability gate triggers text shell).
5. Scroll inside the 3D shell; verify no orientation lock / scroll trap.
6. Toggle prefers-reduced-motion ON (OS Accessibility settings) + reload; verify postprocessing / camera animation suppressed.
7. 30-min soak with 3D shell open in foreground; check for thermal throttling, WebGL context loss, or memory creep.

- [ ] iOS device — Model: ___, iOS version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___
- [ ] Android device — Model: ___, Android version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___
- [ ] (Optional) iPad — Model: ___, iPadOS version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___

## 3D-08 GLB Status (Plan 04-06)

Tick exactly one of the following two rows per CONTEXT D-04:

- [ ] Path A — Real GLB shipped within CONTEXT D-04 7-day timebox. Total `public/assets/workstation/*.glb` size: ___ KB. CC0 sources verified in `LICENSE.txt`. Visual emissive bloom confirmed in dev. Real-device readability confirmed in iOS + Android rows above.

OR

- [ ] Path B — Timebox expired; GLB scope DEFERRED to v1.1. 3D-08 marked PARTIAL (postprocessing in Plan 04-01 ships, GLB doesn't). V2-3D-01 promoted to first-class in v1.1 milestone.

---

> Last updated: 2026-05-11 · Run before v1.0 release. Companion to `.planning/CHECKLIST-OPSEC.md` (OPSEC-only). Phase 4 milestone-complete requires BOTH checklists fully ticked.
