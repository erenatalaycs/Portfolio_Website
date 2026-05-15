# Roadmap: Eren Atalay — Portfolio Website

**Core value:** Make a cyber recruiter or hiring manager think *"this person actually gets this field"* within seconds — without ever forcing recruiters to wait for a 3D scene before they can find the CV and contact details.

## Milestones

- ✅ **v1.0 MVP** — Phases 1–4 (shipped 2026-05-15) — [archive](milestones/v1.0-ROADMAP.md)
- 🚧 **v1.1 Room Build-Out + Pre-Launch Close** — Phases 5–10 (active, defined 2026-05-15)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1–4) — SHIPPED 2026-05-15 — live at <code>erenatalaycs.github.io/Portfolio_Website/</code></summary>

- [x] Phase 1: Foundation + 2D Recruiter-Grade Shell (7/7 plans) — completed 2026-05-06 — verification: `human_needed` (4 deferred-to-first-deploy checkpoints accepted)
- [x] Phase 2: 3D Shell + Asset Pipeline + Capability Gating (5/5 plans) — completed 2026-05-06 — verification: `passed`
- [x] Phase 3: Content Integration + MDX Write-ups + Camera Choreography (6/7 plans) — completed 2026-05-08 — verification: `passed` with overrides (Plan 03-06 write-ups deferred to v1.1)
- [x] Phase 4: Real Asset + Postprocessing + Polish + Pre-Launch QA (7/8 plans) — code complete 2026-05-14 — Plan 04-08 human sign-off carried into v1.1 Phase 9

See `.planning/milestones/v1.0-ROADMAP.md` for full phase detail, `.planning/milestones/v1.0-REQUIREMENTS.md` for the requirement set, `.planning/milestones/v1.0-MILESTONE-AUDIT.md` for the close-out audit.

</details>

### 🚧 v1.1 — Room Build-Out + Pre-Launch Close (active)

v1.1 wraps the shipped desk-island in a believable hacker room (walls, ceiling, window, server rack, whiteboard, bed, cat, secondary devices) AND closes the v1.0-inherited human pre-launch sign-off + write-up tracks so v1.1 lands as one clean publish-ready release. Build order is structural → decorative → animated → human-driven close.

- [ ] **Phase 5: Room Shell** — Walls, ceiling, window-with-blinds, ceiling light wrap the desk-island; OrbitControls clamped to keep camera inside.
- [ ] **Phase 6: Cyber Detail + Bed Corner** — Server rack with Pi cluster blinks on one side; bed + nightstand + bedside lamp on the other. First `useFrame` consumer lands here.
- [ ] **Phase 7: Wall Content + Warmth** — Whiteboard (MITRE ATT&CK strip), analog clock, framed cert; bookshelf books, snake plant, bias-light, under-desk LED. Visual-overload guardrails enforced.
- [ ] **Phase 8: Cat + Secondary Devices** — Loaf-pose breathing cat with 3-second silhouette gate; SDR/radio dongle desk prop.
- [ ] **Phase 9: Human Sign-off Close (closes v1.0)** — `closes_v1.0: [OPS-03, OPS-04, OPS-05, CTC-01]`. Five-item CHECKLIST-LAUNCH.md track: OG image, Lighthouse median-of-3, Web3Forms delivery test, real-device QA, named peer reviews.
- [ ] **Phase 10: Write-ups + Lab Planning (closes v1.0)** — `closes_v1.0: [CNT-02, CNT-03]`. Plan + run at least one real lab; author 2–3 MDX CTF/lab write-ups with real provenance OR formally defer write-ups to v1.2.

## Phase Details

### Phase 5: Room Shell

**Goal**: Wrap the existing desk-island in a believable hacker room — three walls, ceiling, a procedural night-city window with blinds, and one new ceiling light — so every later v1.1 phase has a placement target.
**Depends on**: v1.0 (Phases 1–4 shipped)
**Requirements**: ROOM-01, ROOM-02, ROOM-03, ROOM-04
**Why this phase**: Defines the world bounds. Whiteboard, framed cert, bias-light, and bed all place against walls that must exist first. Tightening `Controls.tsx` `maxDistance` 4.0 → 2.6 and introducing `src/scene/emissiveBudget.ts` as the single source of emissive-intensity ceilings are both one-shot structural moves best done at the start, before later phases add emitters.

**Success Criteria** (what must be TRUE):
  1. User on a capable desktop sees the existing desk-island enclosed by 3 walls + a ceiling at the default `?view=3d&focus=overview` camera pose — the scene no longer reads as "floating in void".
  2. User dragging the camera with OrbitControls cannot push the camera through any wall or out of the room (verified by the new `maxDistance: 2.6` clamp; existing overview + focused poses still frame correctly).
  3. User sees a window with horizontal blinds on the back wall, behind which a procedural canvas-texture night-city pattern is visible — confirmed OPSEC-clean (no real photo, no identifiable skyline, asserted in component file header comment).
  4. A single new `<pointLight>` for the ceiling fixture is wired in `Lighting.tsx` keeping total dynamic lights ≤ 6 with exactly 1 shadow-caster (the existing directional).
  5. `src/scene/emissiveBudget.ts` exists, exports named intensity ceilings (NEON_STRIP, MONITOR_SCREEN, BIAS_LIGHT, LED_STRIP, RACK_LED, LAMP_BULB, BEDSIDE_LAMP, CEILING_FIXTURE), and every emissive surface added in this phase reads from it.

**Plans**: TBD

### Phase 6: Cyber Detail + Bed Corner

**Goal**: Anchor the floor of the new room with the two largest v1.1 props — a procedural server rack with Pi cluster + cable bundle on one side, and a single bed + nightstand + bedside lamp on the other — and introduce the codebase's first `useFrame` consumer (Pi LED blinks) following the reduced-motion gate pattern that future per-frame animations will reuse.
**Depends on**: Phase 5 (walls + floor + lighting baseline must exist before large floor anchors can be placed)
**Requirements**: CYB-01, CYB-02, CYB-03, BED-01, BED-02, BED-03
**Why this phase**: Big floor objects are anchor placements — they dictate where decor in later phases will fit. Rack on the cyber-detail side, bed on the opposite side, balances composition. Pairing them in one phase also concentrates the single `useFrame`-pattern decision (Pi LED blinks) into one review cycle. One new `<pointLight>` (warm bedside lamp) joins the ceiling fixture from Phase 5, keeping total at ≤ 6 dynamic lights.

**Success Criteria** (what must be TRUE):
  1. User at default overview pose sees a small (≤ 6U) procedural server rack on the floor with a 1U switch geometry and 3–4 Raspberry Pi boards stacked inside it, with at least one emissive activity LED per Pi visibly lit.
  2. User with `prefers-reduced-motion: not-set` sees Pi-cluster activity LEDs blinking at vendor-grade rates (1 Hz activity / 2 Hz link / 0.1s-on-2.9s-off heartbeat with desynced phase offsets); user with `prefers-reduced-motion: reduce` (or low perf tier) sees all the same LEDs solid-emissive — no blinking.
  3. User sees a cable bundle (3–5 cylinder/tube geometries with subtle bend) routed from the rear of the rack to a power/network anchor point — static, no animation.
  4. User sees a single bed (mattress + base + pillow + lightly rumpled duvet) in a corner that does NOT occlude the desk-monitor sightline from the default overview camera pose; a nightstand sits beside it.
  5. User sees a bedside lamp on the nightstand emitting a warm, dim glow (one new `<pointLight>`, intensity ≤ 0.5, color in the warm-amber family, total dynamic-light count still ≤ 6).
  6. The single `useFrame` consumer driving the Pi-cluster blinks is documented in a code comment as "the v1.1 per-frame animation pattern" for the cat (Phase 8) and any future per-frame consumer to reuse.

**Plans**: TBD

### Phase 7: Wall Content + Warmth

**Goal**: Dress the wall surfaces (whiteboard with an abbreviated 7-tactic MITRE ATT&CK strip, static analog wall clock, framed TryHackMe/HackTheBox cert) and add the lived-in warmth touches (real-titled cyber-classic book spines on the bookshelf, snake plant in terracotta pot, screen bias-light, under-desk LED strip).
**Depends on**: Phase 5 (back wall + ceiling exist), Phase 6 (rack + bed placement defines the remaining empty wall regions)
**Requirements**: WALL-01, WALL-02, WALL-03, WARM-01, WARM-02, WARM-03, WARM-04
**Why this phase**: Surface decoration follows structural anchoring. The whiteboard requires a public-source citation (attack.mitre.org) recorded in the component file header — no fabrication of CVEs/IPs/incident text. Bias-light + under-desk LED strip ship as emissive + Bloom only (NO new `<pointLight>` instances; total dynamic lights stay at 6). Visual-overload risk is highest here, so VERIFICATION requires a per-tab readability screenshot pass and ≤ 4 distinct hues in the palette.

**Success Criteria** (what must be TRUE):
  1. User sees a whiteboard on a wall displaying an abbreviated MITRE ATT&CK tactic strip (7-tactic column header row + one highlighted column with a hand-drawn marker-style annotation) — every label traces back to attack.mitre.org, documented as a source citation in the component file header comment.
  2. User sees an analog wall clock frozen at a "lived-in" placeholder time (e.g. 23:47) — hands at fixed rotations, no `useFrame` consumer, no real-time updating.
  3. User sees a framed certificate or poster on a wall — either a TryHackMe / HackTheBox badge replica using `volvoxkill` handle or a public-domain cyber-themed poster — NO fake employer logos, NO fabricated cert names.
  4. User looking at the bookshelf sees 8–12 real-titled cyber-classic book spines (e.g. "The Cuckoo's Egg", "The Web Application Hacker's Handbook", "Practical Malware Analysis") rendered via `<instancedMesh>` — every spine title is a real published book; none are fabricated.
  5. User sees a snake plant in a terracotta pot (5–7 leaf geometries on a cylinder pot) placed on the desk, bookshelf top, or floor near the bookshelf.
  6. User sees a screen bias-light behind the monitor (emissive plane, cool tint, Bloom-amplified) AND an under-desk LED strip (thin emissive strip, low intensity, color from `emissiveBudget.ts`); both implemented with emissive + Bloom only, NO new `<pointLight>` instances added in this phase.
  7. At every one of the 5 monitor-tab focus poses, the monitor content (`whoami`, projects, write-ups, certs, contact) remains fully legible — verified by per-tab readability screenshot captured in VERIFICATION; ≤ 4 distinct emissive hues visible across the scene.

**Plans**: TBD

### Phase 8: Cat + Secondary Devices

**Goal**: Ship the procedural loaf-pose cat (5–7 primitives, gentle sine-scale breathing at ~0.3 Hz ±2–3% amplitude, reduced-motion gated) as the personal "lived-in" touch, plus an SDR/radio dongle desk prop as the P2 cyber-domain differentiator. The cat is the last visual element because its placement depends on the bed (Phase 6) and it's the only animated organic shape — every other prop must be stable when its silhouette is judged.
**Depends on**: Phase 6 (cat placement target = bed; alt placement = tower PC which exists from v1.0)
**Requirements**: CAT-01, CAT-02, CAT-03, DEV-01
**Why this phase**: Cat is highest visual-recognition risk in v1.1 (procedural primitives compose to recognizable furniture more easily than to a recognizable cat). The phase pre-commits a fallback: if the procedural cat fails the 3-second silhouette test, swap to a pre-acquired CC0 GLB cat asset rather than iterate procedurally. SDR dongle is a low-cost niche-credibility prop that rides along in the same phase.

**Success Criteria** (what must be TRUE):
  1. User at default overview pose sees a procedural loaf-pose cat (body + head + 2 ears + tail + 2 small eye spheres = 5–7 primitives total) placed on the bed (Phase 6) — final placement (bed / window ledge / tower PC) decided at plan-phase based on best composition.
  2. **3-second silhouette test**: a fresh viewer who has not read the code identifies the prop as "a cat" within 3 seconds at the default overview camera distance. If the procedural cat fails this test in VERIFICATION, the phase swaps to the pre-committed CC0 GLB cat fallback (acquired as Plan B before phase execution) rather than iterating procedurally.
  3. User with `prefers-reduced-motion: not-set` sees the cat's body subtly breathing — sine-wave scale on body Y axis at ~0.3 Hz with ±2–3% amplitude only (no panting, no tail wag, no head turn); user with `prefers-reduced-motion: reduce` sees the cat at solid scale = 1.0 with zero animation.
  4. The cat's `useFrame` consumer reuses the per-frame animation pattern established in Phase 6 (Pi-cluster LEDs), confirming the documented pattern works for a second consumer.
  5. User sees a small SDR/radio dongle prop on the desk near the keyboard (cylinder body + thin antenna geometry) — static, no animation; reads as a niche cyber-credibility detail without dominating the desk layout.

**Plans**: TBD

### Phase 9: Human Sign-off Close

**Goal**: Close all five v1.1-inherited v1.0 deferrals (OG image swap, Lighthouse median-of-3, Web3Forms Gmail+Outlook delivery test, real-device QA on iPhone 16 Pro Max + Android Studio Emulator Pixel 6, two named peer reviews) by working the existing `.planning/CHECKLIST-LAUNCH.md` track to zero `___`-placeholders.
**Depends on**: Phase 8 (visible-scope work complete; sign-off captures the final v1.1 state, not an intermediate one)
**Requirements**: CLOSE-01, CLOSE-02, CLOSE-03, CLOSE-04, CLOSE-05
**closes_v1.0**: OPS-03 (Lighthouse), OPS-04 (real-device QA), OPS-05 (peer reviews), CTC-01 (Gmail+Outlook delivery half)
**Autonomous**: false — human-only execution; plan frontmatter MUST include `closes_v1.0: [OPS-03, OPS-04, OPS-05, CTC-01]` and `autonomous: false`. **Phase blocked from opening until calendar date is committed** (forced at `/gsd-discuss-phase`).
**Why this phase**: These five items cannot be agent-completed — they require the deployed site, Eren's real Gmail + Outlook inboxes, his physical iPhone 16 Pro Max, an Android Studio Emulator Pixel 6 profile run on his machine, and two named human reviewers (one cyber-professional, one non-cyber usability reviewer). Running them after the visible scope is locked means the QA round captures v1.1's final state, not an in-flight snapshot.

**Success Criteria** (what must be TRUE):
  1. User loading the deployed site sees a real 1200×630 OPSEC-reviewed OG image at `public/assets/og-image.png` (no notification banners, no localhost URLs, no employer info, ImageOptim'd to < 200 KB) — when shared on social, the preview is the intentional hero shot, not a placeholder.
  2. Lighthouse run on the deployed text-shell URL produces a median-of-3 with Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90; all 3 runs + the median documented in `.planning/CHECKLIST-LAUNCH.md` (closes v1.0 OPS-03).
  3. A real Web3Forms submission via the deployed contact form lands successfully in both Gmail inbox (not spam) AND Outlook inbox (not spam) with correct `reply-to` header — confirmed inbox screenshots referenced in CHECKLIST-LAUNCH (closes v1.0 CTC-01 delivery half).
  4. Real-device QA executed: iPhone 16 Pro Max (physical iOS device) + Android Studio Emulator running Pixel 6 profile (with the emulator-vs-physical caveat row documented in CHECKLIST-LAUNCH); the 7-step QA protocol from CHECKLIST-LAUNCH passes on each (closes v1.0 OPS-04).
  5. Two named peer-review verdicts recorded in CHECKLIST-LAUNCH — one cyber-professional verdict + one non-cyber usability verdict — with reviewer names and dated entries (closes v1.0 OPS-05).
  6. **Milestone-close gate**: `.planning/CHECKLIST-LAUNCH.md` contains zero `___` placeholders when this phase closes; `/gsd-transition` refuses the phase exit if any remain.

**Plans**: TBD

### Phase 10: Write-ups + Lab Planning

**Goal**: Plan + run at least one real cyber lab, then author 2–3 MDX CTF/lab write-ups with real provenance under `src/content/writeups/`. The existing MDX + Shiki pipeline (Plan 03-05) picks them up automatically. If no lab has been started by the time the phase opens, the phase enters "lab planning only" mode and the write-ups themselves defer explicitly to v1.2.
**Depends on**: Phase 9 (write-ups + lab planning don't gate visual phases; runs last to allow real lab time without blocking other v1.1 work)
**Requirements**: LAB-01, LAB-02
**closes_v1.0**: CNT-02 (skills paired to write-ups), CNT-03 (2–3 published write-ups)
**Autonomous**: false — gated on Eren actually running real labs; the "no fabricated lab evidence" rule binds. Plan frontmatter MUST include `closes_v1.0: [CNT-02, CNT-03]` and `autonomous: false`.
**Why this phase**: The binding rule from `feedback_no_fabricated_lab_evidence.md` (2026-05-08) forbids inventing write-up content. Plan-phase forcing question: "Has any of (PortSwigger JWT lab / SigmaHQ vs Sysmon detection lab / MalwareBazaar retired-sample triage) actually been started?" If no, the phase plans labs only (commits Lab #1 + a calendar kickoff date) and v1.2 picks up the actual authoring. This phase doesn't block v1.1's visual ship — if write-ups slip, v1.1 still publishes with the room build-out + Phase 9 sign-off.

**Success Criteria** (what must be TRUE):
  1. LAB-01 committed: one of (PortSwigger JWT lab / SigmaHQ vs Sysmon detection lab / MalwareBazaar retired-sample triage) is selected as Lab #1, with a calendar date for kickoff recorded in the plan SUMMARY. The plan-phase forcing question ("Has any been started?") has a documented answer.
  2. **Either** 2–3 MDX write-up files exist under `src/content/writeups/` with real provenance (platform name + date + sources/walkthroughs consulted in frontmatter), are picked up by the existing `import.meta.glob` pipeline, render correctly via Shiki syntax highlighting, and appear in the Write-ups tab on both text shell and 3D shell — **OR** an explicit decision row in the plan SUMMARY defers the write-up authoring to v1.2 with reason ("no real lab completed in v1.1 window").
  3. When write-ups ship: every fabrication-risk surface (CVE IDs, IPs, hashes, screenshots) is either from a real public source the lab ran against OR redacted/marked clearly as "study notes, no production data"; OPSEC pipeline (exiftool -all=) run on any embedded screenshots.
  4. v1.0 deferrals closed cleanly: CNT-02 (skills paired to write-ups) and CNT-03 (2–3 published write-ups) are either marked closed (if write-ups shipped) or formally re-deferred to v1.2 with explicit decision recorded in REQUIREMENTS.md.

**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|---|---|---|---|---|
| 1. Foundation + 2D Recruiter-Grade Shell | v1.0 | 7/7 | Complete | 2026-05-06 |
| 2. 3D Shell + Asset Pipeline + Capability Gating | v1.0 | 5/5 | Complete | 2026-05-06 |
| 3. Content Integration + MDX Write-ups + Camera Choreography | v1.0 | 6/7 | Complete (1 override-deferred) | 2026-05-08 |
| 4. Real Asset + Postprocessing + Polish + Pre-Launch QA | v1.0 | 7/8 | Complete (Plan 04-08 carried into v1.1 Phase 9) | 2026-05-14 |
| 5. Room Shell | v1.1 | 3/3 | Complete (ready for VERIFICATION) | 2026-05-15 |
| 6. Cyber Detail + Bed Corner | v1.1 | 0/? | Not started | — |
| 7. Wall Content + Warmth | v1.1 | 0/? | Not started | — |
| 8. Cat + Secondary Devices | v1.1 | 0/? | Not started | — |
| 9. Human Sign-off Close (closes v1.0) | v1.1 | 0/? | Blocked (calendar date not yet committed) | — |
| 10. Write-ups + Lab Planning (closes v1.0) | v1.1 | 0/? | Blocked (forcing question pending) | — |
