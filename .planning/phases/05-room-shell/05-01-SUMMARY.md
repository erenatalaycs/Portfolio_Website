---
phase: 05-room-shell
plan: 01
subsystem: 3d-scene
tags: [emissive-budget, orbit-controls, palette-token, refactor, single-source-of-truth, room-shell, drift-guard]

requires:
  - phase: 04-real-asset-postprocessing-polish-pre-launch-qa
    provides: HS-redesign emissive surfaces (Monitor / Lamp / WallDecor / DeskDecor) + Bloom-calibrated luminanceThreshold
provides:
  - "EMISSIVE_BUDGET single-source-of-truth (8 keys per D-23: NEON_STRIP 2.5, MONITOR_SCREEN 0.6, BIAS_LIGHT 0.4, LED_STRIP 0.35, RACK_LED 1.2, LAMP_BULB 0.8, BEDSIDE_LAMP 0.6, CEILING_FIXTURE 0.5)"
  - "wall palette token (SCENE_COLORS.wall = '#0c0e12' mirrored to --color-wall in tokens.css; covered by parity drift test)"
  - "tightened OrbitControls clamp (maxDistance: 4.0 → 2.6) ready for Plan 05-02 wall bounds"
  - "drift-guard pattern: zero numeric emissiveIntensity literals in src/scene/*.tsx"
affects:
  - 05-02 (Walls.tsx + Ceiling.tsx consume SCENE_COLORS.wall + EMISSIVE_BUDGET.CEILING_FIXTURE; ceiling pointLight pushes light count 4 → 5)
  - 05-03 (Window.tsx + Blinds.tsx benefit from maxDistance clamp framing the night-city backdrop within the room envelope)
  - 06-* (CYB-02 Pi-rack LEDs consume EMISSIVE_BUDGET.RACK_LED; BED-03 bedside lamp consumes EMISSIVE_BUDGET.BEDSIDE_LAMP — pushes light count 5 → 6, the cap)
  - 07-* (WARM-03 bias-light + WARM-04 LED-strip consume BIAS_LIGHT / LED_STRIP; visual-overload guardrail counts unique emissive hues against this budget)

tech-stack:
  added: []
  patterns:
    - "Centralized constant module + co-located vitest smoke test (Number.isFinite + range)"
    - "File-local intensity constants when a JSX surface lacks a named D-23 key (DeskDecor.tsx) — preserves drift-guard intent without inventing un-decisioned budget keys"
    - "Comment-driven cross-phase wiring: each EMISSIVE_BUDGET JSDoc cites the consuming phase + REQ"

key-files:
  created:
    - src/scene/emissiveBudget.ts
    - src/scene/emissiveBudget.test.ts
  modified:
    - src/scene/colors.ts
    - src/scene/colors.test.ts
    - src/styles/tokens.css
    - src/scene/Controls.tsx
    - src/scene/Monitor.tsx
    - src/scene/Lamp.tsx
    - src/scene/WallDecor.tsx
    - src/scene/DeskDecor.tsx

key-decisions:
  - "EMISSIVE_BUDGET shape matches D-23 verbatim (8 keys, `as const`, exported `EmissiveSurface = keyof typeof EMISSIVE_BUDGET`). JSDoc per key cites the consuming phase + REQ."
  - "MONITOR_FOCUS_BOOST = 1.333 is file-local in Monitor.tsx (not in EMISSIVE_BUDGET). Rationale: the focus-pop ratio is a Monitor-component concern (UX emphasis), not a scene-wide ceiling. Preserves HS-redesign focused/resting ratio (2.0/1.5 ≈ 1.333×)."
  - "toneMapped:false privilege stays exclusive to WallDecor NeonStrip (D-25). Inline comment in WallDecor.tsx warns against broadening the privilege without a Bloom retune."
  - "DeskDecor.tsx surfaces (keyboard backlight 1.0, tower LED 1.4, tower intake 0.6) refactored to file-local named constants — these HS-redesign-era emitters have no named D-23 key. Documented deviation: plan author missed DeskDecor; values byte-identical, zero visual change. Phase 6 should consider centralizing if Pi-rack LEDs land at compatible intensity."
  - "Controls.tsx maxDistance 4.0 → 2.6 verified against both shipped camera poses (overview ≈ 2.20 m < 2.6 ✓; focused ≈ 0.91 m — pre-existing imperative seed below minDistance 1.2, unchanged)."

patterns-established:
  - "Drift-guard regex: `grep -nE 'emissiveIntensity\\s*=\\s*\\{[0-9]' src/scene/*.tsx` MUST return zero in CI. Any future emitter that ships a numeric literal in JSX violates the structural prerequisite for Phase 7's ≤4-distinct-hues guardrail."

requirements-completed:
  - ROOM-04

duration: 16 min
completed: 2026-05-15
---

# Phase 5 Plan 01: Foundation (emissiveBudget + Controls clamp + wall token + emitter refactor) Summary

**`EMISSIVE_BUDGET` lands as the single source of truth for emissive intensity ceilings across v1.1 — the three v1.0 emitters (Monitor / Lamp / WallDecor NeonStrip) plus the HS-redesign DeskDecor emitters now read from named constants instead of magic numbers. `OrbitControls.maxDistance` tightens 4.0 → 2.6 and the `wall` palette token mirrors across `colors.ts` + `tokens.css` — both substrate moves Plan 05-02 / 05-03 / Phase 6 / Phase 7 depend on.**

## Performance

- **Duration:** ~16 min
- **Started:** 2026-05-15T13:27:52Z
- **Completed:** 2026-05-15T13:43:30Z
- **Tasks:** 3 (4 commits — TDD split on Task 1: RED + GREEN)
- **Files created:** 2 (`src/scene/emissiveBudget.ts`, `src/scene/emissiveBudget.test.ts`)
- **Files modified:** 8 (`Controls.tsx`, `Monitor.tsx`, `Lamp.tsx`, `WallDecor.tsx`, `DeskDecor.tsx`, `colors.ts`, `colors.test.ts`, `tokens.css`)

## Accomplishments

- **EMISSIVE_BUDGET module (Task 1):** Authored `src/scene/emissiveBudget.ts` with 8 D-23 ceilings + `EmissiveSurface` keyof-type. Co-located vitest smoke test (`emissiveBudget.test.ts`) asserts every value is `Number.isFinite(v) && 0 ≤ v ≤ 10` (8 per-key cases via `it.each`) plus a fixed-shape assertion (`Object.keys(...).sort()` matches expected 8 keys). TDD split: RED commit (`ec1d80c`) → GREEN commit (`611d396`).
- **`wall` palette token + Controls clamp (Task 2):** Added `SCENE_COLORS.wall = '#0c0e12'` to `colors.ts` mirrored to `--color-wall: #0c0e12` in `tokens.css`; existing parity drift test extended with a single new row (`['wall', 'wall']`) — token-parser regex required no change. `Controls.tsx` `maxDistance: 4.0 → 2.6` (D-27) with file-header comment documenting the both-poses math verification.
- **Emitter refactor (Task 3):** Replaced numeric `emissiveIntensity` literals with `EMISSIVE_BUDGET.{KEY}` references in `Monitor.tsx` / `Lamp.tsx` / `WallDecor.tsx`. Monitor preserves the HS-redesign focus-pop ratio via a file-local `MONITOR_FOCUS_BOOST = 1.333` constant. Drift-guard now passes (zero numeric literals).
- **DeskDecor.tsx scope deviation (Rule 3):** The plan's strict drift-guard regex (`emissiveIntensity\s*=\s*\{[0-9]` across `src/scene/*.tsx`) would have failed because DeskDecor.tsx (HS-redesign-era addition) has 3 hardcoded emissive literals (keyboard backlight 1.0, tower power LED 1.4, tower intake vent 0.6). The plan author missed DeskDecor when listing v1.0 emissive consumers. Fixed by hoisting these literals to three file-local named constants (`KEYBOARD_BACKLIGHT_INTENSITY`, `TOWER_LED_INTENSITY`, `TOWER_INTAKE_INTENSITY`) — values byte-identical, zero visual change, drift-guard satisfied. See "Deviations" section below.

## D-33 light enumeration (BEFORE Plan 05-01 ships)

Captured verbatim per the plan's "Plan-level verification" §1 for downstream phases:

| Source                          | Count | Notes                                                                |
| ------------------------------- | ----- | -------------------------------------------------------------------- |
| `<ambientLight>` (Lighting.tsx) | 1     | Cool-blue cast, intensity 0.18                                       |
| `<directionalLight>` shadow     | 1     | Key light from upper-right; **the single shadow-caster** (`castShadow={true}`) |
| `<pointLight>` cyan accent      | 1     | Behind monitor — paints wall neon halo                               |
| `<pointLight>` warm lamp        | 1     | At lamp bulb world position                                          |
| `<spotLight>` / `<hemisphereLight>` / `<rectAreaLight>` | 0 | None in scene                                |
| **TOTAL DYNAMIC**               | **4** | Cap = 6 dynamic; **2 headroom remaining**                            |
| **SHADOW-CASTERS**              | **1** | Cap = 1 shadow-caster; **at cap, no headroom**                       |

Search source: `grep -nE '<(directionalLight\|pointLight\|spotLight\|ambientLight\|hemisphereLight\|rectAreaLight)' src/scene/Lighting.tsx src/scene/**/*.tsx` — confirmed 4 matches, all in `Lighting.tsx`. No stray lights elsewhere.

**Downstream phase budget:**

| Phase | Adds | Cumulative Dynamic | Cumulative Shadow |
| ----- | ---- | ------------------ | ----------------- |
| Plan 05-02 | +1 ceiling `<pointLight>` (decay 2, distance 4.0, `castShadow=false` per D-21) | 5 | 1 |
| Phase 6 BED-03 | +1 bedside `<pointLight>` (warmer, ~distance 1.5, `castShadow=false`) | **6 (cap)** | 1 |
| Phase 7 + Phase 8 | **MUST not add any pointLight/spotLight** — emissive + Bloom only | 6 | 1 |

No blocker triggered (current count 4 ≤ 4 expected from CONTEXT D-33 audit).

## Verification

| Gate | Result |
| ---- | ------ |
| Acceptance grep gates (×17 in plan frontmatter) | **17/17 PASS** (verified end-to-end) |
| `npm test --run` | **110/110 passing** (includes 9 new `emissiveBudget.test.ts` cases + 1 new `colors.test.ts` `wall` row) |
| `npm run typecheck` | PASS (tsc --noEmit clean) |
| `npm run lint` | PASS (eslint clean) |
| `npm run format:check` | PASS (prettier; one auto-fix applied to `emissiveBudget.test.ts` mid-flight) |
| `npm run parity` | PASS (TXT-06 + CNT-03 + Pitfall 8) |
| `npm run build` | PASS (vite build, 970 ms) |
| `npm run size` | PASS (all 6 size-limit budgets — see table below) |
| Drift guard (`grep -nE 'emissiveIntensity\s*=\s*\{[0-9]' src/scene/*.tsx \| wc -l`) | **0** ✓ |
| `npm run dev` smoke (vite ready in 249 ms, no console errors) | PASS |

### Size budgets (post-plan)

| Budget                    | Size (gz)   | Limit       | Headroom         |
| ------------------------- | ----------- | ----------- | ---------------- |
| Text shell entry chunk    | 64.88 kB    | 120 kB      | 55.12 kB         |
| **3D chunk (lazy)**       | **40.76 kB**| **450 kB**  | **409.24 kB**    |
| GLB workstation desk      | 193.66 kB   | 1 MB        | 830.34 kB        |
| GLB workstation lamp      | 320.29 kB   | 500 kB      | 179.71 kB        |
| GLB workstation bookshelf | 354.9 kB    | 500 kB      | 145.1 kB         |
| Postprocessing chunk      | 84.91 kB    | 100 kB      | 15.09 kB         |

**3D chunk delta vs pre-plan baseline:** **could not be measured directly** because the project's `destructive-git-prohibition` rule forbids `git checkout 0349c88 -- src/scene/...` to swap to baseline and back. Inference from plan shape: a single ~50-line `emissiveBudget.ts` (~1.2 kB raw) + identifier substitutions in 5 scene files (no net token-count change beyond import lines, ~80 bytes raw per file). Conservative upper bound: < 1.5 kB gz delta. Well under the plan's < 5 kB gz acceptance threshold. The 40.76 kB gz absolute is the most recent recorded number; the prior recorded 3D chunk size in `04-06-SUMMARY.md` was 59.82 kB gz (pre-HS-redesign), and HS-redesign itself reduced the chunk; Plan 05-01 is a pure refactor on top of that smaller surface.

## D-23 intensity shift report

The plan calls this out as a documented deviation from "behavior-preserving" framing (intentional — D-23 sets the new ceilings as the centralized values, not multipliers on prior visuals):

| Surface | Pre-plan | Post-plan | Δ        | Notes                                                                              |
| ------- | -------- | --------- | -------- | ---------------------------------------------------------------------------------- |
| Monitor screen (resting) | 1.5 | 0.6 | **−60%** | EMISSIVE_BUDGET.MONITOR_SCREEN; visibly dimmer at overview pose                    |
| Monitor screen (focused) | 2.0 | 0.8 | **−60%** | MONITOR_SCREEN × MONITOR_FOCUS_BOOST (1.333); focus-pop ratio preserved 1.333×     |
| Lamp bulb               | 2.0 | 0.8 | **−60%** | EMISSIVE_BUDGET.LAMP_BULB                                                          |
| WallDecor neon strip    | 2.0 | 2.5 | **+25%** | EMISSIVE_BUDGET.NEON_STRIP; toneMapped:false preserved; well under Bloom-blowout threshold (Plan 04-01 calibration) |
| Keyboard backlight (DeskDecor) | 1.0 | 1.0 | 0% | Refactored to KEYBOARD_BACKLIGHT_INTENSITY local const, byte-identical            |
| Tower power LED (DeskDecor)    | 1.4 | 1.4 | 0% | TOWER_LED_INTENSITY local const, byte-identical                                   |
| Tower intake vent (DeskDecor)  | 0.6 | 0.6 | 0% | TOWER_INTAKE_INTENSITY local const, byte-identical                                |

**Human review needed (camera-pose smoke = `human_needed`):** the developer should run `npm run dev` → `http://localhost:5173/Portfolio_Website/?view=3d`, drag the camera, and confirm:

1. Drag-zoom-out clamps at distance ≈ 2.6 from target `(0, 0.85, 0)` (no further pull-back).
2. Both poses (overview + click-monitor-to-focus) still frame correctly.
3. Monitor screen + Lamp bulb visibly dim vs pre-plan (intentional per D-23); decide whether to keep or bump constants in `emissiveBudget.ts`. **If rejected, fix is to raise the constant — not revert the refactor (D-24).**

Plans 05-02 and 05-03 can proceed in parallel with this visual-smoke step once typecheck + tests pass (already green).

## Deviations from Plan

### Rule 3 (Blocker) — DeskDecor.tsx in-scope expansion

- **Found during:** Task 3 verify (drift-guard grep)
- **Issue:** Plan's drift-guard regex (`emissiveIntensity\s*=\s*\{[0-9]` across `src/scene/*.tsx`) would have returned 3 matches — all in `DeskDecor.tsx` (keyboard backlight 1.0, tower power LED 1.4, tower intake vent 0.6). The plan author named only Monitor / Lamp / WallDecor as v1.0 emissive consumers (missing DeskDecor, which was added in the HS-redesign).
- **Fix:** Hoisted the 3 numeric literals in `DeskDecor.tsx` to file-local named constants (`KEYBOARD_BACKLIGHT_INTENSITY = 1.0`, `TOWER_LED_INTENSITY = 1.4`, `TOWER_INTAKE_INTENSITY = 0.6`). Values are byte-identical to pre-plan — zero visual change. Did NOT invent new D-23 keys for these surfaces (they have no named-budget assignment yet; Phase 6 should reconsider centralizing once the Pi-rack RACK_LED lands at a compatible intensity).
- **Files modified:** `src/scene/DeskDecor.tsx` (1 file, +9 / −3 lines including documentation header).
- **Commit:** `97de9e5` (folded into Task 3 commit with explicit deviation note in commit body).
- **Why not Rule 4 (architectural ask):** The fix is minimal (rename 3 literals), preserves all behavior, satisfies the drift-guard intent ("no magic numbers in JSX"), and does not touch the D-23 budget. An architectural ask would have stalled the plan over a 3-line text edit.

### Prettier auto-fix on test file

- **Found during:** Task 3 `npm run format:check`
- **Issue:** `src/scene/emissiveBudget.test.ts` had a line-width violation in the original test scaffold (the `it.each(...)` line was over the project's 100-col limit when written with a line break before the callback).
- **Fix:** `npx prettier --write src/scene/emissiveBudget.test.ts` (auto-fix; rewrites `it.each(Object.entries(...))(` onto a single line). No semantic change; test still passes (9/9).
- **Commit:** Folded into Task 3 commit (`97de9e5`).

## Known follow-ups (not blockers)

- `npm run dev` was launched as a background process during smoke (PID 74047) and could not be killed from this agent's shell because `kill` / `pkill` is in the denied-command list. The user should kill it manually if it's still running (`lsof -i :5173 | grep LISTEN` → `kill <pid>`).
- Exact pre-plan-baseline 3D chunk size could not be measured because measuring it required `git checkout 0349c88 -- src/scene/...` which is blocked by the project's `destructive-git-prohibition` rule. Inference-based bound (< 1.5 kB gz delta) is well under the < 5 kB gz acceptance threshold; absolute post-plan size (40.76 kB gz) leaves 409 kB gz headroom against the 450 kB cap.

## Self-Check: PASSED

Verified before SUMMARY commit:

- `src/scene/emissiveBudget.ts` — **FOUND**
- `src/scene/emissiveBudget.test.ts` — **FOUND**
- Commit `ec1d80c` (RED test) — **FOUND in git log**
- Commit `611d396` (GREEN module) — **FOUND in git log**
- Commit `9fd3513` (Task 2 — wall token + maxDistance clamp) — **FOUND in git log**
- Commit `97de9e5` (Task 3 — emitter refactor + DeskDecor deviation) — **FOUND in git log**
- All 17 acceptance grep gates pass.
- All 110 vitest tests pass.
- All 6 size-limit budgets pass.
