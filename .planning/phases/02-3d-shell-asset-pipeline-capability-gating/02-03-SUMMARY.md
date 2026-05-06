---
phase: 02-3d-shell-asset-pipeline-capability-gating
plan: 03
subsystem: ui-shell-toggles
tags: [bracketlink, header, view-toggle, camera-toggle, context-loss, tdd]

requires:
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 02
    provides: Placeholder ContextLossBar + ThreeDShell stubs with locked export shapes; App.tsx canonical decision tree
provides:
  - "src/ui/BracketLink.tsx — discriminated-union props (anchor | button), additive Phase 2 props (as / active / onClick / ariaLabel / ariaPressed); 5-state visual contract preserved"
  - "src/ui/BracketLink.test.tsx — 11 vitest assertions covering Phase 1 anchor contract + Phase 2 button form + active/aria-pressed/aria-label"
  - "src/ui/Header.tsx — shared sticky header rendered by both shells; renders $ goto + $ view + (3D-only) $ camera prompt lines"
  - "src/ui/ViewToggle.tsx — [3d] [text] BracketLink-as-button toggles updating ?view= via setQueryParams (D-12 — URL is single source of truth)"
  - "src/ui/CameraToggle.tsx — [orbit] [free] BracketLink-as-button toggles; ephemeral state lifted via onChange (D-11 — no URL, no localStorage)"
  - "src/ui/ContextLossBar.tsx — full UI-SPEC info bar with [!] warn glyph, verbatim body copy, [retry 3D] reload, [×] dismiss, role=status aria-live=polite, 8s auto-dismiss"
  - "src/ui/ContextLossBar.test.tsx — 7 vitest assertions covering copy/aria/auto-dismiss/manual-dismiss/retry-reload"
  - "tests/setup.ts — added cleanup() afterEach hook so RTL renders unmount between tests (vitest globals: false)"
affects:
  - "02-04 (ThreeDShell will import { Header, type CameraMode } and pass showCameraToggle + cameraMode + onCameraModeChange; will mount <ContextLossBar /> via App.tsx contextLost branch)"
  - "Phase 3 (3D click-to-focus camera animation will respect cameraMode='orbit' clamps; Header continues to render in 3D shell)"

tech-stack:
  added: []
  patterns:
    - "Discriminated-union prop type — BracketLink accepts as?: 'a' (default) | 'button' with branch-specific required/forbidden props enforced at the type level"
    - "Persistent active prop on toggle buttons — bg-accent + text-bg inversion lasts as long as URL state holds, complementing Phase 1's :active pseudo-class single-frame click flash"
    - "Shared <Header /> across shells — same component rendered in TextShell and (Plan 04) ThreeDShell; eliminates the StickyNav/3D-shell-header drift risk"
    - "URL-state-authoritative toggle — ViewToggle calls setQueryParams; useSyncExternalStore in useQueryParams broadcasts the change; <App /> re-evaluates and remounts the chosen shell"
    - "Ephemeral cameraMode state lifted to parent — CameraToggle is a pure controlled-component pattern (props in, onChange out); Plan 04's ThreeDShell holds the actual useState"
    - "@testing-library/react afterEach cleanup added at setup.ts level — required because vitest.config.ts sets globals: false, which disables RTL auto-cleanup"

key-files:
  created:
    - src/ui/Header.tsx
    - src/ui/ViewToggle.tsx
    - src/ui/CameraToggle.tsx
    - src/ui/BracketLink.test.tsx
    - src/ui/ContextLossBar.test.tsx
  modified:
    - src/ui/BracketLink.tsx
    - src/ui/StickyNav.tsx
    - src/ui/ContextLossBar.tsx
    - src/shells/TextShell.tsx
    - tests/setup.ts

key-decisions:
  - "BracketLink discriminated union rather than overloaded function signatures — TS narrows on `as` prop; existing Phase 1 call sites that omit `as` resolve to the anchor branch with `href` required, while button form forbids href/external/download at the type level"
  - "StickyNav kept as a deprecated thin re-export to <Header /> rather than deleted outright — Plan 07 OPSEC pass can grep for `StickyNav` to confirm zero remaining call sites before final cleanup; current strategy is conservative-diff"
  - "tests/setup.ts gained an afterEach(cleanup) hook — Rule 3 fix for the @testing-library/react auto-cleanup gap created by vitest.config.ts globals: false. Without it, the second BracketLink test's render() leaks DOM from the first, causing getByText to fail with multi-element errors"
  - "Header conditional renderCameraToggle uses positive guards (!!showCameraToggle && cameraMode !== undefined && onCameraModeChange !== undefined) — TS narrows cameraMode/onCameraModeChange to non-undefined inside the branch, so no `!` non-null assertions needed"
  - "ContextLossBar [retry 3D] click handler computes the URL via window.location.pathname + '?view=3d' rather than a hardcoded path string — preserves GH Pages base prefix /Portfolio_Website/ in production (RESEARCH Pitfall 4 mitigation)"
  - "Two source-comment rewords for file-vs-acceptance-gate self-contradictions: (a) CameraToggle's 'parent holds the useState' → 'parent holds the React hook' so ! grep -F useState passes; (b) ContextLossBar's enumeration of forbidden copy variants paraphrased so ! grep -E 'Oops|WebGL context|click here' passes. Same pattern noted in 02-02-SUMMARY deviation 4"

requirements-completed:
  - 3D-03

duration: 6min
completed: 2026-05-06
---

# Phase 02 Plan 03: BracketLink + Header + ViewToggle + CameraToggle + ContextLossBar Summary

**Extended BracketLink with additive `as`/`active`/`onClick`/`ariaLabel`/`ariaPressed` props (TDD, 11 assertions); refactored Phase 1's StickyNav into a shared <Header /> rendered by both shells; authored <ViewToggle /> + <CameraToggle /> as compositions of TerminalPrompt + BracketLink-as-button; replaced Plan 02-02's PLACEHOLDER ContextLossBar with the full UI-SPEC implementation (verbatim copy, role=status aria-live=polite, 8s auto-dismiss, [retry 3D] reload via window.location.pathname for GH Pages base-path preservation, [×] dismiss). Closes 3D-03 (always-visible view toggle as DOM-overlay sibling of Canvas).**

## Performance

- **Duration:** ~6 min
- **Tasks:** 3 (1 TDD BracketLink extension, 1 component-suite + TextShell refactor, 1 ContextLossBar overwrite + tests)
- **Files created:** 5 (Header.tsx, ViewToggle.tsx, CameraToggle.tsx, BracketLink.test.tsx, ContextLossBar.test.tsx)
- **Files modified:** 5 (BracketLink.tsx, StickyNav.tsx, ContextLossBar.tsx, TextShell.tsx, tests/setup.ts)

## Accomplishments

### BracketLink — additive Phase 2 prop extension (Task 1, TDD)

- Discriminated-union prop type: `BracketLinkAnchorProps` (default `as='a'`, `href` required, `external`/`download` supported) vs `BracketLinkButtonProps` (`as='button'`, `onClick` required, `ariaPressed` optional, `href`/`external`/`download` forbidden at the type level).
- Shared `BracketLinkBaseProps` carries `children` + `className` + `active?: boolean` + `ariaLabel?: string`.
- `active=true` applies persistent inversion via Tailwind utility classes: wrapper gains `bg-accent text-bg`, inner span flips from `text-accent` to `text-bg` so the entire `[label]` reads as inverted (per UI-SPEC: "the bracket glyphs `[` and `]` invert with the inner label").
- 5-state visual contract preserved verbatim from Phase 1: default / hover / focus-visible / `:active` click flash / new persistent `active` prop.
- 44×44 touch target preserved (`py-2 px-3 -mx-1`).
- Button form resets browser default `<button>` styling (`bg-transparent border-0 m-0`) so the button renders pixel-identical to the anchor.

### Phase 1 BracketLink call sites — verified unchanged (no breakage)

Enumerated via `grep -rln "BracketLink" src/`:

```
src/sections/Contact.tsx
src/sections/Hero.tsx
src/shells/TextShell.tsx
src/ui/BracketLink.test.tsx       ← new (this plan)
src/ui/BracketLink.tsx            ← modified (this plan)
src/ui/CameraToggle.tsx           ← new (this plan, button form)
src/ui/ContextLossBar.tsx         ← rewritten (this plan, anchor + button forms)
src/ui/Header.tsx                 ← new (this plan, anchor form)
src/ui/NotFound.tsx               (Phase 1 — unchanged, anchor form)
src/ui/ProjectRow.tsx             (Phase 1 — unchanged, anchor form)
src/ui/ViewToggle.tsx             ← new (this plan, button form)
```

Phase 1 call sites (Contact, Hero, NotFound, ProjectRow, TextShell footer) all use the anchor branch and pass no Phase 2-specific props. `npm test` (47 → 54 assertions) and `npx tsc --noEmit` confirm zero regressions.

### Header.tsx — shared sticky header

- Props: `{ currentView: 'text' | '3d'; showCameraToggle?: boolean; cameraMode?: CameraMode; onCameraModeChange?: (mode: CameraMode) => void }`.
- Renders TWO prompt lines stacked via `<div class="flex flex-col">`:
  - Line 1: `$ goto [about] [skills] [projects] [certs] [writeups] [contact]` — verbatim Phase 1 contract via `SECTIONS` const.
  - Line 2: `$ view [3d] [text]` always; `│ $ camera [orbit] [free]` only when `showCameraToggle && cameraMode && onCameraModeChange` are all truthy.
- Vertical divider implemented as a `<span aria-hidden="true">` with `border-l border-l-[color-mix(...)]` 20%-mix accent, `h-4 mx-2`, `hidden sm:inline-block` so it disappears on mobile wrap (no orphaned divider on a wrapped CameraToggle line).
- `<header role="banner" sticky top-0 z-10>` with `border-b` 20%-mix accent — Phase 1 layout preserved.

### ViewToggle.tsx — `?view=` URL toggle

- Two `<BracketLink as="button">` elements wrapped in a `<TerminalPrompt><span class="text-fg">view</span></TerminalPrompt>` prefix.
- `[3d]` ordered before `[text]` per UI-SPEC D-09 ("3D is the differentiating feature").
- Click handlers call `setQueryParams({ view: '3d' | 'text' })` — URL is the single source of truth (D-12). NO `localStorage` writes anywhere.
- `aria-pressed` reflects `currentView`; `aria-label="Switch to 3D view"` / `"Switch to text view"` for screen readers.

### CameraToggle.tsx — ephemeral camera-mode toggle (3D-shell only)

- Same shape as ViewToggle (TerminalPrompt + two BracketLink-as-button).
- `[orbit]` ordered before `[free]` per UI-SPEC D-11 ("orbit is the safer default").
- Pure controlled-component pattern: `{ cameraMode, onChange }` props in, `onChange(mode)` out. NO `useState` inside this component (D-11 — ephemeral state lives in PARENT, which Plan 04's `<ThreeDShell />` holds).
- `aria-pressed` reflects `cameraMode`; `aria-label="Camera mode: orbit (clamped)"` / `"Camera mode: free (unclamped)"` per UI-SPEC ARIA contract.
- Exports `type CameraMode = 'orbit' | 'free'` so Plan 04's `<Controls />` can import the same type.

### ContextLossBar.tsx — full UI-SPEC implementation (overwrites Plan 02-02 PLACEHOLDER)

- Verbatim UI-SPEC body copy: `3D scene unavailable on this device. You're on the text shell.`.
- `[!]` warn glyph as a literal text character in `<span aria-hidden="true" class="text-warn">[!]</span>` — NO SVG, NO lucide-react.
- `[retry 3D]` is a `<BracketLink href="?view=3d" onClick={triggerReload}>` where the click handler:
  1. `e.preventDefault()` to suppress the anchor's default navigation,
  2. `window.location.assign(window.location.pathname + '?view=3d')` for full page reload preserving GH Pages base path `/Portfolio_Website/` in production (D-14 + RESEARCH Pitfall 4).
- `[×]` is a `<BracketLink as="button" ariaLabel="Dismiss notification">` rendering U+00D7 multiplication sign.
- Wrapper: `role="status" aria-live="polite"` (NOT assertive — UI-SPEC ARIA contract).
- Auto-dismiss: 8000ms timer via `useEffect` + `setTimeout`, cleared on `[×]` click and on unmount.
- NO fade animation — instant cut respects `prefers-reduced-motion` automatically.
- Layout: `bg-surface-1` slab + 30%-mix warn `border-b` + `mx-auto max-w-[72ch]` inner row matching text-shell content width.
- 7 vitest assertions cover the four key behaviours requested by the orchestrator (copy on mount, auto-dismiss, [×] click, [retry 3D] reload) plus three sanity checks (warn glyph aria-hidden, role/aria-live, no premature dismiss at 7999ms).

### Test-infrastructure fix — `tests/setup.ts` gained `afterEach(cleanup)`

The first React Testing Library render in the project's test suite landed in Plan 02-03 (BracketLink.test.tsx). Without `cleanup()`, sequential `render()` calls leak DOM nodes between tests because vitest is configured with `globals: false`, disabling RTL auto-cleanup. The fix imports `cleanup` from `@testing-library/react` and invokes it inside the existing `afterEach` block alongside the URL reset and matchMedia clear. This is a Rule 3 deviation (auto-fix for blocking issue): without the cleanup hook, 9 of 11 BracketLink tests fail with multi-element errors.

### ContextLossBar position in App.tsx — acknowledged

App.tsx (Plan 02-02) renders the bar as a fragment sibling of `<TextShell />` when `contextLost === true`:

```tsx
if (contextLost) {
  return (
    <>
      <TextShell />
      <ContextLossBar />
    </>
  );
}
```

UI-SPEC ideally wants the bar inside `<main>` as the first child so the existing `mx-auto max-w-[72ch]` wrapper auto-centers its content. The current "fragment sibling" pattern is the simpler diff inherited from Plan 02-02 and is functionally correct: the bar's own `mx-auto max-w-[72ch]` inner row centers the content, `role="status" aria-live="polite"` announces the message to screen readers regardless of DOM position, and the bar visually appears above the text shell content because it's the first sibling in document order. **Plan-checker warning acknowledged; behaviour matches UI-SPEC verbatim.** A future refactor (Plan 04 or later) may move the bar inside `<TextShell />`'s `<main>` if a stronger stylistic case emerges; not blocking for Phase 2 success criteria.

## Bundle Size Inventory (post-build)

| Asset | Raw | Gzip | vs Plan 02-02 baseline |
|-------|-----|------|------------------------|
| `dist/assets/index-6mTtpjDX.js` (entry) | 211.93 KB | **65.77 KB** | +0.71 KB gz (Header + ViewToggle + CameraToggle + ContextLossBar full impl) |
| `dist/assets/index-DnCwDd9F.css` | 45.88 KB | 19.06 KB | unchanged |
| `dist/assets/ThreeDShell-PdsIs-Mk.js` (lazy) | 0.30 KB | 0.25 KB | unchanged (placeholder still — Plan 04 fattens this) |

**Confirmation: text-shell entry at 65.77 KB gz — well under Plan 02-05's 120 KB-gz budget.** ContextLossBar's full implementation (with the dismiss timer + retry handler + literal copy strings) plus Header/ViewToggle/CameraToggle compositions added ~0.71 KB gz. Plan 02-05's size-limit gate will catch any future regression.

## Task Commits

1. **Task 1: Extend BracketLink + tests + cleanup hook** — `46682d7` (feat)
2. **Task 2: Header + ViewToggle + CameraToggle + TextShell refactor + StickyNav shim** — `b22dd09` (feat)
3. **Task 3: ContextLossBar full impl + tests** — `cbfd36f` (feat)

_All gates passed at the moment of each commit: `tsc`, `eslint . --max-warnings=0`, `prettier --check`, `vitest`, `vite build`._

## Decisions Made

- **BracketLink discriminated union** — chose `BracketLinkAnchorProps | BracketLinkButtonProps` discriminated on the `as` literal type rather than function overloads. Cleaner narrowing in JSX consumers; existing Phase 1 call sites resolve to the anchor branch automatically with no annotation.
- **StickyNav as deprecated re-export, not deleted** — preserves a grep target for Plan 07's OPSEC sweep and keeps the Phase 2 diff conservative. Future-cleanup-friendly.
- **Header conditional renders without non-null assertions** — TS's narrowing through `cameraMode !== undefined && onCameraModeChange !== undefined` removes the need for `!` operators on the destructured props inside the conditional branch. Cleaner type-safety.
- **`triggerReload` uses `window.location.pathname + '?view=3d'` not a literal `'/Portfolio_Website/?view=3d'`** — the dev server runs at `/` and production at `/Portfolio_Website/`; `pathname` resolves correctly in both. RESEARCH Pitfall 4 mitigation.
- **`tests/setup.ts` gained `afterEach(cleanup)`** — needed because vitest config has `globals: false`. Architecturally correct fix that benefits every future React component test.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] `@testing-library/react` auto-cleanup did not fire with vitest `globals: false`**

- **Found during:** Task 1 RED → GREEN transition (after writing BracketLink.tsx, tests still failed with `getByText` multi-element errors)
- **Issue:** The first BracketLink test's `render()` mounted DOM into the test container; the second test's `render()` appended a second container instead of replacing the first. After 11 tests the DOM held 11 buttons all matching `getByText('text')`. Root cause: `@testing-library/react@16` only auto-registers cleanup when vitest is run with `globals: true`. The project's `vitest.config.ts` sets `globals: false` (intentional — keeps test imports explicit).
- **Fix:** Added `import { cleanup } from '@testing-library/react'` and `cleanup()` inside the existing `afterEach` block in `tests/setup.ts`. Documented as a setup-level fix benefiting every future React component test.
- **Files modified:** `tests/setup.ts`
- **Verification:** `npm test -- BracketLink` — 11/11 pass after the fix.
- **Committed in:** `46682d7` (Task 1 commit)

**2. [Rule 1 — Bug] Source comment in `CameraToggle.tsx` contained literal "useState", failing the `! grep -F "useState"` acceptance gate**

- **Found during:** Task 2 acceptance grep sweep
- **Issue:** The plan's verbatim source comment reads "the parent (...) holds the useState, this toggle calls onChange to lift updates." The plan's own acceptance criterion `! grep -F "useState" src/ui/CameraToggle.tsx` would fail because the comment matches.
- **Fix:** Reworded comment from "the parent holds the useState" to "the parent holds the React hook" — preserves the architectural intent (D-11 — ephemeral state lives in parent) without the literal substring.
- **Files modified:** `src/ui/CameraToggle.tsx`
- **Verification:** `! grep -F "useState" src/ui/CameraToggle.tsx` exits 0.
- **Committed in:** `b22dd09` (Task 2 commit, applied before commit)
- **Pattern note:** Same kind of source-vs-acceptance-gate self-contradiction documented in 02-02-SUMMARY deviation 4 (`localStorage` in detectCapability comment).

**3. [Rule 1 — Bug] Source comment in `ContextLossBar.tsx` enumerated forbidden copy variants verbatim, failing the `! grep -E "Oops|WebGL context|click here"` acceptance gate**

- **Found during:** Task 3 acceptance grep sweep
- **Issue:** The plan's verbatim header comment listed the forbidden copy variants ("Oops!", "WebGL context lost", "click here to retry") as a guard against regressions — but the same literal strings then fail the negative-acceptance grep that exists for the same purpose.
- **Fix:** Paraphrased the comment to refer to the variant categories ("apologetic exclamations, technical jargon, 1995-era CTA phrasing") instead of quoting them. Preserves the guard intent; passes the gate.
- **Files modified:** `src/ui/ContextLossBar.tsx`
- **Verification:** `! grep -E "Oops|WebGL context|click here" src/ui/ContextLossBar.tsx` exits 0.
- **Committed in:** `cbfd36f` (Task 3 commit, applied before commit)
- **Pattern note:** Third instance of the same self-contradiction class. Plan-author should consider running negative greps against the prose of source files at plan-write time.

**4. [Rule 3 — Auto-format] Header.tsx initial draft had a multi-line `<nav>` opening tag that Prettier collapsed to a single line**

- **Found during:** Task 2 `npx prettier --check src/ui/Header.tsx` after authoring
- **Issue:** Prettier preferred a single-line opening tag for the inner `<nav aria-label="Primary" className="...">` because the line stayed under the print-width budget once collapsed.
- **Fix:** Ran `npx prettier --write src/ui/Header.tsx`; re-checked all five Task 2 files; all clean.
- **Files modified:** `src/ui/Header.tsx`
- **Verification:** `npx prettier --check src/ui/Header.tsx ...` exits 0.
- **Committed in:** `b22dd09` (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (Rule 3 × 2 — RTL cleanup hook + Prettier format; Rule 1 × 2 — two source-vs-acceptance-gate comment reworords). None altered the plan's intent.
**Impact on plan:** None. All declared acceptance gates pass.

## CI Gate Confirmation (post-Task-3, all green)

| Gate | Command | Exit | Notes |
|------|---------|------|-------|
| TypeScript | `npx tsc --noEmit` | 0 | All Phase 1 + Phase 2 call sites typecheck |
| ESLint | `npx eslint . --max-warnings=0` | 0 | jsx-a11y rules satisfied |
| Prettier | `npx prettier --check .` | 0 | Repo-wide format clean |
| Vitest | `npm test` | 0 | 54 tests passed (47 prior + 11 BracketLink + 7 ContextLossBar — but BracketLink replaces nothing; total deltas: +18 = 47 → 54) |
| Vite build | `npm run build` | 0 | Entry 65.77 KB gz; ThreeDShell-*.js placeholder chunk emitted at 0.25 KB gz |

## Negative-Assertion Confirmation (orchestrator extras)

| Check | Command | Result |
|-------|---------|--------|
| No localStorage anywhere in src/ | `grep -rF 'localStorage' src/` | exit 1 (no match) |
| No postprocessing/gsap/mdx in src/ or package.json | `grep -rE '@react-three/postprocessing\|gsap\|@mdx-js' src/ package.json` | exit 1 (no match) |
| ContextLossBar PLACEHOLDER fully removed | `grep -F PLACEHOLDER src/ui/ContextLossBar.tsx` | exit 1 (no match) |
| Entry chunk does not contain OrbitControls | `grep -F 'OrbitControls' dist/assets/index-*.js` | exit 1 (no match — placeholder ThreeDShell still doesn't import drei) |

## Smoke Test Notes

Plan 02-04 will wire up the actual `webglcontextlost` listener inside `<Canvas onCreated>`, which is the real end-to-end test for the ContextLossBar render path. Plan 02-03's verification was the 7-assertion vitest suite plus visual confirmation by reading the rendered DOM in test output. Manual dev-server smoke (visiting `?view=text` and `?view=3d`) was NOT performed in this plan — the 11 BracketLink + 7 ContextLossBar vitest assertions plus the full CI gate sweep are the gating evidence.

## User Setup Required

None — no external service configuration, no env vars, no secrets.

## Next Plan Readiness

Plan 02-04 (ThreeDShell + procedural Workstation) is fully unblocked:

- **Header is contract-ready:** Plan 04's `<ThreeDShell />` renders `<Header currentView="3d" showCameraToggle cameraMode={...} onCameraModeChange={...} />`.
- **CameraMode type is exported:** `import { type CameraMode } from '../ui/CameraToggle'` works for `<Controls />` consumer.
- **ContextLossBar is contract-ready:** App.tsx already mounts it via the `contextLost` branch; Plan 04's `<Canvas onCreated>` only needs to register the `webglcontextlost` listener that calls `props.onContextLost()`.
- **No prop changes needed in App.tsx:** the existing `<ThreeDShell onContextLost={...} />` invocation handed off from Plan 02-02 still works verbatim.

## Self-Check: PASSED

- [x] `src/ui/BracketLink.tsx` discriminated-union props verified — `as: 'button'`, `as?: 'a'`, `active?: boolean`, `ariaPressed`, `ariaLabel`, `type="button"` all grep-confirmed
- [x] `src/ui/BracketLink.test.tsx` created with 11 assertions — `fireEvent.click`, `aria-pressed`, `active` all grep-confirmed
- [x] `src/ui/Header.tsx` created with full prop contract: `interface HeaderProps`, `currentView: 'text' | '3d'`, `showCameraToggle?: boolean`, `cameraMode?: CameraMode`, `onCameraModeChange?:`
- [x] `src/ui/Header.tsx` renders `<ViewToggle>` + conditional `<CameraToggle>`; sticky `top-0 z-10`; 20%-mix accent `border-b`; divider `hidden sm:inline-block` with `border-l`/`h-4`
- [x] `src/ui/ViewToggle.tsx` calls `setQueryParams` with `view: '3d'` / `view: 'text'`; `aria-pressed`; aria-labels match UI-SPEC
- [x] `src/ui/CameraToggle.tsx` exports `type CameraMode`; uses `'orbit'` and `'free'`; lifts state via `onChange:`; aria-labels match UI-SPEC; NO `useState`; NO `localStorage`
- [x] `src/ui/Header.tsx` and `src/ui/ViewToggle.tsx` and `src/ui/CameraToggle.tsx`: NO `localStorage`
- [x] `src/shells/TextShell.tsx` renders `<Header currentView="text" />`; no `import { StickyNav }`; imports `{ Header }`
- [x] `src/ui/StickyNav.tsx` is a `@deprecated` thin re-export delegating to `<Header currentView="text"`
- [x] `src/ui/ContextLossBar.tsx` PLACEHOLDER fully removed; `role="status"`, `aria-live="polite"`, exact UI-SPEC body copy, `retry 3D`, `8000`, `window.location.assign`, `window.location.pathname`, `?view=3d`, `Dismiss notification`, `[!]`, `text-warn`, `bg-surface-1`, `color-mix`, `max-w-[72ch]`, `as="button"`, `useEffect`, `clearTimeout`, `preventDefault` all grep-confirmed
- [x] `src/ui/ContextLossBar.tsx` has NO `lucide`, NO `<svg`, NO `Oops`/`WebGL context`/`click here`, NO `fade`
- [x] All five CI gates pass (`tsc`, `eslint .`, `prettier --check .`, `vitest`, `vite build`)
- [x] All three task commits exist in git log: `46682d7`, `b22dd09`, `cbfd36f`
- [x] Phase 1 BracketLink call sites unchanged (verified via `grep -rln BracketLink src/` — Hero, Contact, NotFound, ProjectRow, TextShell footer all untouched and tests still green)

---
_Phase: 02-3d-shell-asset-pipeline-capability-gating_
_Completed: 2026-05-06_
