# Stack Research — v1.1 Room Build-Out + Pre-Launch Close

**Domain:** Procedural 3D room expansion (R3F portfolio scene) + v1.0 pre-launch closure
**Researched:** 2026-05-15
**Confidence:** HIGH (versions verified live against `https://registry.npmjs.org/<pkg>/latest`; capabilities verified against Context7 `/pmndrs/drei` and the project's existing scene code)
**Supersedes:** v1.0 STACK research (2026-05-06) for the v1.1 milestone scope; v1.0 core stack remains in place unchanged.

## TL;DR — One Paragraph

**For v1.1, the right answer is: add nothing to runtime dependencies.** Every category in the milestone — room shell, server rack, whiteboard, bookshelf books, plant, bed corner, cat, secondary devices, LED strip / bias-light — is reachable with the primitives + `meshStandardMaterial` emissive pattern already used by `Lamp.tsx`, `DeskDecor.tsx`, `WallDecor.tsx`, and `Chair.tsx`. The one new capability v1.1 introduces — a cat breathing-loop — needs a per-frame consumer, but R3F's built-in `useFrame` covers it; the scene currently has **zero** `useFrame` callers (verified by grep across `src/`) so the cat is also the first opportunity to set the reduced-motion gating pattern for animation. No version bumps required, and bumping `three` independently of drei/r3f is actively dangerous. The only **optional** addition is `maath ~0.10.8` if procedural easing helpers feel cleaner than hand-rolled sin-based offsets, but it is a "nice to have," not "needed." Bundle budgets do not change — geometry is described in source, not shipped as data, so adding 10 procedural components increases LOC but adds only a few hundred bytes of minified JS per component.

## Recommended Stack — v1.1

### Core Technologies (NO CHANGES from v1.0)

| Technology | Current Pin (tilde) | v1.1 Role | Why Kept |
|------------|---------------------|-----------|----------|
| `react` | `~19.2.5` | Runtime | R3F 9.6 peer range is `>=19 <19.3`; we're inside it. Bumping to 19.3 violates the peer. |
| `react-dom` | `~19.2.5` | Runtime | Same peer range. |
| `typescript` | `~5.9.3` | Type system | Stay on 5.x for R3F/drei type-def parity. |
| `vite` | `~8.0.10` | Build / dev server | v1.1 is feature work, not toolchain work. |
| `@react-three/fiber` | `~9.6.1` | Declarative R3F renderer | Peer-locked to `three >=0.156` and React 19. |
| `@react-three/drei` | `~10.7.7` | R3F helpers (`<Html transform occlude>`, `<OrbitControls>`, `<PerspectiveCamera>`, `<PerformanceMonitor>`) | All v1.1 additions stay inside this version's existing API surface; no bump. |
| `@react-three/postprocessing` | `~3.0.4` | CRT/Bloom/Scanline/CA/Vignette | PerformanceMonitor-gated. No v1.1 change. |
| `three` | `~0.184.0` | WebGL engine | Drei 10.7 peer is `>=0.159`. **Critical: do not bump `three` independently** — drei's effects rely on the version it was published against. |
| `zustand` | `~5.0.13` | Cross-canvas state | Already drives `MonitorTabs`; new room components are static and don't need new state slices. |
| `gsap` + `@gsap/react` | `~3.15.0` / `~2.1.2` | `FocusController` camera choreography | No room interactions in v1.1 add new camera moves. |

**Verified 2026-05-15 against npm registry:**
- `@react-three/drei@10.7.7` peers: `react ^19`, `react-dom ^19`, `three >=0.159`, `@react-three/fiber ^9.0.0` — current pins all satisfy.
- `@react-three/fiber@9.6.1` peers: `react >=19 <19.3`, `three >=0.156` — current pins all satisfy.

### Supporting Libraries (NO CHANGES)

| Library | Current Pin | v1.1 Role | Status |
|---------|-------------|-----------|--------|
| `@mdx-js/rollup` + `@mdx-js/react` | `~3.1.1` | CTF write-up authoring (CNT-02 / CNT-03) | Already wired; v1.1 write-ups drop `.mdx` into `src/content/writeups/`. |
| `rehype-pretty-code` + `shiki` | `~0.14.3` / `~4.0.2` | Build-time syntax highlighting in write-ups | Already wired. |
| `remark-gfm`, `remark-frontmatter`, `remark-mdx-frontmatter` | `~4.0.1` / `~5.0.0` / `~5.2.0` | MDX frontmatter + GFM | Already wired. |
| `@fontsource/jetbrains-mono` | `~5.2.8` | Monospace font (self-hosted) | Reuse same family for any in-scene canvas-texture text (whiteboard, framed cert). |

### Development Tools (NO CHANGES)

| Tool | Current Pin | v1.1 Role |
|------|-------------|-----------|
| `eslint` + `typescript-eslint` | `~9.39.4` / `~8.59.2` | Linting new scene components |
| `prettier` | `~3.8.3` | Formatting |
| `vitest` + `@testing-library/react` | `~3.2.4` / `~16.3.2` | Unit tests for pure logic only. Do **not** unit-test cat geometry or whiteboard texture in jsdom — jsdom has no WebGL or full Canvas 2D parity. |
| `size-limit` (`@size-limit/preset-app`) | `~12.1.0` | Budget enforcement (see budget review below) |

## Optional Library — Only If You Actually Want It

| Library | Latest (verified 2026-05-15) | Why It Might Help v1.1 | Why It Is Optional |
|---------|------------------------------|------------------------|-------------------|
| `maath` | `0.10.8` | Math helpers from the pmndrs ecosystem: `easing.damp` / `damp3` for the cat's breathing chest scale, `geometry.RoundedPlaneGeometry` for whiteboard / framed cert plates with chamfered corners. Maintained by gsimone (drei co-maintainer). | A one-line `useFrame((s) => mesh.scale.y = 1 + Math.sin(s.clock.elapsedTime * 0.6) * 0.02)` is enough for one breathing animation. Don't pull a dep for a 50-byte expression. **Add only if a second or third per-frame animation appears** (e.g. animated Pi-cluster blink instead of static randomized brightness). |

**Recommendation:** Defer `maath` until v1.2 unless three+ per-frame animations land. If you do add it: `npm install maath@~0.10.8`. Peer ranges are loose (`three >=0.126`); no conflict with current pins.

## What v1.1 Does NOT Need (and why each was considered)

These were specifically evaluated against the question's candidate list. Each rejection is project-specific.

| Considered | Verdict | Reason |
|------------|---------|--------|
| `@react-spring/three@~10.0.3` | **Skip** | Spring physics for the cat breathing is overkill — breathing is a deterministic sine-wave loop, not a damped settle to a target. Adds ~12 KB gz. drei's `<Float>` already covers the only other "drift" use case (and we don't need that either). |
| drei `<Float>` | **Skip** | Designed for "art object idly hovers in space." A static cyber room with floating books / mugs / cats would break aesthetic. Reserve for v1.2 if a literally-floating element appears (drone? hologram?). |
| drei `<Sparkles>` | **Skip** | Particle bursts. Reads as games or fantasy, not cybersecurity. |
| drei `<Stars>` | **Skip** | The window will show a "foggy night-city" backdrop (PROJECT.md A) — a canvas-texture gradient with a few warm rectangle lights, not procedural starfield. Stars also fight Bloom (every sprite gets bloomed). |
| drei `<Cloud>` / `<Caustics>` | **Skip** | Indoor cyber-room scene. Caustics is for underwater / glass refraction; Cloud is for outdoor weather. Wrong domain. |
| drei `<Backdrop>` | **Skip** | Renders a curved seamless studio floor sweep. We're building literal walls — back wall is a `<planeGeometry>` or thin box, not a sweep. |
| drei `<RoundedBox>` | **Skip for v1.1; defer to v1.2 polish pass** | Useful for monitor bezels and chamfered server-rack edges. **But** every existing scene component uses bare `<boxGeometry>`. Mixing rounded + bare boxes inside v1.1 would look inconsistent. If v1.2 runs a "polish pass," do RoundedBox **everywhere** then. |
| drei `<Edges>` | **Skip** | Wireframe outlines on geometry. Could suit a "schematic" wall poster, but the existing `WallPoster` canvas-texture pattern (ASCII frame + monospace) already nails the schematic look at zero extra runtime cost. |
| drei `<Text>` / `troika-three-text@0.52.4` | **Skip** | SDF text rendering for in-3D-space labels (e.g. floating "MITRE ATT&CK" header). Adds ~120 KB to bundle (troika is the bulk). The whiteboard is itself a canvas texture — draw the header inside the canvas with `ctx.fillText`. Same visual, zero dep cost. |
| `satori@~0.26.0` | **Skip** | Vercel's JSX → SVG/PNG renderer. Two problems: (1) ships a font subset embedded in JS (~80 KB+), (2) outputs PNG/SVG which then becomes a texture — exactly what we sidestep by drawing directly to canvas. **Use the existing `WallDecor.usePosterTexture()` pattern unchanged for the ATT&CK matrix.** |
| `r3f-perf@~7.2.3` | **Skip (install temporarily if needed)** | Dev HUD for perf. The existing `<PerformanceMonitor>` adaptive gate already tier-downgrades postprocessing when budgets are blown. Install only if shadow / drawcall surprises arise during build-out, and remove before commit. |
| `leva@~0.10.1` | **Skip** | Dev-only param GUI. v1.1 is "drop in known shapes at known positions" — not an art-direction iteration where live tweaking pays off. Install temporarily if a lighting tune-up gets stuck. |
| `gltfjsx@~6.5.3` | **Skip for A–G; install only for V2-3D-01** | CLI only; converts `.glb` → typed JSX. Plan 04-06's GLB attempt was reverted. If V2-3D-01 reactivates within v1.1, install **then** as a devDependency. Premature pinning bloats `package.json`. |
| `@gltf-transform/cli@~4.3.0` | **Skip for A–G; install only for V2-3D-01** | Same logic as gltfjsx; `gltfjsx --transform` shells into this. |
| `@use-gesture/react@~10.3.1` | **Skip** | Drag / pinch / hover gestures. `<OrbitControls>` already covers scene drag; cat / books / posters are not interactive in v1.1. |
| `@react-three/a11y` | **Hard-no, as established v1.0** | Last release 2022-05-15 — nearly 4 years stale. Text shell remains the a11y answer. |

## Pattern Decisions for the v1.1 Categories

### A. Room shell (walls + ceiling + window + blinds + door + ceiling light)

**Stack:** `<planeGeometry>` + `<meshStandardMaterial>` for walls and ceiling. Window glass = `<planeGeometry>` with a canvas texture showing "foggy night-city" (gradient + a few warm rectangle lights drawn in `CanvasRenderingContext2D`). Blinds = repeated thin `<boxGeometry>` strips (loop over an array). Door = a single `<boxGeometry>` with a small cylinder handle. Ceiling light = a thin emissive disc/cone modeled on `Lamp.tsx`.

**No new deps.** Window canvas-texture follows the exact `WallDecor.usePosterTexture()` pattern.

### B. Cyber detail (server rack + Pi cluster blink LEDs + cable bundle + HDD tower)

**Stack:** Server rack = nested `<boxGeometry>` (chassis + faceplates + rack-ear strips) following `DeskDecor.TowerPC` pattern. Blink LEDs = small emissive `<planeGeometry>` accents matching `DeskDecor`'s LED pattern. Cables = `<tubeGeometry>` along a hand-authored `CatmullRomCurve3` (both built into `three`; no dep). HDD tower = a single `<boxGeometry>` with one emissive LED face — clone-and-modify `TowerPC`.

**Blink behaviour — two options:**
1. **Static randomized brightness** (zero runtime cost) — at component mount, pick a random `emissiveIntensity` per LED in `[0.4, 2.0]`. Reads as "different Pis in different states." Zero `useFrame` consumers. **Recommended for v1.1.**
2. **Animated blink** — only do this if static reads dead. Use a single shared `useFrame` consumer that updates an array of `emissiveIntensity` values; gate with `prefers-reduced-motion`.

**No new deps.**

### C. Wall content (whiteboard ATT&CK / kill-chain + analog clock + framed cert)

**Whiteboard:** Reuse `WallDecor.usePosterTexture()` `CanvasRenderingContext2D` pattern at higher resolution (1024×768 instead of 500×700). Draw the MITRE ATT&CK matrix as a grid: row headers (Initial Access, Execution, Persistence, ... 14 tactics), columns of technique IDs (T1078, T1059, ...). All text via `ctx.fillText` with monospace font.

**Wall clock:** Static — 12 tick marks + two hand `<boxGeometry>` primitives at fixed rotations (e.g. frozen at 03:17 — set once at mount, no `useFrame`). A frozen wall-clock reads as "lived-in space," not "time display." If you want a one-time-correct clock, compute hand rotations from `new Date()` at mount (still no `useFrame`).

**Framed cert/poster:** Reuse `WallPoster` pattern with a different canvas-texture payload (rendered certificate scan or "certified by …" placeholder until real cert lands).

**No new deps.** All three use the texture pattern already proven in `WallDecor.tsx`.

### D. Warmth touches (books + plant + screen bias-light + under-desk LED)

**Books on shelf:** Loop over an array of `{w, h, d, color}` spine specs and emit a `<boxGeometry>` per book sitting on each `Bookshelf` shelf plane. Keep counts low (8–12 books per shelf). Use 3–4 muted color palette entries from `SCENE_COLORS` plus 1–2 accent red/orange genre spines.

**Plant:** Cylinder pot + a few `<coneGeometry>` leaves rotated around y. Under 80 LOC.

**Screen bias-light + under-desk LED:** Thin emissive `<planeGeometry>` strips — **exactly the `WallDecor.NeonStrip` pattern.** Cyan to match `NEON_CYAN`; `toneMapped={false}` so Bloom picks them up.

**Lighting choice — emissive vs. PointLight per LED:**

| Approach | Cost | Use For |
|----------|------|---------|
| `<meshStandardMaterial emissive emissiveIntensity={N} toneMapped={false}>` on a thin plane | ~0 GPU; relies on existing Bloom for glow | **Default** for all LED strips, bias-lights, neon, Pi-cluster LEDs. Established pattern. |
| Add a single `<pointLight>` at the strip location | Each pointLight is "cheap but not free" — `Lighting.tsx` already uses 2 (cyan + warm) | Only when the LED is meant to **illuminate** neighboring surfaces (under-desk strip casting a wash on the floor — that read is the whole point of the strip). Add 1, maybe 2; do not exceed ~4 total dynamic point lights without measuring with `r3f-perf`. |
| `<meshBasicMaterial>` (unlit) | Cheapest; ignores scene lighting | Avoid — does not interact correctly with Bloom threshold. |

**Recommendation:** Default to emissive `meshStandardMaterial`. Add one shared `<pointLight>` for the under-desk strip (so it visibly washes the floor) — that's the only place the "real light source" read matters. No new deps either way.

### E. Bed corner (bed/couch + nightstand + dim bedside lamp)

**Bed:** Stacked `<boxGeometry>` — mattress on a frame, pillow as a slightly raised softer box, blanket as a thin draped plane. Low-saturation linen color (NOT neon — keeps the cyber palette intact). Slight rotation away from world axes so it reads as "placed in a corner."

**Nightstand:** A smaller variant of `Desk` — `<boxGeometry>` top + one column or four short legs.

**Bedside lamp:** Clone `Lamp.tsx`. Swap bulb color from amber to a deeper red-orange (`#e3805a`-ish — still warm, doesn't read as alarm). Lower `emissiveIntensity` (1.0 vs the desk lamp's 2.0). Optionally add a small `<pointLight intensity={0.4} distance={0.8}>` at the bedside for local wash.

**No new deps.**

### F. Cat (procedural, breathing-animation optional)

**Geometry:** Sphere or `<capsuleGeometry>` body, slightly smaller sphere head, two cone ears, a thin tube tail, small cylinder paws. Total ~6–8 primitives.

**Position:** On the bed (curled — body rotated 90° on z so it lies flat) **or** on the window ledge (sitting upright). Pick one for v1.1; the other can land in v1.2.

**Breathing animation — the only real stack decision in this milestone:**

The scene **today has zero `useFrame` consumers** (verified: `grep -rn "useFrame\|useSpring\|@react-spring" src/` returns nothing). The cat is the first per-frame animation.

R3F 9.x supports `frameloop="demand"` on `<Canvas>`. If we're using `"always"` (the default), the loop runs every frame regardless, so adding `useFrame` is free. If we're on `"demand"`, you must call `invalidate()` per frame, which defeats demand mode for the entire scene.

**Verify before building cat:** check the current `<Canvas>` props for `frameloop`. If `"always"`, breathing costs only the math inside the callback (negligible). If `"demand"`, prefer a static curled cat and skip the animation entirely.

**Recommended pattern (no new dep):**
```tsx
// src/scene/Cat.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

export function Cat({ position }: { position: [number, number, number] }) {
  const bodyRef = useRef<Mesh>(null);
  const reducedMotion = usePrefersReducedMotion();
  useFrame((state) => {
    if (reducedMotion || !bodyRef.current) return;
    // 0.6 Hz breathing — sin wave on chest y-scale, ±2%.
    bodyRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.02;
  });
  return (
    <group position={position}>
      <mesh ref={bodyRef}>{/* body geometry + material */}</mesh>
      {/* head, ears, tail, paws */}
    </group>
  );
}
```

**Reduced-motion gate is mandatory** — site-wide pattern from v1.0 (TXT-05). If `usePrefersReducedMotion` doesn't yet exist as a hook, build it once during v1.1 and reuse it for any future per-frame work.

**No new deps.**

### G. Secondary devices (optional — laptop + SDR dongle + 2nd monitor)

**Laptop:** Two boxes hinged via a `<group>` rotation — base + screen. Screen surface emissive (off-state at low intensity, or a fake login prompt drawn into a canvas texture).

**SDR dongle:** A single `<boxGeometry>` with a tiny cylinder antenna.

**2nd monitor:** The existing `Monitor.tsx` already accepts `frameSize` / `screenSize` / `standHeight` props. Reuse it at smaller dimensions with a **static** canvas texture (not a live `<MonitorOverlay>` — one tabbed surface is enough).

**No new deps.**

### H. 04-08 human sign-off track

Pure manual / ops work — OG image swap, Lighthouse median-of-3, Web3Forms Gmail + Outlook delivery test, real-device QA (iOS + Android), named cyber + non-cyber usability peer reviews. **No deps added or removed.**

### I. Write-ups (CNT-02 / CNT-03) + GLB workstation (V2-3D-01)

**Write-ups:** MDX + Shiki pipeline is fully in place. Author `.mdx` files into `src/content/writeups/` with proper frontmatter; existing remark/rehype chain handles the rest. **No deps.**

**GLB workstation revisit:** If V2-3D-01 actually starts this milestone, add these CLI tools as **devDependencies only** (they do not enter the runtime bundle):

```bash
npm install -D gltfjsx@~6.5.3 @gltf-transform/cli@~4.3.0
```

Run `gltfjsx --transform` once per `.glb`, commit the optimized GLB plus the generated `.tsx` to `src/scene/workstation/`. Do **not** install proactively — keep `package.json` clean if V2-3D-01 slips to v1.2. Existing `public/assets/workstation/` GLB files from Plan 04-06 are retained.

## Installation Plan

**For v1.1 A–G + H + I (write-ups path) — the expected default:**

```bash
# Nothing to install. Verify current state instead:
npm ci
npm run typecheck
npm run lint
npm run test
npm run build
npm run size
```

**Only if V2-3D-01 (real GLB workstation) is activated within v1.1:**

```bash
npm install -D gltfjsx@~6.5.3 @gltf-transform/cli@~4.3.0
```

**Only if cat / blink LEDs grow into 3+ per-frame animations (judgement call):**

```bash
npm install maath@~0.10.8
```

## Alternatives Considered

| Recommended (v1.1) | Alternative | When to Use Alternative |
|--------------------|-------------|-------------------------|
| Native `CanvasRenderingContext2D` for ATT&CK matrix + clock + framed cert | `satori@~0.26.0` (JSX → SVG/PNG) | If you want to author the matrix in JSX and accept ~80 KB+ bundle cost. For a single texture, native canvas wins. |
| Raw `useFrame` for cat breathing | `@react-spring/three@~10.0.3` springs | If multiple animated objects need physics-based settling (spring to hover position). For one sine-wave loop, `useFrame` is right. |
| drei components already in 10.7.7 | drei `<Float>`, `<Sparkles>`, `<Stars>`, `<Cloud>`, `<Caustics>`, `<Backdrop>` | When the scene domain calls for them (floating art objects, particle effects, outdoor weather, studio backdrop). None match cyber-indoor-room. |
| Emissive `<meshStandardMaterial>` + bloom for LED glow | `<pointLight>` per LED | When the LED is meant to **wash** nearby surfaces (under-desk strip onto floor). Otherwise emissive + bloom is cheaper. |
| `<boxGeometry>` for everything | drei `<RoundedBox>` | When v1.2 does a coordinated polish pass on **all** geometry. Don't mix in v1.1. |
| Procedural cat | CC0 GLB cat from Sketchfab / Poly Pizza | If procedural reads as "a sphere with ears" rather than "a cat." Then run through `gltfjsx --transform` and commit. Cost: real model fidelity vs. file size. |
| `ctx.fillText` for whiteboard text | drei `<Text>` (troika under the hood) | When text must be in world-space, animated, or readable at sharp camera angles. Whiteboard text is locked to a plane so canvas wins. |

## What NOT to Use (v1.1-specific)

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Bumping `three` independently of drei/r3f | Drei 10.7 published against `three@~0.184`; later three minors can introduce small attribute or shader-compile shifts that surface as runtime errors with no compile warning. | Wait for drei 10.x → 11.x release notes; bump as a coordinated set. |
| Bumping `react` past 19.2.x | R3F 9.6.1 peer is `react >=19 <19.3`. Bumping violates the peer. | Stay on `~19.2.5`. |
| Adding `@react-three/a11y` | Last published 2022-05-15 (verified npm registry); ~4 years unmaintained. | Text-shell-as-a11y-answer architecture remains correct. |
| Adding `<Text>` (troika) for whiteboard text | Ships ~120 KB just to render text into a plane that doesn't need SDF crispness at oblique angles. | Canvas texture + `ctx.fillText` (the `WallDecor.usePosterTexture` pattern). |
| Loading a runtime GLB cat as "cheap fallback" if procedural fails | Adds another lazy-load chunk, asset-pipeline burden, and `gltfjsx` dep for one decorative element. | If procedural fails the eye test, defer cat to v1.2 rather than half-shipping via GLB. |
| Hard-coding the cat with `frameloop="always"`-dependency without checking current `<Canvas>` props | If the scene later moves toward `frameloop="demand"` for battery savings, every `useFrame` consumer must `invalidate()` per frame — that defeats demand mode globally. | Check the `<Canvas>` `frameloop` prop first; either commit to `"always"` or ship the cat static. |
| Hand-rolling shadow maps for new wall planes | Three.js shadow setup is fiddly; `Lighting.tsx`'s directional light already has `castShadow` tuned. Walls just need `receiveShadow`. | Set `receiveShadow` on each wall plane; do not touch directional `shadow-mapSize` / near / far. |
| Wrapping new components in unnecessary `useMemo` | React 19 + React Compiler (when enabled) auto-memoizes; explicit `useMemo` on JSX-inline geometry/materials is a v1.0-era pattern. | Compose plainly. Memoize only if a Performance-tab profile shows actual pressure. |
| Adding 6+ `<pointLight>` instances for "atmosphere" | Three.js does ~8 dynamic lights fine but every added one increases shader compile cost; combined with Bloom on emissive surfaces this gets expensive. | Cap at 4 total point lights (currently 2). Use emissive surfaces + Bloom for the rest. |
| Multiple 2048×2048 canvas textures | Lives in GPU memory; not caught by `size-limit` but real for low-end devices. | Cap canvas textures at 1024×1024 (whiteboard, framed cert, window backdrop). |

## Bundle Budget Review (size-limit)

| Budget | Current Limit | v1.1 Impact | Action |
|--------|---------------|-------------|--------|
| Text shell (initial bundle, gzipped) | ≤ 120 KB gz | Text shell does not get room-shell code | **No change to budget.** |
| 3D chunk (lazy-loaded, gzipped) | ≤ 450 KB gz | ~10–12 new procedural components; estimate +10–20 KB gz (geometry args + material props are tiny minified) | **Likely still under 450 KB.** Re-measure after each phase; if breached, drop secondary devices (Category G is optional) first. |
| Postprocessing chunk (lazy, gzipped) | ≤ 100 KB gz | No new effects | **No change.** |
| GLB workstation desk / lamp / bookshelf | ≤ 1000 / 500 / 500 KB | V2-3D-01 only; budgets already in place | Same enforcement as v1.0 |

**Recommendation:** Keep all size-limit budgets unchanged. If the 3D chunk approaches 400 KB gz during build-out, run `npm run size:why` to identify drift **before** adding more components. The **largest hidden risk** is canvas texture sizes — these are not in `size-limit` but live in GPU memory.

## Version Compatibility (verified 2026-05-15)

| Package A | Compatible With | Verification |
|-----------|-----------------|--------------|
| `@react-three/fiber@9.6.1` | `react@~19.2.5`, `three@~0.184.0` | npm registry peer ranges checked; current pins inside R3F 9.6.1's published `peerDependencies`. |
| `@react-three/drei@10.7.7` | `@react-three/fiber@9.6.1`, `three@~0.184.0`, `react@~19.2.5` | Drei's peer range `three >=0.159` includes 0.184.0; r3f `^9.0.0` includes 9.6.1. |
| `@react-three/postprocessing@3.0.4` | `@react-three/fiber@9.6.1`, `three@~0.184.0` | Shipping in v1.0; no change. |
| `three@~0.184.0` | All R3F/drei components in use | Drei and R3F peer ranges both satisfied. **Do not bump independently.** |
| `maath@0.10.8` (if added) | `three@>=0.126` (loose), R3F 9.x | Same maintainer as drei (gsimone); same ecosystem; no peer conflicts. |
| `gltfjsx@6.5.3` (if added for V2-3D-01) | CLI; generates code targeting `three@~0.184.x` | Runs at author time only, no runtime peer. |
| `@gltf-transform/cli@4.3.0` (if added) | Standalone CLI | No runtime peer. |

## Confidence per Recommendation

| Decision | Confidence | Verification |
|----------|------------|--------------|
| No new runtime deps for v1.1 A–G | **HIGH** | Verified by reading every existing scene component (`Lamp`, `DeskDecor`, `WallDecor`, `Bookshelf`, `Chair`, `Workstation`, `Lighting`); every v1.1 category maps onto an existing pattern. |
| Use native canvas texture for ATT&CK matrix | **HIGH** | `WallDecor.usePosterTexture` already does this for the wall poster; pattern proven. |
| Emissive + Bloom is the LED solution, not pointLight | **HIGH** | `DeskDecor.TowerPC` LEDs and `WallDecor.NeonStrip` already use this; PostFX Bloom is tuned to pick up `toneMapped={false}` emissive surfaces. |
| Procedural cat with `useFrame` breathing + reduced-motion gate | **HIGH** | R3F docs confirm `useFrame` is the canonical per-frame hook; `prefers-reduced-motion` site-wide gate is v1.0 commitment (TXT-05). |
| Skip drei `<Float>`, `<Sparkles>`, `<Stars>`, `<Cloud>`, `<Caustics>`, `<Backdrop>` | **HIGH** | Each helper's purpose verified against drei docs via Context7; none match cyber-indoor-room domain. |
| Skip `troika-three-text` / drei `<Text>` | **HIGH** | Bundle cost (~120 KB) verified; canvas-texture path already proven in v1.0. |
| Skip `@react-spring/three` | **HIGH** | Spring physics is wrong shape for sine-wave breathing; only one animation needs it. |
| Skip `satori` for v1.1 | **HIGH** | Native canvas path is cheaper and already in use; satori brings JSX-rendering machinery + font subset. |
| Defer `gltfjsx` / `@gltf-transform/cli` install until V2-3D-01 starts | **HIGH** | Both are CLI-only; installing proactively bloats `package.json` for tools that may not run this milestone. |
| Defer `maath` unless 3+ animations land | **MEDIUM** | Judgement call — single sine wave doesn't justify a dep, but if multiple per-frame consumers emerge, `easing.damp` makes them readable. |
| Keep all size-limit budgets unchanged | **MEDIUM** | New components add only minified LOC, not data; estimate +10–20 KB gz on 3D chunk is back-of-envelope. **Measure after the first room-shell phase wraps.** |
| Three.js peer-lock — do not bump independently | **HIGH** | Drei's `>=0.159` peer is liberal but actual API drift between three minors regularly breaks drei demos; coordinated bumps are the safe pattern. |

## Sources

- `https://registry.npmjs.org/@react-three/drei/latest` — fetched 2026-05-15: version `10.7.7`, peers `{react: ^19, react-dom: ^19, three: >=0.159, @react-three/fiber: ^9.0.0}`.
- `https://registry.npmjs.org/@react-three/fiber/latest` — fetched 2026-05-15: version `9.6.1`, peers `{react: >=19 <19.3, three: >=0.156}`.
- `https://registry.npmjs.org/@react-three/postprocessing/latest` — `3.0.4`.
- `https://registry.npmjs.org/three/latest` — `0.184.0`.
- `https://registry.npmjs.org/@react-spring/three/latest` — `10.0.3` (rejected for v1.1).
- `https://registry.npmjs.org/maath/latest` — `0.10.8` (optional, deferred).
- `https://registry.npmjs.org/gltfjsx/latest` — `6.5.3` (CLI; install only on V2-3D-01).
- `https://registry.npmjs.org/@gltf-transform/cli/latest` — `4.3.0` (CLI; install only on V2-3D-01).
- `https://registry.npmjs.org/satori/latest` — `0.26.0` (rejected for v1.1).
- `https://registry.npmjs.org/troika-three-text/latest` — `0.52.4` (rejected for v1.1).
- `https://registry.npmjs.org/leva/latest` — `0.10.1` (rejected for v1.1).
- `https://registry.npmjs.org/r3f-perf/latest` — `7.2.3` (install only as temporary debug).
- Context7 `/pmndrs/drei` — verified `<Float>`, `<Sparkles>`, `<RoundedBox>`, `<Edges>`, `<Backdrop>`, `<Text>` / `<Text3D>` APIs and purposes.
- `/Users/erenatalay/Desktop/App/Portfolio_Website/package.json` — current dependency pins (all `~` tilde-pinned; consistent with project convention).
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/{Lamp,DeskDecor,WallDecor,Bookshelf,Chair,Workstation,Lighting}.tsx` — existing patterns confirmed by direct read.
- `grep -rn "useFrame\|useSpring\|@react-spring" /Users/erenatalay/Desktop/App/Portfolio_Website/src/` — verified zero per-frame consumers exist today (cat breathing will be the first).

---
*Stack research for: v1.1 procedural room expansion + v1.0 pre-launch closure*
*Researched: 2026-05-15*
