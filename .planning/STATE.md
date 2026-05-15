---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Room Build-Out + Pre-Launch Close
status: in_progress
last_updated: "2026-05-15T12:30:00.000Z"
last_activity: 2026-05-15
progress:
  total_phases: 6
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-15)

**Core value:** Make a cyber recruiter or hiring manager think *"this person actually gets this field"* within seconds — without forcing recruiters to wait for a 3D scene before they can find the CV and contact details.
**Current focus:** v1.1 Room Build-Out + Pre-Launch Close — Phase 5 (Room Shell) ready to plan. v1.0 shipped 2026-05-15 at `https://erenatalaycs.github.io/Portfolio_Website/` (tag `hs-redesign-v1`).

## Current Position

Phase: 5 (Room Shell) — ready to start
Plan: — (next: `/gsd-plan-phase 5`)
Status: Roadmap defined; awaiting plan-phase entry for Phase 5
Last activity: 2026-05-15 — Milestone v1.1 roadmap created (Phases 5–10, 28 v1.1 REQs mapped, 100% coverage)

## v1.1 Phase Map

| Phase | Title | REQs | Autonomous | Closes v1.0 |
|---|---|---|---|---|
| 5 | Room Shell | ROOM-01..04 | yes | — |
| 6 | Cyber Detail + Bed Corner | CYB-01..03 + BED-01..03 | yes | — |
| 7 | Wall Content + Warmth | WALL-01..03 + WARM-01..04 | yes | — |
| 8 | Cat + Secondary Devices | CAT-01..03 + DEV-01 | yes | — |
| 9 | Human Sign-off Close | CLOSE-01..05 | **false** | OPS-03, OPS-04, OPS-05, CTC-01 |
| 10 | Write-ups + Lab Planning | LAB-01..02 | **false** | CNT-02, CNT-03 |

**Coverage:** 28/28 v1.1 REQs mapped, 0 orphans.

## v1.0-Inherited Human Tasks (carried into v1.1 Phases 9 + 10)

| # | Task | Closing Phase | Closes v1.0 REQ | Blocker |
|---|------|---------------|-----------------|---------|
| 1 | OG image swap: 1200×630 deployed-text-shell hero screenshot, OPSEC reviewed, ImageOptim'd | Phase 9 (CLOSE-01) | — (supports CLOSE-02..05) | Site must be deployed first; full-resolution OPSEC review (no notification banners, no localhost URLs, no employer info) |
| 2 | Lighthouse manual median-of-3 (deployed text shell). Targets: Perf ≥80, A11y ≥90, BP ≥90, SEO ≥90 | Phase 9 (CLOSE-02) | OPS-03 | Site must be deployed; warmup curl + 5s sleep before runs |
| 3 | Web3Forms delivery end-to-end test: real submission → Gmail inbox (not spam) AND Outlook inbox (not spam); verify reply-to header | Phase 9 (CLOSE-03) | CTC-01 (delivery half) | Web3Forms dashboard key + notification email + domain restriction must be configured |
| 4 | Real-device QA (7-step protocol): iPhone 16 Pro Max (physical) + Android Studio Emulator Pixel 6 profile (emulated, documented limit) | Phase 9 (CLOSE-04) | OPS-04 | Eren needs physical iPhone access; emulator profile installed in Android Studio |
| 5 | Peer reviews: named cyber-professional + named non-cyber usability reviewer with verdicts in CHECKLIST-LAUNCH | Phase 9 (CLOSE-05) | OPS-05 | Two real humans willing to spend 15 min each |
| 6 | Lab #1 selection + calendar date for kickoff (PortSwigger JWT / SigmaHQ vs Sysmon / MalwareBazaar triage) | Phase 10 (LAB-01) | — | Eren commits one lab + a calendar date |
| 7 | 2–3 MDX CTF/lab write-ups with real provenance under `src/content/writeups/` | Phase 10 (LAB-02) | CNT-02, CNT-03 | Real lab must be run first (no-fabricated-evidence rule binds); else defer to v1.2 |

## Phase 4 Human Decisions Captured (2026-05-09, still in force for v1.1)

| # | Decision | Value |
|---|----------|-------|
| D-17 revised 2026-05-12 | Canonical GH-Pages host | `erenatalaycs.github.io` |
| 3a | TryHackMe handle | `volvoxkill` — https://tryhackme.com/p/volvoxkill |
| 3b | HackTheBox handle | `volvoxkill` (user 1704641) — https://app.hackthebox.com/users/1704641 |
| 4a | Web3Forms access key | `f2193ff4-b5d3-4bc5-83a1-012498c5a7b7` (lives in `.env.local` as `VITE_WEB3FORMS_KEY`; public-safe — domain-locked + rate-limited) |
| 4b | Web3Forms notification email | eren.atalay.cs@gmail.com (cyber-specific, NOT pyramidledger) |
| 4c | Web3Forms domain | `erenatalaycs.github.io` |

## v1.1 User Decisions Captured (2026-05-15, at milestone start)

| # | Question | Decision | Phase Impact |
|---|---|---|---|
| 1 | Cat real or invented? | **Invented — decorative prop, no real-cat claim** | Phase 8 cat ships as scene element only; never personalized in content |
| 2 | Bed or couch? | **Bed** (single, accepts bedroom/studio-flat implication) | Phase 6 ships bed + nightstand + bedside lamp |
| 3 | Lab progress for write-ups? | **Plan labs together in v1.1**; write-ups + lab planning paired | Phase 10 includes lab-planning sub-task before write-up authoring |
| 4 | GLB workstation revisit? | **Defer to v1.2 V2-3D-01** (procedural stays canonical) | Out of v1.1 scope; `public/assets/workstation/` GLB files retained as v2 seed |
| 5 | OPS-04 Android device? | **Android Studio Emulator (Pixel 6, 4 GB, throttled) + documented limit; physical → v1.2** | Phase 9 accepts emulator with caveat row in CHECKLIST-LAUNCH |
| 6 | Window backdrop technique? | **Procedural canvas-texture night-city (OPSEC-clean, no real photos)** | Phase 5 ships procedural blinds + behind-blinds CanvasTexture |

## Performance Metrics

**Velocity:**

- Total plans completed (v1.0): 27
- Total plans completed (v1.1): 0
- Total execution time (v1.1): 0.0 hours

**By Phase:**

| Phase | Milestone | Plans | Total | Avg/Plan |
|-------|-----------|-------|-------|----------|
| 1. Foundation + 2D Shell | v1.0 | 7 | — | — |
| 2. 3D Shell + Asset Pipeline | v1.0 | 5 | — | — |
| 3. Content + Camera | v1.0 | 7 | — | — |
| 4. Real Asset + QA | v1.0 | 8 | — | — |
| 5. Room Shell | v1.1 | 0 | — | — |
| 6. Cyber Detail + Bed Corner | v1.1 | 0 | — | — |
| 7. Wall Content + Warmth | v1.1 | 0 | — | — |
| 8. Cat + Secondary Devices | v1.1 | 0 | — | — |
| 9. Human Sign-off Close | v1.1 | 0 | — | — |
| 10. Write-ups + Lab Planning | v1.1 | 0 | — | — |

**Recent Trend:**

- Last 5 plans: HS-redesign 8-task pass (v1.0 late visual pivot), Plan 04-06 (CC0 GLB workstation), Plan 04-04 (SEO host reconciliation), Plan 04-03 (LiveProfiles), Plan 04-02 (Web3Forms)
- Trend: v1.0 closed clean; v1.1 begins on a healthy shipped codebase

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- v1.1 (2026-05-15): Phases 5–10 derived from research/SUMMARY.md (6-phase build order: structural → decorative → animated → human close). Coverage 28/28 v1.1 REQs, 0 orphans.
- v1.1 (2026-05-15): No new runtime deps for v1.1 categories A–G (verified against existing scene patterns in `Lamp`/`DeskDecor`/`WallDecor`/`Chair`/`Workstation`/`Lighting`).
- v1.1 (2026-05-15): Phase 5 introduces `src/scene/emissiveBudget.ts` as the single source of emissive-intensity ceilings; every later v1.1 phase reads from it.
- v1.1 (2026-05-15): OrbitControls `maxDistance` tightens 4.0 → 2.6 in Phase 5 (room half-diagonal ≈ 3.4 m; 2.6 keeps camera comfortably inside).
- v1.1 (2026-05-15): Dynamic-light cap = 6 with exactly 1 shadow-caster (the existing directional). At most 2 new `<pointLight>` instances in v1.1 (ceiling fixture in Phase 5, bedside lamp in Phase 6); all decorative glow (Pi LEDs, bias-light, under-desk LED, neon strip) via emissive + Bloom only.
- v1.1 (2026-05-15): Phase 6 introduces the codebase's first `useFrame` consumer (Pi-cluster LED blinks); pattern is documented for Phase 8 cat to reuse. Verify `<Canvas frameloop>` prop before per-frame consumer lands.
- v1.1 (2026-05-15): Phase 8 cat pre-commits a CC0 GLB fallback before plan execution (acquired as Plan B); if procedural fails the 3-second silhouette test in VERIFICATION, swap immediately rather than iterate.
- v1.1 (2026-05-15): Phase 9 blocked from opening until calendar date for the sign-off session is committed (forced at `/gsd-discuss-phase`).
- v1.1 (2026-05-15): Phase 10 forcing question at discuss-phase: "Has any of (PortSwigger JWT / SigmaHQ vs Sysmon / MalwareBazaar triage) been started?" If no, phase plans labs only and write-ups defer to v1.2.
- v1.1 (2026-05-15): Phase 7 whiteboard requires public-source citation (attack.mitre.org) recorded in component file header; no fabricated CVEs/IPs/incident text.
- v1.1 (2026-05-15): Phase 7 visual-overload guardrail = ≤ 4 distinct emissive hues + per-tab readability screenshot pass in VERIFICATION.

### Pending Todos

[From .planning/todos/pending/ — ideas captured during sessions]

None yet for v1.1.

### Blockers/Concerns

[Issues that affect future work]

- Phase 9: Calendar date for the sign-off session must be committed before plan opens.
- Phase 10: Lab #1 selection + kickoff date must be committed at discuss-phase; if no lab has been started, write-ups defer to v1.2 explicitly.
- Phase 8 (medium): Procedural cat silhouette recognition at default overview distance — mitigated by pre-committed CC0 GLB fallback.
- Phase 6 (medium): Bed-in-overview-frame composition — will iterate during Phase 6 plan; bed must not occlude desk-monitor sightline from default pose.

## Deferred Items

Items carried forward from v1.0 close (2026-05-15) into v1.1:

| Category | Item | Status | Phase | Deferred At |
|----------|------|--------|-------|-------------|
| plan | Plan 03-06 — author 2-3 MDX CTF/lab write-ups (CNT-02/CNT-03) | autonomous:false, in v1.1 Phase 10 | 10 | 2026-05-08 |
| plan | Plan 04-08 — pre-launch human sign-off (OG image, Lighthouse, Web3Forms delivery, real-device QA, peer reviews) | autonomous:false, in v1.1 Phase 9 | 9 | 2026-05-09 |
| requirement | OPS-03 (Lighthouse median-of-3) | closes via v1.1 Phase 9 (CLOSE-02) | 9 | 2026-05-15 |
| requirement | OPS-04 (real-device QA) | closes via v1.1 Phase 9 (CLOSE-04) | 9 | 2026-05-15 |
| requirement | OPS-05 (peer reviews) | closes via v1.1 Phase 9 (CLOSE-05) | 9 | 2026-05-15 |
| requirement | CTC-01 delivery half (Gmail+Outlook test) | closes via v1.1 Phase 9 (CLOSE-03) | 9 | 2026-05-09 |
| requirement | CNT-02 + CNT-03 (write-ups) | closes via v1.1 Phase 10 (LAB-02) | 10 | 2026-05-08 |
| requirement | 3D-08 (GLB workstation half) | promoted to v1.2 V2-3D-01 (out of v1.1 scope per user decision #4) | — | 2026-05-15 |

## Session Continuity

Last session: 2026-05-15T12:30:00.000Z
Stopped at: v1.1 roadmap created. Phases 5–10 defined with 28/28 REQ coverage. Phase 5 (Room Shell) ready to enter `/gsd-plan-phase 5`. Phases 9 + 10 are autonomous:false with closes_v1.0 tags; Phase 9 blocked on calendar date commit; Phase 10 blocked on lab-progress forcing question.
Outstanding deferred: All v1.0 deferrals re-homed to v1.1 Phase 9 + Phase 10 (see Deferred Items table above).
Resume file: (none — HANDOFF.json + .continue-here.md cleared)

## Operator Next Steps

- `/gsd-plan-phase 5` — open Phase 5 (Room Shell) for planning. No human decisions required to start; user decision #6 (procedural window backdrop) is already locked.
- Before opening Phase 9: commit a calendar date for the sign-off session.
- Before opening Phase 10: answer the forcing question — "Has any of (PortSwigger JWT / SigmaHQ vs Sysmon / MalwareBazaar triage) actually been started?"
