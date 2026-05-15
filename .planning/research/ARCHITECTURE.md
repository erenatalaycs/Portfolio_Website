# Architecture Research — v1.1 Room Build-Out + Pre-Launch Close

**Domain:** R3F-rendered procedural 3D room (additive to shipped v1.0 desk-island)
**Researched:** 2026-05-15
**Confidence:** HIGH (most decisions extend already-shipped patterns; only the lighting-count question crosses a measurable performance line, and that's verified against the Three.js forum consensus)

## Scope Boundary

v1.1 is **additive**, not a rewrite. The architecture work is: layer a room shell around the existing desk, add 7 categories of decoration that live within that shell, and close two non-architecture v1.0 carry-overs (human sign-off + write-ups). The shipped patterns (`Workstation.tsx` composer, `<Html transform occlude="blending">` for the monitor, `<PerformanceMonitor>`-gated postprocessing, query-param routing, zustand `tabStore`, `useReducedMotion` gate, `SCENE_COLORS` mirror, `<FocusController>` 2-pose toggle) are all keepers — none need to be rewritten.

What v1.1 does change:
1. Wraps the scene in geometry (4 walls + ceiling). This implicates `Controls.tsx` clamps and `Lighting.tsx` light count, and nothing else structurally.
2. Adds 13-15 new procedural primitive components, all under `src/scene/`. No new top-level folders; one optional subfolder for textures.
3. Adds at most 1 new zustand slice (and the answer is "probably zero — don't add one").
4. Reuses the `WallDecor` canvas-texture recipe for the whiteboard and certs frame.
5. Does NOT modify the camera state machine. The single overview pose is sufficient for everything we're adding.

## System Overview (v1.1 target)

```
┌──────────────────────────────────────────────────────────────────────┐
│  <App> (capability gate, Suspense, ?view= router) — UNCHANGED         │
├──────────────────────────────────────────────────────────────────────┤
│  <ThreeDShell>  (Canvas wrapper, view-toggle overlay) — UNCHANGED     │
│  ├── <Lighting />                          ← MODIFIED (recomposed)    │
│  ├── <Controls ref={controlsRef} … />      ← MODIFIED (room clamps)   │
│  ├── <FocusController controlsRef={…} />   ← UNCHANGED (2 poses)      │
│  ├── <ScenePostprocessing />               ← UNCHANGED                │
│  └── <Workstation focused onMonitorClick>  ← MODIFIED (composer)      │
│      │                                                                │
│      ├── A. ROOM SHELL  (new — defines the world bounds)              │
│      │   ├── <Floor />                              ← UNCHANGED       │
│      │   ├── <WallBack />  <WallLeft />  <WallRight />                │
│      │   ├── <Ceiling />                                              │
│      │   ├── <Window />  (frame + foggy-night canvas texture + blinds)│
│      │   └── (optional) <Door />                                      │
│      │                                                                │
│      ├── (existing desk island — unchanged)                           │
│      │   <Desk />  <Monitor>…</Monitor>  <Lamp />                     │
│      │   <Bookshelf />  <DeskDecor />  <WallDecor />  <Chair />       │
│      │                                                                │
│      ├── B. CYBER DETAIL  (new — anchors the cyber identity)          │
│      │   ├── <ServerRack />   (chassis + instanced blink-LEDs)        │
│      │   ├── <CableBundle />  (extruded cylinders)                    │
│      │   └── <ExternalHDDTower />                                     │
│      │                                                                │
│      ├── C. WALL CONTENT  (new — informational density)               │
│      │   ├── <Whiteboard />   (canvas-texture: ATT&CK matrix)         │
│      │   ├── <WallClock />    (analog hands via useFrame, gated)      │
│      │   └── <FramedCert />   (canvas-texture, reuses WallDecor recipe)│
│      │                                                                │
│      ├── D. WARMTH  (new — kills "showroom" feel)                     │
│      │   ├── <Books />        (instancedMesh on bookshelf)            │
│      │   ├── <PottedPlant />                                          │
│      │   ├── <BiasLight />    (emissive plane behind monitor)         │
│      │   └── <UnderDeskLED /> (emissive plane under desk top)         │
│      │                                                                │
│      ├── E. BED CORNER  (new — lived-in)                              │
│      │   ├── <Bed />                                                  │
│      │   ├── <Nightstand />                                           │
│      │   └── <BedsideLamp /> (geometry only; light is in <Lighting>)  │
│      │                                                                │
│      ├── F. <Cat />  (new — breathing animation, reduced-motion gated)│
│      │                                                                │
│      └── G. SECONDARY DEVICES  (new — optional within v1.1)           │
│          ├── <Laptop />        (open lid + glowing screen)            │
│          ├── <SDRDongle />                                            │
│          └── <SecondaryMonitor /> (optional; static screen, no <Html>)│
└──────────────────────────────────────────────────────────────────────┘

State (unchanged):
  zustand useTabStore   — MonitorTab (5 tabs)
  URL ?view= ?focus=    — single source of truth for shell + focus
  useReducedMotion()    — gates every per-frame animation
  PerformanceMonitor    — gates postprocessing chunk
```

## Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|---------------|----------------|
| `<WallBack/Left/Right>` | Bound the room on three sides; backdrop for wall content | `<planeGeometry>` per wall; one-sided meshStandardMaterial, dark surface tone |
| `<Ceiling>` | Cap the top; receives the `<CeilingLight>` emissive plane | Single inward-facing plane at y=3.0 |
| `<Window>` | Foggy night-city look at the back-left wall; defines a single bright light source motivation | Canvas-texture plane (reuses `WallDecor` recipe) inside a thin frame; optional horizontal-slat group for blinds |
| `<ServerRack>` | Visual "cyber identity" anchor near the desk | Box chassis + `<instancedMesh>` of ~12 LED tiles; one `useFrame` loop drives all blink phases |
| `<Whiteboard>` | Renders ATT&CK matrix or kill-chain as a 2D drawing | Canvas-texture module in `src/scene/textures/`; consumed by single component |
| `<WallClock>` | Analog clock with second/minute hands rotating in real time | `useFrame` reads `Date.now()`; rotation only on hand groups; reduced-motion → freeze |
| `<Books>` | Real-looking book spines on the existing `<Bookshelf>` | `<instancedMesh>` with per-instance color matrix; instanced because ~20-30 spines |
| `<BiasLight>` | Emissive plane behind monitor; reads as ambient back-glow | Reuses existing emissive recipe (see `WallDecor.NeonStrip`); no point light needed |
| `<UnderDeskLED>` | Emissive strip under desk top | Same pattern as `<BiasLight>` |
| `<Cat>` | Procedural cat geometry (sphere+cone+cylinder), gentle breathing | `useFrame` scales body group on y; reduced-motion → frozen |
| `<Bed>` | Mattress + base + pillow + sheet | All `<boxGeometry>`; no skinned mesh |
| `<BedsideLamp>` | Lamp geometry (reuses `<Lamp>` component) | Import `<Lamp>` with different position/rotation; light handled centrally in `<Lighting>` |

## Recommended File Structure

```
src/scene/
├── (existing — keep flat)
│   Floor.tsx, Desk.tsx, Monitor.tsx, MonitorOverlay.tsx, Bookshelf.tsx,
│   Lamp.tsx, Chair.tsx, DeskDecor.tsx, WallDecor.tsx, Controls.tsx,
│   FocusController.tsx, Lighting.tsx, Workstation.tsx, colors.ts,
│   cameraPoses.ts
│
├── (new — flat additions; the convention is flat <PascalCase>.tsx per "thing")
│   WallBack.tsx, WallLeft.tsx, WallRight.tsx, Ceiling.tsx, Window.tsx,
│   ServerRack.tsx, CableBundle.tsx, ExternalHDDTower.tsx,
│   Whiteboard.tsx, WallClock.tsx, FramedCert.tsx,
│   Books.tsx, PottedPlant.tsx, BiasLight.tsx, UnderDeskLED.tsx,
│   Bed.tsx, Nightstand.tsx, Cat.tsx,
│   Laptop.tsx, SDRDongle.tsx, SecondaryMonitor.tsx (optional)
│
└── textures/                                ← NEW SUBFOLDER (one)
    ├── attackMatrix.ts      (exports a usePaintedTexture-style hook)
    ├── windowNightCity.ts
    └── certFrame.ts
```

### Structure Rationale

- **Stay flat in `src/scene/`.** The codebase convention is one `<PascalCase>.tsx` per scene primitive, all siblings. v1.0 ships 9 such files. Adding 15-18 brings the total to ~25. That's still well under the "split it" threshold for a 5-file editor sidebar; grouping into `room/`, `cyber/`, `comfort/` would create import-path churn for zero comprehension benefit since every consumer is `Workstation.tsx`. Keep flat.
- **One subfolder exception: `src/scene/textures/`.** Canvas-texture authoring is a different kind of thing — it produces a `CanvasTexture` instance, not a `<mesh>`. Extracting it from the component (as `WallDecor.tsx` did inline) has two wins: the component file stays focused on layout/geometry, and the texture module can grow without bloating the consumer. The wallpaper poster in `WallDecor.tsx` is the precedent we **break here** — that inline pattern was fine for one texture but does not scale to 3+ textures. Move texture authoring to `src/scene/textures/<name>.ts` exporting a `useXTexture()` hook; refactor `WallDecor`'s inline `usePosterTexture` into `textures/wallPoster.ts` as part of the room-shell phase or in a small follow-up so all canvas textures live in one place.

## Architectural Patterns

### Pattern 1: Procedural Primitive Component

**What:** A single `.tsx` file that exports one `function Foo()` returning a `<group>` of `<mesh>` primitives, all using `SCENE_COLORS` constants or local neon literals (matched to `WallDecor`'s `NEON_CYAN`). Comment header documents source, world coordinates, and any non-obvious geometry decisions.

**When to use:** Every new v1.1 component (A through G).

**Trade-off:** Bias is "boring and readable" over "clever and DRY." Don't introduce a `<RoomWall direction="left" />` mega-component to deduplicate three nearly-identical walls — three sibling files is fine and ships faster. The codebase's `Lamp.tsx` (~50 LOC) is the size target. If a component grows past ~150 LOC, split sub-shapes into private function components inside the same file (see `DeskDecor.tsx`'s `Keyboard`/`Mouse`/`Mug`/`TowerPC` pattern).

**Example (skeleton):**
```typescript
// src/scene/WallBack.tsx
//
// Back wall of the room. Plane at z = -1.6 m, 6 m wide × 3 m tall.
// One-sided geometry; only renders when camera is on the inside.
// Surface tone matches Floor.tsx so corners read as one space.
//
// Source: research/ARCHITECTURE.md § Pattern 1; Plan 05-xx Task A.

import { SCENE_COLORS } from './colors';

export function WallBack() {
  return (
    <mesh position={[0, 1.5, -1.6]} receiveShadow>
      <planeGeometry args={[6, 3]} />
      <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}
```

### Pattern 2: Canvas-Texture Hook

**What:** A `useXTexture()` hook in `src/scene/textures/<name>.ts` that returns a `CanvasTexture | null`, wrapped in `useMemo` with empty deps, with cleanup. The component consumes it and applies as `material map={tex}`.

**When to use:** `<Whiteboard>` (ATT&CK matrix), `<Window>` (foggy night-city silhouette), `<FramedCert>`, and as the refactor target for `WallDecor`'s existing inline texture code.

**Trade-off:** Canvas drawing happens once at mount, costs ~5-10 ms per texture, and the resulting `CanvasTexture` is allocated on the GPU once. Don't write canvas-texture code inside `useFrame` — there's no use case for that here. SSR-safety guard (`typeof document === 'undefined'`) is already in the WallDecor recipe — keep that pattern.

**Example signature:**
```typescript
// src/scene/textures/attackMatrix.ts
import { useMemo, useEffect } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

export function useAttackMatrixTexture(): CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    // … draw the ATT&CK grid + tactic headers + technique cells …
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    return tex;
  }, []);
}
```

The hook returns the texture; the consumer is responsible for disposal:
```typescript
const tex = useAttackMatrixTexture();
useEffect(() => () => tex?.dispose(), [tex]);
```
(Same as `WallDecor.WallPoster` does today.)

### Pattern 3: Per-Frame Animation with Reduced-Motion Gate

**What:** Any `useFrame` callback that drives visible motion checks `useReducedMotion()` at hook level (NOT inside the frame callback — a re-render isn't free, but the early-return cost is) and either skips the update entirely or freezes to a sensible "still" state.

**When to use:** Cat breathing (F), Server rack LED blink (B), Wall clock hands (C). Do NOT use for static emissive surfaces (bias light, under-desk LED, neon strip) — those are pure material properties and require no animation.

**Trade-off:** Three per-frame animation consumers across the scene is well within budget — none of these are doing significant CPU work. The pattern that already exists for `WhoamiGreeting` (DOM-side typing animation gated by `useReducedMotion`) is the same shape; reuse the mental model.

**Example:**
```typescript
// src/scene/Cat.tsx
const reduced = useReducedMotion();
const bodyRef = useRef<THREE.Group>(null);

useFrame(({ clock }) => {
  if (reduced) return;
  if (!bodyRef.current) return;
  // 0.3 Hz sine wave ⇒ ~3.3 s period; ±2% scale on y so it's gentle.
  const t = clock.getElapsedTime();
  bodyRef.current.scale.y = 1 + Math.sin(t * 2 * Math.PI * 0.3) * 0.02;
});
```

**Critical:** `frameloop="demand"` is in use. `useFrame` consumers force the loop to run every tick; that's by design when motion is intended, but for the cat alone it'd burn frames continuously. Two options, in order of preference:

1. **Cluster the per-frame consumers behind a single `<AnimationDriver>` component** that owns the cat-breath, server-LEDs, and wall-clock-tick updates with a shared `useFrame`. This is a real "demand-loop" win — one consumer keeps the loop alive, not three.
2. **Accept three consumers** for now and revisit if the perf HUD shows it.

Pick option 2 for v1.1 simplicity. If `r3f-perf` shows the demand loop never sleeping, regroup to option 1.

### Pattern 4: Instanced LEDs and Books

**What:** Use `<instancedMesh>` (via drei `<Instances>` + `<Instance>` for ergonomics) when a component renders 10+ near-identical primitives with different positions/colors.

**When to use:** Server rack LEDs (~12), bookshelf books (~20-30). Do NOT use it for low-count primitives (e.g., 3 cable bundles, 4 wall clock numerals) — `<instancedMesh>` adds bookkeeping overhead that beats out individual meshes only past ~10 instances.

**Trade-off:** Drei's `<Instances><Instance/></Instances>` is the declarative wrapper around `THREE.InstancedMesh`; the API is React-idiomatic and the per-instance color via `<Instance color="…" />` is one line. The cost vs. plain meshes is: shared material (all instances share one `meshStandardMaterial`), which is fine for books (each spine can differ in color/scale via instance attributes) and fine for LEDs (all share the cyan emissive look; per-instance blink phase is driven by adjusting the instance matrix or the color attribute).

**Example shape (server rack LEDs):**
```typescript
// src/scene/ServerRack.tsx
import { Instance, Instances } from '@react-three/drei';

const LED_POSITIONS: ReadonlyArray<[number, number, number]> = [
  /* 12 positions … */
];

function BlinkLEDs() {
  const reduced = useReducedMotion();
  const instancesRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    if (reduced || !instancesRef.current) return;
    const t = clock.getElapsedTime();
    // For each LED, set per-instance color intensity from a per-LED phase.
    LED_POSITIONS.forEach((_, i) => {
      const phase = (i * 0.137) % 1; // pseudo-random spread
      const lit = Math.sin(t * 1.5 + phase * 6.28) > 0.2 ? 1.0 : 0.15;
      // mutate the instance color attribute via instancesRef …
    });
  });

  return (
    <Instances ref={instancesRef} limit={LED_POSITIONS.length}>
      <planeGeometry args={[0.006, 0.006]} />
      <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" toneMapped={false} />
      {LED_POSITIONS.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  );
}
```

### Pattern 5: OrbitControls Bounds for a Closed Room

**What:** For a 6 m × 4 m × 3 m room, the OrbitControls clamps in `Controls.tsx` need three things: a tighter `maxDistance`, an enforced `minDistance`, and a `target` close enough to a stationary point inside the desk-island that orbiting never pushes the camera through a wall.

**Decision:** Tighten the existing clamps. Do not introduce a separate "outside the room" / "inside the room" mode.

| Clamp | Current (v1.0) | v1.1 | Reason |
|-------|----------------|------|--------|
| `minPolarAngle` | `π/3` (~60°) | `π/3` | Unchanged — keeps camera above floor |
| `maxPolarAngle` | `100°` | `100°` | Unchanged — already prevents floor dive |
| `minAzimuthAngle` | `-π/2` | `-π/2` | Unchanged — keeps camera on the front 180° of the room |
| `maxAzimuthAngle` | `+π/2` | `+π/2` | Unchanged |
| `minDistance` | `1.2 m` | `1.2 m` | Unchanged |
| `maxDistance` | `4.0 m` | `2.6 m` | **Tighten.** Room half-diagonal from desk to back-left corner ≈ √(3² + 1.6²) ≈ 3.4 m. A `maxDistance` of 4 will clip the back wall. 2.6 keeps the camera comfortably inside. |

The OrbitControls `target` stays at `[0, 0.85, 0]` (desk-island center, slightly above floor) so all orbiting happens around the desk; the camera physically cannot reach the back wall.

**Critical:** Do **not** try to clamp via collision with wall geometry. OrbitControls doesn't support that, and writing a frame-by-frame raycast against walls is over-engineering for a portfolio. The distance-clamp is the right shape.

**Bed/cat camera pose question (the explicit ask):** Stay with **one overview pose**. Reasoning:
- The bed sits inside the same room; tighter `maxDistance` plus a slight azimuth swing already lets the overview camera see it without a dedicated pose.
- A second overview pose would require a UI affordance to switch (extra button, new `?focus=bed` value, new state in `FocusController`). That's complexity for marginal value — a recruiter is not the audience for "look at my bed."
- The cat is a discoverability easter egg; the user finding it via free-look is the intended experience, not a focus-button.

If after wiring everything up the bed feels under-displayed in the overview pose, the cheapest fix is to nudge the `DEFAULT_ORBIT_POSE` slightly (move position from `[1.4, 1.6, 1.6]` to `[1.6, 1.6, 1.8]` or similar) — that's a tuning constant, not a new pose.

### Pattern 6: Static-Boolean-Driven Composition (no new state)

**What:** New v1.1 components are pure visual children of `<Workstation>`. They render based on prop-drilled `focused` or no props at all. They do **not** read or write `tabStore`.

**Rationale (the question):** No new component in v1.1 needs zustand. The store exists to bridge the Canvas/DOM boundary for the monitor tab surface. Nothing else has that bridge requirement:
- Bed, cat, server rack, wall content: render once, never change tab/focus state.
- Cable bundle, plants, LED strips: pure decoration.
- Window: static texture.
- Secondary monitor (if added): could render a small `<Html>` overlay with a tiny snippet of static text (e.g. "wireshark"), but that's a one-direction render — no shared state needed.

If you find yourself reaching for `useTabStore` from a v1.1 component, **stop and ask why** — there's almost certainly a simpler answer (prop, derive from URL, hard-code).

## Lighting Recomposition (the most load-bearing call)

### Current lighting (v1.0)
- 1 `<ambientLight>` (cool blue, intensity 0.18)
- 1 `<directionalLight>` (key, intensity 0.45, with shadow map)
- 1 `<pointLight>` cyan accent behind monitor
- 1 `<pointLight>` warm at lamp bulb
- **Plus emissive materials** on monitor screen, neon strip, keyboard backlight, tower power LED, lamp bulb sphere (these are not "lights" in the Three.js sense — they contribute to Bloom but cost ~nothing per frame)

### v1.1 proposed lighting
- Keep ambient + directional + cyan-monitor-accent + warm-lamp = **4 dynamic lights baseline**
- Add **at most 2** new dynamic lights:
  - 1 dim warm `<pointLight>` at the bedside lamp position (justifies the bed corner)
  - 1 cool `<pointLight>` near the window (justifies the foggy-night silhouette)
- **Do NOT add point lights** for: ceiling light (use one wide-radius hemisphere or a directional from above; better, just use an emissive ceiling-plane material), server rack LEDs, bias light, under-desk LED, under-rack glow. All of those are **emissive surfaces** picked up by Bloom in postprocessing.

### Three.js point-light reality check (HIGH confidence — verified via Three.js forum + community consensus)

| Light count | What happens |
|-------------|--------------|
| ≤ 4 dynamic (any type), 1 with shadows | Fine everywhere, including low-end mobile |
| 5-8 dynamic, ≤2 with shadows | Fine on desktop; mobile starts paying noticeable per-frame cost |
| 9-12 with shadows | Mobile breaks. Point-light shadows render 6× (one per cube face) — two shadowed point lights on 10 shadow-casters = 120 extra draw calls. WebGL register exhaustion possible. |
| > 12 lights | Lighting can silently break on some mobile GPUs (register limit) |

Target: stay at **6 dynamic lights with exactly 1 shadow-caster (the directional)**. Everything decorative is emissive material + Bloom.

### Lighting tier-gating recommendation

**Do not** wire a "lighting count" tier flip. The current `PerformanceMonitor` gates postprocessing as a binary mount/unmount. Wiring it to also conditionally render lights creates a worse user experience (sudden change in scene appearance) for marginal perf win, because: (a) we're staying inside the safe light count above anyway; (b) emissive materials still render without postprocessing — they just look less glowy.

If a future profile shows lighting is the bottleneck (it won't, given the recipe above), the right move is to **drop a single point light** for low-tier devices via the existing `PerformanceMonitor` pattern — not to dynamically rebalance.

## Data Flow

### Render flow (unchanged)

```
URL ?view=3d
    ↓
<App> capability gate
    ↓ (pass)
<ThreeDShell>
    ↓
<Canvas frameloop="demand">
    ↓
<Lighting/>  <Controls/>  <FocusController/>  <ScenePostprocessing/>
    ↓
<Workstation focused={…} onMonitorClick={…}>
    ↓
[Room shell] [Desk island] [Cyber] [Wall content] [Warmth] [Bed corner] [Cat] [Secondary]
```

### State flow (unchanged for v1.1)

```
URL ?focus=<tab>
    ↑↓
useTabStore.activeTab          ← FocusController syncs both directions
    ↓
<MonitorTabs> in <MonitorOverlay> in <Monitor>
```

No new state flows. The new components are render-only.

### Animation flow (new, small)

```
clock.elapsed (R3F)  →  useFrame consumers (gated by useReducedMotion)
                        ├── <Cat>       (body.scale.y sine)
                        ├── <ServerRack BlinkLEDs>  (per-LED color)
                        └── <WallClock> (Date.now → hand rotations)
```

If `prefers-reduced-motion` is set: all three skip their updates and remain at a sensible still state (cat scale = 1, LEDs at half-lit, clock hands at last-painted time).

## Scaling Considerations

This is a static portfolio scene with a stable visitor model (one viewer at a time, no server). Traditional scaling axes don't apply. The relevant axes are:

| Axis | At v1.0 | At v1.1 target | At "if v2 added more" |
|------|---------|---------------|---------------------|
| Draw calls | ~80 | ~140-180 (add walls + ~20 decor) | ~250 starts to hurt mobile; use instancing |
| Dynamic lights | 4 | 6 (+2 max) | 8 = mobile pain line |
| Per-frame consumers (`useFrame`) | 0 | 1-3 (cat, LEDs, clock) | Cluster behind one driver when > 5 |
| Triangles | ~5-10k | ~20-30k (rough estimate for the room + decor) | 100k = mobile pain line |
| GLB assets | 0 (procedural) | 0 (procedural) | If v2 swaps to GLB, KTX2 + draco mandatory |
| Bundle size budgets | 6 budgets in size-limit | Unchanged — no new deps planned | If new dep added, budget MUST be updated in same PR |

The size-limit budgets in `package.json` are the **enforcement boundary** for "we accidentally added something heavy." Do not loosen those budgets without a written justification. Adding a new component file is free in bundle terms; adding a new dep is not.

## Anti-Patterns to Avoid

### Anti-Pattern 1: "Big atmosphere" lighting

**What people do:** Add a hemisphere light, a fill light, a kicker light, a window-sun light, a bedside light, a ceiling light, a rack LED point light, an under-desk LED point light = 10+ dynamic lights.

**Why wrong:** Mobile WebGL breaks past ~8 lights with shadows; even without shadows, fragment shader cost grows linearly. The visual difference between 6 well-placed lights and 12 is barely perceptible inside a dark room; the perf gap is large.

**Do instead:** Emissive materials + Bloom. The neon strip, monitor backlight, LED strip patterns in v1.0 are the template — Bloom amplifies them so they read as light sources without actually casting light.

### Anti-Pattern 2: New zustand slice for every new section

**What people do:** Add `useRoomStore` with flags for "rack LEDs enabled," "cat visible," "blinds open," "bedside lamp on." Every component subscribes.

**Why wrong:** None of those flags change in response to anything. They're constants. Subscribing to a constant is overhead with no benefit, and the store becomes a junk drawer.

**Do instead:** Hard-code visual state in the components. If a flag truly needs to be user-toggleable later, add it then — not now.

### Anti-Pattern 3: Camera bound = wall collision raycast

**What people do:** On every frame, raycast from camera toward all walls; if too close, push camera back. Implements "physically realistic" room constraints.

**Why wrong:** Frame-by-frame raycasting for camera collision in `useFrame` is real CPU work, OrbitControls fights against it (target keeps trying to interpolate back), and edge cases (camera inside a wall after fast drag) require additional restitution. Massive complexity for a portfolio that has one cameraman.

**Do instead:** Tighter `maxDistance` clamp (Pattern 5 above). Cheap, works, done.

### Anti-Pattern 4: Visual logic inside `useFrame` that doesn't need to be there

**What people do:** Drive blink LEDs by `useFrame` updating `emissiveIntensity` from a sine wave that's almost-constant (e.g., `1 + 0.05*sin(t)`), or have the clock hands recompute layout (text, numerals) every frame.

**Why wrong:** Wastes the demand-loop ticks. The demand loop is supposed to sleep when nothing changes; if you're keeping it awake for invisible animation, you've lost the perf budget that gating provides.

**Do instead:** If the animation is too subtle to see, drop it. If it's worth seeing, make it visible (clear blink phases, ±2% scale, real second-hand tick). And cluster multiple animators behind one driver as discussed in Pattern 3.

### Anti-Pattern 5: New camera pose per new "interesting thing"

**What people do:** Add `BED_POSE`, `RACK_POSE`, `CAT_POSE`, `WHITEBOARD_POSE` to `cameraPoses.ts`. Wire `?focus=bed`, `?focus=rack`, etc., into `FocusController`. UI sprouts buttons.

**Why wrong:** v1.0 already shipped the simplification work to **collapse three poses down to two** (HS-redesign Task 3). Re-fragmenting them undoes that. The overview pose's job is to show "here's the room" with one drag for orientation, not "here's the bed in detail."

**Do instead:** Single overview pose, single focused-on-monitor pose. Period.

## Integration Points

### Existing components that v1.1 MODIFIES

| File | Change | Reason |
|------|--------|--------|
| `src/scene/Workstation.tsx` | Add ~15 new child component imports + JSX | Composer pattern — this is its job |
| `src/scene/Controls.tsx` | Tighten `maxDistance` from 4.0 → 2.6 | Room shell needs camera kept inside |
| `src/scene/Lighting.tsx` | Add up to 2 dim `<pointLight>` (bedside + window) | Motivate bed corner and window |
| `src/scene/WallDecor.tsx` | (Optional refactor) Extract inline texture code to `src/scene/textures/wallPoster.ts` | Pattern 2 consistency once 2+ canvas textures exist |

### Existing components that v1.1 LEAVES ALONE

- `src/app/App.tsx`, `src/shells/TextShell.tsx`, `src/shells/ThreeDShell.tsx`
- `src/scene/Monitor.tsx`, `MonitorOverlay.tsx`, `FocusController.tsx`, `cameraPoses.ts`, `Floor.tsx`, `Desk.tsx`, `Bookshelf.tsx`, `Lamp.tsx`, `Chair.tsx`, `DeskDecor.tsx`
- `src/store/tabStore.ts`, `src/ui/MonitorTabs.tsx`
- `src/3d/PostFX.tsx`, `src/3d/ScenePostprocessing.tsx`
- `src/content/*`, `src/sections/*`, `src/lib/*`
- `vite.config.ts`, size-limit budgets

If a v1.1 phase finds it "needs to" modify any of the leave-alone list, that's a yellow flag — either the design is regressing v1.0 (e.g., re-fragmenting camera poses) or the phase is doing too much.

### External / build pipeline

- **No new npm deps.** All v1.1 categories A-G are achievable with the shipped stack (R3F, drei, three, zustand). If a category genuinely needs something (e.g., extruded book spines using a complex curve), prefer a hand-rolled procedural over adding a dep. If a dep is unavoidable: file a separate research task before adding.
- **No build-pipeline changes.** vite.config.ts, MDX setup, chunkFileNames, 404.html copy — all unchanged.
- **Asset pipeline.** No new GLBs in v1.1 (I — write-ups + GLB — keeps the GLB swap as an explicit follow-up, but Plan 04-06 already documents the gltfjsx workflow if you go down that road).

## Build Order Recommendation

The natural shape is **structural first → anchors second → decoration third → animated last → content close last**. Mapping to plan-phase chain:

| Phase | Content | Why this order | Autonomous? |
|-------|---------|---------------|-------------|
| **Phase 5** | **A. Room shell + Controls clamp tighten + lighting baseline** (walls, ceiling, window-as-static-texture, tighter `maxDistance`, optional bedside `<pointLight>` placeholder) | Defines bounds for everything else. Must ship first because every subsequent component places relative to walls. Test now: does overview pose still look right? Does camera stay inside? Are existing v1.0 components still well-framed? | autonomous: true (visual + measurable) |
| **Phase 6** | **B. Cyber detail + E. Bed corner** (server rack, cable bundle, HDD tower; bed + nightstand + bedside lamp geometry) | Large anchor objects that occupy floor space. Wiring them next means decor in later phases can be placed knowing what's already there. Rack on rack-side wall, bed on opposite side; balances composition. | autonomous: true |
| **Phase 7** | **C. Wall content + D. Warmth** (whiteboard with ATT&CK matrix, framed cert, wall clock; books, plant, bias light, under-desk LED) | Surface decoration. Now that A+B+E are placed, the wall planes have clear empty regions begging for content; the bookshelf has a known target for instanced books. Includes the canvas-texture-folder refactor that's been deferred. | autonomous: true |
| **Phase 8** | **F. Cat + G. Secondary devices** (cat with breathing useFrame; optional laptop / SDR / secondary monitor) | The "easter egg + optional polish" phase. Done last because: cat placement depends on bed/window from earlier phases; secondary devices are the most droppable scope if v1.1 is running long. | autonomous: true |
| **Phase 9** | **H. Plan 04-08 human sign-off close** (OG image, Lighthouse median-of-3, Web3Forms delivery test Gmail+Outlook, real-device QA iOS+Android, named peer reviews) | Inherited from v1.0; cannot be automated; must run after the visible-scope work is done so the QA round captures the final v1.1 state. | autonomous: false (human-only; follows the 04-08 checklist model) |
| **Phase 10** | **I. Write-ups + GLB reattempt** (2-3 MDX write-ups dropped into `src/content/writeups/`; reattempt real GLB workstation V2-3D-01 OR formally promote to v1.2) | Write-ups are content authoring (autonomous: false — depends on real labs being run). GLB reattempt is technical (autonomous: true) but optional within v1.1 — if scope is tight, promote to v1.2 and ship v1.1 without it. | mixed: write-ups autonomous: false; GLB autonomous: true |

**Why not interleave H/I with visual phases?** Because (a) H is a QA pass that wants the final state, not intermediate states — running Lighthouse halfway through v1.1 wastes the run; (b) I is content authoring that depends on real cyber lab work, which is unrelated to visual phases and bottlenecked on Eren's lab time, not on the codebase. Keep them at the end where they don't block visual work.

**Optional split of Phase 10:** If `I` slips on lab availability (the "no fabrication" rule binds; real labs take real time), shipping v1.1 with **only** the visual phases + H is acceptable. CNT-02/CNT-03 stay open, V2-3D-01 stays open, and v1.2 picks them up. The roadmap should reflect this — phase 10 is a single phase but its two sub-tracks can ship independently.

## Test Strategy

### v1.0 baseline (for reference)
- Unit tests: capability gate, identity rendering, obfuscation round-trip, contact form post, tab store, colors mirror parity
- No tests: Lamp, Chair, DeskDecor, WallDecor visuals; OrbitControls clamp values; FocusController GSAP timeline
- Approach: visual regressions caught by eye + manual screenshots; automated tests focus on **logic and contracts**

### v1.1 recommendation

**Rule:** Follow the v1.0 convention. New visual components are **not** unit-tested. Smoke-render tests in jsdom would fail (no WebGL), and snapshot tests of R3F JSX trees are brittle without catching the actual visual regression.

**What to test:**
1. **Pure logic only.** If a v1.1 component contains a non-trivial function (e.g., the LED phase calculation, the ATT&CK canvas drawing helper, a procedural book-color generator), extract that function to a sibling utility module and unit-test the function. Example: `src/scene/textures/attackMatrix.ts` exports a `drawAttackMatrix(ctx)` function — test the function with a fake canvas context that records call counts/argument shapes.
2. **The OrbitControls clamp change.** Add one test asserting the clamp object has `maxDistance: 2.6` (catches accidental edit-undo). Same pattern as the existing `colors.test.ts` (which asserts hex parity with `tokens.css`).
3. **The component renders without throwing in import.** Optional, low-value: a single test file `src/scene/v11Components.smoke.test.tsx` that imports every new component and asserts the module loads. Catches typo-level mistakes; not catching real bugs but cheap insurance.

**What NOT to test:**
- The cat's breathing math.
- The server rack LED blink pattern.
- The whiteboard canvas pixel output.
- The wall clock hand rotations.
- Any geometry positions, sizes, or rotations.

These should be visually verified in the browser. The Playwright smoke test from the OPS-02 budget set (text shell loads in <5s) is the right altitude — verify that the 3D shell loads and that the toggle works; don't try to assert the cat is at `[1.2, 0.6, -1.0]`.

**One addition worth considering:** A `size-limit` budget entry for the 3D-shell chunk that includes v1.1's new geometry. If the new components push the chunk past the budget, CI catches it. This is in line with v1.0's discipline.

## Sources

- Codebase files inspected:
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Workstation.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Lamp.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Chair.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/DeskDecor.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/WallDecor.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/FocusController.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/cameraPoses.ts`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Controls.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Lighting.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Floor.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Bookshelf.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/Monitor.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/scene/colors.ts`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/store/tabStore.ts`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/src/3d/ScenePostprocessing.tsx`
  - `/Users/erenatalay/Desktop/App/Portfolio_Website/.planning/PROJECT.md`
- Three.js forum: "Optimizing Point Lights" — https://discourse.threejs.org/t/optimizing-point-lights/36153 — HIGH confidence: corroborates ≤4 lights ideal, shadow-cost 6× for point lights
- Three.js forum: "Point lights and performance, revisited" — https://discourse.threejs.org/t/point-lights-and-performance-revisited/49316 — HIGH confidence: same body of community guidance
- GitHub issue mrdoob/three.js#8463 "PBR Light Limits" — HIGH confidence: register-limit failure mode past ~12 lights
- Discover three.js Tips & Tricks — https://discoverthreejs.com/tips-and-tricks/ — MEDIUM confidence: general "use as few direct lights as possible" guidance

---
*Architecture research for: v1.1 Room Build-Out + Pre-Launch Close (additive to v1.0 shipped state)*
*Researched: 2026-05-15*
