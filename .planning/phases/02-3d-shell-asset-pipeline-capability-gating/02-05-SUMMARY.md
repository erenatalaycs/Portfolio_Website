---
phase: 02-3d-shell-asset-pipeline-capability-gating
plan: 05
subsystem: ci-byte-budgets
tags: [size-limit, ci-gate, github-actions, byte-budgets, ops-02, phase-2-final]

requires:
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 04
    provides: dist/assets/index-*.js text-shell entry chunk + dist/assets/ThreeDShell-*.js lazy 3D chunk with stable filename pattern (vite chunkFileNames pinned in Plan 02-01)
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    plan: 01
    provides: size-limit + @size-limit/preset-app dev deps; vite.config.ts entryFileNames/chunkFileNames pin
  - phase: 01-foundation
    plan: 02
    provides: .github/workflows/deploy.yml shape (build job → 404 copy → upload-artifact → deploy job)

provides:
  - "package.json `scripts.size` — runs `size-limit` against the local dist/ build"
  - "package.json `scripts.size:why` — registered for future use; currently errors with @size-limit/file plugin (only @size-limit/webpack supports --why)"
  - "package.json `size-limit` array (3 entries) — text shell <120 KB gz, 3D chunk <450 KB gz, GLB workstation <2500 KB raw"
  - ".github/workflows/deploy.yml `Enforce bundle size budgets` step — runs npx size-limit between Build (Vite) and 404 copy; fails the deploy on any budget overage"
  - "public/assets/models/workstation.glb — 48 B minimal valid GLB placeholder (asset version 2.0, empty scene); Phase 4 overwrites with the real Draco-compressed model"

affects:
  - "Phase 4 (asset pipeline) — replaces public/assets/models/workstation.glb with the real Draco-compressed workstation model; no size-limit config change needed (the 2500 KB budget already enforces). Phase 4 also extends the OPSEC exiftool scan to recurse into public/assets/models/"
  - "Future contributors — any PR that bloats the text shell entry past 120 KB gz or the 3D chunk past 450 KB gz now fails CI before merge; the lazy-load contract from Plan 02-04 (R3F absent from index-*.js) is automatically enforced (R3F leaking into the entry would push it past 120 KB)"

tech-stack:
  added: []
  patterns:
    - "size-limit `package.json` config — top-level `\"size-limit\"` array sibling of `\"dependencies\"`/`\"scripts\"`; lilconfig auto-discovery (no separate config file needed)"
    - "`@size-limit/file` plugin (via @size-limit/preset-app) — measures file size with gzip/brotli/raw mode; does NOT support `ignore` option (that's webpack/esbuild-only). Plan 4 contributors who need bundle-graph analysis (`--why`) must add @size-limit/webpack"
    - "GLB raw-byte budget pattern — `\"gzip\": false, \"brotli\": false` reports the on-disk file size (Draco GLBs are already binary-compressed, so gzip/brotli would be misleading)"
    - "CI byte-budget gate — `npx size-limit` step lives in build job between `npm run build` and artifact upload; non-zero exit prevents `actions/upload-pages-artifact@v5` and therefore `actions/deploy-pages@v5` from running"
    - "Placeholder-file pattern for pre-configured budgets — when a future-phase asset isn't ready yet, ship a minimal valid placeholder file at the expected path so size-limit's path glob resolves; the future phase replaces the file with the real asset, requiring no config change. Cleaner than the `ignore: [\"all\"]` approach the plan specified (which doesn't work with the file plugin)"

key-files:
  created:
    - public/assets/models/workstation.glb
    - .planning/phases/02-3d-shell-asset-pipeline-capability-gating/02-05-SUMMARY.md
  modified:
    - package.json
    - .github/workflows/deploy.yml

key-decisions:
  - "Plan 02-05: replaced plan's `ignore: [\"all\"]` approach with a 48-byte minimal valid GLB placeholder — the @size-limit/file plugin (used by preset-app) errors on `ignore` (\"needs @size-limit/webpack or @size-limit/esbuild plugin\"). Placeholder approach is functionally cleaner: Phase 4 overwrites the file, no config change needed"
  - "Plan 02-05: GLB entry uses both `gzip: false` AND `brotli: false` — without `brotli: false`, size-limit defaults to brotli compression which gives misleading numbers for already-binary-compressed Draco GLBs. Real-file-size on disk is the correct metric (matches what GH Pages serves)"
  - "Plan 02-05: Prettier's `json-stringify` parser (used specifically for package.json) always wraps arrays on multiple lines — would have broken the plan's literal grep `\"ignore\": [\"all\"]`, but moot since we removed `ignore` entirely"
  - "Plan 02-05: `size:why` script registered but currently errors (size-limit's --why flag requires @size-limit/webpack). Kept the script for future use when a webpack plugin is added; the plan's verify block only requires the script to EXIST in package.json, not to function. Documented in the plan's Step 1.4 (\"Recording that the script works exists is enough\")"
  - "Plan 02-05: CI step inserted at line 116 between Build (line 106) and Copy 404 (line 119) — the artefact upload (line 125) is gated. A budget overage fails npm exit code 1 → step fails → upload-pages-artifact does not run → deploy-pages does not run → live site unchanged"

patterns-established:
  - "Pattern: byte-budget gate via size-limit + GH Actions exit-code gating — the CI step's non-zero exit prevents downstream artifact upload, which prevents deploy. No special workflow plumbing needed"
  - "Pattern: pre-Phase-4 GLB placeholder — minimal valid 48 B GLB at the expected path satisfies size-limit and any potential GLB loaders that try to read it; Phase 4 overwrites without config drift"
  - "Pattern: lazy-load contract enforcement — the 120 KB gz text-shell budget mathematically forbids R3F (~170 KB gz) from leaking into the entry chunk; if a future static import accidentally pulls R3F into index-*.js, the build fails CI before any bundle-graph inspection is needed"

requirements-completed: [OPS-02]

duration: 6min
completed: 2026-05-06
---

# Phase 2 Plan 05: Size-Limit CI Gate Summary

**Three byte budgets enforced via size-limit + GitHub Actions: text shell <120 KB gz, 3D chunk <450 KB gz, GLB <2500 KB raw. CI step `npx size-limit` exit-fails between build and artifact upload, gating the entire deploy. All three budgets pass with substantial headroom: text shell 65.3 KB gz (54%), 3D chunk 236.7 KB gz (53%), GLB 48 B placeholder.**

## Outcome

Plan 02-05 closes requirement OPS-02 end-to-end. The text-shell-stays-R3F-free invariant from Plan 02-04 is now automatically enforced — any future contributor who accidentally static-imports `@react-three/*` from a `src/ui/*` or `src/sections/*` file would push the entry chunk past 120 KB gz (R3F minifies to ~170 KB gz alone), failing CI before merge. The 3D chunk budget gives Phase 3 (drei `<Html>` content + GSAP camera) and Phase 4 (postprocessing pipeline) substantial headroom (47% remaining = ~213 KB gz).

After this plan, **Phase 2 is fully complete: 5/5 plans landed, 12/12 plans across Phases 1+2.**

## Bundle Metrics (recorded at Plan 05 ship time)

| Entry | Path | Limit | Actual | Headroom |
|-------|------|-------|--------|----------|
| Text shell | `dist/assets/index-*.js` | 120 KB gz | **65.26 KB gz** | 46% (54.7 KB) |
| 3D lazy chunk | `dist/assets/ThreeDShell-*.js` | 450 KB gz | **236.69 KB gz** | 47% (213.3 KB) |
| GLB workstation | `public/assets/models/workstation.glb` | 2500 KB raw | **48 B (placeholder)** | ~99.998% (Phase 4 fills) |

`npm run size` exit code: **0**. All three budgets PASS.

The text-shell entry's headroom is the load-bearing one: Phase 1's "recruiter ships in <2s on slow 3G" claim depends on the entry staying under ~70 KB gz on the network path. 65.26 KB gz with 46% margin to the 120 KB ceiling means Phases 3-4 can add modest (e.g., a small JSON content blob) features without panic — but R3F or another heavy dep slipping into the entry would still trip the budget by a wide margin.

## Files

### Created

| File | Bytes | Purpose |
|------|-------|---------|
| `public/assets/models/workstation.glb` | 48 | Minimal valid GLB placeholder (`{"asset":{"version":"2.0"}}` JSON chunk only); Phase 4 replaces with real Draco-compressed workstation |
| `.planning/phases/02-3d-shell-asset-pipeline-capability-gating/02-05-SUMMARY.md` | — | This file |

### Modified

| File | Lines added | Purpose |
|------|-------------|---------|
| `package.json` | +24 (scripts +2, size-limit array +22) | `size` + `size:why` scripts; top-level `size-limit` array with 3 entries |
| `.github/workflows/deploy.yml` | +10 | `Enforce bundle size budgets` CI step + provenance comment |

## CI Workflow Step Ordering

Verified after edit:

```
106:      - name: Build (Vite)
107:        run: npm run build
108:
109:      # Phase 2 OPS-02: enforce three byte budgets via size-limit.
110:      # ...
115:      # Source: 02-RESEARCH.md Pattern 9 (size-limit Configuration)
116:      - name: Enforce bundle size budgets
117:        run: npx size-limit
118:
119:      - name: Copy index.html → 404.html (SPA fallback for GH Pages deep links)
120:        run: cp dist/index.html dist/404.html
...
125:      - name: Upload artifact
```

Build → Enforce budgets → 404 copy → Upload artifact. The gate sits BEFORE artifact upload so a budget overage prevents the artifact from existing → `actions/deploy-pages@v5` (in the dependent `deploy` job) cannot run → live site unchanged.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Replaced `ignore: ["all"]` with placeholder-file approach**

- **Found during:** Task 1 verification — `npm run size` errored with: `Config option ignore needs @size-limit/webpack or @size-limit/esbuild plugin`.
- **Issue:** The plan specified the GLB entry should use `ignore: ["all"]` to skip checks until Phase 4 lands the real GLB. That option is documented for size-limit's webpack/esbuild bundler plugins (it tells the bundler to ignore certain modules during bundling). The `@size-limit/file` plugin used by `preset-app` does NOT support it — size-limit errors immediately when parsing the config. The plan author's assumption that `ignore: ["all"]` would skip the entry was incorrect for our plugin set.
- **Fix:** Removed the `ignore` field entirely. Created a 48-byte minimal valid GLB placeholder at `public/assets/models/workstation.glb` (glTF 2.0 magic header + JSON chunk: `{"asset":{"version":"2.0"}}`). The 2500 KB budget enforces from Day 1 (a 48 B file passes trivially). Phase 4 simply overwrites the file with the real Draco-compressed model — **no config change needed**, which is cleaner than the original plan's design (Phase 4 was meant to remove the `ignore` line). Added `brotli: false` to the entry so the on-disk byte count is reported (without it, size-limit defaults to brotli, which gives misleading numbers for binary-compressed GLBs).
- **Files modified:** `package.json` (3rd entry config), `public/assets/models/workstation.glb` (new file).
- **Commit:** `1aa912d`.
- **Acceptance criteria affected:** The plan's grep `grep -F "\"ignore\": [\"all\"]" package.json` cannot pass (the field was removed). The semantic intent ("GLB entry pre-configured for Phase 4 without breaking Phase 2") is satisfied via the placeholder file. The plan's other grep / shape checks (3 entries, correct paths, correct limits, correct gzip flags) all pass.

**2. [Rule 1 - Bug] `size:why` script registered but currently errors with our plugin set**

- **Found during:** Task 1 Step 1.4 verification — `npm run size:why` errored: `Argument --why works only with @size-limit/webpack plugin and @size-limit/webpack-why plugin`.
- **Issue:** The `--why` flag requires a webpack plugin to produce the bundle-graph analysis. Our preset-app uses the file plugin which has no module graph to analyze.
- **Fix:** Kept the script registered (the plan's acceptance criteria require the script to EXIST in `package.json`, not to function — the plan's Step 1.4 says: *"Recording that the script works exists is enough"*). The script is reserved for future use when a webpack plugin is added. Documented in this SUMMARY's `key-decisions` and `Threat Flags` sections so future contributors don't waste time debugging it.
- **Files modified:** none (script was added per plan in Task 1).

**3. [Rule 3 - Blocking] Prettier's `json-stringify` parser forces multi-line arrays in package.json**

- **Found during:** Task 1 prettier check after editing package.json.
- **Issue:** Prettier infers a `json-stringify` parser specifically for `package.json` (verified via `npx prettier --file-info package.json`); this parser mimics `JSON.stringify(..., null, 2)` semantics and ALWAYS wraps array elements onto separate lines. This was orthogonal to the actual fix above (we removed `ignore` entirely), but worth recording: any future plan that adds an inline array literal like `["all"]` to package.json will face the same multi-line-formatting reality.
- **Fix:** N/A — moot once `ignore` was removed. Documented for future awareness.
- **Files modified:** none (informational).

## Acceptance Criteria — Verification

### Task 1 (size-limit config + scripts in package.json)

- [x] `grep -F '"size": "size-limit"' package.json` matches
- [x] `grep -F '"size:why": "size-limit --why"' package.json` matches
- [x] `grep -F '"size-limit":' package.json` matches (config field)
- [x] `grep -F '"text shell' package.json` matches (entry name)
- [x] `grep -F '"3D chunk' package.json` matches (entry name)
- [x] `grep -F '"GLB workstation model' package.json` matches (entry name)
- [x] `grep -F 'dist/assets/index-*.js' package.json` matches
- [x] `grep -F 'dist/assets/ThreeDShell-*.js' package.json` matches
- [x] `grep -F 'public/assets/models/workstation.glb' package.json` matches
- [x] `grep -F '"limit": "120 KB"' package.json` matches
- [x] `grep -F '"limit": "450 KB"' package.json` matches
- [x] `grep -F '"limit": "2500 KB"' package.json` matches
- [x] `grep -F '"gzip": true' package.json` matches (×2 — text shell + 3D chunk)
- [x] **Deviation:** `grep -F '"ignore": ["all"]' package.json` does NOT match — see Deviation 1 above (we replaced `ignore` with a placeholder file)
- [x] `node -e "const p=require('./package.json'); if(!Array.isArray(p['size-limit'])||p['size-limit'].length!==3) process.exit(1)"` exits 0
- [x] `node -e "const p=require('./package.json'); const e=p['size-limit']; if(e[0].limit!=='120 KB'||e[1].limit!=='450 KB'||e[2].limit!=='2500 KB') process.exit(1)"` exits 0
- [x] `node -e "const p=require('./package.json'); if(!p.scripts.size||!p.scripts['size:why']) process.exit(1)"` exits 0
- [x] `npx prettier --check package.json` exits 0
- [x] `npm run build` exits 0
- [x] `npm run size` exits 0 (all 3 budgets pass)
- [x] `! grep -F "manualChunks" vite.config.ts` exits 0 (Plan 01-01 lock preserved)

### Task 2 (CI gate in deploy.yml)

- [x] `grep -F "Enforce bundle size budgets" .github/workflows/deploy.yml` matches
- [x] `grep -F "npx size-limit" .github/workflows/deploy.yml` matches
- [x] `grep -F "Source: 02-RESEARCH.md Pattern 9" .github/workflows/deploy.yml` matches (provenance)
- [x] YAML parses cleanly (`python3 -c "import yaml; yaml.safe_load(...)"`)
- [x] Step ordering: Build (106) → Enforce (116) → 404 copy (119) → Upload artifact (125)
- [x] `! grep -F "size-limit --why" .github/workflows/deploy.yml` exits 0 (CI uses plain size-limit)
- [x] `actions/upload-pages-artifact@v5` preserved
- [x] `actions/deploy-pages@v5` preserved
- [x] `exiftool -all=` preserved
- [x] `cp dist/index.html dist/404.html` preserved
- [x] `npx prettier --check .github/workflows/deploy.yml` exits 0
- [x] `npm run build && npx size-limit` exits 0 locally (CI mirror)
- [x] `cp dist/index.html dist/404.html && test -f dist/404.html` exits 0

## End-of-Plan CI Gate Mirror

All six commands exit 0:

```
npx tsc --noEmit                 → OK
npx eslint . --max-warnings=0    → OK
npx prettier --check .           → OK
npm test                         → 7 files, 54/54 pass
npm run build                    → ✓ built in 384ms
npm run size                     → all 3 budgets within limits
```

## Phase 4 Hand-off Notes

When Phase 4 lands the real Draco-compressed workstation GLB:

1. **Replace** `public/assets/models/workstation.glb` (48 B placeholder) with the real model. Target: ≤2 MB Draco-compressed.
2. **No `package.json` size-limit config change required** — the entry is already wired with the correct path, limit (2500 KB), and `gzip: false, brotli: false` semantics. Real file size will be reported.
3. **Extend OPSEC scan** in `.github/workflows/deploy.yml` (the `Strip metadata from public/assets` and `Verify no metadata remains` steps): the current `for f in public/assets/*` is non-recursive, so `models/` subdir is skipped. Phase 4 must change to `find public/assets -type f` (or add a second loop) so the GLB is metadata-stripped before deploy.
4. **No `vite.config.ts` change required** — Vite copies `public/*` to `dist/*` verbatim; the GLB will be served at `/Portfolio_Website/assets/models/workstation.glb` automatically.

The placeholder file is intentionally a minimal valid glTF 2.0 binary — if Phase 3's drei `<useGLTF>` accidentally tries to load it during testing, it will resolve to an empty scene rather than throwing a parse error.

## Threat Flags

None — Plan 02-05 introduces no new attack surface. The CI workflow runs against trusted GitHub Actions runners; size-limit operates on local files only (no network calls beyond `npm ci` which is already in the workflow).

The OPSEC `exiftool` scan does NOT currently recurse into `public/assets/models/` — that's a Phase 4 follow-up (the placeholder GLB at 48 B contains no metadata, but the real Phase 4 GLB might if exported from Blender without --strip-extras).

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 | `1aa912d` | `feat(02-05): add size-limit config + scripts to package.json` |
| 2 | `425cf36` | `feat(02-05): add size-limit CI gate to deploy workflow` |

## Phase 2 Final State

| # | Plan | Status | Commit |
|---|------|--------|--------|
| 02-01 | Dependencies + scene-color mirror + vite chunk pin | Complete | (Plan 02-01 SUMMARY) |
| 02-02 | App-level lazy import + capability detection + placeholders | Complete | (Plan 02-02 SUMMARY) |
| 02-03 | Header + view/camera toggles + ContextLossBar | Complete | (Plan 02-03 SUMMARY) |
| 02-04 | Procedural workstation scene + Canvas + context-loss listener | Complete | (Plan 02-04 SUMMARY) |
| 02-05 | size-limit budgets + CI gate (this plan) | **Complete** | `1aa912d`, `425cf36` |

**Phase 2 progress: 5/5 plans complete.**
**Cross-phase progress: Phases 1+2 = 12/12 plans complete.**

The Phase 2 success criteria from ROADMAP.md are all closed:

1. **3D shell loads on capable devices via `?view=3d`** — Plan 02-02 capability detection + Plan 02-04 Canvas + scene
2. **Text shell defaults for low-end / no-WebGL2 / `prefers-reduced-motion`** — Plan 02-02 detectCapability heuristic
3. **`webglcontextlost` swaps cleanly to text shell + dismissible info bar** — Plan 02-03 ContextLossBar + Plan 02-04 listener
4. **View toggle works in both shells; camera toggle in 3D only** — Plan 02-03 Header + Plan 02-04 wiring
5. **size-limit budgets enforced in CI** — **Plan 02-05 (this plan)**

Phase 3 (drei `<Html>` monitor content + click-to-focus camera + animated whoami) is unblocked: the 3D shell has the placeholder emissive monitor planes ready for `<Html transform occlude>` overlay; the OrbitControls clamp / unclamp split is in place; the ~213 KB gz of 3D-chunk headroom comfortably absorbs Phase 3's GSAP + drei's `<Html>` runtime cost.

## Self-Check: PASSED

- [x] All claimed files exist:
  - `package.json` (modified) — verified
  - `.github/workflows/deploy.yml` (modified) — verified
  - `public/assets/models/workstation.glb` (created, 48 B) — verified
  - `.planning/phases/02-3d-shell-asset-pipeline-capability-gating/02-05-SUMMARY.md` (this file) — being written
- [x] Both task commits exist in `git log`: `1aa912d`, `425cf36`
- [x] All 6 end-of-plan CI gates exit 0: tsc, eslint, prettier, vitest (54/54), vite build, size-limit
- [x] CI workflow YAML parses cleanly; step ordering verified

---
_Phase: 02-3d-shell-asset-pipeline-capability-gating_
_Completed: 2026-05-06_
