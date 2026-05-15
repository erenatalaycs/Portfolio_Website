# Pitfalls Research — v1.1 Room Build-Out + Pre-Launch Close

**Domain:** R3F portfolio scene expansion (procedural room) + cyber-domain content authoring + inherited human-only QA close-out
**Researched:** 2026-05-15
**Confidence:** HIGH (codebase signature + binding rules verified against current files; cyber-domain anti-pattern list verified against v1.0 REQUIREMENTS.md Out-of-Scope table; no-fabrication rule verified against feedback memory dated 2026-05-08)

> Supersedes the v1.0 pitfalls research at the same path (2026-05-06). v1.0 covered generic R3F + cyber-portfolio launch pitfalls; this revision is scoped to the **delta** of v1.1 — adding a room shell, server rack, whiteboard, bias-light/LED strip, bed/cat, secondary devices, and closing v1.0-inherited human sign-off / write-up / GLB items.

This document covers pitfalls specific to **adding** the v1.1 categories on top of the shipped v1.0 codebase, plus pitfalls in closing the v1.0-inherited human sign-off / write-up / GLB items. Generic R3F warnings already covered in the prior v1.0 research (orbit clamp, capability gating, drei `<Html>` occlusion) are **not** repeated.

---

## Critical Pitfalls

### Pitfall 1: Visual-overload — "hacker mağarası" / cheesy gaming setup

**What goes wrong:**
The shipped v1.0 scene already has: one cyan accent point light (intensity 3.5), one warm lamp point light (intensity 1.2), one emissive neon strip (emissiveIntensity 2.0, `toneMapped:false`), plus the monitor screen emissive surface, plus Bloom postprocessing (luminanceThreshold tuned for the existing emissives). Adding v1.1 emitters — server rack LED bank (8–24 blinking LEDs), screen bias-light (large emissive plane behind monitor), under-desk LED strip (long thin emissive plane), bedside lamp (point light), ceiling light (point/area light) — pushes the cumulative emissive load past Bloom's threshold-tuning. The scene reads as **gamer RGB battlestation**, not **professional cyber analyst**. Recruiters whose intuition this site is courting will read it as a 14-year-old's first PC build, not a workstation.

The Out-of-Scope list in v1.0 REQUIREMENTS.md already names this trap obliquely — Matrix rain, hooded-hacker silhouettes, padlock/shield/glowing-binary motifs are explicitly excluded because they "signal 'doesn't get the field' to technical hiring managers." Multiplying neon emissives is the same failure mode dressed up as set-decoration.

**Why it happens:**
Each new emitter feels like a small additive improvement in isolation ("just one LED strip"). The visual-tuning loop is per-feature, not cumulative. Bloom's `luminanceThreshold` was tuned in Plan 04-01 against the current emissive count; new emitters cross the threshold without any single one tripping a review.

**How to avoid:**
- **Hard cap: ≤ 4 distinct emissive colours in the scene at any time.** Currently: cyan (neon strip + accent point light), green (terminal text on monitor + book spines), warm amber (lamp), off-white (monitor base illumination). New emitters must reuse one of these four — not add a fifth.
- **Cumulative-bloom readability test:** after each emitter-adding plan, take a screenshot at the default `?focus=overview` pose AND the per-tab focus poses; if monitor text legibility drops vs. the v1.0 baseline screenshot (which must be checked in via the verification step), revert the emitter or lower its `emissiveIntensity`. Concretely: zoom screenshot to 200%, can you still read the `whoami` block? If no, blow-out has happened.
- **One-blink-frequency rule:** if multiple LEDs blink, share a single phase clock OR fix at most 2 frequencies. Multiple uncorrelated frequencies look like Christmas-tree decoration, not server status.
- **Audio cue test (mental):** if a recruiter took a screenshot and the screenshot would be captioned "guy who plays Valorant" vs. "junior SOC analyst's actual room", you've crossed the line. The whoami poster, ASCII-framed terminal output, and procedural geometry currently land on the right side; LED stacking is the most likely thing to push it across.

**Warning signs:**
- More than 4 distinct hues visible in any screenshot.
- Total emissive surface area (sum of plane areas with `emissive*` > 0) > 50% of monitor screen area.
- Bloom looks "smeared" — discrete light sources blur into each other.
- More than 3 simultaneous blink animations on screen at once.
- Reviewers describe the scene with words like "RGB", "rave", "Christmas tree", "gaming setup" rather than "workstation", "office", "lab".

**Phase to address:**
Phase D (warmth touches: bias-light + LED strip + plant + books) is the highest-risk concentration. Gate this phase on a side-by-side screenshot comparison against the v1.0 baseline. Phase B (server rack) is the second-highest risk because LEDs are conceptually justified for that prop. Add a `discuss-phase` question: **"How many distinct emissive colours does this phase add? If > 0, justify why an existing colour can't be reused."**

---

### Pitfall 2: Whiteboard / wall-content fabrication

**What goes wrong:**
The whiteboard prop (category C) is canvas-texture authored — i.e. text rendered into a 2D canvas at runtime, same pattern as `WallDecor.tsx`'s existing whoami poster. The temptation is to populate it with content that **looks** like an analyst's working notes: fake CVE IDs ("CVE-2026-12345 — RCE in our perimeter"), fake IP addresses, fake incident tickets ("RED ALERT — APT-29 DETECTED 14:32 UTC"), fake Sigma rule fragments, fake YARA signatures. Every one of these is a fabrication and triggers the binding rule from `feedback_no_fabricated_lab_evidence.md`. The risk is *especially* high because canvas-rendered text is small, decorative, easily skimmed — it doesn't *feel* like a write-up, so it doesn't *feel* like fabrication. But a technical hiring manager who zooms in on the screenshot will notice "CVE-2026-12345 doesn't exist" or "10.0.0.0/8 is private — what's the threat model here?" and the credibility hit is permanent.

**Why it happens:**
- Decorative content gets less scrutiny than write-up content. Authors think "it's just set dressing."
- Cyber visual references (CTI tools, dashboards, threat-intel feeds) all use real CVEs / IPs / hashes, so the visual grammar of the genre is "specific numbers." Empty placeholders look wrong.
- Time pressure during phase execution makes inventing a number feel faster than researching a real public reference.

**How to avoid:**

**Acceptable whiteboard content** (all public domain frameworks, no fabrication required):
- **MITRE ATT&CK matrix** — header row of tactics (Reconnaissance → Initial Access → … → Impact), one or two technique cells highlighted (e.g. T1078 Valid Accounts, T1190 Exploit Public-Facing Application). All technique IDs are public. Cite "MITRE ATT&CK" small in the corner.
- **Lockheed Martin Cyber Kill Chain** — Recon → Weaponization → Delivery → Exploitation → Installation → C2 → Actions on Objectives. Public framework.
- **NIST CSF function wheel** — Identify / Protect / Detect / Respond / Recover. Public framework.
- **OWASP Top 10** — A01 Broken Access Control through A10 SSRF. Public list, version-dated (2021 is current).
- **Generic todo-list of study topics, clearly labelled as such** — "Lab queue: [ ] PortSwigger JWT, [ ] Sigma vs Sysmon, [ ] MalwareBazaar triage." This matches the v1.0 honest-junior framing (write-ups in progress, not done).
- **Hand-drawn-style ASCII network diagram of a generic three-tier app** (frontend / backend / DB). No real IPs; use RFC 5737 documentation ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) if IPs must appear.

**Unacceptable whiteboard content** (refuse outright, suggest the acceptable alternative):
- Fake CVE IDs not corresponding to real public CVEs.
- Real CVE IDs Eren has no demonstrated work on (implies he investigated them).
- Fake IP addresses from real allocated ranges (anything not in RFC 5737 / RFC 1918 docs).
- Fake company names / SIEM tenant names / customer references.
- "RED ALERT" / "INCIDENT IN PROGRESS" / "BREACH DETECTED" — theatre, not analysis. Reads as the Hollywood-hacker cliché the v1.0 Out-of-Scope list specifically forbids.
- Sigma rule fragments invented for the visual.
- IOCs (hashes, domains, JA3) not from a real public source.
- A whiteboard photo that's an actual SOC team's whiteboard (OPSEC violation even with redaction).

**How to avoid (process):**
- The phase that authors the whiteboard MUST cite the public framework source in the plan's CONTEXT.md ("Source: MITRE ATT&CK Enterprise v15, https://attack.mitre.org/").
- `discuss-phase` forcing question: **"Name the public framework or source for every text element on this whiteboard. If you can't, refuse and pick an acceptable alternative."**
- Comment in the canvas-texture component listing each text element's source URL.
- Pre-launch QA (Phase H) re-reads the whiteboard once at full zoom and confirms every element traces to a public source.

**Warning signs:**
- Plan draft includes a specific CVE number with no Wikipedia/NVD link.
- Plan draft includes specific IPs outside RFC 5737 / RFC 1918.
- Author defends a piece of content with "it's just decorative" or "no one will look that close."
- Whiteboard contains a date + status combination (e.g. "2026-05-12 14:32 — UNAUTH ACCESS DETECTED").

**Phase to address:**
Phase C (wall content). Add `discuss-phase` forcing question above. Refuse the plan execution if the question isn't answered before VERIFICATION step.

---

### Pitfall 3: Cat reads as alien / Cthulhu, not cat

**What goes wrong:**
Procedural geometry primitives (spheres, capsules, cones, cylinders) compose to recognisable furniture (desk, monitor, lamp) because furniture *is* geometrically blocky and the brain accepts approximations of rigid forms. **Living creatures the brain has high-fidelity priors for** — cats, dogs, humans, hands — break this. A cat assembled from a sphere body, sphere head, two cone ears, four cylinder legs, one cone tail looks like neither a cat nor an abstract shape. It looks like an *unsuccessful* attempt at a cat, which is worse than no cat at all — the uncanny-valley effect on a low-fidelity creature reads as "the author thinks this is good enough" → "the author has poor judgment" → "I question their other judgments." That's the opposite of the cyber-credibility outcome the whole project is optimising for.

**Why it happens:**
- The author imagines the cat from memory ("body + head + ears + legs + tail") and assembles it from primitives matching that mental list. The result is technically all the parts of a cat but in proportions only the author recognises.
- Procedural-first instinct from v1.0 (`PROJECT.md`: "approach is procedural-first, optional CC0 GLB swap later if needed") carried over without checking whether the v1.0 instinct generalises to organic forms.
- The cat is a personal touch ("yatak ve kedi"), so author has emotional investment in shipping it; quality bar is sympathetic, not adversarial.

**How to avoid:**
- **The 3-second silhouette test:** if a recruiter looking at the scene from the default `?focus=overview` pose can't identify "that shape is a cat" within 3 seconds, the cat fails. Test with someone who hasn't read the code.
- **Hard fallback rule:** if first procedural attempt fails the 3-second test, switch immediately to a CC0 low-poly cat GLB (Poly Pizza, Sketchfab CC0 filter, Quaternius). Do not iterate procedurally — the failure mode here is the author's mental model of "what a cat looks like" diverging from the primitive composition, and more time doesn't fix that.
- **Sleeping / curled-up pose preferred over standing.** A curled sleeping cat is a *blob with ears*, which primitive geometry can approximate convincingly (one squashed ellipsoid + two cones + a curled cylindrical tail). A standing cat requires four-legged proportions that are precisely the failure mode above.
- **Place at far/scale-disadvantage position.** On the bed pillow at scene-back z, the cat is small in the frame; the brain forgives imprecise geometry at small angular size. Up close on the desk, every flaw shows.
- **No cat animation other than gentle vertical breathing** (Y-scale or position lerp, ±2% amplitude, 0.5 Hz). No head rotation, no leg movement, no tail wag — these all expose rigging the procedural cat doesn't have and read as broken.
- **Reduced-motion gating** — breathing animation off when `prefers-reduced-motion: reduce` (see Pitfall 12).

**Warning signs:**
- Author iterates more than 2 times on cat proportions without showing it to a fresh viewer.
- First-look reactions: "is that a sheep?" / "is that an alien?" / "wait what is that?" / "is that supposed to be...?"
- The cat needs a label or tooltip to be recognised.
- Anyone says "Cthulhu" or "Lovecraft" near the screen.

**Phase to address:**
Phase F (procedural cat). Build the 3-second silhouette test into the phase's VERIFICATION step explicitly. `discuss-phase` forcing question: **"If the procedural cat fails the 3-second silhouette test on first viewer reaction, do you commit to switching to a CC0 GLB rather than iterating procedurally?"** Pre-decide the swap so the visual-tuning loop doesn't waste the budget.

---

### Pitfall 4: Lighting blowout — Bloom washes out monitor content

**What goes wrong:**
Bloom in `@react-three/postprocessing` works on luminance: any pixel above `luminanceThreshold` contributes to the glow buffer. v1.0's threshold was tuned in Plan 04-01 against the current emissive set (monitor screen, neon strip emissive, accent point lights). Adding new high-luminance sources — server rack LEDs at `emissiveIntensity` similar to the neon strip, screen bias-light covering a large plane area, under-desk LED strip, bedside lamp emissive bulb — increases the **total bloom contribution** super-linearly because the gaussian blur passes spread the glow into neighbouring pixels. At a high enough cumulative contribution, the monitor content (whose text glyphs are the readable part of the entire site) is overwhelmed by surrounding bloom and becomes unreadable. **This defeats the entire purpose of the 3D scene** — the monitor is the content surface; if you can't read what's on it, the scene is decoration only.

The PerformanceMonitor 2-tier gating (high = postprocessing on, low = postprocessing off) does NOT help here — the readability failure occurs precisely in the **high** tier where Bloom is enabled.

**Why it happens:**
- Each new emitter is added in a scene context where the monitor is off-screen or out of focus, so the readability impact isn't seen.
- `emissiveIntensity` values aren't centrally managed — there's no single config file capping the total.
- Bloom looks impressive in screenshots; the natural visual-tuning instinct is to push it further, not pull back.
- The shipped v1.0 has `toneMapped={false}` on the neon strip material (line 38 of `WallDecor.tsx`), which means that surface contributes to bloom *without* tone-mapping clamping it. Replicating this pattern on every new emitter compounds the problem.

**How to avoid:**
- **Centralise emissive intensity in a config file.** Create `src/scene/emissiveBudget.ts` with named constants (`NEON_STRIP`, `RACK_LED`, `BIAS_LIGHT`, `LED_STRIP`, `LAMP_BULB`, `BEDSIDE_LAMP`, `MONITOR_SCREEN`). Reference these in every component. PRs adding new emissives must add to this file, making the cumulative count visible at code-review time.
- **Total emissive-intensity-times-area budget.** Sum `emissiveIntensity × planeArea` across all emitters; cap it at, e.g., 1.5× the v1.0 baseline. Track in a comment in `emissiveBudget.ts`.
- **`toneMapped={false}` is a privilege, not a default.** Only the existing neon strip keeps this. All v1.1 emitters use the default tone-mapping unless there's a specific reason and a comment explaining it.
- **Per-phase monitor-readability test.** After each phase touching emissives, take a screenshot at each of the 5 tab focus poses; perform OCR or eyeballed legibility check on the monitor content. A small text-recognition assertion in the manual QA list ("can you read every line of the whoami tab without effort?") catches this cheaply.
- **Bloom config gates a Lighthouse-style review.** If the answer is "I need to lower Bloom because the scene has too many emissives," that means the scene has too many emissives — fix the emissive count, don't fix the Bloom.
- **PerformanceMonitor low-tier preservation.** On low tier, postprocessing is already off — confirm the scene without postprocessing still reads correctly. If it doesn't (e.g., LEDs only "look like LEDs" because of bloom), the prop fundamentally needs to be redesigned with a non-emissive cue.

**Warning signs:**
- Reviewer comment: "Looks pretty, but I can't read the monitor."
- Bloom config knob (`intensity`, `luminanceThreshold`) gets touched in a non-Plan-04-01 PR.
- New emissive material added with `toneMapped={false}`.
- `emissiveIntensity` > 3.0 on any new material (existing baseline: 2.0 on neon strip is the high end).
- The scene "looks washed out" or "hazy" without anyone being able to point at one cause.

**Phase to address:**
Phase B (server rack LEDs — first new emitter cluster) and Phase D (bias-light + LED strip — largest emissive area) are highest-risk. Phase B should create `src/scene/emissiveBudget.ts` proactively even if Phase B only uses 2 of the constants — it sets the precedent for Phase D. Both phases include the per-tab readability screenshot test in VERIFICATION.

---

### Pitfall 5: Window-with-blinds OPSEC leak

**What goes wrong:**
The room shell (category A) includes "blinds-style window (foggy night-city)" — a 2D image or rendered backdrop visible through the window slats. If the backdrop is a real photograph of Eren's actual neighbourhood, or any identifiable skyline / building / signage / road sign / pub name, it reveals his location to anyone who reverse-image-searches the screenshot. This violates the v1.0 Out-of-Scope rule ("Home address / personal phone / full DOB on the public site") — city-level (UK) was the agreed disclosure, not neighbourhood-level. Cyber community in particular includes people who casually do OSINT for sport; a "where is this skyline?" thread happens.

This is the same family of risk as the OPSEC pipeline already wired in OPS-01 (`exiftool -all=` on screenshots) — the existing pipeline strips EXIF GPS but doesn't help if the photographic content itself is identifying.

**Why it happens:**
- "Foggy night-city" sounds atmospheric and there are good photos available; the easy path is to pick one.
- Author doesn't connect "decorative backdrop" with "OPSEC artifact."
- A photo taken from Eren's actual window looks the most "authentic."

**How to avoid:**
- **Hard rule: no real photographs of identifiable real places.** Including stock photos of identifiable real places (Big Ben, Shard, Manchester wheel) — these are not Eren's neighbourhood but they imply a location, which still narrows the OSINT picture.
- **Acceptable options, in preference order:**
  1. **Pure procedural / shader-driven generic city-lights pattern** — a plane behind the blinds with a fragment shader producing scattered warm/cool dot patterns (the "city at night from above" abstraction). Zero identifying content. Fits the procedural-first project aesthetic.
  2. **Solid dark gradient with subtle noise** — fogged-out window, no city implied. Simplest, lowest risk.
  3. **CC0 stylised illustration** (vector, low-detail) of a generic urban skyline silhouette with no recognisable landmarks. CC0 license must be documented in the plan.
  4. **AI-generated abstract cityscape** — only if Eren is OK declaring "this is AI-generated" if asked. (Cyber audience may judge AI-generated assets; weigh tradeoff.)
- **No real photos of Eren's room either** — applies to bookshelf book spines, posters on the wall, anything reflective in the scene that could reveal background detail.
- **Verification in the OPSEC checklist (CHECKLIST-OPSEC.md).** Add row: "Window backdrop: synthetic / abstract only — confirm no real-place imagery."

**Warning signs:**
- Plan references a specific photo source for the window.
- Window content includes any recognisable building shape.
- Plan author describes the cityscape with specifics ("the bridge", "the tower") rather than abstractly.
- An image search of a screenshot returns "places similar to this image."

**Phase to address:**
Phase A (room shell — window-with-blinds). Add this rule to CHECKLIST-OPSEC.md as part of the same phase. `discuss-phase` forcing question: **"What is the source of the window backdrop content? If it's a real photograph, refuse and pick a procedural / abstract option."**

---

### Pitfall 6: Bed + cat = "personal life overshare" framing

**What goes wrong:**
A single bed and a cat in the recruiter-facing view of a cyber analyst's portfolio is *personal* in a way the v1.0 scene (desk + monitor + bookshelf) is not. The audience is split 50/50 between recruiters (30-second skim, want to file Eren as a hire-able junior) and hiring managers (read the write-ups, will engage with 3D). The risk:

- **Recruiter side:** the recruiter sees the bed and cat in a screenshot, files the candidate mentally as "lives in a small/studio flat" → "junior" → "salary-bracket-adjusted" before they even read the CV. Or files as "weird vibe, skip" without articulating why.
- **Hiring manager side:** ambivalent. Some hiring managers find the humanising touch positive ("authentic, has a personality, knows the cyber-room genre"). Others find it unprofessional ("why am I looking at this guy's bedroom?").
- **Bias considerations:** "Hacker living in their bedroom" is a stereotype carrying baggage in cyber hiring — sometimes positive (matches the genre), sometimes negative (unprofessional, hobbyist-not-serious). The asymmetry of risk: a recruiter who downgrades you doesn't tell you. You can't recover from the unspoken negative judgement.

The v1.0 PROJECT.md positions Eren as "a credible junior" — the bed + cat is a *style* choice that doesn't strengthen credibility and may weaken it for some viewers. It's adjacent to (not in) the v1.0 Out-of-Scope rule about "Home address / personal phone / full DOB" — the spirit of that rule is "less personal exposure is safer."

**Why it happens:**
- "Yatak ve kedi" is Eren's explicit ask; the scope was set by user preference, not by audience research.
- The cyber-room genre (Hacker Simulator, twitch streamers' rooms, etc.) often does include bed + cat — so it feels on-genre.
- The author wants to make the scene feel "real", and real rooms have beds.

**How to avoid:**
- **Don't refuse the scope, but mitigate placement.** Bed at the back-left of the scene, **off the default `?focus=overview` camera pose**, so a recruiter doing a 30-second skim sees the workstation only. The bed becomes visible if the user explicitly drags the camera to look around — i.e. the engaged hiring-manager mode, which is the audience that values the humanising touch.
- **Verify with the orbit clamps** (`minAzimuthAngle: -Math.PI / 2, maxAzimuthAngle: Math.PI / 2`): currently the orbit allows ±90° azimuth. The bed should be at an azimuth that requires the user to deliberately drag past 45° from default. If clamps need adjustment to keep the bed off-screen at default, do that.
- **Couch over bed.** Couch keeps the "humanising touch" without the "is this their bedroom?" connotation. PROJECT.md already lists couch as an acceptable alternative ("single bed/couch fitting cyber-room aesthetic"). Recommend couch unless Eren explicitly prefers bed. (This connects to Pitfall 15 — bed implies studio-apartment.)
- **No bedding details that scream domesticity** — no pillows arranged like a hotel, no plush toys, no clothes draped on a chair. Make the bed read like a place to sit during a long study session, not a personal sleeping area. (Or, equivalently: choose couch.)
- **Audience-research check, `discuss-phase` question:** ask Eren which framing he prefers — "more workstation-focused (bed minimised / off-default-view)" or "more lived-in / humanising (bed visible at default)." If he picks the latter, document the tradeoff has been considered. Recommend the former.

**Warning signs:**
- The default `?focus=overview` screenshot prominently includes the bed.
- The bed has a specific style (e.g. bunk bed, four-poster) that adds personality but adds OSINT-leakage / personal-life surface area.
- The bed area is more visually interesting than the desk area (composition has shifted).

**Phase to address:**
Phase E (bed corner). `discuss-phase` forcing questions:
1. **"Bed vs. couch?"** — recommend couch, accept bed if explicitly chosen.
2. **"Default-view exclusion: is the bed off the `?focus=overview` camera frame?"** — required Yes; adjust placement or orbit clamps to enforce.

---

### Pitfall 7: OrbitControls clip into walls

**What goes wrong:**
Current `Controls.tsx` clamps (lines 31–38):
```
minPolarAngle: Math.PI / 3        // ~60° — won't look from below
maxPolarAngle: Math.PI * (100/180) // ~100° — won't look from above
minAzimuthAngle: -Math.PI / 2     // -90°
maxAzimuthAngle: Math.PI / 2      // +90°
minDistance: 1.2
maxDistance: 4.0
```
The room shell (category A) adds left + right + back wall planes. With walls and the current azimuth range of [-90°, +90°], a user dragging to the maximum azimuth will place the camera *behind* the back wall or *outside* a side wall, looking back into the scene through wall geometry. Depending on whether wall material is back-face-culled or two-sided, the user sees either a transparent-from-behind wall (revealing the scene through a "hole"), wall back-faces (looking inside-out), or a completely empty void where the camera escaped the room.

The shipped v1.0 maxDistance of 4.0 m is also relevant — if the room is, say, 5×5 m, then maxDistance puts the camera past the back wall at any azimuth ±90°.

**Why it happens:**
- Orbit clamps were authored for an unbounded scene (just a desk floating in space); walls weren't part of the v1.0 mental model.
- Adding walls is a "geometry only" task — author thinks of it as decoration, doesn't connect to camera constraints.
- The clip is only visible if you actually drag to the edge of the azimuth or push max distance — easy to miss during local dev where you stay near the centre.

**How to avoid:**
- **Re-derive orbit clamps from room dimensions, not from desk dimensions.** After walls are in place, walk the orbit envelope (min/max polar × min/max azimuth × min/max distance) corners and verify none of those corners are outside the room. Tighten any clamp that escapes.
- **Concrete recipe for a 4×4×2.5 m room with desk against the back wall:**
  - `minDistance`: keep at 1.2 (still inside the desk's clearance).
  - `maxDistance`: ≤ `(room_depth - desk_z - margin)`. For a 4 m deep room with desk centred at z=-0.5 and a 0.3 m margin from the back wall: `maxDistance ≤ 4 - 0.5 - 0.3 = 3.2 m`. Reduce from 4.0 → 3.0 m.
  - `minAzimuthAngle / maxAzimuthAngle`: tighten from ±90° to ±60° so the camera doesn't slide past the side walls.
  - `minPolarAngle`: keep at π/3 (≈60° from straight up) — won't look down through the floor.
  - `maxPolarAngle`: keep at ≤100° — won't look up through the ceiling.
- **Visualise the orbit envelope in dev mode.** Use `r3f-perf` or a debug helper that draws a wireframe sphere/cone showing the camera's reachable positions. Run this once after walls land; verify no overlap with wall planes.
- **OrbitControls collision detection isn't built-in.** Don't expect drei to solve this — it won't. Tighter clamps are the only mechanism. (A raycast-based camera collision would work but adds complexity inappropriate for a 1-month milestone.)
- **Wall material is two-sided OR camera can't reach behind it — pick one.** If walls are single-sided (default) and the camera can clip through, the user sees the inside-out wall (back faces visible). Pick: either set wall material `side: THREE.DoubleSide` (cheap visual fix; works if camera escapes) OR enforce tight clamps (cleaner fix).

**Warning signs:**
- Dragging to max azimuth shows void or wall-from-behind.
- Zooming out reveals a "frame" of the room rather than the room enveloping the camera.
- Walls visibly clip through any prop (chair, bed, monitor) at orbit positions.
- Performance drops at certain orbit positions (camera entering wall geometry can mess with shadow rendering).

**Phase to address:**
Phase A (room shell). The plan that adds walls MUST in the same plan re-derive and update `ORBIT_CLAMPS` in `Controls.tsx`. Add a VERIFICATION step: drag the camera to each of the 8 orbit-envelope corners (min/max polar × min/max azimuth × min/max distance) and confirm no wall escape at any corner. Then re-test each of the 5 tab focus poses to confirm the GSAP camera dolly still lands inside the room.

---

### Pitfall 8: Phase 4 (04-08) human sign-off defers indefinitely

**What goes wrong:**
The v1.0 audit ships with 4 unsatisfied requirements awaiting human sign-off (`OPS-03` Lighthouse manual median-of-3, `OPS-04` real-device QA, `OPS-05` pre-launch checklist execution, `CTC-01` delivery half — Gmail + Outlook test). These are autonomous: false — no agent can do them. The CHECKLIST-LAUNCH.md is fully authored with `___` placeholders. The pattern that has already failed once (Plan 03-06 was originally autonomous: false, got deferred because Eren didn't run the real labs in the planned window) is now repeating: if v1.1 doesn't gate its own completion on these items being filled, they'll defer to v1.2, then v1.3, then never.

The sign-off items aren't blocked by code — they're blocked by Eren actually deploying to GH Pages, opening Chrome incognito, running Lighthouse 3 times, recording numbers, sending a Web3Forms test, and checking inboxes. ~30–60 minutes of focused human work that **always loses to whatever else is on Eren's plate.**

**Why it happens:**
- Sign-off work has no satisfying deliverable beyond filling in `___` rows; psychologically less rewarding than building new features.
- Each individual sign-off item is "I'll do it later when I have 10 quiet minutes" — but 4 items × deferral compounds.
- v1.0 milestone ended without these closed, which set a precedent that v1.1 can repeat.
- "Working on v1.1 features" feels like progress; "filling in the launch checklist" feels like paperwork.

**How to avoid:**
- **Mirror the Plan 04-08 resume-signal pattern at the v1.1 milestone level.** v1.1-complete is gated on a single artifact: `CHECKLIST-LAUNCH.md` (existing) with every `___` placeholder filled AND `CHECKLIST-OPSEC.md` (new pitfall rule from #5) verified. If any row is `___`, v1.1 cannot complete.
- **Make the sign-off its own phase (Phase H per scope), executed AFTER feature phases but BEFORE milestone close.** The Phase H plan's autonomous: false flag is set; the plan body is "ask Eren to run the checklist." VERIFICATION is binary: every row populated. No partial pass.
- **Forcing function in `gsd-complete-milestone`:** the milestone-close command reads CHECKLIST-LAUNCH.md and refuses to close the milestone if any `___` remains. (If the existing milestone-close command doesn't do this, document the manual check in v1.1 ROADMAP.md.)
- **Schedule the sign-off explicitly — pick a date.** "Saturday 2026-05-23 morning, 9–10am" or whatever Eren can commit to. Without a date, defer wins.
- **Lower the friction:** prepare the sign-off Saturday by leaving 3 browser windows open, the checklist file in the editor, a pre-typed Web3Forms test message in clipboard. Make the activation energy near zero.
- **Decouple from feature work.** v1.1 features (A–G) ship first to a staging/branch deploy. Phase H sign-off runs against staging. This means Eren has something concrete to test against, and the feature work isn't held hostage to the sign-off date.

**Warning signs:**
- Phase H plan exists but no calendar date attached.
- The plan is "ongoing" or "rolling" rather than time-boxed.
- Feature phases (A–G) keep getting added without Phase H starting.
- Eren says "I'll get to the checklist after [feature]" — gentle pushback recommended.

**Phase to address:**
Phase H (pre-launch sign-off). `discuss-phase` forcing questions:
1. **"What date will the sign-off Saturday be?"** — concrete date or refuse plan execution.
2. **"Have devices been identified for OPS-04 (real-device QA)?"** — must name an iOS model and an Android model BEFORE the plan starts, not during.
3. **Milestone-close gate:** v1.1 cannot transition to milestone-complete with any `___` in CHECKLIST-LAUNCH.md.

---

### Pitfall 9: CTF write-ups blocked again by no-lab-work

**What goes wrong:**
v1.0 deferred CNT-02 and CNT-03 to v1.1 because Eren hadn't run the real labs (Plan 03-06 override accepted 2026-05-08, per `feedback_no_fabricated_lab_evidence.md`). If v1.1 includes "write 2–3 MDX CTF write-ups" as a phase without first confirming Eren has done the lab work, **the same failure mode recurs** — the phase will be deferred to v1.2 with the same root cause: no real evidence to write from, no fabrication permitted.

This is the cyber-equivalent of the OPS-03/04/05 sign-off pitfall: lab work happens out-of-band of agent execution, and "I'll get to the lab later" loses to other priorities indefinitely.

**Why it happens:**
- Hope that "this milestone will be different."
- Write-ups feel like they unblock with effort; the actual blocker (running the lab) is invisible to roadmap planning.
- Lab work is technical and rewarding; the gap between "interest" and "scheduled time to do it" is wide.

**How to avoid:**
- **`discuss-phase` forcing question, BEFORE the write-ups phase enters the roadmap:** **"Have you actually started any of the 3 labs (PortSwigger JWT, SigmaHQ-against-Sysmon, MalwareBazaar retired-sample triage)? If no: do not include write-ups in v1.1 scope. Pull from v1.0-deferred and re-defer to v1.2 explicitly."** Better to defer honestly at planning time than to defer at execution time after building expectations.
- **Acceptable v1.1-scope alternatives** if labs haven't started:
  1. Ship v1.1 with `src/content/writeups/` still empty (status quo from v1.0).
  2. Ship v1.1 with one *clearly-labelled "study notes"* MDX entry — e.g. "Notes from PortSwigger's Lab: JWT authentication bypass via unverified signature" with full citations to PortSwigger, framed explicitly as "my notes while working through this public lab" not as "my discovery." This is acceptable under the no-fabrication rule per the binding memory.
  3. Promote write-ups to v1.2 with a calendar commit ("by 2026-07-01") and a parking lot of lab-run dates.
- **If labs HAVE been started but not finished:** scope the phase to one write-up, not three. One real write-up > three fabricated.
- **Don't roll labs into a phase plan as an autonomous step.** Labs are out-of-band; planning should treat them as a *precondition*, not a *deliverable* of the write-up phase.
- **Honest framing wins.** A junior portfolio with 0 write-ups and a visible "in progress" empty state outperforms a portfolio with 3 fabricated write-ups in a community where fabrication is career-ending. This is already established (PROJECT.md Key Decisions row: "No write-up fabrication — author only after real labs").

**Warning signs:**
- Plan draft says "Eren will run the lab in week X" with no commitment from Eren.
- Lab references in the plan have no link to Eren's real run (screenshot, log file, captured cookies, etc.).
- Plan execution proposes filling in "placeholder" content with "we'll swap it later."
- Eren responds to "have you started the lab?" with "I will" rather than "I have."

**Phase to address:**
Phase I (write-ups + GLB revisit). `discuss-phase` forcing question above runs FIRST. If the answer is no labs started → strike the write-ups portion of Phase I and explicitly promote to v1.2. Do not let the roadmap carry an unblockable phase.

---

### Pitfall 10: Re-attempting GLB workstation V2-3D-01 — same outcome

**What goes wrong:**
Plan 04-06 GLB workstation (real CC0 Poly Haven composite) shipped in 14 minutes during Phase 4 and was reverted in commit `342d2e7` after autonomous visual tuning concluded that **procedural geometry looked better in context**. The reversion was a quality decision, not a time-budget decision — the GLB files remain on disk under `public/assets/workstation/`. Promoting V2-3D-01 to v1.1 (per Active requirements) and "reattempting with iteration headroom" misreads the failure mode: more iteration time doesn't fix a wrong-direction choice. The same CC0-composite approach with more polish will likely re-converge on the same conclusion — procedural reads better in this scene because the postprocessing pipeline (Bloom + Scanline + CA + Vignette) is tuned for procedural materials, not for the PBR-realistic materials of Poly Haven assets. Re-attempt risk = same outcome = wasted Phase I/v1.1 budget.

The promotion was reasonable as a hedge ("real GLB" was a v1.0 requirement that needed *somewhere* to live), but the assumption "more iteration time will produce a different result" is unverified and probably wrong.

**Why it happens:**
- Sunk-cost: the GLB files are already in the repo; "shouldn't we use them?"
- v1.0 REQUIREMENTS.md row for 3D-08 wants "real GLB" closure; the procedural revert leaves a paperwork loose end.
- Procedural can feel like a fallback even when it's the right choice (because it was Plan 04-06 Path B, not Path A).

**How to avoid:**
- **Treat the v1.0 revert as the answer, not the problem.** The procedural look IS the chosen v1 aesthetic. Update REQUIREMENTS.md 3D-08 row to reflect "shipped procedural; GLB promoted to v2" without ambiguity.
- **Re-attempt GLB only if a fundamentally different approach.** "Bigger budget on the same CC0-composite path" is not different. Fundamentally different = Blender modeling by Eren himself (his style, his lighting, his proportions, baked specifically for this scene's postprocessing). If Eren doesn't have time/skill/inclination for Blender modeling in v1.1, skip GLB revisit entirely.
- **Decision gate, `discuss-phase` forcing question:** **"Are you committing to Blender modeling for the workstation in v1.1? If no — skip GLB revisit. The procedural look is the right answer."**
- **Delete or formally archive the public/assets/workstation/ files** if GLB is skipped, so the repo doesn't carry 869 KB of unused assets indefinitely. Even unloaded, they're in the deploy artifact unless excluded.
- **Update REQUIREMENTS.md 3D-08 row now**, before v1.1 starts, to remove the "partial" status and reflect "shipped procedural by design."
- **If GLB is genuinely Blender-attempted:** scope it as a single plan with a clear abort criterion ("if it doesn't visibly beat procedural at the 5 tab focus poses in side-by-side screenshots within 1 iteration, abort and accept procedural as final"). Don't let it sprawl.

**Warning signs:**
- Plan draft re-uses the same Poly Haven asset list.
- "Just one more iteration" appears more than once.
- The case for GLB rests on "we already have the files" rather than "the look is better."
- No side-by-side comparison screenshots get committed.

**Phase to address:**
Phase I (write-ups + GLB revisit) — split into Phase I-writeups and Phase I-glb, gate GLB on the Blender-commitment question. Or, recommended: drop GLB revisit entirely and update v1.0 REQUIREMENTS.md 3D-08 row + delete `public/assets/workstation/`.

---

### Pitfall 11: Performance budget creep — size-limit gate trips late

**What goes wrong:**
Current 3D chunk is 38.95 KB gz against a 450 KB budget — substantial headroom. The temptation: assume headroom is endless, add components freely. v1.1 adds 10–15 new procedural components: WallLeft, WallRight, WallBack, Ceiling, Window, Blinds, ServerRack, RackLEDs, Cables, HDD, Whiteboard, AnalogClock, FramedCert, Plant, BookSpines, BiasLight, LedStrip, Bed, Nightstand, BedsideLamp, Cat. Each is small (probably 1–3 KB gz uncompressed JSX with primitives), but cumulatively 20 × 2 KB = 40 KB gz on top of 39 → ~80 KB gz. Still under budget — but **the failure mode isn't running out of budget, it's running out of budget LATE.** If Phase G (secondary devices) gets squeezed at the end because Phases A–F filled the budget, you'll cut features you committed to.

Additionally, the **GLB files** in `public/assets/workstation/` (869 KB total) are in the deploy artifact even though `src/` doesn't reference them. They count against deploy size if not the `size-limit` JS budget. And canvas-texture generation (whiteboard, wall poster) adds runtime memory but not bundle size — different budget axis entirely.

**Why it happens:**
- "We're at 9% of budget, who cares" reasoning.
- Per-PR size-limit increases are individually small and trigger no warning.
- size-limit budgets are JS gzipped; canvas-texture memory + GLB deploy weight are different metrics not enforced.
- New components default to live in the 3D chunk because they live in `src/scene/`.

**How to avoid:**
- **Monitor per-phase delta, not just absolute.** After each phase, log the 3D chunk size to a row in a tracking comment in ROADMAP.md or a `size-history.md`. If any single phase adds > 30 KB gz, investigate — probably means a non-primitive sneak (a heavy import, an oversized canvas texture).
- **Reserve 100 KB gz for Phase G (secondary devices)** by tracking forward. Don't let A–F consume all 450 KB.
- **Delete `public/assets/workstation/` if GLB revisit is skipped** (see Pitfall 10). 869 KB off the deploy artifact.
- **Canvas-texture sizes deliberate.** The existing whoami poster is 500×700 = 350K pixels. The whiteboard at the same resolution is fine; but if multiple canvas textures are created (whiteboard + framed cert + analog clock + book-spine textures), each at high resolution, runtime memory adds up. Cap at, say, 1024×1024 max per texture and 8 total textures.
- **Lazy-load Phase G if it's the swing vote.** Secondary devices (laptop, SDR) can be a separate dynamic import behind a `?advanced=true` URL flag if budget gets tight.
- **No new third-party deps for A–G.** PROJECT.md already says "no new deps expected"; enforce that.

**Warning signs:**
- 3D chunk gz size goes up by more than the expected per-phase delta (a single primitive component shouldn't add > 5 KB gz; if it does, look at what got imported).
- CI size-limit job warning yellow > 70% of budget.
- A phase wants to add a new prop and the author says "let's skip the texture optimisation, we have headroom."
- Multiple canvas textures created at full 2048×2048 resolution.

**Phase to address:**
Every phase from A through G includes a size-limit check in VERIFICATION. Phase A bootstraps the tracking row (records baseline). Phase G is the swing vote; if budget got tight in A–F, Phase G falls back to lazy-load.

---

### Pitfall 12: a11y — animation gating gaps for vestibular-sensitive users

**What goes wrong:**
v1.0 already wires `prefers-reduced-motion` site-wide (TXT-05 satisfied) and gates the `whoami` typing animation (3D-07) and OrbitControls damping (Controls.tsx line 53). v1.1 adds new animated elements:
- **Server rack LEDs** blinking (Phase B).
- **Cat breathing animation** (Phase F).
- **Neon strip pulse** if any added beyond the static v1.0 one (Phase D).
- **LED strip** with possible breathing / colour-cycle.
- **Analog clock** with second-hand sweep (Phase C).
- **Door swinging or any cosmetic motion** (Phase A).

Each animation should be gated behind `useReducedMotion()` (existing hook in `src/lib/useReducedMotion.ts`, already used in `Controls.tsx`). The pitfall: gating gets forgotten on small/decorative animations because they don't feel like "motion." A user with vestibular disorder visits, sees 8 simultaneously-blinking LEDs + a breathing cat + a sweeping second hand + a pulsing LED strip = vestibular trigger. Reduced-motion users currently get an excellent experience (the whole site is designed around them); a single missed gate is a regression.

**Why it happens:**
- "Tiny animations don't count" mental shortcut.
- `prefers-reduced-motion` is a per-component opt-in, not a global toggle — easy to forget.
- The reduced-motion failure mode is silent (the user doesn't complain, they just leave).

**How to avoid:**
- **Every animation, no exceptions.** LED blinks, cat breath, clock sweep, neon pulse, door swing, anything using `useFrame` for animation — gate behind `useReducedMotion()`. Reduced-motion state = animation frozen at a static representative frame (LED on or off at fixed pattern, cat at neutral scale, clock at static time, neon at constant emissiveIntensity).
- **Per-phase ESLint-or-grep audit.** After each phase, grep `useFrame` and `useSpring` in the touched files; for each result, verify the call site checks `useReducedMotion()`. If a `useFrame` doesn't, fix or document why (e.g. damping in OrbitControls is already off when reduced — verify).
- **A "reduced-motion screenshot" verification step.** Toggle reduced-motion via DevTools rendering panel, take a screenshot at the default `?focus=overview` pose. The screenshot should look intentional (everything settled in a representative pose), not broken (e.g. LEDs all off looking dead, cat at mid-breath looking deflated).
- **No `Glitch` postprocessing effect added.** Already in Out-of-Scope list — but worth re-stating. Glitch is the highest-vestibular-risk effect in the postprocessing library.
- **No pulsing emissive on the bedside lamp.** Bedside lamp emits a fixed warm point light; it doesn't flicker. (Flickering lamp is a thriller trope, not a SOC analyst's room.)

**Warning signs:**
- A new `useFrame` call doesn't reference `useReducedMotion`.
- LED blink frequency overlaps another animation (potential motion-trigger).
- Reduced-motion screenshot looks "wrong" or "broken" rather than "still."
- Reviewer says "ooh, lots of stuff moving" — that means there's lots of stuff moving.

**Phase to address:**
Every phase B/C/D/F that adds an animated element runs the audit + reduced-motion screenshot in VERIFICATION. Phase F (cat) is the most likely to forget because the breathing animation is the cat's *only* feature.

---

### Pitfall 13: Inherited v1.0 phase numbering / ownership confusion

**What goes wrong:**
v1.0 collapsed to 4 phases (1 Foundation, 2 3D shell, 3 Content, 4 Polish). v1.1 starts at Phase 5. v1.1 owns work that conceptually belongs to v1.0 phases — sign-off (was Plan 04-08), write-ups (was Plan 03-06), GLB revisit (was Plan 04-06). When a verification step later asks "did Phase 3 satisfy CNT-02?" the answer is "Phase 3 deferred, Phase X (v1.1) closed it" — which is confusing because Phase X belongs to a different milestone.

Less critically, this causes traceability noise: REQUIREMENTS.md rows currently point CNT-02 → "Phase 3" but Phase 3 didn't complete it. The ownership table needs to reflect v1.1's phase doing the closure.

**Why it happens:**
- Inherited deferrals are a normal artifact of milestone boundaries; the workflow doesn't have a clean "this work topologically belongs to milestone A but executes in milestone B" expression.
- Phase numbering is monotonic by milestone; the deferral relationship is orthogonal.

**How to avoid:**
- **Tag each v1.1 phase with `closes_v1.0:` metadata.** Phase H (sign-off) → `closes_v1.0: [OPS-03, OPS-04, OPS-05, CTC-01]`. Phase I-writeups → `closes_v1.0: [CNT-02, CNT-03]`. Phase I-glb → `closes_v1.0: [3D-08 (path A)]`. Phases A–G → `closes_v1.0: []` (new v1.1 work only).
- **REQUIREMENTS.md traceability table dual-entry.** Add a column "Closed by" alongside "Phase." For CNT-02: Phase = "3 (deferred)", Closed by = "v1.1 Phase I-writeups". Makes the lineage explicit.
- **v1.1 milestone audit reads both v1.0 deferrals and v1.1 new requirements.** Don't lose the inherited items.
- **In the ROADMAP.md narrative for v1.1, group phases into "Inherited from v1.0" and "New v1.1 scope" sections.** Eren-readable, not just metadata-readable.

**Warning signs:**
- A reviewer asks "which phase satisfies CNT-02?" and gets contradictory answers from REQUIREMENTS.md vs. the plan.
- Phase H/I plans don't reference v1.0 REQUIREMENTS IDs.
- v1.1 milestone close fires without confirming v1.0 inherited items are also closed.

**Phase to address:**
Roadmap creation (before Phase A). Tag every v1.1 phase with closes_v1.0 metadata. Update REQUIREMENTS.md traceability column.

---

### Pitfall 14: Cat anatomy & identity implication

**What goes wrong:**
A cat in the scene with no caveat reads as "this is Eren's cat." If Eren doesn't have a cat, the portfolio implicitly states a fact that isn't true. This is in the same family as fabricating lab evidence — it's not technically a security claim, but it's a personal claim that doesn't bear scrutiny. If a hiring manager comments "cute cat — what's its name?" in an interview and there's no real cat, the moment is awkward and Eren either invents a cat-name (small fabrication snowball) or admits the cat is decorative (mild credibility ding). Better to never put the question on the table.

**Why it happens:**
- The cat is set-dressing; the author doesn't think of it as a personal claim.
- Cats are universal enough that it doesn't feel like a strong identity statement.
- "Yatak ve kedi" was user-suggested without an honesty audit attached.

**How to avoid:**
- **`discuss-phase` forcing question for Phase F (cat):** **"Do you have a cat in real life? If no, do you want the portfolio to imply you do? Options: (a) skip the cat, (b) keep it but never refer to it as 'my cat' anywhere in code/copy/alt-text, (c) keep it and acknowledge it's decorative if asked."** Default recommendation if no real cat: option (b) — include the cat, but never personalise.
- **Alt-text neutral.** The drei `<Html>` won't have an alt-text relationship to the cat (cat is procedural geometry, not HTML), but if any prop description / dev comment / commit message references "Eren's cat" or names it, strip those references. Phrase as "decorative cat prop" in code comments.
- **Don't name the cat.** No "fluffy" / "luna" / "tahini" / etc. anywhere.
- **Apply the same rule to bed style.** A specifically-personal bed (bunk, four-poster, futon, particular bedding pattern) implies more about Eren's life than a generic single bed or couch does.

**Warning signs:**
- Code comment says "// Eren's cat" or similar.
- Cat has a name.
- Cat appears on a tooltip / hover label / a11y description as anything other than "cat" / "decorative cat".
- Anyone in code review asks "what's the cat's name?" — that's the audience question that signals the implication landed.

**Phase to address:**
Phase F (cat). `discuss-phase` question above. Apply at planning, not at execution.

---

### Pitfall 15: Bed style implies studio apartment / personal living arrangement

**What goes wrong:**
Tied to Pitfall 6. A bed visible in the same room as the workstation reads as "this is where Eren works AND sleeps" = studio apartment OR student bedroom. Neither is bad in itself; both are personal information the portfolio doesn't need to disclose. The recruiter audience splits — some find it relatable, some downgrade. The 50/50 audience split (recruiters skim, hiring managers engage) means at least one half is at risk.

If Eren is in a multi-room flat in real life and just *likes* the cyber-room genre's bed-in-the-corner trope, the portfolio is over-disclosing in a direction that doesn't match reality. If Eren IS in a studio, the portfolio is accurate but invites assumptions.

**Why it happens:**
- Genre conformity — cyber-room renders often include a bed.
- "Yatak ve kedi" user request was style-driven, not framing-driven.
- The honest-junior framing applies to skills (don't lie about Burp Suite); it should apply equally to lifestyle (don't imply a studio apartment if not).

**How to avoid:**
- **Couch over bed (recommended).** PROJECT.md already lists couch as an option. Couch reads as "I sit here during long study sessions" — a workstation extension, not a sleep area. Lower personal-disclosure surface. Recommended default.
- **If bed: keep it minimal, off-default-view (Pitfall 6), and visually framed as a study spot.** No pillows, no duvet, no decorative bedding.
- **`discuss-phase` forcing question:** **"In your actual living arrangement, do you work in the same room you sleep in? If no: prefer couch to bed; the bed would imply a studio apartment you don't live in."**

**Warning signs:**
- Bed has bedding (pillow, duvet) styled.
- Bed visible at default `?focus=overview` pose.
- Reviewer says "studio apartment vibe" or "student-room vibe."
- Bed is positioned in a way that emphasises rather than de-emphasises it.

**Phase to address:**
Phase E (bed corner). Combine `discuss-phase` question with Pitfall 6 question. Recommend couch by default.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Add every emissive material with `toneMapped={false}` to match neon strip | Strong glow on each new emitter; "consistent" with v1.0 | Cumulative bloom contribution explodes; readability of monitor content drops; can't selectively dial back | Never — only neon strip earned this; new emitters use default tone mapping |
| Hardcode `emissiveIntensity` per-component rather than reference `emissiveBudget.ts` constants | One-line addition during phase execution | No central audit of cumulative emissive load; Pitfall 4 happens silently | Never once Phase B creates `emissiveBudget.ts` |
| Skip OrbitControls clamp re-derivation when walls land | Phase A finishes faster | Camera escapes room geometry at orbit edges; visible "void"; OPSEC-adjacent (user sees scene from outside, reads as broken) | Never |
| Use real photo for window backdrop "just for the mockup, will swap later" | Faster iteration on window prop | Photo gets forgotten and ships; OSINT exposure | Only if the photo is procedural-generated AND the swap is scheduled before merge |
| Skip the 3-second silhouette test on the cat | Cat ships in one iteration | Uncanny-valley cat damages credibility on the whole scene | Never — the cost of a bad cat exceeds the cost of switching to CC0 GLB |
| Defer Phase H sign-off "until after the v1.1 features land" | Feature work isn't blocked | OPS-03/04/05 defer to v1.2; CHECKLIST-LAUNCH stays empty; pre-launch debt accumulates | Never — Phase H gets a calendar date at planning time |
| Include write-ups in v1.1 scope hoping the lab work happens "soon" | Phase plan looks complete; CNT-02/03 looks addressed on paper | Phase deferred at execution time; expectation set then missed; trust drag | Never — write-ups phase gated on labs already started, verified at discuss-phase |
| Re-attempt GLB workstation with the same Poly Haven composite | Closes the partial 3D-08 row on paper | Same revert; budget wasted; same outcome | Only if the approach is fundamentally different (Eren's own Blender model) |
| Skip per-phase size-limit check ("we have lots of headroom") | Phase finishes faster | Budget exhausted by Phase F; Phase G cut at the last minute | Never — log per-phase delta even if under budget |
| Skip `useReducedMotion()` gate on "small" animations | One fewer hook call per component | Reduced-motion users get vestibular triggers; silent regression | Never |
| Name the cat in code comments / commit messages / dev notes | Convenient shorthand | Implies a personal fact about Eren; awkward in interviews | Never — refer to it as "decorative cat prop" in all artifacts |
| Keep `public/assets/workstation/` GLB files for "maybe later" | No deletion needed today | 869 KB in every deploy; clutter; signals indecision | Only if GLB revisit is genuinely in v1.1 scope with Blender commit |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Bloom postprocessing (existing, Plan 04-01) | Add new emitters and re-tune Bloom luminanceThreshold to compensate | Re-tune number of emitters and their `emissiveIntensity`; Bloom config stays Plan 04-01-frozen |
| `useReducedMotion` (existing hook) | Forget to import + check on each new `useFrame` callsite | Per-phase grep audit; reduced-motion screenshot in VERIFICATION |
| `useReducedMotion` (existing hook) | Treat blink-LED as "not motion" because it doesn't translate | Frequency change IS motion for vestibular users; gate it |
| OrbitControls clamps (existing, Controls.tsx) | Add walls without re-deriving clamps | Walls + clamps land in same plan; corner-walk test in VERIFICATION |
| size-limit budgets (existing CI gate) | Cross-component component growth not flagged until close to budget | Log per-phase delta; reserve headroom for later phases |
| Web3Forms delivery (existing, CTC-01 code-side) | Treat the code-side wiring as "done" | Phase H closes the delivery half via real Gmail + Outlook test |
| Canvas-texture (existing pattern in WallDecor) | Re-use the pattern for whiteboard without thinking about texture memory | Cap textures at 1024×1024; ≤ 8 canvas textures total in scene |
| drei `<Html transform occlude>` (existing on monitor) | Add additional `<Html>` overlays (e.g. screen on laptop) for content | Keep `<Html>` to monitor only — content already lives there via 5 tabs; secondary devices can have static emissive screens (no Html needed) |
| MITRE / Kill Chain content on whiteboard | Render text from memory ("I remember the ATT&CK tactics") | Reference the public source URL in canvas-texture code comment; verify against the URL during VERIFICATION |
| GLB asset deploy weight | Forget `public/assets/workstation/` GLBs in deploy if not used | Delete the files or add to the Pages-artifact exclusion list |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Multiple `useFrame` callbacks per blinking LED | Frame time inflates with LED count | Single shared `useFrame` clock; LEDs read phase from a uniform | At ~16 LEDs with individual `useFrame` (Phase B server rack) |
| High-res canvas textures recreated on every render | Memory blip + GC pauses on mount | `useMemo` the texture (already done in WallDecor); dispose on unmount (already done) | Whiteboard re-created on every render of Phase C |
| New point lights for every emitter | Real-time shadow cost explodes if shadows enabled | Cap point lights at ~8 scene-wide (Three.js soft limit per Lighting.tsx comment); use emissive materials + Bloom for "glow without light" | At ~10 point lights with shadows enabled |
| Adding `castShadow` / `receiveShadow` on every new mesh | Shadow map regenerates each frame; perf cliff | Only the desk + chair + cat + bed need shadow participation; walls do `receiveShadow` only; props (books, cables, HDD) don't shadow at all | At ~15 shadow-casting meshes |
| Wall planes single-sided + ambient occlusion attempted | AO fails to compute in corner geometry; visible bands | Two-sided walls OR no AO on walls (procedural scene doesn't need AO) | Phase A wall material setup |
| Postprocessing chain modified | Visible vs. v1.0 baseline | Don't modify; the chain is Plan 04-01-frozen | Any time bloom config touched outside Plan 04-01 |
| Lazy-loading more than the 3D chunk | Initial paint regression on `?view=3d` direct entry | Phase G (secondary devices) is the only candidate for further lazy-load; gate on actual budget pressure | If 3D chunk exceeds 350 KB gz (78% of budget) |

## Security Mistakes (cyber-portfolio specific)

| Mistake | Risk | Prevention |
|---------|------|------------|
| Real CVE IDs / Sigma rules on whiteboard implying Eren investigated them | Career-damaging fabrication signal | Use MITRE ATT&CK framework cells only; or generic study-queue todo list with no specifics |
| Real IPs (non-RFC-5737) on network-diagram whiteboard content | Implies privileged knowledge or fabricates one; latter is fabrication, former is OPSEC | Use RFC 5737 documentation IPs (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24) exclusively |
| Photo of real neighbourhood through the window | OSINT location leak; narrows to neighbourhood when only city was disclosed | Procedural shader / abstract / generic; verify in CHECKLIST-OPSEC |
| Real book spines visible via photo / texture revealing personal library | Light personal inference; possibly identifies specific cyber-textbook ownership matched to a known purchase trail | Use procedural book spines with generic / topical titles ("Practical Malware Analysis", "The Linux Programming Interface") — books that are common enough that ownership doesn't identify; never specific copy / sleeve |
| Visible passwords / tokens / "demo" credentials on whiteboard or monitor | Recruiter screenshot tweeted; even fake creds in real screenshots create awkwardness | No credential-shaped strings anywhere on visible surfaces; if you need to show a CLI, use `<your-token>` placeholder syntax |
| Fake "incident in progress" theatre | Cliché flagged in v1.0 Out-of-Scope; signals genre-naïveté to technical hiring managers | Whiteboard shows learning content (frameworks, queue), not theatre |
| Cat / bed details revealing real-life specifics | Adjacent OSINT-by-inference (specific cat breed, specific bed style → narrows demographic) | Generic procedural; never named; no personally-identifying decor |
| GLB workstation files deploy weight | Not security — but 869 KB deploy bloat with no `src/` references is suspicious of "leftover from a deleted feature", inviting questions in code review | Delete or formally archive `public/assets/workstation/` if GLB revisit is skipped |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Default `?focus=overview` camera includes bed + cat in frame | Recruiter does 30s skim, mentally files Eren as "studio apartment / personal vibe" before reading CV | Bed + cat at azimuth requiring deliberate drag past default; default frame is workstation-only |
| All 5 tab focus poses end up inside-the-room views obstructed by walls or props | User clicks a tab and the camera lands behind a wall | Re-test every tab pose after walls land (cameraPoses.ts) |
| Server rack at default view dominates over monitor visually | Monitor (the content) gets less attention than the prop | Rack at far/scale-disadvantage position; smaller angular size than monitor at default |
| Whiteboard text too small to read at default view + too detailed to read at tab focus | User can't engage with the prop's content | Whiteboard text is *visible motif* at default (recognise it's a kill chain), readable at deliberate camera focus on the whiteboard (optional tab? or just OrbitControls drag) |
| Cat breathing animation is the most-moving element in the scene | Eye drawn to cat instead of monitor | Subtle amplitude (±2% scale, 0.5 Hz); doesn't out-compete monitor's cursor blink |
| Reduced-motion users see a "dead" scene (everything frozen mid-pose) | Looks broken | Static representative poses for everything — LEDs at chosen pattern, cat at neutral, clock at static time |
| Secondary device (laptop, SDR) screen shows fake interface | Same fabrication risk as whiteboard; reads as theatre | Static dark screen with cyan glow only; OR a real public CLI prompt (`$` on a single line); no fake dashboard / output |
| Door prop hints at an exit / clickable destination that goes nowhere | User clicks expecting interaction | Doors are visually closed; not interactive; tooltip says nothing |
| Plant added "for warmth" reads as Mediterranean / specific botany style | Personal-identity inference (small but non-zero) | Generic snake plant / pothos / cactus silhouette; no flowering specimen |

## "Looks Done But Isn't" Checklist

- [ ] **Walls landed:** Often missing OrbitControls clamp re-derivation — verify camera can't escape the room at orbit envelope corners.
- [ ] **Server rack landed:** Often missing `useReducedMotion()` gate on LED blink — verify reduced-motion screenshot looks intentional.
- [ ] **Whiteboard landed:** Often missing public-source citation for every text element — verify code comment lists URL for each cell.
- [ ] **Bias-light + LED strip landed:** Often missing `emissiveBudget.ts` reference — verify centralised constants used.
- [ ] **Bed landed:** Often missing default-view exclusion check — verify `?focus=overview` screenshot doesn't include bed.
- [ ] **Cat landed:** Often missing 3-second silhouette test — verify with a fresh viewer it reads as cat.
- [ ] **Cat landed:** Often missing reduced-motion gate on breathing — verify `prefers-reduced-motion: reduce` freezes the cat.
- [ ] **Window backdrop:** Often missing procedural verification — verify no real-photo content, no recognisable buildings.
- [ ] **Secondary devices:** Often missing fake-content rule — verify static screens, no fake dashboards.
- [ ] **All tab focus poses:** Often missing re-test after room shell — verify GSAP camera lands inside the room for all 5 tabs.
- [ ] **size-limit:** Often missing per-phase delta log — verify cumulative 3D chunk size still leaves Phase G room.
- [ ] **Pre-launch sign-off:** Often missing OPS-03/04/05 row completion — verify every `___` in CHECKLIST-LAUNCH.md is filled before milestone close.
- [ ] **Web3Forms delivery (CTC-01 delivery half):** Often missing real-inbox confirmation — verify Eren has Gmail + Outlook test message screenshots.
- [ ] **REQUIREMENTS.md 3D-08 row:** Often missing update after GLB decision — verify "Path A deferred or shipped, current state explicit."
- [ ] **`public/assets/workstation/` GLBs:** Often missing deletion / formal archive — verify deploy artifact size or that files are intentionally retained.
- [ ] **Write-ups CNT-02/03:** Often missing real-lab provenance — verify each `.mdx` cites a real lab run or is honestly labelled "study notes from [public source]."
- [ ] **Procedural cat:** Often missing identity-implication guard — verify no code comment / commit message / alt-text personalises the cat.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Visual-overload / RGB battlestation feel | MEDIUM — design rework, not code | Inventory all emitters in `emissiveBudget.ts`; pick 2 to disable; A/B screenshot vs. v1.0 baseline; commit the reduced version |
| Whiteboard fabrication shipped | HIGH — credibility hit (potentially career-damaging) | Hotfix: revert whiteboard prop to a placeholder (e.g. ATT&CK framework only); commit + redeploy same day; no public acknowledgement needed unless asked |
| Cat reads as alien | LOW — swap to CC0 GLB | Pull a CC0 low-poly cat from Poly Pizza; replace primitive cat; one commit |
| Bloom blowout / monitor unreadable | LOW–MEDIUM — emissive intensity dial-back | Identify the 1–2 emitters added since last good baseline; lower their `emissiveIntensity` 50%; A/B screenshot |
| OPSEC leak via window content | HIGH if discovered, MEDIUM to fix | Replace with procedural shader immediately; reverse-image-search the live screenshots to confirm no archival exposure |
| OrbitControls clip through wall | LOW — tighter clamps | Re-derive clamps from room dimensions; PR + verify corner walk |
| Phase H sign-off didn't happen | MEDIUM — recurring failure mode | Schedule a hard date; clear calendar; lower friction; if still doesn't happen, accept that v1.1 ships gaps_found just like v1.0 and re-defer to v1.2 with a documented deadline |
| Write-ups phase deferred again | LOW — honest reframing | Update plan to "study notes" path with one public-lab citation, OR honestly defer to v1.2 with a calendar commitment |
| GLB workstation V2-3D-01 re-reverted | LOW — accept procedural as final | Update REQUIREMENTS.md 3D-08 row; delete `public/assets/workstation/`; close V2-3D-01 as "won't fix — procedural is the chosen aesthetic" |
| Size-limit budget exhausted mid-Phase F | MEDIUM — lazy-load Phase G | Move Phase G (secondary devices) behind dynamic import flagged by `?advanced=true` URL param |
| Reduced-motion regression | LOW — gate the missed animation | Add `useReducedMotion()` check; re-verify reduced-motion screenshot |
| Bed reads too personal | LOW — reposition or swap to couch | Move bed beyond default-view azimuth; or swap to couch (same primitive composition with different proportions) |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Visual-overload / RGB battlestation | Phase D (warmth touches) primarily; Phase B (rack LEDs) secondary | Per-phase cumulative screenshot vs. v1.0 baseline; ≤ 4 hues rule check |
| 2. Whiteboard fabrication | Phase C (wall content) | Per-element public-source citation in code comment; QA re-reads at full zoom; `discuss-phase` forcing question |
| 3. Cat alien / Cthulhu | Phase F (cat) | 3-second silhouette test with fresh viewer; pre-committed CC0 fallback |
| 4. Bloom blowout | Phase B (rack LEDs) bootstraps `emissiveBudget.ts`; Phase D (bias-light + LED strip) is largest-area emitter | Per-tab readability screenshot; cumulative emissive budget tracked |
| 5. Window OPSEC leak | Phase A (room shell) | CHECKLIST-OPSEC row "window backdrop is procedural / abstract"; `discuss-phase` forcing question on source |
| 6. Bed + cat overshare | Phase E (bed) + Phase F (cat) joint | Default-view screenshot excludes bed; `discuss-phase` audience-framing question |
| 7. OrbitControls clip | Phase A (room shell) — same plan that lands walls | Orbit envelope corner walk in VERIFICATION; 5-tab focus pose re-test |
| 8. Sign-off defers indefinitely | Phase H (pre-launch sign-off) | CHECKLIST-LAUNCH.md fully populated; milestone-close gate on every `___` filled; pre-scheduled date |
| 9. Write-ups blocked by no-lab-work | Pre-Phase I-writeups (`discuss-phase`) | "Have you started the labs?" forcing question; defer to v1.2 if no |
| 10. GLB revisit same outcome | Phase I-glb (or skip) | Blender-commitment `discuss-phase` question; pre-committed abort criterion |
| 11. Size-limit budget creep | Every phase A–G includes size-limit log | Per-phase delta logged; Phase G headroom reserved |
| 12. Reduced-motion gating gaps | Phases B / C / D / F (all animated) | Per-phase `useFrame` grep audit; reduced-motion screenshot |
| 13. v1.0 inherited phase ownership confusion | Roadmap creation (before Phase A) | `closes_v1.0:` metadata on each v1.1 phase; REQUIREMENTS.md traceability column |
| 14. Cat identity implication | Phase F (cat) | `discuss-phase` question on real-life cat; code-comment audit (no personalisation) |
| 15. Bed studio-apartment implication | Phase E (bed) | `discuss-phase` question on couch vs. bed; recommend couch default |

## Sources

- `.planning/PROJECT.md` (project value, audience split, anti-feature list)
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md` (4 unsatisfied requirements + 2 partials; deferral history)
- `.planning/milestones/v1.0-REQUIREMENTS.md` (Out-of-Scope table — anti-feature canon; CNT-02/03 and OPS-03/04/05 lineage)
- `~/.claude/projects/-Users-erenatalay-Desktop-App-Portfolio-Website/memory/feedback_no_fabricated_lab_evidence.md` (no-fabrication binding rule; Plan 03-06 override 2026-05-08; pushback playbook)
- `src/scene/WallDecor.tsx` (canvas-texture pattern; neon strip `emissiveIntensity 2.0`, `toneMapped:false`)
- `src/scene/Controls.tsx` (`ORBIT_CLAMPS` baseline: polar π/3–100°·π/180, azimuth ±π/2, distance 1.2–4.0)
- `src/scene/Lighting.tsx` (existing ambient + directional + 2 point lights; "Three.js handles up to ~8 point lights" comment)
- `src/scene/Workstation.tsx` (current composition — Floor + Desk + Monitor + Lamp + Bookshelf + DeskDecor + WallDecor + Chair)
- MITRE ATT&CK Enterprise framework (public, https://attack.mitre.org/)
- Lockheed Martin Cyber Kill Chain (public)
- RFC 5737 (documentation IP ranges) — for any IP shown in scene
- drei `<PerformanceMonitor>` + `@react-three/postprocessing` Bloom documentation
- v1.0 Plan 04-01 postprocessing pipeline + Plan 04-06 GLB revert commit `342d2e7` (project history)

---
*Pitfalls research for: v1.1 Room Build-Out + Pre-Launch Close*
*Researched: 2026-05-15*
