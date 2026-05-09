---
phase: 04-real-asset-postprocessing-polish-pre-launch-qa
plan: 04
slug: seo-surfaces
subsystem: SEO + recruiter unfurl
tags: [seo, sitemap, robots, jsonld, opengraph, twitter, opsec, host-reconciliation]
status: complete
completed_at: 2026-05-09
duration: ~3min (post-orchestrator handoff)
tasks_completed: 3
tasks_total: 3
files_created: 0
files_modified: 3
requirements_completed:
  - OPS-05
  - CTC-03
dependency_graph:
  requires:
    - 04-CONTEXT-D-17-final
    - 04-UI-SPEC-SEO-surfaces
    - 04-RESEARCH-state-of-the-art
  provides:
    - canonical-gh-pages-host (eren-atalay.github.io)
    - six-URL sitemap (lastmod 2026-05-09)
    - aligned robots.txt + sitemap link
    - locked title + meta description verbatim from UI-SPEC
    - verified JSON-LD email-field omission (Phase 1 OPSEC carry-over)
  affects:
    - 04-07 CHECKLIST-LAUNCH (Lighthouse-CI URL must use canonical host)
    - 04-08 manual sign-off (OG image binary swap deferred — PNG ref unchanged)
tech_stack:
  added: []
  patterns:
    - canonical-host single-source (one host across all SEO surfaces)
    - sitemap minimal-payload (loc + lastmod only — changefreq/priority deprecated 2023)
key_files:
  created: []
  modified:
    - public/sitemap.xml
    - public/robots.txt
    - index.html
decisions:
  - host: D-17 final = eren-atalay.github.io (overrides existing erenatalaycs.github.io in 3 files in scope)
  - sitemap: 6 URLs in canonical order (/, /?view=3d, /?focus=projects, /?focus=writeups, /?focus=certs, /?focus=contact)
  - lastmod: uniform 2026-05-09 (all six entries; sitemap last modified together)
  - title: UI-SPEC verbatim with (UK) parenthetical suffix
  - description: UI-SPEC verbatim — 110 chars, mentions CTF write-ups + 3D hacker workstation explicitly
  - JSON-LD email: VERIFIED ABSENT (carry-over enforcement, not addition)
  - sameAs: LinkedIn handle-pending placeholder LEFT untouched (out-of-scope, deferred to follow-up)
  - sameAs: GitHub user URL (https://github.com/erenatalaycs) LEFT untouched (not a GH-Pages host)
metrics:
  commits: 2 (1 per task; Task 1 was the resolved checkpoint)
  build_status: green
  typecheck_status: green
  lint_status: green
  format_status: green
  tests: 54/54 passing
  acceptance_gates_status: all passing
---

# Phase 4 Plan 04: SEO Surfaces Summary

Locked the canonical GitHub Pages host across all SEO surfaces and aligned recruiter-facing copy verbatim with `04-UI-SPEC § SEO surfaces`. Replaced the 1-URL sitemap stub with the six-URL form, dropped the deprecated `<changefreq>` / `<priority>` tags, switched every `erenatalaycs.github.io` reference (in `index.html` + `public/sitemap.xml` + `public/robots.txt`) to `eren-atalay.github.io`, and verified the JSON-LD `Person` schema continues to omit the `email` field per Phase 1 OPSEC carry-over.

## What shipped

### `public/sitemap.xml` (Task 2 — commit `72f225c`)

Replaced the 1-URL stub with six entries, each `<loc>` + `<lastmod>` only (no deprecated `<changefreq>` / `<priority>`):

```xml
<url><loc>https://eren-atalay.github.io/Portfolio_Website/</loc><lastmod>2026-05-09</lastmod></url>
<url><loc>https://eren-atalay.github.io/Portfolio_Website/?view=3d</loc><lastmod>2026-05-09</lastmod></url>
<url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=projects</loc><lastmod>2026-05-09</lastmod></url>
<url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=writeups</loc><lastmod>2026-05-09</lastmod></url>
<url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=certs</loc><lastmod>2026-05-09</lastmod></url>
<url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=contact</loc><lastmod>2026-05-09</lastmod></url>
```

The XML comment uses prose phrasing (`Change-frequency and priority tags deprecated by Google in 2023 — omit.`) instead of literal `<changefreq>` / `<priority>` element strings, so the acceptance grep gate `! grep -E '<changefreq>|<priority>' public/sitemap.xml` does not false-positive on the comment text. (One iteration was needed during execution to fix this — initial comment used the literal tag names.)

### `index.html` + `public/robots.txt` (Task 3 — commit `1df6b33`)

**Title** — UI-SPEC verbatim, with `(UK)` suffix added:

```html
<title>Eren Atalay — Junior Cybersecurity Analyst (UK)</title>
```

**Meta description** — UI-SPEC verbatim, 110 chars (well under the 155 limit), explicitly mentions CTF write-ups and the 3D hacker workstation portfolio:

```html
<meta name="description"
  content="Junior cybersecurity analyst from the UK — CV, projects, CTF write-ups, and a 3D hacker workstation portfolio." />
```

**Host references swapped** — six in `index.html` + one in `public/robots.txt`:

| Surface | Field | New value |
|---------|-------|-----------|
| `index.html` | `<link rel="canonical">` | `https://eren-atalay.github.io/Portfolio_Website/` |
| `index.html` | `<meta property="og:url">` | `https://eren-atalay.github.io/Portfolio_Website/` |
| `index.html` | `<meta property="og:image">` | `https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png` |
| `index.html` | `<meta name="twitter:image">` | `https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png` |
| `index.html` | JSON-LD `url` | `https://eren-atalay.github.io/Portfolio_Website/` |
| `index.html` | JSON-LD `image` | `https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png` |
| `public/robots.txt` | `Sitemap:` | `https://eren-atalay.github.io/Portfolio_Website/sitemap.xml` |

**OG / Twitter copy mirrored** — `og:title` + `og:description` + `twitter:title` + `twitter:description` now mirror the new `<title>` + `<meta name="description">` verbatim.

**JSON-LD comment extended** — explicitly notes Phase 4 (CHECKLIST-LAUNCH) verifies the email omission survives the build.

## Acceptance grep results

All ten gates from the plan frontmatter `acceptance_grep` array pass on the source files. Verified post-build that `dist/sitemap.xml`, `dist/robots.txt`, and `dist/index.html` carry the changes through.

```
=== Single-host enforcement (only canonical host appears) ===
public/robots.txt:Sitemap: https://eren-atalay.github.io/Portfolio_Website/sitemap.xml
index.html:    <!-- Canonical URL (D-17 final: eren-atalay.github.io is the canonical GH-Pages host) -->
index.html:    <link rel="canonical" href="https://eren-atalay.github.io/Portfolio_Website/" />
index.html:    <meta property="og:url" content="https://eren-atalay.github.io/Portfolio_Website/" />
index.html:      content="https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png"
index.html:      content="https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png"
index.html:        "url": "https://eren-atalay.github.io/Portfolio_Website/",
index.html:        "image": "https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png"
public/sitemap.xml: 6× <loc> entries (all eren-atalay.github.io)

=== Outgoing host (erenatalaycs.github.io) absence ===
PASS: zero occurrences in index.html, public/sitemap.xml, public/robots.txt
       (note: src/content/identity.ts + src/shells/*.tsx + src/content/projects.ts
        still reference https://github.com/erenatalaycs — that's the GitHub
        USER profile URL, NOT the GH-Pages host. Out of scope per orchestrator
        instructions.)

=== JSON-LD email omission gate ===
sed -n '/application\/ld+json/,/<\/script>/p' index.html | grep -E '"email"\s*:'
PASS: returns empty (no email field in JSON-LD)

=== Sitemap structure ===
grep -c '<loc>' public/sitemap.xml         → 6
grep -c '<lastmod>' public/sitemap.xml     → 6
! grep -E '<changefreq>|<priority>' …      → PASS (no deprecated tags)
grep -c '<loc>' dist/sitemap.xml           → 6 (survives build)

=== robots.txt ===
grep -F 'Allow: /' public/robots.txt       → PASS
grep -F 'Sitemap:' public/robots.txt       → PASS

=== UI-SPEC copy verbatim ===
grep -F '<title>Eren Atalay — Junior Cybersecurity Analyst (UK)</title>'  → MATCH
grep -F '<meta name="description"' index.html                              → MATCH
description char count: 110 (≤155 limit)

=== OG image canonical reference (binary swap deferred to Plan 04-08) ===
grep -F 'og-image.png' index.html | grep -F 'eren-atalay.github.io'        → 2 (og + twitter)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] Sitemap acceptance grep false-positive on initial comment**
- **Found during:** Task 2 (post-write verification)
- **Issue:** The initial XML comment in `public/sitemap.xml` used the literal element strings `<changefreq>` and `<priority>` to explain why they were omitted. The acceptance grep gate `! grep -E '<changefreq>|<priority>' public/sitemap.xml` matched the comment and reported FAIL even though no actual element existed in the document body.
- **Fix:** Reworded the comment to use prose phrasing (`Change-frequency and priority tags deprecated by Google in 2023 — omit.`) — the literal tag names no longer appear anywhere in the file. Same self-defensive-grep pattern as Plan 02-01's `manual-chunks` resolution and Plan 02-02's `localStorage` resolution (cross-referenced in STATE.md decision log).
- **Files modified:** `public/sitemap.xml`
- **Commit:** included in `72f225c` (the fix happened pre-commit; the committed file is already correct)

### Out-of-scope items intentionally NOT touched (orchestrator-directed)

The orchestrator's prompt explicitly listed only 3 files in scope (`index.html`, `public/sitemap.xml`, `public/robots.txt`) and said "replace ALL `erenatalaycs.github.io` references with `eren-atalay.github.io`" — i.e. only the GH-Pages host alias, not other URLs containing the `erenatalaycs` string. The following remain on the OUTGOING string by design:

| File | Remaining reference | Why deferred |
|------|--------------------|---------------|
| `src/content/identity.ts` | `github: 'https://github.com/erenatalaycs'` | GitHub USER profile URL — separate surface from GH-Pages host. STATE.md does not say the username changed. Plan 04-04 § Task 3 step 1 said "do NOT touch `identity.github` unless Option B was chosen — in which case ALSO update". The orchestrator chose Option B (GH-Pages host) but explicitly said keep `identity.ts` untouched. |
| `src/shells/TextShell.tsx` line 51 | `https://github.com/erenatalaycs/Portfolio_Website` | Repo URL on the footer. Same reasoning — GitHub USER, not GH-Pages host. Out of scope. |
| `src/shells/ThreeDShell.tsx` line 92 | `https://github.com/erenatalaycs/Portfolio_Website` | Same. |
| `src/content/projects.ts` line 38 | `https://github.com/erenatalaycs/Portfolio_Website` | Same. |
| `README.md` line 4 | `https://erenatalaycs.github.io/Portfolio_Website/` | This IS the OUTGOING GH-Pages host. README is a developer-facing doc, not shipped in the bundle. Not in the orchestrator's 3-file list. Logged below as deferred. |
| `index.html` JSON-LD `sameAs[0]` | `https://github.com/erenatalaycs` | GitHub USER profile, not GH-Pages host. Plan 04-04 § Task 3 step 1 says only update under Option B; orchestrator's narrower instruction overrides. |
| `index.html` JSON-LD `sameAs[1]` | `https://www.linkedin.com/in/handle-pending` | Plan 03-07 placeholder — `identity.ts` has the real handle (`eren-atalay`) but the JSON-LD was never wired through. Out of scope of "host reconciliation"; logged below. |

### Items potentially needing follow-up (after Phase 4 completes)

If Eren wants the canonical GH-Pages host (`eren-atalay.github.io`) to actually resolve to the repo, the GitHub username must match `eren-atalay`. STATE.md D-17 final does not record whether Eren has renamed the GitHub user. Two scenarios:

1. **Eren renames GitHub user** → `eren-atalay`. Then `https://github.com/erenatalaycs/...` URLs (in `identity.ts`, `TextShell.tsx`, `ThreeDShell.tsx`, `projects.ts`, `README.md`, JSON-LD `sameAs`) all need updating to `eren-atalay`. GitHub serves a 301 from the old username for the historical record.
2. **Eren keeps GitHub user `erenatalaycs`** but configures the repo to be served on a custom GH-Pages domain (`eren-atalay.github.io` requires the username to match — there is no "custom subdomain alias" feature on GH-Pages within `*.github.io`). In this case `eren-atalay.github.io` will return 404. The URL would have to be a custom domain (e.g. `erenatalay.com`) backed by a CNAME — but D-17 final says `eren-atalay.github.io` specifically.

Per the orchestrator's narrow instruction, I did NOT make this judgment call. Logging here so the orchestrator (or Eren) can resolve before launch.

**Logged in `.planning/phases/04-real-asset-postprocessing-polish-pre-launch-qa/deferred-items.md`:**
- `README.md` line 4 still contains the OUTGOING GH-Pages host URL — needs updating during launch sweep (Plan 04-07 or 04-08).
- JSON-LD `sameAs` LinkedIn URL still uses Phase 3 placeholder `handle-pending` — `identity.ts` has the real `eren-atalay` handle; JSON-LD was never wired. Plan 03-07 follow-up.
- The GitHub username vs GH-Pages host alignment question above.

## Authentication gates

None — this plan only touched static SEO files; no API calls or authenticated tools.

## CSP extension carry-over note (worktree merge mechanics)

The orchestrator instructed: "The Phase 4 CSP extension (https://api.web3forms.com in connect-src) was already added by Plan 04-02 (commit 515c151). Do NOT re-add it; verify it survived the merge."

This worktree branch was created from commit `c306b90` (Phase 3 era), which is BEFORE the Plan 04-02 merge into main. Therefore:

- The `index.html` in this worktree shows the BASELINE CSP (no `https://api.web3forms.com` extension).
- `git show main:index.html | grep connect-src` confirms main has the Phase 4 CSP extension intact.
- My Task 3 edits to `index.html` deliberately did NOT touch the CSP block lines.
- When the orchestrator merges this branch into main with `--no-ff`, the 3-way merge will combine: main's CSP extension + this branch's SEO surface changes = both intact.
- Verified by inspection: `git diff main...HEAD -- index.html` shows ONLY the title/description/canonical/og/twitter/JSON-LD-url/JSON-LD-image diffs; the CSP block is identical to main on the changed lines (because we did not change the CSP block).

This is the standard worktree-pattern reconciliation; no action required from this plan.

## Stub tracking

No new stubs introduced. Existing JSON-LD `sameAs` LinkedIn `handle-pending` placeholder (Phase 3 carry-over) noted in deferred-items.md.

## Threat Flags

None. The four threats in the plan's `<threat_model>` are all already mitigated and the mitigations were verified during execution:

| Threat ID | Status |
|-----------|--------|
| T-04-04-01 (JSON-LD email leak) | mitigated — verified absent in source AND dist |
| T-04-04-02 (canonical/og:url mismatch) | mitigated — single-host grep PASS |
| T-04-04-03 (OG image binary EXIF/employer leak) | OUT OF SCOPE — Plan 04-08 OPSEC review |
| T-04-04-04 (sitemap drift from sections) | mitigated — six URLs match `src/content/sections.ts` + FocusId values |

## Self-Check: PASSED

**File existence:**
- `public/sitemap.xml` — FOUND (modified)
- `public/robots.txt` — FOUND (modified)
- `index.html` — FOUND (modified)
- `dist/sitemap.xml` — FOUND (build output, 6 `<loc>`)
- `dist/robots.txt` — FOUND (build output, canonical Sitemap line)
- `dist/index.html` — FOUND (build output, 7× canonical host references, 0× outgoing host)
- `.planning/phases/04-real-asset-postprocessing-polish-pre-launch-qa/04-04-SUMMARY.md` — written by this section

**Commits exist on branch `worktree-agent-a96ee42da489d78e0`:**
- `72f225c` (Task 2 sitemap) — VERIFIED via `git log --oneline`
- `1df6b33` (Task 3 index.html + robots.txt) — VERIFIED via `git log --oneline`

**Verification gates:**
- typecheck: green
- lint: green
- format: green
- test: 54/54 passing
- build: green (dist/ regenerated, sitemap + robots + index carry through)
- acceptance_grep (10 gates from frontmatter): all passing

**Merge required:** YES — orchestrator merges this branch into main. Worktree path: `.claude/worktrees/agent-a96ee42da489d78e0`. Branch: `worktree-agent-a96ee42da489d78e0`. Commit list: `72f225c`, `1df6b33`.
