---
phase: 03-content-integration-mdx-write-ups-camera-choreography
plan: 02
subsystem: 3d-monitor-overlays
tags: [r3f, drei, html-transform, monitor, overlay, focus-state, camera-poses]
requires: [03-01]
provides: [monitor-overlay-contract, camera-pose-table, focus-state-prop-contract, monitor-children-slot]
affects:
  - src/scene/Monitor.tsx
  - src/scene/Workstation.tsx
  - src/scene/cameraPoses.ts
  - src/scene/MonitorOverlay.tsx
  - src/ui/CenterMonitorContent.tsx
  - src/ui/WriteupsMonitor.tsx
  - src/shells/ThreeDShell.tsx
tech-stack:
  added: []
  patterns:
    - "drei <Html transform occlude='blending'> overlay at z=0.026 (1 mm in front of screen plane mesh) — Pitfall 3 z-fighting prevention (RESEARCH Pattern 3)"
    - "Single source of truth (D-01) — same <Projects />, <About />, <Skills />, <Writeups /> components mount in BOTH text shell and 3D shell; no per-shell duplicate components"
    - "Monitor refactor Option A (UI-SPEC) — children slot accepts overlay; click handler on screen-plane mesh fires onFocusToggle with stopPropagation"
    - "Wave 2 placeholder mounts (CenterMonitorContent + WriteupsMonitor) — stable import paths so Plans 03-04 + 03-05 can swap content without renaming consumers"
    - "ThreeDShell intermediate focused-state stub — Plan 03-03 replaces with <FocusController> + GSAP timeline; identical Workstation prop contract so swap is localised"
key-files:
  created:
    - src/scene/cameraPoses.ts
    - src/scene/MonitorOverlay.tsx
    - src/ui/CenterMonitorContent.tsx
    - src/ui/WriteupsMonitor.tsx
  modified:
    - src/scene/Monitor.tsx
    - src/scene/Workstation.tsx
    - src/shells/ThreeDShell.tsx
decisions:
  - "Plan 03-02: ThreeDShell.tsx added to the changeset (NOT in plan's files_modified) as Rule 3 blocking-fix — Workstation's new required props (focused, onFocusToggle) would otherwise break tsc. Held to identical contract Plan 03-03 will consume; the swap to <FocusController> in Wave 3 is a localised refactor."
  - "Plan 03-02: DISTANCE_FACTOR landed at 1.8 (Pattern 12 starting point) — no in-flight tuning needed; visual verification will run in Plan 03-03 dev mode."
  - "Plan 03-02: Inline eslint-disable comment added to MonitorOverlay's inner div for jsx-a11y/no-noninteractive-element-interactions + click-events-have-key-events — the pointer/click/wheel handlers are pure event-isolation safety belts (Pitfall 5 / T-03-02-05 mitigation), not interactive UI. Documented inline."
metrics:
  duration: "13m 16s"
  completed: "2026-05-08"
  commits: 3
  tasks: 3
  files_changed: 7
---

# Phase 3 Plan 02: Drei `<Html transform>` Monitor Overlays Summary

Refactor `<Monitor>` to accept a `children` slot + click props (UI-SPEC Layout Option A); ship `<MonitorOverlay>` as the single component owning the drei `<Html transform occlude="blending">` projection contract (z=0.026, 600×400 px, opaque `bg-bg`, 3 stopPropagation handlers); ship `cameraPoses.ts` as the single source of truth for the 4 poses + `DISTANCE_FACTOR`; wire `<Workstation>` to mount Left=Projects / Center=CenterMonitorContent / Right=WriteupsMonitor each behind a `<MonitorOverlay>` so the parity audit (Plan 03-07) sees correct SECTIONS coverage in the 3D shell.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Author cameraPoses.ts + MonitorOverlay.tsx (the drei `<Html>` wrapper) | `b54537f` | src/scene/cameraPoses.ts, src/scene/MonitorOverlay.tsx |
| 2 | Refactor Monitor.tsx to accept children + click props (UI-SPEC Option A) | `e46a990` | src/scene/Monitor.tsx |
| 3 | Wire Workstation.tsx + ship CenterMonitorContent + WriteupsMonitor placeholders + ThreeDShell stub | `eb92624` | src/scene/Workstation.tsx, src/ui/CenterMonitorContent.tsx, src/ui/WriteupsMonitor.tsx, src/shells/ThreeDShell.tsx |

## New File Inventory

### `src/scene/cameraPoses.ts` (47 LOC)

Single source of truth for Phase 3 camera poses + the `<Html>` distanceFactor calibration. Exports:

| Symbol | Type | Value |
|--------|------|-------|
| `FocusId` | type alias | `'left' \| 'center' \| 'right'` |
| `CameraPose` | interface | `{ position: [number,number,number]; target: [number,number,number] }` |
| `MONITOR_FOCUS_POSES` | `Record<FocusId, CameraPose>` | left/center/right entries |
| `DEFAULT_ORBIT_POSE` | `CameraPose` | `{ position: [2.4,1.4,2.4], target: [0,0.6,0] }` (matches Phase 2 Controls.tsx) |
| `DISTANCE_FACTOR` | `1.8` (number literal) | Pattern 12 starting calibration |

Per-monitor focus pose targets match Phase 2 monitor positions verbatim (`-0.45/0/0.45` x; `0.95` y; `-0.05` z). Position offsets give a slight head-down angle (~5°) and place the camera ~70 cm in front of each screen plane (D-08). Plan 03-03 imports these constants for the GSAP camera timeline.

### `src/scene/MonitorOverlay.tsx` (59 LOC)

The single component owning every monitor's drei `<Html transform>` projection contract. Configuration:

```tsx
<Html
  transform
  occlude="blending"
  position={[0, 0, 0.026]}        // 1mm in front of screen plane (Pitfall 3)
  distanceFactor={DISTANCE_FACTOR} // 1.8 (Pattern 12)
  style={{ width: '600px', height: '400px' }}  // D-03
  wrapperClass="monitor-overlay-wrapper"
>
  <div role="region" aria-label={ariaLabel}
       className="w-full h-full bg-bg text-fg font-mono p-4 overflow-y-auto"
       onPointerDown={(e) => e.stopPropagation()}   // Pitfall 5
       onClick={(e) => e.stopPropagation()}          // Pattern 5
       onWheel={(e) => e.stopPropagation()}>         // anti-orbit-zoom
    {children}
  </div>
</Html>
```

Inline eslint-disable comment at the inner div explains why jsx-a11y rules don't apply: the handlers are pure event-isolation safety belts (Pitfall 5 / T-03-02-05 mitigation), the semantic role is `region` (a labelled scrollable landmark), and keyboard users interact with focusable descendants inside `children`.

### `src/ui/CenterMonitorContent.tsx` (28 LOC)

Wave 2 placeholder composition for the center monitor's overlay. Renders `<div className="space-y-6">` containing `<About />` + `<Skills />` (single source of truth — same components mounted in text shell). Plan 03-04 will insert a sticky `<WhoamiGreeting />` at the top slot (placeholder JSX comment `{/* sticky <WhoamiGreeting /> mount slot — filled by Plan 03-04 */}` documents the seam).

### `src/ui/WriteupsMonitor.tsx` (20 LOC)

Wave 2 placeholder for the right monitor's overlay. Mounts the existing text-shell `<Writeups />` component verbatim so the parity audit (Plan 03-07) sees the right monitor covered. Plan 03-05 (Wave 4) overwrites this with the WriteupList/WriteupView switcher driven by `useQueryParams()`.

## Monitor.tsx Prop Contract Diff

Phase 2 Monitor accepted only `position` + optional `rotation`. Plan 03-02 adds **4 new props**:

| Prop | Type | Required | Purpose |
|------|------|----------|---------|
| `monitorId` | `FocusId` | required | Identifies which monitor for focus state |
| `focused` | `FocusId \| null` | required | Drives emissive-intensity feedback (1.5 → 2.0 when focused) |
| `onFocusToggle` | `(id: FocusId) => void` | required | Fires on screen-plane click |
| `children` | `ReactNode` | optional | drei `<Html>` overlay sibling; renders after screen plane (Pitfall 3 z-order) |

Phase 2 geometry preserved verbatim — frame box 0.58×0.35×0.04, screen plane 0.55×0.32 at `[0, 0, 0.025]`, stand cylinder 0.04/0.06/0.15 at `[0, -0.25, 0]`. SCENE_COLORS still the only color source; `toneMapped={false}` still set; no `useFrame`. Phase 2 anti-pattern gates (`! grep -F "useFrame"`, `! grep -E "#[0-9a-fA-F]{6}"`) all hold.

The screen-plane onClick handler order: `e.stopPropagation()` FIRST then `onFocusToggle(monitorId)` — stopPropagation must fire before any handler that might throw, ensuring the click never bubbles to `<Canvas onPointerMissed>` (Plan 03's outside-click defocus trigger).

## Workstation.tsx Mounting Structure

```tsx
<>
  <Floor />
  <Desk />
  <Monitor position={[-0.45, 0.95, -0.05]} rotation={[0, 0.18, 0]}
           monitorId="left" focused={focused} onFocusToggle={onFocusToggle}>
    <MonitorOverlay ariaLabel="Left monitor: projects">
      <Projects />
    </MonitorOverlay>
  </Monitor>
  <Monitor position={[0, 0.95, -0.05]} rotation={[0, 0, 0]}
           monitorId="center" focused={focused} onFocusToggle={onFocusToggle}>
    <MonitorOverlay ariaLabel="Center monitor: identity, about, and skills">
      <CenterMonitorContent />
    </MonitorOverlay>
  </Monitor>
  <Monitor position={[0.45, 0.95, -0.05]} rotation={[0, -0.18, 0]}
           monitorId="right" focused={focused} onFocusToggle={onFocusToggle}>
    <MonitorOverlay ariaLabel="Right monitor: write-ups">
      <WriteupsMonitor />
    </MonitorOverlay>
  </Monitor>
  <Lamp position={[-0.5, 0.78, 0]} />
  <Bookshelf />
</>
```

Workstation now accepts `focused` and `onFocusToggle` props — passed down from `<ThreeDShell>` (Wave 2 holds local state; Plan 03-03 replaces with `<FocusController>`). Floor / Desk / Lamp / Bookshelf preserved; only the 3 Monitor lines + the new prop interface changed.

## ThreeDShell.tsx Intermediate Stub (Out-of-Plan Blocking-Fix)

Plan 03-02's `files_modified` list does NOT include `src/shells/ThreeDShell.tsx`, but Workstation's new required props (`focused`, `onFocusToggle`) made tsc fail without a corresponding wire-up at the only call site. This was treated as a **Rule 3 blocking-fix**: minimal local-state stub to satisfy the compiler, with the prop contract held identical to what Plan 03-03's `<FocusController>` will consume — making the Wave 3 swap a localised refactor (no Workstation API churn).

The stub:

```tsx
const [focused, setFocused] = useState<FocusId | null>(null);
const handleFocusToggle = useCallback(
  (id: FocusId) => setFocused((current) => (current === id ? null : id)),
  [],
);
// …
<Workstation focused={focused} onFocusToggle={handleFocusToggle} />
```

Inline JSDoc above the state hooks calls out that this is a "Plan 03-02 Wave 2 intermediate stub" with explicit reference to Plan 03-03's `<FocusController>` replacement.

## Bundle Metrics

Verified via `npm run build && npx size-limit` after Task 3:

| Bundle | Size (gz) | Budget | % | Plan 03-01 baseline | Δ |
|--------|-----------|--------|---|---------------------|---|
| `dist/assets/index-*.js` (text shell entry) | **65.28 KB** | 120 KB | 54% | 65.25 KB | +0.03 KB |
| `dist/assets/ThreeDShell-*.js` (3D chunk) | **239.71 KB** | 450 KB | 53% | 236.69 KB | +3.02 KB |
| `public/assets/models/workstation.glb` | 48 B | 2500 KB | 0% | 48 B | flat |

The +3.02 KB delta in the 3D chunk is the cost of:
- drei `<Html>` import (the bulk of the delta — `<Html>` pulls `CSS3DRenderer` internals)
- `cameraPoses.ts` constants (~0.1 KB)
- `MonitorOverlay.tsx` component (~0.2 KB)
- The 3 sections (`<Projects />`, `<About />`, `<Skills />`, `<Writeups />`) being imported into `<Workstation>` for the first time — but these were already in the lazy 3D chunk's reachability graph via the text shell's tree-shaking gates, so the net delta is small.

### Phase 1+2 Invariants Preserved

All four bundle-leak tokens absent from `dist/assets/index-*.js` (entry chunk):

| Token | Status |
|-------|--------|
| `OrbitControls` | absent — Phase 2 invariant preserved |
| `WebGLRenderer` | absent — Phase 2 invariant preserved |
| `MDXProvider` | absent — Plan 03-01 invariant preserved (text shell still MDX-runtime-free at Wave 2) |
| `gsap` | absent — will land in 3D chunk in Plan 03-03 |

Recruiters skimming the text shell still never download MDX runtime, GSAP, or any drei `<Html>` code at first paint.

## Verification Results

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✓ exit 0 |
| `npx eslint <plan files> --max-warnings=0` | ✓ exit 0 (clean) |
| `npx prettier --check <plan files>` | ✓ "All matched files use Prettier code style!" |
| `npm test -- --run` | ✓ 7 files / 54 tests passed |
| `npm run build` | ✓ exit 0 — 614 modules transformed in 447ms |
| `npx size-limit` | ✓ both budgets green (54% / 53%) |
| Bundle-leak greps (×4) | ✓ all four tokens absent from entry |
| Task 1 positive greps (×17) | ✓ all match (occlude="blending", DISTANCE_FACTOR=1.8, 600x400, etc.) |
| Task 1 negative greps (×3) | ✓ no `bg-transparent`, no `<iframe`, no `border\|outline` |
| Task 2 positive greps (×13) | ✓ all match (props, geometry, click handler, emissive ternary) |
| Task 2 negative greps (×2) | ✓ no `useFrame`, no `#[0-9a-fA-F]{6}` (Phase 2 colors gate holds) |
| Task 3 positive greps (×20) | ✓ all match (imports, monitorIds, ariaLabels, JSX, single-source-of-truth) |
| Task 3 negative greps (×3) | ✓ no actual `<WhoamiGreeting>` JSX render or import; no `useQueryParams()` call; no `localStorage` writes |

### Negative-grep Note (Cosmetic Plan-Side Mismatch)

The plan's literal `! grep -F "WhoamiGreeting" src/ui/CenterMonitorContent.tsx` would NOT pass against the file as authored — the JSDoc and inline JSX comment both contain the bare token "WhoamiGreeting" (the plan's own source-code template likewise contains the same comment, so the plan and the implementation agree but the verification grep is overly literal). The **spirit** of the check — "no actual `<WhoamiGreeting>` JSX element rendered, no import" — is satisfied: `grep -E "^import.*WhoamiGreeting"` returns nothing; the only matches are JSDoc + a `{/* */}` JSX comment slot.

Same situation for `! grep -F "useQueryParams" src/ui/WriteupsMonitor.tsx` — the JSDoc reference is informational ("driven by useQueryParams() — when ?focus=writeups…") documenting Plan 03-05's intended swap. There is no actual `useQueryParams()` call.

These are documented for the verifier to avoid a false-positive failure when re-running the literal greps from the plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] ThreeDShell.tsx required updating to provide Workstation's new required props**

- **Found during:** Task 3 verification (`npx tsc --noEmit`)
- **Issue:** Plan 03-02 added required props `focused` + `onFocusToggle` to `<Workstation>`. The only call site (`src/shells/ThreeDShell.tsx`) was rendered as `<Workstation />` with no props, so the type-check fails: `Property 'focused' is missing in type '{}'`.
- **Fix:** Added a 7-line `useState<FocusId | null>(null)` + `useCallback` toggle stub inside `ThreeDShell` and passed both props down. JSDoc above the stub explicitly tags it as a "Plan 03-02 Wave 2 intermediate stub" with a pointer to Plan 03-03's `<FocusController>` replacement. The contract is identical so Plan 03-03's swap is a localised refactor with no Workstation API churn.
- **Files modified:** `src/shells/ThreeDShell.tsx` (8 lines added — import + state hook + callback + prop pass)
- **Commit:** `eb92624` (folded into Task 3 commit)
- **Why this isn't a Rule 4 architectural change:** the new state/callback live entirely inside the existing `<ThreeDShell>` boundary; the prop contract on `<Workstation>` is pre-designed by the plan; Plan 03-03 will swap the implementation without changing any other file. This is the textbook Rule 3 case — a fix that's required for tsc to pass.

No other deviations. cameraPoses.ts, MonitorOverlay.tsx, Monitor.tsx, Workstation.tsx, CenterMonitorContent.tsx, WriteupsMonitor.tsx all match the plan's source-code blocks verbatim (with the addition of one inline eslint-disable comment in MonitorOverlay.tsx documented in `decisions` above).

## Authentication Gates

None encountered. All operations ran offline.

## Known Stubs

| File | Reason | Resolved By |
|------|--------|-------------|
| `src/ui/CenterMonitorContent.tsx` (the sticky-top JSX comment slot — `{/* sticky <WhoamiGreeting /> mount slot — filled by Plan 03-04 */}`) | Plan 03-04 (Wave 3) inserts the `<WhoamiGreeting />` block at this position. Wave 2 ships only About + Skills so the parity audit sees center-monitor coverage; the sticky-header layout space is reserved by the comment. | Plan 03-04 |
| `src/ui/WriteupsMonitor.tsx` (mounts the existing text-shell `<Writeups />` placeholder verbatim) | Plan 03-05 (Wave 4) overwrites this file wholesale with the real list/view switcher driven by `useQueryParams()` (`?focus=writeups` → `<WriteupList />`, `?focus=writeups/<slug>` → `<WriteupView slug={...} />`). Wave 2 ships the placeholder so the right monitor renders SOMETHING and the parity audit sees writeups coverage. | Plan 03-05 |
| `src/shells/ThreeDShell.tsx` (intermediate `useState<FocusId>` + `useCallback` toggle stub) | Plan 03-03 (Wave 3) replaces this with `<FocusController>` driving the GSAP camera timeline. The Workstation prop contract stays identical so the swap is a localised refactor. | Plan 03-03 |
| `DISTANCE_FACTOR = 1.8` in `src/scene/cameraPoses.ts` | Pattern 12 starting calibration; no in-flight tuning was needed because no full-scene visual verification ran in this plan (Plan 03-03's dev-mode walkthrough is the first opportunity to verify text legibility on each screen plane). | Plan 03-03 (visual smoke-test verification) |

All four stubs are intentional and called out by inline JSDoc/JSX comments at the consuming code locations.

## Threat Mitigation Status

All STRIDE threats from the plan's `<threat_model>` carry their planned mitigation:

| Threat ID | Mitigation Verified |
|-----------|---------------------|
| T-03-02-01 (Spoofing — `bg-transparent` smuggled into MonitorOverlay) | `! grep -F "bg-transparent" src/scene/MonitorOverlay.tsx` passes; `bg-bg` literal present |
| T-03-02-02 (Tampering — `<iframe>` smuggled into MonitorOverlay) | `! grep -F "<iframe" src/scene/MonitorOverlay.tsx` passes |
| T-03-02-03 (Info Disclosure — sensitive data via React DevTools) | Accepted; all overlay content (Projects/About/Skills/Writeups) is already public per project requirements |
| T-03-02-04 (DoS — z-fighting flicker) | `position={[0, 0, 0.026]}` is 1mm in front of Phase 2's `[0, 0, 0.025]` screen plane; positive grep confirms; full visual smoke-test runs in Plan 03-03 |
| T-03-02-05 (Tampering — overlay click bubbles to `onPointerMissed`) | All 3 stopPropagation handlers (`onPointerDown`, `onClick`, `onWheel`) present on inner div; positive greps confirm; same handler on Monitor.tsx screen-plane onClick before `onFocusToggle(monitorId)` fires |
| T-03-02-06 (EoP — n/a) | Accepted; no privileged operations introduced |

No new threat surface beyond what the threat register anticipated. No `localStorage` writes anywhere (negative grep confirms).

## Self-Check: PASSED

All claims in this SUMMARY.md verified:

```
[ -f src/scene/cameraPoses.ts ]                 → FOUND
[ -f src/scene/MonitorOverlay.tsx ]             → FOUND
[ -f src/scene/Monitor.tsx ]                    → FOUND
[ -f src/scene/Workstation.tsx ]                → FOUND
[ -f src/ui/CenterMonitorContent.tsx ]          → FOUND
[ -f src/ui/WriteupsMonitor.tsx ]               → FOUND
[ -f src/shells/ThreeDShell.tsx ]               → FOUND
git log --oneline | grep b54537f                → FOUND
git log --oneline | grep e46a990                → FOUND
git log --oneline | grep eb92624                → FOUND
```

All three task commits present in git history; all seven claimed files exist on disk.
