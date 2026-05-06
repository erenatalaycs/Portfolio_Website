---
phase: 02-3d-shell-asset-pipeline-capability-gating
plan: 04
subsystem: 3d-shell-procedural-scene
tags: [r3f, three.js, drei, orbitcontrols, webglcontextlost, procedural-geometry, lazy-chunk]

requires:
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 03
    provides: Header (with showCameraToggle/cameraMode/onCameraModeChange contract), CameraMode type, ContextLossBar mounted via App.tsx contextLost branch
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 02
    provides: ThreeDShell PLACEHOLDER + onContextLost prop contract; App.tsx lazy import + Suspense fallback wiring
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 01
    provides: SCENE_COLORS HEX mirror; vite chunkFileNames pinned; @react-three/fiber + drei + three deps installed
  - phase: 01-foundation
    plan: 02
    provides: useReducedMotion reactive hook; identity content; BracketLink anchor form

provides:
  - "src/scene/Floor.tsx — 20×20m planeGeometry, receives shadow only (no cast), bg colour"
  - "src/scene/Desk.tsx — 1.2 × 0.04 × 0.6m top + 4 legs at corners, surface colour, MeshStandardMaterial roughness 0.8 / metalness 0.05"
  - "src/scene/Monitor.tsx — 24-inch 16:9 frame (0.58 × 0.35 × 0.04m) + emissive accent screen plane (0.55 × 0.32m, intensity 1.5, toneMapped=false) + cylindrical stand"
  - "src/scene/Lamp.tsx — cylinder base + thin neck + cone shade (DoubleSide) + emissive warn-amber bulb (intensity 2.0, toneMapped=false)"
  - "src/scene/Bookshelf.tsx — 1.0 × 1.5m back panel + 3 bare shelf planes; positioned at z=-0.6 behind desk"
  - "src/scene/Lighting.tsx — 1× ambientLight 0.2 + 1× directionalLight 0.8 castShadow at [3, 4, 2] with shadow-mapSize 1024×1024 (D-07 three lights total counting emissive surfaces)"
  - "src/scene/Controls.tsx — drei OrbitControls with conditional clamp swap (ORBIT_CLAMPS: 60°-100° polar, ±90° azimuth, dist 1.2-4.0; FREE: drei defaults); enableDamping={!useReducedMotion()}, dampingFactor 0.08; makeDefault, target=[0, 0.6, 0], enablePan=false"
  - "src/scene/Workstation.tsx — pure composition (Floor + Desk + 3 Monitors at ±0.45 with ±0.18 rad inward angle + Lamp + Bookshelf); no state, no useFrame"
  - "src/shells/ThreeDShell.tsx — full UI-SPEC layout: Header (showCameraToggle wired) + main with Canvas + footer; Canvas pinned per UI-SPEC verbatim; webglcontextlost listener registered in onCreated calling preventDefault + props.onContextLost; aria-label + touch-action: pan-y on canvas DOM element; ephemeral useState<CameraMode>('orbit') (D-11 — never persisted)"
  - "index.html — body class 'bg-bg text-fg font-mono min-h-screen flex flex-col' + #root class 'flex flex-col flex-1 min-h-0' (Rule 3 deviation — UI-SPEC body contract was missing from Phase 1; needed for 3D shell main flexbox sizing)"

affects:
  - "Plan 02-05 (size-limit gate) — ThreeDShell-*.js chunk now contains R3F + drei + three (236.7 KB gz, comfortable under 450 KB budget); index-*.js entry chunk remains R3F-free at 65.4 KB gz (under 120 KB budget)"
  - "Phase 3 (interactive monitor content) — Monitor.tsx screen plane is the drop-in surface for drei <Html transform occlude='blending'>; emissive intensity 1.5 will be lowered when DOM content overlays"
  - "Phase 4 (asset pipeline + postprocessing) — procedural primitives ready to be replaced with Draco-compressed GLB; postprocessing Bloom/Scanline ready to layer onto current emissive materials"

tech-stack:
  added: []
  patterns:
    - "Procedural primitive composition — pure JSX scene assembly via R3F intrinsic elements (mesh, boxGeometry, planeGeometry, cylinderGeometry, sphereGeometry, coneGeometry); no THREE imports needed in scene files"
    - "SCENE_COLORS-only material props — no inline hex literals in any scene file (drift defeated by colors.test.ts gate against tokens.css)"
    - "Conditional clamp prop-swap on OrbitControls — cameraMode === 'orbit' ? ORBIT_CLAMPS : {} via spread; NEVER key-swap (would remount controls per render)"
    - "enableDamping reactive to prefers-reduced-motion — single motion difference between standard/reduced users; UI-SPEC accessibility contract"
    - "Canvas onCreated — three load-bearing wirings in one effect: webglcontextlost listener (3D-09 lift to App), aria-label (UI-SPEC ARIA contract), touch-action: pan-y (Pattern 10 mobile vertical scroll)"
    - "Lazy-import boundary preserved — all R3F imports reachable from src/shells/ThreeDShell.tsx and src/scene/*.tsx ONLY; static imports from App.tsx → TextShell.tsx → ui/* never touch R3F"
    - "Real-life-scaled units (1 unit = 1 metre) — desk 0.75m tall, monitors 0.55×0.32m screens, lamp ~0.5m, bookshelf 1.5m tall; matches D-04 contract"

key-files:
  created:
    - src/scene/Floor.tsx
    - src/scene/Desk.tsx
    - src/scene/Monitor.tsx
    - src/scene/Lamp.tsx
    - src/scene/Bookshelf.tsx
    - src/scene/Lighting.tsx
    - src/scene/Controls.tsx
    - src/scene/Workstation.tsx
  modified:
    - src/shells/ThreeDShell.tsx (PLACEHOLDER replaced with full Canvas + scene + listener; default-export contract preserved)
    - index.html (body + #root flex layout classes — Rule 3 deviation)

key-decisions:
  - "Lamp shade rendered with `side={2}` (numeric literal for THREE.DoubleSide) instead of `import { DoubleSide } from 'three'` — avoids forcing a direct three.js import in scene/* files; runtime-equivalent"
  - "Camera target [0, 0.6, 0] (UI-SPEC) — slightly below desk top (y=0.75) to centre the 3-monitor row vertically in the orbit frustum"
  - "Bookshelf rendered as bare 3-shelf-plane stack (Claude's-discretion in CONTEXT) — cheaper than a box-stack of 'books'; defers visual fidelity to Phase 4 GLB"
  - "Free camera mode keeps `enablePan={false}` (UI-SPEC) — the toggle removes polar/azimuth/distance clamps but never enables panning in either mode"
  - "index.html body classes added inline (Rule 3 deviation) — the UI-SPEC body contract `bg-bg text-fg font-mono min-h-screen flex flex-col` was specified by Phase 2 UI-SPEC line 253 but never applied in Phase 1; Plan 04's main flex-1 sizing requires it; #root also given `flex flex-col flex-1 min-h-0` so the React-mounted children inherit the flex container"

patterns-established:
  - "Pattern: Per-frame setState anti-pattern guarded by file-level grep — `! grep -F useFrame src/scene/{Floor,Desk,Monitor,Lamp,Bookshelf}.tsx` enforced in acceptance, catches future contributor mistakes at the file boundary"
  - "Pattern: webglcontextlost handler does NOT register webglcontextrestored — D-14 says we always full-reload via [retry 3D] rather than attempting in-flight restoration; simpler error model"
  - "Pattern: Three lights total — ambient + directional + emissive surfaces (monitors + lamp bulb); no rim, no fill, no point lights, no environment map; the dark-room aesthetic doesn't need an HDRI"
  - "Pattern: Vite/Rollup default chunking + React.lazy boundary alone is sufficient for the lazy-load contract — no manual-chunks declaration needed (and would actually break it; see vite.config.ts comment)"

requirements-completed: [3D-04, 3D-09]

duration: 8min
completed: 2026-05-06
---

# Phase 2 Plan 04: 3D Shell + Procedural Workstation Summary

**Procedural workstation scene rendering at `?view=3d`: floor + 24-inch 3-monitor desk + cone-shaded lamp + bookshelf + clamped/unclamped OrbitControls; webglcontextlost listener wired to App-level state-lift; lazy chunk holds R3F + drei + three at 236.7 KB gz while text-shell entry stays R3F-free at 65.4 KB gz.**

## Outcome

Plan 04 closes the procedural-scene half of requirement 3D-04 (Phase 4 ships the GLB replacement) and 3D-09 (graceful context-loss swap to text shell). After this plan, requirement 3D-01 (lazy load via React.lazy with TextShell Suspense fallback) is closed end-to-end — Plan 02-02 wired App's lazy + Suspense + onContextLost prop, Plan 04 made the lazy chunk non-empty by replacing the placeholder with the full Canvas + scene tree.

The scene composes 9 components inside a `<Canvas>` pinned to UI-SPEC values:

- `<Lighting />` — 1× ambient (0.2) + 1× directional key (0.8, casts shadow at `[3, 4, 2]`)
- `<Workstation />` — composes `<Floor />` + `<Desk />` + 3× `<Monitor />` (at ±0.45 with ±0.18 rad inward angle) + `<Lamp />` (left-back of desk) + `<Bookshelf />` (z=-0.6 behind desk)
- `<Controls cameraMode={cameraMode} />` — drei OrbitControls with conditional clamp prop-swap (orbit: 60°-100° polar / ±90° azimuth / 1.2-4.0 distance; free: drei defaults); damping gated by `useReducedMotion()`

The `<Canvas onCreated>` handler does three things in one effect: registers the `webglcontextlost` listener (calls `event.preventDefault()` + `props.onContextLost()` to lift state to App), sets the `aria-label="Interactive 3D workstation scene. Drag to look around."` per UI-SPEC ARIA contract, and sets `gl.domElement.style.touchAction = 'pan-y'` so vertical scroll passes through Canvas on touch devices (RESEARCH Pattern 10).

## Files

### Created (8 scene primitives)

| File | Lines | Purpose |
|------|-------|---------|
| `src/scene/Floor.tsx` | 18 | 20×20m planeGeometry rotated -π/2 X, receives shadow only |
| `src/scene/Desk.tsx` | 35 | 1.2×0.04×0.6m top + 4× 0.05×0.73×0.05m legs at corners |
| `src/scene/Monitor.tsx` | 45 | 24" frame + emissive accent screen + cylinder stand; takes `position` + optional `rotation` props |
| `src/scene/Lamp.tsx` | 54 | base + neck + DoubleSide cone shade + emissive warn-amber sphere bulb |
| `src/scene/Bookshelf.tsx` | 32 | 1.0×1.5m back panel + 3 shelf planes at heights 0.45/0.85/1.25 |
| `src/scene/Lighting.tsx` | 22 | ambientLight 0.2 + directionalLight 0.8 castShadow shadow-mapSize 1024² |
| `src/scene/Controls.tsx` | 44 | OrbitControls with ORBIT_CLAMPS / FREE prop-swap; reduced-motion damping gate |
| `src/scene/Workstation.tsx` | 33 | Pure composition; no state, no useFrame |

### Modified

| File | Change |
|------|--------|
| `src/shells/ThreeDShell.tsx` | 99 lines — PLACEHOLDER replaced with full Canvas + scene + listener; default-export shape preserved exactly per Plan 02-02 contract |
| `index.html` | body class `bg-bg text-fg font-mono min-h-screen flex flex-col` + `<div id="root" class="flex flex-col flex-1 min-h-0">` (Rule 3 deviation) |

## Bundle Metrics

| Metric | Value | Plan 05 Budget | Status |
|--------|-------|----------------|--------|
| Entry chunk gzipped (`dist/assets/index-*.js`) | **65.4 KB** (65,407 bytes) | 120 KB gz | OK (54% headroom) |
| 3D chunk gzipped (`dist/assets/ThreeDShell-*.js`) | **236.7 KB** (236,655 bytes) | 450 KB gz | OK (47% headroom) |
| Entry chunk raw (`dist/assets/index-*.js`) | 212.6 KB | — | — |
| 3D chunk raw (`dist/assets/ThreeDShell-*.js`) | 899.8 KB | — | — |

Entry chunk delta vs Plan 02-03 baseline (65,046 bytes): **+361 bytes gz** — only the lazy-import-promise wiring; no R3F leak.
3D chunk delta vs Plan 02-03 baseline (280 bytes — placeholder stub): **+236,375 bytes gz** — fresh R3F + drei + three + scene/* code.

## Lazy-Load Contract Verification (load-bearing for 3D-01)

```bash
$ grep -l 'OrbitControls' dist/assets/ThreeDShell-*.js
dist/assets/ThreeDShell-BSymBeQh.js                            # MATCH (R3F bundled into lazy chunk)

$ grep -l 'OrbitControls' dist/assets/index-*.js
                                                                # NO MATCH (text shell stays R3F-free)

$ grep -l 'WebGLRenderer' dist/assets/index-*.js
                                                                # NO MATCH (text shell stays three.js-free)
```

Both invariants hold. The Vite/Rollup default chunking + React.lazy boundary in `App.tsx` is sufficient — no manual-chunks declaration in `vite.config.ts` (and per Plan 01 vite.config.ts comment, manual-chunks would actively break the contract).

## Camera Contract (D-08)

| Prop | orbit mode | free mode |
|------|-----------|-----------|
| minPolarAngle | π/3 (60°) | undefined (drei default) |
| maxPolarAngle | π·100/180 (100°) | undefined (drei default) |
| minAzimuthAngle | -π/2 (-90°) | undefined (drei default) |
| maxAzimuthAngle | π/2 (+90°) | undefined (drei default) |
| minDistance | 1.2m | undefined (drei default) |
| maxDistance | 4.0m | undefined (drei default) |
| enablePan | false (always) | false (always) |
| enableDamping | `!reducedMotion` | `!reducedMotion` |
| dampingFactor | 0.08 | 0.08 |
| target | `[0, 0.6, 0]` | `[0, 0.6, 0]` |
| makeDefault | true | true |

Implementation uses prop-spread `{...clamps}` where `clamps = cameraMode === 'orbit' ? ORBIT_CLAMPS : {}`. RESEARCH Pattern 4 anti-pattern (key-swap) avoided — controls never remount on toggle.

## Canvas Configuration (UI-SPEC verbatim)

| Prop | Value | Source |
|------|-------|--------|
| `camera.position` | `[2.4, 1.4, 2.4]` | UI-SPEC § Camera contract |
| `camera.fov` | 50 | UI-SPEC (drei default — natural-feeling) |
| `camera.near` | 0.1 | UI-SPEC |
| `camera.far` | 50 | UI-SPEC |
| `dpr` | `[1, 1.5]` | UI-SPEC (mobile retina cap; trades sharpness for FPS) |
| `frameloop` | `"demand"` | UI-SPEC (battery-friendly idle; OrbitControls auto-invalidates on drag) |
| `shadows` | true | UI-SPEC (single shadow caster — directional key) |
| `gl.antialias` | true | UI-SPEC |
| `gl.alpha` | false | UI-SPEC (opaque canvas — no blending with body bg) |
| `gl.powerPreference` | `'high-performance'` | UI-SPEC |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added body + #root flex layout to index.html**
- **Found during:** Task 2 implementation review.
- **Issue:** UI-SPEC § 3D shell DOM structure (line 253) specifies `<body class="bg-bg text-fg font-mono min-h-screen flex flex-col">`, and the 3D shell's `<main className="flex-1 min-h-0 relative">` requires a flex parent to compute height correctly. Phase 1's `index.html` shipped without these classes (the spec for them exists only in Phase 2's UI-SPEC). The plan instructed: "If not, the executor must surface this — the 3D shell's main height calculation depends on flexbox."
- **Fix:** Added `class="bg-bg text-fg font-mono min-h-screen flex flex-col"` to `<body>` and `class="flex flex-col flex-1 min-h-0"` to `<div id="root">`. The #root flex setup ensures the React-mounted children (Header → main → footer) inherit the flex layout, since React mounts INTO `#root`, not directly into `<body>`.
- **Files modified:** `index.html` (commit `b05ecb0`).
- **Verification:** Build passes; main fills available height between sticky header and footer; text-shell layout (which uses `mx-auto max-w-[72ch]` on its own main and doesn't use flex-1) remains visually unchanged because `min-h-0` simply removes the flex-default min-content constraint — no overflow regression.

**2. [Rule 1 - Bug] Adjusted comment wording in Lamp.tsx and ThreeDShell.tsx to satisfy negative greps**
- **Found during:** Task 1 verify (Lamp), Task 2 verify (ThreeDShell).
- **Issue:** The plan-supplied verbatim file contents include comments containing the words `useFrame` and `localStorage`, but the same plan's `<verify><automated>` blocks include `! grep -F "useFrame" src/scene/*.tsx` and `! grep -F "localStorage" src/shells/ThreeDShell.tsx`. The acceptance criterion's intent is "no per-frame consumer / no persistence" but the grep is too strict — it catches mere mention of the term in a "no-op" comment.
- **Fix:** Reworded comments to express the same idea without the literal token:
  - `Lamp.tsx`: `"useFrame consumers"` → `"per-frame animation consumers"`
  - `ThreeDShell.tsx`: `"NOT localStorage"` → `"NOT cached across reloads"`
- **Behaviour:** Identical (comments only).
- **Verification:** All negative greps pass; file semantics unchanged.

## Acceptance Criteria — Verification

### Task 1 (scene primitives)

- [x] All 8 scene files exist (Floor, Desk, Monitor, Lamp, Bookshelf, Lighting, Controls, Workstation)
- [x] `grep -F "SCENE_COLORS"` matches in all 5 material-bearing files (Floor, Desk, Monitor, Lamp, Bookshelf)
- [x] `! grep -E "#[0-9a-fA-F]{6}" src/scene/*.tsx` exits 0 (no inline hex)
- [x] All UI-SPEC dimensions match (desk 1.2×0.04×0.6, legs 0.05×0.73×0.05, monitor frame 0.58×0.35×0.04, screen 0.55×0.32, floor 20×20, bookshelf back 1.0×1.5×0.04)
- [x] `grep -F "emissive={SCENE_COLORS.accent}"` matches in Monitor.tsx; `grep -F "emissive={SCENE_COLORS.warn}"` matches in Lamp.tsx
- [x] `grep -F "toneMapped={false}"` matches in Monitor.tsx and Lamp.tsx
- [x] Lighting: `intensity={0.2}`, `intensity={0.8}`, `position={[3, 4, 2]}`, `castShadow`, `shadow-mapSize-width={1024}` all match
- [x] Controls: `OrbitControls`, `from '@react-three/drei'`, `makeDefault`, `enablePan={false}`, `enableDamping={!reduced}`, `dampingFactor={0.08}`, `target={[0, 0.6, 0]}`, `Math.PI / 3`, `Math.PI * (100 / 180)`, `minDistance: 1.2`, `maxDistance: 4.0`, `useReducedMotion` all match
- [x] `! grep -F "useFrame" src/scene/{Floor,Desk,Monitor,Lamp,Bookshelf}.tsx` exits 0
- [x] No `axesHelper`, `gridHelper`, `Stats`, `from 'leva'`, `from 'r3f-perf'` in src/scene/
- [x] `npx tsc --noEmit` exits 0
- [x] `npx eslint src/scene/ --max-warnings=0` exits 0
- [x] `npx prettier --check src/scene/` exits 0

### Task 2 (ThreeDShell)

- [x] `! grep -F "PLACEHOLDER" src/shells/ThreeDShell.tsx` exits 0
- [x] All UI-SPEC Canvas props match: `position: [2.4, 1.4, 2.4]`, `fov: 50`, `near: 0.1`, `far: 50`, `dpr={[1, 1.5]}`, `frameloop="demand"`, `shadows`, `antialias: true`, `alpha: false`, `powerPreference: 'high-performance'`
- [x] All onCreated wiring present: `webglcontextlost`, `event.preventDefault()`, `onContextLost()`, `Interactive 3D workstation scene`, `touchAction = 'pan-y'`
- [x] State management: `useState<CameraMode>('orbit')` (D-11 ephemeral default)
- [x] Header wired: `currentView="3d"`, `showCameraToggle`, `cameraMode={cameraMode}`, `onCameraModeChange={setCameraMode}`
- [x] Layout: `flex-1 min-h-0` on main; `relative` for future absolute children
- [x] `export default function ThreeDShell` contract preserved (App.tsx React.lazy needs default export)
- [x] No `localStorage`, `from 'leva'`, `from 'r3f-perf'`, `Stats`, `axesHelper`, `gridHelper`, `@react-three/postprocessing`, `from 'gsap'` (Phase 2 boundaries enforced)
- [x] All 5 CI gates exit 0: tsc, eslint, prettier, vitest (54/54), vite build
- [x] `dist/assets/ThreeDShell-*.js` exists and contains 'OrbitControls'
- [x] `dist/assets/index-*.js` does NOT contain 'OrbitControls'
- [x] `dist/assets/index-*.js` does NOT contain 'WebGLRenderer'

## Visual Smoke-Test Status

The plan's Step 2.6 lists 10 in-browser checks (drag/zoom/clamp behaviour, view toggle reload, DevTools `WEBGL_lose_context` simulation, prefers-reduced-motion damping). These require a human in front of the browser; the executor verified:

- `npm run dev` starts cleanly (Vite ready in 308ms, no startup errors, no console warnings during hot-reload)
- `npm run build` succeeds without TypeScript or Rollup errors
- All 54 unit tests pass

The 10-point visual checklist is the user's responsibility before merging Plan 04 to a release branch. Plan 02-05's size-limit gate enforces the bundle budget, and Phase 4's OPS-04 real-device QA covers the iOS Safari memory-pressure / context-loss path.

## Test Count

54 tests pass (no change from Plan 02-03). Plan 04 ships zero new test files — visual verification of 3D rendering is deferred to in-browser smoke testing per the plan's "automated grep-based acceptance criteria are the gating evidence" framing. The colors.test.ts gate (Plan 01-01) catches palette drift; the lazy-load contract greps catch chunk-leak regressions; the file-level grep gates catch dev-helper / per-frame-setState / postprocessing/gsap regressions.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `6b85700` | `feat(02-04): author scene primitives — floor, desk, monitor, lamp, bookshelf, lighting, controls, workstation` |
| 2 | `b05ecb0` | `feat(02-04): replace ThreeDShell placeholder with full Canvas + scene + context-loss listener` |

## Next Plan Readiness

Plan 02-05 (size-limit gate) is fully unblocked:

- **Bundle filenames stable:** `dist/assets/ThreeDShell-*.js` and `dist/assets/index-*.js` both exist with predictable globs (vite.config.ts chunkFileNames pinned in Plan 01-01).
- **Sizes well under budget:** 65.4 KB gz entry vs 120 KB target (54% headroom); 236.7 KB gz 3D chunk vs 450 KB target (47% headroom). Plan 05's `size-limit` runs against these globs and Plan 04 has left ample room for Phase 3-4 additions.
- **Lazy contract proven:** R3F is bundled into ThreeDShell-*.js only; index-*.js stays R3F-free. Plan 05's invariant grep checks will pass.

## Self-Check: PASSED

- [x] All 8 src/scene/* files exist (verified via `ls`)
- [x] `src/shells/ThreeDShell.tsx` PLACEHOLDER fully removed (verified via `! grep PLACEHOLDER`)
- [x] Both task commits exist in `git log --oneline -5`: `6b85700`, `b05ecb0`
- [x] Build artefacts present: `dist/assets/ThreeDShell-BSymBeQh.js`, `dist/assets/index-aiZY5S9L.js`
- [x] Lazy-load contract holds: `grep -l OrbitControls dist/assets/ThreeDShell-*.js` matches; same grep on index-*.js does NOT match
- [x] All five CI gates pass: tsc, eslint, prettier, vitest (54/54), vite build

---
_Phase: 02-3d-shell-asset-pipeline-capability-gating_
_Completed: 2026-05-06_
