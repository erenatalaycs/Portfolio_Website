---
phase: 03-content-integration-mdx-write-ups-camera-choreography
plan: 05
subsystem: mdx-rendering-layer
tags: [mdx, writeups, lazy-boundary, code-splitting, attack-techniques, opsec, suspense, react-lazy]
requires: [03-01, 03-02, 03-03]
provides:
  - writeups-barrel
  - attack-techniques-table
  - mdx-renderer-full-components-map
  - mdx-chrome-components
  - writeup-list-view-monitor-switcher
  - text-shell-lazy-mdx-boundary
affects:
  - src/content/writeups.ts
  - src/content/attack-techniques.ts
  - src/content/writeups/.gitkeep
  - src/ui/MDXRenderer.tsx
  - src/ui/CodeBlock.tsx
  - src/ui/ScreenshotFrame.tsx
  - src/ui/ProvenanceFooter.tsx
  - src/ui/WriteupList.tsx
  - src/ui/WriteupView.tsx
  - src/ui/WriteupsMonitor.tsx
  - src/sections/Writeups.tsx
  - src/routes/WriteupsRoute.tsx
  - src/shells/TextShell.tsx
tech-stack:
  added: []
  patterns:
    - "Pattern 7 Option A — text shell lazy MDX boundary via React.lazy(() => import('../routes/WriteupsRoute')); MDXProvider absent from entry chunk verified by negative grep"
    - "Pattern 9 — typed writeups barrel via import.meta.glob({ eager: true }); empty directory ships at Wave 4, Plan 06 fills *.mdx files"
    - "Pattern 10a Alternate — CodeBlock walks rehype-pretty-code <figure> children to extract filename + data-language; renders chrome strip with [copy]/[copied] BracketLink + aria-live span"
    - "Pattern 10b — ScreenshotFrame mandatory accent-green [✓ sanitized] OPSEC badge + assetUrl-prefixed src for GH Pages base path"
    - "Pattern 10c — ProvenanceFooter auto-mounted by WriteupView (NOT in MDX bodies); ATT&CK lookup with '(unknown technique — add to attack-techniques.ts)' fallback for missing entries"
    - "Pattern 8 — MDXRenderer components map maps h1/h2/code/a/figure built-ins + ScreenshotFrame/ProvenanceFooter as direct MDX-author components"
    - "Pitfall 9 mitigation — assertFrontmatter throws at import time on missing required fields with file path + field name in error message"
    - "color-mix(in srgb, var(--color-accent) 20%, transparent) borders for CodeBlock + ScreenshotFrame; color-mix(in srgb, var(--color-muted) 30%, transparent) for ProvenanceFooter top separator (UI-SPEC color contracts verbatim)"
key-files:
  created:
    - src/content/writeups.ts
    - src/content/attack-techniques.ts
    - src/content/writeups/.gitkeep
    - src/ui/CodeBlock.tsx
    - src/ui/ScreenshotFrame.tsx
    - src/ui/ProvenanceFooter.tsx
    - src/ui/WriteupList.tsx
    - src/ui/WriteupView.tsx
    - src/routes/WriteupsRoute.tsx
  modified:
    - src/ui/MDXRenderer.tsx
    - src/ui/WriteupsMonitor.tsx
    - src/sections/Writeups.tsx
    - src/shells/TextShell.tsx
decisions:
  - "Plan 03-05: removed `role=\"list\"` and `role=\"listitem\"` from <ul>/<li> in WriteupList.tsx and Writeups.tsx to satisfy jsx-a11y/no-redundant-roles. The plan's verbatim source had these attrs but they trigger the lint rule because <ul>/<li> already have those implicit roles. aria-label=\"Write-ups index\" preserved on <ul> — semantics unchanged. Documented as Rule 3 deviation in commit message."
  - "Plan 03-05: Pattern 7 Option A invariant DECREASED text-shell entry chunk by 3.30 KB (65.32 → 62.02 KB gz) because MDXRenderer's MDXProvider import is now reachable only through the React.lazy boundary in TextShell. The Plan 03-01 placeholder MDXRenderer was already imported by Wave 2's WriteupsMonitor (which itself is in the 3D chunk), so the entry chunk never had MDXProvider — but the WriteupsRoute lazy boundary now also splits the WriteupView/MDX runtime out for the text-shell path explicitly. Net: text shell paying 0 KB for MDX is correct."
  - "Plan 03-05: The WriteupsRoute-*.js chunk is 0.28 KB raw / 0.24 KB gz at Wave 4 — almost empty because writeups/ has no *.mdx files yet (only .gitkeep). When Plan 06 adds 3 MDX files, this chunk grows to ~30 KB gz (compiled MDX + the route wrapper). The barrel + lazy boundary contract are stable; Plan 06 just authors content."
  - "Plan 03-05: prettier reformatted CodeBlock.tsx and ProvenanceFooter.tsx during Task 2 (line-wrap differences vs the plan's verbatim source — semantically identical). Same pattern as previous waves; documented for the verifier."
metrics:
  duration: "~10m"
  completed: "2026-05-08"
  commits: 3
  tasks: 3
  files_changed: 13
---

# Phase 3 Plan 05: MDX Rendering Layer + Lazy WriteupsRoute Boundary Summary

Ship the MDX rendering layer (CNT-02) and the in-place WriteupList/WriteupView switcher on the right monitor (3D-05): typed writeups barrel via `import.meta.glob({ eager: true })`; hand-curated MITRE ATT&CK lookup table; 3 MDX chrome components (`<CodeBlock>` with rehype-pretty-code figure walker + [copy] button, `<ScreenshotFrame>` with mandatory `[✓ sanitized]` OPSEC badge, `<ProvenanceFooter>` auto-mounted by WriteupView); full `<MDXProvider>` components map; `<WriteupList>` index + `<WriteupView>` slug renderer with `<NotFound />` fallback; `<WriteupsMonitor>` switching on `?focus=writeups/<slug>`; `<Writeups>` text-shell section reading from the barrel without mounting MDX; lazy `<WriteupsRoute>` boundary in TextShell so MDX runtime stays out of the text-shell entry chunk (Pattern 7 Option A — verified by `! grep -F MDXProvider dist/assets/index-*.js`). Plan 06 just authors 3 MDX files; the glob picks them up and both shells render automatically.

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Author writeups barrel + attack-techniques table + writeups directory | `62c0dff` | src/content/writeups.ts, src/content/attack-techniques.ts, src/content/writeups/.gitkeep |
| 2 | Author the 3 MDX components (CodeBlock, ScreenshotFrame, ProvenanceFooter) | `9d6c7f3` | src/ui/CodeBlock.tsx, src/ui/ScreenshotFrame.tsx, src/ui/ProvenanceFooter.tsx |
| 3 | MDXRenderer (full components map) + WriteupList + WriteupView + WriteupsMonitor + WriteupsRoute + Writeups text-shell + TextShell lazy boundary + final build verify | `9f909e3` | src/ui/MDXRenderer.tsx, src/ui/WriteupList.tsx, src/ui/WriteupView.tsx, src/ui/WriteupsMonitor.tsx, src/sections/Writeups.tsx, src/routes/WriteupsRoute.tsx, src/shells/TextShell.tsx |

## New File Inventory

### `src/content/writeups.ts` (~80 LOC)

Typed barrel — single source of truth for write-up frontmatter + compiled MDX. Exports:

| Symbol | Type | Purpose |
|--------|------|---------|
| `WriteupType` | `'detection' \| 'cti' \| 'web-auth'` | D-15 type union |
| `WriteupDisclaimer` | `'home-lab'` | Optional frontmatter discriminator |
| `WriteupFrontmatter` | interface | D-14 frontmatter schema (title, slug, type, date, duration, tags, sources, attack_techniques + optional disclaimer/author) |
| `Writeup` | extends WriteupFrontmatter | Adds `Component: ComponentType` (compiled MDX default export) |
| `writeups` | `Writeup[]` | Sorted newest-first by ISO date |
| `getWriteup` | `(slug: string) => Writeup \| undefined` | O(n) find on writeups[] (n ≤ ~10 expected through Phase 4) |

`assertFrontmatter` (Pitfall 9): throws on import if any of the 8 required fields missing. Build fails loudly with file path + field name in the error message.

`import.meta.glob<{ default; frontmatter }>('./writeups/*.mdx', { eager: true })` returns `{}` at Wave 4 ship state (directory is empty except for `.gitkeep`). Wave 5 (Plan 06) drops MDX files in; the glob picks them up automatically — no consumer code changes.

### `src/content/attack-techniques.ts` (~40 LOC)

Hand-curated subset of MITRE ATT&CK Enterprise — 15 entries total covering D-17's 3 write-ups + future-growth neighbours:

| Group | IDs |
|-------|-----|
| Detection (LOLBins + Sigma + Splunk) | T1140, T1105, T1218.010, T1218.005, T1218.011 |
| CTI (sample → ATT&CK) | T1059.001, T1059.003, T1027, T1071 |
| Web Auth (JWT alg confusion) | T1190, T1078, T1212 |
| Future-growth neighbours | T1566, T1083, T1041 |

`ProvenanceFooter` falls back to `'(unknown technique — add to attack-techniques.ts)'` for any id missing from this map (recruiter-visible — author discipline is the gate; no CI enforcement).

### `src/content/writeups/.gitkeep` (0 bytes)

Empty directory marker — required so the static `import.meta.glob` path resolves at build time when no `.mdx` files exist yet.

### `src/ui/CodeBlock.tsx` (~110 LOC)

MDX `figure` override for rehype-pretty-code's wrapper output (Pattern 10a Alternate). Walks `children` to find `figcaption` (filename source) and `pre` (data-language source); renders chrome strip with:
- `<filename muted>` (left, flex-1)
- `<lang muted>` (right)
- `[copy]` / `[copied]` BracketLink button (clipboard write + 1.5s state flip)
- `<span aria-live="polite">` announcing "Copied to clipboard" for screen readers

Border colour: `color-mix(in srgb, var(--color-accent) 20%, transparent)` (UI-SPEC). Caption-bar background: `bg-surface-1`. Code area preserves the pre + code with all `data-line`/`data-highlighted-line` attrs intact (so the Plan 01 highlighted-line CSS rule applies).

### `src/ui/ScreenshotFrame.tsx` (~38 LOC)

Required props: `n: number`, `src: string`, `alt: string`, `caption: string`. Renders bordered `<figure>` with:
- `<img src={assetUrl(`writeups/${src}`)} alt={alt} />` — assetUrl prefix handles the `/Portfolio_Website/` GH Pages base path
- `<figcaption>` with `fig {n} — {caption}` in muted + accent-green `[✓ sanitized]` badge with `aria-label="Sanitized per OPSEC checklist"`

The `[✓ sanitized]` badge is mandatory and not opt-in — author-asserted, OPSEC-checklist-verified (Plan 03-07).

### `src/ui/ProvenanceFooter.tsx` (~95 LOC)

Auto-mounted at the bottom of every `<WriteupView>` (NOT in MDX bodies — UI-SPEC). Reads `frontmatter: WriteupFrontmatter`; renders:
- `# sources` — each source string parsed as `Display Name: url`; renders BracketLink to URL with `external` (rel=noopener noreferrer)
- `# attack-techniques` — BracketLink to `https://attack.mitre.org/techniques/${id.replace('.', '/')}/` + canonical name from ATTACK_TECHNIQUES (or unknown-technique fallback)
- `# meta` — `— ${author ?? identity.name}, ${date}`
- Optional `# disclaimer: home lab — synthetic data, no live targets engaged` line when `disclaimer === 'home-lab'`

Top separator: 1px solid `color-mix(in srgb, var(--color-muted) 30%, transparent)` (UI-SPEC). `role="contentinfo"` for landmark navigation.

### `src/ui/WriteupList.tsx` (~52 LOC)

Right-monitor index + reused by text-shell `<Writeups>`. `$ ls writeups/` heading via TerminalPrompt; per-row layout:
- Type marker `[D]` / `[I]` / `[W]` (accent green)
- BracketLink title → `?focus=writeups/<slug>`
- Indented (5ch via `paddingLeft: '5ch'`) `${date} · ${duration}` muted

Empty state when `writeups.length === 0`: `# No write-ups published yet — first lands during Phase 3.` (UI-SPEC verbatim).

### `src/ui/WriteupView.tsx` (~52 LOC)

Slug renderer. `getWriteup(slug)` → if null, returns `<NotFound />`. Otherwise:
- Absolute top-left `[← back to list]` BracketLink button (`onClick: setQueryParams({ focus: 'writeups' })` + `e.preventDefault()`)
- `<MDXRenderer><Component /></MDXRenderer>` wrapping the compiled MDX
- Auto-mounted `<ProvenanceFooter frontmatter={frontmatter} />`

`aria-label="Back to write-ups list"` on the button. `pt-12` reserves space for the absolute back button.

### `src/routes/WriteupsRoute.tsx` (~25 LOC)

Lazy-boundary `default export` wrapping `<WriteupView>` in a text-shell `<main id="main">` container (`max-w-[72ch] px-4 md:px-6 py-12`). TextShell does `lazy(() => import('../routes/WriteupsRoute'))` so MDX runtime + WriteupView land in their own chunk.

## Modified File Diffs

### `src/ui/MDXRenderer.tsx` — OVERWRITES Plan 01 placeholder

Before (Plan 01): empty components map, 9-line placeholder.

After (Plan 05): full `<MDXProvider>` components map per Pattern 8:
- `h1: WriteupH1` — wraps children in `<TerminalPrompt>` ($ prefix in accent green)
- `h2: WriteupH2` — kebab-cases the heading text and renders `$ cat <kebab>.md`
- `code: InlineCode` — passes through if `data-language` present (rehype-pretty-code's fenced output); otherwise applies `bg-surface-1 px-1 text-fg` inline styling
- `a: MDXLink` — wraps in BracketLink; auto-detects external (`href.startsWith('http')`)
- `figure: CodeBlock` — rehype-pretty-code wraps fenced code in `<figure>`; this routes to our chrome
- `ScreenshotFrame, ProvenanceFooter` — author-direct components for explicit MDX use

### `src/ui/WriteupsMonitor.tsx` — OVERWRITES Plan 02 placeholder

Before (Plan 02): mounted `<Writeups />` placeholder verbatim.

After (Plan 05): `useQueryParams()` subscriber; if `focus.startsWith('writeups/')`, returns `<WriteupView slug={focus.slice('writeups/'.length)} />`; else `<WriteupList />`. D-19 in-place mode — content swap without camera animation; `<FocusController>` stays at `'right'` regardless of slug.

### `src/sections/Writeups.tsx` — OVERWRITES Phase 1 stub

Before: hardcoded "No write-ups published yet" `<p>` paragraph.

After: reads `writeups[]` barrel + renders the same WriteupList structure (type marker + BracketLink to `?focus=writeups/<slug>` + date · duration). Empty state preserved when `writeups[]` is empty (Wave 4 ship state). Imports only frontmatter — does NOT mount MDX runtime (Pattern 7 Option A — text-shell stays MDX-runtime-free until ?focus=writeups/<slug> deep-links land).

### `src/shells/TextShell.tsx` — Phase 3 lazy MDX boundary

Added at top of file:
```tsx
const WriteupsRoute = lazy(() => import('../routes/WriteupsRoute'));

function WriteupsLoadingSkeleton({ slug }: { slug: string }) { … }
```

`useQueryParams()` + early return: if `focus.startsWith('writeups/')`, renders `<Suspense fallback={<WriteupsLoadingSkeleton slug={...} />}><WriteupsRoute slug={...} /></Suspense>` instead of the long-scroll body. Header + footer + skip-link preserved across both branches. The loading skeleton reads frontmatter (date + duration) from the barrel — lightweight enough to render before the lazy chunk loads.

Long-scroll body unchanged for non-write-up URLs.

## Bundle Metrics

```
dist/assets/index-DwxmLWo6.js              202.34 kB raw │  62.02 kB gz   (52% of 120 KB) ↓ 3.30 KB vs Plan 03
dist/assets/ThreeDShell-DgssZo87.js        983.84 kB raw │ 268.66 kB gz   (60% of 450 KB) ↑ 0.92 KB vs Plan 03
dist/assets/WriteupsRoute-p4YFBGNV.js        0.28 kB raw │   0.24 kB gz   (NEW lazy chunk; Plan 06 fills)
dist/assets/WriteupView-BRSK6GqE.js          6.15 kB raw │   2.27 kB gz   (NEW; code-split by lazy boundary)
dist/assets/NotFound-BJD4c1qS.js            12.98 kB raw │   5.09 kB gz   (NEW chunk for the fallback path)
public/assets/models/workstation.glb        48 B placeholder              (Phase 4 swap)
```

| Bundle | Plan 03-03 → Plan 03-05 | Δ gz | Cause |
|--------|-------------------------|------|-------|
| Text shell entry | 65.32 → 62.02 KB gz | **−3.30 KB** | MDXRenderer was previously imported through WriteupsMonitor's transitive graph. The new TextShell lazy boundary explicitly splits MDX runtime + WriteupView out into the WriteupsRoute chunk; recruiters who skim the index never download MDX. |
| 3D chunk | 267.74 → 268.66 KB gz | +0.92 KB | 3 MDX chrome components (CodeBlock + ScreenshotFrame + ProvenanceFooter) reachable through WriteupsMonitor → MDXRenderer in the 3D shell graph. |
| WriteupsRoute (new) | — → 0.24 KB gz | +0.24 KB | Empty wrapper. Plan 06's 3 MDX files will grow this to ~30 KB gz. |

### Pattern 7 Option A Invariant (verified by negative grep)

| Token | `dist/assets/index-*.js` (entry) | `dist/assets/ThreeDShell-*.js` (3D) |
|-------|----------------------------------|-------------------------------------|
| `MDXProvider` | absent ✓ | present ✓ |
| `OrbitControls` | absent ✓ | present ✓ (drei) |
| `gsap` | absent ✓ | present ✓ (Plan 03) |

Recruiters using the text shell pay 0 KB for MDX runtime, GSAP, drei, three.js, or @react-three/fiber on first paint. The lazy `WriteupsRoute` chunk loads only when they navigate to `?focus=writeups/<slug>`.

## Verification Results

| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | ✓ exit 0 |
| `npx eslint . --max-warnings=0` | ✓ exit 0 (clean) |
| `npx prettier --check .` | ✓ "All matched files use Prettier code style!" |
| `npm test -- --run` | ✓ 7 files / 54 tests passed |
| `npm run build` | ✓ exit 0 — 633 modules transformed in 421ms |
| `npx size-limit` | ✓ both budgets green (52% / 60%) |
| `! grep -F "MDXProvider" dist/assets/index-*.js` | ✓ (Pattern 7 Option A invariant) |
| `grep -F "MDXProvider" dist/assets/ThreeDShell-*.js` | ✓ (3D chunk has MDX runtime) |
| `ls dist/assets/WriteupsRoute-*.js` | ✓ (lazy chunk exists as a separate file) |
| `! grep -F "OrbitControls" dist/assets/index-*.js` | ✓ (Phase 2 invariant preserved) |
| Task 1 positive greps (×16) | ✓ all match |
| Task 2 positive greps (×22) | ✓ all match |
| Task 2 negative greps (×3 — no lawyer / no Last updated / no Hire me) | ✓ all pass |
| Task 3 positive greps (×26) | ✓ all match |
| Plan-level verification block (×7) | ✓ all match |

### Empty-Glob Build Sanity (Wave 4 invariant)

`getWriteup('any-slug')` returns `undefined` cleanly because `writeups[]` is `[]` at Wave 4 ship state. The `WriteupView` component's `if (!writeup) return <NotFound />` branch handles this — every `?focus=writeups/<slug>` URL renders `<NotFound />` until Plan 06 authors *.mdx files. The `<WriteupList>` renders the UI-SPEC empty-state copy ("# No write-ups published yet — first lands during Phase 3."). Production build passes against the empty glob (`vite build` exits 0).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking issue] `role="list"` and `role="listitem"` removed from <ul>/<li>**

- **Found during:** Task 3 verification (`npx eslint --max-warnings=0`)
- **Issue:** Plan 03-05's verbatim source for `WriteupList.tsx` and `Writeups.tsx` includes `<ul role="list" aria-label="Write-ups index">` and `<li role="listitem">`. The eslint rule `jsx-a11y/no-redundant-roles` flags these as errors because `<ul>` and `<li>` already have those implicit roles. With `--max-warnings=0`, the build fails.
- **Fix:** Removed the redundant `role="list"` and `role="listitem"` attributes. `aria-label="Write-ups index"` preserved on `<ul>` — the labelled-list semantic is unchanged because the implicit role still applies.
- **Files modified:** `src/ui/WriteupList.tsx`, `src/sections/Writeups.tsx`
- **Commit:** `9f909e3` (folded into Task 3 commit; documented in commit message)
- **Why this isn't a Rule 4 architectural change:** the accessibility tree is identical (ul has implicit role list; li has implicit role listitem). Screen readers see the same structure with or without the explicit role attrs. This is the textbook Rule 3 case — a fix required for the lint gate to pass.

**2. [Cosmetic — Prettier formatting] line-wrap reformatting in CodeBlock.tsx + ProvenanceFooter.tsx**

- **Found during:** Task 2 (`npx prettier --check`)
- **Issue:** The plan's verbatim source was longer than 100 chars per line in two spots. Prettier reformatted with line wraps.
- **Fix:** `npx prettier --write` on both files; semantically identical to the plan source.
- **Files modified:** `src/ui/CodeBlock.tsx`, `src/ui/ProvenanceFooter.tsx`
- **Commit:** `9d6c7f3` (folded into Task 2 commit)

No other deviations. Every other file matches the plan's source-code blocks verbatim.

## Authentication Gates

None encountered. All operations ran offline.

## Known Stubs

| File | Reason | Resolved By |
|------|--------|-------------|
| `src/content/writeups/` directory containing only `.gitkeep` | Wave 4 ship state per plan. Plan 06 (Wave 5) authors 3 MDX files (D-17 — Detection, CTI, Web Auth write-ups) and the `import.meta.glob({ eager: true })` picks them up automatically. WriteupView renders `<NotFound />` for any `?focus=writeups/<slug>` URL until Plan 06 fills the directory. | Plan 06 |
| `WriteupsRoute-*.js` lazy chunk = 0.24 KB gz | Empty wrapper module — Plan 06's 3 MDX files will grow this to ~30 KB gz once compiled MDX content + the route's reachability graph become non-trivial. The Pattern 7 Option A boundary stays in place. | Plan 06 |
| `DISTANCE_FACTOR = 1.8` in `src/scene/cameraPoses.ts` (carried from Plans 02 + 03) | No visual smoke verification on monitor-overlay text legibility yet. Plan 03-05 doesn't change this — only the right-monitor swap mechanic — so the overlay-text-render variable is still untuned. | Phase 4 visual smoke / pre-launch checklist |

## Threat Mitigation Status

All STRIDE threats from the plan's `<threat_model>` carry their planned mitigation:

| Threat ID | Mitigation Verified |
|-----------|---------------------|
| T-03-05-01 (Spoofing — MDX inline `<script>`) | MDX 3 sanitises by default; `! grep -F "<script" src/ui/CodeBlock.tsx src/ui/ScreenshotFrame.tsx src/ui/ProvenanceFooter.tsx` passes; UI-SPEC bans inline script. CSP `<meta>` tag (Phase 1 baseline) tightens further in Phase 4. |
| T-03-05-02 (Tampering — unsanitised screenshot under `[✓ sanitized]` badge) | OPSEC checklist gate (Plan 03-07) is the verifier; pre-commit local strip + manual full-resolution review per `.planning/CHECKLIST-OPSEC.md`. CI exiftool gate verifies metadata strip. |
| T-03-05-03 (Information Disclosure — MDX runtime in entry chunk) | Pattern 7 Option A: `! grep -F "MDXProvider" dist/assets/index-*.js` passes; `lazy(() => import('../routes/WriteupsRoute'))` boundary confirmed by `ls dist/assets/WriteupsRoute-*.js`. |
| T-03-05-04 (Tampering — `?focus=writeups/../../etc/passwd`) | `getWriteup()` does an exact-match find on `writeups[]` (which is the static glob result); slugs are object keys, not file paths. Path traversal impossible — unknown slugs render `<NotFound />`. |
| T-03-05-05 (Information Disclosure — false `[✓ sanitized]` assurance) | OPSEC checklist Plan 06 acceptance gate; Plan 03-07 final OPSEC sweep. Author discipline + CI metadata strip + manual review = 3 independent gates. |
| T-03-05-06 (DoS — malformed MDX frontmatter breaks writeups[] import) | `assertFrontmatter` throws at module-import time with file path + missing field name (Pitfall 9). `vite build` exits non-zero on first violation. Wave 4 builds pass because the directory is empty. |
| T-03-05-07 (Repudiation) | n/a — accept (static portfolio, no audit log) |
| T-03-05-08 (Elevation of Privilege) | n/a — accept (no auth) |

No new threat surface beyond what the threat register anticipated.

## Plan 06 Readiness

The MDX rendering layer is fully wired. Plan 06 (Wave 5) needs only to:

1. Author 3 MDX files in `src/content/writeups/`:
   - `lolbin-sigma-detection.mdx` (type: detection)
   - `cti-sample-attack.mdx` (type: cti)
   - `jwt-alg-confusion.mdx` (type: web-auth)
2. Each MDX file ships frontmatter matching `WriteupFrontmatter` (D-14):
   - `title`, `slug`, `type`, `date`, `duration`, `tags`, `sources`, `attack_techniques`, `disclaimer?`, `author?`
3. Drop screenshots under `public/assets/writeups/<slug>/` for `<ScreenshotFrame>` consumption.

The `import.meta.glob({ eager: true })` picks them up automatically. `<WriteupList>` populates the index in both shells; `<WriteupView>` resolves slugs and renders the compiled MDX. No consumer-code changes needed in Plan 06 — only authoring + screenshots.

## Self-Check: PASSED

All claims in this SUMMARY.md verified:

```
[ -f src/content/writeups.ts ]                  → FOUND
[ -f src/content/attack-techniques.ts ]         → FOUND
[ -f src/content/writeups/.gitkeep ]            → FOUND
[ -f src/ui/CodeBlock.tsx ]                     → FOUND
[ -f src/ui/ScreenshotFrame.tsx ]               → FOUND
[ -f src/ui/ProvenanceFooter.tsx ]              → FOUND
[ -f src/ui/MDXRenderer.tsx ]                   → FOUND
[ -f src/ui/WriteupList.tsx ]                   → FOUND
[ -f src/ui/WriteupView.tsx ]                   → FOUND
[ -f src/ui/WriteupsMonitor.tsx ]               → FOUND
[ -f src/sections/Writeups.tsx ]                → FOUND
[ -f src/routes/WriteupsRoute.tsx ]             → FOUND
[ -f src/shells/TextShell.tsx ]                 → FOUND
git log --oneline | grep 62c0dff                → FOUND  (Task 1)
git log --oneline | grep 9d6c7f3                → FOUND  (Task 2)
git log --oneline | grep 9f909e3                → FOUND  (Task 3)
```

All three task commits present in git history; all 13 claimed files exist on disk.
