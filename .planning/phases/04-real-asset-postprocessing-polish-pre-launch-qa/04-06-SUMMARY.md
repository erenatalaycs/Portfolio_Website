---
phase: 04-real-asset-postprocessing-polish-pre-launch-qa
plan: 06
subsystem: 3d-assets
tags: [r3f, drei, useGLTF, gltfjsx, polyhaven, cc0, draco, webp]

requires:
  - phase: 02-3d-shell-asset-pipeline-capability-gating
    provides: "procedural <Workstation /> with 3 <Monitor> wrappers + 1m=1unit scale (D-04)"
  - phase: 03-content-integration-mdx-write-ups-camera-choreography
    provides: "<Monitor> click-to-focus + DISTANCE_FACTOR + <MonitorOverlay> Html transform projection (D-03 / D-08)"
  - phase: 04-real-asset-postprocessing-polish-pre-launch-qa
    plan: 01
    provides: "PostFX Bloom pulls emissive monitor green + lamp amber"

provides:
  - "CC0 GLB composite for desk + lamp + bookshelf (Poly Haven, 869 KB total post-gltfjsx)"
  - "Per-asset size-limit budgets replacing the Phase 2 placeholder entry"
  - "drei useGLTF integration pattern (preload + scene.clone + emissive override via material traversal)"
  - "Phase 4 Path-A landed: 3D-08 GLB scope fully shipped (NOT PARTIAL)"

affects:
  - "Plan 04-07 (pre-launch QA): runs npm audit on three / three-stdlib / drei (T-04-06-03)"
  - "Plan 04-08 (real-device QA): visual readability + emissive bloom + monitor-screen-plane verification"
  - "v1.1 milestone: V2-3D-01 NOT promoted (Path A landed); ships with Phase 4 GLB composite intact"

tech-stack:
  added:
    - "Poly Haven CC0 GLBs (Metal Office Desk, Desk Lamp Arm 01, Wooden Bookshelf Worn)"
  patterns:
    - "drei useGLTF + useGLTF.preload + scene.clone(true) pattern (Pattern 1/2 from 04-RESEARCH.md)"
    - "Emissive override at React layer via scene.traverse + material.clone (UI-SPEC § Real GLB swap option b)"
    - "CC0 + procedural composite (when no CC0 model exists for a slot, retain procedural wrapper geometry)"

key-files:
  created:
    - "public/assets/workstation/desk.glb (194 KB)"
    - "public/assets/workstation/lamp.glb (320 KB)"
    - "public/assets/workstation/bookshelf.glb (355 KB)"
    - "public/assets/workstation/LICENSE.txt (CC0 provenance + monitor deviation rationale)"
  modified:
    - "src/scene/Workstation.tsx (procedural <Desk>/<Lamp>/<Bookshelf> → <primitive object={glb.scene}>)"
    - "package.json (single GLB size-limit entry → three per-asset budgets)"
  deleted:
    - "public/assets/models/workstation.glb (Phase 2 48-byte placeholder, orphaned by size-limit path change)"

key-decisions:
  - "Path A (composite via Poly Haven) confirmed during execution; D-04 timebox not triggered (shipped in ~14 minutes, far under the 7-day window from 2026-05-09)."
  - "D-02 KTX2 → WebP correction acknowledged: gltfjsx --transform defaults to WebP; KTX2 path is unreachable per CLAUDE.md (forbids hand-rolling @gltf-transform/cli)."
  - "Monitor mesh deviation: Poly Haven has no CC0 monitor model (API search 2026-05-11 returned only chinese_screen_panels — a folding privacy screen). Procedural <Monitor> wrapper geometry retained. The composition is 'CC0 + procedural', not pure CC0. Documented in LICENSE.txt + this SUMMARY."
  - "Phase 2 placeholder public/assets/models/workstation.glb (48-byte stub) deleted in this plan to keep the repo clean — out-of-scope hygiene per Rule 2; the size-limit entry was already redirected to the new public/assets/workstation/ path."
  - "Procedural Desk/Lamp/Bookshelf component files retained in src/scene/ as the D-04 timebox-expired rollback target (per plan's clean-revert path)."

patterns-established:
  - "useGLTF cache safety: clone scenes with .clone(true) and clone materials before mutating emissive — drei's cache is shared across remounts and direct mutation leaks across components."
  - "Material identification: run `npx gltfjsx@~6.5 <gltf> --types --console` (without --transform) once to dump TypeScript-typed mesh + material names, then hard-code names in the React component."
  - "Pipeline command for hero asset: `npx gltfjsx@~6.5 source.gltf --transform --resolution 1024 --format webp` (NO --output flag — gltfjsx writes the transformed binary as `source-transformed.glb` adjacent to the source; rename to the final filename after the run)."

requirements-completed:
  - "3D-08 — GLB workstation (postprocessing-emissive-target half) — FULLY shipped this plan. Postprocessing-pipeline half landed in Plan 04-01."

duration: 14min
completed: 2026-05-11
---

# Phase 4 Plan 06: Real CC0 GLB Workstation Integration — Summary

**Real Poly Haven CC0 composite (desk + lamp + bookshelf, 869 KB post-pipeline) replaces the Phase 2 procedural primitives in `<Workstation />`; <Monitor> wrappers retained with their procedural geometry because Poly Haven has no CC0 monitor model. Shipped Path A in ~14 minutes — timebox D-04 not triggered.**

## Performance

- **Duration:** 14 min (829 seconds)
- **Started:** 2026-05-11T14:54:08Z
- **Completed:** 2026-05-11T15:07:57Z
- **Tasks:** 3/3 (Task 1 checkpoint pre-resolved by orchestrator; Task 2 + Task 3 autonomous)
- **Files created:** 4 (3 GLBs + LICENSE.txt)
- **Files modified:** 2 (Workstation.tsx, package.json)
- **Files deleted:** 1 (public/assets/models/workstation.glb — Phase 2 stub)
- **Timebox status:** Path A landed inside the 2026-05-09 → 2026-05-16 window with 5+ days of headroom.

## Path Taken: A (GLB Shipped)

**Timebox start:** 2026-05-09 (per orchestrator's pre-resolved decision).
**Timebox cutoff:** 2026-05-16.
**Actual completion:** 2026-05-11 — 5+ days remain. No timebox-expired path activated. 3D-08 ships FULL (not PARTIAL).

## Accomplishments

- Three CC0 Poly Haven GLBs acquired, transformed via `gltfjsx@6.5.3 --transform`, and committed: desk (194 KB), lamp (320 KB), bookshelf (355 KB) — total 869 KB, ≤ 2 MB plan budget, ≤ 2.5 MB OPS-02 ceiling.
- `src/scene/Workstation.tsx` swapped to `<primitive object={glb.scene}>` via drei `useGLTF`. Lamp bulb material (`desk_lamp_arm_01_light`) emissive overridden to `--color-warn` (#e3b341, intensity 2.0) per UI-SPEC § Real GLB swap visual contract option (b).
- Three `<Monitor>` wrappers + `<MonitorOverlay>` children preserved unchanged — they own click-to-focus (Phase 3 D-08) and the `<Html transform>` screen plane projection (Phase 3 D-03 contract).
- `package.json` size-limit reconfigured: single Phase 2 placeholder entry (2500 KB) replaced by three per-asset budgets (desk ≤ 1000 KB, lamp ≤ 500 KB, bookshelf ≤ 500 KB; cumulative 2000 KB).
- All 6 size-limit budgets pass with comfortable headroom (text shell 64.87/120 KB; 3D chunk 59.82/450 KB; PostFX 84.89/100 KB; GLBs all under per-asset caps).
- `public/assets/workstation/LICENSE.txt` documents CC0 provenance, per-asset source URLs, authors, gltfjsx pipeline flags, exiftool metadata-gate result, and the monitor-mesh deviation rationale.
- Phase 2 placeholder `public/assets/models/workstation.glb` (48-byte stub) deleted — orphaned once the size-limit entry was redirected.

## Task Commits

Each task committed atomically on branch `worktree-agent-a6241fad4b7054f01`:

1. **Task 1 — Checkpoint:decision** (pre-resolved by orchestrator) — Option A (Composite via Poly Haven) selected; D-02 KTX2 → WebP correction acknowledged; timebox start 2026-05-09. No commit (checkpoint task).
2. **Task 2 — Acquire + transform + license** — `f256faaf` (feat) — 4 files: desk.glb, lamp.glb, bookshelf.glb, LICENSE.txt.
3. **Task 3 — Swap Workstation.tsx + size-limit + verify** — `7019d08c` (feat) — 3 files changed (Workstation.tsx, package.json, removed models/workstation.glb).

**Plan metadata (forthcoming):** SUMMARY.md + STATE.md + ROADMAP.md + REQUIREMENTS.md update — single docs commit at plan close.

## Files Created / Modified / Deleted

**Created:**
- `public/assets/workstation/desk.glb` (194 KB) — Poly Haven `metal_office_desk` by Ulan Cabanilla, CC0, gltfjsx `--resolution 1024 --format webp`.
- `public/assets/workstation/lamp.glb` (320 KB) — Poly Haven `desk_lamp_arm_01` by Yann Kervran + Kuutti Siitonen, CC0, gltfjsx `--resolution 512 --format webp`.
- `public/assets/workstation/bookshelf.glb` (355 KB) — Poly Haven `wooden_bookshelf_worn` by Ulan Cabanilla, CC0, gltfjsx `--resolution 512 --format webp`.
- `public/assets/workstation/LICENSE.txt` — Per-asset CC0 provenance + monitor-mesh deviation rationale + metadata-gate notes.

**Modified:**
- `src/scene/Workstation.tsx` — `useGLTF` import + module-scope preloads + scene-clone-per-mount + lamp emissive override via `scene.traverse`. Procedural component imports (`Desk`, `Lamp`, `Bookshelf`) removed.
- `package.json` — Single `models/workstation.glb` size-limit entry → three per-asset entries (desk, lamp, bookshelf).

**Deleted:**
- `public/assets/models/workstation.glb` — Phase 2 placeholder stub (48 bytes). The directory `public/assets/models/` now also empty.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 — Missing Functionality] Poly Haven has no CC0 monitor model**

- **Found during:** Task 2 (Step 1 — asset shortlist).
- **Issue:** The plan's Pattern 1 in 04-RESEARCH.md asserts "Poly Haven offers individual desk/monitor/lamp/bookshelf models all CC0." API verification on 2026-05-11 against `https://api.polyhaven.com/assets?type=models` showed Poly Haven's 436-model catalogue contains NO monitor / TV / computer / display asset. The only "screen" result was `chinese_screen_panels` (a folding privacy screen, not a computer display).
- **Fix:** Retain the procedural `<Monitor>` wrapper geometry (frame box + emissive screen plane + stand cylinder from Phase 2 D-06). The wrapper is also load-bearing for Phase 3 click-to-focus and `<Html transform>` projection, so its geometry being procedural is functionally aligned. The composition is now "CC0 + procedural", not pure CC0.
- **Files affected:** `public/assets/workstation/LICENSE.txt` (rationale), `src/scene/Monitor.tsx` (unchanged — procedural geometry retained).
- **Commit:** Documented in `f256faaf` commit message + LICENSE.txt; reflected in `7019d08c` (no `monitor.glb` import in the swapped Workstation.tsx).
- **Out-of-scope alternative considered:** Switching to The Base Mesh (RESEARCH option 5) for a CC0 monitor mesh. Rejected because Base Mesh ships untextured base meshes (zero visual upgrade over the existing procedural box+plane combo), adds a second asset source to license-verify, and the Phase 3 `<Monitor>` wrapper's geometry already serves the Phase 4 emissive-target role for Bloom postprocessing.

**2. [Rule 2 — Repo Hygiene] Phase 2 placeholder GLB orphaned by size-limit path change**

- **Found during:** Task 3 (Step 2 — package.json size-limit update).
- **Issue:** `public/assets/models/workstation.glb` was the Phase 2 size-limit target (48-byte stub, never wired into runtime). Once the size-limit entry was redirected to `public/assets/workstation/*.glb`, the placeholder became dead binary in the repo.
- **Fix:** `git rm public/assets/models/workstation.glb` as part of the Task 3 commit. Models directory now empty and not tracked.
- **Commit:** `7019d08c` (deletion bundled with Workstation.tsx + package.json edits).

### CWD-Drift Incident (Self-Inflicted, Recovered)

During Task 3 execution, multiple `Bash` calls drifted to the **main repo cwd** (`/Users/erenatalay/Desktop/App/Portfolio_Website`) instead of the worktree (`/Users/erenatalay/Desktop/App/.../agent-a6241fad4b7054f01`). This is the cwd-drift bug documented in CLAUDE.md (#3097): every new Bash call resets cwd to the session default, which is the orchestrator's cwd (main repo), NOT the worktree. **Symptom:** my `git rm public/assets/models/workstation.glb` was initially staged on `main` (not on the worktree branch); my CI runs (`typecheck`, `lint`, `test`, `parity`, `build`, `size`) executed in the main repo against the OLD (pre-Phase-4) source. **Recovery:**
1. Detected drift via `git rev-parse --show-toplevel` returning the main repo path.
2. Unstaged the spurious `git rm` in the main repo (`git restore --staged` + `git checkout --`).
3. Confirmed worktree files (`src/scene/Workstation.tsx`, `package.json`) DID receive my edits via absolute-path Write/Edit (CLAUDE.md #3099 was respected because my paths were absolute).
4. Re-ran ALL CI (`typecheck`, `lint`, `test`, `parity`, `format:check`, `build`, `size`) inside the worktree via explicit `cd /Users/erenatalay/Desktop/App/Portfolio_Website/.claude/worktrees/agent-a6241fad4b7054f01 && ...` prefix.
5. Re-`git rm`'d the placeholder in the worktree cwd; staged + committed Task 3 on the correct branch.

**Outcome:** worktree branch is clean and correct; main repo is untouched. No data lost. All CI passes inside the worktree.

**Lesson:** Subsequent Bash calls in this session ALL prefixed with explicit `cd <worktree-path>`. The worktree-branch positive allow-list assertion (pre-commit safety) passed for both `f256faa` and `7019d08` commits.

## CI Verification

All gates green inside the worktree:

| Gate | Result |
| ---- | ------ |
| `npm run typecheck` | PASS (no tsc errors) |
| `npm run lint` | PASS (eslint clean) |
| `npm run format:check` | PASS (prettier clean) |
| `npm run parity` | PASS (TXT-06 + CNT-03 + Pitfall 8 green) |
| `npm test --run` | PASS (91 / 91 tests) |
| `npm run build` | PASS (`dist/assets/workstation/*.glb` present, total 866 KB) |
| `npm run size` | PASS (all 6 budgets — text shell 64.87 KB, 3D chunk 59.82 KB, PostFX 84.89 KB, desk 193.66 KB, lamp 320.29 KB, bookshelf 354.9 KB) |

## Visual Verification (Deferred)

Per plan `<verification>` section item 3, the following are deferred to **Plan 04-08 (real-device QA)** — they require visual inspection of the rendered scene which is not feasible in this autonomous executor session:

- **Body text readability** in `<Html transform>` overlays at the default orbit pose (Phase 3 D-03 contract). The Monitor wrapper screen plane geometry is unchanged from Phase 3 (procedural box+plane, same size), so the existing `DISTANCE_FACTOR = 1.8` in `cameraPoses.ts` SHOULD remain correct — no retune applied. If Plan 04-08 finds it unreadable, retune is the only permitted knob.
- **Emissive bloom selectivity** (Plan 04-01 PostFX): with the real desk/lamp/bookshelf in scene, the Bloom threshold tuning (CONTEXT D-08: `threshold=0.6 intensity=0.6`) needs eyeball verification — the lamp emissive should bloom, the desk/bookshelf diffuse textures should NOT bloom. Plan 04-08 step.
- **Asset positioning + scale** correctness: uniform scales `0.6 / 0.5 / 0.7` are best-effort approximations to the Phase 2 procedural envelope. Plan 04-08 may reveal that the desk sits too low (or the bookshelf clips the camera frustum). Tune via the `scale={...}` and `position={...}` props on each `<primitive>` in `Workstation.tsx`; camera poses themselves are NOT permitted to change (CONTEXT D-03).
- **UV-texture content review** (T-04-06-02): visual inspection of the desk/lamp/bookshelf surfaces for accidentally-baked hostnames / IPs / logos. Poly Haven CC0 textures are generic metal/wood/fabric materials — extremely low risk, but CHECKLIST-OPSEC § Screenshot Review covers it formally.

## Asset Pipeline Reproduction Notes

For future plan executors / v1.1 maintainers, the exact reproduction recipe:

```bash
# 1. Download (via Poly Haven public API with User-Agent header — without UA, API returns 403):
curl -fsSL -A "your-build-pipeline/1.0" \
  "https://api.polyhaven.com/files/metal_office_desk" | jq '.gltf["1k"].gltf'
# .gltf URLs come back with co-located .bin + textures/*.jpg; download all into one dir.

# 2. Transform per asset (gltfjsx writes <source>-transformed.glb adjacent to source;
#    --output is for the JSX wrapper, NOT the binary — that confused the first run):
npx gltfjsx@~6.5 /tmp/source-assets/metal_office_desk/metal_office_desk_1k.gltf \
  --transform --resolution 1024 --format webp
# Output: /tmp/source-assets/metal_office_desk/metal_office_desk_1k-transformed.glb

# 3. Rename + move:
mv /tmp/source-assets/metal_office_desk/metal_office_desk_1k-transformed.glb \
   public/assets/workstation/desk.glb

# 4. Inspect material names (one-shot, NOT --transform):
npx gltfjsx@~6.5 /tmp/source-assets/desk_lamp_arm_01/desk_lamp_arm_01_1k.gltf \
  --types --console
# This output reveals the actual material names baked into the GLB (e.g. desk_lamp_arm_01_light)
# which the emissive-override scene.traverse hardcodes against.
```

## Authentication / Human Gates

None encountered. No Poly Haven account or API key required — public API is unauthenticated (with User-Agent header).

## Known Stubs

None — no placeholder data, no "coming soon" surfaces, no empty arrays flowing to UI.

## Threat Flags

None new beyond the plan's own `<threat_model>`. The Plan 04-06 STRIDE register (T-04-06-01 through T-04-06-06) is the canonical set; this SUMMARY records mitigation status:

| Threat ID | Disposition | Mitigation Status |
|-----------|-------------|-------------------|
| T-04-06-01 (metadata leak) | mitigate | DONE — gltfjsx rebuild discards source metadata; exiftool -a post-pass confirms clean. |
| T-04-06-02 (UV-baked hostnames/logos) | mitigate | DEFERRED to Plan 04-08 CHECKLIST-OPSEC visual review. Poly Haven CC0 materials are generic; risk is theoretical. |
| T-04-06-03 (GLTFLoader CVE) | accept | three@~0.184.0 pinned; Plan 04-07 `npm audit` gate covers transitive CVEs. |
| T-04-06-04 (oversized asset DoS) | mitigate | DONE — per-asset size-limit budgets in `package.json` (1000+500+500 KB caps; CI gate blocks deploy on overage). |
| T-04-06-05 (CC0 license fraud) | mitigate | DONE — Poly Haven is uniformly CC0 (API verified); LICENSE.txt records source URLs and authors. |
| T-04-06-06 (timebox-expired = "couldn't ship") | accept | N/A — Path A landed; deferral didn't trigger. |

## Self-Check: PASSED

**File presence:**
- `public/assets/workstation/desk.glb` — FOUND (192 KB)
- `public/assets/workstation/lamp.glb` — FOUND (316 KB)
- `public/assets/workstation/bookshelf.glb` — FOUND (348 KB)
- `public/assets/workstation/LICENSE.txt` — FOUND (4 KB)
- `src/scene/Workstation.tsx` — FOUND (8 KB, 142 lines, useGLTF integrated)
- `package.json` — FOUND (per-asset size-limit entries present)
- `.planning/phases/04-real-asset-postprocessing-polish-pre-launch-qa/04-06-SUMMARY.md` — FOUND (this file)
- `public/assets/models/workstation.glb` — REMOVED (intentional)

**Commit presence (branch `worktree-agent-a6241fad4b7054f01`):**
- `f256faa` — FOUND (Task 2: asset acquisition + LICENSE)
- `7019d08` — FOUND (Task 3: Workstation.tsx + package.json + placeholder removal)

**Acceptance-grep (from plan frontmatter):**
- `grep -F 'CC0' public/assets/workstation/LICENSE.txt` — PASS
- `grep -F 'useGLTF' src/scene/Workstation.tsx` — PASS
- `grep -F 'primitive object' src/scene/Workstation.tsx` — PASS
- `grep -F 'workstation' package.json` — PASS
