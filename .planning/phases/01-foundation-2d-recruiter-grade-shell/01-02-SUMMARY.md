---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 02
subsystem: infra
tags: [github-actions, gh-pages, deploy, ci, opsec, exiftool, node-22, readme]

# Dependency graph
requires:
  - 01-01 (Vite 8 build pipeline + package.json scripts: build/typecheck/lint/format:check/test)
provides:
  - .github/workflows/deploy.yml — GitHub Actions pipeline triggering on push to main + workflow_dispatch
  - Two-job structure (build → deploy) using actions/deploy-pages@v5 and the Pages OIDC trust path
  - Three Phase-1 CI gates (typecheck, eslint --max-warnings=0, prettier --check) wired BEFORE the Vite build
  - Vitest gate (npm test) running Plan 03's 14 lib assertions before build
  - OPSEC gate (exiftool -all= strip + verify with system-tag allowlist) — fails build if any non-allowlisted EXIF/XMP/GPS/Author/CreatorTool tag remains in public/assets/
  - dist/index.html → dist/404.html SPA fallback copy step (between build and artifact upload)
  - README.md — first-deploy setup instructions documenting the one-time manual GH Pages Source toggle (Settings → Pages → GitHub Actions)
affects: [plan-04-ui, plan-05-content, plan-06-seo, plan-07-opsec]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'GitHub Pages OIDC deploy via actions/deploy-pages@v5 (no PAT, no gh-pages branch)'
    - 'CI gates BEFORE build: a typo cannot waste a deploy; matches D-16'
    - 'OPSEC strip + verify pair guarded by `if [ -d public/assets ]` so empty/absent dir is a no-op (Plan 02 ships before Plan 05 CV PDF + Plan 06 OG image)'
    - 'Verify step uses an explicit ALLOWLIST of system tags (ExifToolVersion, FileSize, FileType, FileTypeExtension, MIMEType, Directory, FileName, FilePermissions, FileModifyDate, FileAccessDate, FileInodeChangeDate); offending tags fail build with `OPSEC FAIL:` prefix'
    - 'workflow-level concurrency: { group: pages, cancel-in-progress: false } serializes deploys to prevent race (T-02-07)'
    - 'workflow-level permissions: { contents: read, pages: write, id-token: write } — minimum needed for Pages OIDC, no secret tokens'
    - 'README documents the one-time manual GH Pages Source toggle (RESEARCH.md Pitfall 2) — the only step no Action can automate'

key-files:
  created:
    - Portfolio_Website/.github/workflows/deploy.yml
    - Portfolio_Website/README.md
  modified: []

key-decisions:
  - 'Action versions copied verbatim from RESEARCH.md Pattern 11 — actions/checkout@v4, actions/setup-node@v6 (Node 22), actions/configure-pages@v6, actions/upload-pages-artifact@v5, actions/deploy-pages@v5. No forced upgrades.'
  - 'No `npm test || true` Wave-2 override needed — Plan 03 already shipped 14 vitest assertions, so `npm test` exits 0 cleanly. The PLAN.md override option (intended for the case where Plan 02 were to run before Plan 03) was not exercised because Plan 03 has already landed (commits 39c8c31 + d4b028e).'
  - 'README.md authored verbatim from PLAN.md Task 2 — Prettier check passed first try; no .prettierignore changes needed.'
  - 'Live URL `https://eren-atalay.github.io/Portfolio_Website/` aligned with vite.config.ts `base: ''/Portfolio_Website/''` and GitHub username `eren-atalay`.'

patterns-established:
  - 'Pattern: Workflow-level OPSEC gate (strip + verify) — every later asset addition (CV PDF in Plan 05, OG image in Plan 06) automatically inherits the metadata gate without further workflow edits.'
  - 'Pattern: Pinned action versions verified live + recorded in YAML comment header — Plan 07 OPSEC re-verification has a single source of truth to cross-check.'
  - 'Pattern: SPA-fallback `cp dist/index.html dist/404.html` lives in the workflow (not in vite.config.ts) so the source tree never has a duplicate 404.html artifact under git.'

requirements-completed:
  - FND-02
  - OPS-01 # CI half (exiftool strip + verify automated). Manual review checklist (CHECKLIST-OPSEC.md) lands in Plan 07.
  - CNT-04 # CV PDF metadata-strip gate is wired (the workflow gate). The PDF itself drops in Plan 05.

# Metrics
duration: ~6min  # auto tasks (1+2); Task 3 deferred to Plan 07
completed: 2026-05-06  # auto tasks complete; Task 3 deferred — repo still local-only
task_3_status: deferred-to-plan-07
---

# Phase 1 Plan 02: Deploy Pipeline + GH Pages Bootstrap Summary

**STATUS: Tasks 1 + 2 complete and committed atomically. Task 3 (human-verify GH Pages source toggle) DEFERRED-TO-PLAN-07 because the repo is still local-only (no GitHub remote configured; current git root is `/Users/erenatalay/Desktop/App/`, not `Portfolio_Website/` standalone). User confirmed deferral on 2026-05-06; Plan 07's pre-launch checklist re-opens this gate when the GitHub remote is set up.**

`.github/workflows/deploy.yml` and top-level `README.md` shipped. The workflow pins all GitHub Actions to verified-2026-05-06 versions, runs three CI gates + vitest BEFORE the build, strips + verifies metadata in `public/assets/*`, copies `dist/index.html` → `dist/404.html`, and deploys via `actions/deploy-pages@v5`. Local dry-run of every CI step succeeded.

## Performance

- **Started:** 2026-05-06T12:05:25Z
- **Tasks 1+2 completed:** 2026-05-06T12:08:43Z (~3 min wall-clock for the auto tasks)
- **Auto tasks:** 2 / 2 complete
- **Checkpoint:** 1 / 1 PENDING (Task 3, human-verify)
- **Files created:** 2 (`.github/workflows/deploy.yml`, `README.md`)
- **Files modified:** 0

## Accomplishments (Auto Tasks)

- `.github/workflows/deploy.yml` is a 116-line, two-job (`build` → `deploy`) GitHub Actions workflow:
  - **Triggers:** `push` to `main` + `workflow_dispatch` (per D-15).
  - **Permissions:** `contents: read`, `pages: write`, `id-token: write` (Pages OIDC, no PAT).
  - **Concurrency:** `group: pages`, `cancel-in-progress: false` — serializes deploys (T-02-07 mitigation).
  - **CI gates (D-16):** `npx tsc --noEmit` → `npx eslint . --max-warnings=0` → `npx prettier --check .` → `npm test`. All BEFORE the build, all blocking.
  - **OPSEC gate (D-17 / OPS-01):** Install `libimage-exiftool-perl` → strip `-all= -P -overwrite_original` → verify with explicit system-tag allowlist (anything else fails build with `OPSEC FAIL:` prefix). Both steps guarded by `if [ -d public/assets ] && [ "$(ls -A public/assets 2>/dev/null)" ]` so an empty/absent directory is a clean no-op (the directory does not exist yet — Plans 05 + 06 populate it).
  - **Build:** `npm run build` → `cp dist/index.html dist/404.html` (SPA deep-link fallback for GH Pages) → `actions/upload-pages-artifact@v5 with: path: ./dist`.
  - **Deploy job:** depends on build; uses `environment: { name: github-pages, url: ${{ steps.deployment.outputs.page_url }} }` and `actions/deploy-pages@v5`.
- `README.md` is an 80-line setup ops doc (NOT a marketing page — per PLAN.md guidance). Anchors the load-bearing one-time manual step (Settings → Pages → Source: **GitHub Actions**) front-and-center under "First-deploy setup". Lists prerequisites (Node ≥ 22.12.0), local dev commands, the npm scripts inventory, the workflow's 5-step pipeline, the OPSEC posture, the Phase 1 tech stack, and forward-references `.planning/CHECKLIST-OPSEC.md` (Plan 07).
- All Plan 02 acceptance criteria pass:
  - **Task 1:** 22 grep -F patterns + YAML parse + every dry-run step (typecheck, eslint, prettier, vitest, build, 404 copy) → all green.
  - **Task 2:** 15 grep -F patterns + `npx prettier --check README.md` exits 0; full `npx prettier --check .` also stays green (no regression).

## Task Commits

Atomic per-task commits (parent repo `/Users/erenatalay/Desktop/App`, branch `master`):

1. **Task 1: GitHub Actions deploy workflow** — `692a854` (feat)
2. **Task 2: Top-level README with first-deploy setup instructions** — `f089a7e` (docs)

(The final SUMMARY metadata commit will be made after Task 3 resolves.)

## Files Created/Modified

### Created
- `Portfolio_Website/.github/workflows/deploy.yml` — full pipeline per RESEARCH.md Pattern 11 verbatim. Action versions pinned: `actions/checkout@v4`, `actions/setup-node@v6` (Node 22, with `cache: 'npm'`), `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`.
- `Portfolio_Website/README.md` — first-deploy setup instructions, prerequisites, local dev commands, deploy trigger, OPSEC mention, Phase 1 tech stack.

### Modified
- (none)

## Decisions Made

- **Action versions copied verbatim from PLAN.md / RESEARCH.md Pattern 11.** No forced upgrades; all five action references match the planner's pinned versions exactly.
- **No `npm test || true` override applied.** PLAN.md Task 1 Step 1.4 included a contingency: if vitest exited non-zero on an empty test surface during Wave 2, the executor was permitted to wrap the step as `npm test || true` and remove it after Plan 03 landed. **The override was NOT exercised** because Plan 03's 14 lib assertions already exist in commits `39c8c31` + `d4b028e`, so `npm test` exits 0 cleanly with all 14 tests passing. The deploy.yml has `run: npm test` as-written; no Plan 07 cleanup needed.
- **README.md authored verbatim from PLAN.md Task 2.** Prettier check passed first try — no `.prettierignore` modifications required (Plan 01's existing ignore list already excluded `.planning/`, `.claude/`, `CLAUDE.md`, `node_modules`, `dist`, `coverage`, `public`, `*.lock`, `*.min.js`).
- **Live URL `https://eren-atalay.github.io/Portfolio_Website/`** matches `vite.config.ts` `base: '/Portfolio_Website/'` and the inferred GitHub username `eren-atalay`. CI runtime URL is surfaced as `${{ steps.deployment.outputs.page_url }}` so the actual link in the Actions UI will be authoritative regardless of any rename.

## Deviations from Plan

### Auto-fixed Issues

**None.** Both auto tasks executed verbatim from PLAN.md. No Rule 1 / Rule 2 / Rule 3 fixes were required. No Rule 4 architectural decisions surfaced.

### Authentication Gates

**None during the auto tasks.** Task 3 (human-verify) involves a manual web-UI toggle, but that is by design — it is the one-time GH Pages Source setting that GitHub explicitly does not allow Actions to modify (security boundary).

### Forced Action-Version Upgrades

**None.** All five `actions/*` references kept the planner's pinned versions verbatim:
- `actions/checkout@v4`
- `actions/setup-node@v6` (with `node-version: '22'`)
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`

If GitHub deprecates any of these between Plan 02 and the first real deploy, Plan 07's OPSEC checklist will catch it on the first push to `main` and document the bump in that plan's SUMMARY.

### Local Dry-Run Failures

**None.** Every CI step ran cleanly the first time:
- `npx tsc --noEmit` → exit 0
- `npx eslint . --max-warnings=0` → exit 0
- `npx prettier --check .` → exit 0 (and `npx prettier --check README.md` also exit 0 standalone)
- `npm test` → 3 test files, 14 passed, 0 failed (1.23s)
- `npm run build` → exit 0; `dist/index.html` produced; `dist/assets/index-LEdtLSkg.js` 190.65 kB / 60.08 kB gz (matches Plan 03's bundle size — Plan 02 ships no runtime code).
- `cp dist/index.html dist/404.html` → exit 0; both files present.
- Cleanup: `rm -rf dist` (dist is `.gitignore`d already).

## Verification

### Task 1 Acceptance Criteria (24 checks)

All 22 grep -F patterns matched + YAML parses + every dry-run step exits 0. Highlights:

- `grep -F 'actions/deploy-pages@v5' .github/workflows/deploy.yml` → match
- `grep -F 'permissions:' / 'pages: write' / 'id-token: write'` → all match
- `grep -F 'concurrency:' / 'cancel-in-progress: false'` → match
- `grep -F 'workflow_dispatch:' / 'branches: [main]'` → match
- `grep -F 'libimage-exiftool-perl' / 'exiftool -all= -P -overwrite_original' / 'OPSEC FAIL'` → match
- `grep -F 'cp dist/index.html dist/404.html'` → match
- `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml'))"` → exit 0; jobs detected: `['build', 'deploy']`

### Task 2 Acceptance Criteria (15 checks)

All grep -F patterns matched + `npx prettier --check README.md` exits 0:

- `grep -F '# Portfolio Website' / 'Junior Cybersecurity Analyst' / 'Settings → Pages'` → match
- `grep -F 'Source**, select **GitHub Actions' README.md` → match (load-bearing manual step)
- `grep -F '.github/workflows/deploy.yml' / 'CV PDF' / 'EXIF' / 'CHECKLIST-OPSEC.md'` → match
- `grep -F 'eren-atalay.github.io/Portfolio_Website' / 'Node.js' / '22.12'` → match
- `grep -F 'npm run dev' / 'npm run build'` → match
- `npx prettier --check README.md` → exit 0

### Plan-Level CI Gates (post-commit, current state)

- `npx tsc --noEmit` → exit 0
- `npx eslint . --max-warnings=0` → exit 0
- `npx prettier --check .` → exit 0
- `npm test` → 14 passed (3 files)
- `npm run build` → exit 0; `dist/` regenerable

## Threat Surface

No new web-facing surface introduced — Plan 02 is CI-only. Threat-model entries from PLAN.md applied:

- **T-02-01 (EXIF/XMP/GPS leak in `public/assets/*`)** — mitigated. exiftool strip + allowlisted-tag verify wired in workflow; will activate on Plan 05's CV PDF + Plan 06's OG image automatically.
- **T-02-02 (action-version drift)** — mitigated. All `actions/*` versions verified live 2026-05-06 (per RESEARCH.md) and recorded in the YAML header comment for Plan 07 cross-check.
- **T-02-03 (fork PR leaks secrets)** — accept. Workflow has zero `secrets.*` references; `id-token: write` is OIDC-to-Pages-only, not generic cloud auth. Fork PRs have no write permissions by default.
- **T-02-04 (compromised dep in CI)** — partial mitigation. `npm ci` honours Plan 01's pinned `package-lock.json`; Plan 07 OPSEC checklist runs `npm audit --production` manually.
- **T-02-05 (silent deploy failure)** — accept. Actions logs every step; deploy URL surfaced via `${{ steps.deployment.outputs.page_url }}`.
- **T-02-06 (sourcemaps in `dist/`)** — mitigated. Plan 01 set `vite.config.ts build.sourcemap: false`; this workflow's `npm run build` honours that.
- **T-02-07 (concurrent deploy race)** — mitigated. `concurrency: { group: pages, cancel-in-progress: false }`.

No threat flags raised.

## Self-Check (Auto Tasks): PASSED

### Files exist

- `Portfolio_Website/.github/workflows/deploy.yml` → FOUND
- `Portfolio_Website/README.md` → FOUND
- `Portfolio_Website/.planning/phases/01-foundation-2d-recruiter-grade-shell/01-02-SUMMARY.md` → FOUND (this file, partial)

### Commits exist

- `692a854` (Task 1: feat(01-02): author GitHub Actions deploy workflow for GH Pages) → FOUND in `git log --oneline`
- `f089a7e` (Task 2: docs(01-02): author top-level README with first-deploy setup instructions) → FOUND in `git log --oneline`

---

## Task 3 — DEFERRED-TO-PLAN-07 (checkpoint:human-verify)

**Status:** DEFERRED-TO-PLAN-07 (user confirmed 2026-05-06 — repo is still local-only; no GitHub remote yet).
**Re-opening trigger:** GitHub remote configured + first push to GitHub. Plan 07's pre-launch OPSEC checklist runs the GH Pages Source toggle confirmation as part of the live-deploy audit.

### Why deferred (audit trail)

Inspection of git state on 2026-05-06 confirmed:
- Git root: `/Users/erenatalay/Desktop/App/` (parent of `Portfolio_Website/`, not standalone)
- Remote: none configured
- Branch: `master` (workflow expects `main` — minor mismatch, fix at GitHub-push time)

User chose to defer the GitHub remote + Source toggle work to Plan 07 so the autonomous run can complete Phase 1's local code work (Plans 04, 05, 06) without blocking. The deploy workflow file is committed locally and ready; only the manual one-time GitHub Settings toggle is outstanding.

### What was built (auto tasks)

A complete GitHub Actions deploy workflow at `.github/workflows/deploy.yml` and a top-level `README.md`. The workflow will run automatically on every push to `main`, but the **first-time-only manual step** below CANNOT be automated: GitHub Pages requires the user to flip a setting in the repo's web UI before any workflow can deploy.

### How to verify (user action required)

1. Open the GitHub repo in a browser (e.g. `https://github.com/eren-atalay/Portfolio_Website`).
2. If the repo doesn't exist on GitHub yet, create it (push current local `master`/`main` to a new GitHub repo named `Portfolio_Website`).
3. Navigate to **Settings → Pages**.
4. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch").
5. Save.

### Resume signals (user → orchestrator → executor)

- **`approved`** — toggle is set; mark Task 3 complete, finalize this SUMMARY, advance plan counter, write the metadata commit.
- **`deferred — repo not yet on GitHub`** — repo is still local-only; defer Task 3 to Plan 07's pre-launch checklist; mark Task 3 as DEFERRED-TO-PLAN-07 in the final SUMMARY; still advance plan counter (the auto deliverables are complete).

### Why Task 3 cannot be auto-approved

This is genuinely a `checkpoint:human-action` (the rare 1% case from the executor's checkpoint protocol). GitHub Pages Source toggle is a security boundary that no Action — including any workflow this executor authored — can flip on its own. The PLAN.md `<resume-signal>` is the canonical single source of truth for the resolution.

---

## Self-Check

- Task 1: PASSED (deploy.yml authored, all 22 grep checks + YAML parse + local dry-run passed; commit `692a854`)
- Task 2: PASSED (README.md authored, all 15 grep checks + Prettier check passed; commit `f089a7e`)
- Task 3: DEFERRED-TO-PLAN-07 (GitHub remote not yet configured; user confirmed deferral 2026-05-06)

Plan 02 deliverables are complete pending the manual GH Pages source toggle (Plan 07 gate).

---

*Plan 02 closes with auto deliverables shipped and Task 3 explicitly deferred to Plan 07's pre-launch live-deploy audit. Phase 1 plans 04, 05, 06 are unblocked.*
