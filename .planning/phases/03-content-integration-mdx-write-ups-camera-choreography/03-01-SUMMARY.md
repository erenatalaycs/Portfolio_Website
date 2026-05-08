---
phase: 03-content-integration-mdx-write-ups-camera-choreography
plan: 01
subsystem: build-pipeline
tags: [mdx, vite, shiki, gsap, build, deps]
requires: [02-05]
provides: [mdx-pipeline, mdx-renderer-import-path, highlighted-line-css]
affects: [vite.config.ts, package.json, package-lock.json, src/ui/MDXRenderer.tsx, src/styles/tokens.css]
tech-stack:
  added:
    - gsap@3.15.0
    - "@gsap/react@2.1.2"
    - "@mdx-js/react@3.1.1"
    - "@mdx-js/rollup@3.1.1"
    - rehype-pretty-code@0.14.3
    - shiki@4.0.2
    - remark-gfm@4.0.1
    - remark-frontmatter@5.0.0
    - remark-mdx-frontmatter@5.2.0
  patterns:
    - "MDX plugin spread with `enforce: 'pre'` so it runs before plugin-react regardless of array order (Pitfall 1)"
    - "Tilde-pin all deps (Pitfall 16 — caret pins drift across minor releases)"
    - "Build-time syntax highlighting via Shiki (zero runtime highlighter shipped)"
    - "Pattern 7 Option A — text-shell entry chunk stays MDX-runtime-free"
key-files:
  created:
    - src/ui/MDXRenderer.tsx
  modified:
    - package.json
    - package-lock.json
    - vite.config.ts
    - src/styles/tokens.css
decisions:
  - "Plan 03-01: rehype-pretty-code initially landed with caret pin from npm; manually corrected to tilde and re-ran npm install to refresh package-lock.json (Pitfall 16 carries from Phase 1+2)"
  - "Plan 03-01: MDXRenderer ships as a placeholder with EMPTY components map; Plan 03-05 will overwrite wholesale. Wave 1 only verifies the provider boundary mounts and the import path is stable for Plan 03-02 consumers"
  - "Plan 03-01: highlighted-line CSS rule wrapped in `@layer components` (no existing block in tokens.css — created at end). Uses `var(--color-surface-1)` (NOT a hex literal) so the colors.test.ts gate from Plan 02-01 stays satisfied"
  - "Plan 03-01: vite.config.ts retains BASE constant (Pattern 1 verbatim); the `base: '/Portfolio_Website/'` literal was promoted to a single source-of-truth const to match the RESEARCH Pattern 1 code block"
metrics:
  duration: "4m 45s"
  completed: "2026-05-08"
  commits: 3
  tasks: 3
  files_changed: 5
---

# Phase 3 Plan 01: MDX Pipeline + Phase 3 Deps Foundation Summary

Install the 9 Phase 3 dependencies (MDX 3, Shiki, GSAP) tilde-pinned, wire `@mdx-js/rollup` into `vite.config.ts` with `enforce: 'pre'` per RESEARCH Pattern 1 verbatim, ship a placeholder `<MDXRenderer>` for downstream consumers, append the `[data-highlighted-line]` CSS rule, and verify the Phase 1+2 bundle invariants (text shell <120 KB gz, 3D <450 KB gz, no MDX/R3F/GSAP leak into entry) still hold.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Install Phase 3 deps and verify versions resolve | `27aa5f1` | package.json, package-lock.json |
| 2 | Wire `@mdx-js/rollup` into vite.config.ts (Pattern 1 verbatim) | `bb1c159` | vite.config.ts |
| 3 | Create MDXRenderer placeholder + highlighted-line CSS + verify build invariants | `f62cd9b` | src/ui/MDXRenderer.tsx, src/styles/tokens.css |

## Dependencies Installed

All 9 deps tilde-pinned; resolved versions confirmed via `npm ls --depth=0`:

### Runtime (3)

| Package | Version | Purpose |
|---------|---------|---------|
| `gsap` | `~3.15.0` → 3.15.0 | Camera-choreography timelines (Plan 03-03 + 03-04) |
| `@gsap/react` | `~2.1.2` → 2.1.2 | `useGSAP` hook with auto-cleanup (Plan 03-03) |
| `@mdx-js/react` | `~3.1.1` → 3.1.1 | `<MDXProvider>` runtime — required by `providerImportSource` |

### Build-time (6)

| Package | Version | Purpose |
|---------|---------|---------|
| `@mdx-js/rollup` | `~3.1.1` → 3.1.1 | Vite/Rollup MDX 3 plugin (official path; NOT vite-plugin-mdx) |
| `rehype-pretty-code` | `~0.14.3` → 0.14.3 | Build-time tokenisation pipeline wrapping Shiki |
| `shiki` | `~4.0.2` → 4.0.2 | TextMate-grammar syntax highlighter (VS Code parity) |
| `remark-gfm` | `~4.0.1` → 4.0.1 | GitHub-flavoured Markdown (tables, strikethrough, task lists) |
| `remark-frontmatter` | `~5.0.0` → 5.0.0 | Parses `---` frontmatter blocks |
| `remark-mdx-frontmatter` | `~5.2.0` → 5.2.0 | Exposes parsed frontmatter as a named export |

### Forbidden deps (verified absent)

- `vite-plugin-mdx` (the third-party shim)
- `prismjs` (replaced by Shiki — build-time, not runtime)
- `gray-matter` (`remark-frontmatter` covers parsing)
- `motion`, `framer-motion` (Phase 3 uses GSAP for choreography; no 2D-UI motion lib in v1)
- `zustand` (Phase 3 has no cross-canvas state demand)
- `@react-three/postprocessing` (CRT effects deferred to Phase 4)

## vite.config.ts Diff

The MDX plugin block follows RESEARCH Pattern 1 verbatim:

```ts
plugins: [
  {
    enforce: 'pre',                    // ← runs BEFORE plugin-react regardless of array index
    ...mdx({
      remarkPlugins: [
        remarkFrontmatter,
        [remarkMdxFrontmatter, { name: 'frontmatter' }],
        remarkGfm,
      ],
      rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark', keepBackground: true, defaultLang: 'plaintext' }]],
      providerImportSource: '@mdx-js/react',   // ← required for <MDXProvider> to inject components
    }),
  },
  react({ include: /\.(jsx|js|mdx|md|tsx|ts)$/ }),  // ← widened so plugin-react also transforms MDX's JSX output
  tailwindcss(),
],
```

### Phase 1+2 invariants preserved

- `base: BASE` (BASE = `'/Portfolio_Website/'`) — unchanged
- `build.sourcemap: false` (OPSEC D-15) — unchanged
- `target: 'es2022'` — unchanged
- `chunkFileNames: 'assets/[name]-[hash].js'` (size-limit glob target) — unchanged
- `manualChunks` absent (Phase 2 anti-pattern guard) — verified by negative grep
- `vite-plugin-mdx` absent — verified by negative grep

## MDXRenderer Placeholder

`src/ui/MDXRenderer.tsx` ships as a 9-line `<MDXProvider>` wrapper with an EMPTY components map. Plan 03-05 (Wave 4) overwrites this wholesale with the real components map (`h1`, `h2`, `code`, `a`, `pre`, `CodeBlock`, `ScreenshotFrame`, `ProvenanceFooter`).

Why ship the placeholder now: Plan 03-02 (Wave 2) needs a stable import path for `<MDXRenderer>` when wiring monitor overlays. With an empty components map, MDX renders use default tag-name resolution — fine for Wave 1 because no MDX file exists yet.

## Highlighted-line CSS

Appended to `src/styles/tokens.css` inside a new `@layer components` block:

```css
@layer components {
  pre [data-highlighted-line] {
    background-color: var(--color-surface-1);
    display: block;
    margin: 0 -1rem;
    padding: 0 1rem;
  }
}
```

`var(--color-surface-1)` (not a hex literal) keeps the Plan 02-01 colors.test.ts gate satisfied. The negative margin compensates for the `px-4` (16px) padding the `<CodeBlock>` chrome will add in Plan 03-05.

## Bundle Metrics

Verified via `npm run build && npx size-limit` after Task 3:

| Bundle | Size (gz) | Budget | % | Phase 2 baseline | Δ |
|--------|-----------|--------|---|------------------|---|
| `dist/assets/index-*.js` (text shell entry) | **65.25 KB** | 120 KB | 54% | 65.4 KB | −0.15 KB |
| `dist/assets/ThreeDShell-*.js` (3D chunk) | **236.69 KB** | 450 KB | 53% | 236.7 KB | flat |
| `public/assets/models/workstation.glb` | 48 B | 2500 KB | 0% | 48 B | flat |

The MDX runtime, GSAP, and the 6 build-time devDependencies do NOT inflate either chunk because:
- The build-time deps (`@mdx-js/rollup`, `rehype-pretty-code`, `shiki`, the remark plugins) run inside Vite/Rollup at compile time and never reach the client.
- The runtime deps (`gsap`, `@gsap/react`, `@mdx-js/react`) are not yet imported by any module reachable from `src/main.tsx`. Tree-shaking removes them entirely from this build. They will land in subsequent waves: GSAP into the 3D chunk via Plan 03-03; `@mdx-js/react` only inside the lazy text-shell `<WriteupsRoute>` via Plan 03-05.

## Lazy-load + MDX-not-in-entry Invariants

All four bundle-leak negative greps pass against `dist/assets/index-*.js`:

| Token | Status |
|-------|--------|
| `OrbitControls` | absent — Phase 2 invariant preserved |
| `WebGLRenderer` | absent — Phase 2 invariant preserved |
| `MDXProvider` | absent — Pattern 7 Option A holds at Wave 1 |
| `gsap` | absent — will land in 3D chunk in Plan 03-03 |

Recruiters skimming the text shell never download MDX runtime, GSAP, or any 3D code at first paint.

## Verification Results

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✓ exit 0 |
| `npx eslint . --max-warnings=0` | ✓ exit 0 (clean — no output) |
| `npx prettier --check .` | ✓ "All matched files use Prettier code style!" |
| `npm test` | ✓ 7 files / 54 tests passed |
| `npm run build` | ✓ exit 0 — 612 modules transformed in 413ms |
| `npx size-limit` | ✓ both budgets green |
| Bundle-leak greps (×4) | ✓ all four tokens absent from entry |
| `npm ls` for 9 new deps | ✓ all resolve, no missing/UNMET PEER warnings |
| Forbidden-dep greps (×7) | ✓ all absent (vite-plugin-mdx, prismjs, gray-matter, motion, framer-motion, zustand, @react-three/postprocessing) |
| Tilde-pin compliance | ✓ negative grep on caret pins for the 9 new deps passes |

## Deviations from Plan

**1. [Rule 1 — Bug] rehype-pretty-code initially pinned with caret instead of tilde**
- **Found during:** Task 1 (`npm install --save-dev`)
- **Issue:** `npm install` resolved `rehype-pretty-code@0.14.3` and wrote `"rehype-pretty-code": "^0.14.3"` to package.json despite the explicit `~0.14.3` argument. This is the same Pitfall 16 behaviour observed in Plan 02-01 with `three`.
- **Fix:** Manually edited package.json from `^0.14.3` to `~0.14.3`, re-ran `npm install` to refresh package-lock.json. Negative caret-pin grep then passed.
- **Files modified:** package.json, package-lock.json
- **Commit:** `27aa5f1` (Task 1 commit folds the fix into the install)

No other deviations. The plan was executed exactly as written: vite.config.ts copied verbatim from Pattern 1, MDXRenderer matches the plan's exact source, the CSS rule was appended (not overwritten) per Task 3 instructions.

## Authentication Gates

None encountered. All operations ran offline against the registry mirror that was already authenticated.

## Known Stubs

| File | Line | Reason | Resolved By |
|------|------|--------|-------------|
| `src/ui/MDXRenderer.tsx` | `const components = {} as const;` | Empty components map — Plan 03-05 (Wave 4) overwrites this wholesale with the real h1/h2/code/a/pre + CodeBlock/ScreenshotFrame/ProvenanceFooter map. The Wave 1 placeholder exists only so Plan 03-02 (Wave 2) has a stable import path. | Plan 03-05 |

This stub is intentional and documented; the inline JSDoc in `MDXRenderer.tsx` calls out the placeholder status and points to Plan 03-05.

## Threat Mitigation Status

All STRIDE threats from `<threat_model>` carry their planned mitigation:

| Threat ID | Mitigation Verified |
|-----------|---------------------|
| T-03-01-01 (Tampering — malicious peer dep) | Tilde pins in package.json; package-lock.json committed; `npm ci` deterministic install |
| T-03-01-02 (Info Disclosure — sourcemaps) | `build.sourcemap: false` retained; positive grep `sourcemap: false` confirms |
| T-03-01-03 (Info Disclosure — MDX in entry) | Bundle-leak grep on `MDXProvider` against `dist/assets/index-*.js` passes (token absent) |
| T-03-01-04 (Tampering — vite-plugin-mdx swap) | Negative greps in package.json AND vite.config.ts both pass |
| T-03-01-05 (DoS — Shiki bundled at runtime) | Accepted; size-limit gate would catch any regression — current entry chunk 65.25 KB / 120 KB budget |
| T-03-01-06 (Spoofing — inline `<script>` in MDX) | MDX 3 default sanitisation; no MDX files yet authored — first authored in Plan 03-05 |

No new threat surface introduced beyond what the threat register anticipated.

## Self-Check: PASSED

All claims in this SUMMARY.md verified:

```
[ -f vite.config.ts ]                                       → FOUND
[ -f src/ui/MDXRenderer.tsx ]                               → FOUND
[ -f src/styles/tokens.css ]                                → FOUND
[ -f package.json ]                                         → FOUND
[ -f package-lock.json ]                                    → FOUND
git log --oneline | grep 27aa5f1                            → FOUND
git log --oneline | grep bb1c159                            → FOUND
git log --oneline | grep f62cd9b                            → FOUND
```

All three task commits present in git history; all five claimed files exist on disk.
