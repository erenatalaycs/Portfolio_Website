---
phase: 02-3d-shell-asset-pipeline-capability-gating
plan: 01
subsystem: infra
tags: [r3f, three.js, drei, vite, rollup, size-limit, scene-tokens]

requires:
  - phase: 01-foundation-2d-recruiter-grade-shell
    provides: src/styles/tokens.css palette tokens; vite.config.ts base + sourcemap locks; package.json tilde-pinning convention
provides:
  - "@react-three/fiber@~9.6.1, @react-three/drei@~10.7.7, three@~0.184.0 runtime deps"
  - "size-limit@~12.1.0 + @size-limit/preset-app@~12.1.0 dev deps"
  - "src/scene/colors.ts SCENE_COLORS HEX mirror (4 tokens) + SceneColorKey type"
  - "src/scene/colors.test.ts drift gate (parses tokens.css at test time)"
  - "vite.config.ts build.rollupOptions.output filename patterns (chunk/entry/asset)"
  - "Inline anti-pattern guard forbidding manual-chunks declaration"
affects:
  - 02-02 (capability detection + React.lazy ThreeDShell import — relies on chunk filename pattern + R3F deps)
  - 02-04 (procedural scene composition — consumes SCENE_COLORS for materials)
  - 02-05 (size-limit budget enforcement — globs dist/assets/ThreeDShell-*.js)

tech-stack:
  added:
    - three@~0.184.0
    - "@react-three/fiber@~9.6.1"
    - "@react-three/drei@~10.7.7"
    - "size-limit@~12.1.0 (dev)"
    - "@size-limit/preset-app@~12.1.0 (dev)"
  patterns:
    - "Token-mirror with drift test: TS const mirroring tokens.css, regex-parsed CSS at test time, it.each table for per-token failure isolation"
    - "Explicit Rollup output filename patterns to lock lazy-chunk filename contract"
    - "Tilde (~) version pinning for the R3F + three + drei trio (Pitfall 16 carried from Phase 1)"

key-files:
  created:
    - src/scene/colors.ts
    - src/scene/colors.test.ts
  modified:
    - package.json
    - package-lock.json
    - vite.config.ts

key-decisions:
  - "Mirror only 4 of 8 Phase 1 palette tokens in SCENE_COLORS — fg / muted / negative / focus stay DOM-only per UI-SPEC mapping table; mirror grows when an in-canvas use lands"
  - "Surface ↔ surface-1 asymmetry encoded in test it.each table (CSS uses --color-surface-1 numeric suffix; SCENE_COLORS exposes terser .surface key)"
  - "Inline header comment on vite.config.ts forbids manual-chunks rollupOptions declaration (Vite #17653 / #5189) — use hyphenated 'manual-chunks' prose so the acceptance grep gate does not match the warning copy itself"
  - "npm pinned three with caret (^0.184.0) on first install; manually corrected to tilde (~0.184.0) before commit, then re-ran npm install to regenerate package-lock.json"

patterns-established:
  - "Token-mirror with drift test: any TS module mirroring tokens.css HEX values must ship a sibling .test.ts that regex-parses tokens.css and asserts per-key parity"
  - "Vite-config anti-pattern documentation: when a foot-gun option (manual-chunks) is conventionally on the table, explicitly forbid it inline with citation rather than rely on tribal knowledge"

requirements-completed:
  - 3D-04 (dependency-installation half — procedural scene composition itself ships in Plan 02-04)

duration: 3min
completed: 2026-05-06
---

# Phase 02 Plan 01: 3D Dep Bootstrap + Scene Token Mirror Summary

**Pinned R3F 9.6 / drei 10.7 / three 0.184 + size-limit 12.1 with tilde ranges; added `src/scene/colors.ts` HEX mirror of 4 Phase-1 palette tokens with a `tokens.css`-parsing drift test; locked Rollup chunk/entry/asset filename patterns so Plan 02-05's size-limit glob can hit `dist/assets/ThreeDShell-[hash].js` deterministically — bundle still 64 KB gz (zero R3F imports anywhere in src/).**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-06T18:22:19Z
- **Completed:** 2026-05-06T19:25:57Z (clock time includes interactive recovery from a tooling stutter mid-session; productive work ~3 min)
- **Tasks:** 3
- **Files modified:** 5 (`package.json`, `package-lock.json`, `vite.config.ts`, `src/scene/colors.ts`, `src/scene/colors.test.ts`)

## Accomplishments

- Five new dependencies installed and tilde-pinned (`three@~0.184.0`, `@react-three/fiber@~9.6.1`, `@react-three/drei@~10.7.7`, `size-limit@~12.1.0`, `@size-limit/preset-app@~12.1.0`); none of the eight Phase-2-forbidden packages touched.
- `SCENE_COLORS` token mirror established with type-level safety (`SceneColorKey` union of 4 keys) and CI-enforced drift gate (parses `tokens.css` regex, 4-row `it.each` table, surface ↔ surface-1 asymmetry handled).
- Rollup output filename pattern pinned to `assets/[name]-[hash].js` for chunks/entry and `assets/[name]-[hash][extname]` for assets — without introducing `manual-chunks`, which would have defeated the lazy-load contract Phase 2 exists to prove.
- Bundle parity confirmed: entry chunk 206.28 KB raw / 64.05 KB gz — byte-identical to the Phase 1 baseline. R3F is installed but unused, so it cannot enter the bundle until Plan 02-02 lands `React.lazy(() => import('../shells/ThreeDShell'))`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install pinned R3F/drei/three runtime + size-limit dev deps** — `dd0554f` (chore)
2. **Task 2: Author `src/scene/colors.ts` + drift test** — `db5e499` (feat)
3. **Task 3: Add Rollup output filename patterns (no manual-chunks)** — `95f58e3` (chore)

_All three task commits passed `tsc --noEmit`, `eslint . --max-warnings=0`, `prettier --check .`, `vitest run`, and `vite build` at the moment of commit. Final all-gate sweep post-Task-3 also exits 0._

## Files Created/Modified

- **`package.json`** (modified) — Added 3 runtime deps + 2 dev deps with tilde ranges. No script changes.
- **`package-lock.json`** (modified) — Regenerated by npm install; +1696 / -56 lines (transitive R3F + size-limit graph).
- **`src/scene/colors.ts`** (created, 18 lines) — Exports `SCENE_COLORS as const` (bg/surface/accent/warn) and `SceneColorKey` union type. Header comment cites tokens.css as source of truth and warns about drift gate.
- **`src/scene/colors.test.ts`** (created, 36 lines) — Reads `src/styles/tokens.css` via `node:fs` + `import.meta.url`, parses each `--color-*` token with a regex, asserts every `SCENE_COLORS` entry matches via 4-row `it.each` table.
- **`vite.config.ts`** (modified) — Added `build.rollupOptions.output` with three explicit filename patterns + a 5-line inline anti-pattern guard forbidding manual-chunks declarations. Phase 1's base/sourcemap/target locks preserved verbatim.

## Resolved Dependency Versions

```
$ npm ls three @react-three/fiber @react-three/drei size-limit @size-limit/preset-app --depth=0
portfolio-website@0.0.0
├── @react-three/drei@10.7.7
├── @react-three/fiber@9.6.1
├── @size-limit/preset-app@12.1.0
├── size-limit@12.1.0
└── three@0.184.0
```

`npm view <pkg> version` confirmed each `latest` published version still matches the planned target on 2026-05-06 (no patch drift since the RESEARCH lock).

## Bundle Size Inventory (post-build, post-Task-3)

| Asset | Raw | Gzip | Notes |
|-------|-----|------|-------|
| `dist/assets/index-VCqNCIQt.js` (entry) | 206.28 KB | 64.05 KB (vite reporter) / 63.34 KB (raw `gzip -c`) | Phase 1 baseline; unchanged. Well under Plan 02-05's 120 KB-gz text-shell budget. |
| `dist/assets/index-DnCwDd9F.css` | 45.88 KB | 19.06 KB | Phase 1 baseline; unchanged. |
| Webfont assets (woff/woff2 ×11) | various | n/a | Phase 1 baseline; unchanged. |

**No `ThreeDShell-*.js` chunk exists yet** — that lands when Plan 02-02 wires `React.lazy(() => import('../shells/ThreeDShell'))` and Plan 02-04 ships the actual scene component. The filename pattern is now locked in advance so Plan 02-05's size-limit glob can target it without ambiguity.

## Decisions Made

- **Tilde ranges, not caret** (Pitfall 16 from Phase 1) — R3F + three + drei drift within minors and a `^9.6.1` install would silently allow `9.7` next install which may lift the `three` peer range out of `0.184`. `~9.6.1` constrains to patches.
- **4-token mirror, not 8-token** — `fg / muted / negative / focus` are DOM-only per UI-SPEC § Color mapping table. Mirror grows lazily as in-canvas use cases land; over-mirroring now would couple unrelated DOM tokens to R3F materials.
- **`it.each` table over 4 separate `it()` blocks** — per-token failure isolation in the reporter when drift occurs; surface ↔ surface-1 mapping asymmetry is one row, not an inline `if`.
- **Hyphenated prose ("manual-chunks") in vite.config.ts comments** — the acceptance criteria require `! grep -F "manualChunks" vite.config.ts` to exit 0. Using the literal PascalCase substring in a *warning comment* would false-positive that gate, even though the warning is informational. Hyphenated prose preserves intent without tripping the gate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] npm pinned `three` with caret instead of tilde on first install**

- **Found during:** Task 1 (`npm install three@~0.184.0 …`)
- **Issue:** Despite the explicit `~0.184.0` argument, npm wrote `"three": "^0.184.0"` to `package.json`. R3F and drei landed correctly with tilde, but `three` flipped to caret. This violates the plan's `grep -E '"three":\s*"~0\.184'` acceptance gate AND Pitfall 16.
- **Fix:** Manually edited `package.json` to `"three": "~0.184.0"`, ran `npm install` again to regenerate `package-lock.json` against the corrected range. Lock file resolved to the same `0.184.0` version, so no transitive churn.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `grep -E '"three":\s*"~0\.184' package.json` matches; `npm ls three` reports `three@0.184.0`.
- **Committed in:** `dd0554f` (Task 1 commit)

**2. [Rule 1 — Bug] Plan-prescribed source code violates plan-prescribed acceptance grep**

- **Found during:** Task 3 (post-Edit gate sweep)
- **Issue:** The plan's verbatim Step 3.1 source code includes a comment `// Do NOT add manualChunks: it actively breaks React.lazy auto-chunking …`. The plan's verbatim Step 3.3 + acceptance criteria require `! grep -F "manualChunks" vite.config.ts` to exit 0. Pasting the verbatim code AND running the verbatim gate would self-contradict — the warning comment would match the grep.
- **Fix:** Reformulated the inline comments to use hyphenated prose ("manual-chunks", "manual-chunk entry", "manual chunking") so the literal PascalCase substring appears nowhere in `vite.config.ts`. The architectural intent (forbid the option, cite Vite #17653) is preserved in prose. Documented the substitution in the commit message and in this Summary so future contributors know the gate is intentional, not accidental.
- **Files modified:** `vite.config.ts`
- **Verification:** `grep -F "manualChunks" vite.config.ts` exits 1 (no match); `! grep -F "manualChunks" vite.config.ts` exits 0; build still passes; comment still warns the next reader.
- **Committed in:** `95f58e3` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (Rule 1 × 2 — both bugs in the supplied artifact set, not in our work product)
**Impact on plan:** Neither deviation altered the plan's intent. Deviation 1 corrected an npm tooling quirk; deviation 2 reconciled a self-contradiction internal to the plan source. All acceptance gates the plan declared as passing are passing.

## Issues Encountered

- **Tooling stutter mid-execution:** A burst of cancelled parallel `Bash`/`Read` tool calls (visible in the conversation history but not in any committed artifact) interrupted my initial discovery phase. Recovered by restarting the session sequentially and re-loading the plan + state files cleanly. No work was lost; no commits were made during the stutter period. Productive execution time was ~3 minutes.

## CI Gate Confirmation (post-Task-3, all green)

| Gate | Command | Exit |
|------|---------|------|
| TypeScript | `npx tsc --noEmit` | 0 |
| ESLint | `npx eslint . --max-warnings=0` | 0 |
| Prettier | `npx prettier --check .` | 0 |
| Vitest | `npm test` | 0 (18 tests passed: 14 Phase 1 + 4 new drift-gate) |
| Vite build | `npm run build` | 0 (entry 64.05 KB gz, unchanged from Phase 1) |

## Negative-Assertion Confirmation

| Check | Command | Result |
|-------|---------|--------|
| App.tsx has zero R3F imports | `grep -F '@react-three' src/app/App.tsx` | exit 1 (no match) |
| src/ has zero R3F or three.js imports | `grep -rE "from '@react-three\|from 'three'" src/` | exit 1 (no match) |
| No forbidden packages in package.json | `grep -E '"(@react-three/postprocessing\|gsap\|motion\|framer-motion\|zustand\|@gltf-transform/cli\|gltfjsx\|leva\|r3f-perf)"' package.json` | exit 1 (no match) |
| No manual-chunks declaration in vite.config.ts | `grep -F "manualChunks" vite.config.ts` | exit 1 (no match) |
| Token-drift test passes for all 4 mirrored tokens | `npm test -- src/scene/colors.test.ts` | exit 0, 4/4 assertions green |

## User Setup Required

None — no external service configuration required. All work is local-source / local-build.

## Next Phase Readiness

Plans 02-02 (capability detection + lazy import) and 02-04 (procedural scene composition) are both unblocked:

- 02-02 can write `React.lazy(() => import('../shells/ThreeDShell'))` knowing Vite will emit `dist/assets/ThreeDShell-[hash].js` (filename pattern locked in 02-01).
- 02-04 can author R3F materials reading `import { SCENE_COLORS } from '../scene/colors'` knowing the four HEX values are drift-protected against `tokens.css`.
- 02-05 can author a size-limit glob `dist/assets/ThreeDShell-*.js` knowing the chunk filename will exist and match.

No blockers introduced. STATE.md blockers carried from Phase 2 context (real-device QA matrix; Phase 4 GLB authoring path) remain Phase-4 concerns and are unaffected by 02-01.

## Self-Check: PASSED

- [x] `src/scene/colors.ts` exists (verified `test -f`)
- [x] `src/scene/colors.test.ts` exists (verified `test -f`)
- [x] All four `SCENE_COLORS` HEX values present (`#0d1117`, `#161b22`, `#7ee787`, `#e3b341`)
- [x] Drift test passes (4/4 assertions, 18/18 vitest total)
- [x] `vite.config.ts` declares `chunkFileNames`, `entryFileNames`, `assetFileNames` under `build.rollupOptions.output`
- [x] `vite.config.ts` does NOT declare manual-chunks (`grep -F "manualChunks"` exits 1)
- [x] `package.json` declares `three@~0.184.0`, `@react-three/fiber@~9.6.1`, `@react-three/drei@~10.7.7` under `dependencies`
- [x] `package.json` declares `size-limit@~12.1.0`, `@size-limit/preset-app@~12.1.0` under `devDependencies`
- [x] All three task commits exist in git log:
  - `dd0554f` (Task 1: install deps)
  - `db5e499` (Task 2: SCENE_COLORS + drift test)
  - `95f58e3` (Task 3: rollup output naming)
- [x] All five CI gates pass (`tsc`, `eslint`, `prettier`, `vitest`, `vite build`)
- [x] No forbidden packages introduced (8 negative greps all exit 1)
- [x] App.tsx has zero R3F imports
- [x] Bundle size unchanged from Phase 1 baseline (entry 64.05 KB gz)

---
_Phase: 02-3d-shell-asset-pipeline-capability-gating_
_Completed: 2026-05-06_
