# Requirements: Eren Atalay — Portfolio Website (v1.1)

**Defined:** 2026-05-15
**Milestone:** v1.1 Room Build-Out + Pre-Launch Close
**Core Value:** Make a cyber recruiter or hiring manager think *"this person actually gets this field"* within seconds — without ever forcing recruiters to wait for a 3D scene before they can find the CV and contact details.

v1.0 requirements (FND/CNT/TXT/3D/CTC/OPS) shipped 2026-05-15 — see `.planning/milestones/v1.0-REQUIREMENTS.md`. Five v1.0 REQs land in v1.1 via inherited close-out phases (Phase 9 + Phase 10):

| v1.0 REQ | Closed by v1.1 phase | Reason carried forward |
|---|---|---|
| **CNT-02** | Phase 10 (Write-ups + Lab Planning) | Plan 03-06 deliberately skipped to avoid fabricating lab evidence; v1.1 plans labs + authors 2–3 write-ups with real provenance |
| **CNT-03** | Phase 10 (Write-ups + Lab Planning) | Tied to CNT-02 (provenance pairing) |
| **OPS-03** | Phase 9 (Human Sign-off Close) | Lighthouse median-of-3 manual run requires deployed site + human-driven Chrome incognito session |
| **OPS-04** | Phase 9 (Human Sign-off Close) | Real-device QA — iPhone 16 Pro Max + Android Studio Emulator (Pixel 6) per 2026-05-15 decision |
| **OPS-05** | Phase 9 (Human Sign-off Close) | Pre-launch checklist execution pass |
| **CTC-01** (delivery half) | Phase 9 (Human Sign-off Close) | Code wired in Plan 04-02; real Gmail + Outlook delivery test gated on Phase 9 |
| **3D-08** (GLB half) | **Promoted to v1.2 V2-3D-01** | Plan 04-06 reverted (commit `342d2e7`); GLB workstation revisit takes Blender-modeling commit, deferred per 2026-05-15 user decision |

## v1.1 Requirements

### Room Shell (Phase 5)

- [ ] **ROOM-01**: Left, right, and back wall planes enclose the desk-island; OrbitControls `maxDistance` clamped from 4.0 → 2.6 so camera cannot exit the room.
- [ ] **ROOM-02**: Ceiling plane rendered above the desk at a height that does not clip Bookshelf or Lamp; a single new `<pointLight>` for ceiling illumination (counts against 6-dynamic-light cap).
- [ ] **ROOM-03**: Window with blinds slats on the back wall, behind which a procedural canvas-texture night-city pattern renders (NO real photos, NO real skyline — OPSEC-clean). Blinds fixed-open posture, not animated.
- [ ] **ROOM-04**: `src/scene/emissiveBudget.ts` introduced as the single source for emissive-intensity ceilings; every new emissive component in v1.1 reads from it.

### Cyber Detail (Phase 6 first half)

- [ ] **CYB-01**: Mini server rack frame on the floor near the desk — single 1U switch geometry slotted in. Procedural primitives only.
- [ ] **CYB-02**: Raspberry Pi cluster (3–4 small board geometries) inside the rack, each with one emissive activity LED. LEDs blink at vendor-grade rates (1 Hz activity / 2 Hz link / 0.1s on / 2.9s off heartbeat — desynced phase offsets, single `useFrame` consumer). All blinks respect `prefers-reduced-motion` (solid when set) and disable on low-perf tier.
- [ ] **CYB-03**: Cable bundle (3–5 cylinder geometries with subtle bezier-ish bend) routed from rack back to power/network anchor point. Static (no animation).

### Bed Corner (Phase 6 second half)

- [ ] **BED-01**: Single bed placed in a corner not occluding the desk-monitor sightline; unmade-style sheet/duvet geometry, no headboard reading light.
- [ ] **BED-02**: Nightstand next to the bed (procedural box + drawer line cut).
- [ ] **BED-03**: Bedside lamp on the nightstand — one new `<pointLight>` with warm color, dim intensity (counts against 6-dynamic-light cap).

### Wall Content (Phase 7 first half)

- [ ] **WALL-01**: Whiteboard on one wall displaying an abbreviated MITRE ATT&CK tactic strip (7-tactic column header row + one highlighted column with hand-drawn marker-style annotation). NOT the full 14-tactic enterprise matrix. Source citation MITRE ATT&CK official (`attack.mitre.org`) recorded in component file header.
- [ ] **WALL-02**: Analog wall clock — frozen at a "lived-in" placeholder time (e.g. 23:47); real-time updating clock explicitly out of scope to avoid every-second re-render.
- [ ] **WALL-03**: Framed certificate or poster on the wall — a TryHackMe / HackTheBox badge replica or a public-domain cyber-themed poster. NO fake employer logos, NO fabricated cert names.

### Warmth Touches (Phase 7 second half)

- [ ] **WARM-01**: Bookshelf populated with real-titled book spines (instancedMesh, 8–12 books with real cyber-classic titles like "The Cuckoo's Egg", "The Web Application Hacker's Handbook", "Practical Malware Analysis", etc. — no fabricated titles).
- [ ] **WARM-02**: Small snake-plant in terracotta pot (5–7 leaf geometries + cylinder pot) placed on the desk or floor near the bookshelf.
- [ ] **WARM-03**: Screen bias-light behind the monitor — emissive plane with subtle cool tint; emissive + Bloom only, no new `<pointLight>`.
- [ ] **WARM-04**: Under-desk LED strip — thin emissive strip with low intensity; emissive + Bloom only, no new `<pointLight>`. Color from `emissiveBudget.ts` palette.

### Cat (Phase 8 first half)

- [ ] **CAT-01**: Procedural loaf-pose decorative cat — body sphere + head sphere + 2 cone ears + tail cylinder + 2 small spheres for eyes (5–7 primitives total). Placed on the bed (BED-01) or on the tower PC (which already exists in `DeskDecor`).
- [ ] **CAT-02**: Subtle breathing animation — sine-wave scale on body Y axis at ~0.3 Hz, amplitude ±2–3% only (NOT panting). Single `useFrame` consumer documented as the pattern for future per-frame animators. Gated by `prefers-reduced-motion: reduce` → solid scale = 1.0.
- [ ] **CAT-03**: 3-second silhouette verification — a fresh viewer must recognize the prop as "cat" within 3 seconds at the default overview camera distance. If procedural fails, the pre-committed fallback is to swap to a CC0 GLB cat asset (acquired in Phase 8 plan as Plan B before execution).

### Secondary Devices (Phase 8 second half)

- [ ] **DEV-01**: SDR/radio dongle prop on the desk — small static cylinder + antenna geometry near keyboard. P2 differentiator. Open-laptop screen and secondary-monitor explicitly **out of scope** for v1.1 (deferred to v1.2).

### Human Sign-off Close — v1.0 Inherited (Phase 9)

> Closes v1.0 OPS-03, OPS-04, OPS-05, CTC-01 (delivery half). All items autonomous: false.

- [ ] **CLOSE-01**: OG image swap — 1200×630 PNG screenshot of the deployed text-shell hero, OPSEC-reviewed full-resolution (no notification banners, no localhost URLs, no employer info), ImageOptim'd to < 200 KB, replaces `public/assets/og-image.png`.
- [ ] **CLOSE-02**: Lighthouse manual median-of-3 on the deployed text shell URL — Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90. 3 runs + median documented in `.planning/CHECKLIST-LAUNCH.md`. Closes OPS-03.
- [ ] **CLOSE-03**: Web3Forms end-to-end delivery test — real submission via deployed contact form lands in both Gmail (not spam) and Outlook (not spam) with correct reply-to header. Closes CTC-01 delivery half.
- [ ] **CLOSE-04**: Real-device QA — iPhone 16 Pro Max (iOS real device) + Android Studio Emulator running Pixel 6 profile (Android emulated — physical device deferred to v1.2 with documented caveat in CHECKLIST-LAUNCH). 7-step QA protocol on each. Closes OPS-04.
- [ ] **CLOSE-05**: Two named peer reviews — one cyber-professional + one non-cyber usability reviewer; verdicts recorded in CHECKLIST-LAUNCH. Closes OPS-05.

### Write-ups + Lab Planning — v1.0 Inherited (Phase 10)

> Closes v1.0 CNT-02 and CNT-03. All items autonomous: false; gated by Eren actually running labs.

- [ ] **LAB-01**: Lab plan committed — one of (PortSwigger JWT lab / SigmaHQ vs Sysmon detection lab / MalwareBazaar retired-sample triage) selected as Lab #1 with calendar date for kickoff. Plan-phase forcing question: have any been started? If no, Phase 10 enters "lab planning only" mode and write-ups defer to v1.2 with explicit decision.
- [ ] **LAB-02**: 2–3 MDX CTF/lab write-ups authored under `src/content/writeups/` with real provenance (platform + date + sources/walkthroughs consulted), picked up automatically by the existing MDX pipeline (Plan 03-05). Closes CNT-02 + CNT-03.

## Out of Scope (v1.1 explicit exclusions)

Inherits v1.0 anti-feature list verbatim (Matrix code rain, padlock motifs, hooded-hacker silhouettes, fake "hacking in progress" GIFs, fake terminals that don't accept input, fake security dashboards, type-out animation on every paragraph, pure-black + saturated-green text, auto-playing music, "hire me" modals, custom cursors hiding system cursor, home address / phone / DOB on public site, backend / SSR, auth, real-time/multiplayer 3D scene, plagiarised CTF write-ups).

### New v1.1-specific exclusions

| Feature | Reason |
|---|---|
| **GLB workstation revisit (V2-3D-01)** | Plan 04-06 reverted because procedural read better; reattempting requires Blender modeling commitment which is not in v1.1 scope. Promoted to v1.2. |
| **Open laptop screen on side desk** | Composition risk vs ultrawide monitor + scope creep. v1.2 candidate. |
| **Secondary monitor** | Same — would dilute single-ultrawide focus established by HS-redesign. v1.2 candidate. |
| **Door** | Room reads as closed already; adds geometry without payoff. v1.2 candidate. |
| **Animated wall clock real-time** | Forces every-second re-render; defeats `frameloop="demand"` optimization. Static frozen time only. |
| **Open/close blinds animation** | Distraction; fixed-state blinds only. |
| **Animated cat tail wag** | Crosses from "subtle warmth" into "kitsch"; breathing-only. |
| **Real photographic window backdrop** | OPSEC leak risk (identifiable buildings / skyline); procedural canvas-texture only. |
| **Fake employer logos on framed cert** | Honest framing rule. |
| **Fake CVE numbers / IP addresses / "RED ALERT" labels on whiteboard** | Honest framing rule; ATT&CK content must trace back to a public source. |
| **Fake cert names on book spines** | Only real-title cyber classics. |
| **Real-cat personalization in content** | Cat is a decorative prop, never claimed as Eren's real pet (per 2026-05-15 user decision). |
| **Daylight window** | Cyber-room convention is night; daylight breaks the established atmosphere. |
| **Hooded-cat avatar / cyber-cat motif** | Defeats the warmth purpose. |
| **Fake `tcpdump` / packet-scroll on laptop screen** (if G1 ever lands in v1.2) | Honest framing rule. |
| **New camera poses for bed / cat / rack** | HS-redesign consolidated to 1 overview + 1 focused-on-monitor; re-fragmenting undoes that work. Bed and cat live in the same overview frame. |
| **New zustand slice** | New components are render-only; tab store exists only to bridge Canvas/DOM, which nothing in v1.1 requires. |

## Traceability

| Requirement | Phase | Status |
|---|---|---|
| ROOM-01 | Phase 5 | Pending |
| ROOM-02 | Phase 5 | Pending |
| ROOM-03 | Phase 5 | Pending |
| ROOM-04 | Phase 5 | Pending |
| CYB-01 | Phase 6 | Pending |
| CYB-02 | Phase 6 | Pending |
| CYB-03 | Phase 6 | Pending |
| BED-01 | Phase 6 | Pending |
| BED-02 | Phase 6 | Pending |
| BED-03 | Phase 6 | Pending |
| WALL-01 | Phase 7 | Pending |
| WALL-02 | Phase 7 | Pending |
| WALL-03 | Phase 7 | Pending |
| WARM-01 | Phase 7 | Pending |
| WARM-02 | Phase 7 | Pending |
| WARM-03 | Phase 7 | Pending |
| WARM-04 | Phase 7 | Pending |
| CAT-01 | Phase 8 | Pending |
| CAT-02 | Phase 8 | Pending |
| CAT-03 | Phase 8 | Pending |
| DEV-01 | Phase 8 | Pending |
| CLOSE-01 | Phase 9 | Pending (closes v1.0 — supports CLOSE-02..05) |
| CLOSE-02 | Phase 9 | Pending (closes v1.0 OPS-03) |
| CLOSE-03 | Phase 9 | Pending (closes v1.0 CTC-01 delivery half) |
| CLOSE-04 | Phase 9 | Pending (closes v1.0 OPS-04) |
| CLOSE-05 | Phase 9 | Pending (closes v1.0 OPS-05) |
| LAB-01 | Phase 10 | Pending |
| LAB-02 | Phase 10 | Pending (closes v1.0 CNT-02 + CNT-03) |

**Coverage:**
- v1.1 requirements: 28 total
- Mapped to phases: 28 ✓
- Unmapped: 0

**Per-phase counts:**
- Phase 5 (Room Shell): 4 requirements
- Phase 6 (Cyber Detail + Bed Corner): 6 requirements
- Phase 7 (Wall Content + Warmth): 7 requirements
- Phase 8 (Cat + Secondary Devices): 4 requirements
- Phase 9 (Human Sign-off Close): 5 requirements (all closes_v1.0)
- Phase 10 (Write-ups + Lab Planning): 2 requirements (closes_v1.0: CNT-02, CNT-03)

---

*Requirements defined: 2026-05-15 after milestone v1.1 questioning + 4-parallel research*
*User decisions captured: cat=invented; bed=single; labs=plan together; GLB=defer to v1.2; Android=emulator; window=procedural*
