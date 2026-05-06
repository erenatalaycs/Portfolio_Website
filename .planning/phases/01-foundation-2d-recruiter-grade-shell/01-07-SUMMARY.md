---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 07
subsystem: opsec
tags: [opsec, checklist, contributing, release-gate, asvs-l1, v8-data-protection]

# Dependency graph
requires:
  - 01-02 (deploy.yml — referenced by [CI] tags in the checklist)
  - 01-06 (index.html SEO + JSON-LD — referenced by SEO + Meta section of checklist)
provides:
  - .planning/CHECKLIST-OPSEC.md — 39-item pre-publish checklist (9 sections, 2 [CI] items, 37 manual)
  - CONTRIBUTING.md — repo-root release-gate documentation referencing the checklist + deploy workflow + PITFALLS.md
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Verbatim-from-RESEARCH.md content authoring — checklist body is byte-for-byte the content from 01-RESEARCH.md § OPSEC Pipeline (lines 1457-1527)'
    - 'V8 ASVS L1 control framing — CONTRIBUTING.md cites the security framework explicitly so the release gate is not just a convention'
    - 'Single source of truth for the release gate — CHECKLIST-OPSEC.md path is referenced from CONTRIBUTING.md, README.md (Plan 02), and the [CI] items in deploy.yml'
    - 'Two-tier enforcement — [CI] items are automated by Plan 02 deploy.yml exiftool gate; manual items rely on author discipline'

key-files:
  created:
    - Portfolio_Website/.planning/CHECKLIST-OPSEC.md (4.4 KB, 39 items, 9 sections)
    - Portfolio_Website/CONTRIBUTING.md (1.1 KB, 5 sections)
  modified: []

key-decisions:
  - 'Checklist content is verbatim from 01-RESEARCH.md — no paraphrasing, no abbreviation, no reordering. RESEARCH.md is the single source of truth.'
  - 'CONTRIBUTING.md lives at repo root (NOT under .planning/) so it is discoverable by GitHub UI conventions — Settings → Insights → Community Standards lists it as a recognized file.'
  - 'V8 (Data Protection) ASVS L1 framing in CONTRIBUTING.md elevates the OPSEC checklist from "convention" to "security control" — ties skipping it to a known consequence (research/PITFALLS.md Pitfall 5).'
  - 'Task 3 (live audit) is DEFERRED-UNTIL-FIRST-DEPLOY — same as Plans 02-T3, 05-T3, 06-T3. All 4 deferred items roll up into a single pre-launch session Eren runs after pushing to GitHub.'

patterns-established:
  - 'Pattern: Release-gate checklist is a versioned artifact in .planning/ (not in CI scripts) so its history is reviewable.'
  - 'Pattern: Each release-gate item is either [CI]-automated (greppable in deploy.yml) or manual-author-owned (greppable in checklist) — no fuzzy boundary.'
  - 'Pattern: Phase-1 ships the gate; later phases (3, 4) extend it (write-up screenshots, Lighthouse audit, real-device QA).'

requirements-completed:
  - OPS-01 # Manual checklist half (Plan 02 already shipped the [CI] exiftool gate half)

# Metrics
duration: ~12min  # auto Tasks 1+2 only
completed: 2026-05-06
task_3_status: deferred-until-first-deploy
---

# Phase 1 Plan 07: OPSEC Checklist + CONTRIBUTING Summary

**STATUS: Tasks 1 + 2 complete and committed atomically. Task 3 (run the OPSEC checklist end-to-end against the live deploy) DEFERRED-UNTIL-FIRST-DEPLOY. The live deploy doesn't exist yet — Plan 02 deferred the GH Pages source toggle, Plan 05 deferred the real content fill, Plan 06 deferred the visual smoke test, and now Plan 07 defers the audit pass. All 4 items consolidate into a single pre-launch session Eren runs manually after pushing the repo to GitHub.**

`.planning/CHECKLIST-OPSEC.md` ships verbatim from RESEARCH.md § OPSEC Pipeline — 39 actionable items across 9 sections, 2 of which are tagged `[CI]` (automated by deploy.yml). `CONTRIBUTING.md` ships at the repo root referencing the checklist as the V8 (Data Protection) ASVS L1 control for the project.

## Performance

- **Started:** 2026-05-06T16:30:00Z
- **Completed:** 2026-05-06T16:51:00Z (~12 min wall-clock; 2 mid-run agent restarts due to API/rate limits)
- **Auto tasks:** 2 / 2 complete
- **Checkpoint:** 1 / 1 DEFERRED-UNTIL-FIRST-DEPLOY
- **Files created:** 2 (CHECKLIST-OPSEC.md, CONTRIBUTING.md)
- **Files modified:** 0 (CONTRIBUTING.md is brand-new at repo root)

## Commits

- `adbe0ab`: feat(01-07): author OPSEC pre-publish checklist (39 items, 9 sections) (Task 1)
- `8d241ba`: feat(01-07): author CONTRIBUTING.md release-gate documentation (Task 2)

## CI Gates (all green)

- `npx tsc --noEmit` → exit 0
- `npx eslint . --max-warnings=0` → exit 0
- `npx prettier --check .` → exit 0 (CONTRIBUTING.md formatter-clean)
- `npm test` → 14 passed (3 files)
- `npm run build` (separately verified — bundle unchanged from Plan 06)

## Acceptance Criteria — both auto tasks PASSED

**Task 1 (.planning/CHECKLIST-OPSEC.md):**
- ✓ File exists
- ✓ First H1 is `# OPSEC Pre-Publish Checklist`
- ✓ Exactly 9 H2 sections in documented order: Asset Metadata, Screenshot Review (full-resolution, manually), Source / Bundle, External Links, Personal Information, Email + Contact, SEO + Meta, Deploy Mechanics, Home-Lab / Architecture Diagrams (Phase 3+)
- ✓ Exactly 39 unchecked checkbox items (`grep -cE '^- \[ \]' .planning/CHECKLIST-OPSEC.md` returns 39)
- ✓ Exactly 2 `**[CI]**` markers (Asset Metadata items 1 + 2)
- ✓ Ends with `> Last updated: 2026-05-06 · checklist run before every release.`
- ✓ Prettier-clean

**Task 2 (CONTRIBUTING.md):**
- ✓ File at repo root (not under .planning/)
- ✓ Title `# Contributing to Portfolio_Website`
- ✓ `## Release Gate — OPSEC Checklist` heading present
- ✓ References `.planning/CHECKLIST-OPSEC.md` literally
- ✓ References `.github/workflows/deploy.yml` literally
- ✓ References `PITFALLS.md` literally
- ✓ References `README.md` for setup commands
- ✓ V8 ASVS L1 framing present
- ✓ All 8 npm commands documented in Local Workflow
- ✓ Prettier-clean

## Task 3 — DEFERRED-UNTIL-FIRST-DEPLOY (checkpoint:human-verify)

**Status:** DEFERRED-UNTIL-FIRST-DEPLOY.

**Re-opening trigger:** GitHub remote configured + first push to GitHub. At that point, ALL 4 deferred Phase 1 checkpoints converge into a single pre-launch session.

### Consolidated pre-launch session (4 deferred checkpoints + content fill)

When Eren is ready to push and deploy, this is the consolidated work:

**Phase A — Repo restructure + GitHub setup** (Plan 02 Task 3):
1. Convert `Portfolio_Website` to its own standalone GitHub repo (or push parent App/ repo with workflow path adjustments)
2. Rename branch `master` → `main` to match deploy.yml trigger (or update workflow)
3. Push to GitHub
4. Settings → Pages → Source → "GitHub Actions"

**Phase B — Real content fill** (Plan 05 Task 3):
Resolve all `TODO(checkpoint):` markers — verifiable: `grep -rF 'TODO(checkpoint):' src/content/`
1. `src/content/identity.ts` — real github URL, real LinkedIn slug
2. `src/content/identity.ts` — real `emailEncoded` via `npm run encode-email -- "your-real-email@example.com"`
3. `src/content/identity.ts` — real `homeLocationLabel` if more specific than "United Kingdom"
4. `src/content/certs.ts` — confirm cert list with real status + dates (CompTIA Security+ target date, etc.)
5. `src/content/skills.ts` — prune to skills Eren can demonstrate (CNT-03 provenance rule)
6. `src/content/education.ts` — fill institution + degree
7. `src/content/projects.ts` — refine project descriptions (Phase 3 expands to 3-5 with provenance)
8. `src/sections/About.tsx` — real bio paragraph (honest junior cyber voice; no clichés)

**Phase C — Real assets** (Plan 05 + 06 Task 3 partial):
1. Replace `public/assets/Eren-Atalay-CV.pdf` with real EXIF-stripped CV (run `exiftool -all= -P -overwrite_original public/assets/Eren-Atalay-CV.pdf` locally before commit; CI re-runs the gate on push)
2. Replace `public/assets/og-image.png` with a real screenshot of the deployed text shell (1200×630)

**Phase D — Visual smoke test** (Plan 06 Task 3):
1. `npm run dev` — confirm hero, sticky nav, all 7 sections, footer render correctly
2. Tab through page — skip-to-content, sticky nav, hero anchors, section headings all keyboard-reachable in order
3. Set OS to `prefers-reduced-motion: reduce` — confirm cursor static + scroll instant
4. Test `?focus=projects` — confirm scroll-to-projects works

**Phase E — Live OPSEC audit** (Plan 07 Task 3 — THIS plan):
Run all 39 items in `.planning/CHECKLIST-OPSEC.md` against the live deploy + CV PDF + dist/. Per-item PASS/FAIL/DEFERRED-TO-PHASE-X status. Document in `01-07-SUMMARY.md` audit table (append to this file).

**Phase F — ROADMAP success-criterion verification:**
1. `curl -sI https://eren-atalay.github.io/Portfolio_Website/ | grep '200 OK'`
2. View source — 4 hero anchors as plain `<a>` tags in first 200 lines
3. `https://eren-atalay.github.io/Portfolio_Website/?focus=projects` does NOT 404 + scrolls to #projects
4. `https://eren-atalay.github.io/Portfolio_Website/this-path-does-not-exist` renders the bash:cd 404
5. `prefers-reduced-motion: reduce` in OS → cursor static + `?focus=` instant scroll
6. CV PDF clean of EXIF (Plan 02 deploy.yml exiftool gate confirms on push)
7. `.planning/CHECKLIST-OPSEC.md` exists in commit history (Phase 1 success criterion 5 verified)

After Phase F all 5 success criteria pass: type "approved" + Phase 1 verification can proceed to Phase 2.

## Self-Check

- Task 1: PASSED (39-item checklist, 9 sections, 2 [CI] markers, all acceptance criteria green; commit `adbe0ab`)
- Task 2: PASSED (CONTRIBUTING.md at root, all 11 acceptance grep checks green, Prettier-clean; commit `8d241ba`)
- Task 3: DEFERRED-UNTIL-FIRST-DEPLOY (consolidated with 3 other deferred checkpoints into a single pre-launch session)

Plan 07 deliverables are complete pending the consolidated pre-launch audit pass.
