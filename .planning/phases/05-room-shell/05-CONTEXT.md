# Phase 5: Room Shell - Context

**Gathered:** 2026-05-15
**Status:** Ready for planning
**Mode:** `--auto` — all gray areas auto-resolved to research-recommended defaults; log appended below for audit.

<domain>
## Phase Boundary

Wrap the existing desk-island in a believable closed hacker room so every later v1.1 phase has a placement target. Ship:
- Three wall planes (left, right, back) and a ceiling.
- One window with horizontal blinds on the back wall, behind which a procedural canvas-texture night-city pattern renders (OPSEC-clean — no real photos, no identifiable skyline).
- One new `<pointLight>` for a recessed ceiling fixture.
- `src/scene/emissiveBudget.ts` as the single source of truth for emissive-intensity ceilings used by every v1.1 emissive component.
- `Controls.tsx` `maxDistance` tightened from `4.0` → `2.6` so the camera cannot escape the new room bounds.

Requirements covered: ROOM-01, ROOM-02, ROOM-03, ROOM-04.

**Out of scope (defer to later phases or v1.2):** door (v1.2), additional point lights beyond the ceiling fixture, animated blinds, real-photo window backdrops, drop ceiling / acoustic panels, real-time clock (Phase 7 owns clock, frozen).

</domain>

<decisions>
## Implementation Decisions

### Room Geometry (D-01..05)

- **D-01:** Room dimensions **4 m wide × 5 m deep × 2.6 m high** (world units = meters). Width and depth chosen so the existing desk + bookshelf + chair fit with breathing room; height matches the new OrbitControls `maxDistance` clamp.
  - *Auto-selected:* residential proportions over loft proportions (camera maxDistance 2.6 already implies small-ish room).
- **D-02:** Wall and ceiling geometry: `BoxGeometry` with **0.05 m thickness** (not zero-thickness `PlaneGeometry`) — avoids back-face Z-fighting if camera ever clips a corner.
- **D-03:** Wall placement — back wall behind monitor at `z = -2.5`, left wall at `x = -2.0`, right wall at `x = +2.0`, ceiling at `y = 2.6`. Floor stays at `y = 0` (existing `Floor` component).
- **D-04:** No door — explicitly out of scope (REQUIREMENTS.md v1.1 exclusion). Room reads as closed.
- **D-05:** Wall material — `MeshStandardMaterial` matte, `roughness = 0.95`, `metalness = 0` (no PBR drama; lights bounce off softly).

### Color Palette (D-06..09)

- **D-06:** Wall color **`#0c0e12`** — a new token between v1.0's `bg #0d1117` and `surface-1 #161b22`. Slightly darker than `bg` so the desk reads as "lit", walls recede.
  - Add to `src/scene/colors.ts` as `SCENE_COLORS.wall`. Mirror as `--color-wall` in `src/styles/tokens.css` (DOM unused but keeps drift test consistent).
- **D-07:** Ceiling color: same as wall color (`#0c0e12`). No separate ceiling tone — simpler, consistent.
- **D-08:** Blinds color **`#c8cdd4`** (cool off-white aluminum). Subtle contrast against dark wall; reads as real venetian-blind metal.
- **D-09:** Window-pane glass: extremely faint blue tint (`#0a1418`, `transparent: true`, `opacity: 0.6`) — implies "you're looking through glass", not just a hole in the wall.

### Window + Blinds (D-10..15)

- **D-10:** Window placement — **back wall, offset right** at `(x = +0.6, y = 1.4, z = -2.5)`. Left side of back wall is already busy with Bookshelf; right side is comparatively empty.
- **D-11:** Window dimensions **1.2 m wide × 1.5 m tall**. Reads as residential window; not a panoramic loft window (would dominate composition) and not a porthole (would feel cramped).
- **D-12:** Blinds orientation **horizontal slats** (apartment/bedroom convention). Vertical blinds read "office building"; the room is supposed to read "lived in".
- **D-13:** Blinds posture **half open (~60%)** — slats tilted enough to clearly read as venetian-blinds while the canvas-texture night-city behind is partially visible through gaps.
- **D-14:** Slat count and geometry — 14 slats, each a thin `BoxGeometry(1.2, 0.025, 0.012)` tilted ~30° around the X axis. Total: 14 meshes (negligible perf).
- **D-15:** Blinds parent group has a single Y-position to allow future "raise/lower blinds" animation; in v1.1 the position is static (animated open/close explicitly out of scope per REQUIREMENTS.md).

### Night-City Canvas Texture (D-16..19)

- **D-16:** Texture resolution **1024 × 1024** (research STACK.md "Hidden risk: cap textures at 1024×1024" — matches exactly).
- **D-17:** Pattern style — **silhouette skyline + sparse window lights**. Build at canvas-author time:
  1. Vertical-gradient dark-blue background (`#02050a` top → `#06101a` bottom).
  2. Black building silhouette horizon (procedural rectangles of varying widths and heights along the bottom 40%).
  3. ~80 randomly-placed `2 × 2 px` yellow-ish window dots inside the silhouettes (#f3d27a, 80% opacity).
  4. Optional sparse `4 × 4 px` distant red aircraft warning lights at top edges of taller buildings (~5 of them).
- **D-18:** OPSEC affirmation header — every line in the canvas authoring code MUST be deterministic (`Math.seedrandom('eren-portfolio-v1.1')` or equivalent stable seed) so the texture is reproducible and provably non-photographic. Component file header comment cites this explicitly.
- **D-19:** Texture lifecycle — generated once at module-load time via a `useMemo`/cached singleton inside `Window.tsx`; never regenerated on render. `texture.dispose()` not called (texture lives for the canvas lifetime).

### Ceiling Light (D-20..22)

- **D-20:** Type **recessed flush fixture** — a thin emissive disc embedded in the ceiling plane + one `<pointLight>` below it. Disc geometry: `CylinderGeometry(0.12, 0.12, 0.02)` flat against the ceiling at `(0.0, 2.59, 0.0)`.
- **D-21:** Light **cool white**, color `#d4dce4`, intensity `0.3`, distance `4.0`, decay `2.0`. `castShadow = false` — the existing directional light is the project's only shadow-caster (per ARCHITECTURE.md: 1 shadow-caster cap). Position: same XYZ as the disc, slightly below at `(0.0, 2.55, 0.0)`.
- **D-22:** Emissive disc material — `MeshStandardMaterial` with `emissive: '#e8eef5'`, `emissiveIntensity` read from `emissiveBudget.CEILING_FIXTURE`. The emissive bloom does most of the visible "glow" work; the pointLight is fill only.

### emissiveBudget.ts (D-23..26)

- **D-23:** File location **`src/scene/emissiveBudget.ts`**. Named exports for each emissive surface in v1.1 (including v1.0-existing ones that are now formalized):
  ```ts
  export const EMISSIVE_BUDGET = {
    NEON_STRIP: 2.5,       // current WallDecor neon strip; toneMapped:false privilege
    MONITOR_SCREEN: 0.6,   // current Monitor emissive screen
    BIAS_LIGHT: 0.4,       // Phase 7 WARM-03; emissive plane behind monitor
    LED_STRIP: 0.35,       // Phase 7 WARM-04; under-desk strip
    RACK_LED: 1.2,         // Phase 6 CYB-02; Pi cluster activity LEDs (during blink-on)
    LAMP_BULB: 0.8,        // current Lamp bulb
    BEDSIDE_LAMP: 0.6,     // Phase 6 BED-03; warmer than ceiling
    CEILING_FIXTURE: 0.5,  // this phase; cool ceiling glow
  } as const;
  export type EmissiveSurface = keyof typeof EMISSIVE_BUDGET;
  ```
- **D-24:** Refactor existing emissive consumers to read from this constant where reasonable (Monitor, Lamp, WallDecor neon strip) — additive change; values match current behavior so nothing visually shifts. If a consumer's current value is significantly different, document it in plan as a deviation.
- **D-25:** `toneMapped={false}` privilege stays exclusive to NEON_STRIP — documented inline in the file with a one-line comment explaining why (it's the only surface that needs to "punch through" tonemapping for the cyan accent reading).
- **D-26:** No test required for the constants file itself (pure data), but the Phase 5 plan includes a smoke test that imports the symbol and asserts each value is a finite number in `[0, 10]` — catches accidental NaN/Infinity from a future refactor.

### Camera / OrbitControls (D-27..29)

- **D-27:** Update `src/scene/Controls.tsx` `maxDistance` from `4.0` → `2.6`. No other prop changes; existing `minDistance`, `minPolarAngle`, `maxPolarAngle`, `minAzimuthAngle`, `maxAzimuthAngle` retained.
- **D-28:** Validation in Phase 5 plan: both existing camera poses from `cameraPoses.ts` (`overview` and `focused-on-monitor`) must continue to frame correctly within the new clamp. If the focused pose ends up closer than `minDistance` (currently `1.2`), drop `minDistance` proportionally; if overview ends up at `> 2.6`, the clamp itself fails and we need to increase room depth.
- **D-29:** No new camera poses for bed / window / cat / rack — research ARCHITECTURE.md decision; HS-redesign already consolidated to overview + focused.

### File Structure (D-30..32)

- **D-30:** New components flat under `src/scene/`:
  - `src/scene/Walls.tsx` — three wall planes as a single component with subcomponents `<WallLeft />`, `<WallRight />`, `<WallBack />` exported optionally for inspection but rendered together by `<Walls />`.
  - `src/scene/Ceiling.tsx` — single ceiling plane + emissive fixture disc + ceiling pointLight.
  - `src/scene/Window.tsx` — frame + glass pane + blinds group + canvas-texture pattern (children: `<Blinds />`).
  - `src/scene/Blinds.tsx` — 14-slat venetian blinds group (separate file so it can be moved to its own module if v1.2 adds animation).
  - `src/scene/textures/nightCity.ts` — `createNightCityTexture()` pure function returning a `CanvasTexture`.
- **D-31:** New scene/textures/ subfolder — first time the project introduces a subfolder under `src/scene/`. Only canvas-texture authoring functions go here (Phase 7 will add `attackMatrix.ts` and `framedCert.ts`). Component files stay flat.
- **D-32:** All new files in PascalCase.tsx (matching v1.0 convention).

### Lighting Cap Validation (D-33)

- **D-33:** Phase 5 plan must enumerate the lighting count before and after:
  - **Before (v1.0 HS-redesign):** 1 directional (shadow) + 1 cool ambient + 1 dim key (?) + 1 cyan accent point + 1 warm lamp point = 4–5 dynamic lights total.
  - **After Phase 5:** above + 1 new ceiling pointLight = 5–6 dynamic.
  - **Cap:** 6 dynamic lights, 1 shadow-caster. If Phase 5 lands at exactly 6, Phase 6 (which adds 1 bedside lamp) will need to remove or convert an existing light. **Plan-phase MUST verify current count by reading `Lighting.tsx` and stop with a blocker if the cap is already exceeded.**

### Test Strategy (D-34)

- **D-34:** Per ARCHITECTURE.md v1.1 test rule — visual components not unit-tested. Unit-test only:
  - `emissiveBudget.ts` — all values finite and in range (Phase 5 plan).
  - `nightCity.ts` — `createNightCityTexture()` returns a `CanvasTexture` with the expected dimensions; not the pixel content (that's visually verified).
  - `Controls.tsx` clamp change — assert prop `maxDistance === 2.6` in a render test.

### Claude's Discretion

- Exact `position` and `rotation` of each component within the bounds set by D-03, D-10, D-20.
- Whether to extract a small `useEmissiveBudget` hook (probably overkill — direct import is fine).
- Whether the canvas-texture buildings use a fixed seed or `Date.now()` (fixed-seed is required per D-18 OPSEC affirmation; flagged here as locked).
- Whether to add a JSDoc block to `emissiveBudget.ts` exporting the rationale of each value (recommended — encourages future v1.2 emitters to read first).

### Folded Todos

None — `.planning/todos/pending/` is empty.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project artifacts
- `.planning/PROJECT.md` — v1.1 milestone scope (Current Milestone section); inherited v1.0 anti-feature list.
- `.planning/REQUIREMENTS.md` — Phase 5 owns ROOM-01..04; out-of-scope list (no real photos for window, no door in v1.1).
- `.planning/ROADMAP.md` §"Phase 5: Room Shell" — goal + success criteria + dependencies.

### Research
- `.planning/research/SUMMARY.md` — executive synthesis; build order rationale.
- `.planning/research/STACK.md` — no new runtime deps; canvas-texture cap 1024×1024.
- `.planning/research/ARCHITECTURE.md` §"OrbitControls fix" — `maxDistance` 4.0 → 2.6; §"Lighting cap" — 6 dynamic + 1 shadow-caster; §"Build order" — Phase 5 first because every later phase places relative to walls.
- `.planning/research/PITFALLS.md` §5 — window OPSEC leak prevention (procedural-only); §11 — performance budget creep monitoring; §12 — a11y on prefers-reduced-motion (no blink animation in this phase, but emissive-only emitters honor reduced-motion implicitly).

### Existing codebase patterns to extend
- `src/scene/Workstation.tsx` — composition root; new components imported here.
- `src/scene/Lamp.tsx` — pattern for "geometry + emissive surface + pointLight" combos.
- `src/scene/WallDecor.tsx` — existing canvas-texture pattern (`usePosterTexture`); refactor opportunity flagged in Phase 7, but D-19 mirrors it inline for now.
- `src/scene/Floor.tsx` — companion to `Walls.tsx`; coordinate dimensions.
- `src/scene/Controls.tsx` — OrbitControls clamp source.
- `src/scene/Lighting.tsx` — existing light count baseline for D-33.
- `src/scene/colors.ts` — palette mirror; extend with `wall` key.
- `src/styles/tokens.css` — DOM palette; mirror `--color-wall` for consistency (drift test).

### Out-of-project references
- `attack.mitre.org` (whiteboard content cite — Phase 7, not Phase 5; listed here for cross-milestone awareness).
- v1.0 archive: `.planning/milestones/v1.0-MILESTONE-AUDIT.md` (GLB rollback rationale that explains why no Path-A retry in v1.1).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `usePosterTexture` (in `WallDecor.tsx`) — proven canvas-texture authoring pattern (text + rect drawing on a `CanvasRenderingContext2D`, returned as a `CanvasTexture` cached via `useMemo`). Phase 5's `nightCity.ts` adopts the same shape but as a pure exported function (not a hook) because the texture is module-scope, not component-scope.
- `Floor.tsx` plane-with-material pattern — exact analog for ceiling and walls; only material + dimensions differ.
- `Lamp.tsx` "emissive disc + pointLight" pattern — direct analog for the recessed ceiling fixture (D-20..22).

### Established Patterns
- All Phase 5 new components import `SCENE_COLORS` from `src/scene/colors.ts`; never hard-code hex.
- All emissive components in v1.1 import `EMISSIVE_BUDGET` from `src/scene/emissiveBudget.ts` (introduced in this phase); never hard-code emissiveIntensity.
- All canvas-texture authoring functions live in `src/scene/textures/` (new subfolder this phase).
- `prefers-reduced-motion` respected by skipping all per-frame animations; Phase 5 introduces ZERO new animations, so the gate doesn't fire in this phase. Reserved for Phase 6 (Pi LEDs) and Phase 8 (cat breathing).

### Integration Points
- `Workstation.tsx` adds `<Walls />`, `<Ceiling />`, `<Window />` as new children (no removals).
- `Controls.tsx` single-prop change (`maxDistance`).
- `Lighting.tsx` — verify count, adjust only if cap risk surfaces.
- `colors.ts` — additive new key `wall`; existing keys untouched.
- `tokens.css` — additive new variable `--color-wall`; existing variables untouched.
- `Lighting.tsx` — adds at most one `<pointLight>` inside the ceiling fixture (acceptable: belongs with the fixture mesh, not in the global lighting module — D-22 places it in `Ceiling.tsx`).
- `Monitor.tsx`, `Lamp.tsx`, `WallDecor.tsx` — minor refactor to read emissive values from `EMISSIVE_BUDGET` (D-24); behavior preserved.

</code_context>

<specifics>
## Specific Ideas

- "Closed bedroom apartment at night" reading — not a sterile office, not a server room, not a sci-fi pod. The walls and window establish "this is the room you actually live and work in".
- Window is small and offset, not a feature wall — recruiters should see "window" and move on, not stare at it.
- Blinds half open is intentional — fully closed would make the night-city pattern invisible and waste the canvas; fully open removes the "blinds" reading entirely.
- emissiveBudget centralization is structurally important — without it, Phase 7 visual-overload guardrails have no clamp; every phase would just escalate intensities.

</specifics>

<deferred>
## Deferred Ideas

- Door (real or implied) — promoted to v1.2 candidate per REQUIREMENTS.md.
- Animated blinds open/close — explicitly out of v1.1; could land in v1.2 if a "morning/evening" toggle becomes a feature.
- Drop ceiling / acoustic panels — too commercial / office; out of scope.
- Rain/snow particle effects on the window — high render cost, low payoff, not aligned with cyber genre.
- Multiple windows or skylight — composition risk; one window is enough.
- HDRI environment map for natural light bounce — research already rejected; the dark-room aesthetic doesn't need bounce light.

</deferred>

---

*Phase: 5-room-shell*
*Context gathered: 2026-05-15*

---

## --auto mode selection log (for audit)

All gray areas auto-resolved to research-recommended defaults in a single pass. The decisions above (D-01..D-34) carry the full rationale; this log just lists the selection mechanism.

| Area | Q | Selected | Source |
|---|---|---|---|
| Room dims | width × depth × height? | 4 × 5 × 2.6 m | Camera maxDistance 2.6 implies small residential room |
| Wall material | matte / PBR-rough / brick? | matte, roughness 0.95 | v1.0 dark palette consistency |
| Wall color | from token / new? | new `wall` token `#0c0e12` | Between v1.0 `bg` and `surface-1` |
| Window placement | center / left / right? | back wall offset right | Bookshelf occupies left side |
| Window size | small / medium / large? | medium 1.2 × 1.5 m | Reads "residential window" |
| Blinds orientation | horizontal / vertical? | horizontal | Apartment convention; vertical = "office building" |
| Blinds posture | open / half / closed? | half open ~60% | Reads blinds AND lets canvas pattern through |
| Blinds color | match wall / contrast / metal? | aluminum `#c8cdd4` | Matches monitor housing tone |
| Pattern style | silhouette / abstract / window dots? | silhouette + window dots | Cliché-positive recognition, fast read |
| Pattern resolution | 512 / 1024 / 2048? | 1024 | STACK.md cap |
| Ceiling material | same / different? | same as walls | Simpler, consistent |
| Ceiling light type | recessed / pendant / panel? | recessed flush | Cleanest geometry; emissive disc + 1 pointLight |
| Ceiling light color | warm / cool? | cool white `#d4dce4` | Plays nicely with monitor cyan; warm reserved for lamp |
| Ceiling castShadow | yes / no? | no | 1 shadow-caster cap (directional has it) |
| Wall thickness | 0 / hairline / 0.05? | 0.05 m BoxGeometry | Avoids Z-fighting at corners |
| emissiveBudget initial values | derive / placeholder? | derived from current emitters | Refactor existing, no visual shift |
| toneMapped privilege | broaden / keep neon-only? | keep neon-only | Documented inline |
| Test for emissiveBudget | none / smoke / full? | smoke (finite + range) | Visual components untested per v1.0 rule |
| Camera pose check | overview only / both? | both (overview + focused) | D-28 validation step |
| File location for canvas-texture | flat / textures subfolder? | new `src/scene/textures/` | First subfolder under scene; future phases (7) join |

If you want to change any of the above, re-run `/gsd-discuss-phase 5` without `--auto` and override the specific decisions interactively.
