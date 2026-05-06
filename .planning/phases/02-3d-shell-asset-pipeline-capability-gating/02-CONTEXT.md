# Phase 2: 3D Shell + Asset Pipeline + Capability Gating - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A lazy-loaded 3D shell that mounts only when capability detection passes, displays a placeholder workstation built from procedural primitives (no GLB yet), enforces size-limit budgets in CI, and validates the entire R3F + GH Pages + Suspense pipeline before any real content or assets are poured in.

Phase 2 ships:
- `<ThreeDShell />` lazy-loaded via `React.lazy`; Suspense fallback shows the existing text-shell skeleton (3D-01)
- `detectCapability()` synchronous heuristic — defaults mobile UA / `deviceMemory<4` / `hardwareConcurrency≤4` / no-WebGL2 / `prefers-reduced-motion: reduce` to text shell; `?view=3d` overrides (3D-02)
- View-toggle DOM overlay sibling of `<Canvas>`, always visible in both shells (3D-03)
- Composed scene — `<Desk />` + `<Monitor />` ×3 + `<Lamp />` + `<Bookshelf />` — using procedural primitives (3D-04; Draco GLB lands Phase 4)
- `webglcontextlost` listener that swaps cleanly to text shell with a dismissible info bar + retry link (3D-09)
- `size-limit` budgets enforced in CI: text shell <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB (OPS-02)

**Out of scope for Phase 2** (locked in ROADMAP.md / REQUIREMENTS.md):
- drei `<Html transform occlude="blending">` monitor content rendering → Phase 3 (3D-05)
- Click-to-focus camera animation per monitor → Phase 3 (3D-06)
- Animated `whoami` terminal greeting on main monitor → Phase 3 (3D-07)
- Postprocessing pipeline (Bloom + Scanline + ChromaticAberration + Noise) → Phase 4 (3D-08)
- Real Draco-compressed GLB workstation model → Phase 4 (3D-04 second half)
- Lighthouse + real-device QA + iOS Safari memory-pressure test → Phase 4 (OPS-03, OPS-04)

</domain>

<decisions>
## Implementation Decisions

### Capability Detection

- **D-01 — Tablet handling:** modern tablets (iPad M-series, Galaxy Tab S, etc.) are 3D-capable and MUST default to 3D shell, NOT text shell. `detectCapability()` does NOT use mobile-UA-string as a tablet trigger. Specifically: iPad UA strings (where Apple advertises as "desktop class") and Android tablets with `hardwareConcurrency >= 6` + WebGL2 should pass through to 3D shell. Phone UA strings (where `navigator.userAgent.includes('Mobile')` AND not iPad) still default to text shell.

- **D-02 — `?view=3d` override = bypass:** when `?view=3d` is present in URL, capability check is COMPLETELY SKIPPED. User knows best. If 3D fails downstream (context-loss, OOM), the existing 3D-09 graceful fallback handles it. No "are you sure?" overlay, no warning modal. Power users hit no friction.

- **D-03 — Network detection NOT included in capability check:** `NetworkInformation` API is unsupported on Safari (and the 3D chunk size budget is already <450 KB gz — slow networks load it slowly but reliably). The detection heuristic is hardware-only: WebGL2 support, `deviceMemory`, `hardwareConcurrency`, mobile UA (excluding tablets per D-01), and `prefers-reduced-motion: reduce`.

### Procedural Workstation Look

- **D-04 — Real-life-scaled units:** R3F 1 unit = 1 metre. Desk ~1.2m wide × 0.6m deep × 0.75m tall. Monitors 24-27 inch screen ratios. Lamp ~0.5m tall on the desk. Bookshelf taller than the desk (~1.5m), behind it. Phase 4 GLB drops in with the same scale, no camera retuning.

- **D-05 — Subtle floor plane (not bare space, not full room):** A flat dark floor at y=0, same `#0d1117` colour as background but a distinct plane (so subtle ambient occlusion + key-light cast a shadow under the desk). NO walls, NO ceiling, NO sky — workstation feels grounded but the surrounding space stays infinite-dark hacker-aesthetic. Phase 4 may add a low-poly "room" if the GLB demands it; Phase 2 stays minimal.

- **D-06 — Terminal-palette-aligned colours (NOT neutral physical materials):** every primitive surface tints to a Tailwind v4 `@theme` token from Phase 1:
  - Desk + bookshelf surface: `--color-surface` (`#161b22`)
  - Monitor frames: `--color-bg` (`#0d1117`)
  - Monitor screens: emissive `--color-accent` (`#7ee787`) — Phase 3 will overlay drei `<Html>` content, but Phase 2's emissive-green plane is the "screen on" placeholder
  - Lamp armature: `--color-surface` (`#161b22`)
  - Lamp bulb: emissive `--color-warn` (`#e3b341`)
  - Floor: `--color-bg` (`#0d1117`) but a distinct plane material (so SSAO/shadows render)
  - **No textures yet** — pure flat MeshStandardMaterial with `color` + `emissive` props. Phase 4 GLB introduces baked WebP textures.

- **D-07 — Lighting:** AmbientLight intensity 0.2 (everything readable but dim) + DirectionalLight key from camera-side (intensity 0.8, casts shadow under desk) + monitor emissive surfaces + lamp bulb emissive. Three lights total. NO rim lights, NO fill lights yet — Phase 4 postprocessing Bloom does the heavy lifting visually.

- **D-08 — Hybrid camera mode (orbit + free):**
  - **Default mode = "orbit"** with **mid-tier clamps** (NOT strict): `minPolarAngle: 60°`, `maxPolarAngle: 100°` (can look slightly down at desk surface, slightly up at top of monitors); azimuth `-90° .. +90°` (can pan around to side-view of desk but cannot get behind it); `minDistance: 1.2m`, `maxDistance: 4m`. Discoverable + exploratory but workstation always frames in view.
  - **"free" mode** = unclamped `<OrbitControls>` (full polar + azimuth + zoom range). User can fly anywhere, look at floor, etc.
  - **Mode toggle** lives in the sticky-header next to the view toggle (see D-11).

### View Toggle UI + Camera Mode Toggle

- **D-09 — View-toggle visual style:** **BracketLink terminal style**, not pill button, not floating action button. Renders as a 2nd prompt line in the sticky header:
  ```
  $ goto    [about]  [skills]  [projects]  [certs]  [writeups]  [contact]
  $ view    [3d]  [text]
  ```
  Active option uses inverted styling (accent-green background, bg-color text). Inactive uses default `<BracketLink>`. Reuses Phase 1's existing `BracketLink` + `TerminalPrompt` components — no new visual primitives invented. Drift-free with text shell aesthetic.

- **D-10 — Position:** view-toggle line lives **inside** the sticky header, immediately below the existing `$ goto […]` nav line. Same component renders in both shells (text + 3D). In 3D shell, the header is a DOM-overlay sibling of `<Canvas>` (per 3D-03). On mobile narrow widths, both lines wrap independently.

- **D-11 — Camera-mode toggle:** appears **only inside 3D shell** (not in text shell — meaningless there). Inline with the view-toggle line:
  ```
  $ view    [3d]  [text]      |    $ camera  [orbit]  [free]
  ```
  Uses the same BracketLink style. Active option inverted. The `|` separator is a visual divider, not a literal pipe character — let the planner pick a clean unicode/Tailwind border-left treatment. Camera mode is ephemeral state (NOT persisted to URL or localStorage); resets to "orbit" on every page load. Rationale: simple > clever; users who want freedom click the toggle every visit.

- **D-12 — URL state authoritative, NO localStorage:** `?view=text|3d` is the single source of truth. Toggle clicks update the URL via `history.replaceState` + dispatch the same `qpchange` event Phase 1's `useQueryParams` hook subscribes to. NO `localStorage` writes — every page load runs `detectCapability()` fresh. Eliminates the "user changed devices and got stuck" trap. Slightly more reload UX but cleaner state model.

### WebGL Context-Loss UX

- **D-13 — Instant cut + dismissible info bar:** when `webglcontextlost` fires, immediately unmount `<Canvas>`, mount `<TextShell />`. Render a dismissible info bar at the top of `<main>`:
  ```
  [!] 3D scene unavailable on this device. You're on the text shell.    [retry 3D] [×]
  ```
  Bar uses `--color-warn` (amber) for the `[!]` glyph; body text in `--color-fg`; `[retry 3D]` and `[×]` are BracketLinks. Bar auto-dismisses after 8 seconds OR on `[×]` click. NO fade animation (instant cut respects `prefers-reduced-motion` automatically).

- **D-14 — `[retry 3D]` reloads the page with `?view=3d`:** `window.location.assign('?view=3d')` (or set `window.location.search` to include `view=3d`). Fresh React tree, fresh WebGL context — safest recovery. The "remount inline" alternative is rejected because if context-loss was caused by memory pressure, an inline remount in the same tab will likely fail again (same memory state).

- **D-15 — iOS Safari memory-pressure real-device test deferred to Phase 4:** Phase 2 acceptance criteria require ONLY that the code path exists and DevTools "Lose Context" WebGL extension can trigger the fallback cleanly (locally verifiable). Real iOS-on-iPad/iPhone memory-pressure simulation lives in Phase 4 OPS-04 real-device QA pass — keeping Phase 4 as the final QA gate per ROADMAP discipline.

### Claude's Discretion

The user explicitly delegated these to the planner / executor:

- **Exact monitor dimensions** (24" vs 27" — pick one and apply consistently to all 3 monitors). Eren's preference: realistic but not extreme.
- **Bookshelf detail level** — bare shelf planes vs procedural box "books"? Up to planner; either is acceptable for Phase 2 (replaced by Draco GLB in Phase 4 anyway).
- **Lamp armature shape** — gooseneck (curved) vs angle-poise (jointed) vs simple desk-lamp (cylinder + cone). Planner picks; cheapest geometry that reads as "lamp".
- **Lamp bulb subtle blink animation** — NO permanent blink (anti-pattern). If any animation, gated by `prefers-reduced-motion`. Planner discretion.
- **3-monitor stand layout** — single ultra-wide stand vs 3 separate stands vs L-shaped angled setup. Planner picks; needs to fit camera frustum so all 3 visible from default orbit view.
- **Loading state UX** — `React.lazy` Suspense fallback during 3D chunk download. The fallback IS the text-shell skeleton (per 3D-01), but the planner decides whether to add a small inline indicator like `[loading 3D…]` next to the view-toggle. Defaults to "no indicator" (text shell IS already a recruiter-grade shell).
- **`size-limit` budgets exact enforcement** — entry budgets are locked (text <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB) but the warning / failure thresholds (e.g., warn at 90%, fail at 100%) and the `npm run size` script vs CI-only config are planner discretion. Recommendation: use `size-limit` package with `package.json` `size-limit` field + `npm run size` script + CI step that runs `npx size-limit`.
- **Camera intro animation** — on first 3D shell mount, no animated camera move (e.g., dolly-in from far). Sticking with snap-to-default-orbit position. Phase 3's click-to-focus is the FIRST cinematic camera move.
- **Retry button copy text** — keep terminal-y, recruiter-friendly. Suggested: `[retry 3D]`. Planner may polish.
- **Info bar auto-dismiss timing** — 8 seconds is a good default; planner can tune 5-10s based on copy length.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner, executor) MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §"Phase 2: 3D Shell + Asset Pipeline + Capability Gating" — phase goal, requirement list (3D-01..04, 3D-09, OPS-02), 5 success criteria
- `.planning/REQUIREMENTS.md` §"3D Workstation Shell" + §"OPSEC & Polish" — full text of the 6 Phase-2 requirements + the locked anti-feature list
- `.planning/PROJECT.md` — core value, audience split, performance constraints
- `.planning/STATE.md` — current position (Phase 1 complete + live, Phase 2 fresh)

### Phase 1 patterns to extend (load-bearing — DO NOT re-invent)
- `.planning/phases/01-foundation-2d-recruiter-grade-shell/01-CONTEXT.md` — locked decisions D-01..D-18 still apply (palette tokens, terminal aesthetic, query-param routing, no localStorage, semantic HTML, prefers-reduced-motion, anchor-list shared const)
- `.planning/phases/01-foundation-2d-recruiter-grade-shell/01-UI-SPEC.md` — palette tokens (`#0d1117` bg, `#7ee787` accent, `#e3b341` warn, etc.), 4 type sizes, 5-state anchor link contract — used verbatim by Phase 2 toggle UI
- `src/lib/baseUrl.ts` — `BASE` const used for any asset URL
- `src/lib/useQueryParams.ts` — Phase 2 `?view=` toggle hooks into the existing `qpchange` event
- `src/lib/useReducedMotion.ts` — capability check imports from here
- `src/content/sections.ts` — SECTIONS const used by Phase 2's StickyNav (already shipped)
- `src/ui/BracketLink.tsx` — reused for view-toggle + camera-mode toggle
- `src/ui/TerminalPrompt.tsx` — reused for `$ view` and `$ camera` prompt lines
- `src/app/App.tsx` — current synchronous shell-selector mounts `<TextShell />`. Phase 2 adds the `React.lazy(() => import('./shells/ThreeDShell'))` + `<Suspense>` branch + `detectCapability()` + `?view=` switching logic. Plan to extend this file in a 5-line diff, not refactor.

### Research (load-bearing for stack + architecture)
- `.planning/research/STACK.md` — pinned R3F 9.6, Three 0.184, drei 10.7, postprocessing 3.x versions; `<Html transform occlude>` decision; "What NOT to Use" list (no `@react-three/a11y`, no custom shaders in v1, no DOF/SSAO/permanent Glitch)
- `.planning/research/ARCHITECTURE.md` — single-SPA / two-shells / shared `src/ui/*` / shared `src/content/*` / `src/scene/*` for Phase 2 + 3
- `.planning/research/SUMMARY.md` — 3D shell design intent, capability-gating rationale
- `.planning/research/PITFALLS.md` — pitfall 2 (3D crashes on mid-tier mobile / iOS context-loss), pitfall 3 (2D fallback as second-class citizen — solved by reusing `src/ui/*`)

### Project-level
- `CLAUDE.md` — authoritative stack reference. Phase 2 introduces R3F 9.6, drei 10.7, three 0.184, `@react-three/postprocessing` 3.x (postprocessing imports for Phase 4 land later); explicitly NOT GSAP yet (Phase 3 uses GSAP for click-to-focus camera animation)

### External docs (versions verified 2026-05-06 in CLAUDE.md / Phase 1 RESEARCH)
- React Three Fiber v9 install + Canvas configuration
- drei `<OrbitControls>` clamping props (minPolarAngle, maxPolarAngle, etc.)
- `webglcontextlost` event handling in R3F (Canvas `onCreated` hook + raw `gl.canvas.addEventListener`)
- `size-limit` package configuration for Vite-built dist/

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (from Phase 1)
- **`src/app/App.tsx`** — currently mounts `<TextShell />` unconditionally based on `isKnownPath()`. Phase 2 extends with `?view=` switching + `detectCapability()` + `React.lazy` 3D branch. **5-line diff target — do not refactor.**
- **`src/lib/useQueryParams.ts`** — Phase 2 toggle reuses this verbatim. The `setQueryParams({ view: '3d' })` call from the toggle dispatches the same `qpchange` event the App listens to.
- **`src/lib/useReducedMotion.ts`** — `detectCapability()` imports the matchMedia logic (or just calls `useReducedMotion()` directly inside the capability check).
- **`src/ui/BracketLink.tsx`** — view-toggle + camera-mode toggle reuse this. Active state needs new prop (`active?: boolean`) — small additive change to the BracketLink contract that won't break existing call sites.
- **`src/ui/TerminalPrompt.tsx`** — view-toggle line uses this for the `$ view` prefix.
- **`src/styles/tokens.css`** — Phase 2 imports the same Tailwind v4 `@theme` tokens. Three.js `<meshStandardMaterial color={...}>` reads HEX values which we mirror from the tokens (no CSS custom property lookup inside R3F — values are hardcoded in `src/scene/colors.ts` constants imported from a shared file; planner's call).
- **`src/shells/TextShell.tsx`** — Phase 2 wraps this in the same `<Suspense fallback={<TextShellSkeleton />}>` boundary as the lazy 3D import. The skeleton can be `<TextShell />` itself (per 3D-01 — "Suspense fallback shows text-shell skeleton" means the actual TextShell, since it's already in the initial bundle).

### Established Patterns (from Phase 1)
- **Single source of truth content layer** — Phase 2's 3D shell will eventually (Phase 3) read from `src/content/*.ts` via drei `<Html>`. Phase 2 ships placeholder emissive-green planes; the integration point is a clear seam.
- **No localStorage** — Phase 1's URL-state-authoritative pattern carries forward. Phase 2 view-toggle and capability-check both use URL + matchMedia, never local storage.
- **`prefers-reduced-motion` honoured everywhere** — capability check defaults reduced-motion users to text shell; lamp bulb blink (if any) gated on the hook.
- **Section anchor const single source** — `SECTIONS` already shared between StickyNav, NotFound. Phase 3's 3D camera-focus presets will reuse it; Phase 2 doesn't touch this directly.

### Integration Points
- **`<App />` component** — Phase 2's primary integration point. Diff:
  1. Add `const ThreeDShell = React.lazy(() => import('./shells/ThreeDShell'))` at top of App.tsx
  2. Add `detectCapability()` import from `src/lib/detectCapability.ts`
  3. Inside App body: read `?view=` from useQueryParams; if `view === '3d'` OR `(view !== 'text' && detectCapability().pass)`, render `<Suspense fallback={<TextShell />}><ThreeDShell /></Suspense>`. Else render `<TextShell />`.
  4. ViewToggle component goes inside both shells (rendered by sticky header).
- **Sticky header** — currently rendered by `<TextShell />`. Move to a shared `<Header />` component that BOTH shells mount, so `<ThreeDShell />`'s DOM-overlay-sibling-of-Canvas (3D-03) renders the same header as text shell.
- **`<Canvas>` root** — `<ThreeDShell />` renders `<header>` + `<main className="…3D scene container…"><Canvas>...</Canvas></main>` + `<footer>`. The header IS the DOM overlay sibling of Canvas (3D-03).
- **Webgl context-loss event** — registered inside `<Canvas onCreated={({ gl }) => gl.canvas.addEventListener('webglcontextlost', handler)}>`. Handler unmounts ThreeDShell + remounts TextShell + shows info bar. State for "show context-loss bar" lives in App.tsx-level state (or zustand store if planner prefers).
- **`size-limit` config** — `package.json` `size-limit` field declares 3 budgets:
  ```json
  "size-limit": [
    { "name": "text shell (initial bundle)", "path": "dist/assets/index-*.js", "limit": "120 KB" },
    { "name": "3D chunk (lazy)", "path": "dist/assets/ThreeDShell-*.js", "limit": "450 KB" },
    { "name": "GLB asset (Phase 4 placeholder)", "path": "public/assets/workstation.glb", "limit": "2500 KB", "ignore": ["all"] }
  ]
  ```
  Last entry is Phase 4 — Phase 2 ships it disabled (GLB doesn't exist yet) but pre-configured.

</code_context>

<specifics>
## Specific Ideas

- **Hybrid camera mode (D-08, D-11)** — Eren's explicit request: "default sabit gelsin, isteyen tam serbest moda geçsin." Default = orbit-clamped (mid-tier limits), toggle = free. Camera-mode toggle visible only in 3D shell, ephemeral state, BracketLink visual style.
- **Tablet handling (D-01)** — Eren explicitly chose "modern tablets are 3D-capable". The capability heuristic must detect iPad / Galaxy Tab S etc. and pass them through. Planner: add a tablet UA detection branch that takes precedence over generic mobile-UA check.
- **`?view=3d` bypass (D-02)** — Eren explicitly chose "user knows best, bypass capability check". No warning modal, no friction.
- **No localStorage (D-12)** — Eren explicitly chose "URL-state-only authoritative". Slightly more reload UX but cleaner state.
- **Instant cut + info bar on context-loss (D-13)** — Eren explicitly chose "Instant cut + bilgi mesajı (Öneri)". Info bar required so user understands the swap; reduces "broken" perception.
- **Floor present but minimal (D-05)** — Eren chose "Zemin var (subtle floor plane) — ufak şalter". Not bare space, not full room.

</specifics>

<deferred>
## Deferred Ideas

Items captured during discussion or implied by the roadmap; not in Phase 2 scope.

### Carried by later phases (already mapped in REQUIREMENTS.md / ROADMAP.md)
- **drei `<Html transform occlude="blending">` monitor content** (real `src/ui/*` rendered onto monitor screens) → Phase 3 (3D-05). Phase 2 ships emissive-green planes as placeholder; Phase 3 swaps in the `<Html>` overlay.
- **Click-to-focus camera animation per monitor** (GSAP timeline) → Phase 3 (3D-06).
- **Animated `whoami` terminal greeting on main monitor** → Phase 3 (3D-07).
- **Postprocessing pipeline** (Bloom + Scanline + ChromaticAberration + low Noise, gated by drei `<PerformanceMonitor>`) → Phase 4 (3D-08).
- **Real Draco-compressed GLB workstation model** (≤2 MB, WebP textures 1024² hero / 512² props) → Phase 4 (3D-04 second half).
- **Lighthouse + real-device QA + iOS Safari memory-pressure real-cihaz test** → Phase 4 (OPS-03, OPS-04).

### v2 (already in REQUIREMENTS.md "v2")
- Custom CRT shader on monitor surfaces (V2-3D-02) — currently using emissive plane + Phase 4 postprocessing
- Scroll-driven camera tour (V2-3D-03)
- Source-code Easter egg (V2-3D-04)
- Real Blender-modelled workstation (V2-3D-01) — Phase 4 ships a sourced/simpler model

### None — discussion stayed within phase scope (no new deferred ideas surfaced).

</deferred>

---

*Phase: 2-3D Shell + Asset Pipeline + Capability Gating*
*Context gathered: 2026-05-06*
