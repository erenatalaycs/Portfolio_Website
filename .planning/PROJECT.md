# Eren Atalay — Portfolio Website

## What This Is

A 3D "hacker workstation" portfolio site for Eren Atalay, a junior cybersecurity analyst who graduated in summer 2025 and is job-hunting in the UK. Visitors land in a dark desk-and-monitors scene rendered with a terminal/hacker aesthetic; they can drag to look around the room and click monitors to read CV, projects, CTF write-ups, certifications, skills, and education. A fast 2D fallback view exists for recruiters who skim and for low-power devices.

## Core Value

The site must make a cybersecurity recruiter or hiring manager think *"this person actually gets this field"* within seconds — without forcing recruiters to wait for a 3D scene to load before they can find the CV and contact details.

## Current State

**Shipped: v1.0 MVP (2026-05-15)** — `https://erenatalaycs.github.io/Portfolio_Website/` (tag `hs-redesign-v1`)

4 phases, 27 plans, ~5.8k LOC TS+TSX. Audit verdict `gaps_found` (25/32 REQs) — all gaps are by-design deferrals (no fabricated lab evidence; pre-launch human QA pending). Substantively healthy ship state.

**Codebase signature:**
- Vite 8 + React 19 + TS 5.9 + Tailwind v4, no React Router (query-param routing)
- R3F 9.6 / drei 10.7 / three 0.184 lazy-loaded behind capability gating
- HS-redesign final form: 1 ultrawide monitor + 5-tab `MonitorTabs` (zustand) instead of 3-monitor mapping
- Web3Forms contact form; rot13+base64 email obfuscation; CSP w/ Web3Forms allowlist
- GH Actions deploy with size-limit budgets + 5 blocking QA gates + advisory Lighthouse

## Current Milestone: v1.1 Room Build-Out + Pre-Launch Close

**Goal:** Expand the 3D scene from a "desk + monitor" island into a full hacker's room (walls, ceiling, window, server rack, whiteboard, bed, cat, secondary devices) AND close the v1.0-inherited human pre-launch sign-off + write-up + GLB items so v1.1 lands as one clean publish-ready release.

**Target features (9 categories — all in scope):**
- **A. Room shell** — left/right/back wall planes, ceiling, blinds-style window (foggy night-city), optional door, ceiling light
- **B. Cyber detail** — mini server rack (switch + Pi-cluster blink-LEDs), cable bundle, external HDD tower
- **C. Wall content** — whiteboard (MITRE ATT&CK matrix or kill chain via canvas-texture), analog wall clock, framed certificate/poster
- **D. Warmth touches** — real book spines on bookshelf, small potted plant, screen bias-light, under-desk LED strip
- **E. Bed corner** — single bed/couch fitting cyber-room aesthetic, nightstand, dim bedside lamp
- **F. Cat** — static or breathing-animation procedural cat (primitives), on the bed or window ledge
- **G. Secondary devices** (optional within v1.1) — open laptop screen on side, SDR/radio dongle, second monitor
- **H. 04-08 human sign-off** (v1.0-inherited) — OG image swap, Lighthouse median-of-3, Web3Forms Gmail+Outlook delivery test, real-device QA (iOS + Android), named cyber + non-cyber usability peer reviews → closes OPS-03 / OPS-04 / OPS-05 / CTC-01 (delivery half)
- **I. Write-ups + GLB** (v1.0-inherited) — 2–3 MDX CTF/lab write-ups with real provenance (closes CNT-02 / CNT-03); reattempt real GLB workstation (V2-3D-01), or formally promote to v1.2

**Key context:**
- Stack stable — no new deps expected for A–G; procedural primitives + drei `<Html>` + zustand already cover this
- Phase numbering continues from v1.0 (next phase = 5)
- "No fabricated lab evidence" rule still binds — write-ups (CNT-02/CNT-03) ship only after real labs are run
- Bed + cat are user-personal additions ("yatak ve kedi"); approach is procedural-first, optional CC0 GLB swap later if needed

## Requirements

### Validated

- ✓ Vite + React 19 + TS + Tailwind v4 scaffold — v1.0 (FND-01)
- ✓ GH Pages deploy via GitHub Actions, base path + 404.html — v1.0 (FND-02)
- ✓ Query-param routing `?view=text|3d&focus=…` — v1.0 (FND-03)
- ✓ Terminal-styled custom 404 — v1.0 (FND-04)
- ✓ Typed content layer (`src/content/*.ts`) — v1.0 (CNT-01)
- ✓ CV PDF in repo, EXIF stripped, downloadable from both shells — v1.0 (CNT-04)
- ✓ SEO basics: OG tags, JSON-LD Person, real title, favicon — v1.0 (CNT-05)
- ✓ Text shell ships in initial bundle (≤120 KB gz) with WCAG-AA contrast — v1.0 (TXT-01)
- ✓ Name + role + UK + CV/email/GitHub/LinkedIn rendered at first paint — v1.0 (TXT-02)
- ✓ Text-shell sections: About, Education, Certs (honest "in progress"), Skills (tag list), Projects, Write-ups, Contact — v1.0 (TXT-03)
- ✓ Email obfuscation (rot13+base64, JS-decoded, no raw `mailto:`) — v1.0 (TXT-04)
- ✓ `prefers-reduced-motion` site-wide; full keyboard navigation; semantic HTML — v1.0 (TXT-05)
- ✓ Content parity between text shell and 3D shell (single-source-of-truth components) — v1.0 (TXT-06)
- ✓ `<ThreeDShell />` lazy-loaded via `React.lazy` with Suspense — v1.0 (3D-01)
- ✓ `detectCapability()` synchronous gate routes weak devices to text shell — v1.0 (3D-02)
- ✓ Always-visible view-toggle DOM overlay — v1.0 (3D-03)
- ✓ Composed scene — desk + monitor(s) + lamp + bookshelf (procedural; HS-redesign 1-monitor + decor) — v1.0 (3D-04)
- ✓ drei `<Html transform occlude>` monitors render shared `src/ui/*` — v1.0 (3D-05)
- ✓ Free-look + click navigation; GSAP camera focus per monitor — v1.0 (3D-06)
- ✓ Animated `whoami` greeting on main monitor; skips on reduced-motion — v1.0 (3D-07)
- ✓ Postprocessing pipeline (Bloom + Scanline + CA + Vignette) gated by PerformanceMonitor — v1.0 (3D-08 postprocessing half; GLB swap rolled back to procedural, promoted to v1.1)
- ✓ `webglcontextlost` swaps to text shell gracefully — v1.0 (3D-09)
- ✓ Web3Forms contact form wired code-side (delivery verification pending 04-08) — v1.0 (CTC-01 partial)
- ✓ GitHub + LinkedIn link-outs from both shells — v1.0 (CTC-02)
- ✓ TryHackMe + HackTheBox `volvoxkill` profile shortcuts surfaced — v1.0 (CTC-03)
- ✓ OPSEC asset pipeline (`exiftool -all=` + manual full-resolution review) — v1.0 (OPS-01)
- ✓ `size-limit` budgets enforced in CI — v1.0 (OPS-02)

### Active (v1.1 — Post-launch follow-through)

- [ ] Finish Plan 04-08 human-only sign-off track (OG image swap, Lighthouse median-of-3, Web3Forms Gmail+Outlook delivery test, real-device QA, named peer reviews) — closes OPS-03 / OPS-04 / OPS-05 / CTC-01 (delivery half)
- [ ] Author 2–3 MDX CTF/lab write-ups with real provenance (no fabrication rule) — closes CNT-02 / CNT-03
- [ ] Real GLB workstation swap (V2-3D-01) — Plan 04-06 reverted to procedural in commit `342d2e7`; reattempt with iteration headroom

### Out of Scope

- Custom domain — github.io subdomain is fine for v1, can be added later without rework
- CMS / blog backend — write-ups are authored as static markdown / MDX, not edited in-browser
- Authentication or private content — entire site is public
- Server-side / API code — GitHub Pages is static-only
- Multiple languages — English-only for v1
- Real-time / multiplayer features in the 3D scene — it's a portfolio, not a hangout
- Tracking and analytics with personal data — keep it light and privacy-respecting

## Context

- **Career situation:** Eren graduated last summer, is currently in a non-cybersecurity role (QA/Test on a fintech platform), and is using this portfolio to break into a cyber analyst role specifically. The site needs to *position him as a cyber person*, not as a generalist.
- **Audience split:** "Recruiters and technical hiring managers, both equally." Recruiters want a 30-second skim; hiring managers will engage with the 3D scene and read write-ups. The 2D-fallback decision flows directly from this — we don't pick one audience, we serve both.
- **Aesthetic decision:** Terminal/hacker direction (monospace, dark, command-line motifs) was chosen over glass+neon, deep-space minimal, and cyberpunk. It's the most on-brand for cyber and the easiest to execute well without it looking like a generic SaaS landing page.
- **3D scope:** "Full 3D scene" was chosen over hero-only or accents — but framed as the hacker workstation specifically (desk + monitors + room), not free-form 3D space. The monitors give us natural surfaces to embed content without inventing UI from scratch.
- **Existing assets to incorporate:** CV/resume PDF, cyber projects (likely on GitHub), CTF/lab write-ups (some written, some to be written), certifications (earned and/or in-progress), skills, education.

## Constraints

- **Tech stack:** React + React Three Fiber (Three.js) + Tailwind CSS, building to a static bundle. R3F is the right balance: declarative 3D in React, mature ecosystem, well-documented for portfolios.
- **Hosting:** GitHub Pages — static files only, served from the repo. No server-side rendering, no APIs, no env-secret-dependent integrations at runtime.
- **Performance:** The 3D scene must load on reasonable home broadband; on slow / low-end devices, the 2D fallback should serve so the recruiter never sees a blank or janky scene.
- **Timeline:** Roughly one month to v1 ("month-ish"). Quality matters more than shipping next week, but it's not a year-long project either.
- **Maintenance:** Solo-maintained by Eren. Avoid stacks that need a dedicated team or paid services to keep alive.
- **Privacy:** Real name + email are public. Email contact should resist spam scraping (e.g., obfuscation or a contact form with a static form-handler).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 3D direction is "hacker workstation" (desk + monitors), not network graph or server-room city | Natural surfaces (monitors) for content; on-brand for cyber; easier to execute well than abstract 3D | ✓ v1.0 — shipped; HS-redesign final form trimmed to 1 ultrawide + 5-tab MonitorTabs |
| Interaction model: free-look + click | Most exploratory / impressive for technical visitors; click is still discoverable for non-3D-natives | ✓ v1.0 — clamped OrbitControls + GSAP camera dolly to per-tab pose; click to focus, Esc to defocus |
| Stack: React + React Three Fiber + Tailwind | R3F is the modern standard for 3D web in React; Tailwind keeps the terminal aesthetic fast to iterate on | ✓ v1.0 — Vite 8 + React 19 + R3F 9.6 + drei 10.7 + Tailwind v4; no surprises |
| Always ship a fast 2D fallback, not just optimise the 3D | Recruiter audience won't tolerate a slow 3D load; fallback de-risks the whole project | ✓ v1.0 — text shell ≤120 KB gz, capability-gated default; recruiters get CV+contact at first paint |
| Host on GitHub Pages, no custom domain for v1 | Free; static-only constraint forces simplicity; domain can be added later without rework | ✓ v1.0 — live at `erenatalaycs.github.io/Portfolio_Website/`; GH Actions deploy |
| Aesthetic: terminal/hacker (monospace, dark, command-line motifs) | Most on-brand for cyber; user picked it explicitly over glass/neon, deep-space, and cyberpunk variants | ✓ v1.0 — off-black + softened green palette (WCAG AA); JetBrains Mono self-hosted |
| Public info: real name + email + GitHub + LinkedIn | User explicitly opted into all four — no anonymisation needed | ✓ v1.0 — rot13+base64 email obfuscation prevents scrape; cyber-specific Gmail used (not work email) |
| HS-redesign: 1 ultrawide monitor + 5-tab MonitorTabs over 3-monitor mapping | Late autonomous visual-tuning pass concluded a single focused surface read better than 3 distributed ones | ✓ v1.0 — shipped 2026-05-14 at tag `hs-redesign-v1`; zustand store; role=group/aria-pressed |
| GLB workstation reverted to procedural geometry | Plan 04-06 Path A landed in 14 min but visual-tuning loop concluded procedural look read better | ⚠️ Revisit v1.1 — V2-3D-01; GLB files retained in `public/assets/workstation/` |
| Canonical GH-Pages host = `erenatalaycs.github.io` | Plan 04-04 final reverted from `eren-atalay.github.io` after Eren chose "keep username" over "rename GitHub account" | ✓ v1.0 — all six SEO surfaces reconciled (canonical/og/JSON-LD/sitemap/robots/README) |
| No write-up fabrication — author only after real labs | Honest junior framing > write-up count; fabrication is career-damaging in cyber | ✓ v1.0 — Plan 03-06 deferred to v1.1; MDX pipeline in place, drops `.mdx` into `src/content/writeups/` |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-15 after v1.0 milestone close*
