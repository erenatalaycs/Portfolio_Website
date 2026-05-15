# Feature Research — v1.1 Room Build-Out + Pre-Launch Close

**Domain:** Cyber-analyst "hacker room" 3D portfolio scene (procedural primitives, R3F 9.6 / drei 10.7 / three 0.184, no new deps expected for A–G)
**Researched:** 2026-05-15
**Confidence:** HIGH for A–F (procedural-primitive composition is well-trodden in R3F); MEDIUM for G (secondary devices risk visual clutter); HIGH for H–I (checklist + provenance pattern already established).

## Inherited Anti-Feature List (binds v1.1, no exceptions)

From `v1.0-REQUIREMENTS.md` Out of Scope, reaffirmed for every new surface in v1.1:

| Anti-feature | Why it's banned (still) |
|--------------|-------------------------|
| Matrix code rain on window / monitor / wall | Top recruiter-side cliché; signals "doesn't get the field" |
| Padlock / shield / glowing-binary icons on whiteboard or poster | Recruiter-side anti-pattern; show real tool output instead |
| Hooded-hacker silhouette on wall, poster, or as cat-replacement avatar | Cliché; clashes with credible junior framing |
| Fake "hacking in progress" / "RED ALERT" / "BREACH DETECTED" labels on monitors, server rack, or whiteboard | Fabrication; can't reconcile with honest junior positioning |
| Fake interactive password prompt on the laptop / secondary devices | Gimmick; breaks on first attempt |
| Fake security dashboard with random numbers on second monitor or SDR readout | Implies experience that isn't real |
| Custom cursor over the 3D canvas | Accessibility violation |
| Auto-playing ambient sound (server hum, keyboard clicks, cat purr) | Universal anti-pattern; opt-in only if ever added |
| Pure-black + saturated-pure-green text on whiteboard / poster textures | WCAG AA failure (same rule as v1.0) |

**Additional v1.1-specific anti-features to add:**

| Anti-feature | Why bad | Alternative |
|--------------|---------|-------------|
| Real-looking fake employer logos on the whiteboard / poster | Implies prior work that isn't real; reputation-damaging in cyber | Use ATT&CK tactic names or kill-chain step names (publicly cited, no claim made) |
| Animated "fingers typing" on the keyboard | Uncanny; reads as gimmick | Static keyboard is fine; backlight already implies "live" |
| Cat with hooded-hacker hat / wearing glasses staring at monitor | Cliché on top of cliché | Just a cat; the room makes it a hacker's cat |
| Window showing daylight | Breaks the dark-night terminal aesthetic established in v1.0 | Night-city silhouette with sparse warm window lights (table stakes below) |
| Bookshelf books with vendor-cert names spelled out as titles (CISSP, OSCP, etc.) | Implies certifications not yet earned (Eren is in-progress); fabrication-adjacent | Abstract O'Reilly-style monochrome spines or topical labels (Networking, Detection, Linux) |
| Animated cat tail wag / blinking eyes / head turn | Cute, but adds per-frame consumer the perf budget didn't account for | Sine-scale breathing only, ≤0.5 Hz, gated by reduced-motion |
| Second monitor with always-changing tcpdump-style scroll | Reads as "fake terminal" anti-pattern; same problem as v1.0 | Static frame on the second monitor (closed lid / sleep glyph / system-info readout) |

## A. Room shell (walls + ceiling + window + door + ceiling light)

### Table stakes

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| 3 wall planes (back, left, right) | A "room" without walls is a stage set; current scene reads as floating-in-void | LOW | Three thin boxes; UV-mapped flat material with subtle roughness; reuse `SCENE_COLORS.bg` family slightly desaturated for "wall paint" vs "floor" |
| Ceiling plane | Without it, top-down ambient light leaks unrealistically; current scene works because we've avoided that camera angle, but adding a window forces ceiling | LOW | One plane at y ≈ 2.4–2.7 m; receive shadow off (cheap); slightly lighter than walls so the eye reads it as ceiling not "back wall above" |
| Window (back wall, behind bookshelf-adjacent area) with night-city backdrop | A hacker's room without a visible "it's 2 a.m." cue feels generic; window is the strongest signal that the rest of the lighting is intentional (cool ambient + warm lamp = "screen-lit at night") | MEDIUM | Static night-photo plane is overkill (asset bloat + OPSEC review for any real photo); **recommended:** procedural canvas-texture backdrop — dark navy gradient + 30–60 small warm point-light "windows" rendered as tiny rects, distant skyline silhouette as flat rectangles at varying heights. Renders once, no per-frame cost. ~50–100 KB canvas baked into a single `<planeGeometry>` behind blinds. |
| Window blinds (horizontal slats) | The window without blinds looks like a portal; blinds add depth + character + casts implied stripe shadows that bloom can pick up | LOW-MEDIUM | Stack of ~12–16 thin `<boxGeometry>` slats; tilt all uniformly with slight rotation variance (~±2°) so it doesn't read as CAD-perfect. Half-open recommended (every other slat tilted slightly more — eye reads as "real blinds someone partly closed"). |

### Differentiators

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Subtle window parallax on mouse drag (city plane offset by 1–2% of orbit delta) | Sells the "real window" illusion for less than a frame of CPU work | LOW | One `useFrame` reading `camera.rotation.y`, translating the city plane laterally with a max-clamp. Gate by reduced-motion. |
| Door on left or right wall (closed, with thin frame + handle + faint under-door light strip) | Cheap room realism; suggests "Eren can leave this room, this is his workspace not his whole life" — humanizing | LOW | Box for door + thin frame + a small `coneGeometry` or `cylinderGeometry` handle; optional ~0.005 m emissive line at the bottom edge implies hallway light. Static, no interaction. |
| Ceiling light (off — fixture only, not lit) | Detail that completes the ceiling; explicitly OFF is more cyber-correct than on ("I work by monitor light") | LOW | Single `<cylinderGeometry>` flush mount or pendant; no light source attached. |

### Anti-features (A)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| Skybox / HDRI environment map for outside-window content | "Realistic" outdoors | Asset bloat (10 KB → MB), CSP review, breaks the dark-room aesthetic, increases TTI | Procedural canvas-texture night city |
| Animated city traffic / blinking aircraft warning lights | "More alive" | Per-frame consumers add up; recruiter doesn't notice; nausea risk if too rhythmic | Static city; subtle parallax is enough |
| Curtains in addition to blinds | "Cozier" | Two layers of geometry occluding the same space; one is enough | Blinds only |
| Open door showing hallway content | "Tell more story" | Demands modeling a second space; LOD nightmare | Closed door, under-door light hint |

### LOD answer for "real window"

A static canvas-texture backdrop on a single plane, framed by procedural blinds, with optional ±2% parallax on camera orbit, reads as a real window inside a focused-camera-distance scene. Skybox/HDRI is overkill; an animated cityscape is uncanny. The reason this works: in v1.0's two camera poses (overview at `[1.4, 1.6, 1.6]`, focused at `[0, 1.20, 0.85]`), the window plane is at most ~2.5 m from the camera — the human eye stops resolving individual building details at that distance against a dark scene. **No skybox needed. ≤100 KB CanvasTexture is the win.**

## B. Cyber detail (server rack, cable bundle, external HDD tower)

### Table stakes

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Mini server rack frame (1U switch + 1–2U device) on floor or low shelf | A "hacker room" without any rack-mount kit is a gamer's room; this is THE strongest visual cue that the scene's owner does network/security work | MEDIUM | Open-frame rack: 2 vertical `<boxGeometry>` posts + 4 cross-rails = 6 primitives. ~0.20 × 0.35 × 0.20 m. Place beside the tower PC or under-desk-left. |
| 1U switch with port indicator LEDs | A switch *is* the rack; ports are how a recruiter recognizes one at a glance | LOW-MEDIUM | A thin box (1U = 4.45 cm; use 0.045 m height). Front face: 8–16 small dark plane rects ("ports") with tiny emissive squares above ("link LEDs"). 1–2 ports green-emissive, rest dark — reads as "real switch with some links up." |
| Raspberry Pi cluster (2–4 stacked Pis with link LEDs) | Pi clusters are the home-lab signal in 2025–2026; the "I run my own SIEM at home" aesthetic | MEDIUM | 4 stacked thin boxes (0.085 × 0.005 × 0.056 m — Pi 5 footprint), each with 1–2 emissive dots. Optional spacer cylinders between. Sells "I built this" more than a single monolithic appliance. |
| Cable bundle (rear of rack / under desk → tower → rack) | Untidy cables = real lab; CAD-perfect cables = render artifact | LOW-MEDIUM | 2–3 cubic Bézier curves rendered via `<tubeGeometry>` or `drei <CatmullRomLine>` with low segment count (8–12). Dark color. Drape from rack rear to under-desk. Don't try to make them look "cable-managed" — slight slump = realism. |
| External HDD tower (small upright drive with chassis LED) | The "I have lab data I keep on bare metal" signal; common cyber-room object | LOW | Small upright box ~0.05 × 0.10 × 0.10 m with 1 emissive LED. Place next to tower PC or on top of desk corner. |

### Server rack LED blink rate (honest answer to design Q3)

Real server hardware (Oracle, HPE, Intel docs all converge on this):
- **Slow blink @ 1 Hz** — activity / boot-in-progress (~0.5 s on, 0.5 s off)
- **Fast blink @ 2 Hz** — data transfer (link active under load)
- **Single-flash heartbeat** — `0.1 s on, 2.9 s off` — standby / "system alive but idle"
- **Solid on** — link up, no traffic

**Recommendation for the v1.1 scene:**
- 1–2 switch port LEDs at the **fast 2 Hz "link active" rhythm** with subtle desync (random per-LED phase offset 0–500 ms) to avoid uniform-marching-light look
- Pi cluster activity LEDs at the **slow 1 Hz** "doing work" rate, also desynced
- One LED somewhere at the **0.1 s / 2.9 s heartbeat** — that single slow "thump" is what reads as "this is a real lab" to anyone who's seen actual rack equipment
- Tower PC front LED solid (already in v1.0 DeskDecor — keep)
- HDD chassis LED at 1 Hz when the cat is on the bed (i.e. when scene is "in use") — but that's gimmicky; just leave it solid.

**Implementation:** single `useFrame` consumer reading `state.clock.elapsedTime`, looking up phase per LED from a static const array of `[freq_hz, phase_offset_s, duty_cycle]`. ~8–12 LEDs total → one `useFrame` callback, zero state mutations, no React re-renders. Reduced-motion gate forces all LEDs to solid emissive. Performance gate (existing `<PerformanceMonitor>`) can drop them to solid too.

### Differentiators (B)

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Velcro / zip-tie loops around the cable bundle | The kind of detail that makes someone who runs a homelab nod | LOW | Tiny `<torusGeometry>` rings every 10–15 cm along the cable curve |
| Visible Cat6 patch cables in distinct colors (one yellow, one blue) | Color coding = "this person actually labels their cables" — operational hygiene signal | LOW | Two of the bundle curves get distinct colored materials |
| Mini rack-mount label tape strip ("CORE" / "LAB") on the switch front | Hand-labeled gear = home lab realism | LOW-MEDIUM | Small CanvasTexture on a tiny plane glued to the switch face |

### Anti-features (B)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| 42U full rack with 10 servers | "Looks more impressive" | Eren is a junior — this overshoots his honest framing; recruiters see through it | Small 4–6U open frame matches "home lab" reality |
| Animated scrolling text on the switch's "display" | "More activity" | Fake terminal anti-pattern in another costume | Static LEDs at honest rates |
| Cable spaghetti so dense it covers the rack face | "Edgy realism" | Reads as "I can't manage cables" — opposite of the signal | Sparse, somewhat-tidy bundle |
| Multi-colored RGB-fan glow on the tower PC | "Hacker aesthetic" | Reads as "gamer rig" not "analyst rig"; conflicts with the cool-cyan palette | Cyan-only accent (already in DeskDecor.tsx) |

## C. Wall content (whiteboard + ATT&CK / kill chain + analog clock + framed cert)

### Table stakes

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Whiteboard with cyber framework content | The wall is currently empty above the bookshelf; a whiteboard is the standard "thinker's tool" object that lets us communicate domain knowledge without faking screens | MEDIUM | One plane (~1.0 × 0.7 m) with a thin frame box. Canvas-texture content baked once. Slightly off-white surface (not pure white) so it doesn't blow out under Bloom. |
| Wall clock (analog) showing a "late night" time (~2:17, 3:03, etc.) | Universal signifier of "this person works late"; cheap detail with strong narrative payoff | LOW | Circle plane + 12 tick marks + hour/minute hands as thin rectangles. Static (no ticking — anti-clutter + reduced-motion friendly). Choose a fixed off-the-hour time so the eye trusts it's "real-looking" not stock. |
| Framed certificate or poster (one only, named honestly) | A single hung-up frame on a wall = "I'm proud of this." Earned cert (TryHackMe path completion, BTLO progress) is a credibility signal; in-progress cert is honest. | LOW | Wall poster pattern is already established in WallDecor.tsx — reuse `usePosterTexture()` with different content. |

### ATT&CK matrix vs kill chain (honest answer to design Q2)

**At 2–3 m camera distance with a 1.0 × 0.7 m whiteboard plane, the readable text height limit is ~14–18 px on a 1024×716 CanvasTexture. Math:**
- Texture resolution: 1024 px wide on a 1.0 m plane → 1024 px/m
- Camera at ~2 m, screen at ~1080 px height → resolved pixels per world meter ≈ 540 px/m
- That means a 14 px texture char renders as ~7 screen px → barely-readable at static, illegible at motion blur
- Practical readable label: 20–28 texture-px chars → ~10–14 screen px → readable when focused on whiteboard

**Recommendation: kill chain timeline (7 steps), NOT the full ATT&CK matrix.**

Why:
1. **Real ATT&CK has 14 enterprise tactics × dozens of techniques.** Even a "5×5 abbreviated matrix" would be 25 cells of ~3–4 word labels — at the texture resolution above, only the cell *headers* would read. The technique chips inside would be unreadable noise.
2. **The Lockheed Martin Cyber Kill Chain is 7 steps in a single linear sequence** (Reconnaissance → Weaponization → Delivery → Exploitation → Installation → C2 → Actions on Objectives). 7 large-font labels in a horizontal line = recruiter-readable at 2–3 m, and any cyber person recognizes the structure in 1 second.
3. **An abbreviated ATT&CK column list** (Initial Access → Execution → Persistence → Privilege Escalation → Defense Evasion → Credential Access → Discovery — 7 tactic columns) is also a fine alternative — also 7 labels, same readability budget. Pick this if ATT&CK is more on-brand than the older kill chain (it is, for SOC / detection work, which Eren wants).

**Decision: 7-column abbreviated ATT&CK tactic list rendered as labeled chips along the top of the whiteboard, with ONE column highlighted (e.g. "Persistence") and a single hand-drawn-looking annotation arrow + short note next to it ("→ scheduled tasks, registry run keys").** This shows:
- Eren knows ATT&CK tactic vocabulary (recruiter signal: ✓)
- He doesn't claim to know every technique (honest junior framing: ✓)
- The whiteboard reads as "in-progress study notes," not a fake briefing room (anti-fabrication: ✓)

**Anti-features in whiteboard content (specific):**
- No "RED ALERT" / "BREACH DETECTED" / "INCIDENT IN PROGRESS" text — that's fabricating an incident
- No real company names ("Last week's Acme attack...") — pure fabrication, defamation-adjacent
- No CVE numbers without context — looks like cargo-cult labeling
- No fake IPs / domains in scribbles — OPSEC train wreck
- No Matrix-rain doodles or `</hack>` graffiti — same anti-feature list as everywhere

**Style decision: hand-drawn marker look** (slightly irregular line weight, faint smudge texture) over printed-grid. Reads as "Eren actually thinks here" vs "Eren pasted a slide." Implementation: CanvasTexture with `ctx.lineWidth` jitter and 2–3 alpha-blended "eraser smudge" passes. Faint grid (5–10% opacity) underneath is fine; full printed grid kills the hand-thought feel.

### Differentiators (C)

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Marker tray under the whiteboard with 2–3 colored markers | The detail that makes it read as a real whiteboard, not a poster | LOW | Thin box + 2–3 cylinders |
| Wall clock hands at a "tells a story" time (e.g. 02:47) | Tiny narrative depth | LOW | Just pick the time deliberately; document the choice |
| Framed certificate hung slightly crooked (~2° rotation) | Reads as "lived-in"; CAD-perfect is the giveaway that nothing here is real | LOW | One value in the rotation prop |
| Sticky note (one) on the whiteboard with a single TODO line | Reads as "this person actually uses this" | LOW | Yellow plane + short text via the same CanvasTexture helper |

### Anti-features (C)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| Full 14-column × 80-row ATT&CK matrix attempt | "Comprehensive" | Illegible at any camera distance under the perf budget | 7-tactic column header strip only |
| Ticking clock animation | "More alive" | Adds per-frame consumer + ticking-second is a sound association people *imagine* hearing, which is unsettling without audio | Static clock |
| Multiple framed certificates (5+) | "More credentials" | Eren is in-progress on most certs — implying earned ones he hasn't is fabrication | One frame max, honestly labeled |
| Whiteboard with corporate ATT&CK Navigator screenshot pasted as canvas-texture | "Looks legit" | Reads as Eren claiming ownership of someone else's work | Hand-drawn-style notes that are clearly his own |

## D. Warmth touches (books, plant, bias-light, under-desk LED strip)

### Table stakes

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Real book spines on bookshelf | Current Bookshelf.tsx is empty shelves; this is the single biggest "humanize this room" win, low cost. A hacker without books reads as a stock asset | LOW-MEDIUM | 6–12 thin `<boxGeometry>` spines per shelf, varying heights (15–24 cm), 2.5–4.5 cm widths, varying colors. Optional CanvasTexture for title strips (or none — abstract spines work; recruiters won't read titles from 2 m). |
| Small potted plant | Humanizes the room more than any tech detail can. Universal "lived-in" signal. | LOW-MEDIUM | See plant question Q7 below. |
| Screen bias-light (faint glow behind monitor on back wall) | Real monitor-bias lights are well-known in coding/streaming circles; reads as "this person knows about eye strain" — domain-adjacent operational hygiene | LOW | A single emissive plane on the back wall behind the monitor, cyan-cool to match the existing palette, lower intensity than the neon strip (e.g. 0.3 vs 2.0). Bloom picks it up softly. |

### Differentiators (D)

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Under-desk LED strip (warm or cyan accent, faint) | "Streamer/dev desk" detail; signals "this person tweaked their setup" | LOW | Thin emissive plane on bottom edge of desk underside, low intensity. Use cyan to match existing palette, OR warm to balance the lamp's amber (slight tension is intentional, reads as "two zones of light"). |
| Plant slightly leaning toward window (phototropism) | Recruiter probably won't notice; cyber person who has a plant will appreciate | LOW | Small rotation on the plant group toward the window plane |
| Stack of 1–2 books lying flat on top of the bookshelf | Reads as "actively reading these, not yet re-shelved" | LOW | Two `<boxGeometry>` slabs on the top shelf |
| Empty mug + bonus mug ("yesterday's coffee") | The detail that lands "this person is here a lot" | LOW | Already have one mug in DeskDecor; add a second offset to the rear of the desk |

### Plant choice (honest answer to design Q7)

**Recommendation: snake plant (Sansevieria).** Reasoning:
- **Pothos (vine):** Vines need to drape — that's modeling complexity. Procedural vines look like geometric noodles. Tendrils require curves with materials → high asset cost for "leafy" read.
- **Cactus:** Easy to model (`<sphereGeometry>` + small cone spines) but reads as "joke plant" / "lazy office cliché." Slightly the wrong vibe for a cyber room.
- **Snake plant:** Sword-shaped leaves are *literally* `<boxGeometry>` rotated slightly with vertical taper or just `<planeGeometry>` two-sided. 5–7 leaves at varying rotations + a pot = ~8 meshes. Reads instantly as "houseplant." Snake plants are also the actual most popular low-maintenance plant in 2020s tech-worker homes — accidentally realistic.

**Implementation:**
- Pot: `<cylinderGeometry>` with radius taper (`r_top = 0.05`, `r_bottom = 0.04`, `h = 0.07`), terracotta-warm color (sneaks subtle warmth into the cool palette)
- 5–7 leaves: each `<boxGeometry>` (0.012 × 0.20 × 0.005 m) rotated `[Math.PI/8 * (slight random), Math.random()*PI*2, 0]`, slight vertical taper via custom geometry or just accept the constant-width look (snake plant leaves are actually fairly uniform width)
- Color: muted green `#5a7d4b` with some variation per leaf
- Soil: tiny `<cylinderGeometry>` cap at pot top, dark brown

Drei does not have a plant helper. There's a `drei <Float>` for gentle hover-animation but that's wrong for a plant. **Build manually.**

Place on the bookshelf (top shelf) or on the windowsill / nightstand — both are good homes. Decide based on composition.

### Anti-features (D)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| Realistic photorealistic plant via GLB | "More plant-like" | Asset bloat for one detail; foliage GLBs are typically 200 KB+ | Procedural snake plant per spec above |
| Animated leaves swaying | "More alive" | No wind source in the room makes it look haunted | Static |
| Books with real photo-textured spines (covers of actual books) | "More recognizable" | Copyright surface + OPSEC review + asset bloat | Abstract colored spines OR CanvasTexture topic labels (Linux / Networking / Detection) |
| RGB-changing bias light | "Cool" | Distracting on every viewing; defeats the bias-light purpose | Static cool cyan |

## E. Bed corner (bed + nightstand + bedside lamp)

### Table stakes

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single bed (or daybed) fitting one corner of the room | The "yatak ve kedi" addition; this is what makes the room a *room someone lives in* rather than an office. Adds vulnerability + honesty (Eren is job-hunting and his workstation is part of his bedroom — that's the truth for many juniors). | MEDIUM | Box base for mattress + base. Roughly 0.9 × 0.4 × 1.9 m for a single. Pillow as second box (0.5 × 0.15 × 0.4) at the head end. Duvet as a slightly larger flatter box on top of the mattress. |
| Nightstand | Bed without nightstand = mattress-on-floor vibe (different connotation); nightstand reads as "set up properly" | LOW | Small box (~0.4 × 0.5 × 0.4 m) beside the bed. Optionally with a drawer line. |
| Dim bedside lamp (emissive bulb only when lit; here, OFF) | Mirrors the desk lamp aesthetic; OFF state reinforces "the desk is the only light source in this scene" | LOW | Same Lamp.tsx pattern but smaller; emissive intensity 0 or 0.1 (vs desk lamp's 2.0). Optionally retain a tiny "warm filament glow" for character. |

### Bed style decision (honest answer to design Q5)

**Recommendation: unmade bed, single bed, NO headboard with reading light.**

Why:
- **Unmade > neatly made.** A neatly made bed reads as "hotel" or "show home" — uncanny in a working person's room. Subtle un-made-ness (duvet slightly rumpled, pillow not perfectly aligned) reads as "this person was actually here." Implementation: duvet box has a `[Math.PI * 0.03, 0, 0]` rotation and is slightly offset from center. One pillow rotated ~10°.
- **Single bed > daybed/couch.** Daybeds + couches read as living rooms or studio apartments. The cyber-room aesthetic is more honest as a bedroom (which most junior tech workers in the UK actually have — UK rental market is mostly small flats / shared houses for juniors). Daybed adds modeling complexity (armrests + back). Single bed is 4 boxes.
- **No headboard with reading light.** Headboards add visual mass that competes with the bookshelf. A reading light on the headboard would be a third light source competing with desk lamp + neon strip + ceiling-off pendant — too many. Bedside lamp on the nightstand serves the same narrative function with less geometry.
- **Monitor-light glow on the bedding** is a great differentiator (below) — DO NOT model an actual light glow on the bed via emissives. Instead, use the existing cyan point light + lamp warm point light positioned such that they spill onto the duvet naturally. That's authentic to how a real monitor-lit bedroom looks.

### Differentiators (E)

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Slight "shaped to a body" indentation in the duvet | Pure vibes detail | LOW | Manually tweaked geometry on the duvet box — small Y-axis depression in the middle |
| Pair of folded jeans / hoodie thrown on the bed corner | Maximum "this person actually lives here" | LOW-MEDIUM | One slightly-rotated thin box draped at the foot |
| A second mug on the nightstand | Reads as "I take coffee/tea to bed when working late" | LOW | Reuse mug primitive |
| Book lying open face-down on the bed or nightstand | Reading-in-bed signal; same provenance as the bookshelf books (no real titles, abstract) | LOW | Two thin boxes hinged at center (open book) |

### Anti-features (E)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| Bedsheets with cyber-themed pattern (skulls / binary / Matrix print) | "On-brand" | Cliché stack on cliché stack | Plain dark sheets (navy, charcoal) |
| Animated breathing/sleeping figure on the bed | "Tell the story" | Uncanny valley horror | Empty bed |
| Bed canopy / curtains | "Aesthetic" | Reads as 'kid's room' or 'fantasy genre' | None |
| A real Eren-bedroom photo as the bedsheet texture | "Authentic" | OPSEC nightmare | Abstract colored boxes |
| Adding a second pillow with hooded-hacker pattern | Same as cliché list | Cliché | Single plain pillow |

### Dependency note (E)
- The cat (F) depends on the bed existing (or window ledge — also requires window with sufficient depth)
- Bedside lamp depends on the nightstand existing (lamp needs a surface)
- "Monitor-light glow on bedding" depends on bed positioning relative to existing point lights — verify in composition

## F. Cat (procedural)

### Table stakes

| Feature | Why expected | Complexity | Notes |
|---------|--------------|------------|-------|
| A recognizable cat shape from 2–3 m camera distance | This is THE personal touch ("yatak ve kedi"); a recognizable cat at overview distance closes the "lived in" loop. | MEDIUM | See primitive composition below. |
| Cat in a believable cat location (curled on bed OR sitting on window ledge OR sitting on top of tower PC) | Cats are read by their pose+location combo. A cat on the desk reads as "stealing the keyboard" (cute, but takes attention from monitor — recruiter's eye goes there). A cat on the bed/ledge reads as "background of life," which is correct. | LOW | Pure positioning |

### Cat primitive composition (honest answer to design Q4)

**5-primitive cat that reads from 50m (or 5m, more relevantly):**

| Part | Primitive | Approx dims (sitting cat) | Notes |
|------|-----------|--------------------------|-------|
| Body | `<sphereGeometry>` flattened or `<capsuleGeometry>` (drei has one via three v0.152+) | r=0.10, scale [1.0, 0.7, 1.4] | Slightly elongated, slightly flattened — reads as "torso" |
| Head | `<sphereGeometry>` | r=0.07 | Sits at front-top of body, slightly forward |
| Ears (×2) | `<coneGeometry>` (triangles in 3D) | r=0.018, h=0.04 | On top of head, tilted outward slightly. Use `<coneGeometry args={[0.018, 0.04, 4]}>` for 4-sided faceted look — feels less perfect-CAD |
| Tail | `<cylinderGeometry>` or `<capsuleGeometry>` | r=0.012, h=0.18 | Curls around body if curled-cat; sticks out if sitting-cat |
| Eyes (×2) | small `<sphereGeometry>` or `<planeGeometry>` discs | r=0.006 | Slight emissive (low intensity, e.g. 0.2) — cat eyes catching ambient light. NOT laser-bright. |

**Total: 5 primitive groups (body, head, ears-pair, tail, eyes-pair) = 7 meshes. Cheap.**

**Pose recommendation: curled (sleeping or loaf).**
- A **curled "loaf"** position (paws tucked under, tail wrapped around, eyes mostly closed slits) is the most cat-like pose at low geometry budget — round body + small head bump + tail curl, no need to model legs.
- A **sitting upright** cat requires legs (4 more cylinders) and is harder to make "cat-like" without falling into "weird dog."
- A **lying stretched out** reveals proportions are wrong easily.

**Loaf wins on geometry budget AND on aesthetic ("the cat is asleep while Eren works" = perfect mood).**

**Breathing animation (honest answer to design Q4):**
- **Sine-scale on body Y at 0.3 Hz** is correct rate (real cat breathing is 0.3–0.6 Hz at rest). 0.3 Hz = 1 breath per 3.3 seconds; reads as "deeply asleep cat."
- Amplitude: ±2–3% Y-scale (0.97 → 1.03). Any more reads as "panting" (medical concern).
- Single `useFrame` consumer; **gated by `prefers-reduced-motion`** (forces scale=1.0); gated by `<PerformanceMonitor>` low-tier (forces scale=1.0).

**Color:** dark grey, dark brown, or black tabby — dark colors blend with the dark room palette and don't shout for attention. Eren can later swap to whatever real cat (if any) he has, but document the choice neutrally.

### Differentiators (F)

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Cat occasionally opens one eye (every 10–15 s, 0.3 s open) | "I am being watched" detail | LOW-MEDIUM | Toggle eye scale Y between 1.0 and 0.1; gate by reduced-motion |
| Tail flicks once every ~20 s | Cat reality detail | LOW | Single keyframe animation triggered by interval |
| Cat positioned on window ledge instead of bed | If the bed model is deferred to v1.2, the cat can still ship | LOW | Just position math |

### Anti-features (F)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| Cat looking at the monitor (eyes tracking camera) | "More interactive" | Uncanny + steals focus from monitor content | Sleeping cat ignores you |
| Cat with hat / glasses / hoodie | "On-theme" | Cliché stack | Just a cat |
| Animated walk cycle / climbing onto desk | "More charm" | Heavy animation work; would dominate the scene | Static loaf with breathing |
| Cat with realistic fur (shader) | "Looks real" | Shader cost prohibitive on low-tier devices | Matte material; the silhouette does the work |
| Multiple cats | "Crazy cat lady" | Distracts from the cyber framing | One cat |
| Cat sound (purr / meow) | "Cute" | Auto-playing audio is universal anti-pattern | None |

### Dependency note (F)
- Cat depends on: bed (E) OR window ledge (A) OR top of tower PC (already in v1.0). Pick one.

## G. Secondary devices (optional in v1.1: laptop, SDR, second monitor)

### Differentiators (no table stakes — these are optional)

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Open laptop on desk corner with sleep/lock-screen frame | Implies "I take work with me / I have a backup machine" — junior credibility | MEDIUM | Two angled boxes (lid + base) at ~110°. Lid face has a thin black plane = closed/sleep state. Optional faint Apple/manufacturer logo cutout — actually NO, avoid brand entanglement; leave the lid blank. |
| SDR dongle (small USB stick + tiny antenna) | The **strongest** "this person does niche cyber-adjacent things" signal for anyone who knows what SDR is. Reads as nothing to non-SDR people. Low downside, high upside for the right viewer. | LOW | Small box (~0.08 × 0.015 × 0.025 m, RTL-SDR / HackRF form factor) with a thin cylinder antenna (8 cm). Sticking out of a USB port on the laptop or tower. |
| Second monitor (smaller, beside main) | Multi-monitor setup is universal in tech roles | MEDIUM | Reuse Monitor.tsx pattern with smaller dimensions; closed/static content (NOT another `<Html>` overlay — that doubles content-budget AND fake-second-screen anti-pattern risk). Static dark frame with a single emissive "power LED" or a sleep glyph |

### Anti-features (G)

| Feature | Why people request | Why bad | Alternative |
|---------|---------------------|---------|-------------|
| Second monitor showing scrolling tcpdump / Wireshark UI | "Cyber realism" | Fake terminal anti-pattern; recruiter clocks it instantly | Static dark screen |
| Laptop with open lid showing a fake login screen / terminal | Same | Same | Closed lid OR open lid with sleep-glyph |
| SDR with animated "signal capture waveform" on its tiny LED | Cute | Implies live capture (fabrication) | Static green power LED |
| Phone on the desk with a fake notification | "More lived-in" | Privacy implications + every fake screen problem | Skip the phone entirely |
| Yubikey lanyard around the neck of a figure | No figure in scene; if there were, this is still cliché | N/A | Skip |
| Multiple secondary devices at once (laptop + SDR + second monitor + tablet + phone) | "Fully kitted" | Visual clutter; obscures monitor + bookshelf | Pick at most 2 for v1.1 |

### Recommendation (G)
- **Ship the SDR dongle in v1.1.** It's the highest signal-to-cost detail in this category. Cyber-savvy viewers see it instantly; non-cyber viewers ignore it harmlessly.
- **Defer the second monitor to v1.2.** Composition risk + occlusion risk against the ultrawide is real; not worth fighting now.
- **Open laptop is optional** — if there's a clear spot on the desk that doesn't compete with mug/keyboard/mouse, ship it; otherwise skip.

## H. Pre-launch human sign-off (v1.0-inherited, checklist work)

**Per scoping note: don't deep-research — these are execution items, not feature design.**

| Item | Source | Notes |
|------|--------|-------|
| OG image swap | OPS-03/CHECKLIST-LAUNCH | Replace placeholder OG with real workstation hero shot |
| Lighthouse median-of-3 manual run | OPS-03 | Slow-4G incognito, 3× per shell, record |
| Web3Forms Gmail + Outlook delivery test | CTC-01 | Real send, check both inboxes + spam folders |
| Real-device QA iOS (one mid-tier) + Android (3–4 GB RAM) | OPS-04 | Named device models, recorded verdicts |
| Named peer reviews (1 cyber, 1 non-cyber) | OPS-05 | Get usability feedback on text shell first-paint + 3D path |

All five are blocking for the "v1.1 launch" gate. They produce no new code surfaces; just CHECKLIST tick-marks + a `04-08-SUMMARY.md` written post-execution.

## I. Write-ups + GLB (v1.0-inherited, provenance pattern already established)

**Per scoping note: provenance pattern from Plan 03-05 still binds — note table stakes only.**

| Item | Table-stakes definition | Notes |
|------|-------------------------|-------|
| 2–3 MDX CTF/lab write-ups | Each write-up describes a real lab Eren ran (PortSwigger JWT room / Sigma rule against Sysmon log / MalwareBazaar retired-sample triage are the previously-named candidates); each ships real screenshots (OPSEC-stripped via `exiftool -all=`); each is paired to its skills tag entry so the provenance rule is honored | Pipeline already exists (`@mdx-js/rollup` + `rehype-pretty-code` + Shiki). Drop `.mdx` into `src/content/writeups/` and `import.meta.glob` picks up automatically. |
| Real GLB workstation revisit (V2-3D-01) | Real CC0 GLB workstation in `public/assets/workstation/` (193+320+354 KB) — was reverted in commit `342d2e7` after autonomous visual-tuning concluded procedural read better. Reattempt with iteration headroom, OR formally promote to v1.2 if the procedural look continues to win | Decision needed during v1.1 scoping — if v1.1 already has 8 categories of new procedural geometry (A–G), arguing for a GLB swap now adds visual-iteration burden right when the room is busiest. **Recommendation: formally defer to v1.2.** |

## Feature Dependencies

```
A. Room shell
    ├── walls + ceiling (no deps)
    ├── window
    │     └── requires: back wall exists
    │     └── enables: night-city parallax differentiator
    │     └── enables: cat-on-window-ledge variant (F)
    ├── blinds (require window)
    └── door (no deps)

B. Cyber detail
    ├── rack frame (no deps — sits on floor)
    │     └── enables: switch (mounts in rack)
    │     └── enables: Pi cluster (mounts in rack)
    │     └── enables: cable bundle (terminates at rack)
    ├── switch (requires rack)
    ├── Pi cluster (requires rack)
    ├── cable bundle (no hard dep but coherent only with rack)
    └── external HDD (no deps)

C. Wall content
    ├── whiteboard (requires back wall — depends on A)
    ├── wall clock (requires any wall — depends on A)
    └── framed certificate/poster (requires any wall — depends on A;
        existing wall poster lives on the "back wall before walls existed"
        — adjust position after walls land)

D. Warmth touches
    ├── book spines (no deps — drop into existing Bookshelf.tsx slots)
    ├── plant (no hard deps; ideal home is windowsill (A) or bookshelf top)
    │     └── windowsill variant requires: window (A)
    ├── screen bias-light (requires back wall — depends on A)
    └── under-desk LED strip (no deps — sits on existing Desk.tsx)

E. Bed corner
    ├── bed (requires floor space — verify against rack + chair extents)
    ├── nightstand (no hard deps; positioned by bed)
    │     └── enables: bedside lamp
    └── bedside lamp (requires nightstand)
        └── enables: light-source position consistency check

F. Cat
    └── requires ONE of:
            ├── bed (E)
            ├── window ledge (A) — requires window has ledge depth
            └── top of tower PC (already exists in v1.0)

G. Secondary devices
    ├── SDR dongle (lives on laptop USB port OR tower USB; choose)
    ├── open laptop (no hard deps; needs desk surface)
    └── second monitor (no hard deps; competes with ultrawide for x extent)

H. Sign-off
    └── independent of A–G; can run in parallel

I. Write-ups + GLB
    ├── write-ups: independent of A–G (drop into src/content/writeups/)
    └── GLB swap: conflicts with A–G visual iteration burden — defer to v1.2
```

### Critical dependency chains

1. **A → C** (whiteboard, clock, framed cert need wall). C requires A to land first or simultaneously.
2. **A → D-bias-light** (bias light needs back wall).
3. **A → window → F-window-ledge-variant** (only if cat goes on ledge).
4. **B-rack → B-switch / B-Pi-cluster / B-cables** (cyber detail clustering).
5. **E-bed → E-nightstand → E-bedside-lamp** (bed corner is one connected micro-scene).
6. **E or A → F** (cat needs a believable surface). Defer cat decision until bed + window positions are finalized.

### Sequencing implication for phase ordering

- **Walls + ceiling + window must land early** (everything in C and the bias light in D blocks on this).
- **Rack micro-scene can land in parallel** with walls (no dep crossover).
- **Bed corner must land before cat** if cat-on-bed is chosen.
- **Cat is the latest-landing feature** — depends on bed (E) or window (A). It's also the only category with per-frame animation; want everything else stable first.

## v1.1 Scope Recommendation

### Ship in v1.1 (P1 — table stakes for "this is a real room")
- [ ] **A1.** 3 walls + ceiling — without this, A–D have nowhere to attach
- [ ] **A2.** Window with procedural night-city canvas-texture backdrop
- [ ] **A3.** Blinds (horizontal slats, half-open)
- [ ] **B1.** Mini server rack frame
- [ ] **B2.** 1U switch with port LEDs (1–2 emissive at 2 Hz)
- [ ] **B3.** Pi cluster (2–4 stacked Pis with 1 Hz LEDs)
- [ ] **B4.** Cable bundle (3 tube curves)
- [ ] **C1.** Whiteboard with abbreviated ATT&CK tactic strip (7 columns, one highlighted with hand-drawn annotation)
- [ ] **C2.** Analog wall clock (static, off-the-hour time)
- [ ] **D1.** Book spines on bookshelf (6–12 per shelf)
- [ ] **D2.** Small potted snake plant (on bookshelf top OR windowsill)
- [ ] **D3.** Screen bias-light (faint cyan plane on back wall behind monitor)
- [ ] **E1.** Single bed (unmade, plain dark sheets)
- [ ] **E2.** Nightstand
- [ ] **F1.** Loaf cat with 0.3 Hz breathing scale (on bed)
- [ ] **H.** All 5 pre-launch sign-off items
- [ ] **I-writeups.** 2–3 MDX write-ups with real provenance

### Add to v1.1 if budget allows (P2)
- [ ] **A4.** Door (closed, with under-door light strip)
- [ ] **A5.** Ceiling light fixture (off)
- [ ] **A6.** Subtle window parallax on camera orbit
- [ ] **B5.** External HDD tower
- [ ] **B6.** Heartbeat LED somewhere (0.1 s / 2.9 s)
- [ ] **C3.** One framed cert/poster (in addition to existing v1.0 WallDecor poster)
- [ ] **D4.** Under-desk LED strip
- [ ] **D5.** Stack of books on top of bookshelf
- [ ] **E3.** Bedside lamp (off, character bulb glow)
- [ ] **G1.** SDR dongle (the highest-signal optional)

### Defer to v1.2 (P3)
- [ ] **G2.** Open laptop on desk corner
- [ ] **G3.** Second monitor
- [ ] **I-GLB.** Real GLB workstation swap (V2-3D-01) — conflicts with v1.1 procedural-iteration burden
- [ ] Animated cat tail flick / eye-open blink
- [ ] Custom CRT shader (V2-3D-02)
- [ ] Scroll-driven camera tour (V2-3D-03)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| A1. Walls + ceiling | HIGH | LOW | P1 |
| A2. Window + city backdrop | HIGH | MEDIUM | P1 |
| A3. Blinds | HIGH | LOW | P1 |
| A4. Door | MEDIUM | LOW | P2 |
| A5. Ceiling fixture | LOW | LOW | P2 |
| A6. Window parallax | LOW | LOW | P2 |
| B1. Rack frame | HIGH | MEDIUM | P1 |
| B2. Switch + LEDs | HIGH | LOW | P1 |
| B3. Pi cluster | HIGH | MEDIUM | P1 |
| B4. Cable bundle | MEDIUM | LOW | P1 |
| B5. External HDD | LOW | LOW | P2 |
| B6. Heartbeat LED | LOW | LOW | P2 |
| C1. Whiteboard + ATT&CK | HIGH | MEDIUM | P1 |
| C2. Analog clock | MEDIUM | LOW | P1 |
| C3. Framed cert | MEDIUM | LOW | P2 |
| D1. Book spines | HIGH | LOW | P1 |
| D2. Potted plant | HIGH | LOW | P1 |
| D3. Bias light | MEDIUM | LOW | P1 |
| D4. Under-desk LEDs | LOW | LOW | P2 |
| D5. Stacked books | LOW | LOW | P2 |
| E1. Bed | HIGH | MEDIUM | P1 |
| E2. Nightstand | MEDIUM | LOW | P1 |
| E3. Bedside lamp | LOW | LOW | P2 |
| F1. Cat | HIGH | MEDIUM | P1 |
| G1. SDR dongle | MEDIUM | LOW | P2 |
| G2. Open laptop | LOW | MEDIUM | P3 |
| G3. Second monitor | LOW | MEDIUM | P3 |
| H. Pre-launch sign-off | HIGH | n/a (checklist) | P1 |
| I. Write-ups | HIGH | n/a (Eren writes) | P1 |
| I. GLB swap | LOW | HIGH | P3 |

**P1 totals: 14 procedural-geometry features + 2 inherited items = 16 items for v1.1 must-ship.**
**P2 budget (if room): 10 items.**

## Confidence Assessment

| Category | Confidence | Reasoning |
|----------|------------|-----------|
| A. Room shell | HIGH | Procedural walls / planes is standard R3F; window canvas-texture approach inherits v1.0 WallPoster pattern; LOD math verified |
| B. Cyber detail | HIGH | LED blink rates verified against Oracle / HPE / Intel server docs; rack geometry is standard primitives |
| C. Wall content | HIGH | ATT&CK tactic vocabulary verified against MITRE official matrices; whiteboard readability math is conservative |
| D. Warmth | HIGH | Plant + book + bias light are well-trodden patterns; snake plant geometry rationale is sound |
| E. Bed corner | MEDIUM | Bed geometry is straightforward; unmade-bed look is a vibe judgment that may need visual iteration |
| F. Cat | MEDIUM | 5-primitive cat is achievable but recognition at distance is empirically uncertain — may need visual iteration; breathing rate verified against real cat respiratory rate |
| G. Secondary devices | MEDIUM | Each individual device is straightforward; the *composition* (which to ship, where to place) is judgment-heavy |
| H. Sign-off | HIGH | Pure execution items; already scoped in CHECKLIST-LAUNCH.md |
| I. Write-ups | HIGH | Provenance pattern fully established; pipeline exists |

## Sources

- [MITRE ATT&CK Matrix — Enterprise](https://attack.mitre.org/matrices/enterprise/) — tactic vocabulary and column structure
- [Lockheed Martin Cyber Kill Chain](https://www.lockheedmartin.com/en-us/capabilities/cyber/cyber-kill-chain.html) — 7-step linear kill chain reference
- [Oracle Server X7-8 Status Indicator Blink Rates](https://docs.oracle.com/cd/E71925_01/html/E71936/gnrdw.html) — definitive 1 Hz / 2 Hz / heartbeat (0.1s/2.9s) reference
- [HPE ProLiant DL360p Gen8 LED Indicators](https://support.hpe.com/hpesc/public/docDisplay?docId=emr_na-c03245333) — corroborating server LED standards
- [Intel Server Status LED Indicators](https://www.intel.com/content/www/us/en/support/articles/000038242/server-products/legacy-server-products.html) — corroborating
- v1.0 source: `src/scene/Workstation.tsx`, `DeskDecor.tsx`, `WallDecor.tsx`, `Chair.tsx`, `Lamp.tsx`, `Bookshelf.tsx` — pattern reference (already-shipped primitives, color palette, position conventions, CanvasTexture helper, emissive + Bloom interaction)
- v1.0 anti-feature inheritance: `.planning/milestones/v1.0-REQUIREMENTS.md` Out of Scope (rows verified line-by-line)
- v1.0 deferral context: `.planning/milestones/v1.0-MILESTONE-AUDIT.md` (CNT-02 / CNT-03 / OPS-03/04/05 / 3D-08-GLB-half / CTC-01-delivery)

---
*Feature research for: v1.1 Room Build-Out + Pre-Launch Close*
*Researched: 2026-05-15*
