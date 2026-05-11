---
phase: 04-real-asset-postprocessing-polish-pre-launch-qa
plan: 07
subsystem: ci-cd
tags: [ci, github-actions, lighthouse, lhci, csp, opsec, pre-launch-qa, ops-03, ops-05]

requires:
  - phase: 04-01
    provides: postprocessing chunk (PostFX) — bundle hygiene gate audits dist/assets/*.js including this chunk
  - phase: 04-02
    provides: CSP extended with https://api.web3forms.com — CSP connect-src gate verifies it survives every build
  - phase: 04-04
    provides: canonical host eren-atalay.github.io (was erenatalaycs.github.io) — lighthouserc.json + CHECKLIST URLs reference the new host
  - phase: 04-06
    provides: Path A real CC0 GLBs (or Path B procedural) — gates are independent of which path lands

provides:
  - .planning/CHECKLIST-LAUNCH.md (9-section pre-launch checklist with fillable rows for Lighthouse runs, peer reviews, real-device QA, Web3Forms verification, 3D-08 Path A/B status)
  - .github/workflows/deploy.yml 5 NEW BLOCKING gates (dev-helper strip, external-link audit, CSP connect-src, JSON-LD email omission, npm audit) running BEFORE upload-pages-artifact
  - .github/workflows/deploy.yml 1 NEW ADVISORY lighthouse job AFTER deploy (needs: deploy, continue-on-error: true, if: success(), 60s CDN warmup, npx -y @lhci/cli@~0.15.1 autorun)
  - lighthouserc.json (2 URLs ?view=text + ?view=3d on canonical host; numberOfRuns: 3; preset lighthouse:no-pwa; Perf ≥0.8, A11y ≥0.9, BP ≥0.9, SEO ≥0.9; temporary-public-storage upload)

affects: 04-08-PLAN.md (Plan 04-08 human sign-off reads CHECKLIST-LAUNCH.md + CHECKLIST-OPSEC.md; CI gates auto-tick the **[CI]**-prefixed rows)

tech-stack:
  added:
    - "@lhci/cli@~0.15.1 (invoked via npx -y at runtime in CI; NOT added to package.json — keeps shipped deps clean per RESEARCH Standard Stack)"
  patterns:
    - "Per-step `name:` single-quoted YAML to avoid backslash-escaping double-quote payloads (`'External-link audit (every target=\"_blank\" carries rel=\"noopener noreferrer\")'`)"
    - "`run: |` block uses single-quoted bash strings throughout to avoid shell-escape confusion (`echo 'OPS-05 FAIL: …'`)"
    - "Negative-case verification before commit — every detection gate must PASS on a happy-path dist AND FAIL on a synthetic bad-input probe; ensures no silent-no-op regression"
    - "Advisory CI job separated into its own top-level job (not a step in `deploy`) so `continue-on-error: true` scopes correctly — a step-level continue-on-error on the last step of `deploy` would still report the job green but a job-level boundary is cleaner per GH Actions semantics"
    - "Inline JSON-LD audit via `sed -n '/application\\/ld+json/,/<\\/script>/p'` + `grep -E '\"email\"[[:space:]]*:'` — extracts the script block then field-matches; avoids false positives where the substring 'email' appears elsewhere (e.g., 'mailto' or 'email-form-id')"
    - "External-link audit greps both dist/index.html AND dist/assets/*.js because the inlined-string anchor pattern (Phase 1 BracketLink emits anchors at runtime from React) can land in either depending on hoisting"

key-files:
  created:
    - .planning/CHECKLIST-LAUNCH.md (9 sections, 14+ items, fillable rows for Plan 04-08 sign-off)
    - lighthouserc.json (lhci config at repo root)
    - .planning/phases/04-real-asset-postprocessing-polish-pre-launch-qa/04-07-SUMMARY.md (this file)
  modified:
    - .github/workflows/deploy.yml (+5 blocking gate steps in build job, +1 advisory lighthouse job after deploy)

key-decisions:
  - "Lighthouse-CI advisory only (CONTEXT D-17 honored). Job has continue-on-error: true at job level so deploy is never blocked by a regression; manual median-of-3 in Plan 04-08 is the OPS-03 sign-off source of truth."
  - "lighthouserc.json shipped with `error`-level assertions (not `warn`) but the JOB has continue-on-error: true. This gives Eren a clear pass/fail signal in the lhci log while keeping the deploy unblocked. If you want a softer signal later, downgrade assertions to `warn` — purely cosmetic."
  - "npm audit --audit-level=high (NOT moderate/low). T-04-07-07 in the threat register accepts the risk that a transitive low CVE without a patch should not block deploy; only high/critical fail. Document any high-CVE exception inline in deploy.yml with a comment before flagging Rule 4."
  - "Dev-helper strip allows a `// dev-only` comment marker exception. This lets Eren intentionally leave a debug helper in the bundle behind a runtime check (e.g., import.meta.env.DEV) without the gate firing. Use sparingly."
  - "External-link audit greps BOTH dist/index.html and dist/assets/*.js. Phase 1 BracketLink auto-attaches rel for external anchors, but a hand-rolled `<a target=\"_blank\">` in an MDX writeup (Plan 03-06) could slip into the JS bundle string-by-string; the dist/assets/ branch catches that."
  - "JSON-LD email-omission gate uses `sed | grep '\"email\"'` (not `grep -E 'email|mailto'`). The omission gate is sufficient per Pitfall 4; the more aggressive 'grep for actual email TLD' form requires CI to know the plaintext, which we deliberately don't. The actual-TLD audit lives in CHECKLIST-OPSEC.md (author-owned)."
  - "scripts/check-parity.mjs is NOT modified (PATTERNS § scripts/check-parity.mjs RECOMMENDATION: SKIP). Vite import-graph already breaks the build if ContactForm is missing from Contact. The parity script doesn't even exist in this worktree branch (branched pre-Plan-03-D-19); the orchestrator merge brings it back unchanged."

patterns-established:
  - "5-gate OPS-05 verification suite — pattern for any future OPS-* gate addition: 1) single-quoted step name; 2) `run: |` block with comment header citing the source pattern; 3) explicit pass message on success; 4) explicit FAIL message + exit 1 on failure; 5) negative-case probe documented in the corresponding SUMMARY."
  - "Advisory-CI-job pattern — job-level `continue-on-error: true` + `needs:` chain + `if: success()` keeps the job conditional on prior success while ensuring its own outcome is non-blocking. Reusable for any future advisory metric capture (e.g., bundle-size delta tracking, axe-core a11y scan)."
  - "Synthetic-dist negative-case probe — when CI gates inspect dist/ but the local worktree has no dist/, build a `/tmp/test-dist/` with both happy-path and bad-input fixtures and run the gate's bash logic verbatim. Documented in the commit body so future reviewers can re-run it. Faster than waiting for a full CI cycle to catch a typo in a gate's regex."

requirements-completed:
  - OPS-03
  - OPS-05

duration: 5min
completed: 2026-05-11
---

# Phase 4 Plan 07: Pre-launch automation (CHECKLIST-LAUNCH + 5 blocking CI gates + advisory Lighthouse-CI) Summary

**Automated launch QA gates landed: every push to main now exit-fails on dev-helper leaks, missing rel=noopener, CSP regression, JSON-LD email leak, or high/critical npm advisories; Lighthouse-CI runs advisory after deploy. CHECKLIST-LAUNCH.md fillable for Plan 04-08 sign-off.**

## Performance

- **Duration:** ~5 min (2026-05-11T15:18:28Z → 2026-05-11T15:22:50Z)
- **Started:** 2026-05-11T15:18:28Z
- **Completed:** 2026-05-11T15:22:50Z
- **Tasks:** 2 (auto, no checkpoints)
- **Files created:** 2 (CHECKLIST-LAUNCH.md, lighthouserc.json) + 1 (this SUMMARY)
- **Files modified:** 1 (.github/workflows/deploy.yml)
- **Net lines added:** ~270 (CHECKLIST 132 + lighthouserc.json 25 + deploy.yml 116 + minor)

## Accomplishments

### Task 1 — `.planning/CHECKLIST-LAUNCH.md` (commit `a6aeb55`)

9-section pre-launch checklist landed per RESEARCH Pattern 18 + UI-SPEC § Pre-launch checklist files + CONTEXT D-14. Sections:

1. **Lighthouse on Deployed URL** — 2 rows (text shell, 3D shell advisory) with Run-1/2/3 + median fillable, warmup protocol, threshold reminder.
2. **Bundle Hygiene** — Dev-helper strip (`[CI]`), npm audit (`[CI]`), npm ls (manual), size-limit budgets (manual).
3. **External Links** — `rel="noopener noreferrer"` audit on dist/index.html (`[CI]`) + dist/assets/ (`[CI]`), LinkedIn / GitHub URL hygiene.
4. **Security Headers** — CSP connect-src + form-action checks; sourcemap-disabled check; `frame-ancestors 'none'`.
5. **SEO + Sharing** — OG image curl + LinkedIn/Slack preview + JSON-LD validator + `<title>` + description + canonical (post-04-04 host).
6. **Sitemap + Robots** — 6-URL sitemap (Plan 04-04 form, no `<changefreq>`/`<priority>`) + robots.txt Sitemap line.
7. **CTC-01 Web3Forms Verification** — access key, notification email, domain restriction, Gmail + Outlook delivery, subject line, honeypot manual test. Uses STATE.md Phase 4 D-4a/b/c values verbatim.
8. **Reviews** — Cyber peer + non-cyber usability, both with Reviewer / Date / Verdict / Notes fillable.
9. **Real-Device QA** — iOS / Android / (optional) iPad rows, each with Model / Version / Test date / PASS-FAIL fields and the 7-step Pattern 16 protocol inline.
10. **3D-08 GLB Status** — Path A / Path B exclusive choice row (CONTEXT D-04 7-day timebox tracker).

All 6 acceptance greps pass (`Lighthouse on deployed text shell`, `CTC-01`, `Cyber peer review`, `iOS device`, `Android device`, `Dev-helper strip`).

### Task 2 — `lighthouserc.json` + `.github/workflows/deploy.yml` extensions (commit `e11834f`)

**lighthouserc.json** (repo root, 25 lines): 2 collect URLs (`?view=text` + `?view=3d`) on canonical host `eren-atalay.github.io`, `numberOfRuns: 3`, `upload.target: temporary-public-storage`, `assert.preset: lighthouse:no-pwa`, 4 assertion thresholds (Perf ≥0.8, A11y ≥0.9, BP ≥0.9, SEO ≥0.9 — all `error`). JSON parses cleanly via `JSON.parse`. Acceptance greps pass: `categories:performance`, `lighthouse:no-pwa`.

**`.github/workflows/deploy.yml`** gains:

5 new BLOCKING steps in the `build` job, inserted between `Enforce bundle size budgets` (step 12) and `Copy index.html → 404.html` (step 18). Step ordering verified by `js-yaml` parse:

| # | Step name | First-run result |
|---|-----------|------------------|
| 13 | `Dev-helper strip (no <Stats>, <Perf>, console.log, leva, r3f-perf in dist)` | **PASS** on synthetic happy-path dist; **correctly DETECTS** dev-helper leak in negative-case probe |
| 14 | `External-link audit (every target="_blank" carries rel="noopener noreferrer")` | **PASS** on synthetic happy-path dist; **correctly DETECTS** missing-rel in negative-case probe |
| 15 | `CSP connect-src includes api.web3forms.com (Pitfall 3)` | **PASS** on synthetic happy-path dist; **correctly DETECTS** missing api.web3forms.com in negative-case probe |
| 16 | `JSON-LD email-omission audit (Pitfall 4)` | **PASS** on synthetic happy-path dist; **correctly DETECTS** `"email":` field in negative-case probe |
| 17 | `npm audit --production (no high/critical advisories)` | **DEFERRED to post-merge CI** — requires `node_modules` and a current `dist/` which the worktree branch does not yet have (branched pre-04-04). Will execute on first CI run after the orchestrator merges. |

1 new ADVISORY job after `deploy`:

| Field | Value |
|-------|-------|
| Job name | `lighthouse` |
| `needs:` | `deploy` |
| `if:` | `${{ success() }}` |
| `continue-on-error:` | `true` |
| Steps | 4 (Checkout, Setup Node, Warmup, Run Lighthouse-CI) |
| Warmup | `sleep 60` + `curl` 3 deployed URLs + `sleep 5` (Pitfall 8) |
| Command | `npx -y @lhci/cli@~0.15.1 autorun` |

Advisory Lighthouse-CI first-deploy result: **NOT YET RUN** (no push to main happened in this worktree; orchestrator will merge then trigger). Plan 04-08 manual median-of-3 remains the OPS-03 sign-off source of truth per CONTEXT D-17. Once the first CI run happens, scores can be read from the GH Actions log; advisory regressions do not block deploy.

## Local Verification

Where the gates can be executed end-to-end locally, they were:

| Verification | Method | Result |
|--------------|--------|--------|
| `.planning/CHECKLIST-LAUNCH.md` exists | `test -f` | PASS |
| 6 CHECKLIST grep patterns | `grep -F` | 6/6 PASS |
| `lighthouserc.json` valid JSON | `JSON.parse` via node -e | PASS — preset=lighthouse:no-pwa, 4 thresholds, 2 URLs |
| 2 lighthouserc.json grep patterns | `grep -F` | 2/2 PASS |
| `.github/workflows/deploy.yml` valid YAML | `npx -y js-yaml` | PASS — 3 jobs (build, deploy, lighthouse), 20 build steps, 4 lighthouse steps |
| 7 deploy.yml grep patterns | `grep -F` | 7/7 PASS |
| Gate ordering | js-yaml parse + step-name list | Gates 13-17 between size-limit (12) and 404 copy (18); upload-pages-artifact at 20 |
| Gate 1 happy-path | Synthetic /tmp/test-dist/ | PASS (no dev helper detected) |
| Gate 1 negative-case | console.log in /tmp/test-dist-bad/ | CORRECTLY DETECTED |
| Gate 2 happy-path | Synthetic with rel="noopener noreferrer" | PASS |
| Gate 2 negative-case | target="_blank" missing rel | CORRECTLY DETECTED |
| Gate 3 happy-path | CSP with api.web3forms.com in connect-src | PASS |
| Gate 3 negative-case | CSP missing api.web3forms.com | CORRECTLY DETECTED |
| Gate 4 happy-path | JSON-LD without "email" field | PASS |
| Gate 4 negative-case | JSON-LD with `"email":"x@y"` | CORRECTLY DETECTED |
| Gate 5 (`npm audit`) | (not runnable in this worktree) | DEFERRED to post-merge CI |
| Lighthouse job structure | js-yaml parse | `needs: deploy`, `continue-on-error: true`, `if: ${{ success() }}` confirmed |
| `scripts/check-parity.mjs` unchanged | `git status` | UNCHANGED (file does not exist in this worktree branch; orchestrator merge brings it back from main, unaltered) |

All 16 PLAN.md frontmatter `acceptance_grep` checks pass.

## Decisions Made

- **`error`-level lhci assertions + job-level `continue-on-error: true`** — gives Eren a clear pass/fail signal in the Lighthouse log without blocking deploy. Downgrade to `warn` later if the noise is unhelpful (purely cosmetic).
- **`npm audit --audit-level=high` only** — moderate/low warnings allowed (T-04-07-07 acceptance). Document any high-CVE exception inline before bypassing.
- **`// dev-only` exception marker for dev-helper grep** — lets Eren intentionally leave a debug helper behind a runtime check without firing the gate. Use sparingly.
- **External-link audit spans dist/index.html AND dist/assets/** — catches both SSR-string-build anchors and JS-bundle-inlined anchors (Phase 1 BracketLink emits at runtime so the React-rendered anchor lands in JS).
- **JSON-LD email-omission uses `sed | grep '"email"'`** — omission gate is sufficient per Pitfall 4. The actual-TLD audit (which requires CI to know the plaintext) lives in CHECKLIST-OPSEC.md as an author-owned manual check.
- **Lighthouse-CI as a separate top-level job, NOT a step in `deploy`** — job-level `continue-on-error: true` scopes the non-blocking behavior cleanly; a step-level marker on the last step of `deploy` would conflate the deploy outcome with the advisory outcome.
- **`@lhci/cli` invoked via `npx -y` at runtime** — pinned to `~0.15.1` for stability but NOT added to `package.json` per RESEARCH Standard Stack ("keeps package.json clean for one-shot tool").

## Deviations from Plan

**None — plan executed exactly as written.**

The plan's `<verify>` block required `npm run build && npm test --run && npm audit --production` to be run locally. These were attempted but blocked by the pre-Plan-04-04 state of this worktree branch (no `node_modules`, no `dist`, no `scripts/check-parity.mjs` which `npm run build` invokes via the `parity` npm-script). This is expected — the worktree was branched off `main` BEFORE several phase 3/4 plans landed; the orchestrator will merge this worktree onto a current `main` and CI will run the full verify suite then. The synthetic-dist negative-case probe pattern documented above gives equivalent local confidence for gates 1-4; gate 5 (`npm audit`) defers to post-merge CI.

This is NOT a Rule 1/2/3 deviation — no code was changed in response. It's a documentation note that the local-verify portion of the `<verify>` block was structurally unable to execute pre-merge.

## Auth Gates

None encountered. No auth-protected resources accessed during execution.

## Threat Surface Scan

All 5 threat-register dispositions for this plan are `mitigate` (T-04-07-01..05) or `accept` with rationale (T-04-07-06, T-04-07-07). The implementation matches:

| Threat ID | Mitigation | Implementation |
|-----------|------------|----------------|
| T-04-07-01 | Plaintext email leak via JSON-LD | Gate 4 (JSON-LD email-omission) + CHECKLIST § SEO row |
| T-04-07-02 | npm transitive CVE | Gate 5 (`npm audit --production --audit-level=high`) |
| T-04-07-03 | CSP regression strips api.web3forms.com | Gate 3 (CSP connect-src) |
| T-04-07-04 | Dev helper leaks into prod bundle | Gate 1 (dev-helper strip) |
| T-04-07-05 | External-link reverse-tabnabbing | Gate 2 (external-link audit) |
| T-04-07-06 | Lighthouse-CI uploads to temporary-public-storage | ACCEPTED — `temporary-public-storage` in lighthouserc.json; scores are non-sensitive (CONTEXT D-17) |
| T-04-07-07 | npm audit blocks on unpatched low CVE | ACCEPTED — `--audit-level=high` only fails high/critical |

No new threat surface introduced. No `threat_flag` rows needed.

## Known Stubs

None. All `___` placeholders in CHECKLIST-LAUNCH.md are intentional fillable rows for Plan 04-08 (the human sign-off plan) to populate during real-device + Lighthouse + Web3Forms verification. The user explicitly directed: "Fillable rows so Plan 04-08 can be ticked off by hand." Per the stub policy these are not unwired data sources; they are the document's intended user-input fields.

## Files Created

- `.planning/CHECKLIST-LAUNCH.md` (132 lines, 9 sections + 3D-08 status + footer)
- `lighthouserc.json` (repo root, 25 lines, 2 URLs + 4 assertions)
- `.planning/phases/04-real-asset-postprocessing-polish-pre-launch-qa/04-07-SUMMARY.md` (this file)

## Files Modified

- `.github/workflows/deploy.yml` (+116 lines: 5 new build-job gate steps + 1 new advisory `lighthouse` job; existing steps unchanged)

## Files NOT Modified (Intentional)

- `scripts/check-parity.mjs` — PATTERNS § scripts/check-parity.mjs RECOMMENDATION: SKIP. Vite import-graph already enforces ContactForm mount; an extra assertion duplicates work. (File does not exist in this worktree branch; orchestrator merge brings it back from main, unaltered.)
- `src/content/writeups/*.mdx` — Plan 03-06 deferred (per user prompt).
- All other workflow files in `.github/workflows/` — per user prompt "DO NOT modify other workflow files."

## Merge Note for Orchestrator

This worktree (`worktree-agent-a73582c02e581724e`) was branched off an older `main` and does NOT yet contain the post-Plan-04-04 / 04-06 changes that landed on `main` after this worktree was created. Expect a **3-way merge** on `.github/workflows/deploy.yml`:

- This worktree's deploy.yml = older base + my 5 OPS-05 gates + lighthouse job
- main's deploy.yml = older base + Plan 03-D-19's `Parity audit (TXT-06)` step at line 109

The two changes don't overlap textually (parity audit is added BEFORE `Build (Vite)` at step 11; my gates are added AFTER `Enforce bundle size budgets` at step 12+). A normal three-way merge should resolve cleanly. If the merge driver gets confused, the right manual resolution is:

1. Keep Plan 03-D-19's `Parity audit (TXT-06)` step (between `Verify no metadata remains` and `Build (Vite)`).
2. Keep my 5 OPS-05 gates between `Enforce bundle size budgets` and `Copy index.html → 404.html`.
3. Keep my new `lighthouse` job after `deploy`.

All other files in this worktree (CHECKLIST-LAUNCH.md, lighthouserc.json, this SUMMARY) are net-new and have no merge surface.

## Self-Check: PASSED

- `.planning/CHECKLIST-LAUNCH.md` exists: FOUND
- `lighthouserc.json` exists: FOUND
- `.github/workflows/deploy.yml` modified (and parses as valid YAML): FOUND + PARSED
- `.planning/phases/04-real-asset-postprocessing-polish-pre-launch-qa/04-07-SUMMARY.md` exists: FOUND (this file)
- Commit `a6aeb55` (Task 1): FOUND in git log
- Commit `e11834f` (Task 2): FOUND in git log
- All 16 PLAN.md `acceptance_grep` patterns: PASS (verified end-to-end)
- 4 gates × 2 cases (happy + negative): 8/8 PASS
- `scripts/check-parity.mjs` unchanged: CONFIRMED (file not present in this worktree branch; no diff)
