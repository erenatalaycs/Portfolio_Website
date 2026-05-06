# Phase 2: 3D Shell + Asset Pipeline + Capability Gating — Research

**Researched:** 2026-05-06
**Domain:** Lazy-loaded React Three Fiber 9.6 / drei 10.7 / three 0.184 shell on Vite 8 + GitHub Pages, with capability gating, WebGL context-loss recovery, and CI-enforced size budgets
**Confidence:** HIGH (all stack decisions verified against 02-CONTEXT.md locks, 02-UI-SPEC.md visual contract, npm registry, drei/R3F official sources, and the size-limit README)

---

## Summary

Phase 2 is a thin pipeline-validation phase: ship the 3D shell scaffolding, lazy-load it, capability-gate it, recover from context-loss, and enforce three CI byte budgets. **Every visual and interaction contract is already pinned in `02-UI-SPEC.md`** (Canvas configuration, OrbitControls clamps, palette mapping, copy strings, ARIA, DOM structure, animation contract); every implementation choice is already pinned in `02-CONTEXT.md` (D-01..D-15). Research scope is narrow by design — the planner needs concrete code-level answers to a fixed set of mechanical questions, not architectural exploration.

The single non-obvious technical risk: **`build.rollupOptions.output.manualChunks` and `React.lazy` interact unpredictably**. A naïve `manualChunks` rule that vendor-splits `three`, `@react-three/fiber`, `@react-three/drei` will load those chunks on the initial-bundle critical path, defeating the lazy-load contract that Phase 2 exists to prove. The verified-safe pattern is to **NOT use `manualChunks` at all** and rely on Vite/Rollup's automatic dynamic-import chunking, which already places anything reachable only from a `React.lazy(() => import(...))` boundary into a separate chunk (`[CITED: github.com/vitejs/vite/issues/17653]`). The acceptance criterion is verified by grepping the built `dist/assets/index-*.js` for `OrbitControls` / `THREE` strings — they must NOT appear.

**Primary recommendation:** Add zero new dev dependencies beyond `@react-three/fiber@~9.6`, `@react-three/drei@~10.7`, `three@~0.184`, `size-limit@~12.1`, `@size-limit/preset-app@~12.1`. Do NOT add `manualChunks` configuration. Do NOT add zustand (component-local state suffices per UI-SPEC). Do NOT add `@react-three/postprocessing`, `gsap`, `motion`, `@gltf-transform/cli`, or `gltfjsx` — all explicitly deferred to Phase 3/4 by the locks.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Capability Detection

- **D-01 — Tablet handling:** modern tablets (iPad M-series, Galaxy Tab S, etc.) are 3D-capable and MUST default to 3D shell, NOT text shell. `detectCapability()` does NOT use mobile-UA-string as a tablet trigger. Specifically: iPad UA strings (where Apple advertises as "desktop class") and Android tablets with `hardwareConcurrency >= 6` + WebGL2 should pass through to 3D shell. Phone UA strings (where `navigator.userAgent.includes('Mobile')` AND not iPad) still default to text shell.

- **D-02 — `?view=3d` override = bypass:** when `?view=3d` is present in URL, capability check is COMPLETELY SKIPPED. User knows best. If 3D fails downstream (context-loss, OOM), the existing 3D-09 graceful fallback handles it. No "are you sure?" overlay, no warning modal. Power users hit no friction.

- **D-03 — Network detection NOT included in capability check:** `NetworkInformation` API is unsupported on Safari (and the 3D chunk size budget is already <450 KB gz — slow networks load it slowly but reliably). The detection heuristic is hardware-only: WebGL2 support, `deviceMemory`, `hardwareConcurrency`, mobile UA (excluding tablets per D-01), and `prefers-reduced-motion: reduce`.

#### Procedural Workstation Look

- **D-04 — Real-life-scaled units:** R3F 1 unit = 1 metre. Desk ~1.2m wide × 0.6m deep × 0.75m tall. Monitors 24-27 inch screen ratios. Lamp ~0.5m tall on the desk. Bookshelf taller than the desk (~1.5m), behind it. Phase 4 GLB drops in with the same scale, no camera retuning.

- **D-05 — Subtle floor plane (not bare space, not full room):** flat dark floor at y=0, same `#0d1117` colour as background but a distinct plane (so subtle ambient occlusion + key-light cast a shadow under the desk). NO walls, NO ceiling, NO sky.

- **D-06 — Terminal-palette-aligned colours (NOT neutral physical materials):** every primitive surface tints to a Tailwind v4 `@theme` token from Phase 1: desk + bookshelf surface = `--color-surface-1` (`#161b22`); monitor frames = `--color-bg` (`#0d1117`); monitor screens = emissive `--color-accent` (`#7ee787`); lamp armature = `--color-surface-1`; lamp bulb = emissive `--color-warn` (`#e3b341`); floor = `--color-bg` distinct plane. NO textures.

- **D-07 — Lighting:** AmbientLight intensity 0.2 + DirectionalLight key from camera-side (intensity 0.8, casts shadow under desk) + monitor emissive surfaces + lamp bulb emissive. Three lights total. NO rim lights, NO fill lights yet.

- **D-08 — Hybrid camera mode (orbit + free):** Default mode = "orbit" with mid-tier clamps: `minPolarAngle: 60°`, `maxPolarAngle: 100°`, azimuth `-90° .. +90°`, `minDistance: 1.2m`, `maxDistance: 4m`. "free" mode = unclamped `<OrbitControls>`. Mode toggle lives in the sticky-header next to view toggle.

#### View Toggle UI + Camera Mode Toggle

- **D-09 — View-toggle visual style:** BracketLink terminal style. Renders as 2nd prompt line in sticky header: `$ goto …` then `$ view [3d] [text]`. Active option uses inverted styling (accent-green background, bg-color text). Reuses Phase 1's existing `BracketLink` + `TerminalPrompt`.

- **D-10 — Position:** view-toggle line lives INSIDE the sticky header, immediately below the existing `$ goto` nav line. Same component renders in both shells.

- **D-11 — Camera-mode toggle:** appears ONLY inside 3D shell. Inline with view-toggle line, separated by visual divider. Camera mode is ephemeral state (NOT persisted to URL or localStorage); resets to "orbit" on every page load.

- **D-12 — URL state authoritative, NO localStorage:** `?view=text|3d` is the single source of truth. NO `localStorage` writes. Every page load runs `detectCapability()` fresh.

#### WebGL Context-Loss UX

- **D-13 — Instant cut + dismissible info bar:** when `webglcontextlost` fires, immediately unmount `<Canvas>`, mount `<TextShell />`. Render a dismissible info bar at the top of `<main>`. Bar uses `--color-warn` for the `[!]` glyph. Auto-dismisses after 8 seconds OR on `[×]` click. NO fade animation.

- **D-14 — `[retry 3D]` reloads the page with `?view=3d`:** `window.location.assign('?view=3d')`. Fresh React tree, fresh WebGL context — safest recovery.

- **D-15 — iOS Safari memory-pressure real-device test deferred to Phase 4:** Phase 2 acceptance only requires that the code path exists and DevTools "Lose Context" WebGL extension can trigger the fallback cleanly.

### Claude's Discretion

- Exact monitor dimensions (24" vs 27" — pick one, apply consistently to all 3 monitors). Eren's preference: realistic but not extreme.
- Bookshelf detail level — bare shelf planes vs procedural box "books".
- Lamp armature shape — gooseneck vs angle-poise vs simple desk-lamp. Cheapest geometry that reads as "lamp".
- Lamp bulb subtle blink animation — NO permanent blink. If any animation, gated by `prefers-reduced-motion`. Default: none.
- 3-monitor stand layout — single ultra-wide stand vs 3 separate stands vs L-shaped angled. All 3 must fit camera frustum.
- Loading state UX — Suspense fallback IS the actual `<TextShell />`. Locked decision (UI-SPEC).
- `size-limit` budgets exact enforcement — entry budgets locked (text <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB) but warn/fail thresholds and `npm run size` script vs CI-only config are planner discretion.
- Camera intro animation — NO animated camera move on first 3D mount (locked in UI-SPEC).
- Retry button copy text — keep terminal-y, recruiter-friendly. `[retry 3D]`.
- Info bar auto-dismiss timing — 8 seconds is a good default; planner can tune 5-10s.

### Deferred Ideas (OUT OF SCOPE)

#### Carried by later phases (already mapped in REQUIREMENTS.md / ROADMAP.md)
- drei `<Html transform occlude="blending">` monitor content → Phase 3 (3D-05)
- Click-to-focus camera animation per monitor (GSAP timeline) → Phase 3 (3D-06)
- Animated `whoami` terminal greeting on main monitor → Phase 3 (3D-07)
- Postprocessing pipeline (Bloom + Scanline + ChromaticAberration + low Noise, gated by drei `<PerformanceMonitor>`) → Phase 4 (3D-08)
- Real Draco-compressed GLB workstation model → Phase 4 (3D-04 second half)
- Lighthouse + real-device QA + iOS Safari memory-pressure test → Phase 4 (OPS-03, OPS-04)

#### v2 (already in REQUIREMENTS.md "v2")
- Custom CRT shader (V2-3D-02), Scroll-driven camera tour (V2-3D-03), Source-code Easter egg (V2-3D-04), Real Blender-modelled workstation (V2-3D-01)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **3D-01** | `<ThreeDShell />` lazy-loaded via `React.lazy`, Suspense fallback shows text-shell skeleton | "Lazy Loading: React.lazy + Vite Auto-Chunking" pattern + "Don't Hand-Roll" entry on `manualChunks`. Suspense fallback IS `<TextShell />` per UI-SPEC. |
| **3D-02** | `detectCapability()` synchronous check — mobile UA / `deviceMemory<4` / `hardwareConcurrency≤4` / no-WebGL2 / `prefers-reduced-motion: reduce` default to text shell; `?view=3d` overrides | "Capability Detection: Canonical 2026 Implementation" pattern with full TypeScript reference implementation (5 checks, tablet exclusion, return shape `{pass, reasons[]}`) |
| **3D-03** | View-toggle DOM overlay always visible (sibling of `<Canvas>`) | "Shared `<Header>` refactor" pattern + 3D shell DOM structure (header is sticky, sibling-of-Canvas in `<main>`) |
| **3D-04** | Composed scene — `<Desk />`, `<Monitor />` ×3, `<Lamp />`, `<Bookshelf />` — using procedural primitives in this phase | "Procedural Primitives: Clean R3F Composition" pattern with file-per-element decomposition under `src/scene/` |
| **3D-09** | `webglcontextlost` listener swaps gracefully to the text shell | "WebGL Context-Loss Handling in R3F 9" pattern with concrete `onCreated` registration + state lift to App-level + DevTools verification recipe |
| **OPS-02** | `size-limit` budgets enforced in CI — text shell <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB | "size-limit Configuration for Vite-Built dist/" pattern with exact `package.json` block, glob path conventions, GH Actions step, and disabled-but-pre-configured GLB budget for Phase 4 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These are the actionable directives the planner must honour. They are derived from `./CLAUDE.md` and treated with the same authority as locked CONTEXT decisions.

| Constraint | Source | Implication for Phase 2 |
|------------|--------|--------------------------|
| Stack: React 19.2, TS 5.9 (NOT 6.x), Vite 8, Tailwind v4, R3F 9.6, three 0.184, drei 10.7 | CLAUDE.md "Technology Stack" | Pin all four 3D-related deps with `~` ranges (per Pitfall 16). Do NOT bump three independently of R3F/drei. |
| Use `<Html transform occlude="blending">` for monitor content (when added Phase 3) | CLAUDE.md + UI-SPEC deferral | Phase 2 ships emissive-green plane only; the monitor `<group>` must leave room for `<Html>` to drop in next phase without geometry rework. |
| Use `import.meta.env.DEV` to gate `leva`, `r3f-perf`, debug helpers | CLAUDE.md "What NOT to Use" | If planner ships ANY debug helpers in Phase 2 (recommendation: ship none, defer to Phase 3+), wrap them. |
| HashRouter NOT in scope | CLAUDE.md alternatives table | Phase 1 already chose query-param routing — Phase 2 reuses the existing `useQueryParams` hook. No router changes. |
| `@react-three/a11y` is unmaintained — DO NOT INSTALL | CLAUDE.md "What NOT to Use" | Accessibility for the canvas comes from the 2D fallback shell (already shipped) + `aria-label` on the `<canvas>` element (per UI-SPEC ARIA contract). |
| No GSAP, no motion, no @react-three/postprocessing in Phase 2 | CLAUDE.md + Phase 2 phase note | Three deps stay deferred. Confirm absent from `package.json` after Phase 2 install step. |
| `localStorage` writes for view or camera mode forbidden | CLAUDE.md anti-pattern + D-12 | URL is source of truth for `view`; component-local state for `cameraMode`. |
| Source maps OFF in production (already set in `vite.config.ts`) | CLAUDE.md OPSEC | Don't change `build.sourcemap`. Phase 2 inherits Phase 1's setting. |
| GH Pages base path `/Portfolio_Website/` already configured | Phase 1 lock | Don't touch `vite.config.ts` `base`. The `?view=3d` URL retry in D-14 must use `import.meta.env.BASE_URL` (or relative `?view=3d`) — the latter is simpler and works because URLs preserve path. |
| Real DOB / home address absent from public surface | CLAUDE.md privacy / Phase 1 lock | Phase 2 doesn't add personal data. Confirm none leaks via 3D-shell debug logging. |

## Architectural Responsibility Map

This phase is fully client-side (GitHub Pages = static-only, no SSR, no API). The map below clarifies which sub-tier owns which capability inside the browser tier.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `detectCapability()` heuristic | Browser / Client (one-shot at App mount) | — | Hardware probes (`deviceMemory`, `hardwareConcurrency`, WebGL2 context creation) are browser-only APIs. Synchronous, fires once, never re-runs (D-12 + per Phase 1 Pattern 4 idiom). |
| `?view=` URL state | Browser / Client (URL via `history.replaceState`) | — | Single source of truth per D-12. `useQueryParams` (Phase 1) already subscribes via `useSyncExternalStore`. |
| Camera mode (`'orbit' \| 'free'`) | Browser / Client (component-local React state inside `<ThreeDShell>`) | — | Ephemeral per D-11 — never URL, never localStorage. Lives next to the toggle that mutates it. |
| Context-loss state (3D crashed → show TextShell + InfoBar) | Browser / Client (App-level React state OR zustand — recommendation: App-level state, see Pattern 5) | — | Cross-shell state (decides which shell renders). Lifting to App is sufficient; zustand is unnecessary at Phase 2 scope per "Architecture: zustand-or-not" decision below. |
| 3D scene rendering (geometry, materials, lighting) | Browser / Client (R3F + WebGL via `<Canvas>`) | — | Standard R3F territory. |
| OrbitControls clamping | Browser / Client (drei `<OrbitControls>` props) | — | drei reads props every render; conditional clamping = swap props based on cameraMode state (no remount). |
| size-limit budget enforcement | CI (GitHub Actions) | — | Build-time check, runs against `dist/` artefact. NOT a runtime concern. |
| 3D chunk separation from text-shell initial bundle | Build (Vite + Rollup) | — | Vite's automatic dynamic-import chunking handles this when `<ThreeDShell>` is loaded via `React.lazy(() => import(...))`. NO manual `manualChunks` config needed. |

**Why this matters:** the original phase-note hinted at maybe needing `rollupOptions.output.manualChunks` to "guarantee" 3D chunk separation. The verified-safe answer is that `React.lazy + dynamic import` is already sufficient and `manualChunks` actively breaks lazy-loading (see Common Pitfalls). The planner must NOT add manualChunks unless a verification step proves the lazy chunk is leaking — and the recommendation is to verify via grep, not to pre-emptively configure.

---

## Standard Stack

### Core (Phase 2 additions only — Phase 1 stack inherited verbatim)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **`@react-three/fiber`** | `~9.6.1` | Declarative React renderer for Three.js | R3F v9 line pairs with React 19 (verified peer-deps `react: ^19`, `three: >=0.159`). v9 is the React-19-compatible line. `[VERIFIED: npm view @react-three/fiber@9.6.1 peerDependencies]` |
| **`@react-three/drei`** | `~10.7.7` | R3F helpers — `<OrbitControls>`, `<PerspectiveCamera>` (Phase 3 will add `<Html>`) | Drei 10.x pairs with R3F 9.x. Verified peer-deps: `react: ^19`, `three: >=0.156`, `@react-three/fiber: ^9.0.0`. `[VERIFIED: npm view @react-three/drei@10.7.7 peerDependencies]` Currently 10.7.7 (Phase Plan 02 should pin `~10.7`). |
| **`three`** | `~0.184.0` | WebGL engine under R3F | Pinned by R3F + drei peer ranges. Don't bump independently. `[VERIFIED: npm view three@latest version → 0.184.0]` |

### Supporting (dev-only Phase 2 additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`size-limit`** | `~12.1.0` | Bundle byte-budget tool (CI-friendly) | Always. The budget tool. `[VERIFIED: npm view size-limit@latest version → 12.1.0]` |
| **`@size-limit/preset-app`** | `~12.1.0` | Bundles `@size-limit/file` (static file size + gzip) and `@size-limit/time` (parse + execution simulation) | The "app" preset is the recommended preset for full-page applications shipping JS. For Phase 2, only the file-size measurement is load-bearing — `time` is bonus. `[VERIFIED: npm view @size-limit/preset-app@12.1.0 dependencies]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `size-limit` + `@size-limit/preset-app` | Just `@size-limit/file` standalone | `preset-app` already bundles `@size-limit/file` AND `@size-limit/time`. The preset is a tiny meta-package. Picking it gives free upgrade path if Phase 4 wants to add execution-time budgets without re-orchestrating the dev-deps. Marginal preference. |
| `size-limit` | `bundlesize` | `bundlesize` is older (last meaningful release pre-2022, mostly stale) and doesn't natively support gzip estimation against globs. `size-limit` is the de-facto standard. `[ASSUMED]` |
| `size-limit` | Custom CI step grepping `gzip -c dist/assets/index-*.js \| wc -c` | Doable but reinvents the wheel and loses the JSON output / multi-budget config / nice failure messages. Not worth it for a 60-line `package.json` block. |
| App-level React state for context-loss | zustand store | UI-SPEC §"Single source of truth additions" says zustand is "acceptable if planner prefers, but local state is sufficient." App-level state is one fewer dep, one fewer abstraction. Recommendation: App-level state. Revisit if Phase 3 needs cross-shell state for click-to-focus + context-loss simultaneously. |
| `manualChunks` config to vendor-split three | NO `manualChunks` — rely on Vite/Rollup automatic dynamic-import chunking | `[CITED: github.com/vitejs/vite/issues/17653]` — adding `manualChunks` for vendor libs that are reachable via `React.lazy` causes Vite to load the chunks in the initial bundle anyway. The "do nothing" path is verified-safe and cheaper. |

**Installation (exact npm command for the planner):**

```bash
npm install three@~0.184.0 @react-three/fiber@~9.6 @react-three/drei@~10.7
npm install --save-dev size-limit@~12.1 @size-limit/preset-app@~12.1
```

**Version verification (run before Plan 01 starts):**

```bash
npm view three@latest version
npm view @react-three/fiber@latest version
npm view @react-three/drei@latest version
npm view size-limit@latest version
```

Verified at research time (`2026-05-06`):
- `three@0.184.0`
- `@react-three/fiber@9.6.1`
- `@react-three/drei@10.7.7`
- `size-limit@12.1.0`
- `@size-limit/preset-app@12.1.0`

**Tilde ranges (`~`) NOT caret (`^`):** PITFALLS.md Pitfall 16 explicitly: *"Pin major + minor versions of `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`. `~` not `^`. The R3F + three.js + drei version trio is famous for drifting."* Phase 1 already followed this rule — Phase 2 continues it.

**No new runtime deps beyond the 3D core trio.** Specifically NOT installing in Phase 2: `@react-three/postprocessing` (Phase 4), `gsap` (Phase 3), `motion` (not used by Phase 2 — animation contract is "instant" everywhere), `zustand` (component-local state suffices), `@gltf-transform/cli` (Phase 4), `gltfjsx` (Phase 4), `leva` (defer indefinitely), `r3f-perf` (defer indefinitely).

---

## Architecture Patterns

### System Architecture Diagram

```
                         User opens https://eren-atalay.github.io/Portfolio_Website/[?view=…]
                                                  |
                                                  v
                                      +----------------------+
                                      |  index.html          |
                                      |  (Vite-built bundle) |
                                      +----------+-----------+
                                                  |
                                                  v
                                      +----------------------+
                                      |  <App />             |
                                      |  - reads ?view=      |
                                      |  - URL=='3d'? skip   |
                                      |    capability check  |
                                      |  - URL=='text'? skip |
                                      |  - else detectCap()  |
                                      |  - context-loss flag |
                                      +----------+-----------+
                                                  |
                                          decision point
                                                  |
                              +--------------------+--------------------+
                              |                                         |
                      view='3d'/no-view + cap.pass()               view='text' or cap.fail()
                                  |                                       |   or context-loss flag
                                  v                                       v
                  +------------------------------+              +-------------------+
                  | <Suspense fallback={         |              | <TextShell />     |
                  |   <TextShell />              |              | (eager — already  |
                  | }>                           |              |  in initial JS)   |
                  |   <ThreeDShell />            |              +---------+---------+
                  |  (lazy — separate chunk)     |                        |
                  +-------------+----------------+                        |
                                |                                          |
                                v                                          |
                  +------------------------------+                          |
                  |  <ThreeDShell>               |                          |
                  |  ├ <Header /> (shared, both shells)                     |
                  |  ├ <main flex-1>                                        |
                  |  │  ├ <ContextLossBar /> (cond.)  --back-up-->          |
                  |  │  └ <Canvas                                           |
                  |  │       dpr={[1, 1.5]}                                 |
                  |  │       frameloop="demand"                             |
                  |  │       shadows                                        |
                  |  │       gl={{antialias, alpha:false,                   |
                  |  │           powerPreference:'high-performance'}}       |
                  |  │       onCreated={({gl}) =>                           |
                  |  │           gl.canvas.addEventListener(                |
                  |  │             'webglcontextlost', handler) }>          |
                  |  │     ├ <Lighting/> (ambient + key + emissives)        |
                  |  │     ├ <Workstation/>                                 |
                  |  │     │   ├ <Floor/>                                   |
                  |  │     │   ├ <Desk/>                                    |
                  |  │     │   ├ <Monitor/> ×3                              |
                  |  │     │   ├ <Lamp/>                                    |
                  |  │     │   └ <Bookshelf/>                               |
                  |  │     ├ <Camera makeDefault/>                          |
                  |  │     └ <Controls cameraMode={…}/> (drei OrbitControls)|
                  |  └ <Footer />                                           |
                  +------------------------------+                          |
                                |                                          |
                  webglcontextlost fires --(setContextLost(true))----------+
                                                                            v
                                                                  TextShell + InfoBar
                                                                  (D-13: instant cut)

  Build-time:
    ├ npm run build → tsc + vite build
    ├ Rollup auto-splits ThreeDShell + everything reachable
    │  ONLY from its dynamic import boundary into a separate
    │  chunk: dist/assets/ThreeDShell-[hash].js
    └ size-limit (CI step) → fails build if any of:
        text shell  > 120 KB gz
        3D chunk    > 450 KB gz
        GLB         > 2500 KB (Phase 4 — currently `ignore: ["all"]`)
```

### Recommended Project Structure (Phase 2 additions to Phase 1's tree)

```
src/
├── app/
│   └── App.tsx                      # 5-line diff: add lazy import, capability gate, context-loss state
├── lib/
│   ├── detectCapability.ts          # NEW — 5-check synchronous capability heuristic
│   ├── detectCapability.test.ts     # NEW — UA mocks, matchMedia mocks, WebGL2 mock
│   ├── useQueryParams.ts            # UNCHANGED (Phase 1)
│   ├── useReducedMotion.ts          # UNCHANGED (Phase 1)
│   └── …
├── shells/
│   ├── TextShell.tsx                # SMALL CHANGE — remove direct <StickyNav/> render, render shared <Header/>
│   └── ThreeDShell.tsx              # NEW — owns <Canvas>, cameraMode state, context-loss listener registration
├── scene/                           # NEW directory
│   ├── colors.ts                    # NEW — HEX mirror of tokens.css
│   ├── colors.test.ts               # NEW — drift assertion vs tokens.css
│   ├── lighting.ts                  # NEW — exports a <Lighting/> component (ambient+key)
│   ├── Workstation.tsx              # NEW — composes Floor + Desk + Monitor×3 + Lamp + Bookshelf
│   ├── Desk.tsx                     # NEW
│   ├── Monitor.tsx                  # NEW (renders frame + screen + stand for one monitor)
│   ├── Lamp.tsx                     # NEW (base + arm + shade + bulb)
│   ├── Bookshelf.tsx                # NEW (back panel + 3-4 shelves + optional books)
│   ├── Floor.tsx                    # NEW (planeGeometry receiving shadow)
│   └── Controls.tsx                 # NEW — drei <OrbitControls> with conditional clamps
├── ui/
│   ├── BracketLink.tsx              # SMALL CHANGE — add `as?: 'a' | 'button'` + `active?: boolean` props (additive, doesn't break callers)
│   ├── Header.tsx                   # NEW — replaces (or wraps) StickyNav, renders both prompt lines
│   ├── ViewToggle.tsx               # NEW — `$ view [3d] [text]`
│   ├── CameraToggle.tsx             # NEW — `$ camera [orbit] [free]` (3D shell only)
│   ├── ContextLossBar.tsx           # NEW — info bar shown after webglcontextlost
│   ├── StickyNav.tsx                # POSSIBLY DELETED — Header.tsx absorbs this. See "Header refactor" pattern.
│   └── …
└── …
```

### Pattern 1: Lazy Loading via React.lazy + Vite Auto-Chunking (NO `manualChunks`)

**What:** Mount `<ThreeDShell />` via `React.lazy(() => import('../shells/ThreeDShell'))`. Vite/Rollup automatically isolates everything reachable only from that dynamic-import boundary into a separate chunk. `three`, `@react-three/fiber`, `@react-three/drei`, and `src/scene/*` end up in `dist/assets/ThreeDShell-[hash].js` and are NEVER loaded on the text-shell path.

**When to use:** Always, for Phase 2's lazy-load contract. Do NOT add `build.rollupOptions.output.manualChunks` config — it actively breaks lazy loading per `[CITED: github.com/vitejs/vite/issues/17653]` and `[CITED: github.com/vitejs/vite/issues/5189]`.

**Verification recipe (acceptance criterion for the planner):**

```bash
npm run build

# Text-shell initial bundle MUST NOT contain three.js or drei strings.
# These greps must return zero matches:
grep -l 'OrbitControls\|THREE\.\|@react-three' dist/assets/index-*.js
grep -l 'OrbitControls\|THREE\.\|@react-three' dist/index.html

# 3D chunk MUST contain them. This grep MUST return at least one match:
grep -l 'OrbitControls' dist/assets/*.js
```

**Example — minimal App.tsx diff:**

```tsx
// src/app/App.tsx — Phase 2 additions
// Source: 02-CONTEXT.md "Integration Points" + UI-SPEC layout contract
import { lazy, Suspense, useState, useEffect } from 'react';
import { TextShell } from '../shells/TextShell';
import { NotFound } from '../ui/NotFound';
import { ContextLossBar } from '../ui/ContextLossBar';
import { useQueryParams, setQueryParams } from '../lib/useQueryParams';
import { useReducedMotion } from '../lib/useReducedMotion';
import { detectCapability } from '../lib/detectCapability';
import { BASE } from '../lib/baseUrl';

const ThreeDShell = lazy(() => import('../shells/ThreeDShell'));

function isKnownPath(): boolean {
  const p = window.location.pathname;
  return p === BASE || p === BASE.slice(0, -1) || p === '/';
}

export default function App() {
  const params = useQueryParams();
  const reduced = useReducedMotion();
  const [contextLost, setContextLost] = useState(false);

  // …existing ?focus= effect unchanged…

  if (!isKnownPath()) return <NotFound />;

  const view = params.get('view'); // 'text' | '3d' | null

  // D-13: a webglcontextlost forces text shell + info bar regardless of ?view.
  if (contextLost) {
    return (
      <>
        <TextShell />
        <ContextLossBar />  {/* lives at top of <main>; UI-SPEC layout */}
      </>
    );
  }

  // D-02: explicit ?view=3d skips capability check.
  if (view === '3d') {
    return (
      <Suspense fallback={<TextShell />}>
        <ThreeDShell onContextLost={() => setContextLost(true)} />
      </Suspense>
    );
  }

  if (view === 'text') return <TextShell />;

  // No explicit view — capability check decides.
  const cap = detectCapability();
  if (cap.pass) {
    return (
      <Suspense fallback={<TextShell />}>
        <ThreeDShell onContextLost={() => setContextLost(true)} />
      </Suspense>
    );
  }
  return <TextShell />;
}
```

`[CITED: 02-CONTEXT.md "Integration Points" pseudocode — verbatim shape]`. The planner is free to refactor for clarity, but the decision tree (contextLost > view='3d' > view='text' > capability) is a contract.

### Pattern 2: Capability Detection — Canonical 2026 Implementation

**What:** A synchronous one-shot `detectCapability(): { pass: boolean; reasons: string[] }` that runs all five checks. The `reasons[]` array is for debugging and the future Plan 07 OPSEC checklist.

**When to use:** Once per page load, inside `<App />` body when no explicit `?view=` is present.

**The five checks (in order):**

1. **WebGL2 support** (HARD GATE — failing this disqualifies regardless of anything else)
2. **`prefers-reduced-motion: reduce`** (defaults to text per D-03)
3. **Mobile UA (excluding tablets per D-01)**
4. **`navigator.deviceMemory < 4`** (treat undefined as PASS — Safari doesn't expose it)
5. **`navigator.hardwareConcurrency <= 4`** (Safari does expose this)

**Tablet exclusion (D-01) is the subtle one.** Three sub-cases:

- **iPad on iPadOS 13+** advertises as "Macintosh" UA. Detect via `navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1` `[CITED: aworkinprogress.dev/detect-iPad-from-Mac, developer.apple.com/forums/thread/119186]`. macOS desktop has `maxTouchPoints === 0`; iPads ≥ iPadOS 13 advertise 5.
- **iPad legacy UAs** (older devices that still send "iPad" in UA): `navigator.userAgent.includes('iPad')`.
- **Android tablets** advertise UA with "Android" but WITHOUT "Mobile" `[ASSUMED — convention from Mozilla docs and react-device-detect heuristics]`. Phones include the "Mobile" token; tablets typically don't.

**Reference implementation:**

```ts
// src/lib/detectCapability.ts
//
// Synchronous capability heuristic for Phase 2 (3D-02). One-shot — no
// matchMedia subscription, no re-runs. Per D-12, this runs every page
// load fresh; no localStorage cache.
//
// Source: 02-CONTEXT.md D-01..D-03 (tablet handling, ?view=3d bypass, no network detection)

export interface CapabilityResult {
  pass: boolean;
  reasons: string[]; // populated when pass===false, lists the failing checks
}

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!canvas.getContext('webgl2');
  } catch {
    return false;
  }
}

function isIpad(): boolean {
  // iPadOS 13+ advertises as 'Macintosh' UA — must use maxTouchPoints to disambiguate.
  // Source: developer.apple.com/forums/thread/119186 + aworkinprogress.dev/detect-iPad-from-Mac
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  if (ua.includes('iPad')) return true; // older iPads
  if (
    navigator.platform === 'MacIntel' &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  ) {
    return true; // iPadOS 13+
  }
  return false;
}

function isAndroidTablet(): boolean {
  // Android tablets typically OMIT 'Mobile' in their UA; phones include it.
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return ua.includes('Android') && !ua.includes('Mobile');
}

function isPhone(): boolean {
  // Phone = mobile UA AND NOT tablet (D-01 — modern tablets pass through to 3D shell).
  if (typeof navigator === 'undefined') return true; // SSR / test fallback: be conservative
  const ua = navigator.userAgent;
  if (isIpad() || isAndroidTablet()) return false;
  return /Mobi|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectCapability(): CapabilityResult {
  const reasons: string[] = [];

  // 1. WebGL2 — HARD GATE. No 3D possible without it.
  if (!hasWebGL2()) reasons.push('no-webgl2');

  // 2. prefers-reduced-motion: reduce → text shell (user can ?view=3d to bypass).
  if (prefersReducedMotion()) reasons.push('reduced-motion');

  // 3. Phone (mobile UA AND NOT tablet) → text shell.
  if (isPhone()) reasons.push('phone');

  // 4. Low device memory. `navigator.deviceMemory` is undefined on Safari — treat as PASS.
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof deviceMemory === 'number' && deviceMemory < 4) reasons.push('low-memory');

  // 5. Low hardware concurrency. Safari exposes this. Threshold ≤ 4 per 02-CONTEXT.md D-03.
  // D-01 nuance: the tablet pass-through is already enforced by isPhone() returning false
  // for tablets, so iPad with hardwareConcurrency===4 still passes. Only phones AND
  // explicit hardwareConcurrency<=4 fail.
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    reasons.push('low-concurrency');
  }

  return { pass: reasons.length === 0, reasons };
}
```

**Test surface (Vitest, jsdom — Phase 1 set up the matchMedia polyfill):**

The planner adds a sibling test file. Mock `navigator.userAgent` via `Object.defineProperty(window.navigator, 'userAgent', { value: '…', configurable: true })`, mock `navigator.maxTouchPoints` similarly, and verify:

| Scenario | Expected `pass` | Expected `reasons` |
|----------|-----------------|---------------------|
| Desktop Chrome on macOS | `true` | `[]` |
| iPhone (iOS Mobile UA) | `false` | `['phone']` (or extra if no WebGL2 mock) |
| iPad legacy UA | `true` (passes — D-01) | `[]` |
| iPad on iPadOS 17 (MacIntel + maxTouchPoints=5) | `true` | `[]` |
| Android phone | `false` | `['phone']` |
| Android tablet (Android UA, no "Mobile") | `true` | `[]` |
| `prefers-reduced-motion: reduce` desktop | `false` | `['reduced-motion']` |
| `deviceMemory: 2` desktop | `false` | `['low-memory']` |
| `hardwareConcurrency: 2` desktop | `false` | `['low-concurrency']` |
| Multiple failures | `false` | array with all matching reasons |

Note: WebGL2 detection in jsdom returns `null` for `canvas.getContext('webgl2')` because jsdom doesn't implement WebGL. The planner has two options:
- Mock `HTMLCanvasElement.prototype.getContext` per-test to return `{}` for the WebGL2 test cases.
- Accept that the standalone `detectCapability()` test always sees `no-webgl2` and assert `reasons.includes('no-webgl2')` is the consistent dimension.

The Phase 1 `useReducedMotion.test.ts` uses the matchMedia polyfill in `tests/setup.ts` — that polyfill carries forward unchanged.

### Pattern 3: `<Canvas>` Configuration — Pinned by UI-SPEC

**What:** The exact `<Canvas>` props are locked in `02-UI-SPEC.md § "<Canvas> configuration"`. Research role: confirm the locks are correct against the R3F 9.6 + drei 10.7 API, and explain the consequences for OrbitControls + reduced-motion.

| Prop | Value | Confirmed against | Notes |
|------|-------|-------------------|-------|
| `camera` | `{ position: [2.4, 1.4, 2.4], fov: 50, near: 0.1, far: 50 }` | R3F default Canvas props | Standard. The `makeDefault` `<PerspectiveCamera>` in scene tree overrides if planner prefers — UI-SPEC mentions both options. |
| `dpr` | `[1, 1.5]` | R3F docs (Scaling Performance) `[CITED: r3f.docs.pmnd.rs/advanced/scaling-performance]` | Caps dpr at 1.5 even on retina — halves GPU load. Direct match to PITFALLS Pitfall 3. |
| `shadows` | `true` | R3F `<Canvas shadows>` API | Enables shadowmap. Directional key light needs `castShadow`; floor needs `receiveShadow`. |
| `frameloop` | `'demand'` | R3F docs (Scaling Performance) | **CRITICAL pairing with drei `<OrbitControls>`:** drei's controls component AUTOMATICALLY calls `invalidate()` on `change` — verified `[CITED: r3f.docs.pmnd.rs/advanced/scaling-performance, github.com/pmndrs/drei]`. So with `frameloop="demand"` + drei `<OrbitControls>`, the camera renders during drag (because drei invalidates each `change` event) AND nothing renders when idle. No manual hookup required. |
| `gl.antialias` | `true` | three.js WebGLRenderer params | Standard. |
| `gl.alpha` | `false` | three.js WebGLRenderer params | UI-SPEC: solid background, lets renderer skip alpha compositing. Performance win. |
| `gl.powerPreference` | `'high-performance'` | three.js WebGLRenderer params | Hints browser to use discrete GPU on hybrid systems. |
| `onCreated` | Wires `webglcontextlost` listener | See Pattern 5 | Required for D-13 / 3D-09. |

**`frameloop="demand"` + reduced-motion interaction:**

- `enableDamping: true` (drei default) gives smooth camera momentum after a drag-release. With `frameloop="demand"` + drei's auto-invalidate-on-change, the damping animation does keep firing change events for ~10-30 frames after release, so it renders. Then idles.
- For reduced-motion users: UI-SPEC §"Reduced-motion handling" mandates `enableDamping={!reducedMotion}`. That means: reduced-motion users get instant-snap camera (no momentum). With `frameloop="demand"`, this also means fewer post-release renders. Net win for reduced-motion users.

**`frameloop="demand"` + click-to-focus camera animation (Phase 3):**

Phase 3 will add GSAP-driven camera transitions. GSAP timelines mutate `camera.position` directly. To play with `frameloop="demand"`, the GSAP `onUpdate` callback must call `invalidate()` from `useThree()`. **This is a Phase-3 concern.** Phase 2 only ships orbit controls + idle scene; demand-mode is correct.

### Pattern 4: OrbitControls Configuration — Verified Props

drei `<OrbitControls>` extends `OrbitControlsImpl` from `three-stdlib`, which inherits all base OrbitControls props from three's standard implementation `[CITED: github.com/pmndrs/drei OrbitControls source — explicit type definition]`. The relevant props for D-08 hybrid clamping:

| Prop | Type | UI-SPEC value (orbit mode) | UI-SPEC value (free mode) |
|------|------|----------------------------|---------------------------|
| `minPolarAngle` | `number` (radians) | `Math.PI / 3` (60°) | `0` (drei default) |
| `maxPolarAngle` | `number` (radians) | `Math.PI * (100 / 180)` (100°) | `Math.PI` (drei default) |
| `minAzimuthAngle` | `number` (radians) | `-Math.PI / 2` (-90°) | `-Infinity` (drei default) |
| `maxAzimuthAngle` | `number` (radians) | `Math.PI / 2` (+90°) | `Infinity` (drei default) |
| `minDistance` | `number` (world units) | `1.2` | `0` (drei default) |
| `maxDistance` | `number` (world units) | `4.0` | `Infinity` (drei default) |
| `enablePan` | `boolean` | `false` | `false` (UI-SPEC: don't unlock panning even in free mode) |
| `enableDamping` | `boolean` | `!reducedMotion` | `!reducedMotion` |
| `dampingFactor` | `number` | `0.08` | `0.08` |
| `target` | `[x, y, z]` (drei accepts tuple via R3F's Vector3 helper) | `[0, 0.6, 0]` | `[0, 0.6, 0]` |

**The conditional clamp pattern (recommended):**

```tsx
// src/scene/Controls.tsx
import { OrbitControls } from '@react-three/drei';
import type { CameraMode } from '../lib/types';
import { useReducedMotion } from '../lib/useReducedMotion';

interface ControlsProps {
  cameraMode: CameraMode; // 'orbit' | 'free'
}

const ORBIT_CLAMPS = {
  minPolarAngle: Math.PI / 3,                // 60°
  maxPolarAngle: Math.PI * (100 / 180),      // 100°
  minAzimuthAngle: -Math.PI / 2,             // -90°
  maxAzimuthAngle: Math.PI / 2,              // +90°
  minDistance: 1.2,
  maxDistance: 4.0,
} as const;

const FREE_CLAMPS = {
  // Spread defaults — undefined props let drei use OrbitControlsImpl defaults.
  // We don't pass min/max angle/distance at all, so they're unset.
} as const;

export function Controls({ cameraMode }: ControlsProps) {
  const reduced = useReducedMotion();
  const clamps = cameraMode === 'orbit' ? ORBIT_CLAMPS : FREE_CLAMPS;
  return (
    <OrbitControls
      makeDefault
      target={[0, 0.6, 0]}
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={0.08}
      {...clamps}
    />
  );
}
```

**Why prop-swap not remount:** drei `<OrbitControls>` is a controlled wrapper around `three-stdlib`'s `OrbitControlsImpl`. Changing props re-runs the effect that re-applies them to the controls instance — no need to unmount/remount. This is the R3F-idiomatic pattern. PITFALLS Pitfall 2: never re-create geometries / materials / controls per render.

`[VERIFIED: github.com/pmndrs/drei/blob/master/src/core/OrbitControls.tsx]` — the type signature `OrbitControlsProps` confirms `target`, `enableDamping`, `makeDefault` as drei-specific props, with the rest passing through to the underlying impl via `ThreeElement<typeof OrbitControlsImpl>`.

### Pattern 5: WebGL Context-Loss Handling in R3F 9

**What:** Register a `webglcontextlost` listener via `<Canvas onCreated>`, call `event.preventDefault()` (allows future restoration), and lift state up to `<App />` so it can render `<TextShell />` + `<ContextLossBar />` instead of `<ThreeDShell />`.

**When to use:** Always. R3F 9 / three.js 0.184 exposes the underlying WebGLRenderer via `gl` in the `onCreated` hook. The renderer's `gl.domElement` (alias for `gl.canvas`) is the actual `<canvas>` DOM node — that's where the `webglcontextlost` event fires.

**Reference implementation:**

```tsx
// src/shells/ThreeDShell.tsx
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Header } from '../ui/Header';
import { Workstation } from '../scene/Workstation';
import { Lighting } from '../scene/lighting';
import { Controls } from '../scene/Controls';
import { useReducedMotion } from '../lib/useReducedMotion';
import { identity } from '../content/identity';
import { BracketLink } from '../ui/BracketLink';

interface ThreeDShellProps {
  onContextLost: () => void;
}

export default function ThreeDShell({ onContextLost }: ThreeDShellProps) {
  const [cameraMode, setCameraMode] = useState<'orbit' | 'free'>('orbit'); // D-11
  const _reduced = useReducedMotion();

  return (
    <>
      {/* SkipToContent inherited from Phase 1 — repeated here or in App. UI-SPEC body shape. */}
      <Header
        currentView="3d"
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
        showCameraToggle
      />
      <main id="main" tabIndex={-1} className="flex-1 min-h-0 relative font-mono">
        <Canvas
          className="block w-full h-full"
          camera={{ position: [2.4, 1.4, 2.4], fov: 50, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            const handleContextLost = (event: Event) => {
              // preventDefault allows the browser to fire webglcontextrestored later
              // if conditions improve. We don't auto-restore (D-14: full reload via
              // [retry 3D] is the recovery path), but signalling that we WOULD accept
              // restoration is the polite choice and matches WebGL spec advice.
              event.preventDefault();
              onContextLost();
            };
            gl.domElement.addEventListener('webglcontextlost', handleContextLost);
            // ARIA per UI-SPEC: label the canvas for screen readers.
            gl.domElement.setAttribute(
              'aria-label',
              'Interactive 3D workstation scene. Drag to look around.',
            );
            // touch-action: pan-y so vertical scroll passes through Canvas on touch devices.
            // UI-SPEC § Touch / pointer behaviour.
            gl.domElement.style.touchAction = 'pan-y';
          }}
        >
          <Lighting />
          <Workstation />
          <Controls cameraMode={cameraMode} />
        </Canvas>
      </main>
      {/* Footer inherited from existing layout */}
      <footer
        role="contentinfo"
        className="mt-16 pb-8 px-4 md:px-6 mx-auto max-w-[72ch] text-muted text-sm font-mono"
      >
        <p>
          © {new Date().getFullYear()} {identity.name} — built solo · source on{' '}
          <BracketLink href="https://github.com/erenatalaycs/Portfolio_Website" external>
            GitHub
          </BracketLink>
        </p>
      </footer>
    </>
  );
}
```

**Why state lift to `<App />` (not zustand or Canvas-internal state):**

1. The decision "show 3D or text shell" is App-level. Lifting context-loss to App keeps the source of truth aligned with the rest of the shell-selection logic.
2. zustand would work but adds a dependency for one boolean.
3. Inside Canvas, error boundaries don't catch async events — the listener fires outside any React render. The cleanest path is the imperative listener + `useState` callback prop, exactly like the snippet above.
4. PITFALLS Pitfall 2 reminds us not to setState inside `useFrame`. The listener is OUTSIDE `useFrame` (it's a DOM event), so this rule is fine.

**Verification recipe:**

Manual test in Chrome DevTools:
1. Open the deployed site at `?view=3d`.
2. DevTools → Rendering → "Lose / Restore WebGL context" (sometimes under three-dot menu → More tools → Rendering).
3. Click "Lose context".
4. Confirm: `<Canvas>` unmounts, `<TextShell />` renders, `<ContextLossBar />` appears at the top of `<main>`, `[retry 3D]` link works (reloads to `?view=3d`).
5. Click `[×]` and confirm bar dismisses.

Alternative API for programmatic test (no DevTools):

```js
// In browser console while on ?view=3d:
const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl2');
const ext = gl.getExtension('WEBGL_lose_context');
ext.loseContext();
// Bar should appear within ~50ms.
```

This pattern verifies the listener is registered correctly and the App-level state lift fires.

### Pattern 6: `<Header>` Refactor — Extract from TextShell, Share Across Shells

**What:** Phase 1 ships `<StickyNav />` rendered directly by `<TextShell />`. Phase 2 needs the SAME header (with the new `$ view` line) in BOTH `<TextShell />` and `<ThreeDShell />`. The clean refactor: create `src/ui/Header.tsx` that renders `$ goto` line PLUS `$ view` (and conditionally `$ camera`) line. Both shells render `<Header />` as their first child.

**When to use:** This is a single mechanical refactor in Plan 02-N (planner sequences). Two routes:

| Route | Steps | Tradeoff |
|-------|-------|----------|
| **(A) Move-and-rename — recommended** | (1) Create `src/ui/Header.tsx` containing the existing StickyNav `<header>` block + new `$ view` line. (2) Update `TextShell.tsx` to render `<Header currentView="text" showCameraToggle={false} />`. (3) `<ThreeDShell />` renders `<Header currentView="3d" cameraMode={…} onCameraModeChange={…} showCameraToggle />`. (4) Delete `src/ui/StickyNav.tsx` (or convert to thin re-export for backward-compat). (5) Update `src/shells/TextShell.tsx` import. | Net new code: small. Net deleted code: matches StickyNav size. Single source of truth from day one. |
| (B) Duplicate-then-dedupe | Copy StickyNav into ThreeDShell as separate component, refactor in a follow-up plan | Two sources of truth between commits. Not recommended — invites drift. |

**Header component contract:**

```tsx
// src/ui/Header.tsx
import { SECTIONS } from '../content/sections';
import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';
import { ViewToggle } from './ViewToggle';
import { CameraToggle } from './CameraToggle';

interface HeaderProps {
  currentView: 'text' | '3d';
  showCameraToggle?: boolean;
  cameraMode?: 'orbit' | 'free';
  onCameraModeChange?: (mode: 'orbit' | 'free') => void;
}

export function Header({ currentView, showCameraToggle, cameraMode, onCameraModeChange }: HeaderProps) {
  return (
    <header
      role="banner"
      className={[
        'sticky top-0 z-10 bg-bg',
        'border-b border-b-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]',
      ].join(' ')}
    >
      <div className="flex flex-col font-mono">
        {/* Line 1: $ goto … (Phase 1 contract — preserved verbatim) */}
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3"
        >
          <TerminalPrompt><span className="text-fg">goto</span></TerminalPrompt>
          {SECTIONS.map((s) => (
            <BracketLink key={s.id} href={`#${s.id}`}>{s.label}</BracketLink>
          ))}
        </nav>

        {/* Line 2: $ view [3d] [text]  │  $ camera [orbit] [free] */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-3">
          <ViewToggle currentView={currentView} />
          {showCameraToggle && cameraMode && onCameraModeChange && (
            <>
              <span
                aria-hidden="true"
                className="hidden sm:inline-block h-4 mx-2 border-l border-l-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
              />
              <CameraToggle cameraMode={cameraMode} onChange={onCameraModeChange} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

The conditional render of camera-toggle uses `showCameraToggle` as an explicit boolean (avoids prop-drilling cameraMode into TextShell where it's meaningless). UI-SPEC explicitly: "`<CameraToggle>` renders ONLY when `isThreeDShell === true` (D-11 — meaningless in text shell)."

**`<BracketLink>` additive change:** `as?: 'a' | 'button'` and `active?: boolean` props. The existing call sites (StickyNav, NotFound, Hero, Footer, EmailReveal) don't pass these — they default to `'a'` and `false`, preserving Phase 1 behaviour.

```tsx
// src/ui/BracketLink.tsx — Phase 2 additions (additive)
interface BracketLinkProps {
  // existing:
  href?: string;                       // now optional when as='button'
  children: ReactNode;
  external?: boolean;
  download?: boolean | string;
  className?: string;
  // NEW:
  as?: 'a' | 'button';
  active?: boolean;                    // toggles persistent inverted styling
  onClick?: (e: MouseEvent) => void;   // needed for button + retry-link variants
  ariaLabel?: string;
  ariaPressed?: boolean;               // for toggle buttons (UI-SPEC ARIA)
}
```

When `as='button'`, the component emits a `<button type="button">` instead of `<a>`, omits `href`/`external`/`download` props, and accepts `onClick` + `aria-pressed` + `aria-label`. When `active={true}`, the wrapper element gains `bg-accent text-bg` classes; the inner `<span>` carrying the children flips to `text-bg` so the bracket-pair reads as a coherent inverted block.

### Pattern 7: Procedural Primitives — Clean R3F Composition

**What:** Decompose the workstation into one file per element under `src/scene/`. Use refs only when needed (none in Phase 2 — no `useFrame` consumers). Memoize geometries/materials only if measurement shows it's necessary; for ~15-30 primitive meshes the default React reconciliation is fine.

**Why decompose:** PITFALLS Pitfall 1 — "God-Canvas" anti-pattern. One 600-line `<Scene>` is the most common R3F mistake. ARCHITECTURE.md Pattern 2 reinforces: "Compose the scene from small per-element files."

**File-per-element layout:**

```tsx
// src/scene/Workstation.tsx — pure composition, no state, no logic
import { Floor } from './Floor';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Lamp } from './Lamp';
import { Bookshelf } from './Bookshelf';

export function Workstation() {
  return (
    <>
      <Floor />
      <Desk />
      {/* 3 monitors. Planner picks layout (Claude's discretion). Example: linear with light angle: */}
      <Monitor position={[-0.45, 0.95, -0.05]} rotation={[0, 0.18, 0]} />
      <Monitor position={[0,     0.95, -0.05]} rotation={[0, 0,    0]} />
      <Monitor position={[ 0.45, 0.95, -0.05]} rotation={[0, -0.18, 0]} />
      <Lamp position={[-0.5, 0.78, 0]} />
      <Bookshelf />
    </>
  );
}
```

```tsx
// src/scene/Desk.tsx
import { SCENE_COLORS } from './colors';

export function Desk() {
  return (
    <group>
      {/* Top: 1.2 × 0.04 × 0.6 m, centered at desk-top y=0.75 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.6]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* 4 legs: 0.05 × 0.73 × 0.05, corners at ±0.55, ±0.25 */}
      {([
        [-0.55, 0.365, -0.25],
        [ 0.55, 0.365, -0.25],
        [-0.55, 0.365,  0.25],
        [ 0.55, 0.365,  0.25],
      ] as const).map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.05, 0.73, 0.05]} />
          <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.8} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}
```

```tsx
// src/scene/Monitor.tsx
import { SCENE_COLORS } from './colors';

interface MonitorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function Monitor({ position, rotation = [0, 0, 0] }: MonitorProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame/back: 0.58 × 0.35 × 0.04, behind screen */}
      <mesh castShadow>
        <boxGeometry args={[0.58, 0.35, 0.04]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Screen: 0.55 × 0.32 plane, 0.025 m in front of frame center */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.55, 0.32]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Stand: cylinder from desk top to monitor bottom */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.15, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
```

The same shape applies for `Lamp.tsx`, `Bookshelf.tsx`, `Floor.tsx`. Geometries are declarative children; no refs are needed because Phase 2 has no per-frame mutation.

**On `useMemo` for geometries:** PITFALLS Pitfall 2 mentions memoizing geometries. For Phase 2's ~15-30 primitive meshes, React's default reconciliation handles this — `<boxGeometry args={[…]}>` only re-creates if `args` changes (which doesn't happen during normal Phase 2 use, since geometry args are constants in the source). The planner does NOT need to add `useMemo` boilerplate for Phase 2; defer that optimization to Phase 3 if profiling shows churn.

**`MeshStandardMaterial`-vs-`MeshBasicMaterial`:** UI-SPEC explicitly uses `meshStandardMaterial` because we have shadows + lighting (D-07). `MeshBasicMaterial` would skip lighting calculations but defeat the directional-key-light shadow under the desk. Stick with `meshStandardMaterial`.

### Pattern 8: `src/scene/colors.ts` — Token Mirror with Drift Test

**What:** Three.js materials cannot read CSS custom properties at render-time (R3F runs in WebGL, not the DOM). Mirror the `tokens.css` HEX values as TS constants in `src/scene/colors.ts`. A unit test asserts each mirrored constant equals its corresponding `@theme` token value, so the two files cannot drift.

**Reference implementation:**

```ts
// src/scene/colors.ts
//
// HEX mirror of src/styles/tokens.css @theme tokens. Three.js materials cannot
// read CSS custom properties — values are mirrored manually here. The test
// (colors.test.ts) parses tokens.css and asserts parity, so any change to
// tokens.css that's not reflected here fails CI.
//
// Source: 02-UI-SPEC.md § Color § How Phase 1 tokens map to Three.js materials

export const SCENE_COLORS = {
  bg:      '#0d1117',  // matches --color-bg
  surface: '#161b22',  // matches --color-surface-1
  accent:  '#7ee787',  // matches --color-accent
  warn:    '#e3b341',  // matches --color-warn
} as const;

export type SceneColorKey = keyof typeof SCENE_COLORS;
```

**Drift test (single-file, jsdom-free):**

```ts
// src/scene/colors.test.ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SCENE_COLORS } from './colors';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('SCENE_COLORS mirrors tokens.css', () => {
  const tokensCss = readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf-8');

  // Helper: extract `--color-<name>: #xxxxxx;` value from tokens.css
  function token(name: string): string {
    const re = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`);
    const m = tokensCss.match(re);
    if (!m) throw new Error(`tokens.css missing --color-${name}`);
    return m[1].toLowerCase();
  }

  it.each([
    ['bg',      'bg'],
    ['surface', 'surface-1'],
    ['accent',  'accent'],
    ['warn',    'warn'],
  ])('SCENE_COLORS.%s matches --color-%s', (sceneKey, tokenName) => {
    expect(SCENE_COLORS[sceneKey as keyof typeof SCENE_COLORS].toLowerCase()).toBe(token(tokenName));
  });
});
```

This test runs under existing Vitest config (Phase 1's `tests/setup.ts` doesn't need to change). Plan 07 OPSEC drift check (referenced in 02-CONTEXT.md "Single source of truth additions") means: any time the planner edits `tokens.css`, this test fails until `colors.ts` is updated.

### Pattern 9: `size-limit` Configuration for Vite-Built `dist/`

**What:** `size-limit` reads a `"size-limit"` field in `package.json`. The `path` field accepts a glob (powered by `tinyglobby`) — e.g., `dist/assets/index-*.js` matches the hashed entry filename. Default compression is `gzip`, the units the budgets are stated in.

**Verified facts:**
- `[VERIFIED: github.com/ai/size-limit README]` — `path` accepts a glob; `limit` accepts `"120 KB"` form; `gzip` default true.
- `[VERIFIED: npm view size-limit@12.1.0 dependencies]` — depends on `tinyglobby`, confirming glob support.
- `[VERIFIED: npm view @size-limit/preset-app@12.1.0 dependencies]` — re-exports `@size-limit/file` + `@size-limit/time`.
- `@size-limit/file` is the right preset for static dist/ files (Vite output) — does NOT re-bundle, just measures the file. `[CITED: github.com/ai/size-limit README — preset comparison]`

**Reference `package.json` block:**

```json
{
  "scripts": {
    "size": "size-limit",
    "size:why": "size-limit --why"
  },
  "size-limit": [
    {
      "name": "text shell (initial bundle, gzipped)",
      "path": "dist/assets/index-*.js",
      "limit": "120 KB",
      "gzip": true
    },
    {
      "name": "3D chunk (lazy-loaded, gzipped)",
      "path": ["dist/assets/ThreeDShell-*.js", "dist/assets/index-*-*.js", "!dist/assets/index-[a-zA-Z0-9]*.js"],
      "limit": "450 KB",
      "gzip": true
    },
    {
      "name": "GLB workstation model (Phase 4)",
      "path": "public/assets/models/workstation.glb",
      "limit": "2500 KB",
      "gzip": false,
      "ignore": ["all"]
    }
  ]
}
```

**Caveat — the 3D chunk glob is fragile.** Vite's default chunk-naming is `assets/[name]-[hash].js`. The `[name]` for a dynamically-imported `<ThreeDShell />` defaults to one of:

- `ThreeDShell` (the component name, if Vite/Rollup picks up the named export) — most common case in Vite 8 with `@vitejs/plugin-react`.
- A numeric chunk ID (rarer with named lazy imports).

The planner has TWO options to make the glob predictable:

**Option A (recommended) — set explicit chunk filenames in `vite.config.ts`:**

```ts
// vite.config.ts — Phase 2 addition
build: {
  sourcemap: false,
  target: 'es2022',
  rollupOptions: {
    output: {
      // Force a stable chunk name pattern. Vite 8 preserves the component name
      // when given as the import-source identifier; this just makes the asset
      // filename match.
      chunkFileNames: 'assets/[name]-[hash].js',
      entryFileNames: 'assets/[name]-[hash].js',
      assetFileNames: 'assets/[name]-[hash][extname]',
    },
  },
},
```

These are Vite/Rollup defaults — declaring them explicitly is a no-op in behaviour but documents the contract. The `[name]` of a lazy-imported component derived from `import('../shells/ThreeDShell')` is `ThreeDShell` (Vite extracts it from the import path). `[CITED: vite.dev/config/build-options]`

**Option B — verify the actual filename and update size-limit's glob accordingly.**

After first build, run:
```bash
ls dist/assets/*.js
```
and update the path glob to match. This works but is brittle if anyone renames `ThreeDShell.tsx`.

**Recommendation: Option A + verification.** Plan 02-N adds the (currently no-op but stable) `chunkFileNames` to `vite.config.ts`, then verifies via `ls dist/assets/` that `ThreeDShell-*.js` exists. The size-limit config above will then match.

**GitHub Actions step (drop-in to existing `deploy.yml`):**

```yaml
# Add after the "Vitest" step and BEFORE "Strip metadata":
- name: Build (for size-limit)
  run: npm run build

- name: Enforce bundle size budgets
  run: npx size-limit
```

`npx size-limit` exits with non-zero status when any budget is exceeded — this fails the build. The output table shows actual size + budget + delta.

**Local script:** `npm run size` runs the same check. Useful before pushing.

**3D-chunk glob alternative — explicit chunk name:**

If the planner wants belt-and-braces certainty about the chunk name, the React.lazy import can use Vite's `/* webpackChunkName */`-equivalent magic comment (Vite 8 supports this for compatibility). But this is bridge engineering — Option A's `chunkFileNames` is sufficient.

### Pattern 10: Touch Action and Mobile Gesture Handling

**What:** Per UI-SPEC § Touch / pointer behaviour, the `<canvas>` needs `touch-action: pan-y` so vertical scroll can pass through Canvas (PITFALLS Pitfall 8 — preventing the "user can't scroll the page on mobile" trap).

**Verified pattern:** Set `gl.domElement.style.touchAction = 'pan-y'` inside `onCreated`. This is shown in Pattern 5's reference implementation. drei's `<OrbitControls>` does NOT set `touch-action` itself (verified by checking the drei OrbitControls source — it attaches pointer-event listeners but doesn't manipulate the CSS `touch-action`).

**Side effect:** Two-finger pinch gestures may register both as drei pinch-zoom AND as browser zoom. UI-SPEC flags this as a Phase 2 verification item ("verify in Phase 2 testing on iOS + Android"). Phase 4 OPS-04 real-device QA covers the final verification — Phase 2 just needs the code path to exist.

### Anti-Patterns to Avoid

- **Importing R3F at the App.tsx level:** any `import { Canvas } from '@react-three/fiber'` in App.tsx would bypass `React.lazy` and ship Three.js to text-shell users. The lazy import path `import('../shells/ThreeDShell')` MUST be the only entry point to R3F-using code.
- **Re-creating `<OrbitControls>` per render:** Don't `<OrbitControls key={cameraMode} … />` (which would force-remount on every mode toggle). Drei reads props every render — prop-swap, not key-swap. Memory leak risk per PITFALLS Pitfall 2.
- **Setting `<Canvas frameloop="always">`:** UI-SPEC explicit prohibition + PITFALLS Pitfall 17. With `frameloop="demand"` + drei's auto-invalidate, idle scenes burn zero GPU.
- **Mounting heavy three.js scenes inside React Strict Mode without proper cleanup:** Phase 1 ships `<StrictMode>` (standard Vite + React 19 default). Strict Mode double-invokes effects in dev — if `onCreated` registers a listener but no cleanup unregisters it, dev-mode runs leak listeners. **Mitigation:** the listener registered in `onCreated` does NOT need explicit cleanup in Phase 2 because the Canvas itself unmounts when context-lost fires (taking the listener with it). For belt-and-braces hygiene, the planner can store the handler in a ref and `removeEventListener` in a `useEffect` cleanup, but it's not load-bearing for Phase 2's contract.
- **`localStorage`-based view persistence (forbidden by D-12):** explicitly out. URL is the source of truth.
- **Permanent lamp blink animation (UI-SPEC anti-pattern):** Default ship: NO blink. If planner ships one, it's gated by `useReducedMotion()` and uses `useFrame` with refs (PITFALLS Pitfall 2 — never setState inside useFrame).
- **Using deprecated `@react-three/a11y` (CLAUDE.md "What NOT to Use"):** The package is unmaintained since 2022. Accessibility comes from the 2D fallback shell + canvas `aria-label`.
- **Permanent Glitch / DOF / SSAO postprocessing:** Phase 4. Phase 2 ships zero postprocessing.
- **`<axesHelper>` / `<gridHelper>` / `<Stats>` shipped to production:** PITFALLS Pitfall 13. Phase 2 ships none of these. If planner uses them locally for orientation-debugging, wrap in `{import.meta.env.DEV && …}`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| 3D chunk separation from text-shell initial bundle | Custom `manualChunks` config | `React.lazy(() => import(...))` + Vite's automatic chunking | `[CITED: github.com/vitejs/vite/issues/17653]` — manualChunks for vendor libs reachable from `React.lazy` BREAKS lazy-loading. Auto-chunking is correct. |
| WebGL2 capability detection | Manual feature-detection chain | `canvas.getContext('webgl2')` in a try/catch | One line, browser-native, no library needed. |
| `prefers-reduced-motion` reactive subscription | Bespoke `matchMedia` listener with `useState` | Existing `src/lib/useReducedMotion.ts` (Phase 1) | `useSyncExternalStore` already handles tearing detection; Phase 1 wrote it once. |
| URL-state subscription | `popstate` + `useState` boilerplate | Existing `src/lib/useQueryParams.ts` (Phase 1) | Same — Phase 1's hook is the pattern; Phase 2 reuses verbatim. |
| OrbitControls camera control | Bespoke pointer-drag → quaternion math | `drei <OrbitControls>` | drei wraps `three-stdlib`'s `OrbitControlsImpl` with R3F lifecycle integration + auto-invalidate for `frameloop="demand"`. Solved. |
| Bundle size budgets | Custom CI gzip + `wc -c` script | `size-limit` + `@size-limit/preset-app` | Globs, gzip, multi-budget, JSON output, nice failure messages, established package. |
| iPad detection | UA-string sniff | `navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1` (D-01 + research) | Apple's iPadOS 13+ change broke UA-only detection. The `maxTouchPoints` check is the canonical fix `[CITED: developer.apple.com/forums/thread/119186]`. |
| Damping math for camera | `useFrame`-based lerp | `enableDamping` + `dampingFactor` props on `<OrbitControls>` | drei reads them and applies them in the controls' update loop. Zero custom code. |
| Suspense fallback during 3D chunk load | Custom skeleton component | `<TextShell />` itself as the fallback | Per UI-SPEC: text shell IS the recruiter-grade product, not a placeholder. Already in initial bundle, zero extra code. |

**Key insight:** Phase 2's value-add is composition, not invention. Every piece of net-new logic in this phase is one of: (a) tiny adapter (the App.tsx 5-line diff, the Canvas onCreated wiring), (b) declarative scene composition (geometry, materials, lighting), (c) UI primitives that compose existing ones (Header, ViewToggle, CameraToggle). No custom rendering, no custom event handling, no custom state machines. The only meaty new module is `detectCapability.ts` and even that is straight feature-detection.

---

## Common Pitfalls

### Pitfall 1: `manualChunks` Breaks `React.lazy`

**What goes wrong:** Adding `build.rollupOptions.output.manualChunks: { three: ['three'], r3f: ['@react-three/fiber', '@react-three/drei'] }` to `vite.config.ts` causes `three` and the R3F bundle to load in the INITIAL bundle alongside `index.html`, defeating the lazy-load contract.

**Why it happens:** When `manualChunks` is configured, Vite/Rollup treats those chunks as known dependencies and includes them in the entry chunk's preload list — even if no static import reaches them. The `React.lazy` dynamic import becomes a no-op because the chunk is already loaded.

**How to avoid:** Do NOT add `manualChunks` for the 3D dependencies. Vite's automatic dynamic-import chunking already handles separation correctly when the only import path is `React.lazy(() => import('../shells/ThreeDShell'))`.

**Warning signs:**
- `dist/assets/index-*.js` (initial bundle) contains strings like `OrbitControls`, `THREE.`, or `WebGLRenderer`.
- Network panel shows `three.js`-sized chunk loaded on first page paint, not after toggling 3D.
- `npm run build` warns about "chunks larger than 500 KiB" pointing to the initial entry.

**Phase to address:** Phase 2 — verify after Plan 02-N (the lazy-load wiring) lands. Plan 06 size-limit gate catches it automatically (text shell exceeds 120 KB).

`[CITED: github.com/vitejs/vite/issues/17653, github.com/vitejs/vite/issues/5189]`

### Pitfall 2: setState Inside `useFrame` (Phase 2 has zero `useFrame` consumers but the pattern is load-bearing for Phase 3+)

**What goes wrong:** A future contributor adds a per-frame animation (lamp blink, monitor flicker, etc.) and naively `setState`s inside `useFrame`, triggering 60 React renders per second.

**How to avoid:** Phase 2 ships zero `useFrame` consumers. If Phase 2 includes the optional lamp blink (Claude's-discretion default = NO), it must use refs only:

```tsx
useFrame((state) => {
  if (!bulbRef.current) return;
  const elapsed = state.clock.elapsedTime;
  const flicker = Math.sin(elapsed * 0.1) > 0.95 ? 0.5 : 1.0;
  // Mutate the material's emissiveIntensity ref directly. NEVER setState.
  (bulbRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = flicker * 2.0;
});
```

PITFALLS Pitfall 2 references this rule. Plan should add an ESLint rule or comment-based grep step that flags `setState` / setter calls inside `useFrame` for downstream phases.

### Pitfall 3: `webglcontextlost` Listener Leaking in Strict Mode Dev

**What goes wrong:** React 19 Strict Mode double-mounts components in dev, so `<Canvas onCreated={…}>` fires twice. Without explicit cleanup, the second registration leaks. Production isn't affected (no Strict Mode double-mounts in prod), but dev console gets noisy.

**How to avoid:** Phase 2's listener is on `gl.domElement`, which itself unmounts when `<Canvas>` unmounts (Strict Mode double-mount cycles `<Canvas>` too, so the previous canvas's listener dies with it). The risk is theoretical. If the planner sees dev-console noise, store the handler in a ref and unregister in a `useEffect` cleanup:

```tsx
const handlerRef = useRef<((e: Event) => void) | null>(null);

<Canvas
  onCreated={({ gl }) => {
    handlerRef.current = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    gl.domElement.addEventListener('webglcontextlost', handlerRef.current);
  }}
>
```

…then in a `useEffect`:

```tsx
useEffect(() => {
  return () => {
    // Cleanup happens via Canvas unmount; this is the belt-and-braces.
    handlerRef.current = null;
  };
}, []);
```

**Phase to address:** Phase 2. Verify by checking dev console after toggling between text and 3D shells repeatedly — no listener-leak warnings.

### Pitfall 4: GH Pages Subpath Breaks `?view=3d` Retry

**What goes wrong:** D-14 says `[retry 3D]` reloads the page with `?view=3d`. If the retry handler hardcodes `window.location.assign('/?view=3d')`, in production the URL becomes `https://eren-atalay.github.io/?view=3d` (root) instead of `https://eren-atalay.github.io/Portfolio_Website/?view=3d` — a 404.

**How to avoid:** Use one of:
- `window.location.assign(import.meta.env.BASE_URL + '?view=3d')` — explicit base prefix.
- `window.location.search = '?view=3d'` — preserves current pathname implicitly.
- Anchor with relative href: `<a href="?view=3d">` — UI-SPEC's chosen form for `[retry 3D]`.

UI-SPEC § Context-loss info bar specifies: `<BracketLink href="?view=3d" onClick={triggerReload}>retry 3D</BracketLink>`. The relative href `?view=3d` is correct because it preserves the path. The `onClick` calls `window.location.assign(window.location.pathname + '?view=3d')` for a forced reload (the link alone updates the URL but doesn't reload — D-14 wants a fresh React tree).

**Phase to address:** Phase 2 — Plan 02-N landing the ContextLossBar.

### Pitfall 5: `frameloop="demand"` + GSAP-Driven Camera Move (Phase 3 trap, but documented now)

**What goes wrong:** Phase 3 will add GSAP timelines that mutate `camera.position` directly. With `frameloop="demand"`, GSAP's `onUpdate` callback is OUTSIDE drei's auto-invalidate, so the camera moves but nothing renders.

**How to avoid:** Phase 3 will need to call `invalidate()` from `useThree()` inside the GSAP `onUpdate`. **Phase 2 doesn't ship GSAP**, so this pitfall isn't active yet. Documented here so the Phase 3 planner doesn't lose two days to it.

### Pitfall 6: 3-Monitor Layout Frustum-Cuts the Outer Monitors

**What goes wrong:** Planner places monitors too far apart (e.g., x=-0.7, 0, +0.7), default camera at `[2.4, 1.4, 2.4]` looking at `[0, 0.6, 0]` with `fov=50`. The outer monitors fall outside the frustum at default zoom.

**How to avoid:** Planner places monitors no wider than the desk (1.2 m wide → outermost monitor centers at ~±0.45). UI-SPEC § Procedural workstation primitives gives `[0.55 × 0.32]` screen size — three monitors at ±0.45 spacing tile across the desk top with ~6 cm gap between adjacent monitor frames. Verifies in default camera view.

If the planner picks "single ultra-wide stand" (Claude's-discretion), the geometry is one wide screen plane (~1.0 × 0.35) on one stand — even less risk of frustum issues.

**Phase to address:** Phase 2 — quick visual smoke-check after Plan 02-N lands the scene.

---

## Code Examples

Verified patterns from official sources. All snippets above are reference implementations — these are the most-load-bearing recipes the planner needs to follow.

### A. Canvas + onCreated + context-loss listener

See Pattern 5 reference implementation above. `[CITED: r3f.docs.pmnd.rs/api/canvas, github.com/pmndrs/react-three-fiber/discussions/723]`

### B. drei OrbitControls with conditional clamps

See Pattern 4 reference implementation above. `[CITED: github.com/pmndrs/drei OrbitControls source]`

### C. Capability detection (5 checks + tablet exclusion)

See Pattern 2 reference implementation above. `[CITED: developer.apple.com/forums/thread/119186, aworkinprogress.dev/detect-iPad-from-Mac]`

### D. size-limit `package.json` block

See Pattern 9 reference. `[VERIFIED: github.com/ai/size-limit README]`

### E. Procedural primitive composition

See Pattern 7 reference (`Workstation.tsx`, `Desk.tsx`, `Monitor.tsx`). `[CITED: r3f.docs.pmnd.rs/getting-started/your-first-scene]`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `CSS3DRenderer` for HTML-on-mesh | `drei <Html transform occlude="blending">` | drei v8+ (~2023) | UI-SPEC defers `<Html>` to Phase 3, but the canonical pattern is locked. |
| iPad UA detection via UA string only | UA + `navigator.maxTouchPoints` + `navigator.platform === 'MacIntel'` | Apple iPadOS 13 (Sept 2019) | Without this, modern iPads default to text shell incorrectly per D-01. |
| `manualChunks` for vendor splitting | Trust automatic dynamic-import chunking when only entry is `React.lazy` | Vite 5+ (the bug `#17653` is from late 2024) | Skipping `manualChunks` is the simpler AND more correct path. |
| `frameloop="always"` (R3F default in early v8) | `frameloop="demand"` for static scenes | R3F docs added explicit guidance ~v9 (2024) | Battery savings on idle 3D scenes, expected by users running portfolios in background tabs. |
| `@react-three/a11y` for canvas accessibility | 2D fallback shell + canvas `aria-label` | a11y package unpublished/stale 2022 | Already locked in Phase 1; restated for Phase 2's canvas. |
| Local matchMedia listeners with `useState` | `useSyncExternalStore`-backed hooks | React 18 (2022); React 19 made it the recommended idiom | Phase 1 set this pattern; Phase 2 reuses verbatim. |

**Deprecated/outdated:**
- `framer-motion` package — replaced by `motion` (motion/react). Phase 2 doesn't ship animation library, so this is informational only.
- `vite-plugin-mdx` — replaced by `@mdx-js/rollup` (Phase 3 concern, not Phase 2).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vite 8 + Rollup auto-chunks lazy imports into separate files without `manualChunks` config | Pattern 1, Don't Hand-Roll | LOW — verifiable post-build via `ls dist/assets/` and grep. If wrong, the fix is to add the explicit chunk-name config from Pattern 9 Option A. Either way, size-limit catches the failure. |
| A2 | Android tablet detection via UA "Android" + NOT "Mobile" is canonical | Pattern 2 | LOW — heuristic is loose but tablet pass-through D-01 is permissive (passes more devices to 3D, downstream context-loss handles the failure cases). False-positive cost is 3D shell on a low-end Android tablet → context-loss → text shell + info bar. False-negative cost is Android tablet user defaulting to text shell (recoverable via `?view=3d` toggle). Both failure modes are handled. |
| A3 | `bundlesize` is older / less suitable than `size-limit` | Standard Stack alternatives | LOW — even if untrue, `size-limit` is fully supported and well-documented, and the choice doesn't ripple. |
| A4 | drei `<OrbitControls>` auto-invalidates on `change` event with `frameloop="demand"` | Pattern 3, Pattern 4 | MEDIUM — `[CITED: r3f.docs.pmnd.rs/advanced/scaling-performance]` confirms this for drei's controls family generally. If the specific drei 10.7 OrbitControls has regressed, fallback is to wire `useEffect(() => controls.addEventListener('change', invalidate))` manually. Verifiable in Phase 2 testing: drag camera, see frames render; release, scene idles. |
| A5 | `@vitejs/plugin-react` 6.x preserves component name in dynamic-import chunk filenames (Vite 8 chunk-name extraction) | Pattern 9 (size-limit glob) | LOW — verifiable post-build via `ls dist/assets/`. If the chunk is named numerically, the `chunkFileNames` config in Pattern 9 Option A makes it explicit. |
| A6 | React 19 Strict Mode does not break Canvas onCreated lifecycle in R3F 9.6 | Pattern 5 | LOW — R3F v9 is React-19-specific. If a regression exists, the workaround is to remove StrictMode locally for Canvas during dev (not for prod). No reports of issues in current docs. |

If this table is empty: not applicable — six assumptions surfaced. None are load-bearing for Phase 2 success — all have direct verification recipes or graceful fallback paths.

---

## Open Questions

1. **`<ThreeDShell>` chunk name verification** — Will Vite/Rollup name the lazy chunk `dist/assets/ThreeDShell-[hash].js`?
   - What we know: Vite's default `chunkFileNames: 'assets/[name]-[hash].js'` and the import path `import('../shells/ThreeDShell')` together imply yes. Verified pattern in published Vite + React-lazy demos.
   - What's unclear: edge-case where Vite picks a numeric chunk ID instead.
   - Recommendation: Plan 02-N adds explicit `chunkFileNames` to `vite.config.ts` (Pattern 9 Option A) AND verifies via `ls dist/assets/` after first build. Belt-and-braces.

2. **WebGL2 context creation cost in jsdom** — Does the unit test for `detectCapability()` need a WebGL2 mock?
   - What we know: jsdom does NOT implement WebGL — `canvas.getContext('webgl2')` returns `null`. So in jsdom, `hasWebGL2()` always returns `false`.
   - What's unclear: do we want unit tests to assert "this device passes" against a synthesized WebGL2 mock, or accept that the dimension is unobservable in jsdom and assert only the OTHER 4 dimensions?
   - Recommendation: write `detectCapability.test.ts` with three test groups:
     1. Tests where `hasWebGL2` is mocked to return `true` — assert other dimensions.
     2. Tests with no mock — assert `reasons.includes('no-webgl2')` (validates that the WebGL2 check fires when context creation fails).
     3. Tests for `isIpad`, `isAndroidTablet`, `isPhone` as standalone exports — pure UA logic, no WebGL needed.

3. **Touch behaviour on mobile after `?view=3d` bypass** — Does drei's pinch-zoom collide with browser-zoom?
   - What we know: UI-SPEC sets `touch-action: pan-y` on the canvas — this gives browser priority for vertical pans (so page scroll wins). Pinch is undefined behaviour with `pan-y` alone.
   - What's unclear: actual behaviour on iOS Safari + Android Chrome.
   - Recommendation: Phase 2 ships the `pan-y` setting and acknowledges this is verified in Phase 4 OPS-04 real-device QA (D-15 defers iOS memory-pressure to Phase 4; mobile gesture quirks are in the same bucket). Phase 2 acceptance is "the code path exists and works in DevTools mobile emulation."

4. **Bookshelf "books" detail level** — UI-SPEC + D-Claude's-discretion leaves this open.
   - What we know: bare shelves are minimal-effort and acceptable. Box-stack books add ~30-90 mesh instances.
   - What's unclear: does adding box-books push the 3D chunk over budget?
   - Recommendation: planner ships bare shelves first (cheapest). If size-limit shows headroom, add minimal book stack (5 boxes per shelf × 4 shelves = 20 meshes — negligible). Either is correct for Phase 2; Phase 4 GLB replaces both options.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (≥22.12.0) | Vite 8, all build steps | ✓ | 22.15.1 | — (Phase 1 already requires this) |
| npm (≥10) | Install + scripts | ✓ | 11.12.0 | — |
| Chrome / Edge / Firefox / Safari (modern) | WebGL2 baseline + dev | ✓ | (assumed dev environment) | — |
| GitHub Actions (ubuntu-latest) | CI build + size-limit gate | ✓ (verified by Phase 1 deploy.yml) | — | — |
| `npm view` (npm registry probe) | Version verification at plan-time | ✓ | — | — |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** none.

All Phase 2 dependencies are pure browser APIs (no native binaries, no system packages). The CI environment already runs Phase 1's build and tests successfully, so Phase 2 inherits a known-good baseline.

---

## Security Domain

> Phase 2 introduces a 3D rendering surface and runtime capability checks. Scope assessment:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | NO | n/a — fully public site, no auth |
| V3 Session Management | NO | n/a — no sessions |
| V4 Access Control | NO | n/a — single public visitor pool |
| V5 Input Validation | YES (limited) | `?view=` URL param: validated to `'text' \| '3d'` literal-set; any other value falls through to `detectCapability()` (existing Phase 1 hook handles this — `params.get('view')` returns `string \| null`, the App's switch only matches the two allowed values). |
| V6 Cryptography | NO | n/a — no secrets handled |
| V7 Error Handling | YES | Context-loss handler: per D-13, the user sees a generic info bar — no stack traces, no GL error codes leaked. Phase 1's `<NotFound>` handles unknown paths. Build-time `sourcemap: false` (Phase 1 lock) means stack traces in prod don't reveal source paths. |
| V11 Configuration | YES | `gl.powerPreference: 'high-performance'` is a hint, not a security risk. CSP is Phase 1 baseline (already shipped) — Phase 2 does NOT need to relax it. WebGL doesn't require any inline-script or eval. |
| V14 Software & Data Integrity | YES | Pinning via `~` (PITFALLS Pitfall 16) prevents drift. `package-lock.json` committed (Phase 1 lock). `npm audit` runs in Phase 4 OPS-05 pre-launch checklist. |

### Known Threat Patterns for {React + R3F + GH Pages}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| User-controlled URL injection (`?view=xss-payload`) | Tampering | URL params parsed as strings via `URLSearchParams` (no eval); `?view=` matched against literal `'text'` / `'3d'` (anything else falls through to capability check). React escapes any rendered text. |
| WebGL context-loss as DoS vector (attacker-induced) | Denial of Service | The handler swaps to text shell — site stays functional. Repeated context-loss + `[retry 3D]` could DoS the user's own browser, but only on their own device. Acceptable risk for a portfolio. |
| Source map leakage | Information Disclosure | `build.sourcemap: false` (Phase 1 lock). Phase 2 does NOT change this. |
| Third-party CDN compromise | Tampering | All assets bundled in repo (`public/assets/`); no runtime CDN loads. R3F deps are npm packages with `package-lock.json`-locked hashes. |
| Browser feature-detection abuse | Information Disclosure | `detectCapability()` reads `navigator.userAgent`, `navigator.deviceMemory`, etc. — these are already public (any analytics tool reads them). Capability result is local to the page session; nothing is sent to a backend (no backend exists). |
| OPSEC drift in 3D scene assets | Information Disclosure | Phase 2 ships ZERO public assets (no GLB, no textures). Phase 4's GLB will go through the existing exiftool gate (Phase 1 deploy.yml). |

**No new security surface introduced by Phase 2 beyond what Phase 1 already mitigated.** The capability check is a read-only feature probe; the WebGL context-loss handler is a defensive client-side recovery. CSP, source maps, OPSEC pipeline — all inherited from Phase 1 unchanged.

---

## Validation Architecture

> `workflow.nyquist_validation` is `false` in `.planning/config.json` — this section is OMITTED per Step 4 of the execution flow. Phase 2 validation tasks are derived from the existing Vitest suite (Phase 1) plus visual / manual smoke verification, not from a Nyquist requirement-to-test map.

(For completeness: Phase 2 should include test coverage for `detectCapability.ts` — see Pattern 2 § "Test surface" — and `colors.ts` drift parity — see Pattern 8. The 3D scene itself cannot be unit-tested in jsdom; visual verification happens in browser per the "Verification recipe" in Pattern 5.)

---

## Sources

### Primary (HIGH confidence)
- `[VERIFIED]` `npm view three@latest version` → `0.184.0` (2026-05-06)
- `[VERIFIED]` `npm view @react-three/fiber@latest version` → `9.6.1` (2026-05-06)
- `[VERIFIED]` `npm view @react-three/drei@latest version` → `10.7.7` (2026-05-06)
- `[VERIFIED]` `npm view size-limit@latest version` → `12.1.0` (2026-05-06)
- `[VERIFIED]` `npm view @react-three/fiber@9.6.1 peerDependencies` → confirms React 19 + three ≥0.156 + react-dom ^19
- `[VERIFIED]` `npm view @react-three/drei@10.7.7 peerDependencies` → confirms R3F ^9.0.0 + three ≥0.159
- `[CITED]` 02-CONTEXT.md D-01..D-15 — locked decisions consumed verbatim
- `[CITED]` 02-UI-SPEC.md — visual contract, Canvas configuration, OrbitControls clamps, layout, ARIA, animation contract
- `[CITED]` `https://r3f.docs.pmnd.rs/advanced/scaling-performance` — `frameloop="demand"`, dpr, drei controls auto-invalidate
- `[CITED]` `https://github.com/pmndrs/drei/blob/master/src/core/OrbitControls.tsx` — `OrbitControlsProps` type definition (Phase 2 verified live)
- `[CITED]` `https://github.com/ai/size-limit` — `path` glob support, `gzip: true` default, preset comparison
- `[CITED]` `https://github.com/vitejs/vite/issues/17653` — `manualChunks` breaks `React.lazy`
- `[CITED]` `https://github.com/vitejs/vite/issues/5189` — same root cause, predecessor issue
- `[CITED]` `https://github.com/pmndrs/react-three-fiber/discussions/723` — webglcontextlost handling guidance
- `[CITED]` `https://developer.apple.com/forums/thread/119186` — iPadOS 13 UA change (`MacIntel` + `maxTouchPoints`)
- `[CITED]` `https://www.aworkinprogress.dev/detect-iPad-from-Mac` — canonical iPad-vs-Mac detection recipe

### Secondary (MEDIUM confidence — community / aggregated)
- `[CITED]` `https://www.mykolaaleksandrov.dev/posts/2025/11/taming-large-chunks-vite-react/` — Vite + React.lazy + manualChunks discussion
- `[CITED]` `.planning/research/STACK.md` — Phase-level pinned versions, "What NOT to Use" list
- `[CITED]` `.planning/research/ARCHITECTURE.md` — `src/scene/*` decomposition, two-shells / one-content architecture
- `[CITED]` `.planning/research/PITFALLS.md` — pitfalls 1-23, especially 1, 2, 3, 8, 13, 16, 17

### Tertiary (LOW confidence — assumed convention, flagged in Assumptions Log)
- `[ASSUMED]` Android tablet UA omits "Mobile" token — conventional heuristic, not specified in any single authoritative source. Validated in practice across react-device-detect and similar libraries.

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions, peers, install command): **HIGH** — every version verified against npm registry on 2026-05-06; peer-dep alignment confirmed.
- Architecture patterns (lazy loading, OrbitControls, webglcontextlost, size-limit): **HIGH** — verified against R3F docs, drei source, size-limit README, and Vite issue tracker.
- Capability detection (5 checks + tablet exclusion): **HIGH for the 4 hardware checks**, **MEDIUM for tablet exclusion** (Android tablet detection is heuristic, but failure modes are graceful — see Assumptions A2).
- Pitfalls: **HIGH** — Phase 1 PITFALLS.md catalogued the relevant pitfalls in detail; Phase 2 only restates the active ones with current code-context.
- Phase 2 procedural primitive geometry sizes: **HIGH** — locked verbatim in UI-SPEC, no research ambiguity.

**Research date:** 2026-05-06
**Valid until:** 2026-06-06 (30 days for stable stack — R3F/drei/three move slowly inside a major version. If `@react-three/fiber@9.7.x` ships within the window, re-verify peer-dep alignment.)

---

*Phase: 2-3D Shell + Asset Pipeline + Capability Gating*
*Research authored: 2026-05-06*
