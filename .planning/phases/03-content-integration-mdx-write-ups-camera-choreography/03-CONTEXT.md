# Phase 3: Content Integration + MDX Write-ups + Camera Choreography - Context

**Gathered:** 2026-05-07
**Status:** Ready for planning

<domain>
## Phase Boundary

The 3D scene's monitors render real, selectable, copy-paste-able DOM content via drei `<Html transform occlude="blending">` reading from `src/content/*.ts` through the same `src/ui/*` components the text shell already ships (single source of truth). Plus: animated `whoami` greeting on the center monitor, GSAP click-to-focus camera animation per monitor, MDX write-up pipeline live, and 3 fully-authored CTF/lab write-ups (written collaboratively during this phase).

Phase 3 ships:
- drei `<Html transform occlude="blending">` overlays on each monitor's screen plane (3D-05)
- Click-to-focus camera animation via GSAP — 1000ms power2.inOut, OrbitControls disabled during focus, defocus on Esc / outside-click / re-click (3D-06)
- Animated `whoami` terminal greeting on the center monitor — 3-line sequence, 30-40 ms/char, cursor blinks after completion (3D-07)
- MDX pipeline: `@mdx-js/rollup` 3.x + `rehype-pretty-code` 0.14 + Shiki 4.x + `@mdx-js/react` (CNT-02)
- 3 fully-authored MDX write-ups — Detection Engineering (Sigma + LOLBins) + Threat Intelligence (Sample → ATT&CK) + Web Auth (JWT alg confusion) (CNT-02)
- Section parity audit between text shell and 3D shell — manual + automated grep gates (TXT-06)
- Phase 3 also covers CNT-03 — 3-5 cyber projects published with provenance, every skills.ts tag demonstrably present in a project or write-up

**Out of scope for Phase 3:**
- Postprocessing (Bloom + Scanline + ChromaticAberration + Noise) → Phase 4 (3D-08)
- Real Draco-compressed GLB workstation → Phase 4 (3D-04 second half)
- Web3Forms contact form → Phase 4 (CTC-01)
- TryHackMe/HackTheBox profile links → Phase 4 (CTC-03)
- Lighthouse + real-device QA → Phase 4 (OPS-03, OPS-04)

</domain>

<decisions>
## Implementation Decisions

### Monitor Content Assignment + `<Html transform>` Layout

- **D-01 — Monitor → content mapping:**
  - **Left monitor** (`position={[-0.45, 0.85, 0]}`) — `<Projects />` section: list of cyber projects (CNT-03; src/content/projects.ts).
  - **Center monitor** (`position={[0, 0.95, -0.05]}`) — animated `<WhoamiGreeting />` (top, fixed) + `<About />` body + `<Skills />` tag list. Most important content: identity + bio + skills.
  - **Right monitor** (`position={[0.45, 0.85, 0]}`) — `<WriteupsList />`: index of MDX write-ups, click → opens individual write-up (in 3D shell, write-up renders inside the same monitor with scrollable content).
  - Phase 1's 7 sections (About, Education, Skills, Projects, Certs, Writeups, Contact) all remain present in the text shell — TXT-06 parity audit confirms. The 3D shell shows a curated subset on monitors; Education + Certs + Contact appear elsewhere (see D-08 below).

- **D-02 — Content scrollability inside monitors:** YES — each monitor's `<Html transform>` content has its own scrollable region (`overflow-y-auto h-full`). Mouse wheel scrolls the focused monitor's DOM, not the 3D scene. drei `occlude="blending"` correctly handles wheel events on the projected plane. Recruiters can read full project lists / write-up indexes on small monitor surfaces without zooming.

- **D-03 — DOM size on screen plane:** real-screen-pixel-density. Each monitor's `<Html transform>` renders a 600 × 400 px DOM that maps onto the 0.46 × 0.28 m screen plane. drei `distanceFactor` is calibrated so 14 px text is readable from default camera position without zoom. Planner determines exact `distanceFactor` (research will confirm with drei docs); principle: default camera position = legible body text.

- **D-04 — Center monitor composition:** animated `whoami` block fixed at top + scrollable About paragraph + Skills tag list below. Single scrollable container. Total DOM ~600-700 px height; scroll reveals About body + skills (so monitor isn't visually overwhelming but content is reachable).

### Animated `whoami` Greeting (3D-07)

- **D-05 — Sequence content (3 lines, ~5s total):**
  ```
  $ whoami
  eren@workstation:~$
  Eren Atalay — Junior Cybersecurity Analyst (UK)

  $ status
  Currently: QA at Fin-On — studying Security+ — available for SOC analyst roles

  $ links --all
  [CV]  [GitHub]  [LinkedIn]  [email (click to reveal)]

  _   ← blinking cursor (1Hz; static █ in reduced-motion)
  ```
  Same 4 contact links as the text shell Hero (TXT-02 / D-03 of Phase 1), reused via the existing `<Hero />` component but adapted for in-monitor render. Provides identity + status + links in one block.

- **D-06 — Typing cadence:** 30-40 ms per character for command lines (`$ whoami`, `$ status`, `$ links --all` — short strings, ~10 chars each → 300-400 ms each). Output blocks (the lines below each command) appear instantly (real terminal output — no synthetic typing). Inter-line pause: 200 ms. Total sequence: ~5 seconds. **`prefers-reduced-motion: reduce`** → entire sequence renders instantly in final state (skip-to-end). Reuses Phase 1's `useReducedMotion` hook.

- **D-07 — After completion:** cursor blinks 1 Hz on the last line. Sequence does NOT loop. Output stays visible. User can scroll down to see About + Skills on center monitor. NO loop, NO fade-out, NO transition to a different layout (anti-pattern: confuses recruiter who arrived mid-loop).

### Camera Focus Animation (3D-06)

- **D-08 — Click-to-focus animation:**
  - **Trigger:** click anywhere on a monitor's screen plane → camera animates to a per-monitor preset focus pose.
  - **Duration:** 1000 ms.
  - **Easing:** `power2.inOut` (smooth start, smooth end — cinematic but not slow).
  - **Animated properties:** `camera.position` + `camera.lookAt` (or `OrbitControls.target`) — both interpolated simultaneously by GSAP timeline.
  - **Reduced motion:** `prefers-reduced-motion: reduce` → instant cut (no animation, position snaps).
  - **Per-monitor focus poses:**
    - Left: `position=[-0.45, 1.0, 0.7]` `lookAt=[-0.45, 0.95, 0]` (head-on, ~70 cm from screen)
    - Center: `position=[0, 1.05, 0.65]` `lookAt=[0, 0.95, -0.05]`
    - Right: `position=[0.45, 1.0, 0.7]` `lookAt=[0.45, 0.95, 0]`
    - Planner finalises exact distances based on `distanceFactor` from D-03; principle: monitor fills ~70% of viewport vertically.

- **D-09 — During focus, OrbitControls is DISABLED.** Mouse drag does nothing while focused. User cannot accidentally fly off into a void. Defocus re-enables OrbitControls and animates camera back to default orbit pose.

- **D-10 — Defocus triggers:**
  1. **Esc key** (keyboard accessibility — primary trigger).
  2. **Click outside the focused monitor** on the Canvas (intuitive escape).
  3. **Re-click on the same monitor** (toggle pattern — also defocuses).
  All three trigger the same animated return to default orbit pose (1000 ms power2.inOut, instant in reduced-motion). Camera returns to default orbit position; OrbitControls re-enabled; user can drag to look around again.

- **D-11 — `?focus=<id>` URL param** (Phase 1 query-param routing) extends to 3D shell:
  - `?view=3d&focus=projects` → animate camera to left monitor (Projects).
  - `?view=3d&focus=about` (or `?focus=whoami`) → center monitor.
  - `?view=3d&focus=writeups` → right monitor.
  - `?view=text&focus=<section>` continues to scroll text shell (existing Phase 1 behavior — no change).
  - Deep-link sharing works for both shells, same URL state model.

### MDX Pipeline + 3 Write-ups (CNT-02)

- **D-12 — MDX stack (verbatim from CLAUDE.md):**
  - `@mdx-js/rollup@~3.1.x` (Vite plugin, official MDX path)
  - `@mdx-js/react@~3.1.x` (renderer)
  - `rehype-pretty-code@~0.14.x` (Shiki integration)
  - `shiki@~4.x` (syntax highlighting at build time, zero runtime cost)
  - **NO** `vite-plugin-mdx` (third-party shim — CLAUDE.md "What NOT to Use")
  - **NO** Prism.js (CLAUDE.md — Shiki gives VS-Code-grammar-parity)

- **D-13 — Shiki theme:** `github-dark` (matches the terminal palette token `#0d1117` background; pre-built theme — no custom JSON). Code blocks render with same color family as the rest of the site. Build-time only — zero JS payload for highlighting.

- **D-14 — MDX file structure:** `src/content/writeups/<slug>.mdx`. Each file has frontmatter:
  ```yaml
  ---
  title: "Detecting LOLBins with Splunk + Sigma"
  slug: lolbin-sigma-detection
  type: detection           # detection | cti | web-auth
  date: 2026-05-15          # author-set publish date
  duration: "~12 min read"
  tags: [splunk, sigma, lolbin, certutil, detection-engineering]
  sources:
    - "SigmaHQ rules: github.com/SigmaHQ/sigma"
    - "Atomic Red Team: github.com/redcanaryco/atomic-red-team"
  attack_techniques:
    - T1218.010   # Signed Binary Proxy Execution: Regsvr32
    - T1218.005   # Signed Binary Proxy Execution: Mshta
  ---
  ```
  TypeScript helper `src/content/writeups.ts` reads all `*.mdx` files, exports a typed `writeups` array consumed by `<Writeups />` text-shell section + the right-monitor list.

- **D-15 — Section structure (Recon → Foothold → Privesc → Lessons + Provenance footer adapted per type):**
  - **Detection write-up:** Hypothesis → Telemetry → Sigma Rule → Splunk Test → False Positives → Lessons + Provenance footer.
  - **CTI write-up:** Sample Selection → IOC Extraction → ATT&CK Mapping → Detection Rule (Sigma/YARA) → Lessons + Provenance footer.
  - **Web Auth write-up:** Vulnerability Class → Reproduction (PortSwigger lab) → Exploit → Fix → Lessons + Provenance footer.
  - Provenance footer is mandatory — cites: source rooms/labs/CVEs, walkthroughs consulted, ATT&CK technique IDs, retired-on date if a CTF, "Home Lab — Synthetic Data" disclaimer where applicable. Mitigates research/PITFALLS.md Pitfall 7 (junior authenticity).

- **D-16 — Code blocks + screenshots:**
  - Code blocks: Bash, Python, YAML (Sigma rules), JSON (HTTP requests/responses), HTTP (raw requests), Hex (occasional). Shiki tokenises at build time.
  - Screenshots: PNG, sanitized per `.planning/CHECKLIST-OPSEC.md` § Screenshot Review (no IPs, hostnames, employer terms, file paths). 1-3 screenshots per write-up. Stored in `public/assets/writeups/<slug>/` directory.
  - **`<CodeBlock>` MDX component** — wraps `<pre><code>` with terminal-style frame + filename caption + copy button (Phase 3 ship).
  - **`<ScreenshotFrame>` MDX component** — wraps `<img>` with bordered frame + alt-text-required + caption + sanitization-confirmed badge.
  - **`<ProvenanceFooter>` MDX component** — renders the frontmatter `sources` + `attack_techniques` arrays + author + publish date in a structured footer.

### Three Write-ups — Subjects + Authoring Plan

- **D-17 — Three write-up subjects (locked):**
  1. **Detection Engineering: "Detecting certutil.exe Network Abuse with Splunk + Sigma"** — write a Sigma rule for `certutil -urlcache -f <url> <output>` LOLBin abuse, ingest synthetic Sysmon events into Splunk, validate true-positives + tune false-positives. ATT&CK technique T1140 + T1105.
  2. **Threat Intelligence: "From Hash to ATT&CK: Triaging a Malware Sample"** — pick a public retired sample from MalwareBazaar (we'll choose during authoring), run automated triage (VirusTotal, Hybrid Analysis, MalwareBazaar comment thread), extract IOCs, map TTPs to MITRE ATT&CK, write Sigma + YARA detection rules. Result: structured threat report.
  3. **Web Auth: "JWT Algorithm Confusion in Practice"** — reproduce HS256/RS256 confusion + `alg=none` exploit on PortSwigger Web Security Academy lab, demonstrate forging admin JWT, write a fixed Express.js middleware. ATT&CK technique T1190.

- **D-18 — Authoring approach:** all 3 write-ups authored COLLABORATIVELY in Phase 3. The plan dedicates one plan-slice (probably Plan 03-04 or 03-05) to "content authoring sprint". For each write-up:
  - Eren provides: the actual lab attempt (clicks through PortSwigger, runs Splunk searches, picks a malware sample from MalwareBazaar) — with claude-the-pair-programmer's guidance.
  - Claude provides: structure, language polish, MITRE ATT&CK mapping, Sigma/YARA syntax verification, sanitization review against OPSEC checklist, prose tightening.
  - Output: 3 production-ready MDX files committed to `src/content/writeups/`.
  - Estimate: ~1-2 hours per write-up × 3 = 3-5 hours of focused collaboration. Phase 3 total ~6-9 hours including pipeline + 3D integration.

### Section Parity Audit (TXT-06)

- **D-19 — Manual + automated parity gates:**
  - **Automated:** a small script (`scripts/check-parity.mjs`) reads `src/content/sections.ts` const + walks `src/sections/*.tsx` filenames + walks `src/scene/Workstation.tsx` mounted Html overlay components. Asserts every section in SECTIONS const has either a text-shell render OR a 3D-shell monitor render (or both). Fails CI if a section is dropped.
  - **Manual:** the OPSEC pre-publish checklist (`.planning/CHECKLIST-OPSEC.md`) gets 3 new items in a "## TXT-06 parity (Phase 3)" section: (a) text shell renders all 7 sections; (b) 3D shell monitors render the curated subset (Projects, About+Skills+Whoami, Writeups); (c) deep-link `?focus=<id>` works in both shells.
  - This audit runs at every Phase 3+ release.

### Phase 1 Deferred TODOs Resolved in Phase 3

- **D-20 — Phase 3 ALSO closes Phase 1's deferred content TODOs (Plan 05 Task 3):**
  - `src/content/identity.ts` — replace placeholder GitHub URL, real LinkedIn slug, real `emailEncoded` (run `npm run encode-email`).
  - `src/content/projects.ts` — refine to 3-5 real cyber projects with full provenance per CNT-03 (every skills.ts tag demonstrable in a project or write-up). The 3 write-ups + projects together must satisfy provenance — e.g., `splunk` tag → Detection write-up demonstrates it; `sigma` tag → Detection write-up; `mitre att&ck` tag → CTI write-up; `jwt` tag (if added) → Web Auth write-up; `linux`/`bash` → home-lab project; `python` → automation project.
  - `src/content/certs.ts` — real cert list with statuses (Eren provides during Phase 3 collab).
  - `src/content/skills.ts` — pruned to demonstrable skills only (CNT-03 provenance rule).
  - `src/content/education.ts` — real institution + degree.
  - `src/sections/About.tsx` — real bio paragraph.
  - `public/assets/Eren-Atalay-CV.pdf` — real EXIF-stripped CV.
  - `public/assets/og-image.png` — real screenshot of the deployed text shell.
  - **All resolved in a single Phase 3 plan slice** (probably Plan 03-06 or 03-07 — the same plan that runs the full OPSEC checklist + section parity audit). After Phase 3 verify-work, all Phase 1 content placeholders are gone.

### Claude's Discretion

User explicitly delegated these to the planner / executor:

- **Exact `distanceFactor` for `<Html transform>`** — research will confirm; principle: 14 px body text readable from default orbit camera position.
- **MDX `<CodeBlock>` filename caption styling** — Tailwind v4 utilities only; matches Phase 1 surface palette.
- **GSAP Timeline structure** — single timeline per click vs. two parallel timelines for position + lookAt — planner picks based on R3F + GSAP idiomatic patterns.
- **OrbitControls re-enable timing on defocus** — set `controls.enabled = true` immediately or after camera animation completes? Recommend: enable AFTER animation so user can't drag mid-defocus.
- **Esc key listener** — registered at App level vs. ThreeDShell level. Probably ThreeDShell (only relevant when 3D mounted).
- **Outside-click defocus detection** — raycaster vs. event-target check on Canvas. Raycaster is more robust; planner picks.
- **MDX renderer mounting** — `<MDXProvider components={{...}}>` vs. per-mdx import. Planner picks; recommendation: provider for shared CodeBlock/ScreenshotFrame/ProvenanceFooter components.
- **Right-monitor write-ups list interaction** — click write-up → render in same monitor (sub-route) vs. open in modal vs. navigate to dedicated text-shell route. Recommendation: render inside same monitor with back-button (in-place mode).
- **`scripts/check-parity.mjs` exact assertions** — a sane minimum is "every SECTIONS id appears in EITHER `src/sections/*.tsx` filename OR `src/scene/Workstation.tsx` Html mount". Planner refines.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents (researcher, planner, executor) MUST read these before planning or implementing.**

### Phase scope & requirements
- `.planning/ROADMAP.md` §"Phase 3: Content Integration + MDX Write-ups + Camera Choreography" — phase goal, 5 success criteria, requirement list (CNT-02, CNT-03, 3D-05, 3D-06, 3D-07, TXT-06)
- `.planning/REQUIREMENTS.md` §"3D Workstation Shell" + §"Content & SEO" + §"Text Shell" — full text of the 6 Phase-3 requirements + the locked anti-feature list
- `.planning/PROJECT.md` — core value, audience split, performance constraints
- `.planning/STATE.md` — Phase 1 + 2 complete + live; Phase 3 fresh

### Phase 1 + 2 patterns to extend
- `.planning/phases/01-foundation-2d-recruiter-grade-shell/01-CONTEXT.md` — Phase 1 D-01..D-18 still apply (palette, terminal aesthetic, query-param routing, no localStorage, prefers-reduced-motion, anchor-list shared const)
- `.planning/phases/01-foundation-2d-recruiter-grade-shell/01-UI-SPEC.md` — palette + typography + spacing tokens; reused in MDX components
- `.planning/phases/02-3d-shell-asset-pipeline-capability-gating/02-CONTEXT.md` — Phase 2 D-01..D-15 still apply (procedural workstation, hybrid camera, view toggle, context-loss UX)
- `.planning/phases/02-3d-shell-asset-pipeline-capability-gating/02-UI-SPEC.md` — drei `<Html>` integration patterns, OrbitControls clamps, Canvas props
- `.planning/phases/02-3d-shell-asset-pipeline-capability-gating/02-RESEARCH.md` — R3F/drei pinned versions, scene file structure under `src/scene/`
- `src/scene/Workstation.tsx` — Phase 2 — Phase 3 extends each Monitor with `<Html transform occlude="blending">` overlay
- `src/scene/Monitor.tsx` — Phase 2 — Phase 3 needs to ensure screen plane has correct ref/positioning for `<Html>`
- `src/content/sections.ts` — SECTIONS const reused for parity audit + ?focus= deep links
- `src/content/identity.ts`, `projects.ts`, `certs.ts`, `skills.ts`, `education.ts` — Phase 1 content layer; Phase 3 fills real values + adds `writeups.ts`
- `src/sections/Hero.tsx` — Phase 1 — Phase 3 reuses (or wraps) for in-monitor whoami greeting
- `src/lib/useReducedMotion.ts` — gates whoami animation + camera animation reduced-motion fallback

### Research (load-bearing)
- `.planning/research/STACK.md` — pinned MDX 3, GSAP 3.15, Shiki 4 (see CLAUDE.md for exact versions)
- `.planning/research/SUMMARY.md` — content-as-data architecture, single source of truth
- `.planning/research/PITFALLS.md` — Pitfall 7 (junior authenticity — provenance rule for write-ups), Pitfall 5 (OPSEC for screenshots)

### Project-level
- `CLAUDE.md` — authoritative stack reference. Phase 3 introduces `@mdx-js/rollup@~3.1.x` + `@mdx-js/react@~3.1.x` + `rehype-pretty-code@~0.14.x` + `shiki@~4.x` + `gsap@~3.15.x`. Explicitly NOT `@react-three/postprocessing` yet (Phase 4).
- `.planning/CHECKLIST-OPSEC.md` — Phase 3 adds 3 items to the "Screenshot Review" section + a new "## TXT-06 parity" sub-section (per D-19).

### External docs
- MDX docs — `@mdx-js/rollup` Vite integration
- rehype-pretty-code docs + Shiki theme `github-dark`
- GSAP timeline + tween + ease docs
- drei `<Html>` API: `transform`, `occlude="blending"`, `distanceFactor`, `as`, `wrapperClass`
- MITRE ATT&CK matrix (techniques referenced in write-ups)
- SigmaHQ rules repo (Detection write-up reference)
- MalwareBazaar API (CTI write-up sample selection)
- PortSwigger Web Security Academy (Web Auth write-up lab)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (from Phase 1 + 2)
- **`src/content/*.ts`** — typed content layer; Phase 3 fills real values + adds `writeups.ts` barrel.
- **`src/sections/*.tsx`** — Phase 1 components; Phase 3 reuses them inside `<Html transform>` overlays (Projects, About, Skills, Writeups). NO duplication: same component renders in both shells.
- **`src/ui/BracketLink.tsx`** — Phase 1+2; reused in MDX components (e.g., write-up internal links).
- **`src/ui/EmailReveal.tsx`** — reused in animated whoami `[email]` link.
- **`src/scene/Workstation.tsx`** — Phase 2 — Phase 3 wraps each `<Monitor>` with `<Html transform occlude="blending">`.
- **`src/scene/Monitor.tsx`** — needs minor refactor: expose `screenRef` (or accept children) so Phase 3 can attach `<Html>` to the screen plane.
- **`src/lib/useQueryParams.ts`** — reused for `?focus=<id>` 3D camera deep-linking.
- **`src/lib/useReducedMotion.ts`** — reused for whoami + camera animation reduced-motion gate.

### Established Patterns (from Phase 1 + 2)
- **Single source of truth content** — Phase 3 must NOT duplicate any content into a 3D-only data file; everything reads from `src/content/*`.
- **No localStorage** — `?focus=<id>` deep-link state only in URL.
- **Terminal-aesthetic verbatim copy** — write-up frontmatter + MDX body uses palette tokens, JetBrains Mono, no skill bars / matrix rain / fake REPLs.
- **Atomic commits** — each plan creates separate commits per task; SUMMARY.md per plan.
- **OPSEC at the gate** — every screenshot in write-ups runs through `.planning/CHECKLIST-OPSEC.md` Screenshot Review before commit.

### Integration Points
- **`src/scene/Workstation.tsx` + `<Monitor>`** — Phase 3's primary integration. Each Monitor renders an `<Html transform occlude="blending" ...>` wrapping the relevant section component.
- **`src/app/App.tsx`** — `?focus=<id>` deep-link handler extends to dispatch a custom event the 3D shell listens for (or via shared state). When `view=3d&focus=projects`, ThreeDShell receives the focus directive and triggers GSAP animation to the left monitor preset pose.
- **`src/scene/Controls.tsx`** — Phase 2's OrbitControls wrapper; Phase 3 adds:
  - `enabled` prop driven by focus state (false during focused mode)
  - target animation on defocus (animate `controls.target` back to default `[0, 0.95, 0]`)
- **MDX pipeline in `vite.config.ts`** — add `mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [[rehypePrettyCode, { theme: 'github-dark' }]] })` plugin. The plugin must be registered BEFORE `@vitejs/plugin-react` (per MDX docs).
- **`src/content/writeups/<slug>.mdx`** files — each authored collaboratively; frontmatter parses via `vfile-matter` or similar.
- **`src/content/writeups.ts`** — barrel that imports all `*.mdx` files via Vite's `import.meta.glob('./writeups/*.mdx', { eager: true })`. Exports typed `writeups` array.
- **`src/sections/Writeups.tsx`** — Phase 1 currently shows the empty-state copy. Phase 3 replaces with a real list reading from `writeups.ts`.
- **Phase 3 also closes Phase 1's deferred content TODOs in src/content/* + public/assets/Eren-Atalay-CV.pdf + og-image.png** (see D-20).

</code_context>

<specifics>
## Specific Ideas

- **Monitor content mapping (D-01)** — Eren's pick: Left=Projects, Center=whoami+About+Skills, Right=Writeups. Recruiter eye-flow refleksiyle uyumlu.
- **Animated whoami sequence (D-05)** — 3-line minimal: `$ whoami`, `$ status`, `$ links --all`. ~5 saniyede biter. Cursor blinker durur.
- **Camera focus animation (D-08)** — 1000 ms power2.inOut. OrbitControls disabled during focus. Defocus on Esc / outside-click / re-click.
- **Three write-ups (D-17)** — Detection (LOLBins + Splunk + Sigma) + CTI (sample → ATT&CK) + Web Auth (JWT alg confusion). Junior'a göre güçlü mix; defensive (SOC) + analytical + offensive.
- **Authoring approach (D-18)** — all 3 write-ups written COLLABORATIVELY during Phase 3. ~3-5 hours of focused collaboration; Phase 3 total ~6-9 hours.
- **Phase 1 deferred content TODOs (D-20)** — Phase 3 also closes them. Single coherent content session. Real CV PDF, real GitHub/LinkedIn, real bio, real cert list, real skills (provenance-pruned).
- **Forbidden anti-features (REQUIREMENTS.md OOS + research/PITFALLS.md):**
  - Matrix rain in any form
  - Fake REPL accepting input it can't handle
  - Type-out animation on body content (only the whoami sequence is animated; about/skills/projects render instantly)
  - Plagiarised CTF write-ups (Pitfall 7 — provenance footer is mandatory)
  - Self-titling as "Ethical Hacker" or "Pentester" without evidence (locked from Phase 1)
  - Skill bars / star ratings (locked from Phase 1)
  - Permanent loop on whoami greeting (anti-pattern; sequence runs once, cursor stays blinking)

</specifics>

<deferred>
## Deferred Ideas

Items captured during discussion or implied by the roadmap; not in Phase 3 scope.

### Carried by Phase 4 (already mapped in REQUIREMENTS.md / ROADMAP.md)
- **Postprocessing pipeline** (Bloom + Scanline + ChromaticAberration + low Noise, gated by drei `<PerformanceMonitor>`) → Phase 4 (3D-08).
- **Real Draco-compressed GLB workstation** (≤2 MB, WebP textures 1024² hero / 512² props) → Phase 4 (3D-04 second half).
- **Web3Forms contact form** end-to-end into Gmail + Outlook → Phase 4 (CTC-01).
- **TryHackMe + HackTheBox profile links** in Contact / Certifications area → Phase 4 (CTC-03).
- **Lighthouse on text shell** (Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90) → Phase 4 (OPS-03).
- **Real-device QA pass** (iOS mid-tier + Android 3-4 GB RAM) → Phase 4 (OPS-04).
- **Final pre-launch checklist execution** (~25 items including iOS Safari real-device memory pressure test deferred from Phase 2 D-15) → Phase 4 (OPS-05).

### v2 (already in REQUIREMENTS.md "v2")
- Custom CRT shader on monitor surfaces (V2-3D-02)
- Scroll-driven camera tour (V2-3D-03)
- Source-code Easter egg (V2-3D-04)
- Multi-language TR / EN (V2-CNT-02)
- Blog with RSS for ongoing write-ups (V2-CNT-03)
- Live TryHackMe / HackTheBox badge widgets (V2-CNT-04)

### None — discussion stayed within phase scope (no new deferred ideas surfaced).

</deferred>

---

*Phase: 3-Content Integration + MDX Write-ups + Camera Choreography*
*Context gathered: 2026-05-07*
