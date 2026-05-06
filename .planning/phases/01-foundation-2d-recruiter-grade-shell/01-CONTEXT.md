# Phase 1: Foundation + 2D Recruiter-Grade Shell - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A live, terminal-styled, recruiter-grade portfolio at `eren-atalay.github.io/Portfolio_Website/` with CV + contact reachable in **under two seconds**, deployed on GitHub Pages — **before any 3D code is written**.

Phase 1 ships:
- Vite 8 + React 19 + TypeScript 5.9 + Tailwind v4 scaffold (FND-01)
- GitHub Actions deploy → `actions/deploy-pages`, with `dist/index.html` → `dist/404.html` copy in CI (FND-02)
- Query-param routing (`?view=text|3d&focus=…`) — no React Router (FND-03)
- Custom terminal-style 404 page (FND-04)
- Typed content layer `src/content/*.ts` covering identity, projects, certs, skills, education (CNT-01)
- CV PDF in `public/assets/`, EXIF stripped, downloadable (CNT-04)
- SEO basics — OG tags, JSON-LD `Person`, real `<title>`, meta description, favicon (CNT-05)
- `<TextShell />` in initial bundle (target ≤120 KB gz), terminal-styled, WCAG-AA contrast (TXT-01)
- Name + "Junior Cybersecurity Analyst" + UK + CV/email/GitHub/LinkedIn rendered as plain HTML at first paint (TXT-02)
- All 7 sections present: About, Education, Certifications (honest "in progress" labels), Skills (tag list, no skill bars), Projects, Write-ups, Contact (TXT-03)
- Email obfuscation utility `src/lib/obfuscate.ts` — JS-decoded, no raw `mailto:` (TXT-04)
- `prefers-reduced-motion` honoured site-wide; full keyboard navigation; semantic HTML (TXT-05)
- GitHub + LinkedIn link-outs reachable in <2s (CTC-02)
- OPSEC asset pipeline + pre-publish checklist (OPS-01)

**Out of scope for Phase 1** (locked in ROADMAP.md / REQUIREMENTS.md):
- 3D shell, drei `<Html>`, capability gating, view toggle → Phase 2
- MDX write-ups, animated `whoami`, click-to-focus camera → Phase 3
- Real GLB workstation, postprocessing, Web3Forms contact form, Lighthouse + real-device QA → Phase 4
- `size-limit` budgets in CI → Phase 2 (OPS-02)

</domain>

<decisions>
## Implementation Decisions

### Shell & Navigation Model

- **D-01 — Layout:** Single long-scroll page. Sections stacked vertically in this order: hero → About → Skills → Projects → Certs → Write-ups → Contact. Best for recruiter Cmd-F skim, best for SEO, matches the "terminal log" metaphor (you scroll up through history).

- **D-02 — Above-the-fold hero is the recruiter contract:** Static `whoami`-style terminal output containing the four contact links (`[CV] [GitHub] [LinkedIn] [email]`) **inline as real `<a>` tags**, satisfying TXT-02 ("plain HTML at first paint, before any R3F code executes") in a single block. NOT animated in Phase 1 — animated `whoami` is Phase 3 (3D-07).

- **D-03 — Hero block voice:**
  ```
  $ whoami
  Eren Atalay — Junior Cybersecurity Analyst (UK)

  $ links --all
  [CV]  [GitHub]  [LinkedIn]  [email (click to reveal)]
  ```
  Each `[bracket]` token is a real anchor tag (not styled span). Email link uses `src/lib/obfuscate.ts` (TXT-04) — JS reveals the address on click; raw `mailto:` never appears in source HTML.

- **D-04 — Sticky terminal command-list nav:** Sticky top bar styled as a prompt:
  ```
  $ goto  [about]  [skills]  [projects]  [certs]  [writeups]  [contact]
  ```
  Each `[bracket]` is `<a href="#section">`. Looks like a terminal command, behaves like an anchor menu, always reachable while scrolling.

- **D-05 — Mobile nav behaviour:** Sticky nav **wraps to multiple lines** on narrow viewports. No horizontal scroll, no collapse-to-menu, no JS state. A real terminal wraps; this should too.

- **D-06 — `?focus=<section>` deep-link behaviour:** Smooth `scrollIntoView` to `#<section>`, no other side effects. `prefers-reduced-motion: reduce` → instant jump. Visible focus ring on the section `<h2>` for keyboard users. The anchor list used here is the **same** list Phase 2's 3D shell will use as camera-focus presets — define it once as a const in `src/content/sections.ts`.

### Aesthetic Depth & Typography

- **D-07 — Terminal accents over a clean reading layout:** Mono font everywhere; section headings styled as prompt lines (e.g., `$ cat about.md`); section bodies are quiet and readable. **NO** ASCII boxes around every block, **NO** blinking cursor on body content, **NO** type-out animation on body text. Research/PITFALLS.md flags "fake terminal" gimmicks as junior-authenticity traps — this avoids that read.

- **D-08 — Font: JetBrains Mono, self-hosted via `@fontsource/jetbrains-mono`.** No Google Fonts call (privacy + first-paint + GH-Pages-friendly). Subset to Latin, woff2 only, regular + medium weights. Single font payload ≤ ~60 KB.

- **D-09 — Palette principle (HEX values are planner discretion):** Off-black background + softened-green body text + softened amber for "in progress" / warning + softened red reserved for honest negatives if any. Every body-text and accent contrast pair MUST pass **WCAG AA against the background** (verified by automated contrast check before phase completion). Encode as Tailwind v4 `@theme` tokens. Explicitly NOT pure `#000000` + `#00ff41` — listed as a forbidden combination in REQUIREMENTS.md "Out of Scope" because it fails AA.

- **D-10 — Content list rendering:**
  - **Skills:** inline bracketed tags `[python] [bash] [wireshark] [splunk] [nmap] …` in muted green; **NO skill bars, NO star ratings, NO percentages** (REQUIREMENTS.md "Out of Scope").
  - **Projects:** `$ ls projects/` heading, then row-per-project: `<project-slug> — <one-line tagline>` linked to its block / GitHub.
  - **Certifications:**
    - `[✓] <cert name> — earned <month year>` for earned
    - `[ ] <cert name> — in progress, target <month year>` for in-flight
    - `[ ] <cert name> — planned` for planned
    Honest labels per TXT-03; no "studying since 2022" without a target date.

### Content Readiness for Phase 1

- **D-11 — Depth target — real for what's ready, lean-but-real for what isn't, stub only for what depends on Phase 3:**
  - **Real now:** identity (name, role, UK), CV PDF, GitHub URL, LinkedIn URL, obfuscated email, About paragraph, Education, Skills tag list, Certifications (with honest in-progress labels).
  - **Lean-but-real now:** Projects — render whatever GitHub repos Eren has presentable (≥1) plus one honest in-progress stub. Phase 3 CNT-03 expands to 3-5 with full provenance.
  - **Stub now:** Write-ups — section is present but renders `No write-ups published yet — first lands during Phase 3` (or similar honest placeholder). Real MDX pipeline + 2-3 write-ups land in Phase 3 (CNT-02).

- **D-12 — Content source:** Eren provides actual text (bio paragraph, real cert names with statuses, project descriptions, education entries) into typed `src/content/*.ts` files **during or after planning**. Phase 1 ships the schema (`Project`, `Cert`, `SkillTag`, `EducationEntry`, `Identity` types) + the rendering. Already-ready inputs (confirmed during discussion): CV PDF, GitHub/LinkedIn/email, real cert names with statuses. Not-yet-ready: 3+ project descriptions with full provenance — that gap is owned by Phase 3 (CNT-03), not Phase 1.

- **D-13 — Projects section in Phase 1:** Renders 1-2 real GitHub repos Eren has presentable + a single honest "in progress" stub (e.g., `[ ] home-lab — Splunk + pfSense + Wireshark, write-up planned`). **No fake projects, no inflated tool lists** (provenance rule from CNT-03 / PITFALLS.md). The Projects array in `src/content/projects.ts` is small and honest in Phase 1; it grows during Phase 3.

### 404 + CI/Deploy

- **D-14 — 404 page voice (FND-04):** Shell-not-found terminal output reusing the sticky-nav constants:
  ```
  $ cd /Portfolio_Website/<requested-path>
  bash: cd: <requested-path>: No such file or directory

  Try one of:
    $ goto  [about]  [skills]  [projects]  [certs]  [writeups]  [contact]

  or [home]
  ```
  Same palette + JetBrains Mono. The section list is **imported from the same const** the sticky nav uses, so the 404 cannot drift from the rest of the site. Built as a real React route (component renders at runtime when GH Pages serves the `404.html` copy of `index.html` — query-param router reads the path and shows the 404 component if no section matches).

- **D-15 — Deploy trigger:** Every push to `main` triggers `.github/workflows/deploy.yml`: `actions/checkout` → `actions/setup-node` → `npm ci` → `npm run build` → `cp dist/index.html dist/404.html` → `actions/upload-pages-artifact` → `actions/deploy-pages`. Workflow also responds to `workflow_dispatch` for manual re-deploy. GH Pages source is set to "GitHub Actions" (not the legacy `gh-pages` branch).

- **D-16 — CI gates in the deploy workflow (Phase 1 scope):**
  - `tsc --noEmit` (TypeScript typecheck)
  - `eslint .` (with `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`)
  - `prettier --check`
  All three are blocking — build fails on any error. Run **before** the build step so a typo doesn't waste a deploy.
  **`size-limit` is deferred to Phase 2** per OPS-02 mapping in REQUIREMENTS.md.

- **D-17 — OPSEC pipeline (OPS-01):**
  - **Markdown checklist:** `.planning/CHECKLIST-OPSEC.md` with the ~25 pre-launch items: EXIF strip verified on every image; full-resolution screenshot review for IPs / hostnames / employer terms / tab-titles / file-paths; no live CTF flags; CV PDF metadata stripped + verified with `exiftool`; `npm audit` clean; `rel="noopener noreferrer"` on every external link; CSP `<meta>` tag present; no `console.log` / `<Stats>` / `<Perf>` in production bundle (verified by grep + bundle inspection, gated by `import.meta.env.DEV`); city-only on public site (no full address / phone / DOB); home-lab-architecture diagrams are sanitised before publish.
  - **CI automation (one job):** runs `exiftool -P -overwrite_original -all=` (or equivalent) on every file in `public/assets/` AND verifies that no GPS / Author / Software / CreatorTool metadata remains. Build fails if metadata is present. Manual review steps stay manual; the metadata gate is automated so Phase 1 cannot regress on it.

- **D-18 — Preview/staging strategy:** **None.** Eren works locally (`npm run dev`); push to `main` deploys live. v1 has no users yet, so the deployed site IS staging. No preview deploys, no Netlify drops, no `gh-pages-preview` branch. Reconsider only if v1 ships and live is being shared with reviewers.

### Claude's Discretion

The user explicitly delegated these to the planner / executor. Lock principles, leave specifics open:

- **Exact HEX values** for the palette tokens (D-09). Choose values that pass WCAG AA on every body-text and accent pair against background. Encode as Tailwind v4 `@theme` tokens (`--color-bg`, `--color-fg`, `--color-accent`, `--color-warn`, etc.). Verify with an automated contrast check before phase verification.
- **Body text max-width / line-length** (~70-80 ch is the standard for monospace reading; pick once, document in code).
- **Font weights and line-heights** (regular + medium is sufficient; line-height ≥ 1.5 for body).
- **Repo top-level layout** under `src/` — strong default is the structure in `.planning/research/SUMMARY.md` and `.planning/research/ARCHITECTURE.md` (`src/app/`, `src/shell/`, `src/sections/`, `src/ui/`, `src/content/`, `src/lib/`, `src/styles/`). Diverge only with rationale.
- **About paragraph length** — 1 short paragraph or 2-3 short paragraphs; voice is honest junior cyber analyst, no clichés (no "passionate hacker since age 12", no "ethical hacker" without evidence).
- **Cursor-block visual** — single static `█` glyph after the hero `whoami` line is acceptable. If animated at all in Phase 1, animate ONLY the hero cursor block, gated by `prefers-reduced-motion`. Never blink anywhere on body content.
- **JSON-LD `Person` schema fields** — `name`, `jobTitle`, `nationality` (or `homeLocation`), `url`, `sameAs` (GitHub + LinkedIn), `email` (obfuscated source), `image` (favicon-derived OG image). Fill from `src/content/identity.ts`.
- **Email obfuscation algorithm** in `src/lib/obfuscate.ts` — the user-facing requirement is "JS-decoded, not raw `mailto:` in HTML" (TXT-04). Pick a simple reversible encoding (rot13, base64, char-array reassembly) and document the choice in the file's comment. Avoid anything that breaks if JS is disabled — fall back to a "click to reveal" button rather than the raw address.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner, executor) MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §"Phase 1: Foundation + 2D Recruiter-Grade Shell" — phase goal, requirement list (FND-01-04, CNT-01, CNT-04, CNT-05, TXT-01-05, CTC-02, OPS-01), 5 success criteria, rationale-for-the-user
- `.planning/REQUIREMENTS.md` §"Foundation & Hosting" / "Content & SEO" / "Text Shell" / "OPSEC & Polish" — full text of all 14 Phase-1 requirements + the "Out of Scope" anti-feature list (Matrix rain, skill bars, padlocks, etc.) that must NOT be built
- `.planning/PROJECT.md` — core value, audience split, constraints, key decisions table, out-of-scope items
- `.planning/STATE.md` — current position, accumulated decisions

### Research (load-bearing for stack + architecture)
- `.planning/research/SUMMARY.md` — recommended stack, "Architecture Approach" section (single SPA / two shells / query-param routing / content-as-data / single source of truth for content)
- `.planning/research/STACK.md` — pinned versions, "What NOT to Use" table, version-compatibility table, alternatives considered
- `.planning/research/ARCHITECTURE.md` — component layout, file organisation, integration points, single-source-of-truth content layer
- `.planning/research/FEATURES.md` — section-by-section content expectations (must-have / should-have / anti-features)
- `.planning/research/PITFALLS.md` — junior-authenticity traps, OPSEC failure modes, recruiter-bounce risk, cliché list

### Project-level
- `CLAUDE.md` — authoritative stack reference (versions, "What NOT to Use" table, version compatibility, font/animation/postprocessing tooling). Phase 1 only uses the React 19 / Vite 8 / TS 5.9 / Tailwind v4 / `@fontsource/jetbrains-mono` / `motion/react` (if any 2D animation) subset — explicitly NOT R3F, drei, postprocessing, GSAP, MDX yet.

### External docs (versions verified 2026-05-06 in CLAUDE.md)
- Vite static-deploy guide — `vite.config.ts` `base: '/Portfolio_Website/'` setup
- Tailwind v4 install with Vite — `@tailwindcss/vite` plugin pattern (no `tailwind.config.js`, no `postcss.config.js`, just one `@import "tailwindcss";` and `@theme` tokens)
- `actions/deploy-pages` — Pages source = "GitHub Actions" mode

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **None.** Repo is empty (no `src/`, no `package.json`, no `index.html`). Phase 1 is greenfield — this is the foundation phase.

### Established Patterns
- **None yet.** The patterns Phase 1 establishes BECOME the patterns later phases must follow:
  - Typed `src/content/*.ts` as the single source of truth (consumed by both shells from Phase 2 onwards).
  - Shared `src/ui/*` components (consumed by both shells).
  - `?view=` and `?focus=` query-param convention (no React Router).
  - `src/lib/obfuscate.ts` email-obfuscation pattern.
  - Section-anchor list as a single const consumed by sticky nav, 404 sitemap fallback, AND (in Phase 2+) 3D camera-focus presets.

### Integration Points
- **Phase 2 will mount `<ThreeDShell />` lazily** over the same query-param router and reuse the same `src/content/*` + `src/ui/*` from Phase 1. Phase 1 must therefore export content + UI components in a way Phase 2's `<Html transform occlude>` consumers can import unchanged.
- **The `#section` anchor list** used by the Phase 1 sticky nav becomes the same focus list used by Phase 2's 3D camera-focus animation (3D-06). Define it once as a const, do NOT hardcode the list in two places.
- **`<App />`** today is the synchronous shell selector reading `?view=` — in Phase 1 it ALWAYS mounts `<TextShell />`; the `<ThreeDShell />` lazy import + capability check land in Phase 2 (3D-01, 3D-02). Design `<App />` so adding the lazy branch in Phase 2 is a 5-line diff, not a refactor.

</code_context>

<specifics>
## Specific Ideas

- **Hero block voice (D-03):** terminal-style `whoami` static output with `[CV] [GitHub] [LinkedIn] [email]` inline as anchor tags. Static in Phase 1; the ANIMATED version is Phase 3 / 3D-07 — keep the markup structure compatible so Phase 3 can wrap it in a typing animation without rewriting.
- **404 page voice (D-14):** `bash: cd: <path>: No such file or directory` + the same `$ goto […]` sitemap fallback the sticky nav uses + `[home]` link. Section list MUST be imported from the shared const so it cannot drift.
- **Skills tag list (D-10):** inline bracketed tags `[python] [bash] [wireshark] …`. Explicitly NOT skill bars, NOT star ratings, NOT percentages — REQUIREMENTS.md "Out of Scope" + research/PITFALLS.md flag these as junior-authenticity traps.
- **Certs honesty cues (D-10):** `[✓]` for earned, `[ ]` for in-progress / planned. In-progress entries MUST include a target month/year; "studying since 2022" without a target reads as drift.
- **Forbidden palette combination:** pure `#000000` background + saturated `#00ff41` text — listed in REQUIREMENTS.md "Out of Scope" because it fails WCAG AA. Use off-black + softened green/amber instead (D-09).

</specifics>

<deferred>
## Deferred Ideas

Captured during discussion or implied by the roadmap; not in Phase 1 scope. Don't lose them.

### Carried by later phases (already mapped in REQUIREMENTS.md / ROADMAP.md)
- **Animated `whoami` terminal greeting** → Phase 3 (3D-07). Phase 1 ships the static markup structure that Phase 3's animation wraps.
- **3-5 cyber projects with full provenance** → Phase 3 (CNT-03). Phase 1 ships whatever's presentable + an honest in-progress stub.
- **MDX CTF/lab write-ups** (2-3 of them) → Phase 3 (CNT-02). Phase 1 ships an honest placeholder ("first lands during Phase 3").
- **`size-limit` budget enforcement in CI** → Phase 2 (OPS-02). Phase 1 CI ships typecheck + lint + format-check only.
- **Web3Forms contact form** → Phase 4 (CTC-01). Phase 1's Contact section ships obfuscated email + GitHub + LinkedIn (THM/HTB profile links land in Phase 4 / CTC-03).
- **TryHackMe + HackTheBox profile links** in the Contact / Certifications area → Phase 4 (CTC-03).
- **3D shell + capability gating + view-toggle DOM overlay** → Phase 2 (3D-01, 3D-02, 3D-03).
- **Lighthouse + real-device QA + final pre-launch checklist execution** → Phase 4 (OPS-03, OPS-04, OPS-05).

### v2 (already in REQUIREMENTS.md "v2")
- Light/dark theme toggle (V2-CNT-01)
- Multi-language TR/EN (V2-CNT-02)
- Custom domain (V2-HST-01)
- HashRouter / BrowserRouter for shareable per-write-up URLs (V2-RTE-01) — trigger is write-up count >~10
- Privacy-respecting analytics (V2-POL-02)
- Source-code Easter egg (V2-3D-04)

### None — discussion stayed within phase scope (no new deferred ideas surfaced).

</deferred>

---

*Phase: 1-Foundation + 2D Recruiter-Grade Shell*
*Context gathered: 2026-05-06*
