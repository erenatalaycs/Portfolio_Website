---
phase: 02-3d-shell-asset-pipeline-capability-gating
plan: 02
subsystem: shell-routing
tags: [react.lazy, suspense, capability-detection, code-splitting, context-loss]

requires:
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 01
    provides: R3F/drei/three deps + chunkFileNames pattern + SCENE_COLORS mirror
provides:
  - "src/lib/detectCapability.ts — synchronous 5-check heuristic + 4 helpers (isIpad/isAndroidTablet/isPhone/hasWebGL2) + CapabilityResult type"
  - "src/lib/detectCapability.test.ts — 18 vitest assertions across tablet vs phone, all five dimensions, composite multi-failure"
  - "src/app/App.tsx — canonical decision tree: contextLost → ?view=3d (D-02 bypass) → ?view=text → detectCapability().pass"
  - "src/shells/ThreeDShell.tsx — PLACEHOLDER stub with default export + onContextLost prop contract (Plan 04 overwrites)"
  - "src/ui/ContextLossBar.tsx — PLACEHOLDER stub with role=status aria-live=polite (Plan 03 overwrites)"
affects:
  - "02-03 (must overwrite src/ui/ContextLossBar.tsx with full UI-SPEC implementation; the export name `ContextLossBar` is locked)"
  - "02-04 (must overwrite src/shells/ThreeDShell.tsx; the default export shape + `onContextLost: () => void` prop signature are contract-locked)"
  - "02-05 (size-limit glob pattern dist/assets/ThreeDShell-*.js now hits a real chunk: ThreeDShell-CEqg88OC.js, 0.30 KB raw / 0.25 KB gz)"

tech-stack:
  added: []
  patterns:
    - "React.lazy(() => import('../shells/ThreeDShell')) — Vite/Rollup auto-chunks the import into a deterministically-named lazy chunk thanks to Plan 02-01's chunkFileNames lock"
    - "Suspense fallback={<TextShell />} pattern — uses the already-bundled TextShell as the loading boundary (per 3D-01)"
    - "Capability heuristic = synchronous one-shot, no subscription/polling, called ONCE per <App /> render when no ?view= override"
    - "iPad/Android tablet pass-through (D-01) — modern tablets are 3D-capable; phone classification excludes tablets"
    - "DEV-only logging gated by import.meta.env.DEV — Vite dead-code-eliminates the branch in production (no UA fingerprint exposure)"
    - "Placeholder + contract-lock pattern for downstream plans — files exist with clear PLACEHOLDER markers and locked export shapes so Plans 03/04 know exactly what to overwrite"

key-files:
  created:
    - src/lib/detectCapability.ts
    - src/lib/detectCapability.test.ts
    - src/shells/ThreeDShell.tsx
    - src/ui/ContextLossBar.tsx
  modified:
    - src/app/App.tsx

key-decisions:
  - "Used the existing __setReducedMotion helper from tests/setup.ts for the prefers-reduced-motion test, not the matchMedia re-stub fallback the plan suggested — the project polyfill already exposes the per-query setter cleanly"
  - "iPhone test cases set platform: 'iPhone' explicitly (not relying on jsdom default) so the iPad MacIntel+maxTouchPoints branch doesn't false-positive when previous tests left platform=MacIntel"
  - "ThreeDShell placeholder references props.onContextLost via `void props.onContextLost` rather than naming the parameter `_props` — the project's tseslint config does not auto-allow underscore-prefixed args, and a `void` reference satisfies the linter without an inline disable"
  - "DEV-gated console.debug used a plain call (no eslint-disable-next-line no-console comment) — the project's eslint config does not enable no-console, so the disable directive would have triggered the no-unused-disable rule"

requirements-completed:
  - 3D-01
  - 3D-02
  - 3D-09

duration: 5min
completed: 2026-05-06
---

# Phase 02 Plan 02: Capability Detection + Lazy ThreeDShell Wiring Summary

**Authored `detectCapability()` (5 checks + tablet pass-through, 18 vitest assertions) and rewired `<App />` as the canonical Phase-2 decision tree (contextLost → ?view=3d bypass → ?view=text → capability gate). The build now emits a separate `dist/assets/ThreeDShell-CEqg88OC.js` chunk via React.lazy, proving Plan 02-01's chunkFileNames lock works end-to-end. Placeholder ThreeDShell + ContextLossBar files ship with PLACEHOLDER markers and locked export shapes so Plans 03/04 can overwrite them without ambiguity.**

## Performance

- **Duration:** ~5 min
- **Tasks:** 2 (1 TDD-style heuristic + tests, 1 wiring + placeholders)
- **Files created:** 4 (detectCapability.ts/.test.ts, ThreeDShell.tsx, ContextLossBar.tsx)
- **Files modified:** 1 (App.tsx)

## Accomplishments

- `detectCapability()` ships the canonical Pattern-2 reference implementation: WebGL2 probe via offscreen canvas, prefers-reduced-motion via matchMedia, phone classification (excluding iPad/Android tablets per D-01), `deviceMemory<4`, and `hardwareConcurrency<=4`. Returns `{ pass, reasons }` with reasons populated for DEV-only debugging.
- iPad disambiguation handles all three real-world UA shapes: legacy `iPad` UA, iPadOS 13+ `Macintosh` UA + `maxTouchPoints>1`, and Android tablet (Android UA without `Mobile` token). Tablets pass through to 3D shell — 18-assertion test suite locks each path.
- DEV-only logging via `import.meta.env.DEV` — verified absent from production console (security_context "no UA fingerprinting in prod"). Production bundle dead-code-eliminates the entire branch.
- `<App />` rewritten as the Phase-2 canonical decision point. Phase 1's `?focus=` scroll behaviour and `isKnownPath` / `<NotFound />` branch preserved verbatim (no regression). New behaviour additive on top.
- Lazy import + Suspense + capability gate work end-to-end: `npm run build` now emits a separate `ThreeDShell-CEqg88OC.js` chunk (0.30 KB raw / 0.25 KB gz — placeholder is tiny, Plan 04's real Canvas+Workstation will fatten it toward the 450 KB-gz budget).
- Plan 03 and Plan 04 contract surface locked: `ContextLossBar` named export, `ThreeDShell` default export + `onContextLost: () => void` prop. Both files marked PLACEHOLDER for downstream overwrite.

## Task Commits

1. **Task 1: Author detectCapability.ts + tests** — `159338a` (feat)
2. **Task 2: Wire lazy ThreeDShell + capability gate + context-loss state** — `e98d28e` (feat)

_All gates passed at the moment of each commit: `tsc`, `eslint . --max-warnings=0`, `prettier --check`, `vitest`, `vite build`._

## Bundle Size Inventory (post-build)

| Asset | Raw | Gzip | vs Plan 01 baseline |
|-------|-----|------|---------------------|
| `dist/assets/index-Dxhub4Yu.js` (entry) | 209.07 KB | 65.06 KB | +1.01 KB gz (new lazy + Suspense + capability + ContextLossBar wiring) |
| `dist/assets/index-DnCwDd9F.css` | 45.88 KB | 19.06 KB | unchanged |
| `dist/assets/ThreeDShell-CEqg88OC.js` (lazy) | 0.30 KB | 0.25 KB | NEW — placeholder only; Plan 04 fattens this |
| Webfont assets | various | n/a | unchanged |

**Confirmation: text-shell entry is 65.06 KB gz — well under Plan 02-05's 120 KB-gz budget.**

The `ThreeDShell-*.js` filename pattern proves Vite/Rollup honours Plan 02-01's `chunkFileNames: 'assets/[name]-[hash].js'` config: the chunk is named after the lazy-imported module's default-export source file, not generic `chunk-xxx.js`. Plan 02-05's size-limit glob will resolve this deterministically.

## Decisions Made

- **Used `tests/setup.ts` `__setReducedMotion` helper** — Phase 1 already ships a per-query matchMedia polyfill exposing this exact setter. Cleaner than the matchMedia re-stub fallback the plan source suggested.
- **iPhone tests explicitly set `platform: 'iPhone'`** — `restoreNavigator()` in `beforeEach` sets `platform: 'MacIntel'`, and an iPhone test that sets only `userAgent` + `maxTouchPoints: 5` would inherit `MacIntel` and trigger the iPadOS-13+ branch in `isIpad()`. Setting `platform: 'iPhone'` matches real device behaviour and isolates the phone classification.
- **`void props.onContextLost` over `_props` underscore prefix** — the project's `typescript-eslint` config does not auto-allow underscore-prefixed unused args; a `void` reference is the cleanest no-op that satisfies the linter without an inline disable comment. Plan 04 will replace with real consumption.
- **No `eslint-disable-next-line no-console` on the DEV-only `console.debug`** — the project's eslint config does not enable `no-console`, so the disable directive triggers the unused-directive warning. Removed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 — Bug] iPhone test cases inherited `platform: 'MacIntel'` from beforeEach reset**

- **Found during:** Task 1 (initial `npm test -- detectCapability` run after authoring)
- **Issue:** Three test assertions failed (`iPhone UA → phone`, `iPhone UA → fail with phone reason`, `multiple failures aggregate in reasons array`). Root cause: `restoreNavigator()` in `beforeEach` sets `platform: 'MacIntel'`, and the iPhone tests only override `userAgent` + `maxTouchPoints`. `isIpad()`'s second branch (`platform === 'MacIntel' && maxTouchPoints > 1`) fires, classifying the iPhone-UA test as an iPad and zeroing the `phone` reason.
- **Fix:** Added explicit `platform: 'iPhone'` to all three iPhone test cases. Matches real device behaviour (real iPhones report `navigator.platform === 'iPhone'`) and isolates the phone classification from the iPad disambiguation logic.
- **Files modified:** `src/lib/detectCapability.test.ts`
- **Verification:** `npm test -- detectCapability` — 18/18 pass.
- **Committed in:** `159338a` (Task 1 commit)

**2. [Rule 1 — Bug] Plan-prescribed `_props` parameter naming violates project tseslint config**

- **Found during:** Task 2 (post-Edit gate sweep on `npx eslint . --max-warnings=0`)
- **Issue:** The plan's verbatim Step 2.3 source code names the placeholder ThreeDShell prop `_props: ThreeDShellProps`. The project's `eslint.config.js` uses `tseslint.configs.recommended` without an `argsIgnorePattern` for `^_`, so `@typescript-eslint/no-unused-vars` flags `_props` as an error.
- **Fix:** Renamed parameter to `props` and added a `void props.onContextLost;` no-op statement so the linter sees the prop as referenced. The architectural intent (a placeholder that does nothing yet) is preserved; Plan 04 will replace with real `props.onContextLost()` consumption from the Canvas onCreated handler.
- **Files modified:** `src/shells/ThreeDShell.tsx`
- **Verification:** `npx eslint . --max-warnings=0` exits 0.
- **Committed in:** `e98d28e` (Task 2 commit)

**3. [Rule 1 — Bug] Plan-prescribed `// eslint-disable-next-line no-console` triggers unused-directive warning**

- **Found during:** Task 1 (post-Edit gate sweep on `npx eslint --max-warnings=0`)
- **Issue:** The plan's verbatim source code includes `// eslint-disable-next-line no-console` above the DEV-gated `console.debug` call. The project's eslint config does NOT enable the `no-console` rule, so the disable directive itself produces the warning "Unused eslint-disable directive (no problems were reported from 'no-console')" — which fails `--max-warnings=0`.
- **Fix:** Removed the disable directive. The `console.debug` call is now bare; the rule is not enabled in the project, so no lint warning fires.
- **Files modified:** `src/lib/detectCapability.ts`
- **Verification:** `npx eslint src/lib/detectCapability.ts --max-warnings=0` exits 0.
- **Committed in:** `159338a` (Task 1 commit)

**4. [Rule 1 — Bug] Source comment containing the literal "localStorage" violates `! grep -F "localStorage"` acceptance gate**

- **Found during:** Task 1 (post-author negative-assertion gate)
- **Issue:** The plan's verbatim header comment in `detectCapability.ts` reads "Per D-12, this runs every page load fresh; no localStorage cache." The plan's own acceptance criterion `! grep -F "localStorage" src/lib/detectCapability.ts` would fail because the comment matches.
- **Fix:** Reworded the comment to "no client-side caching layer" — preserves the architectural intent (D-12 lock — no per-session persistence) while keeping the literal substring `localStorage` out of the file. Same self-contradiction pattern as Plan 02-01's `manualChunks` resolution.
- **Files modified:** `src/lib/detectCapability.ts`
- **Verification:** `! grep -F "localStorage" src/lib/detectCapability.ts` exits 0.
- **Committed in:** `159338a` (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (Rule 1 × 4 — three were source-vs-acceptance-gate self-contradictions in the supplied plan; one was a real test-isolation bug). None altered the plan's intent.
**Impact on plan:** None. Acceptance gates the plan declared as passing are passing.

## Stub-Overwrite Contract for Downstream Plans

Both placeholder files MUST be replaced wholesale by their downstream plan. The contracts are locked:

### `src/ui/ContextLossBar.tsx` — overwritten by Plan 02-03

- **Locked export name:** `ContextLossBar` (named export, `export function ContextLossBar`)
- **Plan 03 implementation:** info bar with `[!]` warn-color glyph, body copy `3D scene unavailable on this device. You're on the text shell.`, `[retry 3D]` BracketLink, `[×]` dismiss button, `role="status"` `aria-live="polite"`, 8-second auto-dismiss timer, NO fade animation (instant cut respects prefers-reduced-motion automatically).
- **Verification grep for Plan 03 acceptance:** `! grep -F "PLACEHOLDER" src/ui/ContextLossBar.tsx` (passes once Plan 03 overwrites).

### `src/shells/ThreeDShell.tsx` — overwritten by Plan 02-04

- **Locked export shape:** `export default function ThreeDShell(props: { onContextLost: () => void })`
- **Plan 04 implementation:** `<header>` (shared) + `<main><Canvas onCreated={({ gl }) => gl.canvas.addEventListener('webglcontextlost', () => props.onContextLost())}><Lighting /><Workstation /><OrbitControls /></Canvas></main>` + `<footer>` — replaces the placeholder div entirely.
- **Verification grep for Plan 04 acceptance:** `! grep -F "PLACEHOLDER" src/shells/ThreeDShell.tsx` (passes once Plan 04 overwrites).

The downstream executors must NOT append to or modify these files in place — they ship new content wholesale.

## matchMedia Polyfill API Used

The detectCapability test uses `__setReducedMotion(matches: boolean)` exported from `tests/setup.ts`. The polyfill registers `(prefers-reduced-motion: reduce)` in a per-query Map and the helper sets the `matches` property + dispatches the change event to all listeners. No matchMedia re-stub fallback was needed.

## CI Gate Confirmation (post-Task-2, all green)

| Gate | Command | Exit |
|------|---------|------|
| TypeScript | `npx tsc --noEmit` | 0 |
| ESLint | `npx eslint . --max-warnings=0` | 0 |
| Prettier | `npx prettier --check .` | 0 |
| Vitest | `npm test` | 0 (36 tests passed: 18 Phase-1 + 18 new detectCapability) |
| Vite build | `npm run build` | 0 (entry 65.06 KB gz; ThreeDShell chunk emitted at 0.25 KB gz) |

## Negative-Assertion Confirmation

| Check | Command | Result |
|-------|---------|--------|
| App.tsx has zero static R3F imports | `grep -F "from '@react-three/fiber'" src/app/App.tsx` | exit 1 (no match) |
| App.tsx has zero static drei imports | `grep -F "from '@react-three/drei'" src/app/App.tsx` | exit 1 (no match) |
| App.tsx has zero static three imports | `grep -F "from 'three'" src/app/App.tsx` | exit 1 (no match) |
| App.tsx has zero localStorage usage | `grep -F "localStorage" src/app/App.tsx` | exit 1 (no match) |
| detectCapability.ts has zero localStorage usage | `grep -F "localStorage" src/lib/detectCapability.ts` | exit 1 (no match) |
| detectCapability.ts has zero `fetch(` calls | `grep -F "fetch(" src/lib/detectCapability.ts` | exit 1 (no match) |
| Entry chunk does not contain OrbitControls | `grep -l "OrbitControls" dist/assets/index-*.js` | exit 1 (no match — informational; load-bearing once Plan 04 imports R3F) |

## User Setup Required

None — no external service configuration required.

## Next Plan Readiness

Plans 02-03, 02-04, and 02-05 are all unblocked:

- **02-03 (ContextLossBar UI):** can overwrite `src/ui/ContextLossBar.tsx` with the full UI-SPEC implementation; the named export `ContextLossBar` is the import target App.tsx is already using.
- **02-04 (ThreeDShell + Workstation):** can overwrite `src/shells/ThreeDShell.tsx` with the real R3F implementation; the `default export` shape and `onContextLost: () => void` prop signature are already consumed by App.tsx — no App.tsx change needed once Plan 04 lands.
- **02-05 (size-limit budgets):** can author the `dist/assets/ThreeDShell-*.js` glob in `package.json` size-limit field knowing the chunk filename pattern (`ThreeDShell-[hash].js`) is now real, not theoretical.

No blockers introduced. STATE.md blockers (real-device QA matrix, Phase 4 GLB authoring path) remain Phase-4 concerns.

## Self-Check: PASSED

- [x] `src/lib/detectCapability.ts` exists; exports `detectCapability`, `isIpad`, `isAndroidTablet`, `isPhone`, `hasWebGL2`, `CapabilityResult`
- [x] `src/lib/detectCapability.test.ts` exists; 18 assertions; covers tablet vs phone disambiguation, all five dimensions, composite multi-failure
- [x] `src/app/App.tsx` declares `lazy(() => import('../shells/ThreeDShell'))` — verified by grep
- [x] `src/app/App.tsx` decision tree matches UI-SPEC pseudocode (contextLost → ?view=3d → ?view=text → capability gate)
- [x] `src/app/App.tsx` lifts `contextLost` boolean and passes `onContextLost={() => setContextLost(true)}` to ThreeDShell — verified by grep
- [x] `src/app/App.tsx` does NOT statically import from `@react-three/fiber`, `@react-three/drei`, or `three` — verified by 3 negative greps
- [x] `src/ui/ContextLossBar.tsx` exists with PLACEHOLDER marker; named export `ContextLossBar`
- [x] `src/shells/ThreeDShell.tsx` exists with PLACEHOLDER marker; default export with `onContextLost` prop
- [x] `dist/assets/ThreeDShell-*.js` chunk emitted by `npm run build` — `ThreeDShell-CEqg88OC.js` (0.30 KB raw / 0.25 KB gz)
- [x] All five CI gates pass (`tsc`, `eslint`, `prettier`, `vitest`, `vite build`)
- [x] Both task commits exist in git log: `159338a`, `e98d28e`
- [x] Phase 1 `?focus=` scroll behaviour preserved in App.tsx (verified by grep)
- [x] Phase 1 `isKnownPath` / `<NotFound />` branch preserved in App.tsx (verified by grep)

---
_Phase: 02-3d-shell-asset-pipeline-capability-gating_
_Completed: 2026-05-06_
