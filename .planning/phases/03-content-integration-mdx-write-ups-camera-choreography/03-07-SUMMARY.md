---
plan: 07
phase: 03-content-integration-mdx-write-ups-camera-choreography
status: partial
completed: 2026-05-08
---

# Plan 03-07 — Content Fill + Parity Audit + OPSEC Sweep — SUMMARY

## Status

**Mostly complete.** Tasks 1 + 2 + 3 shipped per plan. Two items deferred (clearly tracked below) — phase verification will surface them as gaps for follow-up.

## What was built

### Task 1 — D-20 content fill (5 atomic commits)

Phase 1's D-20 deferred TODOs all resolved with values pulled from Eren's real CV (`Desktop/Job Application/Eren_Atalay_Resume.pdf`):

- **`identity.ts`** — github `https://github.com/erenatalaycs` (Phase 1 placeholder was correct, only the TODO comment removed); linkedin `https://www.linkedin.com/in/eren-atalay/`; emailEncoded = rot13+base64 of real `eren.atalay.cs@gmail.com`; status `'Cybersec Engineer at PyramidLedger — open to UK SOC roles'`. All 4 `TODO(checkpoint)` markers removed.
- **`projects.ts`** — 4 real entries (was 2 stubs): wazuh-siem (shipped), ai-phishing-detection (in-progress), ai-network-threat-detection (shipped — final-year), portfolio-website (in-progress, links to GitHub). Every tagline carries the substring tokens for skills.ts provenance.
- **`skills.ts`** — pruned to 12 demonstrable tags: python, scikit-learn, pandas, wazuh, siem, linux, microsoft-365, azure-ad, cloudflare, react, tailwind, r3f. Each appears in some project tagline (case-insensitive, hyphen-normalised).
- **`certs.ts`** — 2 earned certs from CV: Google Cybersecurity Professional Certificate (May 2025), CompTIA A+ Cyber Specialization (Dec 2023). No in-progress entries — Sec+/CJCA/OSCP not yet started, kept honest.
- **`education.ts`** — BSc CS at City, University of London (2022–2025) + Foundation Cert at Kaplan International College (2021–2022).
- **`About.tsx`** — bio refreshed: junior framing kept (Eren's choice) but the "QA / test on a fintech platform" line removed (CV shows current role is Cybersecurity Engineer at PyramidLedger). New bio mentions Wazuh-based SIEM detections, cloud + identity telemetry investigation, and the ML final-year project (90%+ F1 on CICIDS2017).
- **CV PDF** — copied from `Desktop/Job Application/Eren_Atalay_Resume.pdf`; metadata stripped via `exiftool -all= -P -overwrite_original`. Verified clean: no Author / Title / Producer / Creator / CreatorTool / Software / GPS metadata. File size 133 KB, PDF 1.4, 2 pages.
- **`index.html`** — JSON-LD `sameAs[]` updated to use real LinkedIn slug (was `handle-pending`).

### Task 2 — `scripts/check-parity.mjs` + CI gate (1 atomic commit)

205 lines of Node ESM. Three assertions, all collected (one error doesn't short-circuit the others — easier to diagnose multi-source drift in one CI run):

1. **TXT-06 section parity** — every `id` extracted from `SECTIONS` const has either a `src/sections/<Title>.tsx` text-shell render OR is in `THREE_D_MOUNTS` (hand-maintained per RESEARCH Pattern 11). All 6 SECTIONS pass: about, skills, projects, certs, writeups, contact.
2. **CNT-03 skills provenance** — every `skills.ts` tag appears (case-insensitive, hyphen-normalised substring) in some `projects.ts` tagline OR write-up frontmatter `tags:` array. All 12 skills pass.
3. **Pitfall 8 ATT&CK lookup completeness** — every ATT&CK id in writeup frontmatter exists as a key in `attack-techniques.ts`. Vacuously passes (no writeups currently — Plan 03-06 deferred).

Wiring:
- `package.json` — added `parity: "node scripts/check-parity.mjs"`; chained into `build`: `npm run parity && tsc --noEmit && vite build`. Local `npm run build` now blocks on drift.
- `.github/workflows/deploy.yml` — new `Parity audit (TXT-06)` step inserted BEFORE `Build (Vite)`, same blocking semantics as TS / ESLint / Prettier / Vitest.

Negative test verified: synthetic skill drift (added `kubernetes` with no provenance) was caught with the expected CNT-03 error message; restored cleanly.

### Task 3 — `.planning/CHECKLIST-OPSEC.md` extension (1 atomic commit)

Two new sub-sections per D-19:

- **Write-up Screenshots (Phase 3)** — exiftool strip + manual full-resolution review of every PNG in `public/assets/writeups/<slug>/`; redactions use solid black box (NOT blur — Pitfall 5); ScreenshotFrame `[✓ sanitized]` badge confirmed in rendered view; CTI/JWT-specific redaction rules.
- **TXT-06 parity (Phase 3)** — `npm run parity` exits 0 (gates the build chain); manual checks for both shells; every skill has a recruiter-defensible "show me" answer.

Footer updated to 2026-05-08.

## Final gate suite (all green)

| Gate | Result | Detail |
|------|--------|--------|
| TypeScript (`tsc --noEmit`) | ✓ | exit 0 |
| ESLint (`--max-warnings=0`) | ✓ | clean |
| Prettier (`--check .`) | ✓ | clean |
| Vitest | ✓ | 7 files / 54 tests passed |
| `npm run parity` | ✓ | TXT-06 + CNT-03 + Pitfall 8 all green |
| `npm run build` | ✓ | parity → tsc → vite chain works |
| size-limit (text shell) | ✓ | 62.37 KB gz / 120 KB (52%) |
| size-limit (3D chunk) | ✓ | 268.66 KB gz / 450 KB (60%) |
| size-limit (GLB) | ✓ | 48 B / 2.5 MB (Phase 4 placeholder) |

## OPSEC dist/ scrub

| Check | Result |
|-------|--------|
| `TODO(checkpoint)` in dist | ✓ none |
| `handle-pending` in dist | ✓ none |
| Plaintext email (`eren.atalay.cs`) | ✓ none |
| Phone number (`07496861826`) | ✓ none |
| Encoded email present | ✓ in NotFound chunk |
| Real GitHub handle | ✓ in entry + 3D chunks |
| Real LinkedIn slug | ✓ in index.html JSON-LD |
| CV PDF metadata stripped | ✓ no Author/Title/Producer/CreatorTool/Software/GPS |

## Deferred (tracked as Phase 3 gaps)

1. **Plan 03-06 (3 MDX write-ups)** — Eren chose to skip rather than fabricate lab evidence. Deferred to a follow-up phase once labs are run (PortSwigger JWT lab, SigmaHQ-against-Sysmon, MalwareBazaar retired sample triage). The MDX rendering layer (Plan 03-05) is in place; dropping 3 valid `*.mdx` files into `src/content/writeups/` will pick them up automatically. See `feedback_no_fabricated_lab_evidence.md` memory for the rationale.
2. **OG image** — `public/assets/og-image.png` still the Phase 1 placeholder. Real OG image is generated from a screenshot of the deployed text shell at 1200×630 — pending live GH Pages deploy. Will be replaced + EXIF-stripped post-deploy.

## Key files

**Created:**
- `/Users/erenatalay/Desktop/App/Portfolio_Website/scripts/check-parity.mjs`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/.planning/phases/03-content-integration-mdx-write-ups-camera-choreography/03-07-SUMMARY.md`

**Modified:**
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/content/identity.ts`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/content/projects.ts`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/content/skills.ts`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/content/certs.ts`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/content/education.ts`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/src/sections/About.tsx`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/index.html`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/package.json`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/.github/workflows/deploy.yml`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/.planning/CHECKLIST-OPSEC.md`
- `/Users/erenatalay/Desktop/App/Portfolio_Website/public/assets/Eren-Atalay-CV.pdf` (replaced + EXIF-stripped)

## Self-Check: PARTIAL

Tasks 1 + 2 + 3 of Plan 03-07 are complete and gated. Plan 03-06 (write-ups) and the OG image asset are deliberately deferred per user decision and post-deploy timing respectively. Phase 3 verification will flag both as gaps for follow-up — appropriate since both can be closed cleanly in a small follow-up phase.
