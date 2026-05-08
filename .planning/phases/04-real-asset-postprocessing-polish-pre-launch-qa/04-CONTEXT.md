# Phase 4: Real Asset, Postprocessing, Polish, Pre-Launch QA - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning
**Mode:** Smart discuss (autonomous)

<domain>
## Phase Boundary

Phase 4 ships v1.0. It replaces the placeholder workstation with a real Draco-compressed GLB (≤2 MB), gates the postprocessing pipeline (Bloom + Scanline + ChromaticAberration + low Noise) behind drei `<PerformanceMonitor>`, wires the Web3Forms contact form end-to-end (verified into Gmail AND Outlook), surfaces TryHackMe + HackTheBox profile links, and executes the pre-launch checklist (Lighthouse on deployed URL, real-device QA on one iOS + one Android, OPSEC final audit, dev-helper strip, peer review).

Phase 4 owns requirements: 3D-08, CTC-01, CTC-03, OPS-03, OPS-04, OPS-05.

Phase 4 does **not** ship Plan 03-06 (the deferred MDX write-ups) — that work is gated by the user's "no fabricated lab evidence" rule and stays deferred to whenever Eren actually runs the labs. Phase 4 plans must NOT regenerate or fabricate write-ups.

</domain>

<decisions>
## Implementation Decisions

### GLB Authoring Path

- **D-01 — Source: CC0-licensed asset + customise.** Use a CC0-licensed desk/monitor scene from Poly Haven, Sketchfab CC0 filter, or equivalent (license verified at planner time and recorded in `public/assets/workstation/LICENSE.txt`). Fastest credible path to a real asset. Blender-from-scratch, paid assets, and stay-procedural are explicitly rejected: Blender adds multi-day skill ramp; paid asset adds license risk + cost; staying procedural defeats 3D-08.

- **D-02 — Texture authoring: reuse baked maps + recompress to KTX2.** Use the source asset's existing baked AO+albedo+normal maps; pipeline through `gltfjsx --transform` (CLAUDE.md "What NOT to Use" forbids hand-rolling the gltf-transform CLI). Output: 1024² hero texture (desk surface) / 512² prop textures (monitors, lamp, bookshelf), KTX2 compressed, total bundle ≤ 2 MB on-disk (size-limit OPS-02 already enforces).

- **D-03 — Camera/scale retune: keep Phase 2 poses as-is.** Phase 2 D-04 locked R3F 1 unit = 1 metre and Phase 3 D-08 locked the three monitor click-to-focus poses. The CC0 asset is rescaled to fit the existing `position={[0,0,0]}` desk anchor; planner verifies frustum fit at default orbit pose. The ONLY pose-related tweak permitted is `distanceFactor` on each `<Html transform>` if the new monitor screen plane differs from procedural placeholder size — body text must remain readable per Phase 3 D-03.

- **D-04 — GLB authoring timebox: 7 days. Fallback: defer to v1.1.** If the GLB is not Draco-compressed and integrated by day 7 of Phase 4 (counted from Phase 4 plan execution start), the placeholder procedural workstation ships in v1.0 and the real GLB swap moves to v1.1 (V2-3D-01 already exists in REQUIREMENTS). 3D-08 is then marked PARTIAL (postprocessing ships, GLB doesn't) and the v1.1 milestone opens with V2-3D-01 promoted to first-class.

### Postprocessing Pipeline + Tier Gating

- **D-05 — `<PerformanceMonitor>` thresholds: drei defaults.** `factor` triggers: avg fps ≥ 50 → high tier; ≤ 30 → low tier (drei default `bounds={[30, 50]}`). Battle-tested across the pmndrs ecosystem; do not invent custom thresholds without measured evidence on the real GLB scene.

- **D-06 — Tier states: binary `perfTier='high' | 'low'`.** Matches the literal text in ROADMAP success criterion #1. `'low'` disables the entire postprocessing pipeline (no Bloom, no Scanline, no CA, no Noise). `'high'` enables the full pipeline with the values in REQUIREMENTS 3D-08. No mid tier; if planner finds the binary too coarse during execution, escalate as a deviation rather than introducing a third state.

- **D-07 — Tier-flip-during-session UX: instant snap.** When `<PerformanceMonitor>` flips tier (either direction), effects mount/unmount immediately. No fade-out animation, no transition. Aligns with Phase 2 D-13 instant-cut precedent. Effects are Suspense-wrapped so unmounting is safe.

- **D-08 — Bloom tuning (D-08, the value, not the requirement):** `threshold={0.6} intensity={0.6} mipmapBlur luminanceSmoothing={0.025}`. Pulls just the emissive monitor green and lamp amber. Drei defaults (threshold 0.85, intensity 1.0) overcooked the procedural scene; tuned values are the v1 ship. Scanline (density 1.25, opacity 0.15), ChromaticAberration (offset 0.0008), and low Noise (opacity 0.04) are locked verbatim from REQUIREMENTS 3D-08.

- **D-09 — `<EffectComposer>` mounted as a Suspense-deferred sibling of the workstation under `perfTier='high'`. Lazy-loaded `@react-three/postprocessing` chunk so low-tier devices never download postprocessing JS.

### Web3Forms Contact Flow + Outbound Profile Links

- **D-10 — Form mount points: shared component, both shells.** New `src/ui/ContactForm.tsx` (single source of truth, same pattern as Phase 3 D-01 monitor content). Mounted in:
  - **Text shell:** existing `<Contact />` anchor section (Phase 1 D-01 long-scroll layout, anchor id `#contact`).
  - **3D shell:** center monitor — appended below the existing About + Skills content on the same scrollable region (Phase 3 D-04 center-monitor composition extends).

- **D-11 — Form fields:**
  - `name` (required, text, max 80 chars)
  - `email` (required, validated against simple `/.+@.+\..+/` regex — server-side Web3Forms also validates)
  - `message` (required, textarea, max 2000 chars)
  - `botcheck` (honeypot — hidden field, must remain empty; if filled, abort submission silently with success UI to defeat scrapers)
  - `subject` — pre-filled `[Portfolio enquiry] from <Name>` (interpolated client-side on submit)
  - Web3Forms `access_key` (env var, NOT hardcoded — set in GitHub Actions secrets, exposed to build via `VITE_FORM_ENDPOINT` and `VITE_WEB3FORMS_KEY`)

- **D-12 — Success state UX: inline terminal block replace.** On 200-OK Web3Forms response, the form unmounts and a terminal block replaces it:
  ```
  $ message_sent
  Delivered to eren.atalay@…  — I'll reply within 48h.
  [send another]
  ```
  `[send another]` is a `<BracketLink as="button">` that resets the form. Failure state (non-2xx) shows:
  ```
  $ message_failed
  Network error. Try email instead: [email (click to reveal)]
  [retry]
  ```
  Both states styled with existing Phase 1 palette tokens.

- **D-13 — TryHackMe + HackTheBox placement:** primary in **Certifications block** as a `## Live profiles` sub-list (evidence-of-practice belongs with credential-of-practice); secondary as a single shortcut line in **Contact** (`See also: [TryHackMe profile] [HackTheBox profile]`). Real handles required from Eren at execution time — added to `src/content/identity.ts` (extends `Identity` type with `tryHackMeUrl?: string; hackTheBoxUrl?: string`). If Eren has only one platform active, the missing one is omitted (no empty placeholder).

### Pre-Launch Checklist + Peer Review

- **D-14 — Checklist file split: keep OPSEC, add LAUNCH.**
  - `.planning/CHECKLIST-OPSEC.md` (existing, owned Phase 1, extended Phase 3) — stays OPSEC-only: EXIF strip verification, screenshot review, IP/hostname/employer-leak audit, CV PDF metadata, live CTF flags, home-lab diagram sanitisation.
  - `.planning/CHECKLIST-LAUNCH.md` (new, owned Phase 4) — operational launch concerns: Lighthouse on deployed URL, dev-helper strip verification (`grep` for `<Stats>`, `<Perf>`, `console.log`, `leva`, `r3f-perf`), `npm audit` clean, all external links carry `rel="noopener noreferrer"`, CSP `<meta>` tag present, OG image (1200×630) verified, JSON-LD `Person` schema verified, sitemap.xml + robots.txt present, peer-review sign-off, real-device QA results.
  - Phase 4 verification reads BOTH checklists; both must be fully checked before milestone-complete.

- **D-15 — Cyber-pro peer reviewer: named contact.** Eren names ONE specific cyber-professional contact at plan time (e.g. a former classmate now in SOC, an ex-colleague's security team contact, a TryHackMe community connection). Recorded in `CHECKLIST-LAUNCH.md` as: `- [ ] Cyber peer review — Reviewer: ___, Date: ___, Verdict: ___, Notes: ___`. Anonymous public-sub feedback (e.g. /r/cybersecurity) is rejected because (a) low signal-to-noise; (b) Pitfall 7 "junior authenticity" trap — public posts inviting "rate my portfolio" feedback paint Eren as a cyber-junior asking for validation, which is the opposite of the "this person actually gets this field" core value. Plus a non-cyber usability reviewer for Lighthouse-cosmetic-feel checks.

- **D-16 — Real-device QA: two specific committed devices.** Eren commits two specific devices at plan time. Recorded in `CHECKLIST-LAUNCH.md` as: `- [ ] iOS device — Model: ___, iOS version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___` and the same row for Android. Phase 4 verification stays `human_needed` for OPS-04 until both rows have `Test date` filled. BrowserStack and "defer to v1.1" are explicitly rejected: BrowserStack is not in the static-only / no-paid-services constraint; deferring leaves OPS-04 hanging across the milestone boundary.

- **D-17 — Lighthouse measurement target: deployed GH-Pages URL only.** Run via `npx @lhci/cli autorun --collect.url=https://eren-atalay.github.io/Portfolio_Website/` against the live deployed text shell, throttled to the Lighthouse "Slow 4G + Moto G4" preset. Localhost numbers explicitly rejected — they don't reflect GH-Pages cold-cache + CDN-edge reality. Run BOTH `?view=text` (text shell, must score Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90 per OPS-03) AND `?view=3d` (3D shell, advisory — no score gate, but no Lighthouse error / blank page).

### Claude's Discretion

User explicitly delegated these to the planner / executor:

- **Specific CC0 asset choice** — planner browses Poly Haven / Sketchfab CC0 / Quaternius and proposes 1-2 candidates; Eren picks during execution. Constraint: < 2 MB Draco-compressed final, 1 desk + 3 monitors + 1 lamp + 1 bookshelf-or-equivalent.
- **`gltfjsx --transform` flag set** — planner picks defaults plus draco compression level (KTX2 q=8, draco level=10 are standard).
- **`<PerformanceMonitor>` `flipflops` count and `iflag` thresholds** — planner picks per drei recommended pattern.
- **EffectComposer `multisampling` setting** — likely 0 (postprocessing default); planner verifies for Bloom quality.
- **Honeypot field naming** — `botcheck`, `phone_hidden`, or `_gotcha` are all acceptable; planner picks one and documents in code.
- **Form validation library** — none required for v1 (HTML5 `required` + simple regex is sufficient); zod / vee-validate explicitly NOT required.
- **OG image artwork** — planner / Eren collaborate during execution. Constraint: 1200×630, real screenshot of the deployed text shell hero, PNG, < 200 KB. Tools: macOS native screenshot + ImageOptim / squoosh.app; no Figma / paid tools required.
- **JSON-LD `Person` schema field selection** — Phase 1 D-09 already locked the field list (name, jobTitle, nationality/homeLocation, url, sameAs, email obfuscated, image). Phase 4 verifies it ships in production HTML.
- **sitemap.xml + robots.txt content** — minimal: sitemap lists `/`, `/?view=3d`, `/?focus=projects`, `/?focus=writeups`, `/?focus=certs`, `/?focus=contact`. robots.txt allows all + `Sitemap:` line. Planner generates at build time or static-authors.
- **Lighthouse runs at execution: number of attempts** — recommended: 3 runs, take median, document actual numbers in `CHECKLIST-LAUNCH.md`.
- **Web3Forms access key delivery to GH Actions** — planner picks: `VITE_WEB3FORMS_KEY` is a public-token-style key (Web3Forms keys are designed to be public — they identify the form, not authenticate). Either repo Variable or hardcoded in env at build time is acceptable; document which.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`src/ui/BracketLink.tsx`** — terminal-style anchor / button (Phase 2 D-09); use for `[send another]`, `[retry]`, `[TryHackMe profile]`, `[HackTheBox profile]`.
- **`src/ui/TerminalPrompt.tsx`** — `$ command` styled prompt block; use for success/failure states in ContactForm.
- **`src/lib/obfuscate.ts`** — email decode (Phase 1 TXT-04); the failure-state `[email (click to reveal)]` reuses this verbatim.
- **`src/scene/Workstation.tsx`** — current procedural workstation; the `<group>` mount point becomes the `<primitive object={glb.scene}>` mount with the same transform.
- **`src/3d/cameraPoses.ts`** (Phase 3 D-08) — three monitor focus poses; survives the GLB swap unchanged per D-03 above.
- **`src/3d/MonitorOverlay.tsx`** (Phase 3) — drei `<Html transform occlude="blending">` wrapper; `distanceFactor` here is the only knob that may need tuning post-GLB.
- **`src/lib/useReducedMotion.ts`** (Phase 1 TXT-05) — for any postprocessing-tier-flip animation gating (D-07 already says no animation, but kept available).
- **`.planning/CHECKLIST-OPSEC.md`** (Phase 1, extended Phase 3) — extend, don't replace.
- **`scripts/check-parity.mjs`** (Phase 3 D-19) — TXT-06 parity gate; CI extends it to assert ContactForm presence in both shells.

### Established Patterns

- **Shared-shell components live in `src/ui/`** and are rendered by both `<TextShell />` and `<MonitorOverlay />` — single source of truth (Phase 3 D-01 / TXT-06).
- **Tailwind v4 `@theme` tokens** for all colors (Phase 1 D-09); never hex literals in JSX.
- **Lazy-loaded 3D bundle** with Suspense fallback = text shell skeleton (Phase 2 D-01); the `@react-three/postprocessing` import joins this lazy chunk.
- **`size-limit` budgets** (Phase 2 OPS-02) — text shell <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB. The postprocessing addition will push the 3D chunk closer to ceiling — measure during execution; if over, planner trims.
- **CI gates run before deploy** (Phase 1 D-15/D-16): tsc → eslint → prettier → tests → size-limit → build → 404.html copy → upload-pages-artifact → deploy-pages.
- **Query-param routing** (Phase 1 FND-03): `?view=text|3d&focus=…`; Lighthouse runs against both `?view=text` and `?view=3d` URLs.
- **`prefers-reduced-motion`** honoured site-wide (Phase 1 TXT-05); postprocessing Bloom intensity does not need a reduced-motion gate (it's static), but any tier-flip animation does.
- **`import.meta.env.DEV`** gates dev-only helpers (CLAUDE.md "What NOT to Use"); Phase 4 dev-helper-strip verifies `<Stats>`, `<Perf>`, `leva`, `r3f-perf` all live behind this gate.

### Integration Points

- **`src/scene/Workstation.tsx`** — primary GLB swap target. The procedural primitives `<Desk />`, `<Monitor />` ×3, `<Lamp />`, `<Bookshelf />` get replaced by a single `<primitive object={glb.scene}>` import via drei `useGLTF`.
- **`src/3d/EffectComposer.tsx`** (NEW, Phase 4) — `<PerformanceMonitor>` wrapper that conditionally renders `<EffectComposer>` with the four effects on `'high'` tier.
- **`src/sections/Contact.tsx`** (Phase 1 stub) — replace stub with mounted `<ContactForm />`.
- **`src/sections/Certifications.tsx`** (Phase 1) — append `<LiveProfiles />` sub-list at the bottom (TryHackMe + HackTheBox).
- **`src/3d/MonitorOverlay.tsx`** — center monitor's content extends to include `<ContactForm />` at the bottom of the existing About+Skills scrollable region.
- **`index.html`** — meta tags (`og:image`, `og:title`, `og:description`, `twitter:card`), JSON-LD `<script type="application/ld+json">`, CSP `<meta http-equiv="Content-Security-Policy">` extension if Web3Forms endpoint requires it.
- **`public/sitemap.xml`** + **`public/robots.txt`** — new files; vite copies to `dist/` at build.
- **`.github/workflows/deploy.yml`** — extend with a Lighthouse-CI job (advisory, post-deploy, non-blocking for v1.0 — the manual deployed-URL Lighthouse run remains the source of truth for the OPS-03 sign-off).

</code_context>

<specifics>
## Specific Ideas

- **Web3Forms key strategy:** key is public-by-design (it identifies the form on Web3Forms' side, not a secret). Either commit to repo or set as build-time env var; both work. Planner picks based on whether Eren wants the key visible in repo history or only in deployed bundle.
- **CC0 asset shortlist (planner research target):** Poly Haven "office" / "desk" CC0 scenes; Quaternius modular "office kit"; Sketchfab CC0-filter "workstation"; Three.js examples may include CC0 desks. Planner picks 2 candidates with thumbnails for Eren to choose during execution.
- **`whoami` greeting on the real GLB:** if the real GLB's center monitor screen plane has different aspect ratio than procedural (16:10 vs 16:9 vs 4:3), the `<Html transform>` `distanceFactor` adjusts but the content stays the same. No content-rewriting needed.
- **Honeypot UX:** silent success on bot detection (don't reveal that the form caught a bot — defeats the bot's retry logic).
- **Reduced-motion compatibility:** postprocessing Bloom is static (no movement), so it's compatible with `prefers-reduced-motion: reduce`. Scanline is also static (it's a fixed CRT-style overlay, not a moving line). The only postprocessing element that *could* read as motion is Noise — opacity 0.04 is so low it reads as static grain, not movement, so reduced-motion doesn't disable it. Planner verifies this read on devices with reduced-motion enabled.

</specifics>

<deferred>
## Deferred Ideas

- **Plan 03-06 MDX write-ups** — stays deferred per "no fabricated lab evidence" rule (saved feedback memory). Re-opens when Eren has actually run the labs (Splunk + Sigma rule, MalwareBazaar triage, PortSwigger JWT lab) and has real findings to write up.
- **Custom CRT shader on monitor surfaces** — V2-3D-02; postprocessing Bloom + Scanline is the v1 substitute.
- **Real Blender-modelled workstation** — V2-3D-01; CC0+customise is the v1 substitute, with the explicit 7-day timebox fallback (D-04) to skip GLB entirely if it blocks.
- **Privacy-respecting analytics** — V2-POL-02; v1 ships with no analytics per PROJECT.md privacy constraint.
- **HashRouter / per-write-up shareable URLs** — V2-RTE-01; query-param routing is sufficient for v1.

</deferred>
