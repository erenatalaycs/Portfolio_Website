# Phase 4 Deferred Items — SUPERSEDED

> **Status: superseded 2026-05-15 by v1.0 milestone audit.**
>
> All three items below assumed D-17 final = `eren-atalay.github.io`. D-17 was later
> rolled back to `erenatalaycs.github.io` (STATE.md, 2026-05-12). After rollback,
> every item is a non-issue verified against the current tree. File kept as
> historical record; do NOT act on the rows below.

## Reconciliation (2026-05-15)

| # | Original concern | Post-D-17-rollback state | Verdict |
|---|---|---|---|
| 1 | README.md line 4 host string | Already `erenatalaycs.github.io/Portfolio_Website/` after D-17 rollback | NON-ISSUE |
| 2 | JSON-LD `sameAs` LinkedIn placeholder `handle-pending` | `index.html:83` reads `linkedin.com/in/eren-atalay/`; no `handle-pending` strings anywhere in `src/` or `index.html` | NON-ISSUE |
| 3 | GitHub username vs GH-Pages host alignment | Username `erenatalaycs` and host `erenatalaycs.github.io` align natively — no rename, no CNAME needed | NON-ISSUE |

## Historical Record (do not act)

The original "Why deferred" rationale below pre-dates the D-17 host rollback. Retained
only so that `git blame` continuity is preserved; the resolution above is authoritative.

---

## From Plan 04-04 (SEO surfaces, 2026-05-09)

### 1. README.md still references OUTGOING GH-Pages host

**File:** `README.md` line 4
**Current:** `Static site, deployed to GitHub Pages: <https://erenatalaycs.github.io/Portfolio_Website/>.`
**Should become:** `<https://eren-atalay.github.io/Portfolio_Website/>` (canonical D-17 final)
**Why deferred:** Orchestrator's Plan 04-04 instructions listed only `index.html`, `public/sitemap.xml`, `public/robots.txt` as in-scope. README is a developer-facing doc, not shipped in the bundle, so does not affect recruiter SEO. Sweep during Plan 04-07 launch checklist or Plan 04-08 manual sign-off.

### 2. JSON-LD `sameAs` LinkedIn placeholder still says `handle-pending`

**File:** `index.html` line ~78 (JSON-LD block)
**Current:** `"sameAs": ["https://github.com/erenatalaycs", "https://www.linkedin.com/in/handle-pending"]`
**Should become:** `"sameAs": [..., "https://www.linkedin.com/in/eren-atalay/"]` — the real handle from `src/content/identity.ts` `linkedin` field
**Why deferred:** This is a Phase 3 / Plan 03-07 placeholder that was never wired through to the JSON-LD. Plan 04-04 is "host reconciliation" scope; LinkedIn handle is not a host issue. Sweep during Plan 04-07 (CHECKLIST-LAUNCH grep gates) or Plan 04-08.

### 3. GitHub user URL vs GH-Pages host alignment open question

**STATE.md decision:** D-17 final = `eren-atalay.github.io` (GH-Pages host)
**Current `identity.github`:** `https://github.com/erenatalaycs` (GitHub username)

**Issue:** `*.github.io` GH-Pages hostnames are derived from the GitHub username. `eren-atalay.github.io` only resolves if the GitHub username is `eren-atalay`. STATE.md does not record whether Eren has renamed the GitHub user yet.

**Two scenarios:**
1. Eren renames GitHub user → `eren-atalay`. Then update:
   - `src/content/identity.ts` `github` field
   - `src/shells/TextShell.tsx` line 51 (footer repo link)
   - `src/shells/ThreeDShell.tsx` line 92 (footer repo link)
   - `src/content/projects.ts` line 38 (project repo link)
   - `index.html` JSON-LD `sameAs[0]`
   - GitHub serves a 301 redirect from the old username for legacy bookmarks.
2. Eren keeps GitHub user `erenatalaycs` → `eren-atalay.github.io` will 404 unless a custom domain is configured (CNAME). D-17 says `eren-atalay.github.io` specifically, so Option 1 is implied.

**Resolution required before:** Plan 04-08 manual sign-off + first live deploy. Plan 04-07 CHECKLIST-LAUNCH should add a gate verifying `https://eren-atalay.github.io/Portfolio_Website/` actually resolves (not 404).

---

*Items get checked off in Plan 04-07 (CHECKLIST-LAUNCH) or Plan 04-08 (manual sign-off) sweeps.*
