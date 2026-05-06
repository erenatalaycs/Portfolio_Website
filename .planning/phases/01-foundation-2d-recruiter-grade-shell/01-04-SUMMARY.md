---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 04
subsystem: ui
tags: [react-19, tailwind-v4, accessibility, skip-link, sticky-nav, email-obfuscation, query-params, 404, single-page]

# Dependency graph
requires:
  - 01-01 (Vite + React 19 + Tailwind v4 + tokens.css; @theme palette + JetBrains Mono)
  - 01-03 (SECTIONS, BASE, useQueryParams + setQueryParams, useReducedMotion, revealEmail)
provides:
  - BracketLink primitive (single source of truth for [bracket] anchors — 5-state contract, 44x44 hit area, paired target+rel for external)
  - TerminalPrompt primitive ($ glyph in accent + children in caller color; inline span wrapper)
  - SkipToContent primitive (sr-only -> focus:not-sr-only; targets <main id="main">; first focusable on the page)
  - EmailReveal primitive (button -> click decodes via revealEmail(encoded) -> mailto anchor + clipboard + 1.5s (copied) toast)
  - StickyNav (sticky top-0 z-10 header reading SECTIONS; flex-wrap on narrow viewports; faint accent bottom border via color-mix)
  - TextShell stub (SkipToContent + StickyNav + <main id=main tabIndex=-1 max-w-[72ch]> + footer; Plan 05 will fill <main>)
  - NotFound stub (bash-cd error + SECTIONS-driven sitemap + [home] link; text-negative on the bash error line; verbatim UI-SPEC copy)
  - App.tsx finalized (useQueryParams + useReducedMotion + isKnownPath branching; ?focus= scroll with reduced-motion fallback; clears focus after scroll)
affects: [plan-05-content, plan-06-seo, plan-07-opsec]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'BracketLink as the SINGLE primitive for every [bracket] anchor in the site — sticky nav, hero contact links (Plan 05), 404 sitemap, footer GitHub link. Brackets and label both render in text-accent; the wrapper anchor carries a 44x44 touch target via py-2 px-3 -mx-1.'
    - 'External-link safety pattern: BracketLink emits target="_blank" + rel="noopener noreferrer" as a PAIR (or neither) — never one without the other. ESLint jsx-a11y/anchor-is-valid + manual review enforces the OPSEC rule.'
    - 'SECTIONS as the cross-component source of truth: StickyNav AND NotFound both `import { SECTIONS } from "../content/sections"`. Adding a section in content/sections.ts updates the nav AND the 404 sitemap simultaneously — drift impossible.'
    - 'Skip-link pattern: <SkipToContent /> is the first child of <TextShell />; <main id="main" tabIndex={-1}> lets the link target the main without making it part of tab order.'
    - 'Tailwind v4 color-mix arbitrary value: `border-b-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]` — the one permitted opacity-derived accent variant in Phase 1, used solely for the sticky-nav bottom rule (UI-SPEC § Sticky nav layout).'
    - 'EmailReveal one-way state flow: pre-click button → click → revealEmail(encoded) decodes via rot13(atob()) → setEmail flips to mailto anchor → setCopied true for 1.5s → toast hidden but anchor stays. No restore. Refresh resets.'
    - 'App.tsx ?focus= clear-after-scroll: setQueryParams({ focus: null }) runs after el.scrollIntoView so a manual refresh does not replay the scroll. Threat model T-04-07 documents the one extra render trade-off as accepted.'

key-files:
  created:
    - Portfolio_Website/src/ui/BracketLink.tsx
    - Portfolio_Website/src/ui/TerminalPrompt.tsx
    - Portfolio_Website/src/ui/SkipToContent.tsx
    - Portfolio_Website/src/ui/EmailReveal.tsx
    - Portfolio_Website/src/ui/StickyNav.tsx
    - Portfolio_Website/src/ui/NotFound.tsx
    - Portfolio_Website/src/shells/TextShell.tsx
  modified:
    - Portfolio_Website/src/app/App.tsx

key-decisions:
  - 'EmailReveal post-reveal anchor mirrors BracketLink styling but is authored inline (not refactored to use BracketLink) because the mailto: protocol + the (copied) toast adjacency are EmailReveal-specific. Refactoring later requires either a "render prop" or a "wrapper" in BracketLink — defer until a second use site appears.'
  - 'NotFound 404 path-stripping uses RegExp("^" + escapeRegExp(BASE)) instead of a simple .replace(BASE, "/") because BASE may be "/Portfolio_Website/" (prod) or "/" (dev), and a plain string replace would also strip a trailing slash twice. The escape function is local to NotFound (no shared utility yet — first user).'
  - 'StickyNav uses <nav aria-label="Primary"> not aria-label="primary" — UI-SPEC requires the capitalised form to match assistive-tech convention.'
  - 'TextShell main has tabIndex={-1} so SkipToContent can target it; later in Plan 05 the section <h2>s also get tabIndex={-1} for ?focus= keyboard landing, and App.tsx already calls heading?.focus({ preventScroll: true }) after scrollIntoView.'
  - 'Plan 04 keeps TextShell as a STUB (single muted paragraph in main) — the plan explicitly calls this out because Plan 05 owns the section bodies. The build wiring (sticky-nav + skip-link + main + footer) is the Plan 04 contract; the section content is the Plan 05 contract.'

patterns-established:
  - 'Pattern: <BracketLink> is the only primitive emitting [bracket] anchors. Future plans MUST import BracketLink rather than hand-rolling [bracket] markup. Deviation from this rule risks anchor-style drift (UI-SPEC § Anchor-link styling 5-state contract).'
  - 'Pattern: External anchors emit target+rel as a PAIR. The BracketLink `external` boolean is the single switch — reviewers grep for BracketLink, not for ad-hoc <a target> tags.'
  - 'Pattern: Phase 1 components live under src/ui/* (presentational primitives) and src/shells/* (composition wrappers). Plan 05 sections will live under src/sections/* — this directory is created in Plan 05, NOT here.'

requirements-completed:
  # FND-03 closes here: App.tsx now consumes useQueryParams + useReducedMotion (the
  # plan's named requirement). The ?focus=<id> scroll wiring is live and waits for
  # Plan 05's section <h2 id="..."> targets to resolve to actual headings.
  - FND-03
  # TXT-01 (text shell scaffold + 120 KB gz target): scaffold half lands here.
  # The full TXT-01 closes after Plan 05 adds the real sections that flesh out
  # the bundle and the size-target verification can run end-to-end.
  - TXT-01
  # TXT-05 (prefers-reduced-motion + keyboard nav + skip link): closes here. Hook
  # half (Plan 03's useReducedMotion) + UI half (this plan's SkipToContent + the
  # Tailwind motion-safe variants in tokens.css from Plan 01) are now both live.
  # App.tsx routes through `behavior: reduced ? 'auto' : 'smooth'` for ?focus=
  # scrolls — the actual user-facing motion behaviour completes the contract.
  - TXT-05

# Metrics
duration: ~7min
completed: 2026-05-06
---

# Phase 1 Plan 04: Shared UI Primitives + Final App Summary

**Seven shared UI primitives + finalized App.tsx ship the Phase 1 page skeleton; sticky nav reads SECTIONS, NotFound reuses SECTIONS (no drift), TextShell renders skip-link + sticky-nav + main + footer, App.tsx routes via isKnownPath() and wires ?focus= scroll with reduced-motion fallback. All five CI gates green; vite dev server starts cleanly with no console errors.**

## Performance

- **Duration:** ~7 min wall-clock
- **Started:** 2026-05-06T13:06:05Z
- **Completed:** 2026-05-06T13:11:46Z
- **Tasks:** 2 / 2
- **Files created:** 7
- **Files modified:** 1 (src/app/App.tsx — replaced Plan 01 placeholder)

## Accomplishments

- `src/ui/BracketLink.tsx` ships the single source of truth for `[bracket]` anchors — five-state contract (default / hover / focus-visible / active / external) with a 44×44 touch target via `py-2 px-3 -mx-1`. External links emit `target="_blank"` + `rel="noopener noreferrer"` as a paired set (OPSEC rule: never one without the other).
- `src/ui/TerminalPrompt.tsx` ships the `$ ` prompt glyph + children wrapper. Glyph in `text-accent`, children in caller's color. Used for hero, sticky-nav, section headings, and 404.
- `src/ui/SkipToContent.tsx` ships the WCAG skip link — `sr-only` baseline, `focus:not-sr-only` reveals it at top-left with the focus ring, targeting `<main id="main">`.
- `src/ui/EmailReveal.tsx` ships the click-to-reveal email button → mailto anchor + clipboard write + 1.5s `(copied)` toast. One-way per pageview. Calls `revealEmail(encoded)` from Plan 03.
- `src/ui/StickyNav.tsx` renders `$ goto [about] [skills] [projects] [certs] [writeups] [contact]` reading from `SECTIONS` (the same const NotFound consumes — drift-proof). Sticky `top-0 z-10`, `flex flex-wrap` so mobile wraps to multiple lines without a hamburger (D-05). Bottom border uses `color-mix(--color-accent 20%, transparent)` — the only opacity-derived accent variant permitted in Phase 1.
- `src/shells/TextShell.tsx` is the Phase 1 shell skeleton: `<SkipToContent />` + `<StickyNav />` + `<main id="main" tabIndex={-1} max-w-[72ch] px-4 md:px-6 py-12>` + `<footer>`. The `<main>` body is a stub paragraph; Plan 05 replaces it with Hero + 7 section components.
- `src/ui/NotFound.tsx` renders the verbatim UI-SPEC § Error / 404 state copy: `$ cd /Portfolio_Website/<requested-path>` + `bash: cd: <requested-path>: No such file or directory` (in `text-negative` — the only Phase 1 use of the negative color) + `Try one of: $ goto [about] [skills] ...` (reading SECTIONS, no drift) + `or [home]`.
- `src/app/App.tsx` finalized per RESEARCH.md "Code Examples → `<App />` skeleton" — `useQueryParams` + `useReducedMotion` + `isKnownPath()` branching between `<TextShell />` and `<NotFound />`. `?focus=<id>` scrolls to `#<id>` with `behavior: reduced ? 'auto' : 'smooth'`, moves keyboard focus to the section `<h2>`, then clears the focus param via `setQueryParams({ focus: null })` so a refresh doesn't replay the scroll.

## Task Commits

Each task was committed atomically (parent repo `/Users/erenatalay/Desktop/App`, branch `master`):

1. **Task 1: BracketLink + TerminalPrompt + SkipToContent + EmailReveal primitives** — `c5fd213` (feat)
2. **Task 2: StickyNav + TextShell + NotFound stubs + finalize App.tsx** — `34ccc2d` (feat)

(Final SUMMARY metadata commit follows this file's creation.)

## Files Created/Modified

### Created
- `Portfolio_Website/src/ui/BracketLink.tsx` — 5-state anchor link primitive; 44×44 touch target; paired target+rel for external; supports `download` prop for the CV anchor (Plan 05).
- `Portfolio_Website/src/ui/TerminalPrompt.tsx` — `$ ` glyph + children wrapper; inline span; optional `className` for caller-side overrides.
- `Portfolio_Website/src/ui/SkipToContent.tsx` — `sr-only` → `focus:not-sr-only` skip link with focus ring, targeting `<main id="main">`.
- `Portfolio_Website/src/ui/EmailReveal.tsx` — click-to-reveal button → mailto anchor + clipboard write + `(copied)` toast (1.5s); calls `revealEmail(encoded)` from Plan 03.
- `Portfolio_Website/src/ui/StickyNav.tsx` — `<header role="banner" sticky top-0 z-10>` + `<nav aria-label="Primary" flex flex-wrap>` reading SECTIONS; faint accent bottom border via `color-mix`.
- `Portfolio_Website/src/ui/NotFound.tsx` — verbatim UI-SPEC 404 copy; bash error in `text-negative`; sitemap fallback reads SECTIONS; `[home]` link to `BASE`.
- `Portfolio_Website/src/shells/TextShell.tsx` — Phase 1 skeleton: SkipToContent + StickyNav + `<main id="main" tabIndex={-1} max-w-[72ch]>` + footer. Stub body — Plan 05 fills.

### Modified
- `Portfolio_Website/src/app/App.tsx` — replaced Plan 01 placeholder paragraph with the finalized App per RESEARCH.md "<App /> skeleton". Adds `isKnownPath()`, useQueryParams + useReducedMotion subscription, useEffect for `?focus=` scroll + heading focus + param clear.

## Decisions Made

- **BracketLink emits target+rel as a paired set, never one without the other.** Threat model T-04-04 enforces this. The `external?: boolean` prop is the single switch; reviewers grep for `BracketLink` rather than ad-hoc `<a target>` tags. `download` prop also supported for the Plan 05 `[CV]` link.
- **EmailReveal post-reveal anchor styling is inline-authored, not refactored to use BracketLink.** Reason: the `mailto:` protocol + the `(copied)` toast adjacency are EmailReveal-specific. Refactoring requires either a "render prop" wrapper or an `as` prop on BracketLink — deferred until a second use site appears.
- **NotFound's path-stripping uses `RegExp("^" + escapeRegExp(BASE))`** instead of a plain `.replace(BASE, '/')` because in dev `BASE` is `/` and a plain replace would mangle leading slashes. The `escapeRegExp` helper is local to NotFound (no shared utility yet — first user).
- **StickyNav uses `<nav aria-label="Primary">` (capitalised).** UI-SPEC § Sticky nav layout requires the capitalised form to match assistive-tech convention.
- **TextShell ships as a stub by design.** The plan explicitly calls this out: Plan 05 owns the section bodies. Plan 04's contract is the build wiring — sticky-nav + skip-link + main + footer.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Prettier flagged `src/shells/TextShell.tsx` and `src/ui/NotFound.tsx` for formatting**

- **Found during:** Task 2 verification (`npx prettier --check .` after the four files were authored).
- **Issue:** The exact code blocks pasted from the plan exceeded `printWidth: 100` in two places (the long `<main>` opening tag in TextShell and the `<span className="text-negative">` line in NotFound). Prettier's auto-format wraps these onto multiple lines or, where possible, joins them.
- **Fix:** Ran `npx prettier --write` on the two files. Output matches the project's Prettier config (single quotes, trailing commas, 100-char width). No semantic change — only whitespace and JSX-attribute line wrapping.
- **Files modified:** `Portfolio_Website/src/shells/TextShell.tsx`, `Portfolio_Website/src/ui/NotFound.tsx`.
- **Verification:** `npx prettier --check .` exits 0. All other gates re-verified green after the format pass.
- **Committed in:** `34ccc2d` (Task 2 commit, the same commit as the source files — Prettier ran before commit).

### Authentication Gates

None — no auth or secrets needed in Plan 04.

### Architectural Decisions

None — no Rule 4 architectural changes were required.

### RESEARCH.md / UI-SPEC Pattern Deviations (documented choices, not bugs)

- **Pattern 5 (App.tsx skeleton):** Implemented per RESEARCH.md verbatim, with one explicit addition: `setQueryParams({ focus: null })` clears the focus param after scroll. RESEARCH.md notes this as a separate sentence ("After scroll, we clear `?focus`") but does not include the line in its code block; the plan added it to the code block, and this implementation honours it. Threat model T-04-07 documents the one-extra-render-after-scroll trade-off as accepted.
- **Pattern 7 (EmailReveal):** Honors the Plan 03 interface tweak — `EmailReveal` takes `encoded: string` as a prop and passes it through to `revealEmail(encoded)`. RESEARCH.md Pattern 7's `<EmailReveal />` had no props (it imported `revealEmail()` with a default-arg encoded constant); Plan 03's interface change moved the encoded constant to identity.ts (Plan 05), so EmailReveal now accepts it as a prop. Documented in the EmailReveal file header.
- **Pattern 6 (NotFound):** Implemented per UI-SPEC § Error / 404 state. The RESEARCH.md sketch used a `.reduce()` to interleave spaces between BracketLinks; this implementation uses `flex flex-wrap items-center gap-x-2` instead — visually equivalent (uses CSS gap rather than text spaces) and reads cleaner. The `bash: cd:` line uses `text-negative` per UI-SPEC.
- **UI-SPEC § Sticky nav layout § "44x44 hit area via py-2 px-3 -mx-1":** Implemented exactly as specified in BracketLink. The negative `-mx-1` keeps the visual gap between brackets tight while expanding the click target.

## Verification

### CI Gates (all pass)

- `npx tsc --noEmit` → exit 0
- `npx eslint . --max-warnings=0` → exit 0
- `npx prettier --check .` → exit 0 (after Rule 3 format pass)
- `npm test` → 3 test files, **14 passed**, 0 failed (1.33s) — same as Plan 03; no new tests added in Plan 04 (UI primitives unit-tested via integration in Plan 05/07)
- `npm run build` → exit 0; `dist/index.html` present; `dist/assets/index-CsGrRW6i.js` 195.41 kB / 61.71 kB gz (Plan 04 components added 4.76 kB raw / 1.63 kB gz over Plan 03's 190.65 kB / 60.08 kB).

### Visual Smoke Test (`npm run dev`)

- **Result:** PASSED.
- **Vite startup:** `VITE v8.0.10 ready in 288 ms` — no warnings, no errors.
- **HTTP check:** `GET /Portfolio_Website/` → HTTP 200, 776 bytes (the dev `index.html` with React-refresh + vite client injected).
- **Module check:** `GET /Portfolio_Website/src/app/App.tsx` → HTTP 200; vite returns the transformed App.tsx with `useEffect` import + JSX runtime injected. No transform errors.
- **Console errors:** None — vite-dev.log contains only the ready message.
- **Note:** Port 5173 was occupied by another local process; vite auto-selected 5174. The plan's expected URL is `http://localhost:5173/Portfolio_Website/` but the port is environment-dependent; the path is what matters.

### UI-SPEC Compliance

| Spec | Status | Where verified |
| --- | --- | --- |
| 5-state anchor link contract (default/hover/focus-visible/active/external) | PASS | BracketLink.tsx — `text-accent` baseline; `hover:underline hover:underline-offset-4 hover:decoration-accent`; `focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2`; `active:bg-accent active:text-bg`; external emits `target="_blank" rel="noopener noreferrer"` paired |
| 44×44 touch targets | PASS | `py-2 px-3 -mx-1` on BracketLink and EmailReveal — 8px×2 + 12px×2 + content = ≥44×44 |
| 72ch reading width on `<main>` | PASS | TextShell.tsx — `mx-auto max-w-[72ch] px-4 md:px-6 py-12` |
| Focus ring spec (2px solid #79c0ff offset 2px) | PASS | tokens.css `:focus-visible` default + per-component `outline-focus outline-offset-2` overrides |
| Skip link first focusable + targets `<main id="main">` | PASS | TextShell renders `<SkipToContent />` before `<StickyNav />`; `<main id="main" tabIndex={-1}>` |
| Sticky nav: full-width header, flex-wrap, color-mix bottom border | PASS | StickyNav.tsx — `sticky top-0 z-10 bg-bg`, `border-b-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]`, `flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3` |
| StickyNav reads SECTIONS (drift-proof) | PASS | `import { SECTIONS } from '../content/sections'` — same import in NotFound.tsx |
| NotFound bash error in text-negative (only Phase 1 use) | PASS | `<span className="text-negative">bash: cd: ... No such file or directory</span>` — single occurrence in the plan's diff |
| EmailReveal: button → mailto anchor + clipboard + (copied) toast | PASS | EmailReveal.tsx — pre-click button → on click `revealEmail(encoded)` → `setEmail(decoded)` + `setCopied(true)` + `setTimeout(setCopied(false), 1500)` |
| App.tsx ?focus= scroll with reduced-motion fallback | PASS | `el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })`; clear via `setQueryParams({ focus: null })` |
| App.tsx isKnownPath() branches between TextShell and NotFound | PASS | `if (!isKnownPath()) return <NotFound />; return <TextShell />;` |

### Build Output Diff vs. Plan 03

- **JS bundle:** 190.65 kB → 195.41 kB raw (+4.76 kB); 60.08 kB gz → 61.71 kB gz (+1.63 kB). The 7 new components and finalized App.tsx land cleanly under the Phase 1 ≤120 KB gz target (TXT-01).
- **CSS bundle:** 44.16 kB → 44.19 kB raw / 18.85 kB → 18.86 kB gz — Tailwind v4 detected the new utility classes (`sticky`, `flex-wrap`, `outline-focus`, `border-b-[color-mix(...)]`, etc.) and added them. Negligible delta.
- **Source maps:** still off (D-17 / OPSEC).

## Threat Surface

No new surface introduced beyond the threat-model entries in PLAN.md (T-04-01 through T-04-07). All applicable mitigations applied:

- **T-04-01 (Reflected XSS via `?focus=<malicious>`):** App.tsx uses `document.getElementById(focus)` (DOM API; not innerHTML). Unknown IDs silently no-op. The query value is never rendered as HTML.
- **T-04-02 (NotFound `requested` reflects attacker input):** Rendered as text content via React's auto-escaping (`{requested}` inside `<span>` and `<pre>`). No `dangerouslySetInnerHTML`.
- **T-04-03 (StickyNav drifts from NotFound sitemap):** Both `import { SECTIONS } from '../content/sections'`. Adding/removing a nav entry changes both at once. Acceptance criteria grep-checked both imports and they pass.
- **T-04-04 (rel="noopener noreferrer" missing on external `<a>`):** BracketLink emits `target="_blank"` + `rel="noopener noreferrer"` as a pair when `external` is true; never one without the other. ESLint `jsx-a11y/anchor-is-valid` (Plan 01) green.
- **T-04-05 (Skip link confuses screen readers):** Standard `sr-only` + `focus:not-sr-only` pattern; `<main id="main" tabIndex={-1}>` is the WCAG-recommended approach. Plan 07 OPSEC checklist will re-verify on a real screen reader.
- **T-04-06 (EmailReveal encoded prop):** Encoded constant lives in `src/content/identity.ts` (Plan 05) — committed source. EmailReveal accepts it as a prop, not a default. Plaintext NEVER enters source. Plan 07 OPSEC will grep `dist/index.html` and `dist/assets/*.js` for the actual TLD to ensure obfuscation survives.
- **T-04-07 (setQueryParams clears focus on every render where params changes):** The effect runs after a successful scroll; clearing prevents refresh-replay. One extra render after scroll is acceptable.

No threat flags raised.

## Self-Check: PASSED

### Files exist

- `Portfolio_Website/src/ui/BracketLink.tsx` → FOUND
- `Portfolio_Website/src/ui/TerminalPrompt.tsx` → FOUND
- `Portfolio_Website/src/ui/SkipToContent.tsx` → FOUND
- `Portfolio_Website/src/ui/EmailReveal.tsx` → FOUND
- `Portfolio_Website/src/ui/StickyNav.tsx` → FOUND
- `Portfolio_Website/src/ui/NotFound.tsx` → FOUND
- `Portfolio_Website/src/shells/TextShell.tsx` → FOUND
- `Portfolio_Website/src/app/App.tsx` → FOUND (modified)

### Commits exist

- `c5fd213` (Task 1) → FOUND in `git log --oneline`
- `34ccc2d` (Task 2) → FOUND in `git log --oneline`
