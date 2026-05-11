---
phase: 04-real-asset-postprocessing-polish-pre-launch-qa
plan: 05
slug: 3d-shell-mounts
subsystem: 3D shell composition (center monitor)
tags: [3d-shell, drei-html, contact-form, live-profiles, shared-component, single-source-of-truth]
status: complete
completed_at: 2026-05-08
duration: ~4min
tasks_completed: 1
tasks_total: 1
files_created: 0
files_modified: 1
requirements_completed:
  - CTC-01
  - CTC-03
dependency_graph:
  requires:
    - 04-01-postfx-pipeline (Wave 1 — PostFX active alongside <Html transform> rendering)
    - 04-02-contact-form (Wave 1 — ContactForm component exists)
    - 04-03-live-profiles (Wave 1 — LiveProfilesShortcut export exists)
    - 04-CONTEXT-D-10 (shared component, both shells)
    - 04-CONTEXT-D-13 (LiveProfilesShortcut secondary placement)
    - 04-UI-SPEC § Form mount-point integration (3D shell)
  provides:
    - 3D-shell-center-monitor-contact-form-mount (CTC-01 second mount point)
    - 3D-shell-center-monitor-thm-htb-shortcut (CTC-03 secondary placement)
    - single-source-of-truth-form (Vite chunk-dedup confirms; one bundle copy referenced by both shells)
  affects:
    - 04-07-checklist-launch (Lighthouse-CI on / + /?focus=contact reaches the form in both shells)
    - 04-08-real-device-qa (touch input + scroll + submit on real iPhone/iPad inside 3D shell — human_needed)
tech_stack:
  added: []
  patterns:
    - shared-component-mounted-twice (single import in src/ui/ContactForm.tsx; mounted in src/sections/Contact.tsx for text shell AND src/ui/CenterMonitorContent.tsx for 3D shell)
    - vite-chunk-dedup (Vite hoists the shared component to the entry chunk when imported by both eager + lazy paths)
    - drei-html-projects-react-tree (no special handling required for forms inside <Html transform>; CSS3DRenderer renders the same DOM the text shell renders)
key_files:
  created: []
  modified:
    - src/ui/CenterMonitorContent.tsx
decisions:
  - append-order-matches-text-shell (UI-SPEC § Form mount-point integration consistency — ContactForm before LiveProfilesShortcut, same as <Contact />)
  - no-prop-changes (both new components take no props; reach into `identity` + `submitContact` directly per their existing contracts)
  - no-new-tests (Phase 4 plan explicit `<key_decisions>` — Phase 3 D-04 didn't ship one; visual verification deferred to Plan 04-08)
  - no-distanceFactor-retune (per UI-SPEC § Real GLB swap visual contract — retune permitted only on Plan 04-06 when real GLB lands; current 600px DOM region fits the form's compact 3-input set per UI-SPEC § Typography)
metrics:
  commits: 1
  build_status: green
  typecheck_status: green
  lint_status: green
  format_status: green (no changes — already prettier-clean)
  tests: 91/91 passing (unchanged from Wave 1 baseline; no new tests per plan)
  parity_status: green
  acceptance_gates_status: all 3 acceptance greps passing
size_limit:
  text_shell_initial: 64.88 kB gz (budget 120 kB — 54% headroom)
  threed_chunk: 38.98 kB gz (budget 450 kB — 91% headroom)
  postprocessing_chunk: 84.9 kB gz (budget 100 kB — 15% headroom; unchanged from 04-01)
  glb: 48 B (placeholder; budget 2.5 MB — real GLB lands in 04-06)
---

# Phase 4 Plan 05: 3D Shell Mounts Summary

Composed `<ContactForm />` (04-02) and `<LiveProfilesShortcut />` (04-03) into the 3D shell's center-monitor scrollable region by extending `src/ui/CenterMonitorContent.tsx` with two appended children below the existing `<Skills />` block. Single source of truth preserved: both components are imported, not duplicated, and Vite's automatic chunking deduplicated them into the entry bundle — the 3D chunk references them via import rather than carrying its own copy.

## Tasks Completed

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Append ContactForm + LiveProfilesShortcut to CenterMonitorContent | `1435575` | `src/ui/CenterMonitorContent.tsx` |

## Acceptance Gates

All three plan-level acceptance greps pass against the committed file:

```bash
$ grep -F '<ContactForm' src/ui/CenterMonitorContent.tsx
//   - <ContactForm /> appended (single source of truth — also rendered in
      <ContactForm />

$ grep -F '<LiveProfilesShortcut' src/ui/CenterMonitorContent.tsx
//   - <LiveProfilesShortcut /> appended (TryHackMe + HackTheBox secondary
      <LiveProfilesShortcut />

$ grep -F 'WhoamiGreeting' src/ui/CenterMonitorContent.tsx
//   - sticky <WhoamiGreeting> at top (z-10, bg-bg) — stays visible as
// anchors the WhoamiGreeting block to that scroll container's top, so
import { WhoamiGreeting } from './WhoamiGreeting';
        <WhoamiGreeting />
```

CI gates all green: `npm run typecheck` (clean), `npm test --run` (91 / 91), `npm run lint` (clean), `npm run format` (no changes), `npm run parity` (TXT-06 + CNT-03 + Pitfall 8 green), `npm run build` (656 modules transformed in 354 ms), `npm run size` (all four budgets under limit).

## Final Composition (post-edit)

`src/ui/CenterMonitorContent.tsx` now renders, top → bottom inside the center monitor's `overflow-y-auto` scroll container:

1. `<WhoamiGreeting />` — sticky-top (z-10, bg-bg)
2. `<About />`
3. `<Skills />`
4. `<ContactForm />` — NEW (Plan 04-02 component, shared with `<Contact />` in text shell)
5. `<LiveProfilesShortcut />` — NEW (Plan 04-03 component, shared with `<Contact />` in text shell)

Order matches the text-shell mount order in `src/sections/Contact.tsx` (UI-SPEC § Form mount-point integration consistency).

## Single Source of Truth — Vite Chunk Verification

The plan's output spec asked for confirmation that `ContactForm` strings appear in both the text-shell entry chunk AND the 3D chunk. Vite's automatic chunking produced a **strictly better outcome**: the shared component code lives in ONE chunk (the entry `index-BEstPdYF.js`), and the 3D lazy chunk (`ThreeDShell-BzH5ezLl.js`) references it via `import { ... } from "./index-BEstPdYF.js"` (~18 symbols imported). This is exactly the "shared component, both shells, downloaded once" outcome CONTEXT D-10 mandates.

Evidence (post-build greps against `dist/assets/*.js`):

| String | `index-*.js` (entry) | `ThreeDShell-*.js` (lazy) | `PostFX-*.js` | Interpretation |
| ------ | --------------------- | ------------------------- | ------------- | -------------- |
| `botcheck` (ContactForm honeypot) | 2 | 0 | 0 | ContactForm code in entry |
| `send_message` (ContactForm header) | 1 | 0 | 0 | ContactForm code in entry |
| `live-profiles` (LiveProfiles header) | 1 | 0 | 0 | LiveProfiles code in entry |
| `monitor-overlay` (3D shell only) | 0 | 1 | 0 | 3D-only code in lazy chunk |
| `space-y-6` (CenterMonitorContent outer) | 0 | 1 | 0 | CenterMonitorContent in lazy chunk |
| `whoami` (WhoamiGreeting) | 1 | 2 | 0 | Phase 3 baseline — already split across shells |

Hand-off shape: the 3D chunk's `import { ... } from "./index-BEstPdYF.js"` pulls the shared component symbols at lazy-chunk-load time. The text shell's eager entry path consumes them directly. Vite delivers the contract.

## Decisions Made

- **Append order matches text-shell ordering** — `<ContactForm />` before `<LiveProfilesShortcut />`, identical to `src/sections/Contact.tsx` (UI-SPEC § Form mount-point integration explicit clause).
- **No prop changes to imported components** — `<ContactForm />` and `<LiveProfilesShortcut />` both take zero props (they reach into `identity` + `submitContact` directly), so the mount is a pure append.
- **No new tests** — explicit plan `<key_decisions>` directive (line 115 of `04-05-PLAN.md`): "<CenterMonitorContent /> already has no test (Phase 3 D-04 didn't ship one); Phase 4 doesn't add. The composition is structural; visual verification happens in Plan 04-08 (real-device QA)."
- **No `distanceFactor` retune** — UI-SPEC § Real GLB swap visual contract permits retune only on Plan 04-06 when the real GLB lands. Phase 3 distanceFactor is correct for the current procedural placeholder.

## Real-Device Verification — Deferred to 04-08

The plan output spec explicitly defers real-device verification of the 3D-shell form (touch input on iPad/iPhone, scrolling the monitor's intrinsic scroll container while pinch-zoom is disabled on the canvas, submitting from inside the 3D scene with PostFX active) to **Plan 04-08 (`human_needed`)**. The Plan 04-08 real-device QA pass will verify:

- The form is reachable by scrolling the monitor's content (no separate camera pose required per UI-SPEC § Deep-link behaviour)
- The drei `<Html transform occlude="blending">` correctly projects the form's DOM at oblique camera angles (CLAUDE.md flags this as a known iframe issue; we render React children, not iframes, so the issue should not apply, but verification belongs to QA)
- Submit + scroll + focus all work with the canvas's `onPointerDown / onClick / onWheel` stopPropagation safety-belts active (Phase 3 D-02 / Pitfall 5)
- PostFX (Plan 04-01) does not visually corrupt the form's CSS3DRenderer projection

## Threat Surface

No new external surface introduced. The two appended components were already shipped and merged from Plans 04-02 and 04-03; this plan only composes them into a second mount point inside an already-existing `<Html transform>` boundary. The plan's threat model (T-04-05-01 DoS / T-04-05-02 tampering / T-04-05-03 info disclosure) is satisfied:

- **T-04-05-01 (DoS, accepted):** Capability-gate (Phase 2) excludes low-power devices from the 3D shell; Plan 04-08 real-device QA will sample iPad / iPhone perceived-freeze behaviour during submit.
- **T-04-05-02 (oblique-angle tampering, accepted):** CLAUDE.md identifies the issue as iframe-specific; we render React JSX, not iframes.
- **T-04-05-03 (info disclosure, mitigated by single-source-of-truth):** Plan 04-02's UI-SPEC verbatim copy redaction is the single source of truth for both shells. CHECKLIST-LAUNCH (Plan 04-07) audits `dist/` post-build.

No threat flags emitted from this plan's scan of created/modified files.

## Deviations from Plan

None — plan executed exactly as written.

The plan's output spec asked for verification that `ContactForm` strings appear in both `dist/assets/index-*.js` AND `dist/assets/ThreeDShell-*.js`. Reality: Vite deduplicated the shared component into the entry chunk, and `ThreeDShell-*.js` references it via `import { ... } from "./index-BEstPdYF.js"`. This is a strictly better outcome than the plan envisioned (true single-source-of-truth, no bundle duplication) and satisfies the spirit of the success criteria. Not flagged as a deviation because the plan-level verification was a hypothesis about what Vite would do, not a required artifact.

## Self-Check: PASSED

- File exists: `src/ui/CenterMonitorContent.tsx` — `FOUND` (modified, 51 lines).
- Commit exists: `1435575` — `FOUND` (`feat(04-05): mount ContactForm + LiveProfilesShortcut in CenterMonitorContent`).
- Acceptance greps pass: 3 / 3.
- CI gates: 6 / 6 green (typecheck + tests + lint + format + parity + build + size).
