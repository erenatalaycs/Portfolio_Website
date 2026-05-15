---
phase: 05-room-shell
plan: 02
subsystem: 3d-scene
tags: [room-shell, walls, ceiling, recessed-fixture, dynamic-light-budget, ROOM-01, ROOM-02]

requires:
  - phase: 05-room-shell
    plan: 01
    provides: EMISSIVE_BUDGET.CEILING_FIXTURE (0.5) + SCENE_COLORS.wall (#0c0e12) + OrbitControls.maxDistance 2.6
provides:
  - "Three inward-facing wall planes (back z=-2.5, left x=-2.0, right x=+2.0) bounding the desk-island"
  - "Ceiling slab at y=2.6 + recessed flush fixture (emissive disc + 1 pointLight, castShadow=false)"
  - "D-33 light count advances 4 → 5 (cap 6); shadow-caster count stays at 1"
  - "Back-wall surface at z=-2.5 ready for Plan 05-03 window mount"
affects:
  - 05-03 (Window.tsx + Blinds.tsx — back wall surface now exists at z=-2.5 where the window cuts in)
  - 06-* (BED-03 bedside lamp will be the 6th and final dynamic-light slot; no more pointLights after that)
  - 07-* + 08-* (no new pointLight allowed; emissive + Bloom only)

tech-stack:
  added: []
  patterns:
    - "Composition: structural geometry (walls + ceiling) mounted in Workstation.tsx immediately after Floor in physical-assembly order (floor → walls → ceiling → furniture)"
    - "Fixture pointLight co-located with fixture mesh (Ceiling.tsx), not in Lighting.tsx — D-22 code-context decision keeps visible source and illumination paired"
    - "One-off JSX hex literals ('#e8eef5', '#d4dce4') for single-use scene-specific tones; promotion to SCENE_COLORS deferred until a second cool-white emitter ships"

key-files:
  created:
    - src/scene/Walls.tsx
    - src/scene/Ceiling.tsx
  modified:
    - src/scene/Workstation.tsx

key-decisions:
  - "D-30 discretion call confirmed: single Walls component renders 3 mesh blocks inline — no WallLeft/WallRight/WallBack subcomponents. Three meshes sharing one material is below the surface-area threshold for export-per-wall."
  - "D-22 code-context applied: fixture pointLight lives inside Ceiling.tsx alongside the emissive disc, NOT in Lighting.tsx. Visible source and illumination travel together."
  - "Cool-white tones '#e8eef5' (emissive) and '#d4dce4' (light color) inlined as JSX hex literals with an inline-comment rationale (D-22). NOT promoted to SCENE_COLORS — single-use one-offs."
  - "Workstation.tsx JSX order: Floor → Walls → Ceiling → Desk → ... reads as physical assembly (build the room, then drop the furniture in)."
  - "Known minor visual question (NOT a blocker): the directional light is at world (3, 4, 2), above the y=2.6 ceiling. The ceiling underside is lit only by ambient + recessed fixture, which should read correctly as 'lit from inside'. If the post-Phase-5 visual smoke disagrees, a follow-up Plan 05-04 can move the directional below the ceiling (e.g. y=2.4); this plan does NOT pre-empt that decision."

requirements-completed:
  - ROOM-01
  - ROOM-02

duration: 8 min
completed: 2026-05-15
---

# Phase 5 Plan 02: Walls + Ceiling + Recessed Fixture Summary

**The room shell now exists.** Three inward-facing walls (back z=-2.5, left x=-2.0, right x=+2.0) plus a ceiling slab at y=2.6 enclose the desk-island, and a recessed flush fixture (emissive disc + 1 cool-white pointLight) brings the dynamic-light count from 4 to 5 (cap 6, headroom 1). Plan 05-03 (Window + Blinds) is unblocked — the back wall at z=-2.5 is now the surface the window cuts into.

## Performance

- **Duration:** ~8 min
- **Started:** 2026-05-15T13:48:33Z
- **Completed:** 2026-05-15T13:56:40Z
- **Tasks:** 3 (3 commits)
- **Files created:** 2 (`src/scene/Walls.tsx`, `src/scene/Ceiling.tsx`)
- **Files modified:** 1 (`src/scene/Workstation.tsx`)

## Accomplishments

- **Walls (Task 1, `7723624`):** New `src/scene/Walls.tsx` exports a single `Walls()` component rendering three `<mesh receiveShadow>` blocks — back wall BoxGeometry(4.0, 2.6, 0.05) at (0, 1.3, -2.525), left wall BoxGeometry(0.05, 2.6, 5.0) at (-2.025, 1.3, 0), right wall BoxGeometry(0.05, 2.6, 5.0) at (2.025, 1.3, 0). All three slabs share matte `meshStandardMaterial` (roughness 0.95, metalness 0, color `SCENE_COLORS.wall`).
- **Ceiling + recessed fixture (Task 2, `7575513`):** New `src/scene/Ceiling.tsx` exports `Ceiling()` returning three children: ceiling slab BoxGeometry(4.0, 0.05, 5.0) at (0, 2.625, 0); emissive recessed disc CylinderGeometry(0.12, 0.12, 0.02, 24) at (0, 2.59, 0) with `emissive="#e8eef5"` and `emissiveIntensity={EMISSIVE_BUDGET.CEILING_FIXTURE}`; and a `<pointLight>` at (0, 2.55, 0) — color `"#d4dce4"`, intensity 0.3, distance 4.0, decay 2.0, `castShadow={false}`. Cool-white hex literals are inlined per D-22 (one-off, not promoted to SCENE_COLORS).
- **Composition (Task 3, `71942b2`):** `Workstation.tsx` imports `Walls` and `Ceiling` and mounts them in JSX order Floor → Walls → Ceiling → Desk → … (physical-assembly order). File-header comment block extended with a v1.1 Phase 5 paragraph citing D-01..D-05, D-20..D-22, D-27 and ROOM-01/ROOM-02. No existing component removed.

## D-33 dynamic-light enumeration (pre vs post)

| When | Ambient | Directional (cast) | PointLight cyan | PointLight warm | PointLight ceiling | **Total dynamic** | **Shadow casters** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pre-Plan-05-02 | 1 | 1 | 1 | 1 | 0 | **4** | **1** |
| Post-Plan-05-02 | 1 | 1 | 1 | 1 | 1 | **5** | **1** |
| Cap | — | — | — | — | — | 6 | 1 |
| Headroom remaining | — | — | — | — | — | **1** | **0** |

Counts verified at commit-time via `grep -cE '<(pointLight\|spotLight\|rectAreaLight\|hemisphereLight\|directionalLight\|ambientLight)' src/scene/Lighting.tsx src/scene/Ceiling.tsx` → `Lighting.tsx: 4`, `Ceiling.tsx: 1`. No `<pointLight>` / `<spotLight>` exists in any other `src/scene/*.tsx` file. The new fixture pointLight is `castShadow={false}` — shadow-caster count stays at exactly 1 (the directional in Lighting.tsx).

**Downstream budget:**

| Phase | Adds | Cumulative Dynamic | Cumulative Shadow |
| --- | --- | --- | --- |
| Plan 05-03 (Window + Blinds) | 0 | 5 | 1 |
| Phase 6 BED-03 bedside lamp | +1 pointLight (castShadow=false) | **6 (cap)** | 1 |
| Phase 7 + Phase 8 | **MUST NOT add any pointLight/spotLight** — emissive + Bloom only | 6 | 1 |

## Verification

| Gate | Result |
| --- | --- |
| Acceptance grep gates (×13 in plan frontmatter) | **13/13 PASS** (audited end-to-end after Task 3) |
| `npm run typecheck` | PASS (`tsc --noEmit` clean) |
| `npm test --run` | **110/110 passing** (no new tests this plan — visual components per D-34) |
| `npm run lint` | PASS (eslint clean) |
| `npm run format:check` | PASS (prettier clean; no auto-fix needed) |
| `npm run parity` | PASS (TXT-06 + CNT-03 + Pitfall 8 all green) |
| `npm run build` | PASS (vite build, 375 ms) |
| `npm run size` | PASS (all 6 size-limit budgets) |
| `npm run dev` smoke (vite ready in 359 ms, no console errors) | PASS |
| D-33 enumeration audit (5 dynamic, 1 shadow-caster) | PASS |
| JSX order audit (`<Floor /> < <Walls /> < <Ceiling /> < <Desk />`) | PASS (lines 55 → 56 → 57 → 58) |

### Size budgets — 3D chunk delta

| Budget | Pre-plan (gz) | Post-plan (gz) | Δ | Limit | Headroom |
| --- | --- | --- | --- | --- | --- |
| **3D chunk (lazy)** | **40.76 kB** | **40.96 kB** | **+0.20 kB** | 450 kB | **409.04 kB** |
| Text shell entry | 64.88 kB | 64.88 kB | 0 | 120 kB | 55.12 kB |
| Postprocessing chunk | 84.91 kB | 84.91 kB | 0 | 100 kB | 15.09 kB |
| GLB workstation desk | 193.66 kB | 193.66 kB | 0 | 1 MB | 830.34 kB |
| GLB workstation lamp | 320.29 kB | 320.29 kB | 0 | 500 kB | 179.71 kB |
| GLB workstation bookshelf | 354.9 kB | 354.9 kB | 0 | 500 kB | 145.1 kB |

3D chunk delta is **+0.20 kB gz** — well under the plan's acceptance threshold of < 5 kB and a tiny fraction of the 409 kB cap headroom. The plan ships two ~50–80-line files plus three line additions in Workstation.tsx; the build is dominated by the underlying R3F bundle, which is unchanged.

## Visual smoke — `human_needed`

The `npm run dev` server was launched, reached "ready" in 359 ms, served `http://localhost:5173/Portfolio_Website/` cleanly (no console errors in the dev output), and was verified inside the executor process. **However, the visual confirmation step (open the URL, drag-orbit at default `?view=3d&focus=overview`, check walls + ceiling render correctly, walls do not clip Bookshelf / Monitor / Lamp, drag-zoom-out clamps inside the room) requires human eyes** — flagged `human_needed`. Eren should:

1. Open `http://localhost:5173/Portfolio_Website/?view=3d` in a browser.
2. Confirm walls + ceiling visible at the default overview pose — desk-island reads as enclosed (no "floating in void").
3. Confirm no clipping: Bookshelf (z=-0.6, x∈[-0.5, +0.5]) sits clear of the back wall at z=-2.5; Monitor (z=-0.05, y=1.1) is clear of all walls and ceiling; Lamp shade top (y≈1.24) is well below the y=2.6 ceiling; Bookshelf top (y≈1.8) is also clear.
4. Drag-orbit the camera in a full circle — the maxDistance clamp (2.6, from Plan 05-01) should prevent the camera from exiting any wall.
5. Click the monitor — focused-pose framing should still be correct.

If any step fails, surface as a Plan 05-04 candidate (do NOT block Plan 05-03).

### Known visual question (NOT a blocker)

The directional light in Lighting.tsx is at world (3, 4, 2) — i.e. above the new ceiling at y=2.6. From inside the room, the ceiling underside is now lit only by `<ambientLight>` and the new recessed-fixture pointLight (decay 2.0, distance 4.0, intensity 0.3). This should read correctly as "lit from inside." If the visual smoke disagrees, a follow-up Plan 05-04 can retune the directional (e.g. drop to y < 2.6 with a re-aimed target), but this plan does NOT pre-empt that decision — the directional retune touches lighting calibration that should be made against the full Phase 5 room (after Plan 05-03 ships the window).

## Plan 05-03 unblock confirmation

The back wall is rendered as a single contiguous BoxGeometry slab at center z=-2.525 (interior face z=-2.5), width 4.0 m, height 2.6 m. Plan 05-03 (Window + Blinds) can now mount its window cut-out / window frame against that surface — the back wall geometry is exactly where the plan expected.

## Deviations from Plan

None substantive. The plan executed as written across all three tasks.

### Minor authoring note

The plan's task-level acceptance criteria asked for the wall slab Y center to be inlined as the numeric literal `1.3` (the grep gate is `grep -F 'position={[0, 1.3, -2.525]}'`). The initial Walls.tsx draft used a `Y_CENTER = ROOM_HEIGHT / 2` named constant (DRY), which would have failed the grep gate (`position={[0, Y_CENTER, -2.525]}` does not match the literal pattern). Switched back to the literal `1.3` before commit and documented the dimension constants (`ROOM_WIDTH`, `ROOM_DEPTH`, `ROOM_HEIGHT`, `WALL_THICKNESS`) as named constants used inside `boxGeometry args` only — best of both: grep-gate compliance for positions, named constants for geometry. Zero behavioral change.

## Known follow-ups (not blockers)

- **Dev-server cleanup:** `npm run dev` was launched as a background task during the smoke step (PID 77977). The executor sandbox blocks `kill` / `pkill` / `lsof | xargs kill` even on processes the agent itself started — same constraint that hit Plan 05-01 (PID 74047). The user should run `lsof -i :5173 | grep LISTEN` and kill the listening PID manually if it's still running. **No code or data side-effects** — vite dev server is read-only against the working tree.
- **Visual smoke (human-needed):** see "Visual smoke — `human_needed`" above. The grep gates and the build confirm structural correctness; the open question is only "do the walls and ceiling look right" — a design call, not a correctness call.
- **Directional-light retune:** noted as a candidate Plan 05-04 if the post-Phase-5 smoke disagrees. Not blocking; deferred to after the window lands.

## Self-Check: PASSED

Verified before SUMMARY commit:

- `src/scene/Walls.tsx` — **FOUND**
- `src/scene/Ceiling.tsx` — **FOUND**
- Commit `7723624` (Task 1 — Walls.tsx) — **FOUND in git log**
- Commit `7575513` (Task 2 — Ceiling.tsx) — **FOUND in git log**
- Commit `71942b2` (Task 3 — Workstation.tsx mount) — **FOUND in git log**
- All 13 acceptance grep gates pass.
- All 110 vitest tests pass.
- All 6 size-limit budgets pass.
- D-33 enumeration audit returns 5 total dynamic lights, 1 shadow-caster.
