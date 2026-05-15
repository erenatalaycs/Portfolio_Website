# Project Research Summary

**Project:** Eren Atalay — Portfolio Website
**Milestone:** v1.1 Room Build-Out + Pre-Launch Close
**Domain:** 3D portfolio site / cyber-analyst hacker-room scene
**Researched:** 2026-05-15
**Confidence:** HIGH (technical execution) / MEDIUM (cat silhouette recognition + bed framing)

## Executive Summary

v1.1 is an **additive** milestone on a healthy shipped v1.0 codebase. The task: wrap the existing desk-island into a full hacker's room (walls, ceiling, window, server rack, whiteboard, bed corner, cat, warmth touches, optional secondary devices) AND close two v1.0-inherited tracks (human pre-launch sign-off + MDX CTF write-ups). Critical finding: **no new runtime dependencies are needed for categories A–G** — every required pattern (canvas-texture hooks, emissive-plus-Bloom for LED glow, procedural geometry composition, OrbitControls clamping) is already proven in the shipped v1.0 codebase.

Architecture is strictly additive: 13–18 new flat `src/scene/PascalCase.tsx` files plus a `src/scene/textures/` subfolder, all imported by `Workstation.tsx`. Only two structural changes: tighten `Controls.tsx` `maxDistance` 4.0 → 2.6 (no wall-collision raycast — distance clamp is the right shape), and add at most 2 new `<pointLight>` instances in `Lighting.tsx` (keeping the cap at 6 dynamic lights with 1 shadow-caster). No new zustand slice; no new camera poses; HS-redesign's overview-pose consolidation stays.

Highest-risk dimension is **honest content authoring**, not technical execution. Whiteboard fabrication, cat-vs-real-cat implication, bed-vs-couch room-context implication, and window-backdrop OPSEC are all addressed by user decisions captured below; remaining risks (lab progress for write-ups, calendar date for sign-off) get forced into `/gsd-discuss-phase` before the relevant phases plan.

## User Decisions (captured 2026-05-15)

These are pre-committed at milestone start, ahead of the questions the research recommended for `/gsd-discuss-phase`:

| # | Question | Decision | Impact |
|---|---|---|---|
| 1 | Cat real or invented? | **Invented — decorative prop, no real-cat claim** | Phase 8 cat ships as scene element only; never personalized in content |
| 2 | Bed or couch? | **Bed** (single, accepts bedroom/studio-flat implication) | Phase 6 ships bed + nightstand + bedside lamp |
| 3 | Lab progress for write-ups? | **Plan labs together in v1.1**; write-ups + lab planning paired | Phase 10 includes lab-planning sub-task before write-up authoring |
| 4 | GLB workstation revisit? | **Path C — pass on v1.1, formally promote to v1.2 V2-3D-01** | Procedural Workstation stays canonical; `public/assets/workstation/` GLB files left as v2 seed (decide v1.2 whether to delete or reuse) |
| 5 | OPS-04 Android device? | **Android Studio Emulator (Pixel 6, 4 GB, throttled) + documented limit; physical → v1.2** | Phase 9 sign-off accepts emulator as Android coverage with caveat row in CHECKLIST-LAUNCH |
| 6 | Window backdrop technique? | **Procedural canvas-texture night-city (OPSEC-clean, no real photos)** | Phase 5 ships procedural blinds + behind-blinds CanvasTexture |

## Stack Findings (STACK.md)

**No new runtime deps for v1.1 categories A–G.** Existing pins remain valid (R3F 9.6.1 / drei 10.7.7 / three 0.184 / Tailwind v4.2 / Vite 8).

**Optional devDependencies** (only if GLB path reactivates — currently deferred to v1.2 per decision #4):
- `gltfjsx@~6.5.3`
- `@gltf-transform/cli@~4.3.0`

**Hidden risk:** canvas-texture GPU memory; cap textures at 1024×1024.

**First `useFrame` consumer in the codebase:** the cat breathing animation (Phase 8). Three commitments must land together — `usePrefersReducedMotion` reused for animation gate, current `<Canvas frameloop>` prop verified before animation starts, animation pattern documented for future per-frame consumers (rack LEDs reuse it).

**size-limit budgets unchanged.** Estimated 3D chunk delta is +10–20 KB gz on a 450 KB ceiling (current usage 38.95 KB gz).

## Feature Priority Bands (FEATURES.md)

| Band | Items |
|---|---|
| **P1 (must ship)** | A1 walls, A2 ceiling, A3 window with blinds, A4 ceiling light; B1 server rack, B2 Pi cluster with LEDs, B3 cable bundle; C1 whiteboard with abbreviated MITRE ATT&CK tactic strip (NOT full matrix), C2 wall clock (static time, no real-time scroll), C3 framed cert; D1 book spines on bookshelf, D2 snake plant (not pothos, not cactus), D3 screen bias-light, D4 under-desk LED strip; E1 single bed, E2 nightstand, E3 bedside lamp; F1 procedural loaf-pose cat with breathing animation (reduced-motion gated); H1 04-08 sign-off close; I1 lab planning + write-up authoring |
| **P2 (differentiator if budget)** | G2 SDR/radio dongle on desk |
| **P3 (deferred to v1.2)** | GLB workstation revisit (V2-3D-01); G1 open laptop screen; G3 secondary monitor; A5 door |

## Architecture Findings (ARCHITECTURE.md)

**6-phase build order (Phases 5–10):**

| Phase | Category | Title | Type |
|---|---|---|---|
| 5 | A | Room Shell | autonomous |
| 6 | B + E | Cyber Detail + Bed Corner | autonomous |
| 7 | C + D | Wall Content + Warmth | autonomous |
| 8 | F + G(P2) | Cat + SDR | autonomous |
| 9 | H | Human Sign-off Close | **autonomous: false** (closes v1.0 OPS-03/04/05 + CTC-01 delivery) |
| 10 | I | Write-ups + Lab Planning | **autonomous: false** (closes v1.0 CNT-02/03) |

**Rationale:** structural before decorative. Phase 5 (shell) anchors every later phase's placement. Phase 6 anchors floor with large objects (rack + bed). Phase 7 dresses walls + adds warmth. Phase 8 is last visual because cat depends on bed (Phase 6) AND it's the only animated element (want everything else stable). Phases 9 + 10 are human-driven and don't gate the visual chain.

**Inherited-deferral tagging:** Phases 9 and 10 plan frontmatter includes `closes_v1.0: [OPS-03, OPS-04, OPS-05, CTC-01]` and `closes_v1.0: [CNT-02, CNT-03]` respectively — surfaces the v1.0 → v1.1 ownership chain for the eventual milestone audit.

**Modified files (only 4):**
- `src/scene/Workstation.tsx` (composition root — every new component imported here)
- `src/scene/Controls.tsx` (maxDistance 4.0 → 2.6)
- `src/scene/Lighting.tsx` (at most 2 new `<pointLight>` for ceiling + bedside)
- `src/scene/WallDecor.tsx` (optional refactor — extract canvas helper for `src/scene/textures/`)

**Leave alone:** FocusController, cameraPoses (single overview pose), tabStore, MonitorTabs, MonitorOverlay, all of `src/3d/*`, `src/sections/*`, `src/ui/*` (except possibly a new UI element if the cat gets a hover-tooltip — TBD Phase 8).

**Lighting cap:** 6 dynamic lights / 1 shadow-caster. All decorative glow (rack LEDs, neon strip, bias-light, under-desk LED, plant grow-light if added) via `emissive` + Bloom postprocessing, NOT additional `<pointLight>`.

**emissiveBudget.ts** — new file in Phase 5; all v1.1 emissive components reference it for consistent intensity ceilings. `toneMapped={false}` privilege is neon strip only.

**Test rule:** v1.0 convention preserved — visual components not unit-tested. Unit-test only pure logic (canvas drawing helpers, LED phase math, clamp-value contract for OrbitControls).

## Top Pitfalls to Address in Roadmap (PITFALLS.md)

1. **Whiteboard fabrication** — Phase 7 `/gsd-discuss-phase` forces public-source citation (MITRE ATT&CK URL, Lockheed kill chain URL); refuses plan execution if not answered.
2. **Window OPSEC leak** — already prevented by decision #6 (procedural-only, no real photos).
3. **Sign-off deferring indefinitely** — Phase 9 must have a calendar date BEFORE plan opens; milestone-close gate refuses transition if any `___` remains in CHECKLIST-LAUNCH.md.
4. **Visual-overload / "hacker mağarası" trap** — Phase 7 VERIFICATION includes a per-tab readability screenshot pass + a ≤ 4 hues palette cap.
5. **Cat reads as alien** — Phase 8 hard rule: 3-second silhouette test with fresh viewer in VERIFICATION; CC0 GLB fallback path pre-committed before Phase 8 opens. Loaf pose preferred (blob-with-ears is more forgiving procedurally than standing).

**Carried v1.0 anti-feature list still binds** (Matrix code rain, padlock/shield/glowing-binary motifs, hooded-hacker silhouettes, fake "hacking in progress" GIFs, fake terminal accepting input it can't handle, fake security dashboards with random data, type-out animation on every paragraph, pure-black + saturated-green text, auto-playing music, "hire me" pop-ups, custom cursors hiding system cursor, home address / phone / DOB on the public site, backend / SSR, auth, real-time/multiplayer 3D, plagiarised CTF write-ups).

**New v1.1-specific bans:** fake employer logos on the framed cert, animated typing fingers on the keyboard, hooded-cat avatar (defeats the warmth purpose), daylight window (cyber-room convention is night), fake cert names on the book spines, animated cat tail wag, fake `tcpdump` scroll on the laptop screen (if G1 ever lands in v1.2).

## Open Questions Remaining (forwarded to `/gsd-discuss-phase`)

- **Phase 7:** Which ATT&CK column gets the "highlighted" annotation on the whiteboard? Should reflect Eren's actual learning focus (Persistence / Initial Access / Defense Evasion / Credential Access).
- **Phase 8:** Cat placement — on the bed (E1, requires bed-corner overview frame visibility), on the window ledge (requires A2 ledge depth), or on top of the tower PC (already exists, simplest)?
- **Phase 9:** Specific calendar date for the sign-off session — required input to lock the phase.
- **Phase 10:** Lab order — which of the 3 candidate labs starts first (PortSwigger JWT lab / SigmaHQ vs Sysmon / MalwareBazaar retired-sample triage)?

## Confidence per Decision

- HIGH for stack additions (4 research files cross-verified versions)
- HIGH for architecture (additive-only, no new state, lighting cap is conservative)
- HIGH for build order (structural → decorative is well-established in v1.0 itself)
- MEDIUM for cat silhouette recognition at distance (mitigated by pre-committed GLB fallback)
- MEDIUM for bed-in-overview-frame composition (will iterate during Phase 6 plan)

## Sources

- `.planning/research/STACK.md` (versions verified against npm registry 2026-05-15)
- `.planning/research/FEATURES.md` (MITRE ATT&CK Matrix, Oracle/HPE/Intel server LED docs, cat respiratory rate)
- `.planning/research/ARCHITECTURE.md` (Three.js forum: point-light limits, mrdoob/three.js#8463, Discover three.js Tips & Tricks)
- `.planning/research/PITFALLS.md` (memory/feedback_no_fabricated_lab_evidence.md binding rule + v1.0 REQUIREMENTS.md Out-of-Scope inheritance)
