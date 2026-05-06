# Phase 1: Foundation + 2D Recruiter-Grade Shell — Research

**Researched:** 2026-05-06
**Domain:** Vite 8 + React 19 + TS 5.9 + Tailwind v4 SPA, deployed to GitHub Pages, no R3F yet
**Confidence:** HIGH overall (every version verified against npm registry on 2026-05-06; canonical action examples cross-referenced with official `actions/deploy-pages` README and Vite static-deploy guide)

---

## Summary

Phase 1 is a single-page, single-bundle React 19 + Vite 8 site that ships **before any 3D code exists**. The recruiter contract — name, role, CV PDF, GitHub, LinkedIn, obfuscated email — is plain HTML in `index.html` at first paint, served from `https://eren-atalay.github.io/Portfolio_Website/` over GitHub Pages, deployed by GitHub Actions. Routing is **hash-based section anchors plus `?view=` / `?focus=` query params**, with `dist/index.html` copied to `dist/404.html` in CI to handle deep-link refresh. There is no router library, no client-side path routing, no SSR.

Every load-bearing decision in `01-CONTEXT.md` (D-01..D-18) and every visual token in `01-UI-SPEC.md` is locked. Research scope was scoped to the *implementation specifics* the planner needs: exact `vite.config.ts`, exact `eslint.config.js`, exact GitHub Actions workflow, exact Tailwind v4 `@theme` syntax, exact `@fontsource/jetbrains-mono` import pattern, exact `exiftool` CI step, JSON-LD schema fields, query-param routing implementation, and the OPSEC checklist content.

**Primary recommendation:** Scaffold with `npm create vite@latest` (React-TS template), then layer Tailwind v4 via the `@tailwindcss/vite` plugin (zero config — only `@import "tailwindcss"` plus the `@theme` block from `01-UI-SPEC.md`), self-host JetBrains Mono via `@fontsource/jetbrains-mono` weights 400 and 600, build query-param routing as a tiny `useSyncExternalStore`-backed hook (not React Router), wire ESLint 9 flat config + Prettier 3 + TypeScript 5.9 + Vitest 3 (NOT Vitest 4 — its Vite 8 support is recent and the test surface is utility-only, so we trade currency for stability), and ship a single-job GitHub Actions workflow that does `tsc --noEmit && eslint . && prettier --check && vite build && cp dist/index.html dist/404.html && exiftool verify`, then `actions/upload-pages-artifact@v5` → `actions/deploy-pages@v5`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Shell & Navigation Model**

- **D-01 — Layout:** Single long-scroll page. Sections stacked vertically: hero → About → Skills → Projects → Certs → Write-ups → Contact.
- **D-02 — Above-the-fold hero is the recruiter contract:** Static `whoami`-style terminal output containing the four contact links (`[CV] [GitHub] [LinkedIn] [email]`) inline as real `<a>` tags. NOT animated in Phase 1 (animated `whoami` is Phase 3 / 3D-07).
- **D-03 — Hero block voice:** Exact copy locked; each `[bracket]` is a real anchor; email link uses `src/lib/obfuscate.ts`.
- **D-04 — Sticky terminal command-list nav:** `$ goto [about] [skills] [projects] [certs] [writeups] [contact]` — each bracket is `<a href="#section">`.
- **D-05 — Mobile nav behaviour:** Sticky nav wraps to multiple lines. No horizontal scroll, no collapse-to-menu, no JS state.
- **D-06 — `?focus=<section>` deep-link behaviour:** Smooth `scrollIntoView`; `prefers-reduced-motion: reduce` → instant jump. Visible focus ring on the `<h2>`. Anchor list shared with future Phase 2 camera presets.

**Aesthetic Depth & Typography**

- **D-07 — Terminal accents over a clean reading layout:** No ASCII boxes, no blinking cursor on body content, no type-out animation on body text.
- **D-08 — Font: JetBrains Mono, self-hosted via `@fontsource/jetbrains-mono`.** No Google Fonts. Latin subset, woff2 only, regular + medium weights. ≤ ~60 KB.
- **D-09 — Palette principle:** Off-black bg + softened-green body + softened amber + softened red. WCAG AA verified. Tailwind v4 `@theme` tokens. Pinned in `01-UI-SPEC.md`: `#0d1117` / `#c9d1d9` / `#7ee787` / `#e3b341` / `#ff7b72` / `#8b949e` / `#161b22` / `#79c0ff`.
- **D-10 — Content list rendering:** Skills inline bracketed tags, no skill bars / star ratings / percentages. Projects: `$ ls projects/` heading + row-per-project. Certs: `[✓]` earned / `[ ]` in-progress or planned, target month/year mandatory.

**Content Readiness for Phase 1**

- **D-11 — Depth target:** Real now (identity, CV, links, About, Education, Skills, Certs). Lean-but-real now (Projects ≥ 1 + 1 stub). Stub now (Write-ups — placeholder text only).
- **D-12 — Content source:** Eren provides actual text into typed `src/content/*.ts`. Phase 1 ships schema + rendering.
- **D-13 — Projects in Phase 1:** 1-2 real GitHub repos + 1 honest in-progress stub. No fake projects, no inflated tool lists.

**404 + CI/Deploy**

- **D-14 — 404 page voice:** `bash: cd: ...: No such file or directory` + the same `$ goto [...]` sitemap fallback (imported from same `SECTIONS` const) + `[home]` link.
- **D-15 — Deploy trigger:** Every push to `main` runs `.github/workflows/deploy.yml`: `actions/checkout` → `actions/setup-node` → `npm ci` → `npm run build` → `cp dist/index.html dist/404.html` → `actions/upload-pages-artifact` → `actions/deploy-pages`. Also responds to `workflow_dispatch`. GH Pages source set to "GitHub Actions".
- **D-16 — CI gates (Phase 1):** `tsc --noEmit`, `eslint .`, `prettier --check`. All blocking, run **before** build. `size-limit` deferred to Phase 2.
- **D-17 — OPSEC pipeline:** Markdown checklist at `.planning/CHECKLIST-OPSEC.md` (~25 items). CI runs `exiftool` strip + verify on every file in `public/assets/`; fails build if metadata remains.
- **D-18 — Preview/staging strategy:** None. Push-to-main deploys live.

### Claude's Discretion

- Body text max-width / line-length → **PINNED in UI-SPEC: 72ch.**
- Font weights and line-heights → **PINNED in UI-SPEC: 400 + 600, body line-height 1.5.**
- Repo top-level layout under `src/` → research below recommends concrete structure.
- About paragraph length → 1-3 short paragraphs, honest junior cyber voice.
- Cursor-block visual → static `█` glyph after the hero `whoami` line; if animated, only the hero cursor block, gated by `prefers-reduced-motion`.
- JSON-LD `Person` schema fields → `name`, `jobTitle`, `nationality` / `homeLocation`, `url`, `sameAs` (GitHub + LinkedIn), `email` (obfuscated source), `image` (favicon-derived OG image). Fill from `src/content/identity.ts`.
- Email obfuscation algorithm → simple reversible encoding (rot13 / base64 / char-array reassembly), document choice in code comment. JS-disabled fallback: button stays inert, no raw `mailto:` ever.
- Exact HEX values → **PINNED in UI-SPEC.** No additional discretion.

### Deferred Ideas (OUT OF SCOPE)

**Carried by later phases:**

- Animated `whoami` greeting → Phase 3 (3D-07)
- 3-5 cyber projects with full provenance → Phase 3 (CNT-03)
- MDX CTF/lab write-ups → Phase 3 (CNT-02)
- `size-limit` budget enforcement in CI → Phase 2 (OPS-02)
- Web3Forms contact form → Phase 4 (CTC-01)
- TryHackMe + HackTheBox profile links → Phase 4 (CTC-03)
- 3D shell + capability gating + view-toggle DOM overlay → Phase 2 (3D-01..03)
- Lighthouse + real-device QA + final pre-launch checklist execution → Phase 4 (OPS-03..05)

**v2:**

- Light/dark theme toggle, multi-language, custom domain, HashRouter / BrowserRouter for shareable per-write-up URLs, privacy-respecting analytics, source-code Easter egg.

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **FND-01** | Vite + React 19 + TS + Tailwind v4 scaffold with pinned versions | Standard Stack table below — exact versions verified on npm registry 2026-05-06 |
| **FND-02** | GitHub Pages deploy via Actions, `vite.config.ts` `base` set, `404.html` copy in CI | "Deploy Pipeline" section — full workflow YAML below; `cp dist/index.html dist/404.html` step located between build and artifact upload |
| **FND-03** | Query-param routing (`?view=text|3d&focus=…`) — no React Router | "Query-Param Routing Pattern" section — `useSyncExternalStore` + `URLSearchParams` + `popstate` listener |
| **FND-04** | Custom 404 page rendered in terminal style | "404 Component Pattern" section — single React component reused via the same `dist/index.html` ↔ `dist/404.html` copy |
| **CNT-01** | Typed content layer `src/content/*.ts` for projects, certs, skills, education, identity | "Content Layer Pattern" section — TypeScript types + barrel export + `as const` arrays |
| **CNT-04** | CV PDF in repo, EXIF-stripped, downloadable | "OPSEC Pipeline" section — `exiftool` flags + CI verification step |
| **CNT-05** | SEO basics — OG, JSON-LD `Person`, real `<title>`, meta description, favicon | "SEO Pattern" section — JSON-LD shape + `<head>` injection at build time |
| **TXT-01** | `<TextShell />` ships in initial bundle, terminal-styled, WCAG AA contrast | UI-SPEC color tokens (already verified AAA against `#0d1117`); Phase 1 has no lazy loading anyway |
| **TXT-02** | Name + "Junior Cybersecurity Analyst" + UK + CV/email/GitHub/LinkedIn as plain HTML at first paint | "Hero Block — First-Paint Markup" section — markup must exist in the React tree such that `index.html`'s rendered HTML contains the four `<a>` tags before any JS executes (or at least synchronously on initial render with no Suspense / lazy boundary above it) |
| **TXT-03** | All 7 sections present | UI-SPEC § "Section headings" pins the exact list and copy |
| **TXT-04** | Email obfuscation utility, no raw `mailto:` HTML | "Email Obfuscation Pattern" section — recommended `rot13` for readability + base64 encoding for resistance to naive grep; fallback is a `<button>` that stays inert when JS is disabled |
| **TXT-05** | `prefers-reduced-motion` site-wide, full keyboard nav, semantic HTML | "Accessibility Patterns" section — Tailwind v4 `motion-reduce:` variants + `useReducedMotion` hook + `:focus-visible` ring |
| **CTC-02** | GitHub + LinkedIn link-outs reachable in <2s | Already satisfied by TXT-02 — both links live in the hero block as plain `<a>` |
| **OPS-01** | Asset OPSEC pipeline + pre-publish checklist | "OPSEC Pipeline" section — full ~25-item checklist content + CI automation step |

</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Render HTML, run React | Browser/Client | — | Static SPA; no SSR. Vite produces a single `index.html` that GH Pages serves verbatim. |
| Asset serving (CV PDF, fonts, OG image, favicon) | CDN/Static (GitHub Pages) | — | Files in `public/` are copied to `dist/` and served as static assets at the configured `base` path. |
| Routing (`#anchor` + `?view` + `?focus`) | Browser/Client | — | Hash anchors are native browser behaviour; query params are read by a tiny custom hook. No server-side routing logic exists. |
| 404 fallback (deep-link refresh) | CDN/Static (GitHub Pages) | Browser/Client | GH Pages serves `dist/404.html` (a copy of `index.html`) when the path is unknown; React then runs and resolves the request. |
| Build, type-check, lint, format-check | CI (GitHub Actions) | Local dev | All blocking gates run in CI on every push. Locally: same scripts via npm. |
| EXIF strip + metadata verification | CI (GitHub Actions) | — | OPSEC automation is a build-time gate, not a runtime concern. |
| Email obfuscation | Browser/Client | — | Decode happens in JS at runtime to avoid plaintext in source HTML. |
| Content (identity, projects, skills, certs, education) | Browser/Client (typed TS modules) | — | All content is statically imported and bundled. No CMS, no fetch. |

**Why this matters:** Phase 1 has no API tier, no persistence, no auth — everything is browser tier with build-time CI gates. The map exists so Phase 2's planner can confirm that adding `<ThreeDShell />` introduces zero new tiers (still all browser/client) and so any future temptation to introduce a runtime fetch (e.g., a "live GitHub repo count") gets caught early as a tier violation.

---

## Standard Stack

### Core (Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react` | `~19.2.5` | UI runtime | React 19 is the current line; pairs with the tooling pinned in CLAUDE.md and is required by the Phase 2 R3F v9 line. `[VERIFIED: npm view react version → 19.2.5, 2026-05-06]` |
| `react-dom` | `~19.2.5` | DOM renderer | Pinned to react. `[VERIFIED: npm view react-dom version → 19.2.5]` |
| `vite` | `~8.0.10` | Build tool + dev server | First-class Tailwind v4 plugin, native ESM dev, single-line `base` config for GH Pages. `[VERIFIED: npm view vite version → 8.0.10]` |
| `@vitejs/plugin-react` | `~6.0.1` | Vite + React fast-refresh | Standard React+Vite glue. `[VERIFIED: npm view @vitejs/plugin-react version → 6.0.1]` |
| `typescript` | `~5.9.3` | Type system | TS 6 shipped (latest = 6.0.3) but CLAUDE.md locks Phase 1 to TS 5.9 to keep the door open for R3F/drei type defs that lag the Major. `[VERIFIED: npm view typescript@5.9 → 5.9.3, 2026-05-06]` `[VERIFIED: CLAUDE.md "TS 6 just shipped (mid-2026) and several R3F/drei type defs target TS 5.x"]` |
| `@types/react` | `~19.2.14` | React type defs | `[VERIFIED: npm view @types/react version → 19.2.14]` |
| `@types/react-dom` | `~19.2.3` | React DOM type defs | `[VERIFIED: npm view @types/react-dom version → 19.2.3]` |
| `@types/node` | `~25.6.0` | Node globals (for `vite.config.ts`) | `[VERIFIED: npm view @types/node version → 25.6.0]` |
| `tailwindcss` | `~4.2.4` | Utility CSS | v4 zero-config; `@theme` directive for design tokens. `[VERIFIED: npm view tailwindcss version → 4.2.4]` |
| `@tailwindcss/vite` | `~4.2.4` | Tailwind v4 Vite plugin | Must match `tailwindcss` major+minor (release in lockstep per CLAUDE.md). `[VERIFIED: npm view @tailwindcss/vite version → 4.2.4]` |
| `@fontsource/jetbrains-mono` | `~5.2.8` | Self-hosted font payload | Per-weight CSS imports (`/400.css`, `/600.css`); woff2 + woff files in package; Vite static-asset pipeline handles them. `[VERIFIED: npm view @fontsource/jetbrains-mono version → 5.2.8]` `[CITED: https://fontsource.org/fonts/jetbrains-mono/install — `font-display: swap`, Latin subset is default]` |

### Dev / CI

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `eslint` | `~9.39.4` | Linting | Hold on ESLint 9 (not 10) per CLAUDE.md — most plugins still target 9. `[VERIFIED: npm view eslint dist-tags.maintenance → 9.39.4]` ESLint 10 is now `latest` (10.3.0) but adoption risk for `eslint-plugin-react-hooks` etc. is still real. |
| `typescript-eslint` | `~8.59.2` | TS-aware lint plugin (umbrella package) | Modern TS+ESLint flat-config glue. Covers parser + plugin in one install. `[VERIFIED: npm view typescript-eslint version → 8.59.2]` |
| `eslint-plugin-react-hooks` | `~7.1.1` | Rules of Hooks | `[VERIFIED: npm view eslint-plugin-react-hooks version → 7.1.1]` |
| `eslint-plugin-react-refresh` | `~0.5.2` | Fast-refresh hint rules | `[VERIFIED: npm view eslint-plugin-react-refresh version → 0.5.2]` |
| `eslint-plugin-jsx-a11y` | `~6.10.2` | JSX accessibility rules | `[VERIFIED: npm view eslint-plugin-jsx-a11y version → 6.10.2]` |
| `eslint-config-prettier` | `~10.1.8` | Disable formatting rules so Prettier owns format | Modern split: ESLint enforces correctness, Prettier owns whitespace. `[CITED: dev.to "ESLint + Prettier Setup … 2026" — eslint-plugin-prettier is now discouraged]` |
| `prettier` | `~3.8.3` | Formatter | Standard. `[VERIFIED: npm view prettier version → 3.8.3]` |
| `vitest` | `~3.2.4` | Test runner for utility code | Phase 1 tests `src/lib/obfuscate.ts`, query-param hook, `useReducedMotion` hook. **Vitest 4 is now `latest` (4.1.5) and supports Vite 8 from day one** — but Vitest 3.2.x also runs against Vite 6+ with no known issues for the test shape Phase 1 needs (pure utilities, no jsdom-heavy DOM testing). **Recommendation: pin to `~3.2.4` for Phase 1**, plan to bump to Vitest 4 in Phase 2 alongside the R3F install (single coordinated upgrade rather than two). `[VERIFIED: npm view vitest@3 → max 3.2.4]` `[CITED: vitest.dev/guide/migration — Vitest 4 requires Vite ≥ 6, Node ≥ 20]` `[ASSUMED: A1 — Vitest 3.2.4 fully supports Vite 8 in practice; the Vitest 3 docs reference Vite 5/6 explicitly. If `npm install` resolves a peer-dep conflict, the executor should fall through to Vitest 4.]` |
| `@vitest/coverage-v8` | `~3.2.4` | Coverage reporter | Match vitest version exactly. |
| `jsdom` | latest | DOM env for tests that touch DOM | Phase 1 tests are mostly pure utilities; jsdom is needed for the query-param hook test that mocks `window.location`. `happy-dom` is faster but less complete; for a 5-test surface the difference is invisible. |

### Verification

```bash
# Run during Wave 0 to confirm versions resolve cleanly:
npm view react@19 version            # → 19.2.x
npm view vite@8 version              # → 8.0.x
npm view typescript@5.9 version      # → 5.9.3
npm view @tailwindcss/vite version   # → 4.2.4
npm view eslint@9 version            # → 9.39.x
npm view vitest@3 version            # → 3.2.4
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `vite@8` | `vite@7` | v7 still supported (security backports per Vite releases page) but `@tailwindcss/vite@4.2` and `@vitejs/plugin-react@6` already target v8. No reason to lag. |
| `typescript@5.9` | `typescript@6.0` | TS 6 shipped mid-2026 (latest = 6.0.3) but R3F v9 / drei 10 type defs lag. Phase 2 will need 5.9 anyway, so we lock it now. **Don't upgrade independently of R3F.** |
| `eslint@9` | `eslint@10` | ESLint 10 shipped (latest = 10.3.0). `eslint-plugin-react-hooks@7` declares `eslint@^9.0.0` peer; using 10 forces `--legacy-peer-deps` or waiting for plugin updates. Hold on 9 per CLAUDE.md. |
| `vitest@3.2` | `vitest@4.1` | Vitest 4 supports Vite 8 from day one. Recommendation pins Vitest 3 for Phase 1 conservativeness; bump alongside R3F install in Phase 2. If executor hits `npm install` peer issues, fall through to Vitest 4. |
| Self-host via `@fontsource/jetbrains-mono` | Google Fonts CDN | Forbidden by D-08: privacy + first-paint + GH-Pages-friendly self-host is locked. |
| Self-host via `@fontsource-variable/jetbrains-mono` | Variable-weight package | Variable axis (one file, all weights) is smaller in total when you use 4+ weights but **larger** for a 2-weight site (Phase 1 uses 400 + 600 only). Static per-weight files are correct here. |
| ESLint flat config | `.eslintrc.cjs` legacy config | ESLint 9+ defaults to flat config; legacy config requires explicit `ESLINT_USE_FLAT_CONFIG=false`. Do not use legacy. |

**Installation (all at once):**

```bash
# Scaffold (already created the repo dir; this command is for reference)
npm create vite@latest portfolio -- --template react-ts

# Runtime
npm install react@~19.2 react-dom@~19.2 \
  @fontsource/jetbrains-mono@~5.2

# Build / dev
npm install -D vite@~8.0 @vitejs/plugin-react@~6.0 \
  typescript@~5.9 \
  @types/react@~19.2 @types/react-dom@~19.2 @types/node@~25.6 \
  tailwindcss@~4.2 @tailwindcss/vite@~4.2

# Lint / format
npm install -D eslint@~9.39 typescript-eslint@~8.59 \
  eslint-plugin-react-hooks@~7.1 \
  eslint-plugin-react-refresh@~0.5 \
  eslint-plugin-jsx-a11y@~6.10 \
  eslint-config-prettier@~10.1 \
  prettier@~3.8

# Test
npm install -D vitest@~3.2 @vitest/coverage-v8@~3.2 jsdom
```

---

## Architecture Patterns

### System Architecture Diagram

```
                        Browser (recruiter / hiring manager)
                                       |
                                       | HTTPS GET /Portfolio_Website/
                                       v
                  +------------------------------------------+
                  |  GitHub Pages (static CDN)              |
                  |  - dist/index.html                       |
                  |  - dist/404.html (copy of index.html)    |
                  |  - dist/assets/*.js, *.css, *.woff2      |
                  |  - dist/assets/Eren-Atalay-CV.pdf        |
                  +-------------------+----------------------+
                                      |
                                      | initial paint
                                      v
                  +------------------------------------------+
                  |  index.html @ first paint                |
                  |  - <head>: <title>, OG meta, JSON-LD     |
                  |    Person, favicon, Tailwind CSS         |
                  |  - <body>: React mounts <App />          |
                  +-------------------+----------------------+
                                      |
                                      v
                              +---------------+
                              |   <App />     |  reads ?view= via useQueryParams() hook
                              +-------+-------+
                                      |
                            +---------+----------+
                            |                    |
                            v                    v
                     +---------------+    +---------------+
                     | <TextShell /> |    | <NotFound />  |
                     +-------+-------+    +---------------+
                             |             (rendered if path doesn't match
                             |              the base or fragment isn't a section)
                             v
              +------------+------------+------------+------------+----+
              |            |            |            |            |    |
        <StickyNav /> <HeroBlock/> <AboutSection/> ... (other 6 sections) ...
              |            |            |
              | reads SECTIONS const for nav links
              | reads identity from src/content/identity.ts
              | renders email via <EmailReveal />
              v
        +-----------------+
        |  src/content/*  |  identity / projects / certs / skills / education /
        |  src/lib/*      |  obfuscate / useReducedMotion / useQueryParams
        +-----------------+
                                      |
                                      v
                         User clicks bracket-link
                         OR enters with ?focus=projects
                                      |
                                      v
                         scrollIntoView({behavior: 'smooth' | 'auto'})
                         based on prefers-reduced-motion
```

**Trace the primary use case (recruiter on Slow 4G):** `https://eren-atalay.github.io/Portfolio_Website/` → GH Pages serves `dist/index.html` → browser parses `<head>` (CSS + font preload + JSON-LD) → React mounts `<App />` → `<App />` returns `<TextShell />` synchronously → first paint renders the hero block including all four `<a>` tags. The CV PDF link is reachable as a real anchor before any JavaScript runs (it's part of the rendered React tree synchronously, no Suspense, no lazy import).

### Recommended Project Structure

```
Portfolio_Website/
├── .github/workflows/
│   └── deploy.yml                       # Phase 1 deploys
├── .planning/
│   ├── CHECKLIST-OPSEC.md               # Created in Phase 1, used by every release
│   └── phases/01-...                    # planning artifacts (already exists)
├── public/
│   ├── assets/
│   │   ├── Eren-Atalay-CV.pdf           # EXIF stripped
│   │   └── og-image.png                 # 1200×630
│   ├── favicon.svg                      # Initials "EA" in #7ee787
│   ├── favicon-32.png                   # PNG fallback
│   ├── manifest.webmanifest
│   ├── robots.txt                       # User-agent: * / Allow: /
│   └── sitemap.xml                      # Single URL: project base
├── src/
│   ├── app/
│   │   ├── App.tsx                      # Top-level shell selector (Phase 1: always TextShell)
│   │   ├── main.tsx                     # createRoot, font CSS imports
│   │   └── routes.ts                    # (small) — read query params, decide what to render
│   ├── shells/
│   │   └── TextShell.tsx                # Phase 1 only shell (Phase 2 adds ThreeDShell)
│   ├── sections/
│   │   ├── Hero.tsx                     # whoami block + 4 contact links
│   │   ├── About.tsx
│   │   ├── Skills.tsx
│   │   ├── Projects.tsx
│   │   ├── Certs.tsx
│   │   ├── Writeups.tsx                 # placeholder copy in Phase 1
│   │   └── Contact.tsx
│   ├── ui/
│   │   ├── BracketLink.tsx              # The single-source-of-truth [bracket] anchor
│   │   ├── StickyNav.tsx
│   │   ├── EmailReveal.tsx              # Click-to-reveal button → mailto anchor
│   │   ├── SkipToContent.tsx
│   │   ├── TerminalPrompt.tsx           # Used by section headings ($ cat / $ ls prefix)
│   │   ├── ProjectRow.tsx
│   │   ├── CertRow.tsx
│   │   └── NotFound.tsx                 # 404 component, mounted when path doesn't resolve
│   ├── content/
│   │   ├── identity.ts                  # Identity type + values
│   │   ├── projects.ts                  # Project[]
│   │   ├── certs.ts                     # Cert[]
│   │   ├── skills.ts                    # SkillTag[]
│   │   ├── education.ts                 # EducationEntry[]
│   │   ├── sections.ts                  # SECTIONS const — single source of truth for nav + 404
│   │   └── index.ts                     # barrel export
│   ├── lib/
│   │   ├── obfuscate.ts                 # Email encode/decode utility
│   │   ├── useQueryParams.ts            # ?view, ?focus reading hook
│   │   ├── useReducedMotion.ts          # matchMedia hook
│   │   └── baseUrl.ts                   # tiny helper around import.meta.env.BASE_URL
│   └── styles/
│       └── tokens.css                   # @import "tailwindcss"; @theme block
├── tests/                               # OR src/**/*.test.ts — Vitest accepts both
│   ├── obfuscate.test.ts
│   ├── useQueryParams.test.ts
│   └── useReducedMotion.test.ts
├── .gitignore                           # node_modules, dist, .DS_Store, coverage
├── .prettierrc.json                     # tabWidth: 2, semi: true, singleQuote: true, etc.
├── .prettierignore
├── eslint.config.js                     # Flat config
├── index.html                           # Vite entry; <head> has OG/JSON-LD/preload
├── package.json
├── tsconfig.json                        # Project references not needed for Phase 1
├── tsconfig.node.json                   # For vite.config.ts type-checking
└── vite.config.ts                       # base: '/Portfolio_Website/' + plugins
```

**Why this structure:**

- **`src/app/`** — top-level orchestration. In Phase 1 it's tiny; Phase 2 adds the `<ThreeDShell />` lazy branch here without touching any section component.
- **`src/shells/`** — keeps the door open for Phase 2's lazy 3D shell. In Phase 1 only `TextShell.tsx` exists; the directory's existence prevents future refactor pressure.
- **`src/sections/`** — one file per `<section>`. This is important for verification: a CI grep for "all 7 sections present" can match filenames directly.
- **`src/ui/`** — building blocks reused across sections. `BracketLink` is consumed by sticky nav, hero, skills, project rows, 404 sitemap fallback — it cannot drift.
- **`src/content/`** — typed `as const` arrays. The `sections.ts` const is consumed by the sticky nav, the 404 sitemap fallback, and (Phase 2 onwards) the 3D camera focus presets. **It is the single source of truth for the section list and must never be hardcoded a second time.**
- **`src/lib/`** — pure utility functions. Vitest tests live next to or in `tests/`.
- **`src/styles/tokens.css`** — the only CSS file Phase 1 needs. Imports Tailwind v4 and declares the `@theme` block from `01-UI-SPEC.md`.

### Pattern 1: Vite Config for GitHub Pages

```typescript
// vite.config.ts
// Source: https://vite.dev/guide/static-deploy (verified 2026-05-06)
// Source: https://tailwindcss.com/docs/installation/using-vite (verified 2026-05-06)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Single source of truth for the GH Pages base path.
// Used by:
//   - Vite for asset URL rewriting at build time
//   - import.meta.env.BASE_URL at runtime (Vite injects this from `base`)
// If we ever move to a custom domain, change to '/' here only.
const BASE = '/Portfolio_Website/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    sourcemap: false, // OPSEC — research/SUMMARY.md flagged this gap
    target: 'es2022',  // React 19 + modern browsers; Phase 4 may revisit if mobile QA flags
  },
  // Vite injects `import.meta.env.BASE_URL` from `base` automatically.
  // Code that builds asset URLs MUST use `import.meta.env.BASE_URL` (or a small helper)
  // so dev (`/`) and prod (`/Portfolio_Website/`) both work.
});
```

**Key mechanics:**

- `base` is the ONLY place the path appears in build config. `import.meta.env.BASE_URL` is statically replaced at build time and contains exactly the `base` value (with trailing slash).
- All asset URLs in JSX use `${import.meta.env.BASE_URL}assets/...` — for example, the CV link: `<a href={\`${import.meta.env.BASE_URL}assets/Eren-Atalay-CV.pdf\`} download>`. This handles both `/` (dev) and `/Portfolio_Website/` (prod).
- `sourcemap: false` is mandatory for OPSEC — source maps reveal full file paths, original variable names, and any not-yet-renamed-things. Phase 4 OPS-05 audit would flag this; we set it now.
- `[VERIFIED: vite.dev/guide/build — `import.meta.env.BASE_URL` is statically replaced; "this variable is statically replaced during build so it must appear exactly as-is"]`

### Pattern 2: Tailwind v4 + `@theme` Tokens

```css
/* src/styles/tokens.css
   Source: https://tailwindcss.com/blog/tailwindcss-v4 (verified 2026-05-06)
   Source: 01-UI-SPEC.md § Color § Tailwind v4 @theme token encoding */

@import "tailwindcss";

@theme {
  --color-bg:        #0d1117;
  --color-fg:        #c9d1d9;
  --color-accent:    #7ee787;
  --color-warn:      #e3b341;
  --color-negative:  #ff7b72;
  --color-muted:     #8b949e;
  --color-surface-1: #161b22;
  --color-focus:     #79c0ff;

  --font-mono:       'JetBrains Mono', ui-monospace, 'SF Mono', 'Menlo', 'Consolas', monospace;
}
```

```typescript
// src/app/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Font: import only the weights we actually use (per UI-SPEC: 400 + 600).
// These imports cause Vite to bundle the woff2 files and emit @font-face rules.
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';

// Tokens + Tailwind utilities
import '../styles/tokens.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

**Why this works:**

- Tailwind v4 reads `@theme` and exposes every token both as a CSS custom property AND as a Tailwind utility class. `--color-bg` becomes `bg-bg`, `text-bg`, `border-bg`, `outline-bg`. Same for `--font-mono` → `font-mono`. **No `tailwind.config.js`. No PostCSS config.**
- The `@import "tailwindcss"` is a single-line replacement for v3's three `@tailwind` directives.
- `[VERIFIED: tailwindcss.com/blog/tailwindcss-v4 — "Tailwind CSS v4.0 takes all of your design tokens and makes them available as CSS variables by default"]` `[VERIFIED: tailwind-css.colrlab.com — "No configuration file is needed with Tailwind CSS v4 and Vite"]`
- Phase 1 should NOT add a `tailwind.config.js`. If a reviewer pushes for one, that's a v3 instinct; v4's `@theme` is the modern path.

### Pattern 3: Self-Hosted JetBrains Mono (`@fontsource`)

**Imports (already shown in main.tsx above):**

```typescript
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';
```

**What this does behind the scenes:**

- `@fontsource/jetbrains-mono` ships per-weight CSS files (`/400.css`, `/600.css`, ...). Each CSS file declares an `@font-face` whose `src:` references woff2 files inside the package (e.g., `node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2`).
- Vite's static-asset pipeline resolves these `url(...)` references at build time, hashes the woff2 files, and emits them under `dist/assets/` — they are served from the `base` path along with everything else.
- `font-display: swap` is the package default, which is correct for a recruiter-grade site (text is legible immediately in the system fallback while the woff2 loads).
- Latin subset is the default for the unsuffixed import. To get other subsets, import e.g. `@fontsource/jetbrains-mono/cyrillic-400.css`.
- `[VERIFIED: fontsource.org/fonts/jetbrains-mono/install — `font-display: swap`, Latin subset is default unsuffixed]`
- `[CITED: aaronjbecker.com — Vite's static-asset pipeline handles `@fontsource` files automatically]`

**Preload optimization (in `index.html`):**

```html
<!-- index.html — preload only the regular weight, the most important one -->
<!-- Vite hashes the asset filename, so this preload tag would normally need to know
     the hashed name. The pragmatic answer: skip preload for Phase 1, rely on
     font-display: swap. Add a Vite plugin that injects preload tags in Phase 4
     polish if Lighthouse flags it. -->
<link rel="icon" type="image/svg+xml" href="/Portfolio_Website/favicon.svg" />
```

**Why we don't preload in Phase 1:** Vite hashes asset filenames at build time, so a hand-written `<link rel="preload" href="/assets/jetbrains-mono-latin-400-normal-{hash}.woff2">` would break on every rebuild. There are Vite plugins that auto-inject preload tags but adding one to Phase 1 is over-engineering — `font-display: swap` is the WCAG-compliant fallback already, and the woff2 files at weight 400 are ~30 KB each so the cost is minor on Slow 4G. **Defer preload optimization to Phase 4 (OPS-03 Lighthouse pass)** — if it surfaces as a problem, fix then.

### Pattern 4: Query-Param Routing Without React Router

```typescript
// src/lib/useQueryParams.ts
//
// Reads URL query params (?view=text|3d&focus=projects&...) reactively.
// Subscribes to popstate AND a custom 'qpchange' event we dispatch on programmatic
// updates so all consumers stay in sync. No React Router; no routing library at all.
//
// Source: react.dev/reference/react/useSyncExternalStore (verified pattern for
//   subscribing to browser-tier external state in React 19)

import { useSyncExternalStore } from 'react';

function getSnapshot(): URLSearchParams {
  // URLSearchParams is a stable iterable but its identity changes on every read.
  // To avoid useSyncExternalStore tearing detection rejecting it, we serialize
  // the search string and keep one cached parsed instance per string.
  return new URLSearchParams(window.location.search);
}

let cached: { search: string; params: URLSearchParams } | null = null;
function getCachedSnapshot(): URLSearchParams {
  const search = window.location.search;
  if (cached && cached.search === search) return cached.params;
  cached = { search, params: new URLSearchParams(search) };
  return cached.params;
}

function subscribe(notify: () => void): () => void {
  window.addEventListener('popstate', notify);
  window.addEventListener('qpchange', notify);
  return () => {
    window.removeEventListener('popstate', notify);
    window.removeEventListener('qpchange', notify);
  };
}

export function useQueryParams(): URLSearchParams {
  return useSyncExternalStore(subscribe, getCachedSnapshot);
}

export function setQueryParams(updates: Record<string, string | null>): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, '', url.toString());
  window.dispatchEvent(new Event('qpchange'));
}
```

**Hash-anchor coexistence:**

- Native `<a href="#projects">` clicks update `window.location.hash` and trigger native smooth scroll (because `<html style="scroll-behavior: smooth">` is set in CSS, gated by `motion-reduce` to disable for that media query).
- Query params (`?focus=projects`) are READ by a one-shot `useEffect` in `<App />` on mount that calls `scrollIntoView` on the matching `<h2>`. After scrolling, we clear `?focus` via `setQueryParams({focus: null})` so refreshing doesn't re-scroll.
- Hash and query-param can coexist (`?view=text#projects`) — each subsystem reads its own slice.

**404 path matching:**

- `dist/404.html` is a copy of `dist/index.html`. When GH Pages serves `404.html` for an unknown path, React mounts and reads `window.location.pathname`.
- Logic: `if (pathname !== BASE && !pathname.startsWith(BASE))` then we're at a wrong URL — render `<NotFound />`. Otherwise normal `<TextShell />`. 
- Edge case: `https://eren-atalay.github.io/Portfolio_Website/anything-here` — pathname is `/Portfolio_Website/anything-here`, GH Pages serves 404.html, React sees pathname doesn't match `BASE` exactly → renders `<NotFound />`. The `bash: cd: ...` line uses `pathname.replace(BASE, '/')` so the user sees what they typed.
- `[VERIFIED: dev.to/lico — "include this copy command in your build script ... ensures GitHub Pages correctly redirects all internal routes in your SPA"]`

### Pattern 5: Hero Block — First-Paint Markup (TXT-02)

```tsx
// src/sections/Hero.tsx
//
// CRITICAL: This component MUST render synchronously, not behind any Suspense
// or React.lazy boundary. The four contact anchors have to exist in the
// rendered HTML at first paint so a recruiter on Slow 4G can see and tap
// them before any JavaScript runs.
//
// Source: 01-CONTEXT.md D-02, D-03; 01-UI-SPEC.md § Copywriting Contract § Hero block

import { identity } from '../content/identity';
import { EmailReveal } from '../ui/EmailReveal';

const BASE = import.meta.env.BASE_URL;

export function Hero() {
  return (
    <section id="hero" className="pt-12 md:pt-16 pb-8">
      <pre className="font-mono text-fg whitespace-pre-wrap">
        <span className="text-accent">$ </span>whoami{'\n'}
        {identity.name} — {identity.role} ({identity.location}){'\n'}
        <span className="text-accent">█</span>{'\n'}
        {'\n'}
        <span className="text-accent">$ </span>links --all{'\n'}
        {/* The four conversion anchors. Real <a> tags. */}
        <a
          href={`${BASE}assets/${identity.cvFilename}`}
          download
          className="text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
        >
          [CV]
        </a>
        {'  '}
        <a
          href={identity.github}
          target="_blank"
          rel="noopener noreferrer"
          className="..."
        >
          [GitHub]
        </a>
        {'  '}
        <a
          href={identity.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="..."
        >
          [LinkedIn]
        </a>
        {'  '}
        <EmailReveal />
      </pre>
    </section>
  );
}
```

**Verification mechanic:** A simple grep on `dist/index.html` after build can confirm the four destination anchors are present. The CI workflow already runs the build; adding a verification step is cheap:

```yaml
- name: Verify recruiter contract anchors present in rendered HTML
  run: |
    grep -E 'href="[^"]*assets/Eren-Atalay-CV.pdf"' dist/index.html || (echo "CV link missing" && exit 1)
    grep -E 'href="https://github.com/' dist/index.html || (echo "GitHub link missing" && exit 1)
    grep -E 'href="https://(www\.)?linkedin.com/' dist/index.html || (echo "LinkedIn link missing" && exit 1)
```

> Note: React on the client hydrates these anchors so they're identical post-mount. Because there's no SSR, this grep checks the *static* `dist/index.html` Vite emits — which contains only the React root div and bundled JS, NOT the rendered hero markup. The grep will FAIL on a vanilla SPA build. **Therefore: the CI verification step is a runtime smoke test using a headless browser, OR we accept that the recruiter contract is enforced by code review + the `<a>` tags being non-Suspended in the React tree.** Phase 1 pragmatic call: code review + a unit test that renders `<Hero />` to RTL/Vitest and asserts the four anchors exist. Defer headless smoke test to Phase 4 OPS-04.

### Pattern 6: 404 Component

```tsx
// src/ui/NotFound.tsx
//
// Source: 01-CONTEXT.md D-14; 01-UI-SPEC.md § Error / 404 state

import { SECTIONS } from '../content/sections';
import { BracketLink } from './BracketLink';

const BASE = import.meta.env.BASE_URL;

export function NotFound() {
  // Strip the base prefix so the user sees what they typed, not the GH Pages prefix.
  const requested = window.location.pathname.replace(BASE, '/');

  return (
    <main id="main" className="mx-auto max-w-[72ch] px-4 md:px-6 py-12 font-mono">
      <pre className="text-fg whitespace-pre-wrap">
        <span className="text-accent">$ </span>cd {BASE}{requested.slice(1)}{'\n'}
        <span className="text-negative">bash: cd: {requested}: No such file or directory</span>{'\n'}
        {'\n'}
        Try one of:{'\n'}
        {'  '}<span className="text-accent">$ </span>goto  {SECTIONS.map(s => (
          <BracketLink key={s.id} href={`${BASE}#${s.id}`}>{s.label}</BracketLink>
        )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, '  ', el], [] as React.ReactNode[])}
        {'\n\n'}
        or <BracketLink href={BASE}>home</BracketLink>
      </pre>
    </main>
  );
}
```

**The 404 component renders out of `dist/404.html` (a copy of `dist/index.html`).** When GH Pages serves `404.html`, the React tree mounts as normal; `<App />` checks the pathname, decides this is a 404, mounts `<NotFound />` instead of `<TextShell />`. Same bundle, same CSS, same fonts. No two builds.

### Pattern 7: Email Obfuscation

```typescript
// src/lib/obfuscate.ts
//
// Email obfuscation utility. JS-decoded; raw `mailto:` never appears in source HTML.
//
// Algorithm choice: rot13 + base64.
//   - rot13 alone is too well-known; bots scan for ROT13(mailto).
//   - base64 alone is the second most-scanned obfuscation.
//   - Combining them (rot13 first, then base64) defeats single-pass naive scanners.
//   - Both are reversible without secrets, which is what we want — this is
//     anti-scrape, not encryption.
//
// At build time, run `npm run encode-email` (a small Node script) to produce
// the encoded string from the plaintext. The plaintext NEVER appears in the
// shipped JS bundle.
//
// Source: 01-CONTEXT.md D-03; TXT-04; research/PITFALLS.md Pitfall 5;
//   research/STACK.md § Email Obfuscation Strategy

const rot13 = (s: string): string => s.replace(/[a-zA-Z]/g, (c) => {
  const base = c <= 'Z' ? 65 : 97;
  return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
});

const ENCODED_EMAIL = '...'; // Filled at content-population time. See content/identity.ts.

export function decodeEmail(encoded: string = ENCODED_EMAIL): string {
  // base64 decode → rot13 unscramble → plaintext email
  return rot13(atob(encoded));
}

export async function revealEmail(): Promise<string> {
  const email = decodeEmail();
  // Fire-and-forget clipboard write. Doesn't gate the reveal on success.
  try { await navigator.clipboard?.writeText(email); } catch { /* JS-disabled or blocked */ }
  return email;
}
```

```tsx
// src/ui/EmailReveal.tsx
import { useState } from 'react';
import { revealEmail } from '../lib/obfuscate';

export function EmailReveal() {
  const [email, setEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (email) {
    return (
      <>
        <a
          href={`mailto:${email}`}
          className="text-accent hover:underline ..."
        >
          [{email}]
        </a>
        {copied && (
          <span className="ml-2 text-muted text-sm motion-reduce:transition-none">
            (copied)
          </span>
        )}
      </>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const decoded = await revealEmail();
        setEmail(decoded);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-focus"
    >
      [email (click to reveal)]
    </button>
  );
}
```

**JS-disabled fallback:** The `<button>` is rendered server-side (well, statically in `index.html` after React hydrates) but its `onClick` requires JS. With JS off, the button is inert: the user sees `[email (click to reveal)]` and nothing happens on click. **No raw `mailto:` is ever in the source HTML at any moment, on any path.** Scrapers running without a JS engine see only the encoded string in the shipped bundle plus the literal text "[email (click to reveal)]" in the button — neither is a harvestable address.

### Pattern 8: `prefers-reduced-motion` Hook + Tailwind Variants

```typescript
// src/lib/useReducedMotion.ts
import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

const subscribe = (notify: () => void) => {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', notify);
  return () => mql.removeEventListener('change', notify);
};

const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false; // SSR fallback (we don't SSR but be safe)

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

**Use site:**

```tsx
const reduced = useReducedMotion();

// In handleAnchorClick:
heading.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
```

**Tailwind variants for CSS-only animations:**

- `motion-safe:animate-pulse` — only animate when motion is allowed
- `motion-reduce:animate-none` — explicitly remove a pre-existing animation when reduced

**The hero cursor block** (the only animated element in Phase 1) is a small `<span>` with class `motion-safe:animate-cursor-blink` (define `@keyframes cursor-blink` in `tokens.css`). When `prefers-reduced-motion: reduce`, the keyframe never plays and the cursor renders as static `█`. `[VERIFIED: tailwindcss.com/docs/transition-property — motion-safe and motion-reduce wrap rules in `@media (prefers-reduced-motion: ...)`]`

### Pattern 9: SEO + JSON-LD Person Schema

**`index.html` head block (Vite leaves this untouched, it's the Phase 1 author's responsibility):**

```html
<!DOCTYPE html>
<html lang="en" class="motion-safe:scroll-smooth">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/svg+xml" href="/Portfolio_Website/favicon.svg" />
    <link rel="alternate icon" type="image/png" href="/Portfolio_Website/favicon-32.png" />
    <link rel="manifest" href="/Portfolio_Website/manifest.webmanifest" />
    <meta name="theme-color" content="#0d1117" />
    <meta name="color-scheme" content="dark" />

    <title>Eren Atalay — Junior Cybersecurity Analyst</title>
    <meta name="description" content="Eren Atalay — Junior Cybersecurity Analyst (UK). CV, projects, certifications, and home-lab write-ups." />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="Eren Atalay — Junior Cybersecurity Analyst" />
    <meta property="og:description" content="CV, projects, certifications, and home-lab write-ups." />
    <meta property="og:url" content="https://eren-atalay.github.io/Portfolio_Website/" />
    <meta property="og:image" content="https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />

    <!-- JSON-LD Person schema -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Eren Atalay",
      "jobTitle": "Junior Cybersecurity Analyst",
      "url": "https://eren-atalay.github.io/Portfolio_Website/",
      "homeLocation": {
        "@type": "Place",
        "name": "United Kingdom"
      },
      "sameAs": [
        "https://github.com/eren-atalay",
        "https://www.linkedin.com/in/<handle>"
      ],
      "image": "https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png"
    }
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/app/main.tsx"></script>
  </body>
</html>
```

**Why JSON-LD in `index.html` directly (not injected at runtime):**

- Static is what we want. Crawlers (Google, Perplexity, ChatGPT browse) read JSON-LD without executing JS in many configurations. Putting it in `<head>` of `index.html` is the lowest-friction win.
- Generating it at build time (e.g., via a Vite plugin reading `src/content/identity.ts`) is over-engineering for Phase 1 — there's exactly ONE Person record. Manually keeping `index.html`'s JSON-LD in sync with `identity.ts` is a documented step in the OPSEC checklist.
- `email` field is **NOT** included in the JSON-LD — exposing the obfuscated email there would defeat the obfuscation. This is a deliberate trade-off; if SEO benefit of structured email turns out to matter, revisit in v2.

**Recommended fields (HIGH confidence):**

- `name`, `jobTitle`, `url`, `sameAs` — these are the four every Person example shows. `[CITED: jsonld.com/person/]`
- `homeLocation` (preferred over `nationality` for portfolio context — recruiter cares "where can this person work" not "what passport"). `[CITED: aubreyyung.com/person-schema-markup/]`
- `image` — the OG image doubles as the JSON-LD image. Standard pattern.

**Optional fields (MEDIUM confidence — defer to taste):**

- `alumniOf` — only if Eren wants the university surfaced in structured data. Adds a `Place` or `EducationalOrganization` sub-object.
- `knowsAbout` — could list cybersecurity subdomains. Risk: smells like skill-bar-equivalent if overused.

### Pattern 10: ESLint 9 Flat Config

```javascript
// eslint.config.js
// Source: dev.to/_d7eb1c1703182e3ce1782 (ESLint + Prettier Setup ... 2026)
// Source: typescript-eslint.io/getting-started/legacy-eslint-setup
// Source: github.com/jsx-eslint/eslint-plugin-jsx-a11y (recommended config)

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Hooks discipline
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // jsx-a11y additions on top of the recommended preset:
      // - anchor-is-valid: enforced — every `<a>` must have an href.
      //   This is non-negotiable: TXT-04 forbids placeholder anchors and
      //   the [bracket]-link aesthetic is anchor-heavy.
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      // - We rely heavily on rel="noopener noreferrer" (OPSEC checklist).
      'react/jsx-no-target-blank': 'off', // covered by jsx-a11y if applicable
    },
  },
  // ALWAYS LAST: turn off all rules that conflict with Prettier.
  prettierConfig,
);
```

**Key principles:**

- Flat config (`eslint.config.js`), NOT `.eslintrc.cjs`. ESLint 9+ defaults to flat.
- `eslint-config-prettier` goes LAST so it disables formatting rules from earlier configs.
- `eslint-plugin-prettier` is **NOT** installed — modern best practice runs Prettier separately. `[CITED: dev.to "ESLint + Prettier Setup The Complete Developer Configuration Guide (2026)" — "the old pattern of using eslint-plugin-prettier to run Prettier as an ESLint rule is now discouraged"]`
- Recommended jsx-a11y rules are imported via `jsxA11y.flatConfigs.recommended`. `[VERIFIED: github.com/jsx-eslint/eslint-plugin-jsx-a11y README — "jsxA11y.flatConfigs.recommended"]`
- For terminal-heavy anchor markup, `anchor-is-valid` and `anchor-has-content` are explicitly elevated to `error` so the `[bracket]` pattern can't drift into placeholder anchors.

```json
// .prettierrc.json
{
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "arrowParens": "always"
}
```

```json
// .prettierignore
node_modules
dist
coverage
public
```

### Pattern 11: Deploy Pipeline — `.github/workflows/deploy.yml`

```yaml
# .github/workflows/deploy.yml
# Source: github.com/actions/deploy-pages (verified 2026-05-06; v5.0.0 is latest)
# Source: vite.dev/guide/static-deploy (recommended workflow)
# Source: 01-CONTEXT.md D-15, D-16, D-17

name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment; do not cancel in-progress runs
# (an in-progress deploy that finishes is preferred over a cancelled one).
concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v6     # v6.4.0 latest
        with:
          node-version: '22'             # Vite 8 requires Node 20.19+ or 22.12+
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      # CI gates — all blocking. Run BEFORE build so a typo doesn't waste a deploy.
      - name: TypeScript typecheck
        run: npx tsc --noEmit

      - name: ESLint
        run: npx eslint .

      - name: Prettier check
        run: npx prettier --check .

      # OPSEC: install exiftool, strip metadata in public/assets/, verify clean.
      - name: Install exiftool
        run: |
          sudo apt-get update
          sudo apt-get install -y libimage-exiftool-perl

      - name: Strip metadata from public/assets
        run: |
          # -all= : remove all writable tags
          # -P    : preserve file modification date (so cache headers don't churn)
          # -overwrite_original : modify in place
          exiftool -all= -P -overwrite_original public/assets/*

      - name: Verify no metadata remains (fail build if any present)
        run: |
          # exiftool prints metadata if any exists. -S is short tag mode.
          # We accept ONLY these system tags: ExifToolVersion, FileSize, FileType,
          # FileTypeExtension, MIMEType, Directory, FileName, FilePermissions,
          # FileModifyDate, FileAccessDate, FileInodeChangeDate.
          # Anything else (Author, GPS*, CreatorTool, etc.) fails the build.
          for f in public/assets/*; do
            offending=$(exiftool -S -ExifToolVersion= -FileSize= -FileType= \
              -FileTypeExtension= -MIMEType= -Directory= -FileName= \
              -FilePermissions= -FileModifyDate= -FileAccessDate= \
              -FileInodeChangeDate= "$f")
            if [ -n "$offending" ]; then
              echo "OPSEC FAIL: $f still contains metadata:"
              echo "$offending"
              exit 1
            fi
          done

      - name: Build (Vite)
        run: npm run build

      - name: Copy index.html → 404.html for SPA fallback
        run: cp dist/index.html dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v6  # v6.0.0 latest

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v5  # v5.0.0 latest
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5  # v5.0.0 latest
```

**Notes:**

- `permissions:` block at the workflow level is required by the deploy action. `[VERIFIED: github.com/actions/deploy-pages README — "this job must have minimum pages: write and id-token: write permissions"]`
- The `environment: github-pages` block is required so GH Pages writes to the right place. `[VERIFIED: same README — "an environment must be established"]`
- Action versions verified live: `actions/deploy-pages@v5.0.0`, `actions/upload-pages-artifact@v5.0.0`, `actions/configure-pages@v6.0.0`, `actions/setup-node@v6.4.0`. `[VERIFIED: GitHub releases API on 2026-05-06]`
- One-time manual step (NOT in the workflow): in repo Settings → Pages → Source, set to "GitHub Actions". Without this, the workflow runs but GH Pages won't pick up the artifact. Document in PR description / README.
- Node version 22 chosen because Vite 8 requires Node 20.19+ or 22.12+; pinning to 22 is forward-compatible and matches what most CI cache hits will use. `[VERIFIED: medium.com/@onix_react/vite-8-0-released-fbf23ade5f79 — "Vite 8 requires Node.js 20.19+ or 22.12+"]`

### Pattern 12: Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "encode-email": "node scripts/encode-email.mjs"
  }
}
```

- `build` runs typecheck first (locally — CI runs them as separate steps for visibility).
- `encode-email` is a tiny Node script that takes a plaintext email from `stdin` and prints the rot13+base64 string. Used at content-population time to fill the encoded constant in `src/content/identity.ts`. NOT run in CI. The plaintext never enters the bundle.
- No `deploy` script — deploy is owned by GitHub Actions per D-15.
- No `size-limit` script — deferred to Phase 2 OPS-02 per D-16.

### Anti-Patterns to Avoid

- **`tailwind.config.js`** — v3 instinct. v4 uses `@theme` in CSS. Don't add it.
- **`postcss.config.js`** — same. The `@tailwindcss/vite` plugin handles everything.
- **`.eslintrc.cjs`** — legacy. ESLint 9 flat config (`eslint.config.js`) is the only path.
- **`eslint-plugin-prettier`** — runs Prettier as a lint rule. Slow. Discouraged. Use `eslint-config-prettier` (config only) and run Prettier separately.
- **`framer-motion`** — legacy package name. Phase 1 has no animation library at all (the only animation is the cursor blink, done in plain CSS). Don't install Motion in Phase 1; it lands in Phase 2 if needed.
- **`react-router` / `react-router-dom`** — D-03 forbids it. Phase 1 routes via query params + hash anchors only.
- **`mailto:` in any rendered HTML, ever** — TXT-04. The encoded string gets decoded at click time only.
- **Pure `#000` + `#0f0`** — REQUIREMENTS.md. UI-SPEC pins `#0d1117` + `#7ee787`.
- **Skill bars / star ratings** — REQUIREMENTS.md. Plain `[tag]` list only.
- **A second hardcoded section list** — anywhere other than `src/content/sections.ts`. The sticky nav, 404 sitemap, and (Phase 2) camera presets all import from the const.
- **Sourcemaps in production** (`build.sourcemap: true`) — leaks file paths. OPSEC violation.
- **`import * as everything from 'react'`** — Vite tree-shaking gotcha plus lint noise. Always named imports.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted font with `@font-face` declarations | Hand-written `@font-face { src: url('./fonts/...woff2') }` blocks | `@fontsource/jetbrains-mono` | `@fontsource` ships subsetted woff2 files plus per-weight CSS imports. Hand-rolling gets the `font-display`, `unicode-range`, and Vite asset-hashing wrong on the first try. |
| Email obfuscation | A novel encoding scheme | rot13 + base64 (or any well-known reversible pair) | Don't invent crypto. The threat model is "naive HTML scraper that doesn't run JS"; well-known reversible encodings already defeat that. A custom scheme just makes the JS bundle larger without adding security. |
| Query-param state sync | A custom store with manual `popstate` listeners and re-render coordination | `useSyncExternalStore` (React 19 stdlib) | `useSyncExternalStore` is the right pattern for browser-tier external state. It handles tearing detection across concurrent renders for free. |
| `prefers-reduced-motion` | Reading `window.matchMedia` once on mount | `useSyncExternalStore` + `matchMedia.addEventListener('change', …)` | Users can toggle reduced motion mid-session (especially on macOS). One-shot reads miss this. |
| 404 fallback for SPA on GH Pages | A redirect script in `404.html` (the `spa-github-pages` `204` shim) | `cp dist/index.html dist/404.html` in CI | The shim works but adds a same-origin redirect roundtrip. The copy approach is one shell line in CI and serves the bundle directly. |
| WCAG contrast verification | Eyeballing the palette | `npx tailwind-contrast-check` or run an ASVS-class contrast tool against the eight tokens | UI-SPEC already verified 7.5:1 to 12.32:1 ratios; any future palette tweak should re-run a contrast tool. |
| EXIF stripping pipeline | Rolling a Node script with `sharp` | `exiftool -all= -P -overwrite_original` in CI | `exiftool` is the canonical metadata tool; `sharp` re-encodes images and changes pixel data unnecessarily for non-image assets like PDFs. |
| Person JSON-LD schema | Inventing a JSON shape | The Schema.org Person spec verbatim | Crawlers (Google's structured data tool, ChatGPT browse, Perplexity) parse the standard shape. Inventing fields gets ignored. |
| Sticky nav with current-section detection (`aria-current="page"`) | A scroll listener with `IntersectionObserver` and state | Defer until Phase 2; Phase 1 ships without it (UI-SPEC permits this) | `aria-current` while scrolling is genuinely complex; UI-SPEC explicitly allows skipping in Phase 1. Don't half-build it. |
| Smooth scroll | A custom RAF easing function | Native `scrollIntoView({ behavior: 'smooth' })` + `motion-reduce` Tailwind variant on `<html scroll-smooth>` | Browser-native is correct, accessible, and performant. |

**Key insight:** Phase 1's whole value is "boring, correct, fast". Every "optimization" or "cute helper" added here either (a) gets thrown out in Phase 2 when R3F arrives, or (b) makes the recruiter contract harder to verify. Default to standard library + Vite/Tailwind primitives.

---

## Runtime State Inventory

> N/A — Phase 1 is greenfield (the repo has no `src/`, no `package.json`). There is no pre-existing runtime state to migrate, no string-rename surface, no installed packages with stale names. This section is included for completeness so the planner can confirm none was missed.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no databases, no datastores, no Redis, no SQLite, no IndexedDB use planned in Phase 1 | None |
| Live service config | None — only GitHub Pages + the workflow file we'll write. No external services configured. | The one-time manual step (Settings → Pages → Source: GitHub Actions) is documented in the deploy section. |
| OS-registered state | None — no Windows Task Scheduler, no launchd, no systemd, no pm2 | None |
| Secrets / env vars | None — Phase 1 has no environment-specific values. `VITE_FORM_ENDPOINT` (Phase 4) is not introduced yet. | None |
| Build artifacts / installed packages | None — no `node_modules` exists yet; will be generated at first `npm install` | The `.gitignore` MUST include `node_modules`, `dist`, `coverage` from the first commit. |

---

## Common Pitfalls

### Pitfall 1: Vite `base` mismatch breaks deploy without a clean error

**What goes wrong:** Site loads from `https://eren-atalay.github.io/Portfolio_Website/` but assets 404 because they're requested at `/assets/foo.js` instead of `/Portfolio_Website/assets/foo.js`.

**Why it happens:** `vite.config.ts` is set correctly but a hand-written asset path in JSX uses `/assets/...` directly instead of `${import.meta.env.BASE_URL}assets/...`. The bug is invisible in `npm run dev` (where base is `/`) and only manifests in production.

**How to avoid:**
- Make `import.meta.env.BASE_URL` a single-import helper: `src/lib/baseUrl.ts` exports `BASE = import.meta.env.BASE_URL`. Every asset URL in JSX uses this constant.
- Add a verification step: `npx vite preview` locally before the first deploy. `vite preview` simulates the production base path. If links break in `preview` they'll break on GH Pages.
- Vite docs: `import.meta.env.BASE_URL` "is statically replaced during build so it must appear exactly as-is" — `import.meta.env['BASE_URL']` (bracket form) does NOT work.

**Warning signs:**
- Console shows `Failed to load resource: the server responded with a status of 404 (Not Found)` for `/assets/index-*.js`
- Network tab shows requests for `/assets/...` instead of `/Portfolio_Website/assets/...`
- Site works locally but breaks on GH Pages

**Sources:** `[VERIFIED: vite.dev/guide/build]` `[CITED: medium.com/@aleksej.gudkov/resolving-vite-v5-4-2-build-404-error-e1f13914f2d7]`

### Pitfall 2: GH Pages source not set to "GitHub Actions"

**What goes wrong:** Workflow runs successfully, artifact uploads, deploy step "succeeds", but the live site never updates. Or the deploy step fails with `HTTP 404` from the deploy-pages action.

**Why it happens:** GitHub Pages has a one-time settings toggle (Settings → Pages → Source) that defaults to "Deploy from a branch" (the legacy `gh-pages` branch model). The Actions workflow is ignored until the source is switched to "GitHub Actions".

**How to avoid:**
- Set the source manually before the first push to `main`. **This is not automatable** — there's no Actions API that can flip this for you (it's a security boundary).
- Document the one-time setup in the repo README's "Setup" section AND in the OPSEC checklist's "first deploy" item.
- If the deploy step fails with `Get Pages site failed`, that's the symptom — fix the toggle and re-run.

**Warning signs:**
- `actions/deploy-pages` fails with "Pages site is not enabled for this repository"
- Site at `https://eren-atalay.github.io/Portfolio_Website/` shows the README rendered (the legacy source) instead of the bundle

**Sources:** `[VERIFIED: github.com/actions/deploy-pages README]`

### Pitfall 3: Preload tag with stale hashed asset name

**What goes wrong:** `index.html` has `<link rel="preload" href="/Portfolio_Website/assets/font-{old-hash}.woff2">`. After a rebuild the hash changes; the preload tag points at a nonexistent file; the browser logs `404` and the font loads via the regular `@font-face` request (correctly, but with no preload benefit and a console error).

**Why it happens:** Vite hashes asset filenames at build time. A hand-written preload tag in `index.html` cannot know the hash.

**How to avoid:**
- **Phase 1: don't preload fonts.** `font-display: swap` is the WCAG-compliant fallback. The site is mono-font; FOUT (flash of unstyled text) is invisible because the system mono fallback (SF Mono / Consolas) is metric-similar.
- **Phase 4: add a Vite plugin** (`vite-plugin-html` or write a 30-line plugin) that injects preload tags AFTER hashing during the build. This is the right time because Phase 4 includes Lighthouse pass — if the font flash actually shows up on Lighthouse, fix it there.

**Warning signs:**
- Build emits warnings about unresolved preload references
- DevTools "Performance" tab shows the woff2 fetched twice (once by preload, once after the hash mismatch)

### Pitfall 4: JSON-LD `email` field exposes the obfuscated address

**What goes wrong:** Author copies a "complete" Person schema example that includes `"email": "eren@example.com"` and ships it. The whole obfuscation effort is undone — the email is now in plain text in `index.html`.

**Why it happens:** Person schema *can* include email. Copying-and-pasting an example without thinking about which fields apply to a privacy-conscious portfolio is the trap.

**How to avoid:**
- **`email` is forbidden in the JSON-LD.** Add this as an OPSEC checklist item.
- The decision is logged in CONTEXT.md / Claude's Discretion: "JSON-LD `Person` schema fields — `name`, `jobTitle`, `nationality` (or `homeLocation`), `url`, `sameAs` (GitHub + LinkedIn), `email` (obfuscated source), `image` ..." — the parenthetical "(obfuscated source)" should be read as "the source value comes from the obfuscated identity record, NOT shipped to JSON-LD". Phase 1 ships JSON-LD WITHOUT the email field at all.

**Warning signs:**
- Search the rendered `index.html` for `@example.com` (or the user's actual TLD) — should match zero times.
- A view-source pass surfaces `"email"` in the JSON-LD block.

### Pitfall 5: `prefers-reduced-motion` honoured in JS but not in CSS (or vice versa)

**What goes wrong:** The `useReducedMotion` hook is wired correctly for the smooth-scroll case, but the cursor blink keyframe runs unconditionally. Or the CSS uses `motion-safe:` correctly but a `setTimeout`-driven animation in JS keeps firing.

**Why it happens:** Reduced motion has TWO surfaces: CSS animations/transitions (covered by Tailwind `motion-reduce:` variants and `@media (prefers-reduced-motion: reduce)`) and JS-driven animations (require the hook). Forgetting one is easy.

**How to avoid:**
- **Phase 1 has exactly one animation in CSS** (cursor blink) and exactly one place where JS reads reduced motion (smooth-scroll behavior switch). Both are gated.
- Verification step in pre-publish OPSEC checklist: "With System Settings → Accessibility → Reduce Motion enabled, the cursor renders static AND smooth-scroll is instant."

**Warning signs:**
- macOS / iOS Settings → Reduce Motion enabled, cursor still blinks, OR scroll still smooths

### Pitfall 6: Sticky-nav over-scroll-margin trap on mobile

**What goes wrong:** User clicks `[projects]` on mobile; sticky nav has wrapped to 3 lines and is now ~120px tall; `scroll-margin-top: 80px` is too small; the section heading scrolls under the nav.

**Why it happens:** UI-SPEC pins `scroll-margin-top: 80px` based on a 1-line nav. When the nav wraps to 2-3 lines on `<768px` viewports, the margin is wrong.

**How to avoid:**
- Use a CSS custom property for the nav height: `:root { --nav-height: 80px; } @media (max-width: 768px) { :root { --nav-height: 140px; } }` and reference it as `scroll-margin-top: var(--nav-height)`.
- OR: measure nav height via `ResizeObserver` and set `--nav-height` programmatically. More accurate but more code.
- **Phase 1 pragmatic call:** static media-query approach is enough; nav wrap behaviour is bounded by the 6 link items in known fonts.

**Warning signs:**
- After clicking a sticky-nav link on a phone, the section heading is hidden behind the nav
- Cmd-F-jumping to a section anchor lands at a position where the heading is visually absent

### Pitfall 7: ESLint config silently does nothing

**What goes wrong:** `npm run lint` exits 0 because the flat config didn't match any files (e.g., the `files: ['**/*.{ts,tsx}']` glob is wrong, or a missing `import` in the config means nothing was parsed).

**Why it happens:** ESLint flat config is YOUR JS file — typos don't fail loudly. If a plugin's `flatConfigs.recommended` is mis-imported, it's a no-op object.

**How to avoid:**
- Add a deliberate "this should fail lint" test file (e.g., a `// eslint-disable-next-line` or an unused variable) and verify lint catches it.
- In the CI workflow, capture lint output and grep for the file count: `npx eslint . --format json > eslint-output.json` then check `jq length eslint-output.json` is non-zero (always — even if zero errors, the array of file results should be non-empty).
- Use `--max-warnings=0` in CI so warnings ARE failures.

**Warning signs:**
- Lint always passes, even on files you know have issues
- ESLint VSCode extension highlights problems but `npm run lint` doesn't catch them

### Pitfall 8: TS 5.9 picked up TS 6 type defs from a transitive dep

**What goes wrong:** `npm install` resolves `@types/react` to 19.2.x but a transitive dep pulls `@types/some-other-thing` whose type defs use a TS 6.x feature. Build fails with a cryptic type error referencing internal types.

**Why it happens:** TypeScript 6 just shipped (2026-05). Type-defs ecosystem is unsynchronized. Pinning `typescript` doesn't pin `@types/*` — those are independent packages.

**How to avoid:**
- Run `npm ls typescript` after install. If anything other than `~5.9` shows up at any depth, investigate.
- Use `overrides` in `package.json` to pin transitive dep versions if needed.
- CI runs `tsc --noEmit` early, so failures surface fast.

---

## Code Examples

### Section list (single source of truth)

```typescript
// src/content/sections.ts
//
// SINGLE SOURCE OF TRUTH for the section list. Consumed by:
//   - src/ui/StickyNav.tsx
//   - src/ui/NotFound.tsx (404 sitemap fallback)
//   - (Phase 2) the 3D camera focus presets
// Never hardcode this list a second time.
//
// Source: 01-CONTEXT.md D-04, D-06, D-14; 01-UI-SPEC.md § Source-of-Truth Cross-Reference

export const SECTIONS = [
  { id: 'about',     label: 'about',     heading: '$ cat about.md' },
  { id: 'skills',    label: 'skills',    heading: '$ ls skills/' },
  { id: 'projects',  label: 'projects',  heading: '$ ls projects/' },
  { id: 'certs',     label: 'certs',     heading: '$ ls certs/' },
  { id: 'writeups',  label: 'writeups',  heading: '$ ls writeups/' },
  { id: 'contact',   label: 'contact',   heading: '$ cat contact.md' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];
```

### Identity content type

```typescript
// src/content/identity.ts
//
// Source: 01-CONTEXT.md D-12; 01-UI-SPEC.md § Source-of-Truth Cross-Reference

export interface Identity {
  name: string;
  role: string;
  location: string;
  github: string;       // full URL
  linkedin: string;     // full URL
  emailEncoded: string; // rot13 + base64; decoded by src/lib/obfuscate.ts
  cvFilename: string;   // filename in public/assets/
}

export const identity: Identity = {
  name: 'Eren Atalay',
  role: 'Junior Cybersecurity Analyst',
  location: 'UK',
  github: 'https://github.com/eren-atalay',
  linkedin: 'https://www.linkedin.com/in/<handle-pending>',
  emailEncoded: 'PENDING_FILLED_BY_npm_run_encode-email',
  cvFilename: 'Eren-Atalay-CV.pdf',
};
```

### Cert content type with status enum

```typescript
// src/content/certs.ts

export type CertStatus = 'earned' | 'in-progress' | 'planned';

export interface Cert {
  name: string;
  status: CertStatus;
  /** YYYY-MM. Mandatory for 'earned' and 'in-progress'. Forbidden for 'planned'. */
  date?: string;
}

export const certs: Cert[] = [
  // Filled by Eren during/after planning.
];
```

### Skill tag content

```typescript
// src/content/skills.ts

export interface SkillTag {
  /** lowercase, single word or hyphen-joined; renders as `[python]`, `[active-directory]` */
  name: string;
}

export const skills: SkillTag[] = [
  // Filled by Eren during/after planning.
];
```

### Project content type

```typescript
// src/content/projects.ts
//
// Phase 1: 1-2 real GitHub repos + 1 honest 'in-progress' stub per D-13.

export type ProjectStatus = 'shipped' | 'in-progress' | 'planned';

export interface Project {
  slug: string;            // URL-safe; e.g. 'home-lab'
  tagline: string;         // single line, ≤80 chars; the em-dash-aligned text
  status: ProjectStatus;
  href?: string;           // GitHub repo URL or in-page anchor (#slug)
}

export const projects: Project[] = [
  // Example shape — Eren fills with real values:
  // { slug: 'home-lab', tagline: 'Splunk + pfSense + Wireshark home SOC, write-up planned', status: 'in-progress' },
];
```

### `<App />` skeleton (Phase 1, single shell)

```tsx
// src/app/App.tsx
//
// Phase 1: TextShell-only. Phase 2 will add the lazy ThreeDShell branch here
// — keep this component's structure stable so that diff is small.

import { useEffect } from 'react';
import { TextShell } from '../shells/TextShell';
import { NotFound } from '../ui/NotFound';
import { useQueryParams } from '../lib/useQueryParams';
import { useReducedMotion } from '../lib/useReducedMotion';

const BASE = import.meta.env.BASE_URL;

function isKnownPath(): boolean {
  const p = window.location.pathname;
  // Accept exactly the base, or base with a trailing fragment-only path.
  return p === BASE || p === BASE.slice(0, -1) || p === '/';
}

export default function App() {
  const params = useQueryParams();
  const reduced = useReducedMotion();

  // ?focus=projects → scroll to #projects after first paint.
  useEffect(() => {
    const focus = params.get('focus');
    if (!focus) return;
    const el = document.getElementById(focus);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    // Move focus to the heading for keyboard users.
    const heading = el.querySelector<HTMLElement>('h2');
    heading?.focus({ preventScroll: true });
  }, [params, reduced]);

  if (!isKnownPath()) return <NotFound />;
  return <TextShell />;
}
```

### Test example (Vitest + RTL pattern)

```typescript
// tests/obfuscate.test.ts
import { describe, expect, it } from 'vitest';
import { decodeEmail } from '../src/lib/obfuscate';

describe('decodeEmail', () => {
  it('round-trips a known plaintext through the encode→decode pipeline', () => {
    // The encode-email script produces this from 'eren@example.com':
    const encoded = '...'; // computed; see scripts/encode-email.mjs output
    expect(decodeEmail(encoded)).toBe('eren@example.com');
  });
});
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` + PostCSS plugin | `@import "tailwindcss"` + `@theme` block + `@tailwindcss/vite` plugin | Tailwind v4 (2024-2025) | No JS config file; tokens live in CSS; dramatically faster build. |
| `.eslintrc.cjs` legacy config | `eslint.config.js` flat config | ESLint 9 (2024) | Default; legacy requires explicit env var. Plugins distribute `flatConfigs.*` exports. |
| `eslint-plugin-prettier` running Prettier as a lint rule | Run Prettier separately; use only `eslint-config-prettier` to disable conflicting rules | 2024-2025 community consensus | Faster lint; clearer error messages; standard now. |
| `framer-motion` package | `motion` package, import from `motion/react` | 2025 (Framer rebrand) | Phase 1 uses neither; relevant for Phase 2+. |
| HashRouter / `404.html` redirect script for GH Pages SPA | `cp dist/index.html dist/404.html` in CI + base path | Verified standard pattern in 2025-2026 | Single CI line; no router needed for our use case. |
| Google Fonts CDN | `@fontsource/*` self-hosted via Vite static pipeline | Privacy-conscious sites adopted 2022+; standard for static-site dark-mode portfolios | Zero third-party domain; no GDPR/data-sharing issue; works offline. |
| Custom `useUrlParams` hook with `useState` + `popstate` | `useSyncExternalStore` based hook | React 18 (2022) onward | Tearing-safe; simpler; matches React 19 idioms. |

**Deprecated / outdated:**

- **Create React App** — deprecated by React team; no replacement plan beyond "use Vite or a framework".
- **`vite-plugin-mdx`** (third-party) — official path is `@mdx-js/rollup` (Phase 3 concern, listed for completeness).
- **`@react-three/a11y`** — last published May 2022 (verified). Build a real 2D fallback (which we are).
- **`gh-pages` npm package** — still works but `actions/deploy-pages` is the recommended path.

---

## Project Constraints (from CLAUDE.md)

The project's `CLAUDE.md` pins the following directives that this research already honours. Listed for the planner's verification step:

- **Tech stack:** React + R3F + Tailwind, building to a static bundle. Phase 1 omits R3F (added in Phase 2).
- **Hosting:** GitHub Pages — static files only. No SSR, no APIs.
- **Performance:** 3D scene must load on broadband; 2D fallback for slow / low-end devices. Phase 1 IS the fallback.
- **Privacy:** Real name + email public; email contact must resist spam scraping (obfuscation or contact form). Phase 1 obfuscates; Phase 4 adds the form.
- **Versions pinned (verified 2026-05-06 against npm registry):** React 19.2, TS 5.9 (NOT 6), Vite 8, Tailwind 4.2, ESLint 9 (NOT 10).
- **What NOT to use:** CRA, Next.js (anything other than static export), `@react-three/a11y`, `framer-motion` legacy package, `vite-plugin-mdx` third-party, Prism.js, Tailwind v3, `mailto:` raw HTML, `BrowserRouter` without 404.html shim. Phase 1 honours all of these.
- **GSD Workflow Enforcement:** Before using Edit/Write file-changing tools, start work through a GSD command. Phase 1 was scoped via `/gsd-discuss-phase` and is being researched via this command before planning.

---

## OPSEC Pipeline (`.planning/CHECKLIST-OPSEC.md`) — Recommended Content

Phase 1 deliverable: create `.planning/CHECKLIST-OPSEC.md` with the following ~25 items. The CI automation in `deploy.yml` (already specified above) handles items marked **[CI]**; the rest are manual review items that gate every release.

```markdown
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

- [ ] No `console.log` / `console.debug` in shipped JS. Verify: `grep -rE "console\\.(log|debug)" dist/assets/` returns nothing OR only the explicit `console.warn`/`console.error` we kept.
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

- [ ] Email is JS-decoded only. `grep -rE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' dist/index.html` returns nothing matching the actual address (only the obfuscated `ENCODED_EMAIL` string is in the bundle).
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
```

The checklist becomes a release gate documented in CONTRIBUTING.md (or equivalent) once Phase 1 ships.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Local dev + CI | (assume yes) | 22.x recommended | — |
| npm | Package install | (assume yes) | 10.x bundled with Node 22 | — |
| Git | Source control | ✓ (verified — repo exists) | — | — |
| GitHub repo with Pages capability | Deploy | (assume yes — `eren-atalay/Portfolio_Website`) | — | — |
| `exiftool` (in CI) | OPSEC strip / verify | ✓ (installable via apt-get on ubuntu-latest runner) | latest in Ubuntu repos | — |
| Modern browser | Local preview | (assume yes) | Chromium / Firefox / Safari | — |

**Missing dependencies with no fallback:** None expected. If Node version is older than 20.19, Vite 8 dev server will refuse to start — surface as a clear error in the README's "Prerequisites" section.

**Missing dependencies with fallback:** None for Phase 1.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vitest 3.2.4 fully supports Vite 8 in practice. The Vitest 3 docs reference Vite 5/6 explicitly. If `npm install` resolves a peer-dep conflict, the executor should fall through to Vitest 4. | Standard Stack — Dev/CI table | Phase 1 utility tests fail to run with `vitest@~3.2`. **Mitigation:** Plan task includes a verification step "run `npm test` after install"; if it fails, bump to `vitest@~4.1`. The test surface is small (3 utility tests) so the upgrade impact is minimal. |

**Everything else** in this research is verified against npm registry queries on 2026-05-06, official documentation (Vite, Tailwind, GitHub Actions, Schema.org, jsx-eslint), or pinned in `01-CONTEXT.md` / `01-UI-SPEC.md`. No other unverified claims.

---

## Open Questions

1. **OG image (`og-image.png`) authoring path.**
   - **What we know:** UI-SPEC pins it as a 1200×630 screenshot of the hero block + sticky nav.
   - **What's unclear:** Will Eren take this manually after the live site is up (chicken-and-egg — the image references a site that doesn't exist yet) or will Phase 1 ship a placeholder generated from a Figma / mockup?
   - **Recommendation:** Phase 1 ships a placeholder OG image (1200×630, accent green "EA" initials on `#0d1117`, a subtitle "Eren Atalay — Junior Cybersecurity Analyst (UK)"). After first deploy, Eren takes a real screenshot and replaces it; OPSEC checklist re-runs. Document as a Phase 1 "post-deploy task".

2. **LinkedIn handle.**
   - **What we know:** identity.ts will hold the URL.
   - **What's unclear:** The exact slug (`/in/<handle>`) — placeholder used throughout.
   - **Recommendation:** Phase 1 ships with a TODO comment in `identity.ts` and the OPSEC checklist verifies "no `<handle-pending>` placeholder in dist".

3. **CV PDF source-of-truth.**
   - **What we know:** Phase 1 ships the CV at `public/assets/Eren-Atalay-CV.pdf`, EXIF stripped.
   - **What's unclear:** Whether the CV master lives in this repo (LaTeX / DOCX in `/cv-source`) or externally (Eren rebuilds, exports, copies in).
   - **Recommendation:** Don't co-locate the CV master in the repo. Eren maintains separately, exports to PDF, drops the PDF in `public/assets/`, and CI strips metadata. Co-locating LaTeX adds complexity (TeXLive in CI) for no Phase 1 benefit.

4. **Whether `aria-current="page"` for the active section while scrolling is in or out of Phase 1.**
   - **What we know:** UI-SPEC § Anchor-link styling says it's optional in Phase 1; if skipped, document as deferred to Phase 2 view-toggle work.
   - **Recommendation:** Defer. It needs `IntersectionObserver` + state and is genuinely tricky to get right without flicker. Not on the recruiter contract critical path.

5. **Favicon authoring.**
   - **What we know:** UI-SPEC: `favicon.svg` (initials EA in `#7ee787`) + `favicon-32.png` fallback.
   - **What's unclear:** Whether to author the SVG by hand or generate from a tool (e.g., realfavicongenerator.net).
   - **Recommendation:** Hand-author the SVG (it's literally a `<rect>` background + a `<text>`); convert to PNG via `inkscape` or an online tool. Don't ship a 50-file `apple-touch-icon-*.png` farm — the SVG handles modern browsers and PNG fallback is enough.

---

## Validation Architecture

> SKIPPED: `workflow.nyquist_validation: false` in `.planning/config.json`. Phase 1 ships utility-only tests (Vitest) per CLAUDE.md and CI gates (typecheck + lint + format-check) per D-16. No requirement-to-test mapping, no Wave 0 gap analysis.

For reference: Phase 1's test surface is exactly three files — `obfuscate.test.ts`, `useQueryParams.test.ts`, `useReducedMotion.test.ts`. Run command: `npm test`. Coverage threshold not enforced in Phase 1; test-first not required (utilities are simple).

---

## Security Domain

Default-include because `security_enforcement` is not explicitly disabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Site is fully public; no login |
| V3 Session Management | no | No session — static SPA |
| V4 Access Control | no | No protected resources |
| V5 Input Validation | partial | The only input in Phase 1 is the email-reveal click; no user-typed input. Phase 4 contact form will introduce real input handling. |
| V6 Cryptography | no | No secrets, no encrypted data. The "obfuscation" is anti-scrape, not crypto. |
| V8 Data Protection | yes | Asset OPSEC pipeline (EXIF strip + manual review) is the V8 control. Documented in OPSEC Pipeline section above. |
| V11 Business Logic | no | None |
| V12 File / Resources | yes | CV PDF + images served from `public/assets/`. Metadata strip enforced by CI. No file upload. |
| V13 API & Web Service | no | No API |
| V14 Configuration | yes | CSP `<meta>` baseline (Phase 1 ships permissive; Phase 4 tightens). `rel="noopener noreferrer"` on all `target="_blank"` anchors (lint-enforced). |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Email harvested by HTML scraper | Information Disclosure | rot13 + base64 obfuscation, JS-decoded; raw `mailto:` never in source |
| Reverse-tabnabbing (target="_blank" without rel) | Tampering | `rel="noopener noreferrer"` on every external link; lint-enforced |
| EXIF leak (GPS, camera, employer-issued tool fingerprints) | Information Disclosure | `exiftool -all=` in CI + verify step |
| Stolen credential leakage via screenshots | Information Disclosure | Manual full-resolution screenshot review per OPSEC checklist |
| Malicious third-party CDN (e.g., Google Fonts) | Tampering / Information Disclosure | All assets self-hosted; zero third-party domain references in Phase 1 |
| Source map leaks file paths | Information Disclosure | `build.sourcemap: false` in `vite.config.ts` |
| Sensitive data in JSON-LD | Information Disclosure | Phase 1 JSON-LD ships `name`, `jobTitle`, `url`, `homeLocation`, `sameAs`, `image` — no `email`, no `birthDate`, no `address` |
| Click-to-reveal email in clear text in JS bundle | Information Disclosure | The decoded plaintext NEVER exists statically; only `ENCODED_EMAIL` does. Decoding is runtime, not build-time. |

---

## Sources

### Primary (HIGH confidence)

- **Vite docs:** https://vite.dev/guide/static-deploy and https://vite.dev/guide/build — `base` config, `import.meta.env.BASE_URL` semantics, GitHub Pages workflow recommendation
- **Tailwind CSS v4:** https://tailwindcss.com/blog/tailwindcss-v4 — `@theme` block, zero-config, CSS variables
- **`@tailwindcss/vite`:** https://tailwindcss.com/docs/installation/using-vite — Vite plugin install pattern
- **GitHub Actions deploy-pages:** https://github.com/actions/deploy-pages — required permissions, environment, version verified live (v5.0.0)
- **GitHub Actions upload-pages-artifact:** https://github.com/actions/upload-pages-artifact — version verified (v5.0.0)
- **GitHub Actions configure-pages:** https://github.com/actions/configure-pages — version verified (v6.0.0)
- **GitHub Actions setup-node:** https://github.com/actions/setup-node — version verified (v6.4.0)
- **Fontsource JetBrains Mono install guide:** https://fontsource.org/fonts/jetbrains-mono/install — `font-display: swap`, Latin subset default, per-weight imports
- **Schema.org Person:** https://schema.org/Person — canonical field list
- **MDN matchMedia:** assumed via React docs reference for `useSyncExternalStore`
- **eslint-plugin-jsx-a11y:** https://github.com/jsx-eslint/eslint-plugin-jsx-a11y — `flatConfigs.recommended` shape, anchor-is-valid rule
- **CLAUDE.md (project root):** authoritative version pinning, "What NOT to Use" table — used as canonical for the stack subset Phase 1 builds on
- **`01-CONTEXT.md`:** D-01..D-18 locked decisions — copied verbatim into `<user_constraints>` above
- **`01-UI-SPEC.md`:** color tokens, typography, copy strings, spacing, animation contract — pinned, not re-debated

### Secondary (MEDIUM confidence)

- **dev.to "ESLint + Prettier Setup … 2026":** https://dev.to/_d7eb1c1703182e3ce1782 — eslint-config-prettier vs eslint-plugin-prettier 2026 best practice
- **alexwlchan exiftool in GitHub Actions:** https://alexwlchan.net/notes/2025/exiftool-in-github-actions/ — apt-get install pattern (the verify-no-metadata-remains step is composed from exiftool docs + this base, marked MEDIUM)
- **dev.to handling 404 on GH Pages SPA:** https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p — `cp dist/index.html dist/404.html` pattern
- **vitest.dev migration guide:** https://vitest.dev/guide/migration.html — Vitest 3 / 4 / Vite 6 compatibility statement
- **medium.com onix_react Vite 8 release notes:** https://medium.com/@onix_react/vite-8-0-released-fbf23ade5f79 — Node 20.19+ / 22.12+ requirement
- **aaronjbecker.com Fontsource + Vite:** https://aaronjbecker.com/posts/fontsource-fontsource-tailwind-vite/ — Vite static-asset handling of `@fontsource` files
- **tailwindcss.com transition-property:** https://tailwindcss.com/docs/transition-property — motion-safe / motion-reduce mechanics
- **jsonld.com Person:** https://jsonld.com/person/ — example shapes for portfolio Person schema

### Tertiary (LOW confidence — flagged for verification)

- **Recommended Vitest version (3 vs 4) for Vite 8:** verified Vitest 3.2.4 is current; Vitest 4.x is also current. The recommendation to use Vitest 3 is judgment, not a hard compatibility statement — flagged in `Assumptions Log` as A1.

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every version verified live against npm registry on 2026-05-06.
- Architecture: **HIGH** — patterns are stdlib React 19 + Vite primitives; no novel approaches.
- Pitfalls: **HIGH** for technical pitfalls (Vite, GH Pages, ESLint flat config — official-docs-supported); MEDIUM for OPSEC content (composed from research/PITFALLS.md plus best-practice guides).
- OPSEC checklist content: **MEDIUM** — composed from research/PITFALLS.md Pitfall 5 plus widely-circulated cyber-portfolio guidance; specific items (~25) are HIGH because each is grounded in a documented failure mode.
- JSON-LD shape: **HIGH** — Schema.org Person spec is canonical; field selection is judgment but aligned with multiple portfolio examples.

**Research date:** 2026-05-06
**Valid until:** 2026-06-06 (30 days; stack is stable, but ESLint 10 / TypeScript 6 / Vitest 4 will keep encroaching — re-verify versions if Phase 1 doesn't ship within the month).
