# Phase 3: Content Integration + MDX Write-ups + Camera Choreography — Research

**Researched:** 2026-05-08
**Domain:** MDX 3 + Vite 8 build pipeline; drei `<Html transform occlude="blending">` projection of DOM onto monitor screen planes; GSAP 3.15 + `@gsap/react` camera animation inside R3F; rehype-pretty-code + Shiki 4 build-time syntax highlighting; in-place sub-route rendering inside a 3D `<Html>` overlay; section parity audit across two shells
**Confidence:** HIGH on stack pinning + integration recipes (verified against npm registry 2026-05-08 + official MDX/drei/GSAP/Vite docs); HIGH on Phase-2 file integration points (read directly from the live codebase); MEDIUM on `distanceFactor` calibration (no canonical formula in drei source — must be tuned in dev); MEDIUM on `<Html>` wheel-scroll behaviour (drei source confirms no explicit wheel handling — relies on browser default; needs in-browser verification on touch devices)

---

## Summary

Phase 3 is a content-and-integration phase: every visual + interaction contract is already locked in `03-CONTEXT.md` (D-01..D-20) and `03-UI-SPEC.md`; the planner's job is to wire the MDX pipeline into the Vite config, attach drei `<Html transform>` overlays to the existing Phase 2 `<Monitor>` screen planes, ship a GSAP-driven camera focus state machine, and author 3 collaborative MDX write-ups while resolving Phase 1's deferred content TODOs. Research scope is narrow by design — the planner needs concrete code-level answers to a fixed set of mechanical questions, not architectural exploration.

The single non-obvious technical risk: **MDX runtime in the text shell will violate the 120 KB gz budget if write-ups render directly inside `<TextShell>`.** The verified-safe pattern is **lazy-load MDX modules from a dedicated text-shell write-up route** (Option A — see Pattern 7 below). MDX runtime + the 3 compiled write-ups stay in a separate chunk that text-shell users only download when they click a write-up; the 3D shell ships them eagerly via `import.meta.glob({ eager: true })` because the right monitor's `<WriteupsMonitor>` needs them at first paint after the 3D chunk loads.

**Primary recommendation:** Add five new dependencies — `@mdx-js/rollup@~3.1.1`, `@mdx-js/react@~3.1.1`, `rehype-pretty-code@~0.14.3`, `shiki@~4.0.2`, `gsap@~3.15.0`, `@gsap/react@~2.1.2`, `remark-gfm@~4.0.1`, `remark-frontmatter@~5.0.0`, `remark-mdx-frontmatter@~5.2.0` — all verified against npm `2026-05-08`. NO `vite-plugin-mdx` (third-party shim — CLAUDE.md "What NOT to Use"). NO `gray-matter` (use `remark-mdx-frontmatter` which exposes frontmatter as a named export at MDX-compile time — zero runtime parsing cost). NO zustand (App-level state suffices for `<FocusController>` per UI-SPEC). NO `motion` / `react-spring` (Phase 1+2's animation contract is "instant" except whoami typing + GSAP camera; both are direct, no extra animation libs needed).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Monitor Content Assignment + `<Html transform>` Layout

- **D-01 — Monitor → content mapping:**
  - **Left monitor** (`position={[-0.45, 0.85, 0]}`) — `<Projects />` section: list of cyber projects (CNT-03; src/content/projects.ts).
  - **Center monitor** (`position={[0, 0.95, -0.05]}`) — animated `<WhoamiGreeting />` (top, fixed) + `<About />` body + `<Skills />` tag list. Most important content: identity + bio + skills.
  - **Right monitor** (`position={[0.45, 0.85, 0]}`) — `<WriteupsList />`: index of MDX write-ups, click → opens individual write-up (in 3D shell, write-up renders inside the same monitor with scrollable content).
  - Phase 1's 7 sections (About, Education, Skills, Projects, Certs, Writeups, Contact) all remain present in the text shell — TXT-06 parity audit confirms. The 3D shell shows a curated subset on monitors; Education + Certs + Contact appear elsewhere.

- **D-02 — Content scrollability inside monitors:** YES — each monitor's `<Html transform>` content has its own scrollable region (`overflow-y-auto h-full`). Mouse wheel scrolls the focused monitor's DOM, not the 3D scene. drei `occlude="blending"` correctly handles wheel events on the projected plane.

- **D-03 — DOM size on screen plane:** real-screen-pixel-density. Each monitor's `<Html transform>` renders a 600 × 400 px DOM that maps onto the 0.55 × 0.32 m screen plane. drei `distanceFactor` is calibrated so 14 px text is readable from default camera position without zoom.

- **D-04 — Center monitor composition:** animated `whoami` block fixed at top + scrollable About paragraph + Skills tag list below. Single scrollable container.

#### Animated `whoami` Greeting (3D-07)

- **D-05 — Sequence content (3 lines, ~5s total):** `$ whoami` → identity line; `$ status` → status line; `$ links --all` → `[CV] [GitHub] [LinkedIn] [email]` brackets. Same 4 contact links as text-shell Hero.
- **D-06 — Typing cadence:** 30-40 ms per character for command lines; output blocks instant; inter-line pause 200 ms; total ~5s. `prefers-reduced-motion: reduce` → instant final state.
- **D-07 — After completion:** cursor blinks 1 Hz on last line. Sequence does NOT loop.

#### Camera Focus Animation (3D-06)

- **D-08 — Click-to-focus animation:** 1000 ms `power2.inOut`. Animates `camera.position` + `OrbitControls.target` simultaneously. Reduced-motion → instant cut.
- **D-09 — During focus, OrbitControls is DISABLED** (`controls.enabled = false`). Re-enabled AFTER animation completes on defocus.
- **D-10 — Defocus triggers:** Esc key / outside-click on Canvas / re-click on focused monitor. All three trigger same animated return to default orbit pose.
- **D-11 — `?focus=<id>` URL deep-link extends to 3D shell:** `?view=3d&focus=projects` → animate to left; `?focus=about` or `?focus=whoami` → center; `?focus=writeups` → right. First-mount with `?focus=` → instant snap (no animation).

#### MDX Pipeline + 3 Write-ups (CNT-02)

- **D-12 — MDX stack (verbatim from CLAUDE.md):** `@mdx-js/rollup@~3.1.x`, `@mdx-js/react@~3.1.x`, `rehype-pretty-code@~0.14.x`, `shiki@~4.x`. NO `vite-plugin-mdx`. NO Prism.js.
- **D-13 — Shiki theme:** `github-dark` (matches `--color-bg #0d1117`).
- **D-14 — MDX file structure:** `src/content/writeups/<slug>.mdx`. Frontmatter: title, slug, type, date, duration, tags, sources, attack_techniques, optional disclaimer.
- **D-15 — Per-type section structure** + mandatory `<ProvenanceFooter>` (Pitfall 7 mitigation).
- **D-16 — `<CodeBlock>`, `<ScreenshotFrame>`, `<ProvenanceFooter>` MDX components.**

#### Three Write-ups — Subjects + Authoring Plan

- **D-17 — Three locked subjects:** Detection (LOLBin + Splunk + Sigma), CTI (sample → ATT&CK), Web Auth (JWT alg confusion).
- **D-18 — Authoring approach:** all 3 collaboratively in Phase 3. One plan slice for the authoring sprint.

#### Section Parity Audit (TXT-06)

- **D-19 — Manual + automated parity gates:** `scripts/check-parity.mjs` walks SECTIONS const + sections + Workstation Html mounts. Manual checklist additions to `.planning/CHECKLIST-OPSEC.md`.

#### Phase 1 Deferred TODOs

- **D-20 — Phase 3 ALSO closes Phase 1's deferred content TODOs:** identity.ts real GitHub/LinkedIn/email + new `status` field; projects.ts 3-5 real projects; certs.ts real cert list; skills.ts pruned; education.ts real institution; About.tsx real bio; real CV PDF; real OG image. Single coherent content session.

### Claude's Discretion

- Exact `distanceFactor` for `<Html transform>` — research will confirm; principle: 14 px body text readable from default orbit camera position.
- MDX `<CodeBlock>` filename caption styling — Tailwind v4 utilities only; matches Phase 1 surface palette.
- GSAP Timeline structure — single timeline per click vs. two parallel timelines. **Recommendation: single timeline (see Pattern 4).**
- OrbitControls re-enable timing on defocus — set `controls.enabled = true` after animation completes (`onComplete`). **Recommendation locked.**
- Esc key listener — registered at ThreeDShell level (only relevant when 3D mounted).
- Outside-click defocus detection — raycaster vs. event-target check on Canvas. **Recommendation: R3F's `onPointerMissed` on the `<Canvas>` (see Pattern 5).**
- MDX renderer mounting — `<MDXProvider components={{...}}>`. **Recommendation: provider mounted at the `<MDXRenderer>` boundary.**
- Right-monitor write-ups list interaction — render in same monitor (in-place mode) with back button. **Recommendation locked.**
- `scripts/check-parity.mjs` exact assertions — minimum: every SECTIONS id appears in EITHER `src/sections/*.tsx` filename OR `src/scene/Workstation.tsx` Html mount. **Recommendation: see Pattern 11.**

### Deferred Ideas (OUT OF SCOPE)

#### Carried by Phase 4 (already mapped in REQUIREMENTS.md / ROADMAP.md)
- **Postprocessing pipeline** (Bloom + Scanline + ChromaticAberration + low Noise) → Phase 4 (3D-08).
- **Real Draco-compressed GLB workstation** → Phase 4 (3D-04 second half).
- **Web3Forms contact form** → Phase 4 (CTC-01).
- **TryHackMe + HackTheBox profile links** → Phase 4 (CTC-03).
- **Lighthouse + real-device QA + iOS Safari memory-pressure test** → Phase 4 (OPS-03, OPS-04).
- **Final pre-launch checklist execution** → Phase 4 (OPS-05).

#### v2 (already in REQUIREMENTS.md "v2")
- Custom CRT shader on monitor surfaces (V2-3D-02).
- Scroll-driven camera tour (V2-3D-03).
- Source-code Easter egg (V2-3D-04).
- Multi-language TR / EN (V2-CNT-02).
- Blog with RSS for ongoing write-ups (V2-CNT-03).
- Live TryHackMe / HackTheBox badge widgets (V2-CNT-04).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **CNT-02** | MDX write-up pipeline (`@mdx-js/rollup` + `rehype-pretty-code` + Shiki) and 2-3 CTF/lab write-ups authored during the build | Pattern 1 (MDX 3 Vite plugin block — `enforce: 'pre'`), Pattern 2 (rehype-pretty-code + Shiki 4 config + output HTML shape), Pattern 8 (`<MDXProvider>` mounting + components map), Pattern 9 (`import.meta.glob` write-up barrel + frontmatter named exports), Pattern 10 (`<CodeBlock>`/`<ScreenshotFrame>`/`<ProvenanceFooter>` implementations) |
| **CNT-03** | 3-5 cyber projects published, each with provenance — every tool listed in skills has at least one project or write-up demonstrating it | Pattern 11 (`scripts/check-parity.mjs` — extends with provenance assertion: every skills.ts tag must appear in projects.ts taglines OR write-up frontmatter `tags`); D-20 closes the content TODOs |
| **3D-05** | drei `<Html transform occlude="blending">` on each monitor renders the same `src/ui/*` components used by the text shell — single source of truth | Pattern 3 (Monitor `<Html>` mount — `<Monitor>` accepts `children` prop per UI-SPEC Layout §, `<Html>` nested inside `<group>`), Pattern 12 (DOM size + `distanceFactor` calibration recipe) |
| **3D-06** | Free-look + click navigation — clamped `OrbitControls` for drag-to-look, click monitor → GSAP camera-focus animation | Pattern 4 (GSAP single-timeline pattern animating camera + OrbitControls.target with `useGSAP` from `@gsap/react`), Pattern 5 (R3F `onPointerMissed` for outside-click defocus + raycaster on screen-plane meshes for click-to-focus + re-click defocus), Pattern 6 (`?focus=` URL-state ↔ camera state machine via `useQueryParams`) |
| **3D-07** | Animated `whoami` terminal greeting on the main monitor (constrained, NOT a fake REPL); skips to final state when `prefers-reduced-motion` is set | Pattern 13 (`<WhoamiGreeting>` component — `useState` step counter + `useEffect` `setTimeout` chain + cleanup on unmount; `useReducedMotion` gate skips animation; cursor blink reuses Phase 1's `motion-safe:animate-cursor-blink` class) |
| **TXT-06** | Section-by-section content parity between text shell and 3D shell, enforced at pre-launch QA | Pattern 11 (`scripts/check-parity.mjs` exact implementation reading SECTIONS const + walking sections/scene); manual checklist additions to `.planning/CHECKLIST-OPSEC.md` per D-19 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These are the actionable directives the planner must honour. They are derived from `./CLAUDE.md` and treated with the same authority as locked CONTEXT decisions.

| Constraint | Source | Implication for Phase 3 |
|------------|--------|--------------------------|
| Stack pins: React 19.2, TS 5.9, Vite 8, Tailwind v4, R3F 9.6, three 0.184, drei 10.7 | CLAUDE.md "Technology Stack" | Phase 3 inherits Phase 1+2's pins. Three new runtime deps (mdx-js/react, shiki) + four new build/dev deps; all pinned with `~`. |
| `@mdx-js/rollup` (NOT `vite-plugin-mdx`) | CLAUDE.md "What NOT to Use" | Pattern 1 uses `@mdx-js/rollup@~3.1.1`. The third-party shim is older + not maintained in lockstep with MDX 3. |
| `rehype-pretty-code` + Shiki (NOT Prism.js) | CLAUDE.md "What NOT to Use" | Pattern 2. Build-time highlighting; zero runtime payload for grammars. |
| GSAP 3.15 free in 2026 (Webflow acquisition) | CLAUDE.md verified-version table | Phase 3 uses `gsap@~3.15.0` + `@gsap/react@~2.1.2` (the official React hook package). |
| drei `<Html transform occlude="blending">` for monitor content | CLAUDE.md + UI-SPEC | Pattern 3. Phase 2's `<Monitor>` already left the screen plane at `position={[0, 0, 0.025]}` ready for `<Html>` overlay at `position={[0, 0, 0.026]}` (1mm in front to avoid z-fighting). |
| `<HashRouter>` NOT in scope | CLAUDE.md alternatives table | Phase 1's query-param routing reused. `?focus=writeups/<slug>` extends the existing `useQueryParams` contract — no router changes. |
| `motion` (formerly `framer-motion`) NOT used in Phase 3 | CLAUDE.md "Animation: When to Use Which Tool" | Phase 3's only typing animation is the `<WhoamiGreeting>` 3-line sequence — implemented with `useState` + `setTimeout` (no Motion library needed). The only camera animation is GSAP. |
| `useFrame` may NOT mutate React state | PITFALLS.md Pitfall 2 | `<FocusController>` uses GSAP timelines (which mutate `camera.position` directly via `gsap.to(camera.position, ...)` — no React state change per frame). The R3F `useFrame` hook is NOT used by Phase 3 at all. |
| `localStorage` writes for view/focus/camera mode forbidden | CLAUDE.md anti-pattern + Phase 2 D-12 | URL is the single source of truth for `?focus=`. Defocus also clears the param via `setQueryParams({ focus: null })`. |
| Source maps OFF in production | CLAUDE.md OPSEC | `vite.config.ts` already has `build.sourcemap: false` (Phase 1 lock). Phase 3's MDX integration MUST NOT re-enable source maps. |
| OPSEC pipeline (`exiftool -all=`) for screenshots | CLAUDE.md "OPSEC & Polish" + Pitfall 5 | Every write-up screenshot in `public/assets/writeups/<slug>/` must run through `exiftool -all=` + manual full-resolution review per `.planning/CHECKLIST-OPSEC.md`. The `<ScreenshotFrame>` `[✓ sanitized]` badge asserts compliance. |
| Plagiarised CTF write-ups forbidden | REQUIREMENTS.md OOS + Pitfall 7 | `<ProvenanceFooter>` mandatory on every write-up. Frontmatter `sources` array cites every walkthrough/hint consulted. |

## Architectural Responsibility Map

Phase 3 is fully client-side. The map below clarifies which sub-tier owns which capability inside the browser tier.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| MDX → React component compilation | Build (Vite + `@mdx-js/rollup`) | — | Compile-time. Each `*.mdx` file becomes a JS module exporting a default component + a `frontmatter` named export. Zero runtime parsing cost. |
| Syntax highlighting | Build (`rehype-pretty-code` + Shiki at MDX-compile time) | — | Pre-rendered HTML with `data-language` / `data-line` / `data-highlighted-line` attributes baked in. Browser receives static spans. |
| MDX runtime rendering | Browser / Client (`@mdx-js/react` `<MDXProvider>` resolves component overrides at render) | — | Provider lookup at render time. Components map (`{ h1, h2, code, a, CodeBlock, ... }`) is a single static object. |
| Write-up barrel discovery | Build (Vite `import.meta.glob` resolves at compile time) | — | Vite expands the glob and produces a static map of file paths → modules. With `eager: true`, all matched modules ship in the same chunk. |
| `<MonitorOverlay>` DOM projection | Browser / Client (drei `<Html transform>` writes CSS `matrix3d` per frame via the R3F render loop) | — | Standard drei territory. The DOM lives in a sibling `<div>` outside the canvas; CSS3DRenderer projects it. |
| `<FocusController>` state machine | Browser / Client (React state + GSAP timeline mutating `camera.position` / `OrbitControls.target` refs) | — | State decides which monitor pose; GSAP mutates the Three.js objects directly (refs, not React state per frame — Pitfall 2 compliance). |
| `?focus=<id>` URL ↔ camera sync | Browser / Client (`useQueryParams` hook reads URL; `setQueryParams` writes URL) | — | Bidirectional binding via Phase 1's existing hook. URL is single source of truth (D-11 + Phase 2 D-12). |
| Animated `<WhoamiGreeting>` typing | Browser / Client (`useState` step counter + `setTimeout` chain in `useEffect`; cleanup on unmount) | — | No animation library. Reduced-motion gate skips the timer chain entirely and renders final state. |
| Section parity audit | CI (Node script reading source files + AST + content barrels) | — | Build-time gate. Runs as `npm run parity` before `npm run build` in the GitHub Actions workflow. |

**Why this matters:** the original phase note hinted at "MDX runtime cost in 3D chunk" as a budget risk. The verified-safe answer is that MDX runtime + 3 compiled write-ups is **~10-15 KB gz** total (Pattern 7 cites the comparable size from MDX 3 release notes); the GSAP core is **~33 KB gz** (verified against `bundlephobia` MEDIUM-confidence cite); together they push the 3D chunk from Phase 2's 236.7 KB gz to roughly 280-290 KB gz — comfortably under the 450 KB budget. The text shell is the budget-tight one, hence the lazy-load split (Pattern 7 Option A).

---

## Standard Stack

### Core (Phase 3 additions only — Phase 1+2 stack inherited verbatim)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **`@mdx-js/rollup`** | `~3.1.1` | Vite/Rollup plugin compiling `*.mdx` → React component modules | The official MDX-on-Vite path. Not `vite-plugin-mdx` (third-party, unmaintained vs MDX 3). `[VERIFIED: npm view @mdx-js/rollup@latest version → 3.1.1, 2026-05-08]` `[CITED: mdxjs.com/packages/rollup/]` |
| **`@mdx-js/react`** | `~3.1.1` | Runtime `<MDXProvider>` for component overrides (h1, h2, code, a, custom MDX components) | Pairs with `@mdx-js/rollup` 3.x. Required for the components-map injection per UI-SPEC Pattern 8. `[VERIFIED: npm view @mdx-js/react@latest version → 3.1.1, 2026-05-08]` |
| **`rehype-pretty-code`** | `~0.14.3` | Build-time syntax highlighting via Shiki, with line-highlight + filename-caption support | Renders `<pre><code>` with `data-language` / `data-line` / `data-highlighted-line` / `figcaption[data-rehype-pretty-code-title]` attributes baked at compile time — zero runtime cost. `[VERIFIED: npm view rehype-pretty-code@latest version → 0.14.3, 2026-05-08]` `[CITED: rehype-pretty.pages.dev]` |
| **`shiki`** | `~4.0.2` | TextMate-grammar tokeniser, peer of `rehype-pretty-code`; ships VS Code grammars + `github-dark` theme as bundled JSON | Active 2026 version line; `rehype-pretty-code@0.14` accepts shiki `^1.0` and `^4.0`. `[VERIFIED: npm view shiki@latest version → 4.0.2, 2026-05-08]` |
| **`gsap`** | `~3.15.0` | Camera focus / defocus timeline animation — `gsap.to(camera.position, ...)` + `gsap.to(controls.target, ...)` in a single timeline | GSAP is fully free in 2026 after Webflow acquisition. CLAUDE.md "Animation: When to Use Which Tool" reserves GSAP for camera/scene choreography needing precise timing. `[VERIFIED: npm view gsap@latest version → 3.15.0, 2026-05-08]` `[CITED: CLAUDE.md verified-version table]` |
| **`@gsap/react`** | `~2.1.2` | `useGSAP()` hook with automatic `gsap.context()` cleanup on unmount + dependency-array support like `useEffect` + `contextSafe` wrapper for event handlers | The official React-GSAP hook. Replaces raw `useEffect(() => { const ctx = gsap.context(...); return () => ctx.revert(); }, [])` boilerplate; ensures animations don't leak across mount/unmount in Strict Mode. `[VERIFIED: npm view @gsap/react@latest version → 2.1.2, 2026-05-08]` `[CITED: gsap.com/resources/React]` |

### Supporting (build-time only — for MDX frontmatter + GitHub-Flavored Markdown)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`remark-gfm`** | `~4.0.1` | Adds GitHub-Flavored Markdown features to MDX: tables, strikethrough, task lists, autolinks | Always — write-ups will use tables (e.g., "Telemetry sources" table in Detection write-up) and the standard `~~strikethrough~~` for revisions. `[VERIFIED: npm view remark-gfm@latest version → 4.0.1, 2026-05-08]` |
| **`remark-frontmatter`** | `~5.0.0` | Parses YAML frontmatter blocks (`--- ... ---`) into MDAST nodes | Required peer of `remark-mdx-frontmatter`. `[VERIFIED: npm view remark-frontmatter@latest version → 5.0.0, 2026-05-08]` `[CITED: github.com/remcohaszing/remark-mdx-frontmatter README]` |
| **`remark-mdx-frontmatter`** | `~5.2.0` | Converts the frontmatter MDAST node into an MDX named export (`export const frontmatter = { ... }`) | Build-time. Eliminates runtime frontmatter parsing — `import.meta.glob` consumers read `mod.frontmatter` directly. `[VERIFIED: npm view remark-mdx-frontmatter@latest version → 5.2.0, 2026-05-08]` `[CITED: github.com/remcohaszing/remark-mdx-frontmatter README]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `remark-mdx-frontmatter` | `gray-matter` runtime parsing in `src/content/writeups.ts` | gray-matter parses YAML at runtime — adds ~6 KB gz to the 3D chunk and a runtime cost on every write-up barrel access. `remark-mdx-frontmatter` is build-time, exports a static `frontmatter` named export. **Choose `remark-mdx-frontmatter`.** `[CITED: gray-matter is 5.0.1 on npm 2026-05-08; bundlephobia gz ≈ 6 KB MEDIUM]` |
| `@gsap/react` `useGSAP()` | Raw `useEffect(() => { const tl = gsap.timeline(); ...; return () => tl.kill(); }, [...])` | Raw `useEffect` is fine for one-off timelines, but Strict Mode double-mount in dev creates orphan timelines. `useGSAP` uses `gsap.context()` internally to revert all animations created during the hook on cleanup — Strict Mode safe. **Choose `useGSAP()`.** `[CITED: gsap.com/resources/React]` |
| App-level React state for focus | zustand store | UI-SPEC § Single source of truth says zustand is "planner's call". App-level (or `<ThreeDShell>`-level) state is one fewer dep. `<FocusController>` lives inside `<ThreeDShell>` so all consumers (`<Canvas>` click handler, monitor screen-plane click handlers, header `[bracket]` click handlers, `<WriteupsMonitor>`) are descendants. **Recommendation: `<ThreeDShell>`-level state (or React context if prop-drilling becomes painful — defer until needed).** |
| `motion` or `react-spring` for whoami typing | Native `useState` + `setTimeout` chain | Phase 3 has exactly one typing animation (the 3-line whoami sequence). A 30-line `<WhoamiGreeting>` component with `useState` + `useEffect` + `setTimeout` chain + reduced-motion gate is simpler than pulling in motion/. CLAUDE.md "Animation" table also says GSAP is overkill for routine UI animation, and motion would be overkill for a one-shot 5-second sequence. **Choose hand-rolled.** |
| `import.meta.glob({ eager: true })` for write-up barrel | Static `import` per file | Static imports require manual addition for every new write-up. Glob is the conventional Vite pattern for content directories. `eager: true` is correct because the 3D shell's right monitor renders the write-up list at first 3D-mount paint. **Choose glob.** `[CITED: vite.dev/guide/features → import.meta.glob]` |
| `vite-plugin-mdx` (third-party) | `@mdx-js/rollup` (official) | CLAUDE.md "What NOT to Use" — older, not maintained in lockstep with MDX 3. **Choose official.** |
| Prism.js (runtime) | Shiki (build-time) | CLAUDE.md "What NOT to Use" — Prism ships grammars + theme JS to the browser; Shiki at build-time renders to static HTML. Zero runtime cost difference. **Choose Shiki.** |

**Installation (exact npm command for the planner):**

```bash
# Runtime deps (ship in 3D chunk OR text-shell write-up route — see Pattern 7)
npm install gsap@~3.15.0 @gsap/react@~2.1.2 @mdx-js/react@~3.1.1

# Build-time deps (do NOT ship to browser)
npm install --save-dev \
  @mdx-js/rollup@~3.1.1 \
  rehype-pretty-code@~0.14.3 \
  shiki@~4.0.2 \
  remark-gfm@~4.0.1 \
  remark-frontmatter@~5.0.0 \
  remark-mdx-frontmatter@~5.2.0
```

**Version verification (run before Plan 03-01 starts):**

```bash
npm view @mdx-js/rollup@latest version
npm view @mdx-js/react@latest version
npm view rehype-pretty-code@latest version
npm view shiki@latest version
npm view gsap@latest version
npm view @gsap/react@latest version
npm view remark-gfm@latest version
npm view remark-frontmatter@latest version
npm view remark-mdx-frontmatter@latest version
```

Verified at research time (`2026-05-08`):
- `@mdx-js/rollup@3.1.1`
- `@mdx-js/react@3.1.1`
- `rehype-pretty-code@0.14.3`
- `shiki@4.0.2`
- `gsap@3.15.0`
- `@gsap/react@2.1.2`
- `remark-gfm@4.0.1`
- `remark-frontmatter@5.0.0`
- `remark-mdx-frontmatter@5.2.0`

**Tilde ranges (`~`) NOT caret (`^`):** PITFALLS.md Pitfall 16. Phase 1+2 followed this rule; Phase 3 continues it for every dep above.

---

## Architecture Patterns

### System Architecture Diagram

```
                User opens https://eren-atalay.github.io/Portfolio_Website/[?view=…&focus=…]
                                              |
                              +--------------- v ----------------+
                              |  Vite-built bundle               |
                              |  - dist/assets/index-*.js        |
                              |    (text shell + Phase 1 ui/*)   |
                              |    target ≤120 KB gz             |
                              |  - dist/assets/ThreeDShell-*.js  |
                              |    (R3F + drei + three + scene/* |
                              |     + GSAP + MDX runtime + 3     |
                              |     compiled .mdx modules)       |
                              |    target ≤450 KB gz             |
                              |  - dist/assets/WriteupsRoute-*.js|
                              |    (lazy text-shell route — MDX  |
                              |     runtime + compiled .mdx; off |
                              |     critical path for recruiters)|
                              |    no separate budget; ~30 KB gz |
                              +----------------+-----------------+
                                              |
                                              v
                                  +-----------+------------+
                                  |   <App />              |
                                  |   - reads ?view=       |
                                  |   - reads ?focus=<id>  |
                                  |     (Pattern 6)        |
                                  +-----------+------------+
                                              |
                          +-------------------+-------------------+
                          |                                       |
                  3D shell branch                      text shell branch
                          |                                       |
                          v                                       v
            +-------------+-------------+        +----------------+----------------+
            | <ThreeDShell>             |        | <TextShell>                     |
            | ├ <Header showCameraToggle>|        | ├ <Header />                    |
            | ├ <FocusController>       |        | ├ <Hero /> (existing)           |
            | │ ├ reads useQueryParams()|        | ├ <About /> ... <Writeups />    |
            | │ ├ owns useState<Focus>  |        | │  └ Phase 3 adds <WriteupList> |
            | │ ├ useGSAP timeline      |        | │     reading from              |
            | │ │  (camera + target)    |        | │     src/content/writeups.ts   |
            | │ ├ Esc keydown listener  |        | └ <Contact /> (existing)        |
            | │ └ onPointerMissed()     |        |                                  |
            | ├ <main flex-1>           |        | URL ?focus=writeups/<slug>      |
            | │ └ <Canvas               |        | → lazy-load WriteupsRoute       |
            | │     onPointerMissed=...>|        |   chunk → render <WriteupView>  |
            | │   ├ <Lighting/>         |        |   inside text shell             |
            | │   ├ <Workstation>       |        +----------------+----------------+
            | │   │ ├ <Floor/>          |
            | │   │ ├ <Desk/>           |   ?focus=<id> on first 3D mount → instant snap
            | │   │ ├ <Monitor> ×3      |       (no GSAP — Pattern 6 first-mount branch)
            | │   │ │ └ <MonitorOverlay>|
            | │   │ │   <Html transform |   ?focus=<id> change in-session → GSAP timeline
            | │   │ │     occlude=      |       1000ms power2.inOut (Pattern 4)
            | │   │ │     "blending"    |
            | │   │ │     position=     |   click on monitor screen plane mesh →
            | │   │ │     [0,0,0.026]   |       focus that monitor (Pattern 5)
            | │   │ │     distanceFactor|
            | │   │ │     ={DF}>        |   onPointerMissed (canvas click outside meshes)
            | │   │ │     <ContentRouter|       → defocus (Pattern 5)
            | │   │ │       />          |
            | │   │ │   </Html>         |   Esc keydown anywhere on document
            | │   │ ├ <Lamp/>           |       → defocus (registered on ThreeDShell mount)
            | │   │ └ <Bookshelf/>      |
            | │   ├ <Camera makeDefault>|
            | │   └ <Controls           |   Where ContentRouter resolves to:
            | │     enabled={!focused}/>|     left   → <Projects />
            | └ <Footer />              |     center → <CenterMonitorContent />
            +---------------------------+               (sticky <WhoamiGreeting>
                                                         + scrollable <About/> + <Skills/>)
                                              right  → <WriteupsMonitor />
                                                         (?focus=writeups → <WriteupList>)
                                                         (?focus=writeups/<slug> → <WriteupView>)
```

### Recommended Project Structure (Phase 3 additions to Phase 1+2's tree)

```
src/
├── app/
│   └── App.tsx                            # MINOR — extend ?focus= handler to NOT scroll when view=3d (3D shell handles its own focus)
├── content/
│   ├── identity.ts                        # MODIFY — D-20: real GitHub/LinkedIn/email + new `status: string` field
│   ├── projects.ts                        # MODIFY — D-20: 3-5 real cyber projects with provenance
│   ├── certs.ts                           # MODIFY — D-20: real cert list
│   ├── skills.ts                          # MODIFY — D-20: pruned to demonstrable skills
│   ├── education.ts                       # MODIFY — D-20: real institution + degree
│   ├── sections.ts                        # UNCHANGED (consumed by parity audit)
│   ├── writeups.ts                        # NEW — barrel via import.meta.glob (Pattern 9)
│   ├── attack-techniques.ts               # NEW — id → canonical name lookup table for <ProvenanceFooter>
│   └── writeups/
│       ├── lolbin-sigma-detection.mdx     # NEW — Detection write-up
│       ├── hash-to-attack.mdx             # NEW — CTI write-up
│       └── jwt-alg-confusion.mdx          # NEW — Web Auth write-up
├── lib/
│   ├── useQueryParams.ts                  # UNCHANGED — extends naturally to slug param
│   ├── useReducedMotion.ts                # UNCHANGED — gates whoami + camera animation
│   └── …
├── scene/
│   ├── Workstation.tsx                    # MODIFY — wraps each <Monitor> with children = <MonitorOverlay>
│   ├── Monitor.tsx                        # MODIFY — accept `children?: ReactNode` prop (UI-SPEC Pattern 3 Option A)
│   ├── MonitorOverlay.tsx                 # NEW — drei <Html transform occlude="blending"> wrapper
│   ├── FocusController.tsx                # NEW — useGSAP timeline + URL sync + Esc listener + onPointerMissed
│   ├── cameraPoses.ts                     # NEW — per-monitor focus poses const (Pattern 12)
│   ├── Controls.tsx                       # MODIFY — accept enabled prop driven by focus state
│   └── …
├── sections/
│   ├── About.tsx                          # MODIFY — D-20: real bio paragraph
│   ├── Writeups.tsx                       # MODIFY — replaces Phase 1 stub with real list reading from writeups.ts
│   └── …
├── shells/
│   ├── ThreeDShell.tsx                    # MODIFY — mounts <FocusController>, registers Esc listener on mount
│   └── TextShell.tsx                      # MODIFY — adds lazy <WriteupsRoute> for ?focus=writeups/<slug>
├── ui/
│   ├── BracketLink.tsx                    # UNCHANGED
│   ├── EmailReveal.tsx                    # UNCHANGED — reused inside <WhoamiGreeting>
│   ├── TerminalPrompt.tsx                 # UNCHANGED — reused inside MDX <h1>/<h2> renderers
│   ├── WhoamiGreeting.tsx                 # NEW — animated 3-line typing component (Pattern 13)
│   ├── CenterMonitorContent.tsx           # NEW — composition of WhoamiGreeting + About + Skills
│   ├── WriteupsMonitor.tsx                # NEW — list ↔ view switcher reading useQueryParams()
│   ├── WriteupList.tsx                    # NEW — index of write-ups with type-marker glyphs
│   ├── WriteupView.tsx                    # NEW — renders one MDX write-up + back button + ProvenanceFooter
│   ├── MDXRenderer.tsx                    # NEW — <MDXProvider> with components map (Pattern 8)
│   ├── CodeBlock.tsx                      # NEW — wraps rehype-pretty-code output with chrome (Pattern 10a)
│   ├── ScreenshotFrame.tsx                # NEW — bordered img with caption + [✓ sanitized] badge (Pattern 10b)
│   └── ProvenanceFooter.tsx               # NEW — frontmatter-driven sources/ATT&CK/meta footer (Pattern 10c)
├── routes/                                # NEW DIRECTORY (lazy text-shell write-up route)
│   └── WriteupsRoute.tsx                  # NEW — lazy-loaded by TextShell when ?focus=writeups/<slug>
└── styles/                                # UNCHANGED (no new tokens per UI-SPEC)
    └── tokens.css                         # UNCHANGED

scripts/
├── encode-email.mjs                       # UNCHANGED (Phase 1)
└── check-parity.mjs                       # NEW — TXT-06 audit (Pattern 11)

public/
└── assets/
    ├── Eren-Atalay-CV.pdf                 # REPLACE — D-20: real EXIF-stripped CV
    ├── og-image.png                       # REPLACE — D-20: real text-shell screenshot 1200×630
    └── writeups/
        ├── lolbin-sigma-detection/        # NEW — 1-3 PNG screenshots, EXIF-stripped
        ├── hash-to-attack/                # NEW
        └── jwt-alg-confusion/             # NEW

vite.config.ts                             # MODIFY — add @mdx-js/rollup plugin BEFORE react()
package.json                               # MODIFY — add 9 deps + `npm run parity` script
```

### Pattern 1: MDX 3 + Vite 8 Integration (`vite.config.ts`)

**What:** the MDX plugin must be registered BEFORE `@vitejs/plugin-react` so it processes `.mdx` files into JSX before React's plugin transforms JSX. The MDX docs use the `{ enforce: 'pre', ...mdx({...}) }` spread idiom to force this.

**When to use:** whenever Vite + MDX 3 + plugin-react coexist.

**Example:**

```ts
// vite.config.ts (Phase 3 additions to Phase 1+2's config)
//
// Source: [CITED: mdxjs.com/docs/getting-started/ — "If you also use
//          @vitejs/plugin-react, you must force @mdx-js/rollup to run in the
//          pre phase before it"]
//         [CITED: mdxjs.com/packages/rollup/]
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';

const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: 'github-dark',         // matches --color-bg #0d1117 (D-13)
  keepBackground: true,         // use Shiki's bg, NOT custom override
  defaultLang: 'plaintext',     // unspecified-language fences render as plaintext
  // (no transformers in Phase 3 — github-dark token output is sufficient)
};

export default defineConfig({
  base: '/Portfolio_Website/',  // unchanged (Phase 1 lock)
  plugins: [
    {
      enforce: 'pre',           // CRITICAL — must run before plugin-react
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,                      // parse YAML --- ---
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
          // → exports `export const frontmatter = { ... }` from each .mdx module
          remarkGfm,                              // tables, strikethrough, task lists
        ],
        rehypePlugins: [
          [rehypePrettyCode, rehypePrettyCodeOptions],
        ],
        providerImportSource: '@mdx-js/react',    // enables <MDXProvider> components map
      }),
    },
    react({
      // Phase 1+2 config — explicit include extends the regex to match .mdx
      include: /\.(jsx|js|mdx|md|tsx|ts)$/,
    }),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,                             // unchanged (Phase 1 lock — OPSEC)
    target: 'es2022',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
```

**Critical: plugin order.** The `enforce: 'pre'` field on the MDX plugin object is what makes this work — Vite sorts plugins by `enforce` (`'pre'` first, then default, then `'post'`). Without `enforce: 'pre'`, plugin-react's JSX transform runs first on `.mdx` files (which contain raw markdown), failing.

**`providerImportSource: '@mdx-js/react'`** is the Vite/MDX 3 hook that makes `<MDXProvider components={...}>` actually work — without it, MDX components ignore the provider and use the default tag-name resolution. **Required for Pattern 8.**

### Pattern 2: rehype-pretty-code + Shiki 4 Output Shape

**What:** rehype-pretty-code transforms fenced code blocks at MDX-compile time into pre-tokenised HTML with Shiki's grammar coloring + structural data attributes. The output shape determines what `<CodeBlock>` (Pattern 10a) needs to wrap.

**When to use:** every fenced code block in every `*.mdx` file passes through this transformer.

**Output HTML shape** (verified `[CITED: rehype-pretty.pages.dev]`):

For a fenced block with `title="filename"`:

````mdx
```yaml title="detection.yml" {3,5}
title: certutil download
id: 5a8a3e2f-...
detection:
  selection:
    Image|endswith: '\certutil.exe'
    CommandLine|contains: '-urlcache'
  condition: selection
```
````

The compiled HTML output is approximately:

```html
<figure data-rehype-pretty-code-figure>
  <figcaption data-rehype-pretty-code-title data-language="yaml">
    detection.yml
  </figcaption>
  <pre data-language="yaml" data-theme="github-dark">
    <code data-language="yaml" data-theme="github-dark">
      <span data-line>title: certutil download</span>
      <span data-line>id: 5a8a3e2f-...</span>
      <span data-line data-highlighted-line>detection:</span>
      <span data-line>  selection:</span>
      <span data-line data-highlighted-line>    Image|endswith: '\certutil.exe'</span>
      <span data-line>    CommandLine|contains: '-urlcache'</span>
      <span data-line>  condition: selection</span>
    </code>
  </pre>
</figure>
```

Each line `<span>` contains nested Shiki-tokenised `<span style="color: ...">` children (theme-coloured tokens).

**Implications for `<CodeBlock>` design:**
- The `<figure>` wrapper is the outer hook — `<CodeBlock>` MDX-component override receives the `<pre>` (or `<figure>`) as `children` and adds chrome around it.
- `data-language` is on `<pre>`, `<code>`, AND `<figcaption>` — the `<CodeBlock>` chrome can read this via `props.children.props['data-language']` (or simpler: re-pass via the MDX block's metastring — see Pattern 10a).
- `data-highlighted-line` is on individual line spans; CSS rule `[data-highlighted-line] { background: var(--color-surface-1); }` applied via Tailwind v4 `@layer` matches the UI-SPEC color contract.
- Line numbers: NO line numbers in Phase 3 (UI-SPEC explicit). rehype-pretty-code supports them via `showLineNumbers` meta but Phase 3 doesn't use it.

**Inline code highlighting** (UI-SPEC `<code>` inline contract): rehype-pretty-code supports `` `certutil.exe`{:bash} `` syntax — but UI-SPEC says inline code uses `bg-surface-1` + body color, NOT Shiki tokenisation. **Recommendation: do NOT use the `{:bash}` inline-highlight syntax in write-ups** — keep inline `<code>` as untokenised body color on `bg-surface-1`. Override `code` in MDX components map to render plain `<code className="bg-surface-1 px-1 ...">`.

### Pattern 3: drei `<Html transform occlude="blending">` Mount on Monitor Screen Plane

**What:** project React content onto a 3D plane via CSS `matrix3d` so monitor content is real, selectable, copy-paste-able DOM with full Tailwind styling, while correctly hiding behind 3D geometry when the camera orbits.

**When to use:** every monitor (3 of them) needs an `<Html transform>` overlay on its screen plane.

**Recommended pattern (UI-SPEC § Layout & Interaction Contract Option A):** `<Monitor>` accepts a `children?: ReactNode` prop; the `<Html>` is rendered as a child inside the monitor's `<group>`, at `position={[0, 0, 0.026]}` — 1mm in front of Phase 2's screen plane mesh at `[0, 0, 0.025]`.

**Example:**

```tsx
// src/scene/MonitorOverlay.tsx (Phase 3 ships)
//
// Source: UI-SPEC § Layout & Interaction Contract → MonitorOverlay contract
//         [CITED: drei.docs.pmnd.rs/misc/html — distanceFactor, occlude="blending"]
import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';
import { DISTANCE_FACTOR } from './cameraPoses';

interface MonitorOverlayProps {
  children: ReactNode;
  ariaLabel: string;       // for the wrapped <div>'s a11y name
  onPointerDownInner?: (e: React.PointerEvent<HTMLDivElement>) => void;
  // ↑ If planner needs to stop drag-propagation on the inner DOM (UI-SPEC
  //   § Touch / pointer behaviour). Default: stopPropagation always.
}

export function MonitorOverlay({ children, ariaLabel, onPointerDownInner }: MonitorOverlayProps) {
  return (
    <Html
      transform
      occlude="blending"
      position={[0, 0, 0.026]}                      // 1mm in front of screen plane (Phase 2 z=0.025)
      distanceFactor={DISTANCE_FACTOR}              // calibrated per Pattern 12
      style={{ width: '600px', height: '400px' }}   // D-03 real-pixel-density
      wrapperClass="monitor-overlay-wrapper"
    >
      <div
        role="region"
        aria-label={ariaLabel}
        className="w-full h-full bg-bg text-fg font-mono p-4 overflow-y-auto"
        onPointerDown={(e) => {
          // Phase 3 anti-pattern: inner DOM drag propagating to OrbitControls.
          // UI-SPEC § Touch / pointer behaviour: drag inside <Html> = scroll DOM.
          e.stopPropagation();
          onPointerDownInner?.(e);
        }}
        onClick={(e) => {
          // UI-SPEC: re-click defocus only fires on raycaster hits to screen
          // plane MESH, NOT on the DOM overlay above it (z-fighting prevention
          // via z=0.026 keeps DOM in front; clicks inside DOM must NOT bubble
          // to the canvas raycaster).
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </Html>
  );
}
```

**Why `occlude="blending"`:** drei source confirms `[VERIFIED: github.com/pmndrs/drei → Html.tsx]` that `'blending'` mode sets the canvas z-index to half the max range, layering the canvas behind the HTML without using raycast occlusion — the monitor frame mesh CORRECTLY hides DOM when camera orbits behind because the WebGL canvas (which renders the frame) draws over the lower-z-indexed DOM in the regions where the monitor backplate is opaque.

**Why `transform`:** projects DOM via CSS `matrix3d` so it scales with camera distance. Without `transform`, drei `<Html>` is a fixed-position DOM overlay that doesn't follow camera movement.

**Why opaque `bg-bg` on inner div:** UI-SPEC § Color § "NOT permitted in Phase 3" — emissive bleed-through is the anti-use. The Phase 2 emissive accent screen plane is BEHIND the `<Html>`; making the DOM transparent would tint MDX prose with backlight. Fully opaque `bg-bg` hides the backlight.

### Pattern 4: GSAP Camera Focus Animation via `useGSAP`

**What:** animate `camera.position` and `OrbitControls.target` in lockstep over 1000 ms `power2.inOut`, with OrbitControls disabled during animation, re-enabled in `onComplete`.

**When to use:** every click-to-focus and defocus trigger.

**Single timeline pattern (recommended over two parallel timelines):**

```tsx
// src/scene/FocusController.tsx (Phase 3 ships)
//
// Source: [CITED: gsap.com/resources/React — useGSAP hook signature, contextSafe,
//          dependencies array]
//         UI-SPEC § Click-to-focus animation (D-08, D-09, D-10)
import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useQueryParams, setQueryParams } from '../lib/useQueryParams';
import { MONITOR_FOCUS_POSES, DEFAULT_ORBIT_POSE, type FocusId } from './cameraPoses';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

// gsap.registerPlugin(useGSAP) — register once at module top so Strict Mode
// double-mount doesn't double-register. Pattern from gsap.com/resources/React.
gsap.registerPlugin(useGSAP);

interface FocusControllerProps {
  // controlsRef passed down from <ThreeDShell> where <OrbitControls ref={...}>
  // is mounted — we mutate its .target and .enabled directly.
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export function FocusController({ controlsRef }: FocusControllerProps) {
  const { camera } = useThree();
  const reduced = useReducedMotion();
  const params = useQueryParams();

  const focusFromUrl = parseFocusFromUrl(params);   // 'left' | 'center' | 'right' | null
  const [focused, setFocused] = useState<FocusId | null>(focusFromUrl);
  const isFirstMount = useRef(true);

  // useGSAP from @gsap/react — automatic gsap.context() cleanup on unmount.
  // Strict Mode double-mount creates two contexts; cleanup reverts both.
  // Dependencies: re-run when focused changes.
  useGSAP(
    () => {
      const controls = controlsRef.current;
      if (!controls) return;

      const targetPose = focused ? MONITOR_FOCUS_POSES[focused] : DEFAULT_ORBIT_POSE;

      // First-mount with ?focus= → instant snap (D-11: no cinematic intro).
      // Reduced motion → instant snap.
      if (isFirstMount.current || reduced) {
        camera.position.set(...targetPose.position);
        controls.target.set(...targetPose.target);
        controls.update();
        controls.enabled = focused === null;        // disabled while focused
        isFirstMount.current = false;
        return;
      }

      // Animated transition. Single timeline animating both objects simultaneously.
      controls.enabled = false;
      const tl = gsap.timeline({
        onUpdate: () => controls.update(),          // required per drei docs
        onComplete: () => {
          // Re-enable AFTER animation (D-09 + Claude's-discretion lock).
          // Re-enable only when defocusing (returning to orbit pose).
          controls.enabled = focused === null;
        },
      });
      tl.to(camera.position, {
        x: targetPose.position[0],
        y: targetPose.position[1],
        z: targetPose.position[2],
        duration: 1.0,
        ease: 'power2.inOut',
      }, 0)                                          // start at time 0
        .to(controls.target, {
          x: targetPose.target[0],
          y: targetPose.target[1],
          z: targetPose.target[2],
          duration: 1.0,
          ease: 'power2.inOut',
        }, 0);                                       // also start at time 0 (parallel)
    },
    { dependencies: [focused, reduced] },            // re-run on focus change
  );

  // Sync URL → focused state (in-session ?focus= changes from header link clicks).
  useEffect(() => {
    if (focusFromUrl !== focused) {
      setFocused(focusFromUrl);
    }
  }, [focusFromUrl, focused]);

  // Esc key listener (D-10 trigger #1).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focused !== null) {
        setFocused(null);
        setQueryParams({ focus: null });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused]);

  return null;  // pure controller — no DOM
}

function parseFocusFromUrl(params: URLSearchParams): FocusId | null {
  const f = params.get('focus');
  if (!f) return null;
  if (f === 'projects') return 'left';
  if (f === 'about' || f === 'whoami') return 'center';
  if (f === 'writeups' || f.startsWith('writeups/')) return 'right';
  return null;
}
```

**Why a single timeline (not two parallel timelines):** GSAP's timeline gives an atomic `onComplete` callback that fires once both tweens finish, which is when OrbitControls should re-enable. Two parallel `gsap.to(...)` calls would fire `onComplete` twice (once each); the planner would have to coordinate them via a counter or `Promise.all`. Single timeline with two `.to(...)` calls at the same start time (`0`) is the idiomatic GSAP pattern. `[CITED: gsap.com/docs — Timeline `.to(target, vars, position)`]`

**Why `useGSAP` over raw `useEffect` + `gsap.context`:** `useGSAP` wraps the manual `gsap.context()` + `revert()` boilerplate; on dependencies change it reverts the previous context's animations, preventing stale-tween bugs. `[CITED: gsap.com/resources/React]`

**Critical: `controls.update()` per-frame during animation.** drei's OrbitControls doesn't read `target` / camera position on every render — only when `.update()` is called. The `onUpdate` callback in the timeline ensures the new target gets applied each frame.

**Reduced-motion gate:** the `if (reduced)` branch sets position/target instantly via `.set()` and `.copy()`-equivalents, NO timeline runs. UI-SPEC § Reduced-motion handling locks this behaviour.

### Pattern 5: R3F `onPointerMissed` for Outside-Click Defocus + Raycaster on Screen Plane Meshes

**What:** detect "click outside any monitor" (defocus trigger) via R3F's `onPointerMissed` on the `<Canvas>`; detect click-on-monitor and re-click-on-focused-monitor via standard `onClick` on the screen plane meshes.

**When to use:** every Canvas click handler in Phase 3.

**Example:**

```tsx
// src/scene/Monitor.tsx (Phase 3 modification — adds children + click handler)
//
// Source: [CITED: r3f.docs.pmnd.rs/api/events — onPointerMissed on Canvas,
//          stopPropagation, intersection data]
//         UI-SPEC § Defocus animation (D-10), Click-to-focus (D-08)
import { SCENE_COLORS } from './colors';
import type { ReactNode } from 'react';

interface MonitorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  monitorId: 'left' | 'center' | 'right';            // NEW Phase 3
  focused: 'left' | 'center' | 'right' | null;       // NEW Phase 3
  onFocusToggle: (id: 'left' | 'center' | 'right') => void;  // NEW Phase 3
  children?: ReactNode;                              // NEW Phase 3 — UI-SPEC Pattern 3 Option A
}

export function Monitor({
  position, rotation = [0, 0, 0],
  monitorId, focused, onFocusToggle, children,
}: MonitorProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame/back — unchanged */}
      <mesh castShadow>
        <boxGeometry args={[0.58, 0.35, 0.04]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Screen plane — NOW interactive (Phase 3). Click toggles focus.
          If this screen is already the focused one → re-click defocus (D-10 #3).
          Otherwise → focus this screen. */}
      <mesh
        position={[0, 0, 0.025]}
        onClick={(e) => {
          e.stopPropagation();    // do NOT trigger onPointerMissed
          onFocusToggle(monitorId);
        }}
      >
        <planeGeometry args={[0.55, 0.32]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={focused === monitorId ? 2.0 : 1.5}
          // Slightly brighter when focused (subtle visual feedback);
          // optional polish — UI-SPEC permits but doesn't require it.
          toneMapped={false}
        />
      </mesh>
      {/* <Html transform occlude="blending"> overlay (Phase 3 — passed as children). */}
      {children}
      {/* Stand — unchanged */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.15, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
```

**Click-outside (defocus trigger #2) wired on the Canvas:**

```tsx
// src/shells/ThreeDShell.tsx (Phase 3 modification — onPointerMissed)
<Canvas
  onPointerMissed={() => {
    // Fires on canvas clicks that didn't hit ANY mesh.
    // UI-SPEC § Defocus triggers (D-10 #2): outside-click defocuses.
    if (focused !== null) {
      setFocused(null);
      setQueryParams({ focus: null });
    }
  }}
  // ... rest of Canvas props from Phase 2 unchanged
>
```

**Why `onPointerMissed` (not raycaster intersection check):** R3F's `onPointerMissed` is the documented R3F API for "user clicked the canvas but no mesh raycaster fire" `[CITED: r3f.docs.pmnd.rs/api/events]` — simpler and more idiomatic than manually constructing a raycaster against the screen-plane meshes. Stop-propagation in the screen-plane click handler ensures click-on-monitor doesn't ALSO trigger `onPointerMissed`.

**Why `stopPropagation()` in screen-plane click:** without it, both the screen-plane mesh's `onClick` AND the canvas's `onPointerMissed` would fire (R3F's bubble model). UI-SPEC requires re-click on focused monitor → defocus, NOT focus + immediately defocus.

### Pattern 6: `?focus=<id>` URL ↔ Camera State Sync

**What:** the URL is the single source of truth for which monitor (if any) is focused. `<FocusController>` reads `?focus=` via `useQueryParams` and triggers GSAP animation. Header `[bracket]` link clicks update the URL via `setQueryParams`, which fires the `qpchange` event, which makes `<FocusController>`'s subscription re-render with the new value.

**When to use:** every Phase 3 focus-state change.

**URL state semantics:**
- `?focus=projects` → focus left monitor
- `?focus=about` or `?focus=whoami` → focus center monitor
- `?focus=writeups` → focus right monitor (in-place mode = `<WriteupList>`)
- `?focus=writeups/<slug>` → focus right monitor + render `<WriteupView slug={...}>`
- (no `?focus=`) → default orbit pose

**First-mount vs in-session distinction:** UI-SPEC locks that first-mount with `?focus=` is an instant snap (no cinematic intro), but in-session `?focus=` change (e.g., user clicks a header `[projects]` link while at default orbit) is animated. Pattern 4 implements this via `isFirstMount.current` ref.

**Example (header `[bracket]` click in 3D shell):**

```tsx
// src/ui/Header.tsx (Phase 3 modification — onClick handlers for goto links
// in 3D shell trigger camera focus instead of scroll)
//
// Source: UI-SPEC § Click-to-focus animation triggered by header bracket
import { setQueryParams } from '../lib/useQueryParams';

// Inside Header — when current shell is 3D, override the goto link onClick:
function handleGotoClick(sectionId: string, currentView: '3d' | 'text', e: React.MouseEvent) {
  if (currentView === '3d') {
    e.preventDefault();
    setQueryParams({ focus: sectionId });
    // <FocusController> picks up the URL change via useQueryParams subscription
    // → triggers GSAP animation. App.tsx's existing scrollIntoView handler
    // is gated by view !== '3d' (see App.tsx modification below).
  }
  // text shell: existing Phase 1 behaviour (scroll to anchor) carries over
}
```

**`App.tsx` minor modification:** the existing `useEffect` that scrolls on `?focus=` change must be gated to text-shell-only:

```tsx
// src/app/App.tsx — modify Phase 1 effect to skip when view === '3d'
useEffect(() => {
  const focus = params.get('focus');
  if (!focus) return;
  if (params.get('view') === '3d') return;  // NEW Phase 3 — 3D shell handles its own focus
  const el = document.getElementById(focus);
  if (!el) return;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  // ... rest unchanged
}, [params, reduced]);
```

### Pattern 7: MDX Runtime Split Between Text Shell and 3D Chunk (Bundle Strategy)

**What:** the text shell's 120 KB gz budget is tight. Adding the MDX runtime (`@mdx-js/react` ~3 KB gz + 3 compiled MDX modules ~5-8 KB gz) directly to the text shell would consume the remaining ~50 KB of headroom unnecessarily, since most recruiters using the text shell never click into a write-up.

**The fork:**

| Option | Mechanism | Text-shell budget impact | UX impact |
|--------|-----------|-------------------------|-----------|
| **A (RECOMMENDED)** | Lazy text-shell route — `<TextShell>` renders `<WriteupList>` (titles + dates only, lightweight) at `?focus=writeups`; on row click, lazy-import a `<WriteupsRoute>` chunk that loads MDX runtime + write-up modules | **Zero** — MDX runtime stays in a separate chunk that recruiters only download when they choose to read a write-up. | Recruiters who skim the index (typical 30s skim) pay nothing. Recruiters who read pay one extra ~30 KB chunk download (broadband: <1s). |
| B | MDX runtime always in text shell + 3D chunk (eager imports both places) | **+15-20 KB gz to text shell** — pushes ~85 KB → ~100-105 KB. Still under 120 KB, but consumes most of the remaining headroom and leaves no room for Phase 4 additions. | All users pay upfront. |
| C | MDX compiled at build-time to static HTML strings; text shell injects via `dangerouslySetInnerHTML` | **Zero** — text shell only carries the static HTML strings (~5-8 KB gz). | Loses MDX component overrides (no `<CodeBlock>` chrome / `<ProvenanceFooter>` styling) UNLESS we hand-write a build-time HTML emitter. Significant complexity for marginal savings vs Option A. |

**Recommendation: Option A.** Implementation:

```tsx
// src/shells/TextShell.tsx (Phase 3 modification — lazy WriteupsRoute)
//
// Source: Bundle budget analysis (Pattern 7); CLAUDE.md "What NOT to Use" — don't
//         ship MDX runtime to recruiters who don't click into a write-up
import { lazy, Suspense } from 'react';
import { useQueryParams } from '../lib/useQueryParams';

const WriteupsRoute = lazy(() => import('../routes/WriteupsRoute'));

export function TextShell() {
  const params = useQueryParams();
  const focus = params.get('focus') ?? '';

  // Phase 1+2 layout: header + sections + footer
  // Phase 3 addition: when ?focus=writeups/<slug>, mount WriteupsRoute lazily
  if (focus.startsWith('writeups/')) {
    return (
      <Suspense fallback={<WriteupsLoadingSkeleton />}>
        <WriteupsRoute slug={focus.slice('writeups/'.length)} />
      </Suspense>
    );
  }

  return (
    <>
      <Header currentView="text" />
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Certs />
        <Writeups /> {/* Now reads from src/content/writeups.ts barrel — but renders ONLY title+date, NOT MDX body */}
        <Contact />
      </main>
      <Footer />
    </>
  );
}
```

**`WriteupsLoadingSkeleton`** is a 5-line component that renders the write-up's frontmatter (title + date + duration) from `src/content/writeups.ts` (which is also imported by the text-shell `<Writeups>` section — so the frontmatter doesn't trigger MDX runtime download; only the compiled MDX module does). Skeleton renders during the lazy chunk download. Verified: Vite separates the lazy import correctly when `import.meta.glob` results are imported through it.

**Bundle expectations (verified pattern from Phase 2 Plan 02-04 metrics):**
- Text shell entry: 65.4 KB gz (Phase 2 baseline) → ~70 KB gz (Phase 3: +`<WriteupList>` + lazy boundary stub) — safely under 120 KB.
- 3D chunk: 236.7 KB gz (Phase 2 baseline) → ~285 KB gz (Phase 3: +GSAP ~33 KB + drei `<Html>` ~3 KB + `@mdx-js/react` ~3 KB + 3 compiled MDX ~6 KB + new Phase 3 components ~5-10 KB) — safely under 450 KB (~36% headroom for Phase 4 postprocessing).
- New `WriteupsRoute` chunk: ~30 KB gz (MDX runtime + 3 compiled write-ups + Shiki output already-baked HTML so no Shiki runtime).

The size estimates are MEDIUM-confidence approximations from `bundlephobia` historical data + Phase 2's measured 3D chunk; planner verifies with `size-limit` after Plan 03-XX writes the new files. If the 3D chunk overshoots 450 KB, the next mitigation is to also lazy-load the 3 MDX modules within the 3D chunk via dynamic import inside `<WriteupView>` — adds a ~50ms first-write-up-click delay but freezes the 3D chunk size.

### Pattern 8: `<MDXProvider>` Mounting + Components Map

**What:** `@mdx-js/react`'s `<MDXProvider>` injects a components map (e.g., `{ h1, h2, code, a, CodeBlock, ScreenshotFrame, ProvenanceFooter }`) that MDX renderers use instead of default tag-name resolution. The `providerImportSource: '@mdx-js/react'` option in Pattern 1 enables this lookup.

**When to use:** wrap every MDX render (both inside the 3D shell `<WriteupView>` and inside the text shell `<WriteupsRoute>`).

**Example:**

```tsx
// src/ui/MDXRenderer.tsx (Phase 3 ships)
//
// Source: [CITED: mdxjs.com/packages/react/]
//         UI-SPEC § MDX section headings — h1/h2 prompt-prefix style
//         UI-SPEC § <CodeBlock> chrome copy (D-16)
import { MDXProvider } from '@mdx-js/react';
import type { ReactNode, ComponentProps } from 'react';
import { TerminalPrompt } from './TerminalPrompt';
import { BracketLink } from './BracketLink';
import { CodeBlock } from './CodeBlock';
import { ScreenshotFrame } from './ScreenshotFrame';
import { ProvenanceFooter } from './ProvenanceFooter';

// MDX-built-in tag overrides — match UI-SPEC § Typography table for write-ups.
function WriteupH1({ children }: ComponentProps<'h1'>) {
  // h1 receives the slug-as-text from frontmatter (Pattern 9 helper).
  // Renders as $ cat <slug>.md prompt-prefix heading.
  return (
    <h1 className="text-xl font-semibold font-mono text-fg mt-6 mb-3">
      <TerminalPrompt><span className="text-fg">{children}</span></TerminalPrompt>
    </h1>
  );
}

function WriteupH2({ children }: ComponentProps<'h2'>) {
  // <h2> receives the section name (Hypothesis, Telemetry, etc.).
  // Renders as $ cat <kebab>.md.
  const slug = String(children)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return (
    <h2 className="text-xl font-semibold font-mono text-fg mt-6 mb-3">
      <TerminalPrompt><span className="text-fg">cat {slug}.md</span></TerminalPrompt>
    </h2>
  );
}

function InlineCode({ children, ...rest }: ComponentProps<'code'>) {
  // Inline <code> — UI-SPEC: bg-surface-1 + body color, NO Shiki tokens.
  // CRITICAL: rehype-pretty-code wraps fenced code in <pre><code>; this
  // override applies to BOTH inline AND fenced. We need to detect whether
  // we're inside a <pre> (fenced) and let rehype-pretty-code's output pass
  // through. The standard MDX 3 idiom: check if the parent is <pre>:
  // - if yes (fenced block) → render plain <code> with rehype-pretty-code
  //   data attributes intact (CodeBlock wraps the <pre>).
  // - if no (inline) → apply UI-SPEC inline styling.
  // Rehype-pretty-code emits <pre data-language="..."><code data-language="...">...
  // We can't easily detect parent in MDX components; but rehype-pretty-code
  // sets `data-language` on inline code via {:lang} syntax, which UI-SPEC
  // forbids — so we KNOW any <code> WITHOUT a parent <pre> is inline.
  // Practical solution: the `pre` tag override (below) wraps fenced blocks
  // in <CodeBlock>, leaving raw <pre><code> inside; this `code` override
  // applies styling at the <code> level. Inline code lacks <pre> wrapper
  // → applies the styling. Verified: rehype-pretty-code's <code> for fenced
  // blocks has data-language, which we use as a sentinel.
  if ('data-language' in rest) {
    return <code {...rest}>{children}</code>;  // fenced — let CodeBlock handle chrome
  }
  return (
    <code className="bg-surface-1 px-1 text-fg" {...rest}>
      {children}
    </code>
  );
}

function MDXLink(props: ComponentProps<'a'>) {
  // Plain MDX [link](url) → BracketLink with external detection.
  const isExternal = props.href?.startsWith('http') ?? false;
  return (
    <BracketLink href={props.href ?? '#'} external={isExternal}>
      {props.children}
    </BracketLink>
  );
}

const components = {
  h1: WriteupH1,
  h2: WriteupH2,
  code: InlineCode,
  a: MDXLink,
  pre: CodeBlock,                                 // wraps rehype-pretty-code's <pre> with chrome
  // Custom components available inside MDX bodies via <ScreenshotFrame /> and <ProvenanceFooter />:
  CodeBlock,
  ScreenshotFrame,
  ProvenanceFooter,
};

export function MDXRenderer({ children }: { children: ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
```

**Where to mount:** `<WriteupView>` (3D shell) and `<WriteupsRoute>` (text shell) both wrap their MDX render in `<MDXRenderer>`. Mounting at App level is unnecessary — write-ups are the only MDX consumers.

**Why `pre` override (not just `code`):** rehype-pretty-code wraps fenced code in `<pre data-language="..."><code>...`. Overriding `pre` lets `<CodeBlock>` (Pattern 10a) read `data-language` from the `<pre>` props and add chrome (filename, language badge, copy button) around the entire pre+code structure. The MDX components map's `pre` override is the conventional MDX 3 + rehype-pretty-code integration `[CITED: rehype-pretty-code GitHub README integration examples MEDIUM]`.

### Pattern 9: `import.meta.glob` Write-up Barrel + Frontmatter Named Exports

**What:** `src/content/writeups.ts` is a typed barrel that imports every `*.mdx` file under `src/content/writeups/` via Vite's `import.meta.glob` with `eager: true`, exposing each module's compiled component (default export) and its frontmatter (the `frontmatter` named export injected at compile time by `remark-mdx-frontmatter` — Pattern 1).

**When to use:** every consumer of write-up data (text-shell `<Writeups>` section, 3D-shell `<WriteupList>`, lazy `<WriteupsRoute>`).

**Example:**

```ts
// src/content/writeups.ts (Phase 3 ships)
//
// Source: [CITED: vite.dev/guide/features#glob-import — eager option, named-export
//          access via mod.frontmatter]
//         [CITED: github.com/remcohaszing/remark-mdx-frontmatter — frontmatter
//          becomes a named export via the `name: 'frontmatter'` config]
//         UI-SPEC § Frontmatter schema (D-14)
import type { ComponentType } from 'react';

export type WriteupType = 'detection' | 'cti' | 'web-auth';
export type WriteupDisclaimer = 'home-lab';     // v1 enum; v2 may add 'cve-disclosure', etc.

export interface WriteupFrontmatter {
  title: string;
  slug: string;
  type: WriteupType;
  date: string;                                  // ISO YYYY-MM-DD
  duration: string;                              // e.g. "~12 min read"
  tags: string[];
  sources: string[];                             // e.g. ["SigmaHQ rules: github.com/SigmaHQ/sigma"]
  attack_techniques: string[];                   // ATT&CK technique IDs
  disclaimer?: WriteupDisclaimer;
  author?: string;                               // defaults to identity.name in <ProvenanceFooter>
}

export interface Writeup extends WriteupFrontmatter {
  Component: ComponentType;                      // the compiled MDX default export
}

// Vite expands this glob at build time into a static map:
//   { './writeups/lolbin-sigma-detection.mdx': mod1, ... }
// `eager: true` makes the modules ship in the same chunk as this barrel —
// for the 3D shell, that's the 3D chunk; for the lazy <WriteupsRoute>, that
// chunk-import boundary in TextShell.tsx is what splits the modules out.
const modules = import.meta.glob<{
  default: ComponentType;
  frontmatter: WriteupFrontmatter;
}>('./writeups/*.mdx', { eager: true });

export const writeups: Writeup[] = Object.values(modules)
  .map((mod) => ({
    ...mod.frontmatter,
    Component: mod.default,
  }))
  // Sort newest first (UI-SPEC § WriteupList row order).
  .sort((a, b) => b.date.localeCompare(a.date));

export function getWriteup(slug: string): Writeup | undefined {
  return writeups.find((w) => w.slug === slug);
}
```

**Why eager:** the right monitor's `<WriteupList>` renders at first 3D-shell paint — needs the frontmatter immediately. Lazy imports would add a frame-boundary delay. Eager is safe because the 3D chunk already includes MDX runtime (~3 KB) and the 3 compiled modules are ~6 KB total; bundle math is fine.

**Why typed via `import.meta.glob<T>`:** Vite 8 supports generic-typed glob imports. Without the type parameter, `mod` would be `Record<string, unknown>` and `mod.frontmatter` would require casts.

**Frontmatter validation:** Phase 3 does NOT add a runtime schema validator (zod, etc.). Authors hand-write frontmatter in the 3 MDX files; types catch typos on `WriteupType` enum. If a frontmatter field is missing, the build would fail at the type level when constructing the `Writeup` object. **Recommendation: keep it simple — author discipline + type inference is sufficient for 3 hand-authored write-ups.**

### Pattern 10: Three MDX Components (`<CodeBlock>`, `<ScreenshotFrame>`, `<ProvenanceFooter>`)

#### Pattern 10a: `<CodeBlock>` — Wraps rehype-pretty-code's `<pre>` with Chrome

```tsx
// src/ui/CodeBlock.tsx (Phase 3 ships)
//
// Source: UI-SPEC § <CodeBlock> chrome copy (D-16)
//         [CITED: rehype-pretty.pages.dev — output HTML structure]
import { useState, useRef, type ReactNode } from 'react';
import { BracketLink } from './BracketLink';

interface CodeBlockProps {
  children?: ReactNode;
  className?: string;
  // rehype-pretty-code passes data-language and data-theme via the <pre> props,
  // and data-rehype-pretty-code-figure on the <figure>. When wrapping `pre`,
  // we receive these as React props (camelCase via React's data-* convention).
  // The figcaption's title comes from the meta string `title="..."`.
  ['data-language']?: string;
  // Note: filename is in the <figcaption>, which is a sibling of <pre>; the
  // pre override doesn't see it directly. We need the parent <figure> override
  // OR we manually unwrap. The cleaner pattern: override `figure` instead of
  // `pre`, see "Alternate" below.
}

export function CodeBlock({ children, ['data-language']: lang, ...rest }: CodeBlockProps) {
  const codeRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    const text = codeRef.current?.querySelector('code')?.textContent ?? '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="my-4 border" style={{
      borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
    }}>
      {/* Chrome strip: filename | language | [copy] */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-base font-mono bg-surface-1 border-b"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
      >
        {/* Filename slot — populated when MDX block has title="..." (see Alternate
            recipe below for figure-based extraction). For inline-prop fallback
            here, leave blank and rely on figure override. */}
        <span className="text-muted flex-1">{/* filename injected by figure override */}</span>
        <span className="text-muted text-base">{lang ?? 'plaintext'}</span>
        <BracketLink as="button" onClick={onCopy} ariaLabel="Copy code to clipboard">
          {copied ? 'copied' : 'copy'}
        </BracketLink>
      </div>
      {/* Code area — rehype-pretty-code's pre+code with all data attrs intact */}
      <pre ref={codeRef} className="px-4 py-3 text-base overflow-x-auto" {...rest}>
        {children}
      </pre>
      {/* Highlighted-line styling via global CSS (in tokens.css):
          [data-line][data-highlighted-line] { background: var(--color-surface-1); } */}
    </div>
  );
}
```

**Alternate (cleaner) recipe — override `figure` not `pre`:** since rehype-pretty-code wraps the entire structure in `<figure data-rehype-pretty-code-figure>` with the `<figcaption>` (title) inside, overriding `figure` lets `<CodeBlock>` read the figcaption text directly:

```tsx
// Alternate CodeBlock — wraps the whole figure (recommended)
function CodeBlock({ children, ...props }: { children: ReactNode }) {
  // children is [<figcaption>filename</figcaption>, <pre>...</pre>]
  // Walk children to extract filename + pre.
  const childArray = Array.isArray(children) ? children : [children];
  const figcaption = childArray.find((c) => c?.type === 'figcaption');
  const pre = childArray.find((c) => c?.type === 'pre');
  const filename = figcaption?.props?.children;
  const lang = pre?.props?.['data-language'];
  // ... render chrome with filename + lang + [copy] button + pre
}
```

**Recommendation: use the figure-based override.** Cleaner separation; reads filename without ad-hoc DOM walking. Map `figure: CodeBlock` instead of `pre: CodeBlock` in the MDXProvider components map.

**Highlighted-line CSS in `src/styles/tokens.css` (or component-scoped):**

```css
@layer components {
  /* rehype-pretty-code highlighted lines — UI-SPEC: bg-surface-1, no accent */
  pre [data-highlighted-line] {
    background-color: var(--color-surface-1);
    /* extend full-width — span has display: inline by default */
    display: block;
    margin: 0 -1rem;        /* compensate for px-4 on outer pre */
    padding: 0 1rem;
  }
}
```

#### Pattern 10b: `<ScreenshotFrame>` — Bordered Image with Caption + Sanitized Badge

```tsx
// src/ui/ScreenshotFrame.tsx (Phase 3 ships)
//
// Source: UI-SPEC § <ScreenshotFrame> caption copy (D-16)
import { assetUrl } from '../lib/baseUrl';

interface ScreenshotFrameProps {
  src: string;                            // relative to public/assets/writeups/<slug>/
  alt: string;                            // mandatory — accessibility
  n: number;                              // figure number (e.g., 1, 2, 3)
  caption: string;                        // one-line description
  // The [✓ sanitized] badge is mandatory and auto-rendered — authors can't omit it.
}

export function ScreenshotFrame({ src, alt, n, caption }: ScreenshotFrameProps) {
  return (
    <figure
      className="my-4 border p-2"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
      }}
    >
      <img src={assetUrl(src)} alt={alt} className="block w-full h-auto" />
      <figcaption className="mt-2 text-base font-mono text-muted">
        <span>fig {n} — {caption}</span>
        <span className="text-accent ml-2" aria-label="Sanitized per OPSEC checklist">
          [✓ sanitized]
        </span>
      </figcaption>
    </figure>
  );
}
```

**Authors use it in MDX as:**

````mdx
<ScreenshotFrame
  n={1}
  src="lolbin-sigma-detection/01-splunk-dashboard.png"
  alt="Splunk dashboard with three rule-match events highlighted in the Search & Reporting view"
  caption="Splunk dashboard showing the rule-match against synthetic events"
/>
````

#### Pattern 10c: `<ProvenanceFooter>` — Frontmatter-Driven Sources/ATT&CK/Meta Footer

```tsx
// src/ui/ProvenanceFooter.tsx (Phase 3 ships)
//
// Source: UI-SPEC § <ProvenanceFooter> copy (D-15)
//         Pitfall 7 mitigation — provenance rule for write-ups
import { BracketLink } from './BracketLink';
import { ATTACK_TECHNIQUES } from '../content/attack-techniques';
import { identity } from '../content/identity';
import type { WriteupFrontmatter } from '../content/writeups';

interface ProvenanceFooterProps {
  frontmatter: WriteupFrontmatter;
}

export function ProvenanceFooter({ frontmatter }: ProvenanceFooterProps) {
  const { sources, attack_techniques, author, date, disclaimer } = frontmatter;
  return (
    <footer
      role="contentinfo"
      className="mt-12 pt-6 border-t font-mono text-base"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-muted) 30%, transparent)',
      }}
    >
      <div className="space-y-2">
        {/* # sources */}
        <section>
          <h3 className="text-fg"><span className="text-muted"># </span>sources</h3>
          <ul className="space-y-1">
            {sources.map((s) => {
              // Each source string format: "Display Name: url"
              const [name, url] = s.split(': ');
              return (
                <li key={s}>
                  {url ? (
                    <BracketLink href={url} external>{name}</BracketLink>
                  ) : (
                    <span>{name}</span>
                  )}
                  {url && <span className="text-muted ml-2">{url}</span>}
                </li>
              );
            })}
          </ul>
        </section>
        {/* # attack-techniques */}
        <section>
          <h3 className="text-fg"><span className="text-muted"># </span>attack-techniques</h3>
          <ul className="space-y-1">
            {attack_techniques.map((id) => {
              const name = ATTACK_TECHNIQUES[id] ?? '(unknown technique — add to attack-techniques.ts)';
              return (
                <li key={id}>
                  <BracketLink
                    href={`https://attack.mitre.org/techniques/${id.replace('.', '/')}/`}
                    external
                    ariaLabel={`MITRE ATT&CK technique ${id}: ${name}`}
                  >
                    {id}
                  </BracketLink>
                  <span className="text-muted ml-2">{name}</span>
                </li>
              );
            })}
          </ul>
        </section>
        {/* # meta */}
        <section>
          <h3 className="text-fg"><span className="text-muted"># </span>meta</h3>
          <p className="text-muted">— {author ?? identity.name}, {date}</p>
          {disclaimer === 'home-lab' && (
            <p className="text-muted">
              <span className="text-muted"># </span>
              disclaimer: home lab — synthetic data, no live targets engaged
            </p>
          )}
        </section>
      </div>
    </footer>
  );
}
```

**Auto-mount:** UI-SPEC says authors do NOT include `<ProvenanceFooter />` in MDX bodies — the renderer auto-mounts after the last section. Implementation: `<WriteupView>` renders `<MDXRenderer>{<Component />}</MDXRenderer>` then a sibling `<ProvenanceFooter frontmatter={writeup} />`:

```tsx
// src/ui/WriteupView.tsx (Phase 3 ships)
export function WriteupView({ slug }: { slug: string }) {
  const writeup = getWriteup(slug);
  if (!writeup) {
    // UI-SPEC § Empty / placeholder states: unknown slug → 404
    return <NotFound />;
  }
  const { Component, ...frontmatter } = writeup;
  return (
    <article>
      <BackButton />
      <MDXRenderer>
        <Component />
      </MDXRenderer>
      <ProvenanceFooter frontmatter={frontmatter} />
    </article>
  );
}
```

**`src/content/attack-techniques.ts`** is a hand-curated map. Initial list is the techniques referenced by the 3 D-17 write-ups:

```ts
// src/content/attack-techniques.ts (Phase 3 ships)
//
// Hand-curated subset of MITRE ATT&CK Enterprise. Keys are technique IDs
// (or sub-technique IDs as e.g. "T1218.010"); values are canonical names.
// Source: https://attack.mitre.org/techniques/enterprise/
//
// Add new entries as future write-ups reference techniques. Phase 3 ships
// the ~10 techniques touched by the 3 locked write-ups + 30 frequently-
// referenced techniques for forward growth (planner's discretion which
// to seed; recommendation: TA0001 Initial Access top-10).
export const ATTACK_TECHNIQUES: Record<string, string> = {
  'T1140': 'Deobfuscate/Decode Files or Information',
  'T1105': 'Ingress Tool Transfer',
  'T1218.010': 'System Binary Proxy Execution: Regsvr32',
  'T1218.005': 'System Binary Proxy Execution: Mshta',
  'T1190': 'Exploit Public-Facing Application',
  'T1059.001': 'Command and Scripting Interpreter: PowerShell',
  // ... ~30 more, planner decides
};
```

### Pattern 11: `scripts/check-parity.mjs` — Section Parity Audit (TXT-06)

**What:** a Node ESM script that walks `src/content/sections.ts` SECTIONS const + `src/sections/*.tsx` filenames + `src/scene/Workstation.tsx` `<MonitorOverlay>` mounts, and asserts every section ID has either a text-shell render OR a 3D-shell monitor render. Plus the CNT-03 provenance check: every `skills.ts` tag appears in some `projects.ts` tagline OR some `writeups.ts` frontmatter `tags`.

**When to use:** runs as `npm run parity` in the GitHub Actions workflow before `npm run build`.

**Example:**

```js
// scripts/check-parity.mjs (Phase 3 ships)
//
// Source: D-19 (TXT-06 parity gate)
//         CNT-03 provenance rule (every skill must have an artefact)
//
// This script is INTENTIONALLY .mjs (Node ESM) so it can statically
// import .ts files via tsx/esbuild's loader, which is already a Vite
// dev-dep. Alternative considered: a Vitest test that runs at CI time.
// Recommendation chose .mjs over Vitest because the audit failure should
// halt the build BEFORE tsc/vite run (the parity drift is a content
// concern, not a code concern).
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Read SECTIONS const (regex-extract — sections.ts is a single const export).
const sectionsSrc = readFileSync(resolve(ROOT, 'src/content/sections.ts'), 'utf8');
const sectionIds = [...sectionsSrc.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);
// → ['about', 'skills', 'projects', 'certs', 'writeups', 'contact']

// Walk src/sections/*.tsx — filename is the section name (case-insensitive).
const sectionFiles = readdirSync(resolve(ROOT, 'src/sections'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.replace(/\.tsx$/, '').toLowerCase());
// → ['about', 'certs', 'contact', 'education', 'hero', 'projects', 'skills', 'writeups']

// Read Workstation.tsx — extract MonitorOverlay component names mounted as
// children of <Monitor> (Phase 3 wiring).
const workstationSrc = readFileSync(resolve(ROOT, 'src/scene/Workstation.tsx'), 'utf8');
// 3D shell mounts (per UI-SPEC D-01):
//   - left:   <Projects /> → matches 'projects'
//   - center: <CenterMonitorContent /> → satisfies 'about' AND 'skills' (composes both)
//   - right:  <WriteupsMonitor /> → matches 'writeups'
// We use a hand-maintained mapping const — auditing the JSX tree from a
// regex is fragile. The mapping is a 5-line table:
const THREE_D_MOUNTS = {
  left: ['projects'],
  center: ['about', 'skills', 'whoami'],
  right: ['writeups'],
};
const threeDSatisfies = new Set(Object.values(THREE_D_MOUNTS).flat());

// Assertion 1: every SECTIONS id has either a text-shell render OR a 3D mount.
const errors = [];
for (const id of sectionIds) {
  const hasTextShell = sectionFiles.includes(id);
  const has3D = threeDSatisfies.has(id);
  if (!hasTextShell && !has3D) {
    errors.push(`Section "${id}" has neither a text-shell render nor a 3D-shell monitor mount.`);
  }
}

// Assertion 2 (CNT-03): every skills.ts tag appears in some projects.ts
// tagline OR some writeups.ts frontmatter tags.
const skillsSrc = readFileSync(resolve(ROOT, 'src/content/skills.ts'), 'utf8');
const skills = [...skillsSrc.matchAll(/['"`]([a-z0-9+#./-]+)['"`]/gi)].map((m) => m[1].toLowerCase());

const projectsSrc = readFileSync(resolve(ROOT, 'src/content/projects.ts'), 'utf8').toLowerCase();
const writeupTags = readdirSync(resolve(ROOT, 'src/content/writeups'))
  .filter((f) => f.endsWith('.mdx'))
  .flatMap((f) => {
    const src = readFileSync(resolve(ROOT, 'src/content/writeups', f), 'utf8');
    const tagsBlock = src.match(/tags:\s*\[([^\]]+)\]/);
    if (!tagsBlock) return [];
    return [...tagsBlock[1].matchAll(/['"`]([a-z0-9+#./-]+)['"`]/gi)].map((m) => m[1].toLowerCase());
  });

for (const skill of skills) {
  const inProject = projectsSrc.includes(skill);
  const inWriteup = writeupTags.includes(skill);
  if (!inProject && !inWriteup) {
    errors.push(
      `CNT-03 provenance violation: skill "${skill}" has no project or write-up demonstrating it.`,
    );
  }
}

if (errors.length > 0) {
  console.error('check-parity.mjs FAILED:\n  ' + errors.join('\n  '));
  process.exit(1);
}
console.log(`check-parity.mjs PASSED — ${sectionIds.length} sections audited, ${skills.length} skills audited.`);
```

**Why hand-maintained mapping (not JSX-AST parsing):** parsing JSX from a regex is fragile; using TypeScript's compiler API just for this is heavyweight. The 3-line `THREE_D_MOUNTS` const is a single source of truth that the planner updates if Phase 3+ adds another monitor mount. Drift detection catches the case where SECTIONS gains a new id but neither shell renders it.

**Skills regex caveat:** `skills.ts` contains a `string[]` array; the regex extracts every quoted lowercase token. False positives (e.g., a comment `'TODO'` would match) are filtered by lowercasing + the audit still passing if `'todo'` accidentally appears in projects.ts. Practical: the regex is good enough for a 5-line `skills.ts` file with hand-curated content. Planner verifies the regex output against the actual `skills.ts` shape before committing.

**`package.json` additions:**

```json
"scripts": {
  "parity": "node scripts/check-parity.mjs",
  // ... existing
  "build": "npm run parity && tsc --noEmit && vite build"  // gate build behind parity
}
```

### Pattern 12: `<MonitorOverlay>` `distanceFactor` Calibration

**What:** drei `<Html transform>`'s `distanceFactor` scales the projected DOM relative to camera distance. UI-SPEC D-03 fixes the DOM at 600×400 px and the screen plane at 0.55×0.32 m. The `distanceFactor` is the calibration constant that makes 14 px text legible from the default camera position `[2.4, 1.4, 2.4]` looking at `[0, 0.95, 0]`.

**When to use:** Phase 3 must determine `distanceFactor` empirically; this section gives the math approximation + a verification recipe.

**Math approximation:**

drei source: `scale = objectScale(group, camera) * distanceFactor`. `objectScale` returns `1 / (camera.matrix.position - object.position).length()` for perspective camera (approximately). Default camera is at `[2.4, 1.4, 2.4]` and the center monitor screen plane is at `[0, 0.95, -0.05]` — distance is roughly `sqrt(2.4² + 0.45² + 2.45²) ≈ 3.45 m`.

To map a 600×400 px DOM onto a 0.55×0.32 m screen plane, the DOM's CSS pixel size needs to be scaled by `0.55 m / 600 px ≈ 0.000917 m/px`. drei's `transform` mode applies this implicitly — you set the DOM size in CSS pixels, and `distanceFactor` controls the relative size at 1m camera distance.

**Empirical starting point:** UI-SPEC § MonitorOverlay row says "estimate `~1.5-2.5`; planner verifies in dev." Reasoning: at 1m camera distance, drei's default scale puts a 600×400 px DOM at roughly the size of the entire viewport (depending on FOV). For the monitor screen to fill ~0.55 m × 0.32 m at 3.45 m distance, with FOV 50°, the empirical sweet spot is `distanceFactor ≈ 1.8-2.0`.

**Verification recipe (planner runs in dev mode):**

```tsx
// dev-only sanity check in src/scene/MonitorOverlay.tsx
const DISTANCE_FACTOR = 1.8;  // starting point — TUNE after first dev render
```

In Vite dev mode:
1. Open `?view=3d`.
2. Verify the 600×400 px DOM exactly fills the 0.55×0.32 m screen plane (no overflow past the bezel, no shrinking with margin).
3. Check 14 px text legibility from default orbit camera at `[2.4, 1.4, 2.4]` — should be readable but small. If unreadable, increase `distanceFactor` (makes DOM render larger → text bigger). If overflowing past bezel, decrease.
4. Check focused-monitor pose `[0, 1.05, 0.65]` (center) at distance ~0.7 m — text should be comfortable to read.
5. Commit the tuned value to `src/scene/cameraPoses.ts` as a const.

**Per-monitor focus poses const** (UI-SPEC D-08; refined for Phase 2 actual monitor positions):

```ts
// src/scene/cameraPoses.ts (Phase 3 ships)
//
// Source: UI-SPEC § Click-to-focus animation D-08; Phase 2 Workstation.tsx
//         monitor positions [-0.45, 0.95, -0.05], [0, 0.95, -0.05], [0.45, 0.95, -0.05]
export type FocusId = 'left' | 'center' | 'right';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export const MONITOR_FOCUS_POSES: Record<FocusId, CameraPose> = {
  // ~0.7 m in front of each screen plane at screen-center height (y=0.95).
  // The +0.05 y offset gives a slight head-down camera angle (more natural).
  left:   { position: [-0.45, 1.0, 0.7],  target: [-0.45, 0.95, -0.05] },
  center: { position: [0,     1.05, 0.65], target: [0,     0.95, -0.05] },
  right:  { position: [0.45,  1.0, 0.7],  target: [0.45,  0.95, -0.05] },
};

export const DEFAULT_ORBIT_POSE: CameraPose = {
  position: [2.4, 1.4, 2.4],
  target: [0, 0.6, 0],          // matches Phase 2 Controls.tsx OrbitControls target
};

// Calibrated empirically — TUNE after first dev render, see Pattern 12.
export const DISTANCE_FACTOR = 1.8;
```

### Pattern 13: `<WhoamiGreeting>` Animated Typing Component

**What:** the 3-line typed prompt sequence on the center monitor. `useState` step counter advances on `setTimeout` chain; final state shows all 3 prompts + outputs + blinking cursor.

**When to use:** mounted inside `<CenterMonitorContent>` at the top of the center monitor's overlay.

**Example:**

```tsx
// src/ui/WhoamiGreeting.tsx (Phase 3 ships)
//
// Source: UI-SPEC § <WhoamiGreeting> (D-05, D-06, D-07)
//         Phase 1 src/sections/Hero.tsx — reuses identity, BracketLink, EmailReveal
import { useEffect, useState } from 'react';
import { identity } from '../content/identity';   // D-20: status field added
import { assetUrl } from '../lib/baseUrl';
import { BracketLink } from './BracketLink';
import { EmailReveal } from './EmailReveal';
import { TerminalPrompt } from './TerminalPrompt';
import { useReducedMotion } from '../lib/useReducedMotion';

const COMMANDS = ['whoami', 'status', 'links --all'];
const CHAR_MS = 35;       // 30-40ms per char (D-06 — middle of range)
const INTER_LINE_MS = 200; // 200ms pause between commands (D-06)

interface WhoamiState {
  // Number of fully-typed commands (0..3). When step === 3, sequence done.
  step: number;
  // Number of chars typed in current command (0..COMMANDS[step].length).
  charIdx: number;
}

export function WhoamiGreeting() {
  const reduced = useReducedMotion();
  const [state, setState] = useState<WhoamiState>(() =>
    // Reduced motion: render final state immediately on mount.
    reduced ? { step: 3, charIdx: 0 } : { step: 0, charIdx: 0 }
  );

  useEffect(() => {
    if (reduced) return;
    if (state.step >= COMMANDS.length) return;  // sequence done

    const cmd = COMMANDS[state.step];
    if (state.charIdx < cmd.length) {
      // Type next char.
      const id = window.setTimeout(() => {
        setState((s) => ({ ...s, charIdx: s.charIdx + 1 }));
      }, CHAR_MS);
      return () => window.clearTimeout(id);
    }
    // Command finished typing — pause, then advance to next command.
    const id = window.setTimeout(() => {
      setState({ step: state.step + 1, charIdx: 0 });
    }, INTER_LINE_MS);
    return () => window.clearTimeout(id);
  }, [state, reduced]);

  const sequenceDone = state.step >= COMMANDS.length;

  return (
    <pre
      className="text-fg whitespace-pre-wrap text-base font-mono m-0"
      aria-label="Terminal greeting: identity, status, and contact links"
    >
      {/* Line 1: $ whoami → identity */}
      <TerminalPrompt>
        <span className="text-fg">{state.step >= 1 ? 'whoami' : COMMANDS[0].slice(0, state.charIdx)}</span>
      </TerminalPrompt>
      {state.step >= 1 && (
        <>
          {'\n'}
          <span className="text-muted">eren@workstation:~$</span>
          {'\n'}
          {identity.name} — {identity.role} ({identity.location})
        </>
      )}
      {/* Line 2: $ status → status */}
      {state.step >= 1 && (
        <>
          {'\n\n'}
          <TerminalPrompt>
            <span className="text-fg">{state.step >= 2 ? 'status' : COMMANDS[1].slice(0, state.charIdx)}</span>
          </TerminalPrompt>
        </>
      )}
      {state.step >= 2 && (
        <>
          {'\n'}
          Currently: {identity.status}
        </>
      )}
      {/* Line 3: $ links --all → 4 brackets */}
      {state.step >= 2 && (
        <>
          {'\n\n'}
          <TerminalPrompt>
            <span className="text-fg">{state.step >= 3 ? 'links --all' : COMMANDS[2].slice(0, state.charIdx)}</span>
          </TerminalPrompt>
        </>
      )}
      {sequenceDone && (
        <>
          {'\n'}
          <BracketLink href={assetUrl(identity.cvFilename)} download>CV</BracketLink>{'  '}
          <BracketLink href={identity.github} external>GitHub</BracketLink>{'  '}
          <BracketLink href={identity.linkedin} external>LinkedIn</BracketLink>{'  '}
          <EmailReveal encoded={identity.emailEncoded} />
          {'\n'}
          <span className="text-accent motion-safe:animate-cursor-blink" aria-hidden="true">█</span>
        </>
      )}
    </pre>
  );
}
```

**Cursor blink:** UI-SPEC reuses Phase 1 hero's `motion-safe:animate-cursor-blink` Tailwind class. The class is already defined in Phase 1's tokens.css — verified by reading `src/sections/Hero.tsx` line 28. The `motion-safe:` variant means the blink runs ONLY when reduced-motion is OFF; reduced-motion users see static `█`. No new CSS needed in Phase 3.

**Why useState + setTimeout (not motion library):** for a one-shot 5-second sequence with cleanup-on-unmount semantics, hand-rolled is simpler and ships zero new bytes. CLAUDE.md "Animation: When to Use Which Tool" says GSAP is for camera/scene timeline; motion is for routine UI; this is neither — it's domain-specific terminal rhythm.

**Critical: cleanup on unmount.** The `return () => window.clearTimeout(id)` in `useEffect` ensures unmounting `<WhoamiGreeting>` mid-sequence (e.g., user toggles to text shell mid-typing) cancels pending timers. Without cleanup, the orphan `setState` would log a React warning about state updates on unmounted components.

**`identity.status` field — D-20 addition to `identity.ts`:**

```ts
// src/content/identity.ts — Phase 3 D-20 modification
export interface Identity {
  // ... existing fields
  status: string;     // NEW Phase 3 — D-05: drives the $ status line
}
export const identity: Identity = {
  // ... existing
  status: 'QA at Fin-On — studying Security+ — available for SOC analyst roles',
};
```

### Anti-Patterns to Avoid

These are anti-patterns the planner / executor MUST guard against in Phase 3 (extends Phase 1+2's audit lists):

- **Setting state in `useFrame`** — Phase 3 doesn't use `useFrame` at all; GSAP mutates camera/target refs directly. ESLint/grep rule from Phase 2 already enforces this. (PITFALLS.md Pitfall 2)
- **Duplicating content into a 3D-only file** — every monitor's content reads from `src/content/*` through `src/ui/*` / `src/sections/*`. Single source of truth is the entire reason for the dual-shell architecture. (Pitfall 4)
- **`localStorage` writes for focus state** — URL is single source of truth (D-11). Phase 2 D-12 grep already enforces no-localStorage in shells.
- **HUD overlay during camera focus** ("Press Esc to return", "Click a monitor", "Drag to look around") — UI-SPEC § Camera-focus visual indicators explicitly forbids it. The aria-label on canvas is the screen-reader affordance.
- **`prefers-reduced-motion` UI override toggle** — respect OS setting; never provide a UI override (UI-SPEC).
- **Custom CRT shader on monitor surfaces** — Phase 4 (3D-08) postprocessing is the v1 CRT effect. Custom GLSL shaders are V2-3D-02. (CLAUDE.md "What NOT to Use")
- **Permanent loop on `<WhoamiGreeting>` sequence** — D-07 explicitly: sequence runs ONCE per mount; cursor blinks indefinitely after.
- **Type-out animation on body content** — REQUIREMENTS.md OOS + Phase 1 D-07. Type-out limited to the THREE whoami prompt lines only. About paragraphs, Skills tags, project rows, write-up index, code blocks, screenshots all render INSTANTLY.
- **Fake REPL inside center monitor** — REQUIREMENTS.md OOS. `<WhoamiGreeting>` is a CONSTRAINED display animation, not interactive.
- **Plagiarised CTF write-ups** — Pitfall 7. `<ProvenanceFooter>` mandatory; sources cite all walkthroughs.
- **Screenshots without `[✓ sanitized]` badge** — UI-SPEC § ScreenshotFrame mandatory. OPSEC discipline made visible.
- **Listing tools in `skills.ts` without provenance** — CNT-03 + Pitfall 7. `scripts/check-parity.mjs` enforces (Pattern 11).
- **Camera intro animation on `?focus=` deep-link first-mount** — D-11 + UI-SPEC § Camera-focus visual indicators: instant snap.
- **Modal / lightbox / zoom-on-click on screenshots** — UI-SPEC anti-pattern. Static images at full inline size.
- **Per-write-up "estimated reading time" calculated at build time** — author provides `duration` in frontmatter (D-14). Calculation drift is its own bug class.
- **`<WriteupView>` opening in a new browser tab / window** — in-place mode (D-19). NO `target="_blank"` on row clicks.
- **Auto-loading external CDN images in MDX** — all images must be in `public/assets/writeups/<slug>/`. CSP risk + CDN dependency.
- **Inline `<script>` or `<style>` tags inside MDX bodies** — security + maintainability anti-pattern. (UI-SPEC § Forbidden assets)
- **Loading spinners on `<WriteupList>` row clicks** — write-ups are bundled at build time; no loading state in 3D shell. (Text-shell lazy `<WriteupsRoute>` DOES have a `<WriteupsLoadingSkeleton>` — see Pattern 7 — but it renders the title+date instantly, not a spinner.)
- **Smooth scroll inside drei `<Html>` overlays** — `scroll-behavior: smooth` is NOT applied; native browser default.
- **`bg-transparent` or any opacity < 1.0 on `<MonitorOverlay>` inner div** — emissive bleed-through is the anti-use.
- **`<iframe>` inside MDX** — drei `<Html>` documented to have iframe blind spots; not relevant in Phase 3 (write-ups render via MDX as React components).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Project DOM onto a 3D plane with occlusion | Custom CSS3DRenderer + raycasting + manual depth-sorting | drei `<Html transform occlude="blending">` | drei is built on CSS3DRenderer internally; gives correct depth-sorted occlusion + interactive DOM with no manual juggling. CLAUDE.md decision rationale. |
| Animate React state in lockstep with Three.js objects on a timeline | Hand-written `useEffect` + `requestAnimationFrame` loop | `gsap` + `@gsap/react` `useGSAP()` | GSAP gives easing functions, parallel tweens via timeline, automatic cleanup via `gsap.context()`. Strict Mode safe. CLAUDE.md "Animation" table. |
| Compile MDX at build time + inject component overrides | `vite-plugin-mdx` (third-party shim) | `@mdx-js/rollup` (official) | CLAUDE.md "What NOT to Use" — `vite-plugin-mdx` is older + not maintained in lockstep with MDX 3. |
| Syntax-highlight code blocks in MDX | Prism.js (runtime) + custom theme JSON | `rehype-pretty-code` + Shiki (build-time) + `github-dark` theme | Prism ships grammars + themes to the browser; Shiki at build time renders to static HTML. CLAUDE.md "What NOT to Use". |
| Parse YAML frontmatter from `*.mdx` files | `gray-matter` runtime parser called from `src/content/writeups.ts` | `remark-frontmatter` + `remark-mdx-frontmatter` (build-time) | gray-matter adds runtime cost; remark plugins emit `export const frontmatter = {...}` at compile time — zero runtime parsing. |
| Discover `*.mdx` files at runtime | `fs.readdirSync` in a build step | Vite's `import.meta.glob({ eager: true })` | First-class Vite API; produces a static map at build time; zero runtime fs cost. |
| Type-out a 3-line typing animation | Pull in `motion` or `react-spring` | Hand-rolled `useState` + `setTimeout` chain in `useEffect` with cleanup | One-shot 5-second sequence doesn't justify a 30 KB animation library. CLAUDE.md "Animation" table reserves motion for routine UI animations across many surfaces — this is one surface. |
| Outside-click defocus detection on Canvas | Custom raycaster + `intersectObjects([screenPlane1, ...])` | R3F's `onPointerMissed` on `<Canvas>` | R3F's documented API; fires when no mesh raycaster fires. Cleaner. (Pattern 5) |
| Esc keypress handling | `react-hotkeys-hook` library | Native `window.addEventListener('keydown', ...)` in `useEffect` | One key, one listener, cleanup in unmount. No library needed. |
| `prefers-reduced-motion` reactivity | `useMediaQuery` library | Phase 1's existing `useReducedMotion()` hook | Already shipped; reactive via `matchMedia.addEventListener('change', ...)`. |
| ATT&CK technique ID → name lookup | API call to `attack.mitre.org/api/...` | Hand-curated `src/content/attack-techniques.ts` table (~50 entries) | Static-only host; no API calls allowed. The ~50 most-relevant techniques cover the 3 write-ups + immediate growth. |

**Key insight:** Phase 3 is ~80% gluing existing libraries (drei, GSAP, MDX) together via documented integration patterns. The hand-rolled scope is narrow: `<WhoamiGreeting>` typing, `scripts/check-parity.mjs`, the 3 MDX components' chrome, and the 3 collaborative write-up bodies. Everything else is library glue.

---

## Common Pitfalls

### Pitfall 1: MDX plugin order (`@vitejs/plugin-react` BEFORE `@mdx-js/rollup`)

**What goes wrong:** plugin-react's JSX transform runs first on `*.mdx` files (which contain raw markdown), failing with "Unexpected token" parsing errors.

**Why it happens:** Vite plugins run in registration order by default. `@mdx-js/rollup` exposes itself as a regular plugin object; without `enforce: 'pre'`, the dev forgets to push it to the front.

**How to avoid:** use the `{ enforce: 'pre', ...mdx({...}) }` spread idiom from MDX 3 docs (Pattern 1). The `enforce: 'pre'` tells Vite to run this plugin before plugin-react regardless of registration order.

**Warning signs:** `npm run build` errors with "Unexpected token" on the first MDX file; dev mode hot-reloads succeed only on `.tsx` files but `.mdx` edits trigger the same parse error.

### Pitfall 2: GSAP context leak in Strict Mode (raw `useEffect` instead of `useGSAP`)

**What goes wrong:** raw `useEffect(() => { gsap.to(camera.position, ...); }, [])` works in production but in dev Strict Mode (which double-mounts every component), creates two GSAP tweens on the same camera.position. Result: jitter or worse.

**Why it happens:** Strict Mode mounts → unmounts → mounts the component to surface lifecycle bugs. Without `gsap.context()`, the first tween is never reverted.

**How to avoid:** use `@gsap/react`'s `useGSAP()` hook (Pattern 4), which wraps `gsap.context()` automatically and reverts all animations created during the hook on cleanup.

**Warning signs:** in dev, the camera animation appears to "skip" or "jitter" the first time; in prod (no Strict Mode), the bug is invisible.

### Pitfall 3: `<Html transform>` z-fighting with screen plane mesh

**What goes wrong:** the projected DOM overlay flickers / shows alternating frames of monitor frame vs DOM content because both occupy the same z-plane.

**Why it happens:** Phase 2's screen plane mesh is at `position={[0, 0, 0.025]}` (1mm in front of the monitor frame). If the `<Html transform>` is also placed at `[0, 0, 0.025]`, the depth buffer can't decide which to render first.

**How to avoid:** place `<Html transform>` at `[0, 0, 0.026]` — 1mm in front of the screen plane mesh. UI-SPEC § MonitorOverlay locks this offset.

**Warning signs:** monitor content flickers at certain camera angles; orbiting around the back of the monitor shows alternating textured-plane and DOM frames.

### Pitfall 4: `<Html transform>` text blur on retina / 4K monitors

**What goes wrong:** monitor DOM text appears blurry, especially on 4K external monitors connected to dev machines.

**Why it happens:** `transform` mode applies CSS `matrix3d`; high-DPI rendering interacts poorly with sub-pixel transforms.

**How to avoid:** drei's official guidance (`[CITED: drei.docs.pmnd.rs/misc/html]`) is "scale the parent container up and counter-scale the inner content (e.g., parent `width: 800px`, inner `transform: scale(0.5)` with double-resolution content)". Phase 3 does NOT apply this trick by default (UI-SPEC fixes 600×400 px); planner verifies on a 4K external monitor in dev. If blur is unacceptable, apply the scale-up trick.

**Warning signs:** text rendered inside `<Html transform>` is markedly fuzzier than text in the surrounding DOM (sticky header, footer); recruiters on 4K Macs report unreadable monitor content.

### Pitfall 5: Wheel scroll inside `<Html transform>` propagates to OrbitControls zoom

**What goes wrong:** scrolling inside the focused monitor's DOM ALSO zooms the camera (OrbitControls listens for wheel events on the canvas).

**Why it happens:** drei's `<Html>` source confirms no explicit wheel-event handling — relies on browser default `[VERIFIED: github.com/pmndrs/drei → Html.tsx]`. Wheel events bubble up from the projected DOM to the canvas, where OrbitControls captures them.

**How to avoid:** add `onWheel={(e) => e.stopPropagation()}` on the `<MonitorOverlay>` inner `<div>`. Phase 2's OrbitControls is `enabled={!focused}` during camera focus animation — but ONCE focused, controls are disabled, so wheel events to canvas have no effect anyway. Verify in dev: focus a monitor, scroll inside the DOM, ensure camera doesn't zoom.

**Warning signs:** scrolling inside a focused monitor causes unwanted camera zoom; user reports the scene "fights" their scroll.

### Pitfall 6: MDX runtime in text-shell critical path blowing the 120 KB gz budget

**What goes wrong:** the text-shell entry chunk grows from ~70 KB gz to ~100 KB gz after Phase 3, leaving no headroom for Phase 4 additions (Web3Forms form ~5 KB gz, real OG image ~2 KB gz).

**Why it happens:** dev imports MDX-related modules (`@mdx-js/react` MDXProvider, the components map, the writeups barrel) directly in `<TextShell>` instead of behind a lazy boundary.

**How to avoid:** Pattern 7 — lazy-load `<WriteupsRoute>` only when `?focus=writeups/<slug>` is present. The `<Writeups>` text-shell section reads the frontmatter (titles + dates) from `src/content/writeups.ts` (lightweight), but does NOT mount the MDX runtime until a write-up is clicked.

**Warning signs:** `npm run size` text-shell chunk size jumps from 65 KB gz (Phase 2 baseline) to >100 KB gz; CI fails with "size-limit exceeded".

### Pitfall 7: drei `<Html transform>` `distanceFactor` left at default → DOM oversized or undersized

**What goes wrong:** the projected DOM either overflows the monitor bezel (too large) or is unreadably small (too small).

**Why it happens:** `distanceFactor` is left at undefined (drei default = 1) or set without empirical verification.

**How to avoid:** Pattern 12. Set `distanceFactor` to ~1.8 as starting point; verify in dev mode with both default orbit pose AND focused-monitor pose. Tune to taste, then commit the value to `cameraPoses.ts`.

**Warning signs:** the DOM bleeds past the bezel and shows over the desk surface; or the DOM shrinks to a thumbnail-sized rectangle in the middle of the screen plane.

### Pitfall 8: ATT&CK technique ID → name lookup table missing entries

**What goes wrong:** `<ProvenanceFooter>` renders `(unknown technique — add to attack-techniques.ts)` next to a frontmatter `attack_techniques: [T9999.999]` entry — visible to recruiters, looks unfinished.

**Why it happens:** author adds a new technique ID in frontmatter without updating `src/content/attack-techniques.ts`.

**How to avoid:** add a CI assertion in `scripts/check-parity.mjs` (Pattern 11 extension): every `attack_techniques` ID across all 3 MDX files must exist as a key in `ATTACK_TECHNIQUES`. Fails build on missing entries.

**Warning signs:** the `(unknown technique)` placeholder appears in a deployed write-up; CI didn't catch it.

### Pitfall 9: Frontmatter type drift between `WriteupFrontmatter` interface and actual MDX files

**What goes wrong:** an MDX file is committed with `type: 'detection'` (correct enum) but missing `attack_techniques` field; TypeScript inference doesn't catch it because `import.meta.glob` types are loose.

**Why it happens:** `import.meta.glob<{ frontmatter: WriteupFrontmatter }>` is a CAST, not validation — TypeScript trusts the type and doesn't structurally check at compile time.

**How to avoid:** add a runtime sanity check in `src/content/writeups.ts`:

```ts
for (const w of writeups) {
  if (!w.title || !w.slug || !w.type || !w.date || !w.attack_techniques) {
    throw new Error(`Writeup "${w.slug}" missing required frontmatter fields`);
  }
}
```

Runs at first import (build time during dev / import time in prod). Catches drift cheaply.

**Warning signs:** a write-up renders without ATT&CK techniques in `<ProvenanceFooter>`; a write-up appears in `<WriteupList>` without a date.

### Pitfall 10: OPSEC slip in write-up screenshots (Pitfall 5 from project research)

**What goes wrong:** a Splunk dashboard screenshot reveals home-lab IPs / hostnames / employer-branded tab titles. Career-damaging for a cyber portfolio specifically.

**Why it happens:** the `<ScreenshotFrame>` `[✓ sanitized]` badge is asserted by author, NOT verified by CI. Author commits the badge but forgets to actually run `exiftool` or review at full resolution.

**How to avoid:** OPSEC checklist (per `.planning/CHECKLIST-OPSEC.md`) gate before every write-up commit. The pre-commit checklist items are:
1. Run `exiftool -all= public/assets/writeups/<slug>/*.png`.
2. Open every PNG at full resolution; manually scan for IPs, hostnames, file paths, employer terms, browser tab titles.
3. Mask flags / redacted regions with BLACK BOX (not blur — blur reversible per Pitfall 5).
4. Commit only after sign-off entry in `.planning/CHECKLIST-OPSEC.md` § Screenshot Review for the specific file.

Phase 3's content-fill plan slice MUST embed this checklist as a Task acceptance criterion.

**Warning signs:** a screenshot shows `192.168.x.y` somewhere (any IP); a tab title reads "Fin-On Production Dashboard"; a file path contains `/Users/erenatalay/` or similar real-name folder.

---

## Runtime State Inventory

> Phase 3 is content + integration, NOT a rename/refactor. Most categories are not applicable.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — Phase 3 doesn't introduce databases, ChromaDB collections, Mem0 user_ids, or any persistence layer. URL `?focus=` is the only state surface; localStorage is forbidden. | None |
| Live service config | None — no external services in Phase 3 (Web3Forms is Phase 4). | None |
| OS-registered state | None — static GitHub Pages deploy; no scheduled tasks, pm2 saved processes, systemd units. | None |
| Secrets/env vars | `VITE_FORM_ENDPOINT` is Phase 4; Phase 3 introduces zero new env vars. The `emailEncoded` rot13+base64 string is regenerated by Phase 1's `npm run encode-email` script (D-20: Eren runs this once with real email during the content-fill plan slice). | None — D-20 close-out runs encode-email |
| Build artifacts / installed packages | After Phase 3 dep install, `node_modules/.cache/` may carry stale Vite-MDX cached transforms; `dist/` is gitignored. After D-20 content fill, the OPSEC pipeline `exiftool` strip on `Eren-Atalay-CV.pdf` and `og-image.png` produces files that must be re-committed (their sha changes). | After install, run `npm run build` once to populate Vite's `node_modules/.vite/deps` MDX deps; verify no stale `.cache` issues. |

**Nothing found in category:** verified above. Phase 3 has no rename/refactor surface.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node | Build, dev server, scripts/check-parity.mjs | ✓ (Phase 1 lock — `engines.node >=22.12.0`) | 22.12.0+ | — |
| npm | Package install | ✓ | bundled with Node | — |
| Vite 8 | Build, dev | ✓ (Phase 1 install) | 8.0.10 | — |
| `exiftool` | OPSEC pipeline (D-20 CV PDF + write-up screenshots) | ✓ (CLAUDE.md: assumed — Eren installed for Phase 1 OPS-01) | (system tool, no version pin) | None — blocking. If missing, install via Homebrew: `brew install exiftool`. |
| `imagemagick` (`convert` / `magick`) | Generating real OG image from text-shell screenshot (D-20) | ✓ (typical macOS dev environment) | 7.x | Manual screenshot via macOS Preview + Quick Actions. Not strictly blocking. |
| GitHub Pages | Hosting | ✓ (Phase 1 lock) | — | — |
| GitHub Actions | CI deploy + parity gate | ✓ (Phase 1 lock) | runner-managed | — |
| Browser dev tools (DevTools "Lose Context" extension) | Phase 2 inherited test for context-loss UX | ✓ | Chromium-based | — |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** `imagemagick` not strictly required — manual screenshot via macOS Preview is acceptable for the one-shot OG image generation in D-20.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `vite-plugin-mdx` (third-party shim) | `@mdx-js/rollup` (official) | MDX 3 release (~2023) | Official path; lockstep with MDX core; CLAUDE.md anti-pattern. |
| Prism.js + runtime grammars | `rehype-pretty-code` + Shiki at build time | Shiki 1.0 (~2023) + rehype-pretty-code 0.13 (~2024) | Zero runtime payload for syntax highlighting; VS Code grammar parity. |
| `gray-matter` runtime YAML parsing | `remark-frontmatter` + `remark-mdx-frontmatter` (compile-time named export) | remark-mdx-frontmatter 5.x (~2025) | Zero runtime parsing cost. |
| Raw `useEffect` + manual `gsap.context()` cleanup | `useGSAP()` from `@gsap/react` | `@gsap/react` 1.0 (~2024) | Strict Mode safe; less boilerplate. |
| `framer-motion` package name | `motion` (post-Framer spin-off) | 2025 rebrand | CLAUDE.md "What NOT to Use" lists `framer-motion` as legacy. (Phase 3 doesn't use either.) |

**Deprecated/outdated:**
- `vite-plugin-mdx`: stale, not in lockstep with MDX 3.
- `gray-matter`: still maintained but eclipsed by build-time alternatives for static-site write-up directories.
- Prism.js for new projects: Shiki is the modern default.

---

## Code Examples

Verified patterns from official sources, ready for the planner to adapt:

### Example 1: MDX file with frontmatter + components

```mdx
---
title: "Detecting certutil.exe Network Abuse with Splunk + Sigma"
slug: lolbin-sigma-detection
type: detection
date: 2026-05-15
duration: "~12 min read"
tags: [splunk, sigma, lolbin, certutil, detection-engineering]
sources:
  - "SigmaHQ rules: https://github.com/SigmaHQ/sigma"
  - "Atomic Red Team: https://github.com/redcanaryco/atomic-red-team"
attack_techniques:
  - T1140
  - T1105
  - T1218.010
disclaimer: home-lab
---

## Hypothesis

Adversaries abuse `certutil.exe` to download payloads from URLs, bypassing
allow-listing because `certutil` is signed by Microsoft. We can detect this
by looking for `certutil` invocations with `-urlcache` flag, which is not a
common admin pattern.

## Telemetry

We need Sysmon Event ID 1 (Process Create) with `Image` and `CommandLine`
fields. Splunk index `windows`, sourcetype `XmlWinEventLog:Microsoft-
Windows-Sysmon/Operational`.

## Sigma Rule

<CodeBlock>
```yaml title="lolbin_certutil.yml" {3,5}
title: certutil download with urlcache
id: 5a8a3e2f-...
detection:
  selection:
    Image|endswith: '\certutil.exe'
    CommandLine|contains: '-urlcache'
  condition: selection
```
</CodeBlock>

## Splunk Test

<ScreenshotFrame
  n={1}
  src="lolbin-sigma-detection/01-splunk-dashboard.png"
  alt="Splunk dashboard with three rule-match events highlighted in the Search & Reporting view"
  caption="Splunk dashboard showing the rule-match against synthetic events"
/>

## False Positives

(rest of body)

## Lessons

(rest of body)
```

Note: `<ProvenanceFooter />` is auto-mounted by `<WriteupView>` (see Pattern 10c) — author does NOT include it.

### Example 2: ThreeDShell mounting `<FocusController>` and Canvas with `onPointerMissed`

```tsx
// src/shells/ThreeDShell.tsx (Phase 3 modification — add FocusController + onPointerMissed)
//
// Source: Phase 2 ThreeDShell.tsx structure preserved; Phase 3 additions inline.
import { Canvas } from '@react-three/fiber';
import { useRef, useState } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Header } from '../ui/Header';
import { Workstation } from '../scene/Workstation';
import { Lighting } from '../scene/Lighting';
import { Controls } from '../scene/Controls';
import { FocusController } from '../scene/FocusController';
import { setQueryParams } from '../lib/useQueryParams';
import type { CameraMode } from '../ui/CameraToggle';

interface ThreeDShellProps {
  onContextLost: () => void;
}

export default function ThreeDShell({ onContextLost }: ThreeDShellProps) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <Header
        currentView="3d"
        showCameraToggle
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
      />
      <main className="flex-1 min-h-0 relative">
        <Canvas
          camera={{ position: [2.4, 1.4, 2.4], fov: 50, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              onContextLost();
            });
            gl.domElement.setAttribute(
              'aria-label',
              'Interactive 3D workstation scene. Three monitors render projects, identity, and write-ups. Drag to look around. Click a monitor to focus, press Escape to return.',
            );
            gl.domElement.style.touchAction = 'pan-y';
          }}
          onPointerMissed={() => {
            // UI-SPEC § Defocus triggers (D-10 #2): outside-click defocus.
            // The FocusController also reads ?focus= from URL, so clearing
            // it here triggers the defocus animation via URL → state sync.
            setQueryParams({ focus: null });
          }}
        >
          <Lighting />
          <Workstation />
          <Controls cameraMode={cameraMode} ref={controlsRef} />
          <FocusController controlsRef={controlsRef} />
        </Canvas>
      </main>
      <Footer />
    </>
  );
}
```

Note: `<Controls>` needs a minor Phase 3 modification to forwardRef:

```tsx
// src/scene/Controls.tsx — Phase 3 modification: forwardRef
import { forwardRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
// ... existing
export const Controls = forwardRef<OrbitControlsImpl, ControlsProps>(({ cameraMode }, ref) => {
  // ... existing
  return <OrbitControls ref={ref} /* ... */ />;
});
```

### Example 3: Workstation mounting MonitorOverlay with content per D-01

```tsx
// src/scene/Workstation.tsx (Phase 3 modification — add monitor children)
import { Floor } from './Floor';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Lamp } from './Lamp';
import { Bookshelf } from './Bookshelf';
import { MonitorOverlay } from './MonitorOverlay';
import { Projects } from '../sections/Projects';
import { CenterMonitorContent } from '../ui/CenterMonitorContent';
import { WriteupsMonitor } from '../ui/WriteupsMonitor';

export function Workstation() {
  return (
    <>
      <Floor />
      <Desk />
      <Monitor position={[-0.45, 0.95, -0.05]} rotation={[0, 0.18, 0]} monitorId="left">
        <MonitorOverlay ariaLabel="Left monitor: projects">
          <Projects />
        </MonitorOverlay>
      </Monitor>
      <Monitor position={[0, 0.95, -0.05]} rotation={[0, 0, 0]} monitorId="center">
        <MonitorOverlay ariaLabel="Center monitor: identity, about, and skills">
          <CenterMonitorContent />
        </MonitorOverlay>
      </Monitor>
      <Monitor position={[0.45, 0.95, -0.05]} rotation={[0, -0.18, 0]} monitorId="right">
        <MonitorOverlay ariaLabel="Right monitor: write-ups">
          <WriteupsMonitor />
        </MonitorOverlay>
      </Monitor>
      <Lamp position={[-0.5, 0.78, 0]} />
      <Bookshelf />
    </>
  );
}
```

Note: the `focused` + `onFocusToggle` props are wired through context or zustand (planner's call); for simplicity above, omitted — but `<Monitor>` Pattern 5 example shows them.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | drei `<Html transform>` correctly forwards wheel events to the inner `overflow-y-auto` div without propagating to OrbitControls when controls are disabled | Pitfall 5; Pattern 3 | If wheel events DO propagate even with `controls.enabled = false`, the focused monitor's scroll might still trigger a phantom zoom (no-op when controls disabled, but visually weird). Mitigation: `onWheel={(e) => e.stopPropagation()}` on inner div as a safety belt. |
| A2 | GSAP core 3.15 minified+gzipped is ~33 KB (cited from bundlephobia historical data, MEDIUM confidence) | Pattern 7 bundle math | If GSAP is larger (e.g., 50+ KB), the 3D chunk lands closer to 320 KB gz — still well under 450 KB, no real risk. |
| A3 | `@mdx-js/react` `<MDXProvider>` works with `providerImportSource: '@mdx-js/react'` in `@mdx-js/rollup@3.1.x` configuration | Pattern 1 + Pattern 8 | If the option is renamed or deprecated in 3.1.1 (last verified docs are general MDX 3 docs), the components map injection won't work. Mitigation: verify with `npm install` + a hello-world MDX render in Plan 03-01. Fallback: pass components as props to each MDX render explicitly. |
| A4 | `import.meta.glob` with `eager: true` correctly exposes `mod.frontmatter` named export when `remark-mdx-frontmatter` is configured with `name: 'frontmatter'` | Pattern 9 | If the glob result types break (Vite's TS inference), the planner needs a manual cast. Practical impact: minor code adjustment. |
| A5 | rehype-pretty-code v0.14.x emits `<figure data-rehype-pretty-code-figure>` wrapping `<figcaption>` + `<pre>` for fenced code blocks with `title="..."` meta | Pattern 2 + Pattern 10a | If the wrapper structure differs (e.g., new versions emit different attributes), the `<CodeBlock>` figure-based override won't extract the filename. Mitigation: render an MDX hello-world in Plan 03-01 + inspect the rendered HTML in DevTools; adjust the `<CodeBlock>` walker accordingly. |
| A6 | The `distanceFactor` value `1.8` will produce a 600×400 px DOM that exactly fills the 0.55×0.32 m screen plane at default camera distance ~3.45 m with FOV 50° | Pattern 12 | The math is approximate; planner must tune empirically. Risk: undertune → text unreadable; overtune → DOM bleeds past bezel. Mitigation: planner verifies in dev mode at both default orbit pose AND focused-monitor pose (Pattern 12 verification recipe). |
| A7 | The 3D chunk size after Phase 3 will be ~285 KB gz (Phase 2 baseline 236.7 KB + GSAP ~33 KB + MDX runtime ~3 KB + Phase 3 components ~10 KB) | Pattern 7 | If actual size exceeds 450 KB, Plan 03-XX needs to lazy-load MDX modules within the 3D chunk via dynamic import inside `<WriteupView>`. Mitigation: `npm run size` after every Phase 3 plan slice merge. |
| A8 | All 3 D-17 write-up subjects can be authored within a 3-5 hour collaborative window per D-18 | D-18 (UI-SPEC) | Authoring takes longer than expected; Phase 3 slips. Mitigation: planner ships the MDX pipeline + 1 write-up first; the other 2 are separate plan slices that can defer to Phase 4 if Phase 3 budget is exhausted. |

**Risk summary:** A1, A6, A7 are empirical and verified in dev. A3, A4, A5 are integration-detail risks mitigated by an early MDX hello-world render in Plan 03-01 (the integration plan slice). A8 is a scheduling risk addressed by sliceable plan structure.

---

## Open Questions

1. **Should `<FocusController>` use zustand or React state?**
   - What we know: UI-SPEC § Single source of truth says zustand is "planner's call"; App-level state suffices for cross-shell-state (e.g., context-loss).
   - What's unclear: by Phase 3, the focus state has 4 consumers (FocusController, MonitorOverlay's re-click handler, header `[bracket]` click handler, WriteupsMonitor). Prop-drilling through all four is awkward.
   - Recommendation: **start with React context within `<ThreeDShell>`** (the `focused` state lives there, passed via context to descendants). Only escalate to zustand if Plan 03-XX surfaces actual prop-drilling pain. Rationale: one fewer dep; matches Phase 1+2 pattern.

2. **Should `<MonitorOverlay>` add a safety-belt `onWheel={e.stopPropagation()}`?**
   - What we know: A1 says wheel events should be fine when OrbitControls is disabled.
   - What's unclear: dev verification on Linux + macOS + iPadOS Safari hasn't happened yet.
   - Recommendation: **add it defensively.** Cheap insurance; UI-SPEC § Touch / pointer behaviour locks `onPointerDown={e.stopPropagation()}` already; one more line is consistent.

3. **Should the parity audit script also enforce the `<MonitorOverlay>` opaque-bg invariant?**
   - What we know: UI-SPEC § Color "NOT permitted" forbids `bg-transparent` on `<MonitorOverlay>` inner div; emissive bleed-through anti-use.
   - What's unclear: whether to grep for it in `scripts/check-parity.mjs`.
   - Recommendation: **add a grep** — `grep -F "bg-transparent" src/scene/MonitorOverlay.tsx` must exit non-zero. One more 3-line assertion.

4. **What's the single point of truth for the `?focus=writeups/<slug>` slug parsing?**
   - What we know: UI-SPEC § WriteupsMonitor has `focus?.startsWith('writeups/') ? focus.slice('writeups/'.length) : null`.
   - What's unclear: whether to centralise this parsing into `src/lib/useQueryParams.ts` (extending its shape to expose a typed `{ view, focus, slug }`) or leave it ad-hoc per consumer.
   - Recommendation: **leave ad-hoc per consumer for Phase 3.** The parsing is 1 line; centralising it adds API surface for one consumer (`<WriteupsMonitor>`). Revisit if Phase 4 surfaces more consumers.

5. **Should the right monitor `<WriteupView>` include a hash-fragment scroll-restoration when navigating back via Esc?**
   - What we know: UI-SPEC § WriteupView Esc/back returns to default orbit. The DOM unmounts the in-monitor write-up.
   - What's unclear: should the user's scroll position inside the write-up be preserved if they re-focus the right monitor?
   - Recommendation: **NO scroll restoration in Phase 3.** Adds JS state surface; UI-SPEC doesn't lock it; recruiters who Esc'd out of a write-up probably want a fresh entry. Defer to v2 if user testing surfaces pain.

---

## Sources

### Primary (HIGH confidence)

- `[CITED: mdxjs.com/docs/getting-started/]` — "If you also use `@vitejs/plugin-react`, you must force `@mdx-js/rollup` to run in the `pre` phase before it" + the `{enforce: 'pre', ...mdx({...})}` Vite recipe verbatim.
- `[CITED: mdxjs.com/packages/rollup/]` — `@mdx-js/rollup` plugin API; `providerImportSource` option for `<MDXProvider>` integration; `remarkPlugins` and `rehypePlugins` arrays.
- `[CITED: github.com/remcohaszing/remark-mdx-frontmatter README]` — pairs with `remark-frontmatter`; `name: 'frontmatter'` config produces `export const frontmatter = {...}` named export.
- `[CITED: rehype-pretty.pages.dev]` — `theme: 'github-dark'`, `keepBackground`, `defaultLang` config; line-highlight syntax `{1,3-5}`; output HTML structure with `data-language`, `data-theme`, `data-line`, `data-highlighted-line` attributes; `figure[data-rehype-pretty-code-figure]` + `figcaption[data-rehype-pretty-code-title]` filename wrapper.
- `[CITED: drei.docs.pmnd.rs/misc/html]` — full `<Html>` API: `transform`, `occlude="blending"`, `distanceFactor`, `position`, `style`, `wrapperClass`; transform-mode blur caveat + scale-up/down mitigation.
- `[VERIFIED: github.com/pmndrs/drei → src/web/Html.tsx]` — `occlude === 'blending'` sets canvas z-index to half max range; `distanceFactor` multiplies `objectScale(group, camera)`; no explicit wheel-event handling (relies on browser default).
- `[CITED: gsap.com/resources/React]` — `useGSAP()` hook signature, `dependencies`, `scope`, `revertOnUpdate`, automatic `gsap.context()` cleanup; `contextSafe` wrapper for event handlers; verbatim code examples.
- `[CITED: r3f.docs.pmnd.rs/api/events]` — `onPointerMissed` on `<Canvas>` for click-outside; `event.stopPropagation()`; intersection data shape.
- `[CITED: vite.dev/guide/features#glob-import]` — `import.meta.glob('./pattern/*.mdx', { eager: true })` syntax; `import: 'default'` option; build-time expansion to static map.
- `[VERIFIED: npm view <package>@latest version, 2026-05-08]` — all 9 dep versions confirmed live against npm registry.

### Secondary (MEDIUM confidence)

- `[CITED: CLAUDE.md verified-version table]` — full Phase 3 dep version pinning + the "What NOT to Use" table.
- `[CITED: bundlephobia historical data]` — GSAP core gz size ~33 KB (used for Pattern 7 bundle math).
- Phase 1 + 2 RESEARCH.md — patterns reused: useSyncExternalStore for query-param routing; Canvas onCreated wiring; OrbitControls clamps; lazy-import contract verification via grep.
- Phase 1 + 2 codebase reads — verified file structure, existing component contracts, vite.config.ts shape, package.json deps.

### Tertiary (LOW confidence)

- The exact `distanceFactor` value (1.8) — empirical estimate, planner verifies in dev.
- Phase 3 3D-chunk size projection (~285 KB gz) — extrapolation from Phase 2 measurement + library size estimates; verified via `npm run size` after each plan slice.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version pin verified against npm registry 2026-05-08; integration patterns cited from official docs.
- Architecture: HIGH — Phase 1+2 patterns inherited verbatim; Phase 3 additions slot into established structure.
- MDX pipeline integration: HIGH — official MDX 3 docs + remark-mdx-frontmatter README cited verbatim; Pattern 1 is the canonical recipe.
- GSAP integration: HIGH on hook usage (`useGSAP` from `@gsap/react`); MEDIUM on R3F-specific camera animation idioms (no canonical example in GSAP docs for R3F — Pattern 4 is synthesised from GSAP timeline docs + R3F's `useThree` hook docs).
- drei `<Html transform>` integration: HIGH on prop semantics; MEDIUM on `distanceFactor` calibration (empirical, no canonical formula).
- Bundle size projections: MEDIUM — extrapolation from Phase 2 baseline + library gz estimates; verified with `npm run size` post-Plan 03-XX.
- TXT-06 parity audit: HIGH — `scripts/check-parity.mjs` is hand-rolled but the implementation strategy (regex-extract sections, hand-maintained mount mapping) is conservative.
- Pitfalls: HIGH — most pitfalls are direct extensions of Phase 1+2's already-encountered classes (Pitfall 1 MDX plugin order is documented; Pitfall 2 GSAP Strict Mode is documented).

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (30 days for stable stack — versions checked) or until any pinned dep ships a major release that changes the integration contract (MDX 4, R3F v10, drei 11, GSAP 4 — none expected within 30 days based on current release cadence).
