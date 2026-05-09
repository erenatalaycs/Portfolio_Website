---
phase: 04-real-asset-postprocessing-polish-pre-launch-qa
plan: 03
subsystem: ui
tags: [live-profiles, tryhackme, hackthebox, identity-extension, certs-section, contact-section, evidence-of-practice, opsec]

# Dependency graph
requires:
  - phase: 01-foundation-2d-recruiter-grade-shell
    provides: TerminalPrompt, identity.ts, BracketLink (anchor branch with `external` prop)
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    provides: BracketLink Phase 2 contract (external auto-attaches target=_blank rel=noopener noreferrer)
  - phase: 04-real-asset-postprocessing-polish-pre-launch-qa
    plan: 02
    provides: <ContactForm /> mount in src/sections/Contact.tsx (shortcut renders BELOW form)
provides:
  - Identity type extended with 4 optional live-profile fields (tryHackMeUrl, tryHackMeHandle, hackTheBoxUrl, hackTheBoxHandle)
  - <LiveProfiles /> exported from src/ui/LiveProfiles.tsx — primary placement, sub-list inside <Certs /> ($ ls certs/live-profiles/)
  - <LiveProfilesShortcut /> exported from src/ui/LiveProfiles.tsx — secondary placement, "See also:" one-liner inside <Contact />
  - <LiveProfiles /> mounted in src/sections/Certs.tsx after the cert <ul>
  - <LiveProfilesShortcut /> mounted in src/sections/Contact.tsx below <ContactForm />
  - identity.test.ts pinning the four new field values (regression guard)
  - LiveProfiles.test.tsx pinning all four render variants (BOTH / ONLY-THM / NEITHER / URL-no-handle)
affects:
  - "04-05 (3D-shell mount): may reuse <LiveProfilesShortcut /> at the bottom of the center-monitor scrollable region per 04-UI-SPEC.md § Form mount-point integration"
  - "04-07 (CHECKLIST-LAUNCH): grep-gate for target=_blank without rel=noopener noreferrer must remain clean — both new external links satisfy via Phase 2 D-09 contract"
  - "04-08 (OPSEC sweep): CTC-03 final sign-off — verify both URLs resolve and the public profiles match the published handles (volvoxkill on both)"

# Tech tracking
tech-stack:
  added: []  # zero new deps — uses existing BracketLink + TerminalPrompt + identity primitives
  patterns:
    - "Component-owns-visibility-guard: <LiveProfiles /> + <LiveProfilesShortcut /> each return null when both URLs are absent. Parents (Certs, Contact) mount them unconditionally — single source of truth, not duplicated"
    - "Single-platform fallback as JSX && short-circuit: each row guarded by `identity.tryHackMeUrl && (...)` so missing platform omits cleanly without rendering an empty placeholder. CONTEXT D-13 locked, regression-blocked by `! grep Coming soon` acceptance gate"
    - "@handle muted-color suffix optional: even when URL is set, handle is independently optional — BracketLink renders alone; no `@undefined` artifact"
    - "Test isolation via vi.doMock + dynamic import per describe-block: each variant gets a fresh component bound to its fixture identity object. vi.hoisted() defines fixtures so the mock factory closure can read them"

key-files:
  created:
    - src/ui/LiveProfiles.tsx
    - src/ui/LiveProfiles.test.tsx
    - src/content/identity.test.ts
  modified:
    - src/content/identity.ts
    - src/sections/Certs.tsx
    - src/sections/Contact.tsx

key-decisions:
  - "Populated real handles at execution time (deviation from plan default 'ship undefined initially'): Eren supplied volvoxkill on both TryHackMe + HackTheBox via STATE.md captured-decisions section. Plan key_decisions line 142 explicitly authorized this path — committing both fields fully populated unblocks Plan 04-08 final CTC-03 sign-off"
  - "RED+GREEN combined per task: project's pre-commit gate runs typecheck + tests, so a RED-only commit would fail TS2339 (Task 1 — missing fields on Identity type) or module-not-found (Task 2 — './LiveProfiles' import). Plan 04-03 explicitly authorized this fallback in the executor prompt"
  - "Test fixtures use `vi.hoisted()` not module-scope const: vi.doMock factories run before module-level statements in the test file, so a plain const fixture would be undefined when the mock evaluates. vi.hoisted() lifts the definition above all imports and mocks, fixing the closure ordering"
  - "Test query strategy: BracketLink renders `[label]` text inside a span, so the accessible name of the resulting <a> is `[TryHackMe profile]` (not `TryHackMe profile`). Tests use `screen.getByRole('link', { name: '[TryHackMe profile]' })` to match the actual accessible-name computation"
  - "Heading semantic level: <LiveProfiles /> uses <h3> not <h2> because it nests inside <Certs /> which already owns <h2>. Visual size identical (text-xl font-semibold) per Phase 1 Typography — hierarchy comes from the prompt prefix and spacing, not a font-size step. Source: 04-UI-SPEC.md § Live profiles sub-list layout"

patterns-established:
  - "Pattern: optional-field Identity extension — additive frontend-content-driven feature. Each consumer gates on truthiness (`if (!identity.foo) return null;`); existing consumers ignore new fields. Future plans (e.g., portfolio cross-links) can layer the same pattern"
  - "Pattern: vi.doMock + dynamic import for module-level constant variants — when a component reads a static module export at definition time, RTL render variants need a fresh module per fixture. vi.resetModules() + dynamic await import('./LiveProfiles') per describe-block satisfies this without polluting other tests"
  - "Pattern: 'See also:' shortcut as secondary discoverability — primary placement (Certs sub-list) carries semantic weight (evidence-of-practice = credentials neighborhood); shortcut placement (Contact one-liner) makes the same content discoverable without forcing a cross-section scan"

requirements-completed: [CTC-03]

# Metrics
duration: 7 min
completed: 2026-05-09
---

# Phase 4 Plan 03: LiveProfiles + Identity extension (CTC-03) Summary

**TryHackMe + HackTheBox live-profile evidence shipped — Identity type extended with four optional fields, <LiveProfiles /> mounted as `$ ls certs/live-profiles/` sub-list in Certs, <LiveProfilesShortcut /> "See also:" one-liner mounted below ContactForm in Contact. Both handles populated with `volvoxkill` per Eren's execution-time decision; CONTEXT D-13 single-platform fallback covered by tests.**

## Performance

- **Duration:** ~7 min (3 commits over ~3.5 min execution + ~3.5 min reading/setup)
- **Started:** 2026-05-09T15:17:00Z (worktree merge of main + npm install)
- **Completed:** 2026-05-09T15:24:00Z
- **Tasks:** 3
- **Files created:** 3
- **Files modified:** 3
- **Tests added:** 11 (4 in identity.test.ts + 7 in LiveProfiles.test.tsx)

## Accomplishments

- **CTC-03 shipped end-to-end** — Identity type carries `tryHackMeUrl`, `tryHackMeHandle`, `hackTheBoxUrl`, `hackTheBoxHandle` as optional fields with JSDoc consumer references. Real handles populated (`volvoxkill` on both platforms; canonical URLs `https://tryhackme.com/p/volvoxkill` and `https://app.hackthebox.com/users/1704641`).
- **`<LiveProfiles />` primary placement live** — `$ ls certs/live-profiles/` heading + two-row sub-list rendered inside `<Certs />` after the existing cert `<ul>`. Reuses `<TerminalPrompt>` and `text-xl font-semibold font-mono` per Phase 1 typography contract; uses `<h3>` to nest semantically inside the parent's `<h2>`.
- **`<LiveProfilesShortcut />` secondary placement live** — `See also: [TryHackMe profile] [HackTheBox profile]` one-liner rendered inside `<Contact />` after `<ContactForm />`. Body-color "See also:" lead-in + two BracketLinks side-by-side.
- **OPS-05 satisfied automatically** — Both BracketLinks pass `external` prop, auto-attaching `target="_blank"` and `rel="noopener noreferrer"`. Verified in DOM by RTL tests (`expect(link).toHaveAttribute('rel', 'noopener noreferrer')`). Plan 04-07 CHECKLIST-LAUNCH grep gate will validate at the dist/ artifact level.
- **CONTEXT D-13 fallback locked by tests** — Three render variants (BOTH / ONLY-THM / NEITHER) all covered + a fourth (URL-set-without-handle) edge case. Acceptance gate `! grep -E 'Coming soon|coming soon' src/ui/LiveProfiles.tsx` blocks future regressions.
- **11 new tests added** — total project test count: 80 → 91. All 91 pass.
- **Zero new runtime deps** — uses only existing BracketLink, TerminalPrompt, identity primitives.

## Task Commits

Each task was committed atomically (RED+GREEN combined per task, see Deviations §1):

1. **Task 1: Extend Identity with 4 optional live-profile fields + tests** — `8e544c0` (feat)
2. **Task 2: Add LiveProfiles + LiveProfilesShortcut components + tests** — `4c670bf` (feat)
3. **Task 3: Mount LiveProfiles in Certs + LiveProfilesShortcut in Contact** — `9c4fcf6` (feat)

## Files Created/Modified

### Created

- `src/content/identity.test.ts` — 4 tests pinning the new field values: TryHackMe URL prefix matches `https://tryhackme.com/`, HackTheBox URL prefix matches `https://app.hackthebox.com/`, both handles equal `'volvoxkill'`. Regression guard: future field removal fails CI loudly rather than silently breaking the live-profile UX.
- `src/ui/LiveProfiles.tsx` — Two named exports. `LiveProfiles()` returns `null` when both URLs absent; otherwise renders `<div className="mt-8">` containing the heading and a `<ul className="mt-3 flex flex-col gap-2">` with one `<li>` per populated platform. Each row: `flex flex-wrap items-baseline gap-x-3 py-1 font-mono` + BracketLink + optional `<span className="text-muted text-sm">@{handle}</span>`. `LiveProfilesShortcut()` returns `<p className="mt-6 flex flex-wrap items-baseline gap-x-2 text-fg font-mono">` containing `<span>See also:</span>` + 1-2 BracketLinks.
- `src/ui/LiveProfiles.test.tsx` — 7 tests across four describe-blocks: BOTH platforms set (renders both rows + shortcut links + `@volvoxkill` × 2 + verifies target=_blank rel=noopener noreferrer attrs), ONLY THM set (single row in sub-list, single link in shortcut, HTB queries return null), NEITHER set (`container.firstChild === null` for both components), and platform-URL-without-handle (link renders, `@`-prefixed text absent). Uses `vi.hoisted()` fixtures + `vi.doMock` + `vi.resetModules()` + dynamic `await import('./LiveProfiles')` per describe-block for clean test isolation.

### Modified

- `src/content/identity.ts` — Identity interface gained four optional fields (`tryHackMeUrl?`, `tryHackMeHandle?`, `hackTheBoxUrl?`, `hackTheBoxHandle?`), each with a JSDoc comment naming the consumer (`<LiveProfiles />` + `<LiveProfilesShortcut />`) and the CONTEXT D-13 fallback rule. Source-header comment block updated to document the Phase 4 CTC-03 extension. `identity` const populated with real values: `tryHackMeUrl: 'https://tryhackme.com/p/volvoxkill'`, `tryHackMeHandle: 'volvoxkill'`, `hackTheBoxUrl: 'https://app.hackthebox.com/users/1704641'`, `hackTheBoxHandle: 'volvoxkill'`.
- `src/sections/Certs.tsx` — Added `import { LiveProfiles } from '../ui/LiveProfiles';`. Added `<LiveProfiles />` JSX inside the `<section id="certs">` after the cert `<ul>` / empty-state `<p>`. Header source comment extended to reference 04-UI-SPEC.md § Live profiles sub-list.
- `src/sections/Contact.tsx` — Added `import { LiveProfilesShortcut } from '../ui/LiveProfiles';`. Added `<LiveProfilesShortcut />` JSX inside the `<div className="mt-3 ...">` after `<ContactForm />` (Plan 04-02's mount preserved verbatim — no rewrite). Header source comment updated from "lands in Plan 04-03" future-tense to documenting the present-tense mount.

## Decisions Made

See `key-decisions` in frontmatter — five decisions covering: real-handle population at execution time (deviation from plan default), TDD RED+GREEN combined commit pattern justified by the project's pre-commit gate, vi.hoisted() fixture pattern for vi.doMock factories, BracketLink accessible-name computation including the brackets, and `<h3>` semantic level for the nested heading.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-commit gate blocks RED-only TDD commits**

- **Found during:** Task 1 first commit attempt (RED — failing tests for missing Identity fields)
- **Issue:** The project ships a pre-commit quality gate that runs `tsc --noEmit` + `vitest run`. Plan 04-03's TDD workflow asks for separate RED commit (failing test) → GREEN commit (implementation), but `git commit` for the RED test fails with `error TS2339: Property 'tryHackMeUrl' does not exist on type 'Identity'`. Same problem would hit Task 2 (RED test references unresolved `./LiveProfiles` import).
- **Fix:** Combined RED+GREEN into a single commit per task. The TDD discipline is preserved: tests authored FIRST (proven by inspecting commit content and the file timestamps), then implementation written to make them pass, then committed atomically. Each commit message explicitly notes this and references the executor's permission for the fallback.
- **Files modified:** none additional — only the commit packaging changed
- **Verification:** All tests added are still failing-without-implementation by construction (each one asserts a specific runtime value that the GREEN code provides). Reviewing the diff in commit `8e544c0` shows the test additions and the implementation additions are colocated; same for `4c670bf`.
- **Committed in:** `8e544c0` (Task 1) and `4c670bf` (Task 2) — Task 3 has no test changes (it's a pure mount edit).

### Rule 2 — Critical Functionality

**2. [Rule 2 - Threat-mitigate] T-04-03-04 `! grep Coming soon` regression guard already locked by acceptance grep**

The threat register's `T-04-03-04` (information-disclosure-via-empty-placeholder) is mitigated by the plan's `! grep -E 'Coming soon|coming soon'` acceptance grep. The component code never references that string; the test file never references it; the negative grep is satisfied. No additional work needed beyond the plan's spec — captured here for explicit threat-model traceability.

### Decision Variance from Plan

**3. [User-supplied data] `identity` const populated with real handles instead of left undefined**

- **Plan default:** "DECISION: ship with fields undefined initially, Eren populates during execution" (plan key_decisions line 142). The plan's accepting condition is satisfied either way.
- **Execution-time decision:** Eren had handles ready at execution time (recorded in STATE.md "Phase 4 Human Decisions Captured" + restated in the executor prompt): TryHackMe `volvoxkill` → `https://tryhackme.com/p/volvoxkill`, HackTheBox `volvoxkill` → `https://app.hackthebox.com/users/1704641`.
- **Rationale:** Populating real values now means: (1) recruiters see live-profile evidence immediately at next deploy; (2) Plan 04-08 OPSEC sweep can do its CTC-03 final sign-off (verify URLs resolve + handles match) without first asking Eren for fresh data; (3) the test file pins concrete values, locking the regression-detection contract.
- **Threat T-04-03-02 (handle public-disclosure) implicitly accepted** by populating — same OPSEC posture as the existing `github` and `linkedin` fields, which are already public.

---

**Total deviations:** 1 auto-fixed (1 blocking — pre-commit gate workaround), 1 threat-traceability note, 1 decision variance from default plan-path. **Impact on plan:** no scope creep, no new deps, no design-system changes. The plan's success criteria are all met more strictly than the default-undefined path because real values are tested concretely.

## Issues Encountered

None — plan-level verification all clean:

- `npm run typecheck` ✓
- `npm run lint` ✓
- `npm run format` ✓ (no diff written — code formatted on author)
- `npm run parity` ✓ (TXT-06 / CNT-03 / Pitfall 8 — adding `<LiveProfiles />` doesn't touch any `id="certs"` / `id="contact"` anchors)
- `npm test --run` ✓ (91/91 — was 80, +11 new)
- `npm run build` ✓
- `npm run size` ✓ — text shell entry chunk **64.86 kB gz** (limit 120 kB, ample headroom; +1.57 kB gz vs Plan 04-02's post-merge 63.29 kB — within expectation given +258 LOC of component + tests)

## Acceptance Grep Verification

All eleven acceptance gates pass (10 positive + 1 negative):

| Gate | File | Result |
|------|------|--------|
| `tryHackMeUrl` | src/content/identity.ts | ✓ (interface + value) |
| `hackTheBoxUrl` | src/content/identity.ts | ✓ (interface + value) |
| `export function LiveProfiles` | src/ui/LiveProfiles.tsx | ✓ |
| `export function LiveProfilesShortcut` | src/ui/LiveProfiles.tsx | ✓ |
| `ls certs/live-profiles/` | src/ui/LiveProfiles.tsx | ✓ |
| `TryHackMe profile` | src/ui/LiveProfiles.tsx | ✓ (both components) |
| `HackTheBox profile` | src/ui/LiveProfiles.tsx | ✓ (both components) |
| `external` | src/ui/LiveProfiles.tsx | ✓ (4 BracketLink occurrences) |
| `<LiveProfiles` | src/sections/Certs.tsx | ✓ |
| `<LiveProfilesShortcut` | src/sections/Contact.tsx | ✓ |
| `! grep Coming soon` | src/ui/LiveProfiles.tsx | ✓ (no match — clean) |

## User Setup Required

None — Eren supplied real handles at execution time (recorded in STATE.md). Plan 04-08 OPSEC sweep verifies the public profiles match the published handles.

## Threat Flags

None — no new security-relevant surface introduced beyond the plan's `<threat_model>` (T-04-03-01 through T-04-03-04 all addressed: reverse-tabnabbing mitigated via `external` prop / BracketLink Phase 2 D-09 contract, handle public-disclosure accepted with same posture as github/linkedin, phishing-URL accept with Plan 04-08 verification, empty-placeholder mitigated via CONTEXT D-13 single-platform fallback + acceptance grep).

## Self-Check

- [x] `src/content/identity.test.ts` exists on disk
- [x] `src/ui/LiveProfiles.tsx` exists on disk
- [x] `src/ui/LiveProfiles.test.tsx` exists on disk
- [x] `src/content/identity.ts` modified (4 optional fields + populated values)
- [x] `src/sections/Certs.tsx` modified (`<LiveProfiles />` mount)
- [x] `src/sections/Contact.tsx` modified (`<LiveProfilesShortcut />` mount)
- [x] Commit `8e544c0` (Task 1) in git log
- [x] Commit `4c670bf` (Task 2) in git log
- [x] Commit `9c4fcf6` (Task 3) in git log
- [x] All 11 acceptance grep gates pass (10 positive + 1 negative)
- [x] All plan-level verification commands pass (typecheck / test / lint / parity / build / size)

## Self-Check: PASSED

## Next Phase Readiness

- **Plan 04-05 (3D-shell ContactForm + LiveProfiles mount):** Ready. The shortcut component is a single-source-of-truth shared export — Plan 04-05 imports `<LiveProfilesShortcut />` from `src/ui/LiveProfiles` and mounts it at the bottom of the 3D-shell center-monitor scrollable region per 04-UI-SPEC.md § Form mount-point integration. No new component work required for Plan 04-05's shortcut surface.
- **Plan 04-07 (Pre-launch deploy + CHECKLIST-LAUNCH):** Ready. The CHECKLIST-LAUNCH grep gate for `target="_blank"` without `rel="noopener noreferrer"` will return empty for both new external links (auto-attached via Phase 2 D-09).
- **Plan 04-08 (OPSEC sweep + CTC-03 final sign-off):** Ready. Both URLs resolve in `identity.ts`; Plan 04-08 verifies the public profiles match `volvoxkill` on both platforms and that the URLs are canonical (no impersonation / phishing).
- **No blockers introduced** for any other Phase 4 plan — file scopes don't overlap.

---

*Phase: 04-real-asset-postprocessing-polish-pre-launch-qa*
*Plan: 03*
*Completed: 2026-05-09*
