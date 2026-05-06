---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 03
subsystem: lib
tags: [react-19, vitest, jsdom, useSyncExternalStore, query-params, prefers-reduced-motion, email-obfuscation, rot13, base64, testing-library]

# Dependency graph
requires:
  - 01-01 (Vite + React 19 + TS 5.9 + Tailwind toolchain; vitest@3.2.4 + jsdom installed; tsconfig include covers src/tests/scripts)
provides:
  - SECTIONS const (single source of truth for nav sections — about/skills/projects/certs/writeups/contact)
  - SectionId type (compile-time enum from SECTIONS)
  - BASE constant + assetUrl() helper (GH Pages base path single import)
  - useQueryParams() hook (reactive ?view= / ?focus= reader via useSyncExternalStore + popstate + custom 'qpchange' event)
  - setQueryParams() writer (history.replaceState + cache bust + qpchange dispatch)
  - useReducedMotion() hook (reactive prefers-reduced-motion via matchMedia)
  - rot13() / decodeEmail() / revealEmail() (email obfuscation primitives; ENCODED_EMAIL constant lives in identity.ts in Plan 05)
  - scripts/encode-email.mjs (author-time CLI: plaintext → rot13 → base64)
  - vitest.config.ts (jsdom env, globals=false, tests/setup.ts as setupFile)
  - tests/setup.ts (matchMedia polyfill + __setReducedMotion test helper + URL/mql reset in afterEach)
affects: [plan-04-ui, plan-05-content, plan-06-seo]

# Tech tracking
tech-stack:
  added:
    - '@testing-library/react@~16.3.2'
    - '@testing-library/jest-dom@~6.9.1'
    - '@testing-library/dom@~10.4.1'
    - 'globals@~17.6.0'
  patterns:
    - 'useSyncExternalStore over popstate + custom qpchange event for query-param reactivity (no React Router)'
    - 'matchMedia polyfill in tests/setup.ts: per-query-string registry, __setReducedMotion helper drives mid-test toggle, listeners reset in afterEach'
    - 'Email obfuscation: rot13 (involution helper) + base64; decodeEmail takes encoded string param so plaintext NEVER lives in source — ENCODED_EMAIL const is filled in Plan 05 identity.ts via npm run encode-email'
    - 'Cache invalidation: setQueryParams sets cached=null BEFORE dispatching qpchange so getCachedSnapshot re-parses URL on next read'
    - 'BASE = import.meta.env.BASE_URL exported once from src/lib/baseUrl.ts; every asset URL imports from here (RESEARCH.md Pitfall 1)'

key-files:
  created:
    - Portfolio_Website/src/content/sections.ts
    - Portfolio_Website/src/lib/baseUrl.ts
    - Portfolio_Website/src/lib/useQueryParams.ts
    - Portfolio_Website/src/lib/useQueryParams.test.ts
    - Portfolio_Website/src/lib/useReducedMotion.ts
    - Portfolio_Website/src/lib/useReducedMotion.test.ts
    - Portfolio_Website/src/lib/obfuscate.ts
    - Portfolio_Website/src/lib/obfuscate.test.ts
    - Portfolio_Website/scripts/encode-email.mjs
    - Portfolio_Website/tests/setup.ts
    - Portfolio_Website/vitest.config.ts
  modified:
    - Portfolio_Website/package.json
    - Portfolio_Website/package-lock.json
    - Portfolio_Website/eslint.config.js

key-decisions:
  - 'Plan-level interface tweak honoured: decodeEmail(encoded: string) requires the encoded param (no default); RESEARCH.md Pattern 7 had a default ENCODED_EMAIL constant inside obfuscate.ts itself — the planner moved that constant to identity.ts (Plan 05 owns it) so the obfuscation module exports primitives only. revealEmail also takes encoded as a parameter for the same reason.'
  - 'rot13 is an exported helper (RESEARCH.md Pattern 7 kept it private). Exporting it lets the test prove the involution property and lets future code (e.g. Plan 04 EmailReveal component) call it without re-implementing.'
  - 'matchMedia polyfill worked first try — jsdom-29 ships without matchMedia, but the registry-keyed polyfill in tests/setup.ts handled both useReducedMotion subscribe/getSnapshot calls and the test helper __setReducedMotion driving listener notifications. Zero adjustment needed after initial author.'
  - 'Vitest 3.2.4 + jsdom 29.1.1 + @testing-library/react 16.3.2 (React 19 line) all resolved cleanly against vite@8.0.10 — no peer-dep warnings; renderHook + act work as documented for React 19.'

patterns-established:
  - 'Pattern: Test helpers exported from tests/setup.ts (e.g. __setReducedMotion) imported by tests via relative path "../../tests/setup". Tested by useReducedMotion.test.ts; future hooks that depend on browser-tier external state should adopt the same registry-polyfill pattern for the matching media query.'
  - 'Pattern: Author-time CLIs (scripts/*.mjs) live in scripts/ and require a Node-globals eslint block. Established here for encode-email.mjs; future scripts (e.g. exiftool-strip wrapper, build-time HTML augmenter) use the same block.'
  - 'Pattern: Each src/lib/ utility ships with a co-located *.test.ts in the same directory. Vitest include glob src/**/*.test.{ts,tsx} picks them up automatically.'

requirements-completed:
  - FND-03
  - TXT-04
  # TXT-05 partial — useReducedMotion hook (the JS half) is shipped here.
  # Tailwind motion-safe / motion-reduce variants + scroll-margin-top + skip-to-content link
  # land in Plan 04 (UI) and Plan 05 (sections); the requirement is "honoured site-wide"
  # which only completes after both halves are wired. Marking partial in REQUIREMENTS.md.

# Metrics
duration: ~7min
completed: 2026-05-06
---

# Phase 1 Plan 03: Lib Utilities + SECTIONS Const Summary

**SECTIONS source of truth, BASE helper, three reactive hooks (useQueryParams + useReducedMotion + setQueryParams writer), and the rot13+base64 email obfuscation pair shipped with 14 passing Vitest assertions across 3 test files; all four CI gates green.**

## Performance

- **Duration:** ~7 min wall-clock
- **Started:** 2026-05-06T11:52:57Z
- **Completed:** 2026-05-06T11:59:58Z
- **Tasks:** 2 / 2
- **Files created:** 11
- **Files modified:** 3 (package.json, package-lock.json, eslint.config.js)
- **Total Vitest assertion count:** 14 passed (4 useQueryParams + 3 useReducedMotion + 7 obfuscate)

## Accomplishments

- `src/content/sections.ts` ships the canonical 6-entry SECTIONS tuple `as const` with id/label/heading per UI-SPEC verbatim — Plans 04 (StickyNav, NotFound) and 05 (sections) can now import this single source of truth.
- `src/lib/baseUrl.ts` exports `BASE = import.meta.env.BASE_URL` plus the `assetUrl(filename)` helper — every later asset URL goes through this single import (RESEARCH.md Pitfall 1).
- `src/lib/useQueryParams.ts` implements the React-Router-free reactive query-param reader using `useSyncExternalStore` over both `popstate` and a custom `qpchange` event. `setQueryParams` writes via `history.replaceState`, busts the snapshot cache (`cached = null`), then dispatches `qpchange` so all consumers re-render.
- `src/lib/useReducedMotion.ts` implements the reactive `prefers-reduced-motion` hook using the same `useSyncExternalStore` pattern over `matchMedia.change` events.
- `src/lib/obfuscate.ts` ships `rot13` (involution helper, exported), `decodeEmail(encoded)` (atob + rot13 reverse), and `revealEmail(encoded)` (decode + best-effort `navigator.clipboard.writeText`, silent on failure). The `ENCODED_EMAIL` constant deliberately lives outside this module — the plaintext NEVER enters TS source.
- `scripts/encode-email.mjs` is a Node ESM CLI: argv[2] or stdin → rot13 → base64 → stdout. Round-trip verified: `npm run encode-email -- 'demo@example.com'` → `cXJ6YkBya256Y3lyLnBieg==` → `decodeEmail` → `'demo@example.com'`.
- `vitest.config.ts` + `tests/setup.ts` give Vitest the jsdom environment plus a controllable `matchMedia` polyfill (with `__setReducedMotion` test helper and per-test URL/mql reset).
- 14 Vitest assertions across 3 test files all passed first run; no flakes, no jsdom adjustments required.

## Task Commits

Each task was committed atomically (parent repo `/Users/erenatalay/Desktop/App`, branch `master`):

1. **Task 1: SECTIONS const, BASE helper, useQueryParams + useReducedMotion hooks (with tests)** — `39c8c31` (feat)
2. **Task 2: obfuscate.ts (rot13+base64) + encode-email CLI + obfuscate tests** — `d4b028e` (feat)

(Final SUMMARY metadata commit follows this file's creation.)

## Files Created/Modified

### Created
- `Portfolio_Website/src/content/sections.ts` — exports SECTIONS tuple `as const` (6 entries: about, skills, projects, certs, writeups, contact) and `SectionId` type. Heading strings match UI-SPEC § Section headings verbatim.
- `Portfolio_Website/src/lib/baseUrl.ts` — exports `BASE: string` (= `import.meta.env.BASE_URL`) and `assetUrl(filename)` helper.
- `Portfolio_Website/src/lib/useQueryParams.ts` — exports `useQueryParams(): URLSearchParams` and `setQueryParams(updates)`. Cached parse keyed on `window.location.search`; subscribes to `popstate` + `qpchange`.
- `Portfolio_Website/src/lib/useQueryParams.test.ts` — 4 assertions: initial parse, setQueryParams add, setQueryParams remove, popstate reactivity.
- `Portfolio_Website/src/lib/useReducedMotion.ts` — exports `useReducedMotion(): boolean`. Subscribes to `matchMedia('(prefers-reduced-motion: reduce)').change`.
- `Portfolio_Website/src/lib/useReducedMotion.test.ts` — 3 assertions: false default, true match, mid-session toggle.
- `Portfolio_Website/src/lib/obfuscate.ts` — exports `rot13(s)`, `decodeEmail(encoded)`, `revealEmail(encoded)`. Algorithm choice + threat-model note in file header (rot13 + base64; anti-scrape, not encryption).
- `Portfolio_Website/src/lib/obfuscate.test.ts` — 7 assertions: 4 rot13 (lowercase, uppercase, non-alpha pass-through, involution) + 3 decodeEmail (round-trip, empty string, input non-mutation).
- `Portfolio_Website/scripts/encode-email.mjs` — Node ESM CLI; chmod +x; reads argv[2] or stdin, prints rot13+base64.
- `Portfolio_Website/tests/setup.ts` — jsdom matchMedia polyfill (registry keyed on query string) + `__setReducedMotion(matches)` test helper + afterEach reset.
- `Portfolio_Website/vitest.config.ts` — separate Vitest config (jsdom env, globals false, tests/setup.ts as setupFile, include glob covers `src/**/*.test.{ts,tsx}` and `tests/**/*.test.{ts,tsx}`).

### Modified
- `Portfolio_Website/package.json` — added 4 devDeps (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/dom`, `globals`); pinned `jsdom` from `latest` to `~29.1.1`. devDep count: 18 → 22 (Δ+4).
- `Portfolio_Website/package-lock.json` — re-resolved.
- `Portfolio_Website/eslint.config.js` — added a `scripts/**/*.{js,mjs,cjs}` block declaring `globals.node` so Node CLI globals (process, console, Buffer) lint cleanly.

## Decisions Made

- **Interface tweak from RESEARCH.md Pattern 7 — `decodeEmail(encoded: string)` requires the encoded param (no default).** RESEARCH had `ENCODED_EMAIL` as a module-local constant in obfuscate.ts; the planner correctly moved that to `identity.ts` (Plan 05) so the obfuscation module ships only primitives. Plaintext never lives in `src/lib/`. `revealEmail(encoded: string)` follows the same shape.
- **`rot13` is exported, not module-private.** RESEARCH.md Pattern 7 kept it private; exporting allows the test to prove the involution property and lets the encode-email.mjs round-trip be verified end-to-end without re-implementing the cipher.
- **matchMedia polyfill worked first try.** jsdom 29.1.1 still does not implement matchMedia. The plan's polyfill (per-query-string registry, with the legacy `addListener` / new `addEventListener('change')` both forwarding to the same listener set) handled the useReducedMotion test scenarios with zero adjustment after initial author.
- **Vitest 3.2.4 + RTL 16.3.2 + React 19 work cleanly together.** No peer-dep warnings, `renderHook` + `act` behave as documented for React 19, useSyncExternalStore subscribers fire on each `act(() => __setReducedMotion(...))` call.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] ESLint `no-undef` errors on `process` / `console` / `Buffer` in `scripts/encode-email.mjs`**

- **Found during:** Task 2 verification (`npx eslint . --max-warnings=0` after the CLI was authored).
- **Issue:** The Plan 01 `eslint.config.js` flat config didn't declare a `node` environment for `scripts/**/*.mjs`. Plain JS files are linted by `js.configs.recommended` only, which doesn't include Node globals. The CLI script legitimately uses `process.argv`, `process.stdin`, `process.exit`, `console.error`, `console.log`, and `Buffer.from` — all real Node globals.
- **Fix:** Added a `scripts/**/*.{js,mjs,cjs}` block to `eslint.config.js` with `languageOptions.globals: { ...globals.node }` and `sourceType: 'module'`. Added `globals@~17.6.0` as a direct devDep (was transitive via eslint, but importing it from the flat config requires direct resolution to remain stable across future lockfile bumps).
- **Files modified:** `Portfolio_Website/eslint.config.js`, `Portfolio_Website/package.json`, `Portfolio_Website/package-lock.json`.
- **Verification:** `npx eslint . --max-warnings=0` exits 0; no warnings.
- **Committed in:** `d4b028e` (Task 2 commit, alongside the obfuscate work).

**2. [Rule 3 — Blocking] `package.json` had `"jsdom": "latest"` from Plan 01 — needed pinning to a tilde range to match the project convention**

- **Found during:** Task 1 Step 1.1 (after `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/dom`).
- **Issue:** `jsdom: "latest"` violates the Plan 01 pinning convention (every devDep gets a tilde range). The three new testing-library packages also installed with `^` (caret) ranges by default.
- **Fix:** Edited `package.json` to convert `^` → `~` for the three testing-library packages and replaced `"latest"` with `"~29.1.1"` (the resolved version). Re-ran `npm install` to refresh the lockfile.
- **Files modified:** `Portfolio_Website/package.json`, `Portfolio_Website/package-lock.json`.
- **Committed in:** `39c8c31` (Task 1 commit).

### Authentication Gates

None — no auth or secrets needed in Plan 03.

### Architectural Decisions

None — no Rule 4 architectural changes were required.

### RESEARCH.md Pattern Deviations (documented choices, not bugs)

- **Pattern 4 (useQueryParams):** Implemented per RESEARCH verbatim. The plan added `getServerSnapshot` (RESEARCH did not include it explicitly); React 19's `useSyncExternalStore` accepts it as the optional 3rd arg and avoids the "missing getServerSnapshot" warning that would otherwise appear in tests under jsdom.
- **Pattern 7 (obfuscate):** Two intentional interface tweaks — `decodeEmail` and `revealEmail` both take `encoded: string` as a parameter (RESEARCH had a default referencing a module-local `ENCODED_EMAIL` constant). The plan's choice keeps the obfuscation module pure and lets `identity.ts` (Plan 05) own the encoded constant. Also: `rot13` is exported (RESEARCH kept it private). Both deltas are documented in code comments and tested.
- **Pattern 8 (useReducedMotion):** Implemented per RESEARCH verbatim, including `getServerSnapshot` returning `false` for the SSR fallback contract.

## Verification

### CI Gates (all pass)

- `npm test` → 3 test files, **14 passed**, 0 failed (1.19s)
  - `src/lib/obfuscate.test.ts`: 7 passed
  - `src/lib/useReducedMotion.test.ts`: 3 passed
  - `src/lib/useQueryParams.test.ts`: 4 passed
- `npx tsc --noEmit` → exit 0
- `npx eslint . --max-warnings=0` → exit 0
- `npx prettier --check .` → exit 0
- `npm run build` → exit 0; `dist/index-LEdtLSkg.js` 190.65 kB / 60.08 kB gz (unchanged from Plan 01 — none of Plan 03's lib files are referenced from the placeholder App yet, so they tree-shake out of the prod build, exactly as intended)

### CLI Round-trip

```
$ ENC=$(npm run --silent encode-email -- 'demo@example.com')
$ echo $ENC
cXJ6YkBya256Y3lyLnBieg==

$ node -e "function r(s){return s.replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(((c.charCodeAt(0)-b+13)%26)+b);});}; console.log(r(Buffer.from('$ENC','base64').toString('utf8')))"
demo@example.com
```

Round-trip verified end-to-end against the exact `decodeEmail` algorithm.

### jsdom + matchMedia polyfill

**Worked first try.** The polyfill in `tests/setup.ts` ships:
- A registry `Map<query, MockMediaQueryList>` keyed on the query string so multiple `window.matchMedia(QUERY)` calls return the same MQL instance (matches browser semantics).
- Both legacy `addListener` / `removeListener` and modern `addEventListener('change') / removeEventListener('change')`, all forwarding to the same `Set<listener>`.
- An `__setReducedMotion(boolean)` test helper that flips `matches` and notifies all subscribed listeners.
- An `afterEach` block that resets the URL to `/` and clears the registry so tests cannot leak.

`useReducedMotion`'s `subscribe` calls `mql.addEventListener('change', notify)`; on `__setReducedMotion(true)`, the listener is invoked, `useSyncExternalStore` re-reads the snapshot, the hook returns the new value. Three assertions validated this end-to-end.

### devDep count delta from Plan 01

Plan 01 closed with **18** devDependencies. Plan 03 closed with **22** (Δ +4):
- `@testing-library/react@~16.3.2`
- `@testing-library/jest-dom@~6.9.1`
- `@testing-library/dom@~10.4.1`
- `globals@~17.6.0`

(`jsdom` was already in Plan 01's devDeps; Plan 03 just re-pinned it from `"latest"` to `"~29.1.1"`.)

## Threat Surface

No new surface introduced beyond the threat-model entries in PLAN.md (T-03-01 through T-03-06). All applicable mitigations applied:

- **T-03-01 (plaintext email in source bundle):** obfuscate.ts contains ONLY primitives; the plaintext NEVER enters TS source — `decodeEmail(encoded: string)` requires the encoded string as an explicit parameter, no module-local default. Plan 07 OPSEC will grep `dist/` for actual TLDs.
- **T-03-02 (XSS via decoded email):** `revealEmail` returns a string for the consumer to render via React's text-content path. No `dangerouslySetInnerHTML` involved. (Tested in Plan 04 EmailReveal component.)
- **T-03-03 (source maps reveal algorithm):** Algorithm intentionally well-known; runtime decoding is the control, not algorithm secrecy. Sourcemaps already disabled in Plan 01 vite.config.ts.
- **T-03-04 (crafted ?focus= XSS):** `useQueryParams` returns a `URLSearchParams` instance; consumers (Plan 04 App.tsx) pass values to `document.getElementById(focus)`, which silently no-ops on unknown IDs. No reflected XSS surface.
- **T-03-05 (listener leak):** `useSyncExternalStore`'s `subscribe` returns a cleanup that removes both popstate and qpchange listeners; React 19 invokes it on unmount.
- **T-03-06 (clipboard fail on insecure context):** `try { await navigator.clipboard?.writeText(email); } catch {}` — silent failure; UI-SPEC's `(copied)` toast is driven by the click handler, not the clipboard result.

No threat flags raised.

## Self-Check: PASSED

### Files exist

- `Portfolio_Website/src/content/sections.ts` → FOUND
- `Portfolio_Website/src/lib/baseUrl.ts` → FOUND
- `Portfolio_Website/src/lib/useQueryParams.ts` → FOUND
- `Portfolio_Website/src/lib/useQueryParams.test.ts` → FOUND
- `Portfolio_Website/src/lib/useReducedMotion.ts` → FOUND
- `Portfolio_Website/src/lib/useReducedMotion.test.ts` → FOUND
- `Portfolio_Website/src/lib/obfuscate.ts` → FOUND
- `Portfolio_Website/src/lib/obfuscate.test.ts` → FOUND
- `Portfolio_Website/scripts/encode-email.mjs` → FOUND
- `Portfolio_Website/tests/setup.ts` → FOUND
- `Portfolio_Website/vitest.config.ts` → FOUND

### Commits exist

- `39c8c31` (Task 1) → FOUND in `git log --oneline`
- `d4b028e` (Task 2) → FOUND in `git log --oneline`
