# OPSEC Pre-Publish Checklist

> Run before every release that touches public/assets/, screenshots, the CV, or
> any user-facing text. CI enforces metadata strip; manual items are author-owned.

## Asset Metadata

- [ ] **[CI]** `exiftool -all= -P -overwrite_original public/assets/*` succeeded.
- [ ] **[CI]** Verify step passes — no Author / GPS* / CreatorTool / Software / DocumentID metadata in any file under `public/assets/`.
- [ ] CV PDF: opened in Preview / Adobe Reader; "Document Properties" shows no Author, Title, Subject, Producer beyond the generic exporter.
- [ ] OG image (`og-image.png`): no embedded XMP, no GPS, no software trace.

## Screenshot Review (full-resolution, manually)

- [ ] No IPv4 / IPv6 addresses visible (router admin pages, `ifconfig`/`ip addr` output, container IPs).
- [ ] No internal hostnames (`my-laptop.local`, employer-issued machine names, lab box names that hint at infrastructure).
- [ ] No browser tab titles revealing other employer / client / sensitive context.
- [ ] No file paths revealing the home directory (`/Users/erenatalay/...`, `C:\\Users\\...`).
- [ ] No password manager popups, no autofill suggestions, no recently-typed strings in URL bars.
- [ ] No Slack / Teams / Discord / email notifications captured in the corner.
- [ ] No live CTF flags. If a flag appears, redact with a SOLID BLACK BOX (not blur — blur is reversible).
- [ ] CTF write-up's box / event is closed (per platform rules) and write-ups are permitted.

## Source / Bundle

- [ ] No `console.log` / `console.debug` in shipped JS. Verify: `grep -rE "console\.(log|debug)" dist/assets/` returns nothing OR only the explicit `console.warn`/`console.error` we kept.
- [ ] No `<Stats>`, `<Perf>`, `leva` controls in production bundle (Phase 1 doesn't import these; verify on every release going forward).
- [ ] Sourcemaps disabled in `vite.config.ts` (`build.sourcemap: false`).
- [ ] `npm audit --production` returns no high/critical advisories.
- [ ] `npm ls` shows no unexpected dependencies (e.g., a transitive dep that pulls analytics).

## External Links

- [ ] Every external `<a target="_blank">` has `rel="noopener noreferrer"`. Verify: `grep -E 'target="_blank"' src/**/*.tsx | grep -v 'noopener noreferrer'` returns nothing.
- [ ] LinkedIn URL is the public profile URL, not a logged-in-state URL with tracking params.
- [ ] GitHub URL is the user profile, not a starred-from / search URL.

## Personal Information

- [ ] No home address. City / region only ("UK" or "London, UK").
- [ ] No personal phone number on the public site. Phone goes only on the downloaded CV PDF, if at all.
- [ ] No full date of birth. Year only is acceptable on the CV; nothing on the website.
- [ ] No employer NDA-covered details in any project description, write-up, or skills attestation.

## Email + Contact

- [ ] Email is JS-decoded only. `grep -rE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' dist/index.html` returns nothing matching the actual address (only the obfuscated `ENCODED_EMAIL` string is in the bundle).
- [ ] No raw `mailto:` in source HTML.
- [ ] Contact form (Phase 4) endpoint is a *public* URL — verify no real secrets are inlined.

## SEO + Meta

- [ ] `<title>` is "Eren Atalay — Junior Cybersecurity Analyst", not "Vite + React" or similar default.
- [ ] `<meta name="description">` is real, ≤155 chars.
- [ ] `og:image` URL is absolute (https://...) not relative.
- [ ] JSON-LD Person schema validates on https://validator.schema.org/.
- [ ] JSON-LD does NOT include the email field (would defeat obfuscation).

## Deploy Mechanics

- [ ] First-time only: GH Pages source is set to "GitHub Actions" (Settings → Pages → Source).
- [ ] CSP `<meta>` tag present in `index.html` (baseline) — Phase 1 ships a permissive CSP; Phase 4 tightens.
- [ ] `vite preview` smoke test passed locally before merge.
- [ ] Push-to-main triggered the workflow; deploy step succeeded; live site reflects the change within 2 minutes.

## Home-Lab / Architecture Diagrams (Phase 3+)

- [ ] Architecture diagrams sanitised: replace real IPs with RFC 1918 examples (`10.0.0.0/8`, `192.168.99.0/24`).
- [ ] Hostnames replaced with descriptive labels (`pfsense-fw`, not `pfsense.eren-home.lan`).
- [ ] No real ISP, no real router/modem make/model unless explicitly chosen for the writeup.

## Write-up Screenshots (Phase 3)

- [ ] **[CI]** `exiftool -all= -P -overwrite_original public/assets/writeups/<slug>/*.png` succeeded for every write-up's screenshot directory.
- [ ] **Manual full-resolution review** of every PNG in `public/assets/writeups/<slug>/`: no IPs, hostnames, employer terms, file paths, browser-tab titles, Slack/Teams notifications, live CTF flags. Redactions use a **solid black box** (NOT blur — blur is reversible).
- [ ] Each `<ScreenshotFrame>` in MDX carries the `[✓ sanitized]` badge automatically; verify it actually rendered in the deployed view (3D shell + text shell).
- [ ] CTI write-ups: VirusTotal screenshots redact submission email, side-pane history; ATT&CK Navigator only shows the public matrix; sandbox host IP/MAC redacted with a black box. JWT screenshots: tokens redacted (or use a clearly-fake placeholder); host bar shows only the generic PortSwigger lab URL.

## TXT-06 parity (Phase 3)

- [ ] **[CI]** `npm run parity` exits 0 (gates the `npm run build` chain). Three assertions covered: TXT-06 section parity, CNT-03 skills provenance, Pitfall 8 ATT&CK lookup completeness.
- [ ] **Manual** (every release): text shell renders all 7 SECTIONS (about, skills, projects, certs, writeups, contact + education anchor) with real content — no placeholder copy.
- [ ] **Manual** (every release): 3D shell monitors render the curated subset — Left=projects, Center=about/skills/whoami, Right=writeups. Deep-link `?focus=<id>` works in both shells (text-shell anchor scroll; 3D-shell camera animation).
- [ ] **Manual** (every release): every skill in `skills.ts` has a recruiter-defensible answer to "show me" — either a project tagline mentioning it or a write-up demonstrating it. CI enforces the substring match; you enforce the *truth* of the demonstration.

---

> Last updated: 2026-05-08 · checklist run before every release.
