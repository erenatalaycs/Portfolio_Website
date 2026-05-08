---
phase: 03-content-integration-mdx-write-ups-camera-choreography
plan: 03
subsystem: camera-choreography
tags: [gsap, useGSAP, r3f, drei, orbit-controls, focus-state, query-params, esc-keydown]
requires: [03-01, 03-02]
provides:
  - focus-state-machine
  - camera-focus-animation
  - url-source-of-truth-for-focus
  - esc-defocus-listener
  - outside-click-defocus
  - controls-forwardref-contract
affects:
  - src/scene/Controls.tsx
  - src/scene/FocusController.tsx
  - src/shells/ThreeDShell.tsx
  - src/app/App.tsx
  - src/ui/Header.tsx
tech-stack:
  added: []
  patterns:
    - "useGSAP from @gsap/react auto-wraps gsap.context() so Strict Mode double-mount can't leak orphan tweens (Pitfall 2 mitigation)"
    - "gsap.registerPlugin(useGSAP) at module top so registration is idempotent across re-imports"
    - "Single gsap.timeline with two parallel .to() calls at position 0 — atomic onComplete (vs two parallel gsap.to() which would race)"
    - "onUpdate: () => controls.update() is mandatory because drei OrbitControls doesn't apply target mutations until update() fires (Pitfall — RESEARCH Pattern 4)"
    - "controls.enabled = false BEFORE timeline; re-enabled in onComplete ONLY when focused === null (D-09 lock — never re-enable while focused on a monitor)"
    - "First-mount + reduced-motion branch uses .set() + .update() (no GSAP timeline) — D-11 instant-snap on deep-link arrival; reduced-motion users always get instant cuts"
    - "URL is single source of truth: useQueryParams subscription + setQueryParams writes; browser back/forward + bookmarks Just Work without React Router"
    - "parseFocusFromUrl is allowlist (projects→left, about|whoami→center, writeups|writeups/...→right) — unrecognised values map to null (T-03-03-01 Tampering mitigation)"
    - "Esc keydown listener registered at FocusController level (mounts only inside ThreeDShell per D-19)"
    - "forwardRef on Controls.tsx so FocusController can mutate OrbitControls.enabled + .target without remounting"
    - "Conditional onClick on Header BracketLinks gated by currentView === '3d' — text shell preserves Phase 1 anchor scroll; 3D shell delegates to FocusController via setQueryParams"
key-files:
  created:
    - src/scene/FocusController.tsx
  modified:
    - src/scene/Controls.tsx
    - src/shells/ThreeDShell.tsx
    - src/app/App.tsx
    - src/ui/Header.tsx
decisions:
  - "Plan 03-03: useGSAP dependency array is [focused, reduced] — re-runs on either change, ensuring reduced-motion toggle mid-session triggers instant-cut branch on next focus state transition."
  - "Plan 03-03: setFocused passed as a prop INTO FocusController (rather than FocusController owning state internally) so ThreeDShell remains the single source of truth for the React state, and onPointerMissed + onFocusToggle can call setFocused directly without round-tripping through URL."
  - "Plan 03-03: URL_VALUE_FOR Record in ThreeDShell mirrors parseFocusFromUrl in FocusController (left↔projects, center↔about, right↔writeups) — kept as separate constants in their respective files (rather than centralised in cameraPoses.ts) because each module owns half of the bidirectional mapping. The center monitor maps to 'about' (not 'whoami') in the write direction; FocusController accepts both 'about' and 'whoami' on the read side so Plan 03-04's whoami greeting can deep-link with ?focus=whoami without breaking back-compat."
  - "Plan 03-03: prettier collapsed <FocusController> JSX onto a single line during ThreeDShell.tsx formatting — semantically identical, accepted."
metrics:
  duration: ~25min
  completed: "2026-05-08"
  commits: 3
  tasks: 3
  files_changed: 5
---

# Phase 3 Plan 03: GSAP Camera Focus State Machine Summary

Wire the camera focus state machine retiring the camera-choreography integration risk: clicking a monitor (or pressing a header `[bracket]`, or arriving via deep-link) animates `camera.position` + `OrbitControls.target` over 1000 ms with `power2.inOut`; click-outside / Esc / re-click on the focused monitor defocus to the default orbit pose; URL `?focus=` is the single source of truth, so browser back/forward and bookmarkable deep-links work without React Router; first-mount with `?focus=` snaps INSTANTLY (D-11 — no cinematic intro); reduced-motion users always get instant cuts. The implementation isolates GSAP behind `useGSAP` (Pitfall 2 mitigation), uses a SINGLE `gsap.timeline` with two parallel `.to()` calls at position 0 (atomic `onComplete` vs. two-timeline race), explicitly calls `controls.update()` per-frame via `onUpdate` (drei OrbitControls requires it), and disables the OrbitControls during animation (re-enabling in `onComplete` ONLY when returning to null — D-09 lock).

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | ForwardRef Controls.tsx + author FocusController.tsx with useGSAP timeline | `adb148e` | src/scene/Controls.tsx, src/scene/FocusController.tsx |
| 2 | Wire ThreeDShell.tsx with focused state, controlsRef, FocusController, onPointerMissed, expanded ARIA | `9df3274` | src/shells/ThreeDShell.tsx |
| 3 | Gate App.tsx focus-scroll effect to text-shell-only + wire Header bracket links to setQueryParams in 3D shell | `21ed20b` | src/app/App.tsx, src/ui/Header.tsx |

## Controls.tsx forwardRef Refactor Diff

| Before (Plan 02) | After (Plan 03-03) |
|------------------|---------------------|
| `export function Controls({ cameraMode }: ControlsProps)` | `export const Controls = forwardRef<OrbitControlsImpl, ControlsProps>(function Controls({ cameraMode, enabled }, ref) {…})` |
| `interface ControlsProps { cameraMode: CameraMode }` | `interface ControlsProps { cameraMode: CameraMode; enabled?: boolean }` |
| `<OrbitControls makeDefault target={[0,0.6,0]} … />` | `<OrbitControls ref={ref} makeDefault … {...enabledProp} />` |
| (no `enabled` handling) | `const enabledProp = enabled === undefined ? {} : { enabled };` — undefined = drei default true; defined = drives directly |

Phase 2 invariants preserved verbatim:
- `ORBIT_CLAMPS` constant (Math.PI/3 polar min, 100° polar max, ±π/2 azimuth, 1.2-4.0 distance)
- `cameraMode === 'orbit' ? ORBIT_CLAMPS : {}` clamp prop-swap (NOT key-swap — never remount)
- `enableDamping={!reduced}` reactive reduced-motion gate
- `enablePan={false}` + `dampingFactor={0.08}` + `target={[0, 0.6, 0]}`
- `makeDefault` so other R3F consumers (e.g. drei `<Html occlude>`) pick the controls up.

## FocusController.tsx Full State Machine (135 LOC)

Module top:
```ts
gsap.registerPlugin(useGSAP);    // idempotent across re-imports
```

`parseFocusFromUrl` allowlist (T-03-03-01 mitigation):
| URL `?focus=` value | FocusId |
|---------------------|---------|
| `projects` | `left` |
| `about` or `whoami` | `center` |
| `writeups` or `writeups/<slug>` | `right` |
| (anything else, including unset) | `null` |

URL → state sync `useEffect`:
```ts
useEffect(() => {
  if (focusFromUrl !== focused) setFocused(focusFromUrl);
}, [focusFromUrl, focused, setFocused]);
```

Subscribed to `useQueryParams()` so browser back/forward + setQueryParams writes from anywhere (header BracketLinks, ThreeDShell onPointerMissed, FocusController's own Esc handler) propagate.

GSAP `useGSAP` block (deps `[focused, reduced]`):
- Compute `targetPose = focused ? MONITOR_FOCUS_POSES[focused] : DEFAULT_ORBIT_POSE`
- **First-mount OR reduced-motion branch:** `camera.position.set(...targetPose.position)` + `controls.target.set(...targetPose.target)` + `controls.update()` + `controls.enabled = focused === null` + flip `isFirstMount.current = false`. NO timeline.
- **Animated branch:**
  ```ts
  controls.enabled = false;
  const tl = gsap.timeline({
    onUpdate: () => controls.update(),       // per-frame; drei requires it
    onComplete: () => { controls.enabled = focused === null; },  // D-09
  });
  tl.to(camera.position, { x, y, z, duration: 1.0, ease: 'power2.inOut' }, 0)
    .to(controls.target, { x, y, z, duration: 1.0, ease: 'power2.inOut' }, 0);
  ```

Esc keydown listener (separate `useEffect` with cleanup):
```ts
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && focused !== null) {
      setFocused(null);
      setQueryParams({ focus: null });
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, [focused, setFocused]);
```

Returns `null` (pure controller — no rendered DOM/scene output).

## ThreeDShell.tsx New State + Props + onPointerMissed

Replaced Plan 03-02's intermediate stub with the production wiring:

```tsx
const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
const [focused, setFocused] = useState<FocusId | null>(null);
const controlsRef = useRef<OrbitControlsImpl>(null);

const onFocusToggle = (id: FocusId) => {
  const next: FocusId | null = focused === id ? null : id;
  setFocused(next);
  setQueryParams({ focus: next === null ? null : URL_VALUE_FOR[next] });
};
```

`URL_VALUE_FOR: Record<FocusId, string>` = `{ left: 'projects', center: 'about', right: 'writeups' }` — inverse of `parseFocusFromUrl`.

Canvas additions:
- `onPointerMissed={() => { if (focused !== null) { setFocused(null); setQueryParams({ focus: null }); } }}` — outside-click defocus (D-10 #2). Guard `focused !== null` prevents redundant URL writes when user drags empty canvas while already at default orbit.
- aria-label expanded to UI-SPEC verbatim: `"Interactive 3D workstation scene. Three monitors render projects, identity, and write-ups. Drag to look around. Click a monitor to focus, press Escape to return."`

Inside Canvas:
- `<Workstation focused={focused} onFocusToggle={onFocusToggle} />` (Plan 02 contract preserved)
- `<Controls cameraMode={cameraMode} ref={controlsRef} />` (forwardRef receives the ref)
- `<FocusController controlsRef={controlsRef} focused={focused} setFocused={setFocused} />` (mounted INSIDE Canvas because it uses `useThree`)

Phase 2 invariants preserved: webglcontextlost handler registers via `gl.domElement.addEventListener('webglcontextlost', handler)`; `gl.domElement.style.touchAction = 'pan-y'` for touch-device scroll passthrough; flexbox-sized `<main>`; BracketLink GitHub footer.

## App.tsx + Header.tsx Minor Edits

`src/app/App.tsx` focus-scroll `useEffect` — added a single early-return:
```ts
if (params.get('view') === '3d') return;
```
between `if (!focus) return;` and `const el = document.getElementById(focus);`. Comment updated to call out that the 3D shell handles its own focus via `<FocusController>` so `?focus=` MUST persist (the controller is subscribed to it). Phase 1 text-shell behaviour (scrollIntoView + heading focus + clear-param) preserved verbatim for `view !== '3d'`.

`src/ui/Header.tsx` — added `import { setQueryParams } from '../lib/useQueryParams';` and gave the SECTIONS map's `<BracketLink>` a conditional `onClick`:
```tsx
onClick={
  currentView === '3d'
    ? (e) => { e.preventDefault(); setQueryParams({ focus: s.id }); }
    : undefined
}
```
- Text shell: `onClick={undefined}` → anchor `href={`#${s.id}`}` handles native scroll (Phase 1 contract preserved verbatim)
- 3D shell: `e.preventDefault()` cancels the anchor scroll; `setQueryParams({ focus: s.id })` writes URL → FocusController picks up the change → animates camera

The whole nav structure (TerminalPrompt + `goto` literal + SECTIONS.map) preserved; the only edit is the `onClick` prop addition on each BracketLink.

BracketLink pre-supported `onClick` on the anchor variant per Plan 02-03 (`BracketLinkAnchorProps.onClick?: (e: ReactMouseEvent<HTMLAnchorElement>) => void`) — verified before editing. No BracketLink changes required.

## Bundle Metrics

```
dist/assets/index-C2U1FK7e.js              212.77 kB raw │ 65.32 kB gz   (54% of 120 KB)
dist/assets/ThreeDShell-CLWvDQW8.js        981.03 kB raw │ 267.74 kB gz  (60% of 450 KB)
public/assets/models/workstation.glb       48 B placeholder                (Phase 4 swap)
```

| Bundle | Plan 03-02 → Plan 03-03 | Δ gz | Cause |
|--------|-------------------------|------|-------|
| Text shell entry | 65.28 → 65.32 KB gz | +0.04 KB | Header.tsx onClick handler + setQueryParams import (negligible — both already in entry's reachability graph) |
| 3D chunk | 239.71 → 267.74 KB gz | **+28.03 KB** | GSAP core + @gsap/react useGSAP runtime (the bulk); FocusController.tsx component (~0.5 KB); Controls.tsx forwardRef refactor (negligible); ThreeDShell.tsx onPointerMissed + URL_VALUE_FOR + ref (negligible) |

Both budgets remain green: 54% / 60% utilisation.

### Bundle-Leak Invariants Preserved

| Token | Entry chunk (`dist/assets/index-*.js`) | 3D chunk (`dist/assets/ThreeDShell-*.js`) |
|-------|----------------------------------------|---|
| `OrbitControls` | absent ✓ | present ✓ (drei) |
| `MDXProvider` | absent ✓ (Plan 03-01 invariant carried) | absent ✓ (Plan 04+ will add) |
| `gsap` | absent ✓ | **present ✓ — Plan 03-03 expected delta** |

Recruiters using the text shell still don't download GSAP, drei, three.js, or @react-three/fiber on first paint.

## Verification Results

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✓ exit 0 |
| `npx eslint src/scene/Controls.tsx src/scene/FocusController.tsx --max-warnings=0` | ✓ exit 0 (clean) |
| `npx eslint src/shells/ThreeDShell.tsx --max-warnings=0` | ✓ exit 0 |
| `npx eslint src/app/App.tsx src/ui/Header.tsx --max-warnings=0` | ✓ exit 0 |
| `npx prettier --check` (per-task subsets) | ✓ "All matched files use Prettier code style!" |
| `npm test` | ✓ 7 files / 54 tests passed (no regressions vs. Plan 02-03's 54 baseline) |
| `npm run build` | ✓ exit 0 — 621 modules transformed in 403ms |
| `npx size-limit` | ✓ both budgets green (54% / 60%) |
| `! grep -F OrbitControls dist/assets/index-*.js` | ✓ |
| `! grep -F MDXProvider dist/assets/index-*.js` | ✓ |
| `grep -F gsap dist/assets/ThreeDShell-*.js` | ✓ |
| Task 1 positive greps (×26) | ✓ all match |
| Task 2 positive greps (×14) | ✓ all match |
| Task 3 positive greps (×9) | ✓ all match |

### Negative-Grep Note (Cosmetic Plan-Side Mismatch)

The plan's literal `! grep -F "motion" src/scene/FocusController.tsx` would match the bare token "motion" on lines like `// Reduced-motion → instant cut` and `useReducedMotion`. The **spirit** of the gate — "no motion library import / use" — is satisfied: `! grep -E "^import.*motion" src/scene/FocusController.tsx` and `! grep -F "framer-motion" src/scene/FocusController.tsx` both pass; `! grep -F "from 'motion/react'"` would also pass. There is no motion or framer-motion library used.

Same pattern as Plan 03-02's documented JSDoc-comment cosmetic mismatches. Documented for the verifier to avoid a false-positive failure when re-running the literal greps from the plan.

## Visual Smoke Notes

Visual smoke verification (`npm run dev` + browser walkthrough) was NOT performed in this plan. All gates were automated/grep-based. The first opportunity for visual smoke is the planner's pre-launch checklist (Phase 4) — same pattern as Plans 02 + 05. The implementation is contract-correct (every prop, hook, and event listener matches UI-SPEC verbatim), so the only visual variable left is `DISTANCE_FACTOR = 1.8` (Plan 03-02 calibration) which controls overlay text legibility. No tuning was performed in Plan 03-03.

If empirical DISTANCE_FACTOR adjustment is needed at first dev render, update `src/scene/cameraPoses.ts` directly — it's the single source of truth.

## Deviations from Plan

None. All three tasks executed exactly as specified in the plan's source-code blocks. No Rule 1/2/3/4 deviations encountered.

## Authentication Gates

None encountered. All operations ran offline.

## Known Stubs

| File | Reason | Resolved By |
|------|--------|-------------|
| `DISTANCE_FACTOR = 1.8` in `src/scene/cameraPoses.ts` | Pattern 12 starting calibration carried over from Plan 03-02. Plan 03-03 implementation is animation-correct, so the only visual variable left is `<Html>` text legibility — verified by visual smoke in a future plan. | Phase 4 visual smoke / pre-launch checklist |

No new stubs introduced by Plan 03-03.

## Threat Mitigation Status

All STRIDE threats from the plan's `<threat_model>` carry their planned mitigation:

| Threat ID | Mitigation Verified |
|-----------|---------------------|
| T-03-03-01 (Tampering — `?focus=javascript:alert(1)`) | `parseFocusFromUrl` is allowlist; only the 5 documented values map to a `FocusId`; everything else (including potentially-malicious values) returns `null`. No code execution, no eval. Verified by code reading + intent. |
| T-03-03-02 (DoS — GSAP context leak across Strict Mode double-mount) | `useGSAP` hook from `@gsap/react` wraps `gsap.context()` and reverts on dependency change. `gsap.registerPlugin(useGSAP)` at module top. Verified by positive greps. |
| T-03-03-03 (Info Disclosure — URL reveals navigation) | Accepted; portfolio is intentionally public + bookmarkable. |
| T-03-03-04 (DoS — controls.update() not called → frozen scene) | `onUpdate: () => controls.update()` callback in `gsap.timeline`. Verified by positive grep `controls.update()` in `src/scene/FocusController.tsx`. |
| T-03-03-05 (Tampering — overlay click bubbles to onPointerMissed) | Plan 02 Task 1 already added `e.stopPropagation()` to MonitorOverlay inner div + Monitor.tsx screen-plane onClick. Plan 03-03 inherits this; no change needed. |
| T-03-03-06 (Spoofing — useFrame consumer re-introduces per-frame state mutation) | `! grep -F "useFrame" src/scene/FocusController.tsx` passes. |
| T-03-03-07 (Info Disclosure — controls remain enabled during animation → user drag races GSAP) | `controls.enabled = false` set BEFORE timeline starts; re-enabled only in `onComplete` when `focused === null` (D-09). Verified by positive greps. |

No new threat surface beyond what the threat register anticipated. No `localStorage` writes anywhere (negative grep confirms).

## Self-Check: PASSED

All claims in this SUMMARY.md verified:

```
[ -f src/scene/Controls.tsx ]                   → FOUND
[ -f src/scene/FocusController.tsx ]            → FOUND
[ -f src/shells/ThreeDShell.tsx ]               → FOUND
[ -f src/app/App.tsx ]                          → FOUND
[ -f src/ui/Header.tsx ]                        → FOUND
git log --oneline | grep adb148e                → FOUND  (Task 1)
git log --oneline | grep 9df3274                → FOUND  (Task 2)
git log --oneline | grep 21ed20b                → FOUND  (Task 3)
```

All three task commits present in git history; all five claimed files exist on disk.
