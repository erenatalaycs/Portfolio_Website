---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 01
subsystem: infra
tags: [vite, react-19, typescript, tailwind-v4, eslint-9, prettier, fontsource, jetbrains-mono]

# Dependency graph
requires: []
provides:
  - Vite 8 + React 19 + TypeScript 5.9 build pipeline (dev server + production build)
  - Tailwind v4 design tokens (8 UI-SPEC HEX values + JetBrains Mono font stack) via @theme
  - Self-hosted JetBrains Mono (weights 400 + 600) bundled by Vite from @fontsource
  - GH Pages base path '/Portfolio_Website/' wired in vite.config.ts
  - Sourcemaps disabled in production builds (OPSEC requirement D-17)
  - ESLint 9 flat config with TS + react-hooks + react-refresh + jsx-a11y + prettier-config
  - Prettier 3 + .prettierignore covering planning artifacts and verbatim CSS tokens
  - 4 CI gates green on empty tree (typecheck, eslint, prettier, build)
affects: [plan-02-deploy, plan-03-lib, plan-04-ui, plan-05-content, plan-06-seo, plan-07-opsec]

# Tech tracking
tech-stack:
  added:
    - react@19.2.5
    - react-dom@19.2.5
    - vite@8.0.10
    - '@vitejs/plugin-react@6.0.1'
    - typescript@5.9.3
    - tailwindcss@4.2.4
    - '@tailwindcss/vite@4.2.4'
    - '@fontsource/jetbrains-mono@5.2.8'
    - eslint@9.39.4
    - typescript-eslint@8.59.2
    - eslint-plugin-react-hooks@7.1.1
    - eslint-plugin-react-refresh@0.5.2
    - eslint-plugin-jsx-a11y@6.10.2
    - eslint-config-prettier@10.1.8
    - prettier@3.8.3
    - vitest@3.2.4
    - '@vitest/coverage-v8@3.2.4'
    - jsdom (latest)
    - '@types/react@19.2.14'
    - '@types/react-dom@19.2.3'
    - '@types/node@25.6.0'
  patterns:
    - 'Tailwind v4 zero-config: single CSS entrypoint imports tailwindcss + declares @theme tokens (no tailwind.config.js, no postcss.config.js)'
    - 'TS project-references: tsconfig.json (src) references tsconfig.node.json (vite config) with composite + emitDeclarationOnly'
    - 'Vite base-path single source of truth: literal /Portfolio_Website/ in vite.config.ts (acceptance-grep-friendly)'
    - 'Self-hosted fonts via @fontsource/<name>/<weight>.css ESM imports — no Google Fonts CDN call'
    - 'Prettier ignore-list covers (a) authored markdown artifacts (.planning, .claude, CLAUDE.md) and (b) verbatim spec files (src/styles/tokens.css)'

key-files:
  created:
    - Portfolio_Website/package.json
    - Portfolio_Website/package-lock.json
    - Portfolio_Website/vite.config.ts
    - Portfolio_Website/tsconfig.json
    - Portfolio_Website/tsconfig.node.json
    - Portfolio_Website/eslint.config.js
    - Portfolio_Website/.prettierrc.json
    - Portfolio_Website/.prettierignore
    - Portfolio_Website/.gitignore
    - Portfolio_Website/.editorconfig
    - Portfolio_Website/index.html
    - Portfolio_Website/src/styles/tokens.css
    - Portfolio_Website/src/app/main.tsx
    - Portfolio_Website/src/app/App.tsx
  modified: []

key-decisions:
  - 'Vitest fall-through (RESEARCH.md A1) NOT triggered — vitest@3.2.4 installed cleanly against vite@8.0.10 with no peer-dep warnings'
  - 'tsconfig.node.json adjusted: composite-true-with-noEmit-true is invalid (TS6310); switched to emitDeclarationOnly with outDir under node_modules/.tmp/ to keep declarations out of source tree'
  - 'src/styles/tokens.css added to .prettierignore — UI-SPEC requires aligned hex column formatting + double-quote @import that Prettier would rewrite under singleQuote: true; acceptance criteria grep these literally'
  - '.planning/, .claude/, CLAUDE.md added to .prettierignore — authored markdown owned by GSD planning workflow, must not be auto-formatted'

patterns-established:
  - 'Pattern: 4-gate CI parity locally — npx tsc --noEmit && npx eslint . && npx prettier --check . && npm run build is the contract every later plan must keep green'
  - 'Pattern: Verbatim spec files (src/styles/tokens.css) are excluded from Prettier so UI-SPEC formatting drift cannot happen via auto-format'
  - 'Pattern: Plan/SUMMARY/CONTEXT/ROADMAP markdown lives in .planning/ and is excluded from Prettier — owned by the planning workflow, not the linting toolchain'

requirements-completed:
  - FND-01

# Metrics
duration: ~7min
completed: 2026-05-06
---

# Phase 1 Plan 01: Foundation Bootstrap Summary

**Vite 8 + React 19 + TypeScript 5.9 + Tailwind v4 SPA scaffolded with all 4 CI gates green; JetBrains Mono self-hosted; UI-SPEC palette tokens compiled correctly.**

## Performance

- **Duration:** ~7 min wall-clock (npm install dominated at 53s)
- **Started:** 2026-05-06T11:39:00Z (approx)
- **Completed:** 2026-05-06T11:46:24Z
- **Tasks:** 2 / 2
- **Files created:** 14
- **Files modified:** 0

## Accomplishments

- Greenfield repo now has a buildable, lintable, formattable React 19 + Vite 8 + Tailwind v4 SPA.
- All eight UI-SPEC palette HEX tokens (`#0d1117 / #c9d1d9 / #7ee787 / #e3b341 / #ff7b72 / #8b949e / #161b22 / #79c0ff`) live in `src/styles/tokens.css` verbatim, and the accent token `#7ee787` survives compilation into `dist/assets/index-*.css` — proves Tailwind v4 + `@theme` are wired.
- JetBrains Mono (weights 400 + 600, all subsets — latin, latin-ext, cyrillic, greek, vietnamese) is bundled as woff2/woff into `dist/assets/`. No Google Fonts CDN call anywhere (D-08).
- Vite production build emits `dist/index.html` + `dist/assets/*` with `base: '/Portfolio_Website/'` and `sourcemap: false` (OPSEC D-17).
- All four CI gates pass on the empty tree: `npx tsc --noEmit`, `npx eslint .`, `npx prettier --check .`, `npm run build`.

## Task Commits

Each task was committed atomically (parent repo `/Users/erenatalay/Desktop/App`, branch `master`):

1. **Task 1: Scaffold package.json, configs, and Vite/TS/ESLint/Prettier toolchain** — `e596dfa` (feat)
2. **Task 2: Author Tailwind v4 tokens, font imports, React entrypoint, App placeholder** — `1b4cc49` (feat)

(Final SUMMARY metadata commit follows this file's creation.)

## Files Created/Modified

### Created
- `Portfolio_Website/package.json` — pinned dependency manifest; tilde ranges only; `"type": "module"`; engines `node >= 22.12.0`; full script set (dev/build/preview/typecheck/lint[:fix]/format[:check]/test[:watch][:coverage]/encode-email).
- `Portfolio_Website/package-lock.json` — npm-resolved dep tree.
- `Portfolio_Website/vite.config.ts` — `base: '/Portfolio_Website/'`, `build.sourcemap: false`, `build.target: 'es2022'`, plugins `react()` + `tailwindcss()`.
- `Portfolio_Website/tsconfig.json` — strict mode, `verbatimModuleSyntax`, `isolatedModules`, project reference to `tsconfig.node.json`, includes `src tests scripts`.
- `Portfolio_Website/tsconfig.node.json` — composite project for `vite.config.ts` typing; `emitDeclarationOnly` with `outDir` under `node_modules/.tmp/` (see deviation below).
- `Portfolio_Website/eslint.config.js` — flat config: `js.recommended`, `tseslint.configs.recommended`, `jsxA11y.flatConfigs.recommended`, react-hooks + react-refresh rules, `prettierConfig` last to disable conflicting rules.
- `Portfolio_Website/.prettierrc.json` — 2-space indent, single quotes, trailing commas all, semi-true, `printWidth: 100`, `arrowParens: 'always'`.
- `Portfolio_Website/.prettierignore` — node_modules, dist, coverage, public, *.lock, *.min.js, **plus** `.planning`, `.claude`, `CLAUDE.md`, `src/styles/tokens.css` (Rule 3 fixes; see deviations).
- `Portfolio_Website/.gitignore` — node_modules, dist, coverage, env files, vite cache, IDE folders.
- `Portfolio_Website/.editorconfig` — LF line endings, 2-space, UTF-8.
- `Portfolio_Website/index.html` — minimal Vite entry; `<html lang="en" class="motion-safe:scroll-smooth">`; `<meta theme-color #0d1117>`; `<meta color-scheme dark>`; `<div id="root"></div>` + `<script type="module" src="/src/app/main.tsx">`.
- `Portfolio_Website/src/styles/tokens.css` — `@import "tailwindcss"` (double quotes preserved), `@theme` with 8 HEX tokens + `--font-mono`, `cursor-blink` keyframe + `--animate-cursor-blink` token, default `:focus-visible` outline.
- `Portfolio_Website/src/app/main.tsx` — `createRoot` + `StrictMode` + `@fontsource/jetbrains-mono/{400,600}.css` + `../styles/tokens.css` imports.
- `Portfolio_Website/src/app/App.tsx` — Phase 1 placeholder rendering one paragraph; default export shape preserved for Plan 04 to swap the body.

## Decisions Made

- **Pin vitest to 3.2.4 (RESEARCH.md A1 not triggered).** `npm install` resolved cleanly against `vite@8.0.10` with no peer-dep conflict. The fall-through to `vitest@~4.1` documented in RESEARCH.md A1 was not needed.
- **Inline base-path literal in vite.config.ts.** RESEARCH.md Pattern 1 uses a `BASE` constant; this plan's acceptance criteria grep the literal string `base: '/Portfolio_Website/'`. Inlined the value to satisfy both, with a comment marking it as the single source of truth.
- **emitDeclarationOnly for tsconfig.node.json.** TypeScript forbids `composite: true` + `noEmit: true` (TS6310). `emitDeclarationOnly: true` with `outDir` under `node_modules/.tmp/` keeps declarations out of the source tree while satisfying composite-project requirements.
- **Exclude verbatim spec files from Prettier.** `src/styles/tokens.css` is UI-SPEC verbatim — Prettier with `singleQuote: true` would rewrite `@import "tailwindcss"` to single quotes and collapse the column-aligned hex values. Acceptance criteria grep these formatting choices literally, so the file is in `.prettierignore`.
- **Exclude planning artifacts from Prettier.** `.planning/`, `.claude/`, and `CLAUDE.md` are authored content owned by the GSD workflow and the user — they must not be auto-formatted by `prettier --write` or rejected by `prettier --check`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] tsconfig.node.json `composite: true` + `noEmit: true` is invalid (TS6310)**

- **Found during:** Task 2 (running `npm run build` → `tsc --noEmit` failed with `tsconfig.json(23,18): error TS6310: Referenced project '...tsconfig.node.json' may not disable emit`).
- **Issue:** TypeScript rejects a referenced composite project that disables emit. The plan's exact `tsconfig.node.json` block sets both `composite: true` and `noEmit: true`, which cannot coexist.
- **Fix:** Replaced `noEmit: true` with `emitDeclarationOnly: true` plus `outDir: './node_modules/.tmp/tsconfig.node'` and `tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo'`. Composite projects emit `.d.ts` (no `.js`), and the output is sandboxed under `node_modules/.tmp/` (already gitignored via `node_modules`).
- **Files modified:** `Portfolio_Website/tsconfig.node.json`
- **Verification:** `npx tsc --noEmit` exits 0; `npm run build` completes; no `.d.ts` files appear in source tree.
- **Committed in:** `1b4cc49` (Task 2 commit)

**2. [Rule 3 — Blocking] `npx prettier --check .` failed on planning markdown files**

- **Found during:** Task 1 (running the four sanity gates).
- **Issue:** Prettier reformats project markdown files in `.planning/` and `CLAUDE.md` (line-wrapping, list-marker normalization, etc.). These files are authored by the GSD workflow and the user — they are content, not code.
- **Fix:** Added `.planning`, `.claude`, and `CLAUDE.md` to `.prettierignore`.
- **Files modified:** `Portfolio_Website/.prettierignore`
- **Verification:** `npx prettier --check .` exits 0; planning artifacts unchanged on disk.
- **Committed in:** `e596dfa` (Task 1 commit)

**3. [Rule 3 — Blocking] `npx prettier --check .` failed on `src/styles/tokens.css`**

- **Found during:** Task 2 (after authoring tokens.css).
- **Issue:** Prettier (with `singleQuote: true`) wants to rewrite `@import "tailwindcss"` to single quotes and collapse the column-aligned hex values (`--color-bg:        #0d1117` → `--color-bg: #0d1117`). Both formatting choices are part of the UI-SPEC contract and grep-checked verbatim by acceptance criteria.
- **Fix:** Added `src/styles/tokens.css` to `.prettierignore` with a comment explaining the UI-SPEC verbatim requirement.
- **Files modified:** `Portfolio_Website/.prettierignore`
- **Verification:** `npx prettier --check .` exits 0; tokens.css formatting unchanged; all 8 hex token grep-acceptance checks still pass verbatim.
- **Committed in:** `1b4cc49` (Task 2 commit)

### Authentication Gates

None — no auth or secrets needed in Plan 01.

### Architectural Decisions

None — no Rule 4 architectural changes were required.

## Verification

### CI Gates (all pass)

- `npx tsc --noEmit` → exit 0
- `npx eslint .` → exit 0
- `npx prettier --check .` → exit 0
- `npm run build` → exit 0; `dist/` produced; accent token `#7ee787` present in `dist/assets/*.css`.

### Resolved Versions (`npm ls react vite typescript tailwindcss eslint vitest @fontsource/jetbrains-mono`)

```
portfolio-website@0.0.0
├── @fontsource/jetbrains-mono@5.2.8
├── @tailwindcss/vite@4.2.4   (resolves @vitejs/plugin-react@6.0.1, vite@8.0.10, tailwindcss@4.2.4)
├── @vitejs/plugin-react@6.0.1
├── @vitest/coverage-v8@3.2.4
├── eslint@9.39.4
├── react@19.2.5
├── react-dom@19.2.5
├── tailwindcss@4.2.4
├── typescript@5.9.3
├── vite@8.0.10
└── vitest@3.2.4
```

All ten core packages resolved to the exact tilde-ranges pinned in `package.json`. Lockfile committed.

### Vitest A1 Fall-through

**NOT triggered.** `npm install` produced no peer-dep warnings about vitest/vite incompatibility. RESEARCH.md A1's contingency (bump to vitest@~4.1) was not exercised.

### Build Output

- `dist/index.html` (0.59 kB / 0.36 kB gz)
- `dist/assets/index-*.css` (44.16 kB / 18.85 kB gz) — Tailwind utilities + tokens + font @font-face rules.
- `dist/assets/index-*.js` (190.65 kB / 60.08 kB gz) — React 19 + the placeholder App.
- 18 woff2/woff files (latin/latin-ext/cyrillic/greek/vietnamese × {400,600}). Latin alone: 21.16 kB woff2 (400) + 21.86 kB woff2 (600) = ~43 kB before browser only-loads-needed-subsets.
- No `.map` files → sourcemaps confirmed off (D-17 / OPSEC).

## Threat Surface

No new surface introduced beyond the threat-model entries in PLAN.md (T-01-01 through T-01-06). All applicable mitigations applied:

- **T-01-01 (sourcemap leak):** `build.sourcemap: false` set in vite.config.ts; verified by acceptance grep + `dist/assets/*` contains zero `.map` files.
- **T-01-02 (dep-pin drift):** All deps use tilde ranges; package-lock.json committed.
- **T-01-03 (palette drift):** All 8 HEX tokens grep-verified verbatim in src/styles/tokens.css; `#7ee787` proven to survive compilation in dist/assets/*.css.
- **T-01-04 (default Vite head):** Minimal head shipped per plan; Plan 06 expands SEO/JSON-LD with OPSEC-gated email exclusion.
- **T-01-05 (silent ESLint no-op):** Default flat config exits non-zero on errors (verified). Plan 02 will add `--max-warnings=0` in CI; Plan 07 OPSEC checklist will verify lint catches a deliberate violation.
- **T-01-06 (Google Fonts CDN call):** `@fontsource/jetbrains-mono` self-hosted; no `googleapis.com` URL anywhere; verified by `grep -r googleapis src` → empty.

No threat flags raised.

## Self-Check: PASSED

### Files exist
- `Portfolio_Website/package.json` → FOUND
- `Portfolio_Website/package-lock.json` → FOUND
- `Portfolio_Website/vite.config.ts` → FOUND
- `Portfolio_Website/tsconfig.json` → FOUND
- `Portfolio_Website/tsconfig.node.json` → FOUND
- `Portfolio_Website/eslint.config.js` → FOUND
- `Portfolio_Website/.prettierrc.json` → FOUND
- `Portfolio_Website/.prettierignore` → FOUND
- `Portfolio_Website/.gitignore` → FOUND
- `Portfolio_Website/.editorconfig` → FOUND
- `Portfolio_Website/index.html` → FOUND
- `Portfolio_Website/src/styles/tokens.css` → FOUND
- `Portfolio_Website/src/app/main.tsx` → FOUND
- `Portfolio_Website/src/app/App.tsx` → FOUND

### Commits exist
- `e596dfa` (Task 1) → FOUND in `git log --oneline`
- `1b4cc49` (Task 2) → FOUND in `git log --oneline`
