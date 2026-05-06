---
phase: 01-foundation-2d-recruiter-grade-shell
plan: 05
subsystem: ui
tags: [content-layer, sections, hero, textshell, cv-pdf, sticky-nav-consumer]

# Dependency graph
requires:
  - 01-01 (toolchain — Tailwind v4 tokens + JetBrains Mono + Vite scripts)
  - 01-03 (SECTIONS const + obfuscate.ts + BASE helper + useReducedMotion + useQueryParams)
  - 01-04 (BracketLink, TerminalPrompt, SkipToContent, EmailReveal, StickyNav, NotFound, App.tsx finalized)
provides:
  - src/content/{identity,projects,certs,skills,education,index}.ts — typed `as const` content layer with honest placeholder values + TODO(checkpoint) markers
  - src/ui/SkillTag.tsx — non-interactive `[name]` tag
  - src/ui/CertRow.tsx — `[✓]` earned / `[ ]` in-progress|planned with target date in muted text
  - src/ui/ProjectRow.tsx — `[ ]` warn prefix for in-progress, em-dash separator, optional repo BracketLink
  - src/sections/{Hero,About,Education,Skills,Projects,Certs,Writeups,Contact}.tsx — 8 section components rendering verbatim UI-SPEC heading copy
  - src/shells/TextShell.tsx — REAL composition (replaces Plan 04 stub) with all 8 sections + footer
  - public/assets/Eren-Atalay-CV.pdf — placeholder PDF (1-page, "PLACEHOLDER — Real CV pending"); replaced by Eren before Plan 07 OPSEC sign-off
affects: [plan-06-seo, plan-07-opsec]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - 'Single-source-of-truth content layer — every section reads from src/content/*.ts via the barrel; no inline content in components'
    - 'Honest-placeholder convention — TODO(checkpoint): markers in every file Eren must touch before Plan 07'
    - 'Section heading uses TerminalPrompt verbatim from UI-SPEC § Copywriting'
    - 'Hero CV link uses ${BASE}assets/${identity.cvFilename} pattern (single helper, no hardcoded paths)'
    - 'EmailReveal consumed in BOTH Hero and Contact sections — same encoded value, same UX'
    - 'Footer uses repo URL from identity.github — drift-free across releases'

key-files:
  created:
    - Portfolio_Website/src/content/{identity,projects,certs,skills,education,index}.ts (Task 1)
    - Portfolio_Website/src/ui/{SkillTag,CertRow,ProjectRow}.tsx (Task 2)
    - Portfolio_Website/src/sections/{Hero,About,Education,Skills,Projects,Certs,Writeups,Contact}.tsx (Task 2)
    - Portfolio_Website/public/assets/Eren-Atalay-CV.pdf (Task 2 — placeholder)
  modified:
    - Portfolio_Website/src/shells/TextShell.tsx (Task 2 — replaced Plan 04 stub with full composition)

key-decisions:
  - 'Honest placeholder strategy — every TODO(checkpoint) marker is a value Eren replaces. The SCHEMA is final; only the DATA is provisional. Plan 07 OPSEC checklist verifies real values before launch.'
  - 'CV PDF is a 1-page placeholder explicitly labeled as such; clearly NOT a real CV so a recruiter cannot mistake it. Plan 07 enforces real EXIF-stripped CV before deploy.'
  - 'Skills are honest defaults from cyber-junior context (python/bash/wireshark/nmap/splunk/linux/git/tcp-ip/mitre-attack); marked TODO so Eren prunes per CNT-03 provenance rule (every tag must be demonstrable in a project/writeup).'
  - 'Footer renders repo URL from identity.github — no hardcoded URL, single source of truth.'
  - 'Education entry uses "BSc Cybersecurity (or related)" + "TODO: institution name" + "Graduated Summer 2025" — honest fill-in-the-blank placeholder; refined by Eren.'

patterns-established:
  - 'Pattern: Each section component takes no props — reads from `src/content/*` via the barrel. Pure data → markup, no logic.'
  - 'Pattern: TerminalPrompt + heading copy is the only "branding" decoration; section bodies are quiet, semantic, readable.'
  - 'Pattern: TODO(checkpoint) markers are the contract between Phase 1 ship + Plan 07 audit — every marker resolves before launch.'

requirements-completed:
  - CNT-01 # typed content layer + barrel
  - CNT-04 # CV PDF in repo (placeholder; real version per Plan 07 OPSEC)
  - TXT-01 # TextShell real composition with 7 sections + Hero + Footer
  - TXT-02 # Hero block with name + role + UK + 4 contact anchors as plain HTML
  - TXT-03 # All 7 sections (About, Education, Skills, Projects, Certs, Writeups, Contact) present
  - CTC-02 # GitHub + LinkedIn link-outs reachable in Hero + Contact

# Metrics
duration: ~25min  # auto Tasks 1+2 only
completed: 2026-05-06
task_3_status: deferred-to-plan-07
---

# Phase 1 Plan 05: Content Layer + 8 Sections + TextShell Summary

**STATUS: Tasks 1 + 2 complete and committed atomically. Task 3 (Eren fills real content + drops real CV PDF) DEFERRED-TO-PLAN-07 because real-content authoring belongs in the same pre-launch session as the OPSEC checklist run. The schema and rendering are final; only the data is provisional.**

`src/content/*.ts` ships the typed schema for identity, projects, certs, skills, education with honest placeholders + explicit `TODO(checkpoint):` markers. Every section component renders verbatim UI-SPEC heading copy. TextShell composes Hero + 7 sections + footer at `<main className="mx-auto max-w-[72ch] px-4 md:px-6 py-12">` (per UI-SPEC § Layout). public/assets/Eren-Atalay-CV.pdf is a clearly-labeled 1-page placeholder.

## Performance

- **Started:** 2026-05-06T12:53:00Z
- **Completed (auto tasks):** 2026-05-06T15:58:00Z (~25min wall-clock; long execution due to mid-run context reset)
- **Auto tasks:** 2 / 2 complete
- **Checkpoint:** 1 / 1 DEFERRED-TO-PLAN-07
- **Files created:** 17 (6 content + 3 ui + 8 sections + 1 CV)
- **Files modified:** 1 (src/shells/TextShell.tsx)

## Commits

- `a3a99fe`: feat(01-05): author typed content layer (Task 1 — 6 files)
- `9956302`: feat(01-05): author row primitives, 8 sections, real TextShell, placeholder CV (Task 2 — 13 files)

## CI Gates (all green after Tasks 1+2)

- `npx tsc --noEmit` → exit 0
- `npx eslint . --max-warnings=0` → exit 0
- `npx prettier --check .` → exit 0
- `npm test` → 14 passed (3 files), 0 failed
- `npm run build` → exit 0; bundle 206 KB raw / 63 KB gzip (well under TXT-01's 120 KB ceiling); CV PDF copied to `dist/assets/`

## Task 3 — DEFERRED-TO-PLAN-07 (checkpoint:human-verify)

**Status:** DEFERRED-TO-PLAN-07.
**Re-opening trigger:** Eren ready to author real content + provide real EXIF-stripped CV. Plan 07's pre-launch OPSEC checklist runs all `TODO(checkpoint):` resolutions as a single audit pass before live deploy.

**Outstanding `TODO(checkpoint):` items** (verifiable: `grep -rF 'TODO(checkpoint):' src/content/`):

1. `src/content/identity.ts` — replace github URL placeholder with real profile
2. `src/content/identity.ts` — replace `handle-pending` LinkedIn slug with real
3. `src/content/identity.ts` — replace emailEncoded with output of `npm run encode-email -- "your-real-email@example.com"`
4. `src/content/certs.ts` — confirm/replace cert list with real status + dates
5. `src/content/skills.ts` — prune skills to those Eren can demonstrate (CNT-03 provenance rule)
6. `src/content/education.ts` — fill institution name + degree
7. `public/assets/Eren-Atalay-CV.pdf` — replace 1-page placeholder with real EXIF-stripped CV

**Why deferred:** real-content authoring is a single coherent session that's most efficient to do alongside the Plan 07 OPSEC checklist run (each TODO is also a checklist item). Splitting into two sessions would mean two passes through the same files. Plan 07 sequences this naturally: fill content → run OPSEC checks → deploy.

## Self-Check

- Task 1: PASSED (typed content layer + barrel + 7 TODO markers; commit `a3a99fe`)
- Task 2: PASSED (3 row primitives + 8 sections + real TextShell + placeholder CV; commit `9956302`)
- Task 3: DEFERRED-TO-PLAN-07 (real content + real CV — same session as OPSEC checklist)

Plan 05 deliverables are complete pending Plan 07's content-fill + OPSEC audit pass.
