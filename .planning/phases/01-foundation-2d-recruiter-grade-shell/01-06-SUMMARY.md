---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 06
subsystem: seo-and-static-meta
tags: [seo, favicon, manifest, json-ld, open-graph, csp, sitemap, og-image]

# Dependency graph
requires:
  - 01-01 (Vite + base path /Portfolio_Website/)
  - 01-05 (identity.ts feeds JSON-LD; obfuscate.ts holds the email so JSON-LD does not need it)
provides:
  - public/favicon.svg + public/favicon-32.png (terminal-aesthetic "EA" mark)
  - public/manifest.webmanifest (PWA manifest, BASE-prefixed)
  - public/robots.txt (allow all + sitemap pointer)
  - public/sitemap.xml (single-URL sitemap)
  - public/assets/og-image.png (1200×630 placeholder; Plan 07 swaps real screenshot)
  - index.html (full Phase-1 production head — title, description, canonical, OG, Twitter, CSP, JSON-LD Person)
affects: [plan-07-opsec, plan-07-pre-launch-checklist]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'JSON-LD Person schema via RESEARCH.md Pattern 9 (single Person record, no build-time injection — manual two-place sync between identity.ts and index.html documented as OPSEC checklist item)'
    - 'Pitfall 4 enforced: email field intentionally absent from JSON-LD (would defeat the rot13+base64 obfuscation)'
    - 'BASE-prefixed asset URLs for GH Pages /Portfolio_Website/'
    - 'PWA manifest as .webmanifest (per W3C spec) not .json — correct MIME-type filename'
    - 'Permissive baseline CSP via meta http-equiv; Phase 4 tightens with hashes/nonces'
    - 'OG image placeholder strategy (RESEARCH.md Pitfall 6) — file must exist for scrapers; Plan 07 OPSEC swaps in real screenshot before deploy'

key-files:
  created:
    - Portfolio_Website/public/favicon.svg
    - Portfolio_Website/public/favicon-32.png
    - Portfolio_Website/public/manifest.webmanifest
    - Portfolio_Website/public/robots.txt
    - Portfolio_Website/public/sitemap.xml
    - Portfolio_Website/public/assets/og-image.png
  modified:
    - Portfolio_Website/index.html

key-decisions:
  - 'JSON-LD Person schema omits email field per RESEARCH.md Pitfall 4 (email lives only in src/lib/obfuscate.ts as rot13+base64)'
  - 'OG image is a 1200×630 placeholder; Plan 07 OPSEC swaps in a real terminal-screenshot replacement before live deploy (Pitfall 6 strategy)'
  - 'sameAs array mirrors src/content/identity.ts placeholder URLs (handle-pending LinkedIn slug); Plan 07 OPSEC greps dist/ for handle-pending and FAILS if found'
  - 'Baseline CSP is permissive (style-src unsafe-inline) for Tailwind v4 inline-style emission; Phase 4 tightens to hashes/nonces'
  - 'favicon-32.png generated with Pillow + Menlo (Mac built-in font); rsvg-convert was available but Pillow path was used because it gives identical pixel output and avoids a temp file round-trip'
  - 'og-image.png generated with Pillow drawing the EA mark + role line on solid #0d1117; visibly NOT a real screenshot, exactly as Plan 07 expects (will be replaced)'
  - 'Task 3 (visual smoke test) DEFERRED-TO-PLAN-07 pre-launch checklist (same pattern as Plans 02 + 05) — visual/recruiter-facing verification belongs in the same session as OPSEC sign-off'

patterns-established:
  - 'Pattern: every static asset URL is BASE-prefixed at /Portfolio_Website/ in index.html; never rely on relative paths in head metadata'
  - 'Pattern: index.html is hand-authored, not template-generated. Two-place sync between identity.ts and index.html JSON-LD is a documented OPSEC checklist item'
  - 'Pattern: build/test scans dist/ for plaintext email (regex \\S+@\\S+\\.\\w+) and FAILS if any leak — guarantees obfuscation survives the build'

requirements-completed:
  - CNT-05  # SEO basics — OG, JSON-LD Person, real <title>, meta description, favicon
  - FND-04  # 404 page (Plan 04 implemented; this plan confirms reachability via dist/index.html → dist/404.html copy in CI — verified locally with cp + test -f)

# Metrics
duration: ~15min
completed: 2026-05-06
task_3_status: deferred-to-plan-07
---

# Phase 01 Plan 06: SEO Head, Favicon, Manifest, JSON-LD Summary

**STATUS: Tasks 1 + 2 complete and committed atomically. Task 3 (visual smoke test of head metadata + favicon + 404 page) DEFERRED-TO-PLAN-07 because all recruiter-facing visual verification (favicon-in-tab, OG card preview, validator.schema.org pass) belongs in the same pre-launch session as the OPSEC checklist. Mechanically everything is verified — JSON-LD parses, no plaintext email leaks, all dist/ files exist, all 5 gates green.**

Phase 1's recruiter-grade shell now ships a full SEO head — title, description (102 chars, ≤155 cap), canonical URL, Open Graph + Twitter cards (with `og:image:width/height`), JSON-LD `Person` schema, baseline CSP, favicon set (SVG + 32×32 PNG), PWA manifest, robots.txt, and sitemap.xml — so a recruiter sharing the GitHub Pages URL gets a properly rendered LinkedIn/Slack preview, search engines can index a single canonical URL, and the structured-data Person record makes "Eren Atalay — Junior Cybersecurity Analyst (UK)" machine-readable without ever publishing a plaintext email.

## Performance

- **Started:** 2026-05-06T15:14:26Z
- **Completed (auto tasks):** 2026-05-06T15:30:03Z (~15min wall-clock; one mid-run cancellation due to a parallel JSON validation racing a not-yet-written file, recovered cleanly)
- **Auto tasks:** 2 / 2 complete
- **Checkpoint:** 1 / 1 DEFERRED-TO-PLAN-07
- **Files created:** 6 (public/favicon.svg, public/favicon-32.png, public/manifest.webmanifest, public/robots.txt, public/sitemap.xml, public/assets/og-image.png)
- **Files modified:** 1 (index.html)

## Commits

- `61389a7`: feat(01-06): author favicon, manifest, robots, sitemap, og placeholder (Task 1 — 6 files)
- `96704b7`: feat(01-06): full SEO head + JSON-LD Person + favicon + manifest (Task 2 — 1 file)

## What Shipped

### Task 1 — Static assets (`61389a7`)

- **`public/favicon.svg`** (296 B) — Terminal-aesthetic "EA" mark in `#7ee787` on `#0d1117`, 32×32 viewBox so it scales to any tab size. Hand-authored; no editor metadata to strip.
- **`public/favicon-32.png`** (452 B) — PNG fallback rendered with Pillow + Menlo (built-in Mac font) so it pixel-matches the SVG at 32×32. Used by Safari versions that don't honour SVG favicons.
- **`public/manifest.webmanifest`** (619 B) — PWA manifest with BASE-prefixed `start_url`/`scope`/`icons` (`/Portfolio_Website/`), `theme_color: "#0d1117"`, `background_color: "#0d1117"`, `display: "standalone"`. Filename is `.webmanifest` (correct per W3C spec) not `.json`.
- **`public/robots.txt`** (92 B) — `User-agent: *` + `Allow: /` + sitemap pointer at `https://eren-atalay.github.io/Portfolio_Website/sitemap.xml`.
- **`public/sitemap.xml`** (257 B) — Single root URL entry with `<changefreq>monthly</changefreq>` and `<priority>1.0</priority>`. Phase 2/3 routes (`/cv`, `/projects/...`, `/writeups/...`) will be added when content stabilises.
- **`public/assets/og-image.png`** (23,262 B = ~23 KB, 1200×630) — Solid `#0d1117` background with green `EA — Eren Atalay` and `Junior Cybersecurity Analyst` text, rendered with Pillow. Marked **placeholder** — Plan 07 OPSEC swaps in a real terminal screenshot before live deploy (RESEARCH.md Pitfall 6 strategy: file must exist for scrapers, real screenshot replaces post-first-deploy).

### Task 2 — Full SEO head (`96704b7`)

`index.html` was replaced (Plan 01's minimal stub had only `<title>` + Vite entry + theme-color). The new head ships:

- **Title:** `Eren Atalay — Junior Cybersecurity Analyst` (matches D-14 voice + UI-SPEC role string).
- **Meta description:** "Eren Atalay — Junior Cybersecurity Analyst (UK). CV, projects, certifications, and home-lab write-ups." — 102 chars, well under the 155-char Google cutoff.
- **Canonical:** `https://eren-atalay.github.io/Portfolio_Website/` (a single canonical regardless of any future hash-fragment routes).
- **Color scheme:** `<meta name="color-scheme" content="dark">` + `<meta name="theme-color" content="#0d1117">` so iOS Safari and Android Chrome render their chrome to match D-09 palette.
- **Favicon links:** SVG primary + 32×32 PNG `rel="alternate icon"` fallback, both BASE-prefixed `/Portfolio_Website/...`.
- **Manifest link:** `<link rel="manifest" href="/Portfolio_Website/manifest.webmanifest">`.
- **Open Graph:** `og:type=website`, `og:title`, `og:description`, `og:url`, `og:image` (absolute URL), `og:image:width=1200`, `og:image:height=630` — LinkedIn / Slack / Discord preview ready.
- **Twitter card:** `summary_large_image` variant with title/description/image.
- **Baseline CSP via meta:** `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';` — `style-src 'unsafe-inline'` is required while Tailwind v4 emits inline `<style>` tags during build; Phase 4 tightens to hashes/nonces.
- **`html` element retains** `class="motion-safe:scroll-smooth"` from Plan 01 (UI-SPEC requires native smooth scroll gated by reduced-motion).
- **JSON-LD Person schema** (RESEARCH.md Pattern 9):
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Eren Atalay",
    "jobTitle": "Junior Cybersecurity Analyst",
    "url": "https://eren-atalay.github.io/Portfolio_Website/",
    "homeLocation": { "@type": "Place", "name": "United Kingdom" },
    "sameAs": [
      "https://github.com/eren-atalay",
      "https://www.linkedin.com/in/handle-pending"
    ],
    "image": "https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png"
  }
  ```
  **The `email` field is intentionally omitted** per RESEARCH.md Pitfall 4 — putting the address into JSON-LD would defeat the runtime obfuscation Plan 03 set up. The `sameAs` URLs use the same placeholder GitHub/LinkedIn handles that `src/content/identity.ts` exposes; Plan 07 OPSEC enforces real values before deploy and explicitly greps `dist/` for the `handle-pending` placeholder string.

## CI Gates (all green)

| Gate                  | Result | Notes                                                |
| --------------------- | ------ | ---------------------------------------------------- |
| `npx tsc --noEmit`    | PASS   | No type errors (only HTML + public/ changed)         |
| `npx eslint .`        | PASS   | `--max-warnings=0`                                   |
| `npx prettier --check`| PASS   | All files match formatting (after `--write` on index.html) |
| `npm test`            | PASS   | 14 tests across 3 files (obfuscate, useReducedMotion, useQueryParams) |
| `npm run build`       | PASS   | dist/index.html 3.42 KB (gzip 1.21 KB); JS 206.28 KB (gzip 64.05 KB) |

## Build-output verification (post-build, pre-clean)

| Check                                                   | Result   |
| ------------------------------------------------------- | -------- |
| `dist/index.html` contains `application/ld+json`        | PASS     |
| `dist/index.html` contains `"@type": "Person"`          | PASS     |
| `dist/index.html` contains `og:image`                   | PASS     |
| `dist/index.html` contains `theme-color`                | PASS     |
| `dist/index.html` contains `rel="canonical"`            | PASS     |
| `dist/favicon.svg` exists (296 B)                       | PASS     |
| `dist/favicon-32.png` exists (452 B)                    | PASS     |
| `dist/manifest.webmanifest` exists (619 B)              | PASS     |
| `dist/robots.txt` exists (92 B)                         | PASS     |
| `dist/sitemap.xml` exists (257 B)                       | PASS     |
| `dist/assets/og-image.png` exists (23,262 B)            | PASS     |
| `cp dist/index.html dist/404.html && test -f`           | PASS (mirrors Plan 02 CI workflow step) |
| Plaintext email scan (`grep -rE '[a-z0-9._%+-]+@[a-z0-9.-]+\\.(com|org|net|io|co|uk|gov|edu)' dist/`) | **NONE** — email lives only in obfuscated form, regex finds zero matches in static bundle |

## Bundle size delta vs Plan 05

| Artifact                       | Plan 05    | Plan 06    | Delta            |
| ------------------------------ | ---------- | ---------- | ---------------- |
| JS chunk (`dist/assets/index-*.js`) | 206 KB raw | 206,280 B (206.28 KB raw) | **0 bytes** — JS source unchanged; Plan 06 is HTML-only |
| Gzip JS                        | 63 KB      | 64.05 KB   | +1 KB rounding (no source change) |
| `dist/index.html`              | ~0.3 KB    | 3.42 KB    | +3.1 KB (the SEO head itself) |
| Static assets (`public/*` → `dist/*`) | 0 KB       | ~24.5 KB   | +24.5 KB (favicon SVG 296 B + favicon PNG 452 B + manifest 619 B + robots 92 B + sitemap 257 B + og-image 23,262 B) |
| Total `dist/`                  | ~500 KB    | 528 KB     | +28 KB (all new bytes are static metadata) |

**JS bundle: byte-for-byte unchanged.** Every Plan 06 byte is HTML/static-asset metadata that browsers fetch independently of the React app. Recruiters get social-card previews and PWA install prompts without paying any cost in app-load time.

## JSON-LD validation

The schema parses as valid JSON, contains all four required Schema.org Person fields (`@context`, `@type`, `name`, `url`), and includes the optional `jobTitle`, `homeLocation`, `sameAs`, `image`. Per the plan's acceptance-criteria python script:

```
JSON-LD valid; email field correctly absent.
```

A live validator pass at https://validator.schema.org/ cannot run from this CLI session — that round-trip is intentionally part of **Plan 07's pre-launch checklist** (same session as the OPSEC sign-off, since both require copying the deployed URL into a browser). Structurally the document is valid; the only post-deploy delta is whether the `sameAs` URLs resolve to real profiles (Plan 07 enforces real values before deploy).

## Deviations from Plan

None substantive — Tasks 1 and 2 shipped verbatim per the plan's `<action>` blocks. One minor formatting adjustment was applied:

**1. [Rule 3 — Tooling] Prettier reformatted `<meta name="description">` to a multi-line attribute layout**
- **Found during:** Task 2 gate run (`npx prettier --check` initially reported `index.html` needs reformatting)
- **Issue:** The plan's example head had `<meta name="description" content="..." />` on a single line; Prettier's HTML printer (default print-width 80) wraps long single-line attributes onto multiple lines (`name="..."` and `content="..."` each on their own line)
- **Fix:** Ran `npx prettier --write index.html` and accepted the multi-line layout. The plan's acceptance criterion `python3 ... re.search(r'name="description" content="...'` would have FAILED on the wrapped layout, but the plan's INTENT (description ≤ 155 chars) is satisfied — verified with a tolerant multi-line regex (`re.DOTALL`): `description ok (102 chars)`.
- **Files modified:** Portfolio_Website/index.html
- **Commit:** `96704b7`

This deviation is recorded for the planner to note in any future plans: HTML acceptance-criteria regexes must be Prettier-tolerant (use `\s+` between attributes, not literal spaces). No change in deliverable behaviour.

**2. [orchestrator add-on] Permissive baseline CSP via `<meta http-equiv>`**
- The orchestrator prompt instructed adding a baseline CSP not present in the plan. This is consistent with security-baseline best practice and does not contradict any plan acceptance criterion. Phase 4 will tighten the CSP with hashes/nonces.

## Deferred Items

### Task 3 — Visual smoke test of head metadata + favicon + 404 page (DEFERRED-TO-PLAN-07)

**What it is:** A `checkpoint:human-verify` task that asks Eren to:
1. Run `npm run build && npm run preview` and load `http://localhost:4173/Portfolio_Website/`
2. Confirm the favicon shows the green "EA" mark in the browser tab
3. Verify the page title reads "Eren Atalay — Junior Cybersecurity Analyst"
4. Paste the deploy URL into LinkedIn / Slack / Discord and confirm OG card renders
5. Run JSON-LD through https://validator.schema.org/ — confirm Person type, no email field
6. Navigate to `/Portfolio_Website/this-path-does-not-exist` and confirm 404 sitemap fallback (Plan 04 component)
7. Toggle DevTools `prefers-reduced-motion: reduce` and confirm static cursor + instant scroll
8. Tab through page from load — confirm focus order: skip-link → 6 nav brackets → 4 hero anchors → in-page anchors → footer

**Why deferred to Plan 07:** Plans 02 and 05 set the precedent — any visual/recruiter-facing verification that requires Eren to look at the live site (or LinkedIn preview) belongs in Plan 07's pre-launch checklist, where it can be done in one sitting alongside the OPSEC sign-off (replace placeholder GitHub/LinkedIn URLs with real ones, swap the og-image placeholder for a real screenshot, validate JSON-LD live, paste into LinkedIn composer, paste into Slack DM, paste into validator.schema.org). Splitting it across two sessions doubles context-switch cost without buying any safety. Plan 07 explicitly owns this verification; it is **not lost work** — it is **right-placed work** (mirrors Plan 05's deferral logic verbatim).

**What's already verified mechanically (without Eren's eyes):**
- All 6 static assets exist in `dist/` post-build with expected byte counts
- `dist/index.html` contains every required meta tag (JSON-LD, OG, Twitter, canonical, theme-color, favicon refs, manifest ref)
- JSON-LD parses as valid JSON, asserts all 11 plan-spec'd fields, confirms email absence
- No plaintext email regex match anywhere in `dist/` (regex `[a-z0-9._%+-]+@[a-z0-9.-]+\\.(com|org|net|io|co|uk|gov|edu)`)
- All 5 quality gates exit 0 (tsc, eslint, prettier, vitest, vite build)
- `cp dist/index.html dist/404.html && test -f` succeeds (mirrors Plan 02 CI step)
- HTML acceptance criteria all match (title, canonical, favicon refs, manifest ref, OG width/height, Twitter card, JSON-LD blocks, email absence, root div, entry script, lang, motion-safe class)

**What Plan 07 still needs Eren for:**
1. Live JSON-LD validator pass at validator.schema.org
2. LinkedIn post-composer preview check (real OG card render)
3. Real screenshot replacing og-image.png placeholder
4. Real GitHub URL (currently `eren-atalay` — verify it's actually Eren's handle)
5. Real LinkedIn URL (currently `handle-pending` placeholder)
6. Tab-favicon visual confirmation in 2+ browsers
7. 404 sitemap fallback visual smoke
8. Reduced-motion + keyboard-nav visual smoke

## TDD Gate Compliance

N/A — Plan 06 is `type: auto` (not TDD). The plan does not declare TDD gates; SEO/static-meta plans don't have a meaningful "RED test for HTML head" pattern that adds value beyond the build-output assertions already run as gates.

## Threat Flags

No new security-relevant surface introduced beyond what the plan's `<threat_model>` enumerated. T-06-01 (JSON-LD email leak) is mitigated as planned (email field absent + grep guard). T-06-02 (OG image EXIF) is mitigated by the placeholder being programmatically generated with no metadata; Plan 02's CI exiftool gate enforces this on every push. T-06-04 (JSON-LD/identity.ts drift) is documented as a Plan 07 OPSEC checklist item.

## Self-Check: PASSED

All claimed file paths verified to exist:
- `public/favicon.svg` — FOUND (296 B)
- `public/favicon-32.png` — FOUND (452 B)
- `public/manifest.webmanifest` — FOUND (619 B)
- `public/robots.txt` — FOUND (92 B)
- `public/sitemap.xml` — FOUND (257 B)
- `public/assets/og-image.png` — FOUND (23,262 B)
- `index.html` — FOUND (modified, 87 lines)
- `.planning/phases/01-foundation-2d-recruiter-grade-shell/01-06-SUMMARY.md` — FOUND (this file)

Both task commits exist in `git log --oneline -5`:
- `61389a7` (Task 1) — FOUND
- `96704b7` (Task 2) — FOUND

Plan 06 deliverables are complete pending Plan 07's visual smoke + OPSEC audit pass.
