# Phase 4: Real Asset, Postprocessing, Polish, Pre-Launch QA — Research

**Researched:** 2026-05-08
**Domain:** CC0-licensed GLB asset selection + `gltfjsx --transform` Draco/KTX2 pipeline; `@react-three/postprocessing@~3.0.4` (Bloom + Scanline + ChromaticAberration + Noise) gated by drei `<PerformanceMonitor>` v10.7.7; Web3Forms contact form integration; OG image + JSON-LD + sitemap.xml SEO completeness; `@lhci/cli` mobile audits against deployed GH Pages URL; pre-launch checklist execution + real-device QA + peer review
**Confidence:** HIGH on stack pinning + R3F integration recipes (`@react-three/postprocessing@3.0.4` source inspected locally; drei v10.7.7 API verified live); HIGH on Web3Forms API (endpoint + field shape verified against docs.web3forms.com); HIGH on `gltfjsx --transform` flag set (verified against pmndrs/gltfjsx README); MEDIUM on specific CC0 GLB candidate suitability (license + polygon counts confirmed for shortlist; final fit-to-frustum verification deferred to execution); MEDIUM on Web3Forms 250/mo free-tier limit (widely-cited but not on the public pricing page extract — see Open Questions)

---

## Summary

Phase 4 ships v1.0. Every visual + interaction contract is locked in `04-CONTEXT.md` (D-01..D-17) and `04-UI-SPEC.md`; the planner's job is to execute against those locks while filling concrete code-level gaps the locks left as Claude's discretion. Research scope is narrow by design — the planner needs verified API shapes, version-pinned commands, a CC0 asset shortlist, and explicit Lighthouse / OPSEC / device-QA execution steps, not architectural exploration.

The single non-obvious technical risk: **the literal CONTEXT D-08 prop names for Bloom (`threshold={0.6}`) do not match the underlying `postprocessing@6.39.x` API, which calls it `luminanceThreshold`.** The React wrapper passes unknown props through to the constructor — `threshold` would be silently ignored. The planner must use `luminanceThreshold={0.6}`. Equally non-obvious: `Scanline` and `Noise` in raw `postprocessing@6.x` do not have an `opacity` constructor option, but `@react-three/postprocessing`'s `wrapEffect` helper exposes `opacity` on EVERY effect by routing it to `blendMode-opacity-value`, so `<Scanline opacity={0.15}>` and `<Noise opacity={0.04}>` ARE valid through the React wrapper. Both confirmed by reading the local `node_modules/@react-three/postprocessing/src/util.tsx` source. **REQUIREMENTS 3D-08 stays correct as written, but the implementation must use `luminanceThreshold` (not `threshold`) when wiring CONTEXT D-08.**

**Primary recommendation:** Add **two** new dependencies — `@react-three/postprocessing@~3.0.4` (runtime, lazy-loaded) and `@playwright/test@~1.59.1` OR Playwright Chromium standalone (dev-only, for OG image capture). Optionally add `@lhci/cli@~0.15.1` (dev-only) for the deployed-URL Lighthouse run, though `npx lighthouse` against the live URL is acceptable per CONTEXT D-17 ("3 runs, take median, document"). Do NOT install `sharp` (PNG compression handled by `pngquant` via macOS ImageOptim or web-based squoosh.app per CONTEXT — no Node-side image processing in v1). Do NOT install `web3forms` SDK — Web3Forms has no SDK; it's a plain HTTP POST to a public endpoint.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### GLB Authoring Path

- **D-01 — Source: CC0-licensed asset + customise.** Use a CC0-licensed desk/monitor scene from Poly Haven, Sketchfab CC0 filter, or equivalent (license verified at planner time and recorded in `public/assets/workstation/LICENSE.txt`). Fastest credible path to a real asset. Blender-from-scratch, paid assets, and stay-procedural are explicitly rejected: Blender adds multi-day skill ramp; paid asset adds license risk + cost; staying procedural defeats 3D-08.

- **D-02 — Texture authoring: reuse baked maps + recompress to KTX2.** Use the source asset's existing baked AO+albedo+normal maps; pipeline through `gltfjsx --transform` (CLAUDE.md "What NOT to Use" forbids hand-rolling the gltf-transform CLI). Output: 1024² hero texture (desk surface) / 512² prop textures (monitors, lamp, bookshelf), KTX2 compressed, total bundle ≤ 2 MB on-disk (size-limit OPS-02 already enforces).

- **D-03 — Camera/scale retune: keep Phase 2 poses as-is.** Phase 2 D-04 locked R3F 1 unit = 1 metre and Phase 3 D-08 locked the three monitor click-to-focus poses. The CC0 asset is rescaled to fit the existing `position={[0,0,0]}` desk anchor; planner verifies frustum fit at default orbit pose. The ONLY pose-related tweak permitted is `distanceFactor` on each `<Html transform>` if the new monitor screen plane differs from procedural placeholder size — body text must remain readable per Phase 3 D-03.

- **D-04 — GLB authoring timebox: 7 days. Fallback: defer to v1.1.** If the GLB is not Draco-compressed and integrated by day 7 of Phase 4 (counted from Phase 4 plan execution start), the placeholder procedural workstation ships in v1.0 and the real GLB swap moves to v1.1 (V2-3D-01 already exists in REQUIREMENTS). 3D-08 is then marked PARTIAL (postprocessing ships, GLB doesn't) and the v1.1 milestone opens with V2-3D-01 promoted to first-class.

#### Postprocessing Pipeline + Tier Gating

- **D-05 — `<PerformanceMonitor>` thresholds: drei defaults.** `factor` triggers: avg fps ≥ 50 → high tier; ≤ 30 → low tier (drei default `bounds={[30, 50]}`). Battle-tested across the pmndrs ecosystem; do not invent custom thresholds without measured evidence on the real GLB scene.

- **D-06 — Tier states: binary `perfTier='high' | 'low'`.** Matches the literal text in ROADMAP success criterion #1. `'low'` disables the entire postprocessing pipeline (no Bloom, no Scanline, no CA, no Noise). `'high'` enables the full pipeline with the values in REQUIREMENTS 3D-08. No mid tier; if planner finds the binary too coarse during execution, escalate as a deviation rather than introducing a third state.

- **D-07 — Tier-flip-during-session UX: instant snap.** When `<PerformanceMonitor>` flips tier (either direction), effects mount/unmount immediately. No fade-out animation, no transition. Aligns with Phase 2 D-13 instant-cut precedent. Effects are Suspense-wrapped so unmounting is safe.

- **D-08 — Bloom tuning (D-08, the value, not the requirement):** `threshold={0.6} intensity={0.6} mipmapBlur luminanceSmoothing={0.025}`. Pulls just the emissive monitor green and lamp amber. Drei defaults (threshold 0.85, intensity 1.0) overcooked the procedural scene; tuned values are the v1 ship. Scanline (density 1.25, opacity 0.15), ChromaticAberration (offset 0.0008), and low Noise (opacity 0.04) are locked verbatim from REQUIREMENTS 3D-08.

- **D-09 — `<EffectComposer>` mounted as a Suspense-deferred sibling of the workstation under `perfTier='high'`. Lazy-loaded `@react-three/postprocessing` chunk so low-tier devices never download postprocessing JS.

#### Web3Forms Contact Flow + Outbound Profile Links

- **D-10 — Form mount points: shared component, both shells.** New `src/ui/ContactForm.tsx` (single source of truth). Mounted in: text shell `<Contact />` section (anchor `#contact`); 3D shell center monitor (appended below About + Skills).

- **D-11 — Form fields:** `name` (required, max 80), `email` (required, regex), `message` (required, max 2000), `botcheck` (honeypot — silent abort), `subject` (interpolated `[Portfolio enquiry] from <Name>`), `access_key` (env var `VITE_WEB3FORMS_KEY`, public-by-design).

- **D-12 — Success state UX: inline terminal block replace.** 200-OK → `$ message_sent` block with `[send another]`. Failure → `$ message_failed` block with `[email (click to reveal)]` + `[retry]`.

- **D-13 — TryHackMe + HackTheBox placement:** primary in **Certifications block** as `## Live profiles` sub-list; secondary as a `See also:` shortcut line in **Contact**. Real handles required from Eren at execution time; missing platform omitted (no empty placeholder).

#### Pre-Launch Checklist + Peer Review

- **D-14 — Checklist file split: keep OPSEC, add LAUNCH.** `.planning/CHECKLIST-OPSEC.md` (existing) stays OPSEC-only. `.planning/CHECKLIST-LAUNCH.md` (NEW) covers operational launch concerns. Phase 4 verification reads BOTH; both must be fully checked before milestone-complete.

- **D-15 — Cyber-pro peer reviewer: named contact.** Eren names ONE specific cyber-professional contact at plan time. Recorded in `CHECKLIST-LAUNCH.md`. Anonymous public-sub feedback rejected (Pitfall 7 trap). Plus a non-cyber usability reviewer.

- **D-16 — Real-device QA: two specific committed devices.** Eren commits two specific devices at plan time. Phase 4 verification stays `human_needed` for OPS-04 until both rows have `Test date` filled. BrowserStack and "defer to v1.1" rejected.

- **D-17 — Lighthouse measurement target: deployed GH-Pages URL only.** Run via `npx @lhci/cli autorun --collect.url=https://eren-atalay.github.io/Portfolio_Website/` against the live deployed text shell, throttled to "Slow 4G + Moto G4" preset. Localhost numbers explicitly rejected. Run BOTH `?view=text` (must score Performance ≥80, A11y ≥90, BP ≥90, SEO ≥90) AND `?view=3d` (advisory, no score gate).

### Claude's Discretion

User explicitly delegated these to the planner / executor:

- **Specific CC0 asset choice** — planner browses Poly Haven / Sketchfab CC0 / Quaternius / The Base Mesh and proposes 2 candidates; Eren picks during execution. Constraint: < 2 MB Draco-compressed final, 1 desk + 3 monitors + 1 lamp + 1 bookshelf-or-equivalent.
- **`gltfjsx --transform` flag set** — planner picks defaults plus draco compression level + KTX2 quality (research recommendation below: `--transform --resolution 1024 --format webp` is the tool's default; KTX2 is NOT directly exposed by gltfjsx — see Pattern 2).
- **`<PerformanceMonitor>` `flipflops` count and `iflag` thresholds** — planner picks per drei recommended pattern (research recommendation: `flipflops={3}` to bail-out after 3 ping-pong flips and stick on low tier; bounds function form `(refreshrate) => [30, 50]`).
- **EffectComposer `multisampling` setting** — likely 0 (postprocessing default); planner verifies for Bloom quality. **Research correction: the React-wrapper default is `multisampling={8}`, NOT 0** (verified in node_modules source). Setting to 0 explicitly disables MSAA — recommendation below: `multisampling={0}` for low-end GPUs since Bloom mipmapBlur is the dominant antialiasing path; 8 is overkill for the dark scene.
- **Honeypot field naming** — `botcheck`, `phone_hidden`, or `_gotcha` are all acceptable; planner picks one and documents in code. Recommendation: `botcheck` (Web3Forms canonical name + matches CONTEXT D-11).
- **Form validation library** — none required for v1 (HTML5 `required` + simple regex is sufficient); zod / vee-validate explicitly NOT required.
- **OG image artwork** — planner / Eren collaborate during execution. Constraint: 1200×630, real screenshot of the deployed text shell hero, PNG, < 200 KB.
- **JSON-LD `Person` schema field selection** — Phase 1 D-09 already locked the field list; Phase 4 verifies it ships in production HTML.
- **sitemap.xml + robots.txt content** — minimal: sitemap lists `/`, `/?view=3d`, `/?focus=projects`, `/?focus=writeups`, `/?focus=certs`, `/?focus=contact`. robots.txt allows all + `Sitemap:` line.
- **Lighthouse runs at execution: number of attempts** — recommended: 3 runs, take median, document actual numbers in `CHECKLIST-LAUNCH.md`.
- **Web3Forms access key delivery to GH Actions** — public-token-style key.

### Deferred Ideas (OUT OF SCOPE)

- **Plan 03-06 MDX write-ups** — stays deferred per "no fabricated lab evidence" rule. Re-opens when Eren has actually run the labs.
- **Custom CRT shader on monitor surfaces** — V2-3D-02; postprocessing Bloom + Scanline is the v1 substitute.
- **Real Blender-modelled workstation** — V2-3D-01; CC0+customise is the v1 substitute, with the explicit 7-day timebox fallback (D-04) to skip GLB entirely if it blocks.
- **Privacy-respecting analytics** — V2-POL-02; v1 ships with no analytics per PROJECT.md privacy constraint.
- **HashRouter / per-write-up shareable URLs** — V2-RTE-01; query-param routing is sufficient for v1.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **3D-08** | Postprocessing pipeline — Bloom + Scanline (density 1.25, opacity 0.15) + ChromaticAberration (offset 0.0008) + low Noise; gated by drei `<PerformanceMonitor>` and disabled on low-perf tier; no DOF, no SSAO, no permanent Glitch | Pattern 3 (`<EffectComposer>` lazy + Suspense), Pattern 4 (`<PerformanceMonitor>` binary tier flip with `flipflops`), Pattern 5 (Bloom/Scanline/CA/Noise prop names — **`luminanceThreshold` correction** + `opacity` via wrapEffect blendMode-opacity-value), Pattern 6 (chunk separation + size-limit headroom check) |
| **CTC-01** | Web3Forms contact form (free tier, 250/mo), endpoint in `VITE_FORM_ENDPOINT`; verified end-to-end into both Gmail and Outlook (not spam) before launch | Pattern 7 (Web3Forms POST + JSON response shape), Pattern 8 (honeypot `botcheck` + silent-success), Pattern 9 (env var injection via `import.meta.env.VITE_WEB3FORMS_KEY`), Pattern 10 (Gmail + Outlook delivery verification protocol — fresh inbox, check spam folder, "reply-to" trip) |
| **CTC-03** | TryHackMe and HackTheBox profile links surfaced near contact / certifications | Pattern 11 (`<LiveProfiles />` sub-list with single-platform fallback), Pattern 12 (extending `Identity` type with `tryHackMeUrl?`, `tryHackMeHandle?`, `hackTheBoxUrl?`, `hackTheBoxHandle?`) |
| **OPS-03** | Lighthouse on text shell — Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90 | Pattern 13 (`@lhci/cli autorun` with `--collect.url` against deployed GH Pages URL; mobile preset is the default; throttling `simulate` + `cpuSlowdownMultiplier=4` matches "Slow 4G + Moto G4"), Pattern 14 (assertion config: `categories:performance ≥ 0.8`, `categories:accessibility ≥ 0.9`, etc.), Pattern 15 (median-of-3 protocol; Lighthouse-CI advisory job in deploy.yml) |
| **OPS-04** | Real-device QA pass on iOS (one mid-tier model) and Android (3-4 GB RAM tier) before launch | Pattern 16 (5-step real-device test protocol: text-shell load < 5s, contact reveal works, 3D shell mounts OR refuses gracefully, scroll captures DON'T trap on Canvas, contact form submits and lands in inbox), Pattern 17 (iOS Safari WebGL2 quirks — `prefers-reduced-motion` + memory pressure tests) |
| **OPS-05** | Pre-launch checklist executed (≈25 items: redirects, OG image, favicon, console errors, Lighthouse, dev-helper strip via `import.meta.env.DEV`, `npm audit` clean, external links `rel="noopener noreferrer"`, etc.) | Pattern 18 (`CHECKLIST-LAUNCH.md` 14-item structure per CONTEXT D-14), Pattern 19 (CI-gate-able items vs human-eyes items split), Pattern 20 (`grep` audits for dev-helper strip + `target="_blank"` `rel` audit + plaintext-email-in-bundle audit) |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

These are the actionable directives the planner must honour. They are derived from `./CLAUDE.md` and treated with the same authority as locked CONTEXT decisions.

| Constraint | Source | Implication for Phase 4 |
|------------|--------|--------------------------|
| Stack pins: React 19.2, TS 5.9, Vite 8, Tailwind v4, R3F 9.6, three 0.184, drei 10.7, postprocessing 3.0 | CLAUDE.md "Technology Stack" | Phase 4 inherits Phase 1+2+3 pins. ONE new runtime dep: `@react-three/postprocessing@~3.0.4`. Pin tilde NOT caret per Pitfall 16. |
| `@react-three/postprocessing` for CRT effects (Bloom + Scanline + CA + low Noise) | CLAUDE.md "Recommended Stack" | Phase 4 effects come from this package. NO custom shaders (CLAUDE.md "What NOT to Use"). |
| Pinned `three@~0.184.0` is at the upper edge of `postprocessing@6.x` peer range (`>= 0.168.0 < 0.185.0`) | npm registry verification 2026-05-08 | Compatible TODAY. If three publishes 0.185 before R3F bumps drei/postprocessing, hold three at ~0.184 — do NOT upgrade three independently per Pitfall 16. |
| Avoid DOF, SSAO, permanent Glitch | CLAUDE.md "What NOT to Use" + REQUIREMENTS 3D-08 | Phase 4 ships exactly four effects (Bloom + Scanline + CA + Noise). NO Glitch even on hero boot-up. |
| `<Stats>`, `<Perf>`, `leva`, `r3f-perf` behind `import.meta.env.DEV` | CLAUDE.md "What NOT to Use" | Phase 4 dev-helper-strip CI gate verifies these never appear in `dist/assets/*.js`. |
| Web3Forms over Formspree | CLAUDE.md "Recommended Stack" | Web3Forms 250/mo free tier; access key public-by-design. |
| `@react-three/a11y` is unmaintained — DO NOT INSTALL | CLAUDE.md "What NOT to Use" | Accessibility = 2D fallback shell + reduced-motion + keyboard-nav (already in place). Phase 4 doesn't re-open this. |
| `motion` (formerly `framer-motion`) — `motion/react` import path | CLAUDE.md "Animation" | Phase 4 ships ZERO new motion (D-07 instant tier flip; static postprocessing). The dep is NOT needed for Phase 4. |
| GSAP free in 2026 | CLAUDE.md verified-version table | Phase 4 doesn't add new GSAP usage. |
| `@react-three/postprocessing` must be lazy-loaded (don't ship to mobile-text path) | CLAUDE.md OPSEC + Phase 2 OPS-02 | Phase 4 imports `@react-three/postprocessing` ONLY inside the lazy-loaded `<ScenePostprocessing>` chunk so text-shell budget is not affected. |
| `import.meta.env.DEV` gates `leva` / `r3f-perf` | CLAUDE.md anti-pattern | Phase 4 dev-helper strip CI gate audits this. |
| GH Pages base path `/Portfolio_Website/` | Phase 1 lock | OG image meta + sitemap.xml URLs use the absolute `https://eren-atalay.github.io/Portfolio_Website/...` form per Phase 1's existing index.html. **Note:** current STATE.md uses `erenatalaycs.github.io` (verified live in `index.html` and `public/sitemap.xml`); CONTEXT D-17 uses `eren-atalay.github.io`. Eren picks at execution; whichever wins must propagate to JSON-LD + sitemap + OG image absolute URLs. |
| Source maps OFF in production | CLAUDE.md OPSEC | `vite.config.ts` already `build.sourcemap: false`. Phase 4 must not re-enable. |
| OPSEC pipeline (`exiftool -all=`) | CLAUDE.md "OPSEC & Polish" + Pitfall 5 | OG image is a fresh attack surface — runs through the exiftool CI gate already in deploy.yml. New CHECKLIST-LAUNCH item explicitly verifies the OG image was screenshotted with no leaking notifications/tabs. |
| `localStorage` writes for view/focus/cameraMode/perfTier forbidden | Phase 2 D-12 | `perfTier` is component-local React state; never persisted. Aligns with CONTEXT § Source-of-Truth Cross-Reference. |
| Plagiarised CTF write-ups forbidden | REQUIREMENTS OOS + Pitfall 7 | Plan 03-06 stays deferred. Phase 4 does NOT regenerate or fabricate write-ups. |

## Architectural Responsibility Map

Phase 4 is fully client-side + build-time + CI-time. The map below clarifies which sub-tier owns each capability.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| GLB asset selection + license verification | Author (Eren, manual) | — | Off-CI human review; license recorded in `LICENSE.txt`. |
| GLB compression pipeline (`gltfjsx --transform`) | Author (one-shot CLI at integration time) | — | Run-once tool; produces optimized `.glb` + typed `.tsx`. NOT run at build time per CLAUDE.md and Phase 2's existing pattern. |
| GLB consumption (drei `useGLTF`) | Browser / Client | Vite (asset hashing + base path) | Standard drei territory; loaded inside the lazy 3D chunk. |
| `<EffectComposer>` rendering | Browser / Client (R3F + WebGL via postprocessing) | — | Standard postprocessing territory. Lives inside the lazy 3D chunk. |
| `<PerformanceMonitor>` fps probe | Browser / Client (drei v10.7.7) | — | Drei reads `state.gl` per frame; computes rolling avg fps. |
| `perfTier` state machine | Browser / Client (component-local React state inside `<ScenePostprocessing>`) | — | Ephemeral per CONTEXT D-06 — never URL, never localStorage. |
| Tier-flip mount/unmount | Browser / Client (React conditional render + Suspense) | — | Suspense-wrapped child; mount/unmount is instant per D-07. |
| `<ContactForm />` submission | Browser / Client (`fetch` to `https://api.web3forms.com/submit`) | External: Web3Forms API (third-party SaaS) | Cross-origin POST; no backend. CSP `connect-src` must allow `api.web3forms.com`. |
| Form validation | Browser / Client (HTML5 `required`/`pattern`/`maxLength` + minimal `useState` for inline error) | — | No validation library per CONTEXT D-11. |
| Web3Forms access key | Build (Vite `import.meta.env.VITE_WEB3FORMS_KEY` static replacement) | — | Public-by-design key; statically inlined at build time. NOT a secret. |
| OG image generation | Author (one-shot — macOS screenshot + ImageOptim, OR Playwright headless capture script) | — | Run-once at integration; PNG committed to `public/assets/og-image.png`. |
| sitemap.xml + robots.txt | Static (committed to `public/`, copied to `dist/` by Vite) | — | NOT runtime-generated; the URL list is small + stable. |
| JSON-LD Person schema | Static (in `index.html`, statically rendered before Vite touches it) | — | Already shipped Phase 1; Phase 4 verifies it survives deploy. |
| CSP `<meta>` tag | Static (in `index.html`) | — | Phase 1 ships baseline; Phase 4 EXTENDS `connect-src` to allow `https://api.web3forms.com`. |
| Lighthouse audit | CI (advisory, post-deploy) + Author (manual median-of-3, source of truth) | — | CONTEXT D-17: deployed-URL only, Lighthouse-CI in deploy.yml is advisory non-blocking, Eren's manual run is the OPS-03 sign-off. |
| Real-device QA | Author (manual, in-hand on 2 committed devices) | — | OPS-04 stays `human_needed` until rows in CHECKLIST-LAUNCH.md filled. |
| Peer review | Author (off-site reviewer) | — | OPS-05 last gate. |
| Pre-launch checklist execution | Author + CI hybrid | — | CI handles greppable items (dev-helper strip, `target="_blank"` `rel` audit, npm audit, EXIF strip); human handles judgment items (screenshot review, peer-review verdict). |

**Why this matters:** Phase 4's only truly novel runtime is the postprocessing pipeline + Web3Forms POST. Everything else is integration of existing infrastructure (deploy workflow, OPSEC pipeline, content layer). The planner must NOT introduce new runtime dependencies beyond `@react-three/postprocessing` — adding a form library or analytics library would violate the size budget AND the privacy constraint.

---

## Standard Stack

### Core (Phase 4 additions only — Phase 1+2+3 stack inherited verbatim)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **`@react-three/postprocessing`** | `~3.0.4` | Declarative postprocessing wrappers — `<EffectComposer>`, `<Bloom>`, `<Scanline>`, `<ChromaticAberration>`, `<Noise>` | Wraps the underlying `postprocessing@6.39.x` library declaratively. Pairs with R3F 9.x (peer `@react-three/fiber: ^9.0.0`) and three 0.184 (postprocessing peer `>= 0.168.0 < 0.185.0`). `[VERIFIED: npm view @react-three/postprocessing@latest version → 3.0.4, 2026-05-08]` `[VERIFIED: peerDependencies @react-three/fiber: ^9.0.0, react: ^19.0, three: >= 0.156.0]` |

### Supporting (dev-only Phase 4 additions)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`@playwright/test`** | `~1.59.1` | Headless Chromium for OG image capture (`page.setViewportSize({width:1200, height:630}) → page.screenshot()`); optional smoke test for the deployed URL | Optional. macOS native screenshot + ImageOptim is the simpler path per CONTEXT § Claude's Discretion. Playwright is the Node-script alternative if Eren wants a reproducible OG image generator. **Recommendation: skip for v1** unless OG image needs to be regenerated frequently. `[VERIFIED: npm view @playwright/test@latest version → 1.59.1, 2026-05-08]` |
| **`@lhci/cli`** | `~0.15.1` | Lighthouse CI runner against the deployed URL; produces JSON + HTML reports, optionally uploads to `temporary-public-storage` | Optional. CONTEXT D-17 says "via `npx @lhci/cli autorun`" — using `npx` keeps it as a one-shot tool, not a committed devDep. **Recommendation: use `npx`, do NOT install as devDep** so the entry doesn't bloat package.json for a one-shot tool. `[VERIFIED: npm view @lhci/cli@latest version → 0.15.1, 2026-05-08]` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@react-three/postprocessing` | Hand-rolled `<EffectComposer>` from raw `postprocessing@6.x` | Doable but reinvents the React lifecycle integration that the wrapper provides (`extend()`, `useThree()` camera/scene wiring, `wrapEffect` opacity prop). The pmndrs ecosystem standard. **Choose `@react-three/postprocessing`.** |
| `@react-three/postprocessing@3.0.4` | `@react-three/postprocessing@2.x` | v2 is the React 18 / R3F 8 line. We're on React 19 + R3F 9. **Choose v3.** `[CITED: pmndrs/react-postprocessing CHANGELOG]` |
| Web3Forms | Formspree | Formspree free tier is 50/month; Web3Forms is 250/month per CLAUDE.md and CONTEXT § Specifics. Web3Forms wins on free-tier headroom. `[ASSUMED on the 250/mo limit — see Open Questions; verified on Formspree's 50/mo via their public pricing.]` |
| Web3Forms | EmailJS | EmailJS sends from the browser; the Service ID is exposed in source. Less professional for a portfolio. **Choose Web3Forms.** |
| Web3Forms `botcheck` honeypot | hCaptcha (free, zero-config on Web3Forms) | hCaptcha adds a CAPTCHA challenge that frustrates legitimate users. CONTEXT D-11 picked honeypot (silent + invisible to humans). **Choose honeypot.** Note: Web3Forms docs label honeypot "depreciated" but still functional. |
| `npx @lhci/cli autorun` | `npx lighthouse https://...` (raw Lighthouse CLI) | Raw `lighthouse` produces a single report; `lhci autorun` runs 3× by default + asserts thresholds + uploads to `temporary-public-storage` (free) for shareable reports. CONTEXT D-17 specifies `lhci autorun`. **Choose `lhci`.** |
| `npx @lhci/cli` (one-shot) | Add `@lhci/cli` to devDependencies + `npm run lighthouse` script | One-shot keeps package.json clean. Trade-off: each run downloads ~70 MB of Chrome + lhci. Acceptable for once-per-release manual runs. **Choose one-shot `npx`.** |
| Playwright for OG image | macOS native screenshot (`Cmd-Shift-4 → space → click window`) + ImageOptim drag-and-drop | Manual macOS screenshot is ~30 seconds and produces an authentic 1200×630 if window sized correctly. Playwright is reproducible but adds 70 MB Chromium dep. CONTEXT § Claude's Discretion explicitly mentions both. **Choose macOS native** as the v1 default; Playwright as escape hatch if Eren wants reproducibility. |
| `sharp` for PNG compression | ImageOptim (macOS GUI) or squoosh.app (web) | sharp adds 30 MB of native binary deps. ImageOptim/squoosh is one-shot and free. **Choose ImageOptim/squoosh.** |
| Add `@react-three/postprocessing` to manualChunks | Rely on dynamic-import auto-chunking | Phase 2 RESEARCH already established that `manualChunks` BREAKS lazy loading. The lazy-load pattern in CONTEXT D-09 works automatically. **Do NOT add manualChunks.** `[CITED: github.com/vitejs/vite/issues/17653; Phase 2 02-RESEARCH.md]` |

**Installation (exact npm command for the planner):**

```bash
# Runtime dep (lazy-loaded — ships in 3D chunk only, not text-shell entry)
npm install @react-three/postprocessing@~3.0.4
```

**Version verification (run before Phase 4 Plan 01 starts):**

```bash
npm view @react-three/postprocessing@latest version  # Expected: 3.0.4
npm view @react-three/postprocessing@latest peerDependencies  # Expected: { @react-three/fiber: ^9.0.0, react: ^19.0, three: >= 0.156.0 }
npm view postprocessing@latest peerDependencies     # Sanity check: { three: '>= 0.168.0 < 0.185.0' }
```

Verified at research time (`2026-05-08`):
- `@react-three/postprocessing@3.0.4` (peers: R3F ^9, React ^19, three >= 0.156)
- `postprocessing@6.39.1` (transitive; three >= 0.168.0 < 0.185.0)
- `n8ao@1.9.4`, `maath@0.6+` (transitive; not directly imported)
- `@lhci/cli@0.15.1` (one-shot via npx; do NOT install)

**Tilde ranges (`~`) NOT caret (`^`):** Pitfall 16. `~3.0.4` allows patch bumps (`3.0.5`, `3.0.6`...) but locks minor. No new caret deps in Phase 4.

**Tight version interlock to flag:** `postprocessing@6.39.x` peer `three < 0.185.0`. Our `three@~0.184.0` resolves to `0.184.x`. If `npm install` ever picks `0.185.0+`, postprocessing will install a peer-warning. Mitigation: keep three pinned at `~0.184` — this is already the project policy.

**No new runtime deps beyond `@react-three/postprocessing`.** Specifically NOT installing in Phase 4: `web3forms` SDK (no SDK exists; raw `fetch`), `sharp` (use ImageOptim/squoosh), `@playwright/test` (use macOS screenshot), `@lhci/cli` (use `npx`), zod / vee-validate / react-hook-form (HTML5 validation only per CONTEXT D-11), shadcn / Radix (UI-SPEC declines — declined for v1.0).

---

## Architecture Patterns

### System Architecture Diagram

```
                       User opens https://eren-atalay.github.io/Portfolio_Website/[?view=…]
                                              |
                                              v
                                  +-----------------------+
                                  |  index.html           |
                                  |  - <meta og:image>    |
                                  |  - JSON-LD Person     |
                                  |  - CSP connect-src    |
                                  |    +api.web3forms.com |
                                  +----------+------------+
                                              |
                                              v
                                  +-----------------------+
                                  |  <App />              |
                                  |  - reads ?view=       |
                                  |  - capability gate    |
                                  +---+---------------+---+
                                      |               |
                              text-shell           3D shell
                                      |               |
              +----------------------+               +-------------------------------+
              | <TextShell>          |               | <ThreeDShell>                 |
              |   <Header>           |               |   <Header>                    |
              |   <Hero>             |               |   <main>                      |
              |   <About>            |               |     <Canvas dpr={[1,1.5]}>    |
              |   <Skills>           |               |       <Lighting>              |
              |   <Projects>         |               |       <Workstation>           |
              |   <Writeups>         |               |         + REAL GLB (Phase 4)  |
              |   <Certs>            |               |           or procedural       |
              |     + LiveProfiles   |               |       <Camera/Controls>       |
              |       (NEW Phase 4)  |               |       <ScenePostprocessing>   |
              |   <Education>        |               |         <PerformanceMonitor>  |
              |   <Contact>          |               |         {tier === 'high' &&   |
              |     + ContactForm    |               |          <Suspense fallback={ |
              |       (NEW Phase 4)  |               |           null}>              |
              |     + ShortcutLine   |               |           <PostFX>            |
              |       to LiveProfiles|               |             <Bloom            |
              |       (NEW Phase 4)  |               |               luminanceThreshold=
              |   <Footer>           |               |               {0.6}           |
              +----------------------+               |               intensity={0.6}>|
                                                     |             <Scanline         |
                                                     |               density={1.25}  |
                                                     |               opacity={0.15}> |
                                                     |             <ChromaticAberration
                                                     |               offset={[0.0008,
                                                     |               0.0008]}>      |
                                                     |             <Noise            |
                                                     |               opacity={0.04}> |
                                                     |           </PostFX>           |
                                                     |          </Suspense>          |
                                                     |         }                     |
                                                     |     </Canvas>                 |
                                                     |     <MonitorOverlay>          |
                                                     |       + ContactForm           |
                                                     |         (NEW Phase 4)         |
                                                     |   </main>                     |
                                                     +-------------------------------+

Phase 4 build-time:
   npm run build →
     1. parity (TXT-06 + CNT-03 + Pitfall 8) → blocks
     2. tsc --noEmit → blocks
     3. vite build →
        - dist/assets/index-*.js              ≤ 120 KB gz (size-limit)
        - dist/assets/ThreeDShell-*.js        ≤ 450 KB gz (postprocessing
                                                 lazy-imported INSIDE
                                                 ThreeDShell — adds ~25-35
                                                 KB gz; still inside budget)
        - dist/assets/PostFX-*.js             ~25-35 KB gz (NEW Phase 4 chunk)
        - dist/assets/workstation-*.glb       ≤ 2500 KB raw (size-limit)
     4. cp dist/index.html dist/404.html       SPA fallback
     5. size-limit                              fails on any over-budget entry
   actions/upload-pages-artifact → actions/deploy-pages → live

Phase 4 post-deploy:
   npx @lhci/cli autorun \
     --collect.url=https://eren-atalay.github.io/Portfolio_Website/?view=text \
     --collect.url=https://eren-atalay.github.io/Portfolio_Website/?view=3d \
     --collect.numberOfRuns=3 \
     --upload.target=temporary-public-storage \
     --assert.preset=lighthouse:no-pwa
```

### Recommended Project Structure (Phase 4 additions to Phase 3's tree)

```
src/
├── 3d/                                  # NEW directory (Phase 4 introduces — UI-SPEC § Postprocessing pipeline)
│   ├── ScenePostprocessing.tsx          # NEW — <PerformanceMonitor> + lazy <PostFX>
│   ├── PostFX.tsx                       # NEW — <EffectComposer> + Bloom + Scanline + CA + Noise
│   └── PostFX.test.tsx                  # NEW — render smoke test (renderer mocked)
│
├── ui/                                  # EXISTING (Phase 1+3)
│   ├── ContactForm.tsx                  # NEW — Web3Forms POST + honeypot + states
│   ├── ContactForm.test.tsx             # NEW — submit handler unit tests
│   ├── LiveProfiles.tsx                 # NEW — TryHackMe + HackTheBox sub-list
│   └── … (existing Phase 1+3 files)
│
├── lib/                                 # EXISTING
│   └── web3forms.ts                     # NEW — POST helper (single source of truth for endpoint URL + field marshalling)
│
├── content/
│   └── identity.ts                      # EDIT — add tryHackMeUrl?, tryHackMeHandle?, hackTheBoxUrl?, hackTheBoxHandle?
│
├── scene/
│   └── Workstation.tsx                  # EDIT — replace <Floor>/<Desk>/<Monitor>/<Lamp>/<Bookshelf> primitives with <primitive object={glb.scene}> (D-04 fallback: keep Phase 2 primitives if 7-day timebox blows)
│
├── sections/
│   ├── Contact.tsx                      # EDIT — append <ContactForm> + <LiveProfilesShortcut>
│   └── Certs.tsx                        # EDIT — append <LiveProfiles> sub-list
│
public/
├── assets/
│   ├── workstation/                     # NEW directory
│   │   ├── workstation.glb              # NEW — Draco-compressed GLB ≤ 2 MB
│   │   └── LICENSE.txt                  # NEW — CC0 attestation per CONTEXT D-01
│   ├── og-image.png                     # REPLACE Phase 1 placeholder (real screenshot)
│   └── models/workstation.glb           # ALREADY EXISTS Phase 2 placeholder — choose: relocate to public/assets/workstation/ OR keep path; whichever, update size-limit glob if path changes
│
├── sitemap.xml                          # EDIT — populate with 6 URLs (currently only 1 entry)
└── robots.txt                           # NO CHANGE (already correct; possibly update host if Eren switches between erenatalaycs/eren-atalay)

scripts/
├── check-parity.mjs                     # EDIT — Phase 3 already enforces TXT-06; Phase 4 adds optional ContactForm-presence assertion (low priority — Workstation.tsx + Contact.tsx Vite import resolution already breaks the build if either is missing)
└── og-screenshot.mjs                    # OPTIONAL NEW — Playwright OG image generator (only if Eren picks Playwright path)

.github/workflows/
└── deploy.yml                           # EDIT — append OPTIONAL post-deploy advisory Lighthouse-CI job (CONTEXT D-17: advisory non-blocking)

.planning/
├── CHECKLIST-LAUNCH.md                  # NEW — operational launch checklist (CONTEXT D-14)
└── CHECKLIST-OPSEC.md                   # NO CHANGE (existing; Phase 4 verification reads it)

index.html                                # EDIT — extend CSP <meta> with `connect-src 'self' https://api.web3forms.com;` (currently only `connect-src 'self'`)
```

### Pattern 1: CC0 GLB Asset Shortlist (D-01)

**What:** Pre-vetted CC0-licensed candidate scenes for the workstation. Eren picks ONE during execution.

**When to use:** Phase 4 Plan 01 (the GLB authoring slice). Constraint: 1 desk + 3 monitors + 1 lamp + 1 bookshelf-or-equivalent, ≤ 2 MB after `gltfjsx --transform`.

**Recommended:** Compose the scene from CC0 component models rather than relying on a single asset that ships everything. Poly Haven offers individual desk/monitor/lamp/bookshelf models all CC0; assembling them in Blender (or via gltfjsx output combined in code) gives full control. The composite assembly is the v1 ship; a single-asset alternative is below for the timebox-blown path.

**Candidates (verified 2026-05-08 against polyhaven.com + sketchfab.com CC0 filter):**

| # | Source | Asset | License | Polys | Textures | Est. Post-Draco Size | Notes |
|---|--------|-------|---------|-------|----------|----------------------|-------|
| **1 (RECOMMENDED — composite)** | **Poly Haven** | **Metal Office Desk** (`metal_office_desk`) — desk only; pair with separate Poly Haven monitor/lamp/bookshelf models | **CC0** | 7K tris (desk) | 1K-8K available; use 2K (downsize to 1024² in pipeline) | ~0.6 MB desk + ~0.3 MB per prop × 5 = **~2.0 MB total post-`gltfjsx --transform`** | Cleanest license path. Composite means the planner imports each model individually then arranges in code — gives precise scale control; matches Phase 2 D-04 1m=1unit. **Pick this for v1.** `[VERIFIED: polyhaven.com/a/metal_office_desk — CC0; 7K tris; 20.72 MB at 4K source — well above 2MB before pipeline; pipeline gets it under budget.]` |
| **2 (alternative composite — sci-fi flavor)** | Quaternius | Ultimate Furniture Pack — has desk/computer/monitor primitives | **CC0** (per Quaternius's standard license; verify on `quaternius.com/packs/ultimatefurniturepack.html` LICENSE link) | low-poly (game-ready) | minimal/none | ~1.0-1.5 MB if all pieces used | Lower fidelity than Poly Haven but pre-composed kit — fewer parts to wire up. Confirm CC0 status BEFORE download (Quaternius dropped some packs to "Free" without explicit CC0 — see Pitfall 7). `[VERIFIED: quaternius.com lists pack but license confirmation requires viewing the pack page.]` |
| **3 (alternative single-asset — CC-BY, NOT CC0)** | Sketchfab | "Low Poly Workspace Desk Setup" by shanomahr1234 (`80a0a70cc390419daf9b3fd9d156d5dc`) | **CC-BY 4.0 (NOT CC0)** | 141.4K tris | not specified | likely 3-5 MB post-pipeline (high-poly source) | License is CC-BY (attribution required). Use ONLY IF Eren is willing to add `LICENSE.txt` attribution AND CONTEXT D-01 is reinterpreted to permit attribution-required licenses (it currently says "CC0-licensed asset"). **REJECT for v1** — D-01 says CC0. `[VERIFIED: sketchfab.com URL above — CC-BY 4.0; 141.4K tris.]` |
| **4 (alternative single-asset — also CC-BY)** | Sketchfab | "Low Poly Gaming Desk" by abdullahyeahyea | **CC-BY 4.0 (NOT CC0)** | 4.8K tris | not specified | likely 0.5-1.5 MB post-pipeline | Lower poly, includes monitor + headset + mouse + keyboard + CPU. **REJECT for v1** — CC-BY not CC0. |
| **5 (CC0 fallback if Poly Haven assembly blows the timebox)** | The Base Mesh | Search their library for "desk", "monitor", "lamp" — 1250+ CC0 models, glTF format | **CC0** | varies (low-poly base meshes) | none/minimal (base meshes) | ~0.5-1 MB total | "Base meshes" — NO textures shipped, planner adds `<meshStandardMaterial>` with palette tokens (matches Phase 2's procedural style of tinting from `--color-surface-1`/`--color-accent`). Cleanest license path; most work to texture but most consistent with Phase 2 aesthetic. **Pick this if Poly Haven composite blows D-04 timebox.** `[VERIFIED: thebasemesh.com — 1250+ CC0 + glTF.]` |

**Code Example (composite scene from Poly Haven primitives):**
```typescript
// src/scene/Workstation.tsx (Phase 4 — CC0 composite path)
// Source: 04-RESEARCH.md Pattern 1 + Phase 2 D-04 (1 unit = 1 metre)
import { useGLTF } from '@react-three/drei';
import { Floor } from './Floor';        // keep Phase 2 floor (procedural)
import { Lighting } from './Lighting';  // keep Phase 2 lighting

useGLTF.preload('/Portfolio_Website/assets/workstation/desk.glb');
useGLTF.preload('/Portfolio_Website/assets/workstation/monitor.glb');
useGLTF.preload('/Portfolio_Website/assets/workstation/lamp.glb');
useGLTF.preload('/Portfolio_Website/assets/workstation/bookshelf.glb');

export function Workstation({ focused, onFocusToggle }: WorkstationProps) {
  const desk = useGLTF('/Portfolio_Website/assets/workstation/desk.glb');
  const monitor = useGLTF('/Portfolio_Website/assets/workstation/monitor.glb');
  // ...

  return (
    <>
      <Floor />
      <primitive object={desk.scene} position={[0, 0, 0]} scale={[1, 1, 1]} />
      <Monitor position={[-0.45, 0.95, -0.05]} ...>
        <primitive object={monitor.scene.clone()} />
        {/* MonitorOverlay <Html> at z=0.026 stays the same */}
      </Monitor>
      {/* … */}
    </>
  );
}
```

**Source:** `[CITED: polyhaven.com/a/metal_office_desk]`, `[CITED: thebasemesh.com]`, `[CITED: pmndrs/drei useGLTF.preload — drei docs]`.

### Pattern 2: `gltfjsx --transform` Flag Set (D-02)

**What:** The exact CLI invocation for the asset pipeline. Run ONCE per asset at integration time; commit both the optimized `.glb` and any generated typed `.tsx`.

**When to use:** During Phase 4 Plan 01 GLB integration. NOT at build time per CLAUDE.md.

**Recommended invocation:**
```bash
# Per-asset (run for desk, monitor, lamp, bookshelf):
npx gltfjsx@~6.5 \
  ./source-assets/desk.glb \
  --transform \
  --resolution 1024 \
  --format webp \
  --types \
  --output ./public/assets/workstation/desk.glb

# For props that don't need 1024 (smaller surface area):
npx gltfjsx@~6.5 \
  ./source-assets/lamp.glb \
  --transform \
  --resolution 512 \
  --format webp \
  --types \
  --output ./public/assets/workstation/lamp.glb
```

**Flag rationale:**
- `--transform` (`-T`) — enables the bundled gltf-transform pipeline: Draco geometry compression + texture resize + WebP texture compression + dedup + prune + instance. **The single flag does all four**, which is why CLAUDE.md says "use this, not the CLI directly." `[VERIFIED: github.com/pmndrs/gltfjsx README]`
- `--resolution 1024` (`-R`) — texture resize target. Phase 2 desk/floor surface area = ~1.2m × 0.6m (the hero); 1024² is the standard hero res. Props use 512² for ~4× smaller texture cost.
- `--format webp` (`-f`) — WebP texture compression. Default. Smaller than KTX2/Basis for our scale. **NOTE on KTX2:** CONTEXT D-02 mentions "KTX2 compressed" but `gltfjsx --transform` defaults to WebP, NOT KTX2. KTX2/Basis is GPU-uploaded compressed (better runtime cost) but produces larger files than WebP for textures < 2K. For a portfolio scene the WebP default is correct; KTX2 is overkill. The planner can override with `--format ktx2` if Eren prefers GPU-side compression at higher disk cost. **Recommendation: stick with WebP default** unless mobile profiling shows GPU memory pressure — at which point KTX2 becomes valuable.
- `--types` (`-t`) — emits TypeScript-typed JSX component (`Desk.tsx` etc.) alongside the GLB. Useful for inspecting what the asset contains; the actual scene composition uses `<primitive object={...}>` which doesn't need the typed component. **Optional — inspecting only.**
- NO `--simplify` for v1: simplification can break geometry; the source assets are already low-poly enough.
- NO `--keepmeshes`: dedup is a feature, not a bug.
- NO Draco-level flag: `gltfjsx` defaults to Draco's standard compression level (7-10 range, encoder-determined). The CONTEXT § Claude's Discretion mention of "draco level=10" is achievable via `--draco /path/to/draco/encoder` only if a custom Draco encoder is shipped — not necessary for v1.

**Vite consumption pattern:**
```typescript
import { useGLTF } from '@react-three/drei';

// Preload at module scope so the GLB starts fetching before Workstation mounts
useGLTF.preload(`${import.meta.env.BASE_URL}assets/workstation/desk.glb`);

// Inside the component
const desk = useGLTF(`${import.meta.env.BASE_URL}assets/workstation/desk.glb`);
return <primitive object={desk.scene} />;
```

`useGLTF.preload` is a static method that triggers fetch + parse before component mount, smoothing perceived load. The `import.meta.env.BASE_URL` is `/Portfolio_Website/` on GH Pages — required for the GLB to resolve correctly under the project-pages base path.

**Source:** `[CITED: github.com/pmndrs/gltfjsx README + drei.docs.pmnd.rs/loaders/use-gltf]`

### Pattern 3: `<EffectComposer>` Lazy + Suspense (D-09)

**What:** Lazy-load the postprocessing chunk so low-tier devices never download the postprocessing JS.

**When to use:** Inside `<ScenePostprocessing>` wrapper — only mounted under `perfTier === 'high'`.

**Code:**
```typescript
// src/3d/ScenePostprocessing.tsx
// Source: 04-CONTEXT.md D-05/D-06/D-07/D-09; 04-UI-SPEC.md § Postprocessing pipeline integration
import { Suspense, lazy, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';

// PostFX chunk = EffectComposer + Bloom + Scanline + CA + Noise
const PostFX = lazy(() => import('./PostFX').then((m) => ({ default: m.PostFX })));

export function ScenePostprocessing() {
  const [tier, setTier] = useState<'high' | 'low'>('high');

  return (
    <>
      <PerformanceMonitor
        // bounds is a function of refresh rate — drei v10.7 API
        // [lower, upper] = [decline-trigger, incline-trigger]
        bounds={() => [30, 50]}
        flipflops={3}
        onIncline={() => setTier('high')}
        onDecline={() => setTier('low')}
        onFallback={() => setTier('low')}
      />
      {tier === 'high' && (
        <Suspense fallback={null}>
          <PostFX />
        </Suspense>
      )}
    </>
  );
}
```

```typescript
// src/3d/PostFX.tsx — separate file = separate Vite chunk
// Source: 04-CONTEXT.md D-08; REQUIREMENTS 3D-08; verified via /tmp/pp-check
//   inspection of @react-three/postprocessing@3.0.4 source (2026-05-08)
import {
  EffectComposer,
  Bloom,
  Scanline,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.025}
        intensity={0.6}
        mipmapBlur
      />
      <Scanline density={1.25} opacity={0.15} />
      <ChromaticAberration offset={[0.0008, 0.0008]} />
      <Noise opacity={0.04} />
    </EffectComposer>
  );
}
```

**Why this is the right pattern:**
- `lazy(() => import('./PostFX'))` triggers Vite to emit `PostFX-[hash].js` as a separate chunk. The JSX inside `Suspense` only loads when `tier === 'high'` is first true — which is the case on first mount (default high), then reverts to lazy if `<PerformanceMonitor>` flips to low.
- `<Suspense fallback={null}>` — no spinner, no loader. Per CONTEXT D-07 the tier-flip is instant; the visual contract IS that the scene without effects is the legitimate fallback.
- `<PerformanceMonitor>` outside the conditional means it always observes fps regardless of tier — so the system can flip back to `'high'` from `'low'` if conditions improve. Per CONTEXT D-06 binary tier — no mid state.
- `flipflops={3}` — drei semantic: after 3 ping-pong flips between bounds, drei calls `onFallback` and stops monitoring. `onFallback` in our handler also sets tier to `'low'` — defensive. Prevents the system from oscillating forever on a borderline device.

**Source:** `[VERIFIED: /tmp/pp-check/node_modules/@react-three/postprocessing/src/EffectComposer.tsx — multisampling default=8, frameBufferType=HalfFloatType]`, `[VERIFIED: drei.docs.pmnd.rs/performances/performance-monitor — bounds is a function, flipflops + onFallback semantics]`, `[CITED: drei v10.7.7 npm registry 2026-05-08]`

### Pattern 4: `<PerformanceMonitor>` API Verified (drei 10.7.7)

**What:** Confirmed prop list from drei live docs.

**Props:**
```typescript
type PerformanceMonitorProps = {
  ms?: number              // Collection window (default: 250ms)
  iterations?: number      // Average iterations (default: 10)
  threshold?: number       // Match percentage (default: 0.75)
  bounds: (refreshrate: number) => [lower: number, upper: number]
  flipflops?: number       // Fallback trigger count (default: Infinity)
  factor?: number          // Initial quality factor (default: 0.5)
  step?: number            // Factor adjustment amount (default: 0.1)
  onIncline?: (api: PerformanceMonitorApi) => void
  onDecline?: (api: PerformanceMonitorApi) => void
  onChange?: (api: PerformanceMonitorApi) => void
  onFallback?: (api: PerformanceMonitorApi) => void
  children?: ReactNode
}

type PerformanceMonitorApi = {
  fps: number
  factor: number       // 0..1
  refreshrate: number  // device peak refresh
  frames: number[]
  averages: number[]
}
```

**Critical correction to CONTEXT D-05:** CONTEXT says "drei default `bounds={[30, 50]}`" — this is INCORRECT shorthand. The drei `bounds` prop is REQUIRED and is a FUNCTION, not a static array. There is no static-array form. The drei convention for "use defaults" is `bounds={() => [30, 50]}` or for high-refresh-rate-aware: `bounds={(rr) => rr > 90 ? [50, 90] : [50, 60]}`.

**Recommended invocation for our scene:**
```typescript
bounds={() => [30, 50]}     // CONTEXT D-05 spec: ≤30 → low, ≥50 → high
flipflops={3}                 // Stop oscillating after 3 flips
onIncline={() => setTier('high')}
onDecline={() => setTier('low')}
onFallback={() => setTier('low')}  // After flipflops cap, force low
```

**Source:** `[VERIFIED: drei.docs.pmnd.rs/performances/performance-monitor 2026-05-08; same at npmjs.com/package/@react-three/drei v10.7.7]`

### Pattern 5: Postprocessing Effect Prop Names — VERIFIED CORRECTIONS

**What:** Exact prop names + types for each effect, with the corrections needed for CONTEXT D-08.

| Effect | Constructor option (postprocessing@6.39.x) | React-wrapper passes-through prop | CONTEXT D-08 used | Verified prop name |
|--------|---------------------------------------------|-----------------------------------|-------------------|--------------------|
| `<Bloom>` | `luminanceThreshold` (default 1.0) | `luminanceThreshold` | `threshold={0.6}` ❌ | **`luminanceThreshold={0.6}`** ✅ |
| `<Bloom>` | `intensity` (default 1.0) | `intensity` | `intensity={0.6}` ✅ | `intensity={0.6}` |
| `<Bloom>` | `mipmapBlur` (default true) | `mipmapBlur` | `mipmapBlur` ✅ | `mipmapBlur` |
| `<Bloom>` | `luminanceSmoothing` (default 0.03) | `luminanceSmoothing` | `luminanceSmoothing={0.025}` ✅ | `luminanceSmoothing={0.025}` |
| `<Scanline>` | `density` (default 1.25) | `density` | `density={1.25}` ✅ | `density={1.25}` |
| `<Scanline>` | NO opacity option | `opacity` (via wrapEffect → blendMode-opacity-value) | `opacity={0.15}` ✅ | `opacity={0.15}` ✅ |
| `<ChromaticAberration>` | `offset` (Vector2) | `offset` (accepts `[x, y]` array tuple) | `offset={0.0008}` ❌ should be tuple | **`offset={[0.0008, 0.0008]}`** ✅ |
| `<Noise>` | NO opacity option | `opacity` (via wrapEffect) | `opacity={0.04}` ✅ | `opacity={0.04}` ✅ |

**Why `opacity` works on Scanline + Noise even though the underlying classes don't accept it:**
The React wrapper `wrapEffect` (in `node_modules/@react-three/postprocessing/src/util.tsx`) destructures `{ blendFunction, opacity, ...props }` from the React element and routes `opacity` to the `<Component blendMode-opacity-value={opacity}>` JSX prop. R3F's `extend()` reconciler then sets `effect.blendMode.opacity.value = opacity` on the underlying `Effect` instance. Every postprocessing `Effect` has a `blendMode` with an `opacity` uniform — so this works for ANY effect including effects whose constructor doesn't expose opacity.

**Why `offset={0.0008}` instead of `[0.0008, 0.0008]` would FAIL:**
The `wrapEffect` `useVector2` helper (same file) handles vector props: if the value is a number, it constructs `new Vector2(value, value)`. So `offset={0.0008}` MIGHT work if the wrapper's plumbing passes through correctly — BUT the official examples use array tuples and the typedef declares `Vector2`. Safest form: `offset={[0.0008, 0.0008]}`.

**Source:** `[VERIFIED via `npm install @react-three/postprocessing@~3.0.4 postprocessing@^6.36.6` in /tmp/pp-check 2026-05-08; inspected /tmp/pp-check/node_modules/postprocessing/build/types/index.d.ts and /tmp/pp-check/node_modules/@react-three/postprocessing/src/util.tsx, ScanlineEffect.tsx, NoiseEffect.tsx, Bloom.tsx, ChromaticAberration.tsx]`

### Pattern 6: Bundle Budget Headroom Check (3D-08 + OPS-02)

**What:** Predict the postprocessing chunk's contribution to the 3D chunk budget BEFORE landing the integration.

**Phase 2 baseline:** 3D chunk @ Plan 02-05 = **236.7 KB gz** / 450 KB budget (53%).
**Phase 3 addition:** GSAP core ~33 KB gz + MDX runtime ~10-15 KB gz = ~43-48 KB gz extra → projected **~280-290 KB gz** / 450 KB budget (~63%).
**Phase 4 addition (this phase):**
  - `@react-three/postprocessing` core + 4 effects ≈ **~25-30 KB gz** (from `bundlephobia.com` data; the 4 effects are tiny shaders + thin wrappers)
  - Underlying `postprocessing@6.39.x` library ≈ **~30-40 KB gz** (bundles via dynamic import)
  - Real GLB chunk reference (loaded async via `useGLTF`, separate fetch — does NOT count toward chunk gz budget; counted toward `dist/assets/*.glb` 2.5 MB budget)

**Projected 3D chunk after Phase 4 = ~340-360 KB gz / 450 KB budget (~76-80%).** Inside budget but tighter. The planner should run `npm run size` after the postprocessing landing and BEFORE the GLB landing to confirm.

**Mitigation if overage:** the postprocessing import is ALREADY isolated to the lazy `PostFX` chunk (Pattern 3) — that chunk is SEPARATE from `ThreeDShell-[hash].js` if Vite splits it correctly. Verify with:
```bash
npm run build
ls dist/assets/  # Look for PostFX-[hash].js as a SEPARATE file
```
If `PostFX` lands in `ThreeDShell-*.js` (NOT split), add `vite.config.ts` `optimizeDeps.exclude: ['@react-three/postprocessing']` OR move the PostFX import behind a more aggressive dynamic boundary. Phase 2 RESEARCH already confirms `manualChunks` is forbidden.

**Recommendation:** Add a NEW size-limit entry for the PostFX chunk:
```jsonc
{
  "name": "Postprocessing chunk (lazy, gzipped)",
  "path": "dist/assets/PostFX-*.js",
  "limit": "50 KB",
  "gzip": true
}
```

**Source:** `[VERIFIED: Phase 2 SUMMARY 02-05: 236.7 KB gz baseline; Phase 3 SUMMARY 03-07 (current); bundlephobia.com sizes for @react-three/postprocessing@3.0.x]`. `[ASSUMED: ~25-30 KB gz for the wrapper alone — verify with size-limit at Phase 4 Plan 01 landing.]`

### Pattern 7: Web3Forms POST Integration (CTC-01)

**What:** Plain `fetch` POST to `https://api.web3forms.com/submit`. No SDK; no analytics; no third-party JS.

**Endpoint:** `POST https://api.web3forms.com/submit`
**Content-Type:** `application/json` recommended for our use case (CONTEXT D-11 form fields are all simple strings); `multipart/form-data` is for file uploads (PRO-tier feature, not in scope).
**Required fields:** `access_key`, `name`, `email`, `message`
**Optional fields used:** `subject`, `botcheck` (honeypot)
**Success response:** `200` + JSON `{ "success": true, "message": "..." }`
**Failure response:** `4xx`/`5xx` + JSON `{ "success": false, "message": "..." }`

**Code:**
```typescript
// src/lib/web3forms.ts — single source of truth for endpoint + payload shape
// Source: 04-CONTEXT.md D-10/D-11/D-12; docs.web3forms.com 2026-05-08
const ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT ?? 'https://api.web3forms.com/submit';

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormResult {
  ok: boolean;
  /** Generic — DO NOT surface server's actual error string to the user
   *  (Pitfall 4 information disclosure). The UI shows "Network error." */
  diagnosticForLog?: string;
}

export async function submitContact(payload: ContactFormPayload): Promise<ContactFormResult> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (!accessKey) {
    return { ok: false, diagnosticForLog: 'access_key not configured' };
  }

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: payload.name,
        email: payload.email,
        message: payload.message,
        subject: `[Portfolio enquiry] from ${payload.name || '(name empty)'}`,
        from_name: 'Portfolio Contact Form',
      }),
    });

    if (response.ok) {
      const json = (await response.json()) as { success?: boolean };
      // Web3Forms returns success: true on accepted submissions
      return { ok: json.success === true };
    }

    return { ok: false, diagnosticForLog: `HTTP ${response.status}` };
  } catch (error) {
    return {
      ok: false,
      diagnosticForLog: error instanceof Error ? error.message : String(error),
    };
  }
}
```

```typescript
// src/ui/ContactForm.tsx — UI shell (UI-SPEC § <ContactForm /> layout)
import { useState } from 'react';
import { submitContact } from '../lib/web3forms';
import { BracketLink } from './BracketLink';
// ... TerminalPrompt, EmailReveal, identity imports

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failure'>('idle');
  const [emailError, setEmailError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    // CONTEXT D-11 silent honeypot abort
    if (formData.get('botcheck')) {
      setStatus('success');  // SILENT — show success UI, send NO request
      return;
    }

    setSubmitting(true);
    const result = await submitContact({ name, email, message });
    setSubmitting(false);
    setStatus(result.ok ? 'success' : 'failure');
  }

  if (status === 'success') {
    return <SuccessBlock onReset={() => { setStatus('idle'); setName(''); setEmail(''); setMessage(''); }} />;
  }
  if (status === 'failure') {
    return <FailureBlock onRetry={() => setStatus('idle')} />;
  }

  return (
    <form onSubmit={handleSubmit} className="...">
      {/* … fields per UI-SPEC § <ContactForm /> layout — name, email, message … */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <label>
          Don't fill this out if you're human:
          <input name="botcheck" type="checkbox" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <BracketLink as="button" type="submit" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send message'}
      </BracketLink>
    </form>
  );
}
```

**Notes:**
- **Honeypot field type:** Web3Forms canonical example uses `<input type="checkbox" name="botcheck">` (verified from web3forms-docs surjithctly/web3forms-docs). UI-SPEC and CONTEXT D-11 say `<input type="text">` — both work because Web3Forms ONLY checks "is the field non-empty?". **Recommendation: use `type="checkbox"`** to match Web3Forms' canonical example and to make the trap unambiguous to bots that fill text fields with realistic strings.
- **Silent success on honeypot:** CONTEXT § Specifics is explicit — re-render success UI without sending the request. **Bots interpret 200 as "submission accepted" and won't retry.** A failure response would tip the bot to retry.
- **CSP requirement:** `index.html` `<meta http-equiv="Content-Security-Policy">` currently has `connect-src 'self'`. **Phase 4 MUST extend to `connect-src 'self' https://api.web3forms.com;`** otherwise the `fetch` call will be blocked by the browser. This is a load-bearing change — if missed, the contact form will silently fail in production.
- **Error message redaction:** the failure UX shows "Network error." — DO NOT pass the server's actual error string into the UI. Information disclosure (Pitfall 4 + UI-SPEC § Failure state).
- **Per-form rate limit:** Web3Forms documentation does not publish a rate limit. The free tier 250/mo is per-account-key (cited widely; not in the public pricing extract — see Open Questions). Eren should monitor the Web3Forms dashboard during the first month.

**Source:** `[VERIFIED: docs.web3forms.com/llms-full.txt 2026-05-08 — endpoint POST https://api.web3forms.com/submit + access_key + 200 success]`, `[VERIFIED: github.com/surjithctly/web3forms-docs honeypot example — botcheck = type=checkbox]`

### Pattern 8: Honeypot Anti-Spam (D-11)

**What:** Hidden field that humans never fill but bots do. CONTEXT D-11 chose `botcheck` (Web3Forms canonical name).

**HTML structure:**
```html
<div style="display: none" aria-hidden="true">
  <label>
    Don't fill this out if you're human:
    <input name="botcheck" type="checkbox" tabIndex="-1" autoComplete="off" />
  </label>
</div>
```

**Why `display: none` (NOT `visibility: hidden` or off-screen positioning):**
- **Accessibility tree exclusion:** `display: none` removes the field from the accessibility tree. Screen readers DO NOT announce it. Per UI-SPEC: "legitimate humans must NEVER see or tab to it." `visibility: hidden` and off-screen positioning leave the field announceable.
- **Tab order exclusion:** `tabIndex={-1}` is belt-and-braces — even if a stylesheet override re-displays it, the tab order skips it.
- **Browser autofill exclusion:** `autoComplete="off"` prevents 1Password / Apple Keychain / Chrome saved-form data from accidentally populating it.

**Server-side behavior:** Web3Forms' free-tier honeypot drops submissions where `botcheck` is non-empty (or, in the case of `type=checkbox`, where the checkbox is checked). Per docs.web3forms.com, the field is described as "depreciated" — Web3Forms recommends pairing with hCaptcha for higher fidelity. **For our 250/mo budget the honeypot alone is sufficient.**

**Client-side double check (defense-in-depth):**
Per UI-SPEC § Honeypot, the form's `handleSubmit` checks `botcheck` BEFORE calling `fetch`. If non-empty, the form re-renders the success state but does NOT send the request. This:
1. Saves a Web3Forms quota slot
2. Does not give the bot a real signal (the bot sees "200 success" UX)
3. Defends against form-quota exhaustion attacks

**Optional v1.1 escalation:** Web3Forms supports zero-config hCaptcha (free tier) per docs.web3forms.com. If Eren sees spam reaching his inbox during the first month of v1.0, swap honeypot for hCaptcha:
```html
<div class="h-captcha" data-sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"></div>
<script src="https://js.hcaptcha.com/1/api.js" async defer></script>
```
This adds ~5 KB JS + a network round-trip per submission. **Defer to v1.1 unless spam volume warrants.**

**Source:** `[VERIFIED: docs.web3forms.com → "Honeypot is optional to include" + hCaptcha free + "depreciated" but functional]`, `[CITED: developer.mozilla.org/en-US/docs/Web/CSS/display — display:none excluded from a11y tree]`

### Pattern 9: Web3Forms Access Key Delivery (D-11)

**What:** The Web3Forms access key identifies the form on Web3Forms' side. It is **public-by-design** per their docs ("Don't worry this can be public.") — it is NOT a secret.

**Recommendation:** Store as a build-time env var via Vite's `import.meta.env.VITE_*` pattern. Two viable paths, planner picks:

| Path | How | Pros | Cons |
|------|-----|------|------|
| **A — GitHub Actions repo Variable (recommended)** | Settings → Secrets and variables → Actions → Variables → `VITE_WEB3FORMS_KEY=abc123`. In `deploy.yml` build step: `env: VITE_WEB3FORMS_KEY: ${{ vars.VITE_WEB3FORMS_KEY }}` | Key not in repo history. If Eren rotates the key, single-edit in Settings UI. | Slightly more setup. |
| **B — `.env` file committed to repo** | Add `.env` with `VITE_WEB3FORMS_KEY=abc123`. Vite picks it up automatically at build time. | Trivial setup; obvious to future maintainer. | Key in git history (forever, even if later removed). For a public-by-design key this is acceptable; aesthetically less clean. |

**Recommendation: Path A (Repo Variable)**, because (a) it cleanly separates v1's key from any v2 key, (b) Eren can rotate the key without touching code if Web3Forms ever flags abuse on the v1 key, (c) follows least-surprise principle (devs expect "secret-shaped strings" to live in repo settings).

**For local dev:** Eren creates a local `.env.local` (gitignored) with the same key so `npm run dev` works. Document in README.

**Code:**
```typescript
// src/lib/web3forms.ts
const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
if (!accessKey) {
  // In production this should NEVER happen — the GH Actions workflow
  // injects the key at build time. If undefined, the form is misconfigured.
  console.warn('VITE_WEB3FORMS_KEY not set; contact form will fail.');
}
```

**Source:** `[VERIFIED: docs.web3forms.com/llms-full.txt → "Public by design"]`, `[CITED: vite.dev/guide/env-and-mode]`

### Pattern 10: Gmail + Outlook Delivery Verification Protocol (CTC-01)

**What:** Per CTC-01 ("verified end-to-end into both Gmail and Outlook (not spam)"), this is a manual test. Not CI-able.

**Protocol (run BEFORE marking CTC-01 complete):**
1. **Set up two test inboxes** — one Gmail, one Outlook/Hotmail. Use throwaway addresses, NOT eren.atalay@... (sending FROM a contact form to YOUR own address gives spam-filter signals — we want to confirm a stranger's submission would reach Eren's real inbox).
2. **Configure Web3Forms** — set "Notification Email" to one of the test inboxes (Gmail first, then re-test with Outlook). Web3Forms dashboard → Form Settings → Notification Email.
3. **Submit from the LIVE deployed URL** with a unique message body containing a timestamp, e.g. `Test submission 2026-MM-DD HH:MM — Gmail inbox check`.
4. **Check the inbox WITHIN 60 SECONDS:**
   - **PASS:** message in Inbox (not Spam).
   - **PARTIAL:** message in Spam — note the SpamAssassin / Gmail score; if Gmail says "It's similar to messages identified as spam" investigate the From address Web3Forms uses.
   - **FAIL:** message never arrives in 5 minutes — check Web3Forms dashboard for delivery status.
5. **Check the From address** — Web3Forms sends notifications from a Web3Forms-owned domain (e.g., `@web3forms.com` or `@notification.web3forms.com`). If Outlook flags this domain, set up a custom From-address in Web3Forms PRO (NOT in v1; defer to v2).
6. **Reply-to test** — click "Reply" in the inbox; the reply target should be the submitter's email (`replyto: payload.email`), NOT Web3Forms' domain. Confirm.
7. **Repeat for the second inbox.**
8. **Record results in CHECKLIST-LAUNCH.md** under "CTC-01 verification" with timestamps and pass/fail per inbox.

**If both fail:** the v1 ship is OK to delay — CTC-01 is a launch blocker. Fix paths: add `replyto` field if missing; switch to hCaptcha to improve sender reputation; verify Web3Forms account is fully verified (not just trial).

**Source:** Domain knowledge — no single canonical doc, but standard practice for any form-handler integration.

### Pattern 11: `<LiveProfiles />` Sub-list (CTC-03 + D-13)

**What:** TryHackMe + HackTheBox profile links rendered in two places: primary in Certs section, secondary as shortcut in Contact section.

**Code:**
```typescript
// src/ui/LiveProfiles.tsx
// Source: 04-CONTEXT.md D-13; 04-UI-SPEC.md § Live profiles sub-list
import { identity } from '../content/identity';
import { TerminalPrompt } from './TerminalPrompt';
import { BracketLink } from './BracketLink';

export function LiveProfiles() {
  // CONTEXT D-13: omit entire block if both missing
  if (!identity.tryHackMeUrl && !identity.hackTheBoxUrl) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold">
        <TerminalPrompt><span className="text-fg">ls certs/live-profiles/</span></TerminalPrompt>
      </h3>
      <ul className="mt-3 flex flex-col gap-2">
        {identity.tryHackMeUrl && (
          <li className="flex flex-wrap items-baseline gap-x-3">
            <BracketLink href={identity.tryHackMeUrl} external>TryHackMe profile</BracketLink>
            {identity.tryHackMeHandle && (
              <span className="text-muted text-sm">@{identity.tryHackMeHandle}</span>
            )}
          </li>
        )}
        {identity.hackTheBoxUrl && (
          <li className="flex flex-wrap items-baseline gap-x-3">
            <BracketLink href={identity.hackTheBoxUrl} external>HackTheBox profile</BracketLink>
            {identity.hackTheBoxHandle && (
              <span className="text-muted text-sm">@{identity.hackTheBoxHandle}</span>
            )}
          </li>
        )}
      </ul>
    </div>
  );
}

export function LiveProfilesShortcut() {
  if (!identity.tryHackMeUrl && !identity.hackTheBoxUrl) return null;
  return (
    <p className="text-fg">
      See also:{' '}
      {identity.tryHackMeUrl && (
        <BracketLink href={identity.tryHackMeUrl} external>TryHackMe profile</BracketLink>
      )}
      {identity.tryHackMeUrl && identity.hackTheBoxUrl && '  '}
      {identity.hackTheBoxUrl && (
        <BracketLink href={identity.hackTheBoxUrl} external>HackTheBox profile</BracketLink>
      )}
    </p>
  );
}
```

**Identity type extension:**
```typescript
// src/content/identity.ts — add 4 optional fields per CONTEXT D-13
export interface Identity {
  // ... existing fields …
  tryHackMeUrl?: string;
  tryHackMeHandle?: string;
  hackTheBoxUrl?: string;
  hackTheBoxHandle?: string;
}

export const identity: Identity = {
  // ... existing values …
  tryHackMeUrl: 'https://tryhackme.com/p/<eren-handle>',  // Eren fills at execution
  tryHackMeHandle: '<eren-handle>',
  // hackTheBoxUrl: ...,  // ONLY if Eren has an HTB profile
  // hackTheBoxHandle: ...,
};
```

**Mounting:** `<LiveProfiles />` in `src/sections/Certs.tsx` (after the existing `<CertRow>` list); `<LiveProfilesShortcut />` in `src/sections/Contact.tsx` (after the existing email/GitHub/LinkedIn strip + after `<ContactForm />`).

**External BracketLink contract:** UI-SPEC says BracketLink with `external` prop already adds `target="_blank" rel="noopener noreferrer"` — confirmed by Phase 2 RESEARCH. OPS-05 (`rel="noopener noreferrer"` audit) is automatically satisfied for these new links.

**Source:** `[VERIFIED: src/ui/BracketLink.tsx existing implementation Phase 2 D-09; UI-SPEC § Live profiles sub-list]`

### Pattern 12: OG Image Generation Recommendation

**What:** A 1200×630 PNG screenshot of the deployed text shell hero, < 200 KB.

**Recommended path:** **macOS native screenshot + ImageOptim**, NOT Playwright.

**Steps:**
1. **Set window to exactly 1200px wide** in Chrome/Safari.
2. **Open the deployed text shell** in a clean browser profile (no extensions, no notifications, no other tabs).
3. **Disable browser chrome** to maximize screenshot area: Chrome → DevTools → Cmd-Shift-P → "Hide Toolbar" / Use Safari's Reader View OFF.
4. **Take the screenshot:** `Cmd-Shift-4` → space → click the browser window. Saves to Desktop. CRITICAL: macOS may capture at 2× DPR (2400×1260). Use:
   ```bash
   # Force 1× DPR — `defaults` writes for 1 boot; better: use `screencapture` directly
   screencapture -R 0,0,1200,630 -t png ~/Desktop/og-image.png
   ```
   Or, in Chrome DevTools: Device Toolbar → Custom 1200×630 → Run "Capture screenshot" command.
5. **Verify dimensions:** `sips -g pixelWidth -g pixelHeight og-image.png` → must be exactly 1200×630.
6. **Strip metadata:** `exiftool -all= -P -overwrite_original og-image.png`.
7. **Compress:** Drop into ImageOptim.app (or upload to https://squoosh.app/, OxiPNG / pngquant Lossy 60-80 quality). Target file size: < 200 KB.
8. **Visual review at full resolution:** open in Preview at 100% zoom. Audit per OPSEC checklist:
   - No browser extension badges in corner
   - No password-manager autofill suggestions
   - No notification-center popups
   - No partial reflection of face/room
   - No hostnames in tab title
   - No `localhost:` in address bar (we're screenshotting the deployed URL)
9. **Place at `public/assets/og-image.png`**.
10. **Verify in deployed bundle:**
    - `cp` survives (Vite copies `public/` verbatim → `dist/`)
    - `<meta property="og:image">` URL points to the absolute deployed URL (already the case in `index.html`)
    - Open https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png in incognito → image loads
11. **Verify previews:**
    - Paste deployed URL into LinkedIn DM compose → shows OG card with image
    - Paste into Slack DM → shows OG card with image
    - https://www.opengraph.xyz/url/https%3A%2F%2Feren-atalay.github.io%2FPortfolio_Website%2F → renders correctly

**Alternative path (Playwright headless):** Only if Eren wants reproducibility (e.g., regenerate OG image on every content update). Adds 70 MB Chromium devDep. **Recommendation: skip for v1.**

**Code (alternative — Playwright):**
```typescript
// scripts/og-screenshot.mjs (OPTIONAL — only if Eren picks Playwright path)
import { chromium } from '@playwright/test';

const URL = 'https://eren-atalay.github.io/Portfolio_Website/?view=text';
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1, // CRITICAL — prevent 2x retina doubling
});
await page.goto(URL, { waitUntil: 'networkidle' });
// Optional: scroll to top, hide any sticky bars, etc.
await page.screenshot({
  path: 'public/assets/og-image.png',
  type: 'png',
  fullPage: false, // 1200x630 viewport only
});
await browser.close();
console.log('OG image written to public/assets/og-image.png');
// Then: exiftool -all= public/assets/og-image.png
//       imageoptim public/assets/og-image.png
```

**Source:** `[CITED: playwright.dev/docs/screenshots; ImageOptim app docs]`, domain knowledge for the OPSEC review steps.

### Pattern 13: Lighthouse Deployed-URL Audit (OPS-03 + D-17)

**What:** Run `npx @lhci/cli autorun` against the live deployed text shell.

**Command:**
```bash
npx @lhci/cli@~0.15 autorun \
  --collect.url=https://eren-atalay.github.io/Portfolio_Website/?view=text \
  --collect.url=https://eren-atalay.github.io/Portfolio_Website/?view=3d \
  --collect.numberOfRuns=3 \
  --upload.target=temporary-public-storage \
  --assert.preset=lighthouse:no-pwa \
  --assert.assertions.categories:performance="['error',{minScore:0.8}]" \
  --assert.assertions.categories:accessibility="['error',{minScore:0.9}]" \
  --assert.assertions.categories:best-practices="['error',{minScore:0.9}]" \
  --assert.assertions.categories:seo="['error',{minScore:0.9}]"
```

**Or use a `lighthouserc.json`** committed to repo root:
```json
{
  "ci": {
    "collect": {
      "url": [
        "https://eren-atalay.github.io/Portfolio_Website/?view=text",
        "https://eren-atalay.github.io/Portfolio_Website/?view=3d"
      ],
      "numberOfRuns": 3
    },
    "upload": {
      "target": "temporary-public-storage"
    },
    "assert": {
      "preset": "lighthouse:no-pwa",
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }]
      }
    }
  }
}
```
Then: `npx @lhci/cli autorun`.

**Lighthouse mobile-default behavior (verified):**
- Default `--form-factor=mobile` per current Lighthouse 13.x docs.
- Default throttling: `--throttling-method=simulate` + `cpuSlowdownMultiplier=4` + `rttMs=150` + `throughputKbps=1600`. **This IS the "Slow 4G + Moto G4" preset** that CONTEXT D-17 names. No additional flags needed.
- The `Moto G4` device label is what Lighthouse reports in audit results — emulation defaults haven't changed in years and 2026 docs still cite Moto G4.

**Why CONTEXT D-17 says BOTH `?view=text` AND `?view=3d`:**
- Text shell (`?view=text`) = score gate (Performance ≥80, A11y ≥90, BP ≥90, SEO ≥90).
- 3D shell (`?view=3d`) = advisory: must not throw errors / blank page; numbers documented but no gate. This catches a 3D-shell crash that doesn't surface in text-shell audit.

**Score ceiling for text shell on a static GH Pages SPA:**
- Performance: typically 95-100 on a small static page; 80 is generous and survives CDN slow-day.
- Accessibility: 95+ if Phase 1's WCAG palette + semantic HTML + skip-link survive.
- Best Practices: 95+ if CSP `<meta>` extends correctly and source maps are off.
- SEO: 95+ if `<title>`, meta description, JSON-LD all present.

**3 runs, take median, document in CHECKLIST-LAUNCH.md.** Why median not mean: Lighthouse simulated throttling has a long-tail variance from cold-CDN-cache; median dampens the outlier.

**Optional CI integration (advisory non-blocking):**
```yaml
# Append to .github/workflows/deploy.yml
  lighthouse:
    needs: deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v6
        with:
          node-version: '22'
      - name: Wait for deploy
        run: sleep 60  # GH Pages CDN propagation delay
      - name: Run Lighthouse CI
        run: npx @lhci/cli@~0.15 autorun || true  # advisory: don't fail deploy
        continue-on-error: true  # belt + braces
```

**Recommendation:** ADVISORY non-blocking. CONTEXT D-17 says manual median-of-3 is the source of truth; CI advisory just gives you a build artifact for trend-tracking.

**Source:** `[VERIFIED: googlechrome.github.io/lighthouse-ci/docs/configuration.html 2026-05-08; github.com/GoogleChrome/lighthouse/docs/throttling.md confirms Moto G4 + Slow 4G default; npm registry @lhci/cli@0.15.1]`, `[CITED: googlechrome-lighthouse.mintlify.app/api/cli-reference]`

### Pattern 14: Lighthouse Assertion Config

**What:** The `assert.assertions` object specifies score thresholds. CONTEXT D-17 demands Performance ≥80, A11y ≥90, BP ≥90, SEO ≥90.

**Why `lighthouse:no-pwa` preset:** the standard preset `lighthouse:recommended` includes PWA audits, which fail on a static SPA without a service worker. `no-pwa` drops PWA but keeps everything else. Our portfolio is intentionally not a PWA (no analytics, no offline mode).

**Score scale:** Lighthouse categories are 0..1 floats; `0.9` = 90/100.

**Severity:** `"error"` makes lhci exit non-zero on miss; `"warn"` exits zero but prints. CONTEXT D-17 implies error-grade.

### Pattern 15: Median-of-3 Lighthouse Protocol

**What:** Per CONTEXT § Claude's Discretion ("Lighthouse runs at execution: number of attempts — recommended: 3 runs, take median, document actual numbers").

**Why median, not mean:**
- Mean is sensitive to a single bad run (e.g., CDN cold-cache one-off).
- Median = middle value of 3; one outlier doesn't budge it.
- Lighthouse documentation uses median-of-3 by default in `lhci autorun --collect.numberOfRuns=3`.

**Recording in CHECKLIST-LAUNCH.md:**
```markdown
- [ ] Lighthouse on deployed text shell — Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90 — runs documented (3 runs, median):
  - Run 1: Perf=__, A11y=__, BP=__, SEO=__
  - Run 2: Perf=__, A11y=__, BP=__, SEO=__
  - Run 3: Perf=__, A11y=__, BP=__, SEO=__
  - Median: Perf=__, A11y=__, BP=__, SEO=__
  - Verdict: PASS / FAIL
```

### Pattern 16: Real-Device QA 5-7 Step Protocol (OPS-04)

**What:** Concrete in-hand test protocol on iPhone + Android. Per CONTEXT D-16, two specific committed devices.

**Per-device protocol (run on EACH device):**

| # | Test | Expected | Failure mode |
|---|------|----------|--------------|
| 1 | **Cold-load text shell** at the deployed URL on cellular (NOT wi-fi — recruiter-realistic). Time to "Eren Atalay — Junior Cybersecurity Analyst" hero text visible. | < 5 seconds on 4G/LTE. | If > 10s, capability gating may have failed. |
| 2 | **Reveal email** — tap `[email (click to reveal)]`. | Decoded email shows; clipboard copy may or may not work depending on browser permission (iOS Safari is strict). | If the button does nothing, JS bundle didn't load. |
| 3 | **Submit a real test message** through the contact form. Note: this consumes a Web3Forms quota slot. | Inline `$ message_sent` block replaces form; Eren sees the test message in the configured notification inbox. | If failure block shows, network is blocked OR Web3Forms key is missing. |
| 4 | **Open `?view=3d` shell** explicitly. | EITHER (a) 3D scene mounts cleanly, OR (b) capability gate refuses gracefully (text shell with explanation banner per Phase 2 D-13). | If blank canvas / WebGL error / silent freeze: device is over-budget; add to "ungraceful refusal" list and consider tightening capability gate. |
| 5 | **Scroll the page** while inside the 3D shell. | Page scrolls normally OR (preferred) the page is non-scrolling and the canvas captures gestures correctly. Per Phase 2 D-04, the 3D shell uses `<main flex-1>` non-scrolling layout. | If scroll trapped inside Canvas (Pitfall 8), the device fails real-device QA — text-shell-only for that device. |
| 6 | **`prefers-reduced-motion` test** — toggle iOS Settings → Accessibility → Motion → Reduce Motion ON; reload. | `<WhoamiGreeting>` skips to final state instantly; camera focus is instant cut (Phase 3 D-08); postprocessing (static — does NOT animate) is unchanged per CONTEXT § Specifics. | If typing animation runs anyway, `useReducedMotion` hook isn't being read by the affected component. |
| 7 | **30-minute soak** — leave the 3D shell open in the foreground for 30 minutes. iOS Safari has aggressive WebGL memory limits and will drop context; Phase 2 D-13 + D-14 should swap to text shell with [retry 3D] banner. | Either scene runs steadily OR cleanly drops to text shell + retry banner. | If silent black screen: `webglcontextlost` listener is missing. |

**Devices to commit per CONTEXT D-16 (planner picks 2 specific ones):**
- **iOS:** suggest iPhone 12 / iOS 17+ (3 GB RAM, 4-year-old class — recruiter-realistic). If iPhone 14+ available, that's higher-tier; useful but doesn't represent the bottom of the audience.
- **Android:** suggest a 4 GB RAM mid-tier Android (e.g., Pixel 6a, Galaxy A53) running Chrome 130+ on Android 13+.
- **iPad:** OPTIONAL — Phase 2 D-01 says iPads default to 3D shell (capability gate excludes them from mobile-fallback). If an iPad is available, ADD a 3rd device row in CHECKLIST-LAUNCH.md.

**iOS Safari WebGL2 quirks to specifically test:**
- **Memory pressure context loss:** Phase 2 D-15 deferred this real-device test to Phase 4 — it's #7 above. Keep open in foreground for 30 min, switch apps, return.
- **Touch event conflicts:** Phase 2 D-04 sets `touch-action: pan-y` on the 3D shell main; verify by scroll-attempting from inside the canvas region.
- **`prefers-reduced-motion` is honoured by iOS Safari** — if Eren turns on iOS "Reduce Motion" in Settings, then opens the deployed site, every animated element should respect it.

**Source:** `[CITED: discourse.threejs.org/t/three-js-broken-on-ios-17-with-context-lost/58025]`, `[CITED: web.dev/articles/prefers-reduced-motion]`, Phase 2 RESEARCH § Pattern 5 + D-15.

### Pattern 17: iOS Safari WebGL2 + Reduced-Motion Edge Cases

**What:** The two failure modes most likely to surface in real-device QA but not in DevTools.

**Edge case 1 — iOS Safari memory pressure:**
- iOS Safari's WebGL implementation drops the GL context aggressively under memory pressure (other apps, low-power mode, accumulated tabs). Three.js issue thread documents context loss within minutes on iPhone 12/13.
- **Mitigation already in place:** Phase 2 D-13 — `webglcontextlost` listener → swap to text shell + dismissible info bar.
- **Phase 4 verification:** Pattern 16 step 7 (30-min soak) confirms.

**Edge case 2 — `prefers-reduced-motion` post-mount toggle:**
- iOS users can toggle Reduce Motion in Settings WHILE the site is loaded. The `useReducedMotion` hook in `src/lib/useReducedMotion.ts` (Phase 1 TXT-05) subscribes to the media-query change event, so this should auto-update.
- **Phase 4 verification:** Pattern 16 step 6 (toggle Reduce Motion ON, reload) is the lower-bar test. Bonus: toggle ON without reloading and verify the WhoamiGreeting in 3D shell reaches its final state.

**Edge case 3 — Postprocessing on Mali/Adreno GPUs:**
- Some mid-tier Android GPUs have shader compilation errors with chained postprocessing effects. The `<PerformanceMonitor>` flip should catch this (low fps → drop tier) but a hard shader compile failure would crash before fps measurement.
- **Mitigation:** Phase 4 D-09 Suspense wraps the lazy chunk; a load-time error boundary in `<ScenePostprocessing>` is OPTIONAL belt-and-braces (rec: skip; the Phase 2 D-13 webglcontextlost listener catches the worst-case).

### Pattern 18: `CHECKLIST-LAUNCH.md` Structure (D-14)

**What:** New file per CONTEXT D-14. 14 explicit items pre-locked + free-form Notes section.

**Recommended structure:**
```markdown
# Pre-Launch Checklist

> Owned by Phase 4. Run before tagging v1.0 release. Distinct from
> CHECKLIST-OPSEC.md (which stays OPSEC-only). Verifier reads BOTH;
> both must be fully checked before milestone-complete.

## Lighthouse on Deployed URL (OPS-03 + CONTEXT D-17)

- [ ] Lighthouse on deployed text shell — Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90 — runs documented (3 runs, median):
  - Run 1: Perf=__, A11y=__, BP=__, SEO=__
  - Run 2: Perf=__, A11y=__, BP=__, SEO=__
  - Run 3: Perf=__, A11y=__, BP=__, SEO=__
  - Median: Perf=__, A11y=__, BP=__, SEO=__
- [ ] Lighthouse on deployed 3D shell (advisory) — no error / no blank page; numbers documented:
  - Run 1: Perf=__, A11y=__, BP=__, SEO=__
  - Median: Perf=__, A11y=__, BP=__, SEO=__

## Bundle Hygiene

- [ ] Dev-helper strip — grep verifies no `<Stats>`, `<Perf>`, `console.log`, `leva`, `r3f-perf` in `dist/assets/*.js` (or all gated by `import.meta.env.DEV`):
  ```bash
  grep -rE "<Stats|<Perf|console\.log|leva|r3f-perf" dist/assets/ | grep -v "// dev-only"
  # Should return empty.
  ```
- [ ] `npm audit --production` returns no high/critical advisories.
- [ ] `npm ls` shows no unexpected dependencies.

## External Links

- [ ] External links carry `rel="noopener noreferrer"`:
  ```bash
  grep -E 'target="_blank"' dist/index.html | grep -v 'noopener noreferrer'
  # Should return empty.
  ```
  AND for inline source:
  ```bash
  grep -rE 'target="_blank"' src/ | grep -v 'noopener noreferrer' | grep -v 'BracketLink'
  # Should return empty (BracketLink with external prop adds rel automatically).
  ```

## Security Headers

- [ ] CSP `<meta>` tag present and valid — Web3Forms endpoint allowed in `connect-src`:
  ```bash
  grep "connect-src" index.html
  # Must include "https://api.web3forms.com"
  ```

## SEO + Sharing

- [ ] OG image (1200×630) verified — opens in browser at deployed URL, dimensions correct, no GitHub-Pages-base-path 404:
  ```bash
  curl -I https://eren-atalay.github.io/Portfolio_Website/assets/og-image.png
  # Expect 200 OK, content-type: image/png
  ```
- [ ] OG card preview verified by pasting deployed URL into LinkedIn DM compose AND Slack DM compose (manual visual check).
- [ ] JSON-LD Person schema verified — passes https://validator.schema.org/.
- [ ] `<title>` is real (not Vite default).
- [ ] `<meta name="description">` is real, ≤155 chars.

## Sitemap + Robots

- [ ] `dist/sitemap.xml` present, lists 6 URLs (/ + ?view=3d + 4 ?focus=...), each with `<loc>` and `<lastmod>`.
- [ ] `dist/robots.txt` present, includes `Sitemap:` line pointing to deployed sitemap.xml.

## CTC-01 Web3Forms Verification

- [ ] Real submission tested end-to-end → arrived in **Gmail** inbox, NOT spam (date / time / message preview):
  - Date/time: __
  - Inbox / Spam: __
  - Reply-to set correctly: __
- [ ] Real submission tested end-to-end → arrived in **Outlook/Hotmail** inbox, NOT spam:
  - Date/time: __
  - Inbox / Spam: __
  - Reply-to set correctly: __

## Reviews

- [ ] Cyber peer review — Reviewer: ___, Date: ___, Verdict: ___, Notes: ___
- [ ] Non-cyber usability review — Reviewer: ___, Date: ___, Verdict: ___, Notes: ___

## Real-Device QA (OPS-04 + CONTEXT D-16)

- [ ] iOS device — Model: ___, iOS version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___
- [ ] Android device — Model: ___, Android version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___

---
*Last updated: 2026-MM-DD · checklist run before v1.0 release.*
```

### Pattern 19: CI-Gate-able vs Human-Eyes Items

**What:** Per OPS-05 ("≈25 items"), some are automatable, some inherently need human judgment. Splitting them sharpens what to put where.

| Item | Automation | Where |
|------|-----------|-------|
| `rel="noopener noreferrer"` audit | CI (grep gate) | Existing CHECKLIST-OPSEC §External Links + new CI step |
| CSP `<meta>` validates and includes `connect-src api.web3forms.com` | CI (grep + structured check) | New CI step in deploy.yml OR CHECKLIST-LAUNCH manual |
| Dev-helper strip (`<Stats>`, `<Perf>`, `console.log`, `leva`) | CI (grep dist after build) | New CI step BEFORE upload-pages-artifact |
| `npm audit` clean | CI (already automatable; not currently in deploy.yml) | New CI step |
| EXIF strip on assets | CI (already automated in deploy.yml — verified Phase 1 + 3) | EXISTING |
| OG image dimensions exactly 1200×630 | CI (`sips`/`identify` or `image-size` Node) | New CI step OR manual |
| sitemap.xml + robots.txt present in dist/ | CI (file-exists + URL-count grep) | New CI step OR manual |
| JSON-LD Person schema ships in production HTML | CI (grep `dist/index.html` for `"@type": "Person"`) | New CI step |
| OG card visual preview (LinkedIn/Slack) | **HUMAN** | Manual checklist item |
| Real submission landed in inbox (CTC-01) | **HUMAN** | Manual checklist item |
| Lighthouse score ≥ thresholds | CI advisory + HUMAN sign-off | CI lhci job + manual median-of-3 |
| Real-device QA (OPS-04) | **HUMAN** | Manual checklist (CONTEXT D-16) |
| Peer review (cyber + usability) | **HUMAN** | Manual checklist (CONTEXT D-15) |
| Anti-cliché audit (no Matrix rain, no skill bars, no fake REPL — Pitfall 6/7) | **HUMAN** (visual review) | Manual checklist |
| Screenshot full-resolution review (no IPs/hostnames) | **HUMAN** | EXISTING CHECKLIST-OPSEC § Screenshot Review |

**New CI gates to add to `deploy.yml` (Phase 4 plan slice):**
1. Dev-helper grep — fails if `<Stats|<Perf|console\.log` finds anything in `dist/assets/*.js` (without an `// dev-only` marker)
2. `rel="noopener noreferrer"` grep — fails if `target="_blank"` lacks `rel`
3. CSP `connect-src` grep — fails if `index.html` doesn't list `https://api.web3forms.com`
4. JSON-LD Person grep — fails if `dist/index.html` doesn't contain `"@type":"Person"` AND doesn't accidentally contain a plaintext `@gmail.com`-style email
5. `npm audit --production` — fails on high/critical
6. Optional: Lighthouse-CI advisory (non-blocking) — runs after deploy, posts results to PR but never fails build

**Recommendation:** Add gates 1-5 as BLOCKING in `deploy.yml`. Gate 6 ADVISORY.

### Pattern 20: Plaintext-Email-in-Bundle Audit

**What:** OPSEC checklist item carried from Phase 1 — the obfuscated email is rot13+base64; the plaintext must NEVER appear in shipped JS.

**Grep audit (add to deploy.yml as a new gate):**
```bash
# Check the actual plaintext email is NOT in the bundle.
# Replace `[a-z]+@[a-z.]+` below with the actual TLD pattern matching Eren's
# real address — but NOT the actual address (the script itself shouldn't
# contain the plaintext either).
if grep -rE 'eren\.atalay@[a-z.]+\.com' dist/; then
  echo "OPSEC FAIL: plaintext email leaked into dist/"
  exit 1
fi
```

Alternatively (more defensible — does not require knowing Eren's exact address in CI):
```bash
# Audit JSON-LD specifically — it's the most likely place for accidental
# plaintext-email leak. Phase 1 D-09 deliberately omits the email field;
# this gate verifies the omission survives.
if grep -o 'application/ld+json' dist/index.html >/dev/null; then
  if grep -A 30 'application/ld+json' dist/index.html | grep -E '"email"\s*:'; then
    echo "OPSEC FAIL: JSON-LD includes 'email' field (Pitfall 4)"
    exit 1
  fi
fi
```

This gate is BLOCKING per CHECKLIST-OPSEC's existing rules.

### Anti-Patterns to Avoid (Phase 4-specific)

These are forbidden by CONTEXT/UI-SPEC/REQUIREMENTS — they exist here as a reviewer-friendly summary:

- **Permanent `<Glitch />` postprocessing** — looks cool for 2 seconds, then nauseates. Phase 4 ships exactly four effects (Bloom + Scanline + CA + Noise).
- **`<DepthOfField>`, `<SSAO>`, `<Pixelation>`, `<DotScreen>` postprocessing** — REQUIREMENTS 3D-08 + CLAUDE.md anti-list.
- **A spinner glyph in `[Sending…]`** — typography contract: only literal `…` U+2026 allowed.
- **Gradient backgrounds** — Phase 1 § Color: one bg color (`#0d1117`).
- **A `<dialog>` confirmation modal** — no destructive actions in v1.
- **A "Coming soon" stub for missing TryHackMe / HackTheBox** — CONTEXT D-13 explicit (omit, don't placeholder).
- **A "rate this portfolio" button / link** — CONTEXT D-15 (Pitfall 7 trap).
- **Plaintext email in JSON-LD** — STATE.md `[Phase ?] Plan 01-06: JSON-LD Person omits email field per Pitfall 4`.
- **`manualChunks` config in vite.config.ts** — Phase 2 RESEARCH already established this breaks lazy loading.
- **A sharp Node-side image-processing pipeline** — overkill for a single OG image; ImageOptim/squoosh.app handles it.
- **An hCaptcha widget in v1** — CONTEXT D-11 picked honeypot. Defer hCaptcha to v1.1 if spam reaches inbox.
- **A "I just shipped v1.0" banner toast** — Phase 1 § OOS (no hire-me / newsletter modals).
- **Fabricated MDX write-ups** — Plan 03-06 deferred per "no fabricated lab evidence" rule.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Postprocessing pipeline | Custom CRT shader on monitor mesh | `@react-three/postprocessing` Bloom + Scanline + CA + Noise | CLAUDE.md "What NOT to Use" forbids custom shaders in v1; the postprocessing pipeline gives 80% of the CRT look at 5% of the time-cost. |
| Performance gating | Custom fps measurement → hand-rolled threshold | drei `<PerformanceMonitor>` | Battle-tested across pmndrs ecosystem; bounds + flipflops + onFallback semantics are non-trivial to get right. |
| GLB compression | Hand-roll `gltf-transform` CLI invocation | `gltfjsx --transform` | CLAUDE.md "What NOT to Use" forbids hand-rolling gltf-transform; gltfjsx wraps the standard pipeline. |
| Contact form | Custom serverless function or static-site form-handler other than Web3Forms | Web3Forms (250/mo free, public access key) | CLAUDE.md alternatives table verified Web3Forms beats Formspree (50/mo) and EmailJS (exposes Service ID). |
| Email obfuscation | Custom encoding scheme | Phase 1's `src/lib/obfuscate.ts` (rot13+base64) | Already shipped; reused by failure-state EmailReveal. |
| Form validation | zod / vee-validate / react-hook-form | HTML5 `required` + `pattern=".+@.+\..+"` + `maxLength` + minimal `useState` for inline error | CONTEXT D-11 explicitly excludes validation libraries — 3 fields don't justify the dependency. |
| OG image generation pipeline | Custom canvas-based generator + auto-deploy | macOS native screenshot + ImageOptim | CONTEXT § Claude's Discretion explicit: macOS native + ImageOptim/squoosh; no Figma/paid tools. |
| Lighthouse runner | Custom Puppeteer + Lighthouse-Node integration | `npx @lhci/cli autorun` | CONTEXT D-17 explicit; lhci is the standard. |
| CI-gate-able audits | Custom CI scripts in random shell | Extend existing `.github/workflows/deploy.yml` with grep + size-limit + audit steps | Phase 1 + 2 + 3 established the pattern; Phase 4 extends. |

**Key insight:** Phase 4 is integration, not invention. Every novel concern — postprocessing, contact form, OG image, Lighthouse — has a verified-standard solution in the ecosystem. The planner's job is to wire them in correctly, NOT to ship cleverness.

## Common Pitfalls

### Pitfall 1: `<Bloom>` `threshold={0.6}` does NOT exist
**What goes wrong:** CONTEXT D-08 says `threshold={0.6}` for Bloom. The underlying `BloomEffect` constructor option is `luminanceThreshold` (default 1.0). The React wrapper passes unknown props to the constructor verbatim — so `threshold={0.6}` is silently ignored, the bloom uses default `luminanceThreshold=1.0`, and the scene has effectively no bloom (the threshold is too high to pick up emissive materials at brightness ~0.5-0.7).
**Why it happens:** Tutorials and Stack Overflow examples sometimes use `threshold` as colloquial shorthand. The npm `@react-three/postprocessing` README has exactly this drift in older examples.
**How to avoid:** Use `luminanceThreshold={0.6}` explicitly. Search the codebase for `threshold=` after Phase 4 lands and verify all are `luminanceThreshold=`.
**Warning signs:** Bloom appears too subtle on the monitor screens (or not at all) when CONTEXT D-08 promises a clear emissive glow.

### Pitfall 2: `<Scanline>` and `<Noise>` `opacity` work via wrapEffect, NOT the underlying class
**What goes wrong:** A reviewer who looks at `postprocessing@6.39.x` source thinks `<Scanline opacity={0.15}>` is invalid because `ScanlineEffect`'s constructor doesn't accept opacity. They might "fix" it by removing the prop or refactoring to `blendMode-opacity-value` directly.
**Why it happens:** The underlying postprocessing library exposes `Effect.blendMode.opacity.value` as the canonical opacity uniform; the React wrapper hides this via `wrapEffect`'s `blendMode-opacity-value={opacity}` JSX prop.
**How to avoid:** Document this in the source comment of `src/3d/PostFX.tsx`:
```typescript
// `opacity` on Scanline + Noise is NOT a constructor option of the underlying
// postprocessing@6.x Effect class — it's exposed by @react-three/postprocessing's
// wrapEffect helper, which routes it to blendMode-opacity-value. Do NOT
// "refactor" by removing or splitting these props.
// Source: 04-RESEARCH.md Pattern 5; verified against
//   @react-three/postprocessing@3.0.4 src/util.tsx 2026-05-08.
```

### Pitfall 3: Web3Forms POST blocked by CSP `connect-src 'self'`
**What goes wrong:** Phase 1 ships a permissive baseline CSP with `connect-src 'self'`. The contact form's `fetch('https://api.web3forms.com/submit')` is cross-origin → browser blocks the request → form silently shows failure UX. Eren tests in dev (no CSP) and it works; production fails.
**Why it happens:** The CSP `<meta>` tag was not extended when Web3Forms was integrated.
**How to avoid:** Phase 4 plan slice for ContactForm MUST include the CSP extension:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               font-src 'self';
               connect-src 'self' https://api.web3forms.com;  <!-- NEW -->
               base-uri 'self';
               form-action 'self' https://api.web3forms.com;   <!-- NEW; for non-fetch fallback -->
               frame-ancestors 'none';" />
```
Add a CHECKLIST-LAUNCH.md item that greps for `https://api.web3forms.com` in `dist/index.html` post-build.

### Pitfall 4: OG image leaks IPs/hostnames/notifications on screenshot
**What goes wrong:** Eren takes the OG screenshot with a Slack notification visible in the corner, OR with the deployed URL showing `localhost:5173` instead of the GH Pages URL, OR with browser extensions populating the right-click menu. Screenshot ships to LinkedIn → recruiter sees Eren's friends' Slack avatars.
**Why it happens:** Author-side blindness — Eren sees the page as the author, not as a hostile reader.
**How to avoid:** Pattern 12 step 8 (full-resolution review). Add an explicit OPSEC checklist item:
```markdown
- [ ] OG image full-resolution review: open Preview at 100% zoom, audit:
  - No notification banners (Slack, Discord, Mail, system)
  - No browser extension badges in the address bar / right of URL
  - No password-manager autofill
  - No `localhost:` or `127.0.0.1` in the address bar
  - No partial reflection of face / room / family member
  - No browser tab title leaking another site
  - No employer / NDA-covered content
```
Pattern: Eren takes the screenshot from a clean-profile browser (no extensions, no logins, no notifications), in a clean-desktop space (no notifications, no other apps).

### Pitfall 5: Real-device QA done in DevTools mobile emulation
**What goes wrong:** Eren tests on Chrome DevTools "iPhone 12" emulation, declares OPS-04 done, ships. Real iPhone 12 has different memory limits, different WebGL implementation, different touch event handling — actual recruiter on actual iPhone gets a frozen 3D scene, leaves.
**Why it happens:** DevTools emulation lies about WebGL capabilities and memory pressure. PITFALLS.md Pitfall 3 already documents this.
**How to avoid:** CONTEXT D-16 EXPLICITLY rejects DevTools emulation by demanding "two specific committed devices." Pattern 16 step 4 + step 7 are real-device-only.

### Pitfall 6: `gltfjsx --transform` produces a `.glb` whose textures are inline base64 — defeating the size budget
**What goes wrong:** Some `gltfjsx --transform` invocations produce GLBs with embedded base64 textures instead of external files. The "embedded" form is technically smaller in some scenarios but blocks the size-limit measurement that targets `*.glb` separately.
**Why it happens:** The default behavior of gltf-transform (which gltfjsx shells to) is to inline binary data. For a single `.glb` asset, this is fine — embedded is the canonical GLB format.
**How to avoid:** This is actually NOT a pitfall — `.glb` (binary) inherently embeds textures. The size-limit budget targets the `.glb` file's total raw size INCLUDING embedded textures. Concern is unfounded; included here for completeness.

### Pitfall 7: Web3Forms quota exhaustion attack
**What goes wrong:** A bot finds the contact form, exhausts the 250/mo quota in the first hour. For the rest of the month, real recruiter submissions return 4xx (over quota).
**Why it happens:** Web3Forms 250/mo is per-account, not per-IP. A bot can submit 251 times before any rate limit kicks in.
**How to avoid:**
- Honeypot (Pattern 8) catches naive bots.
- Defense-in-depth: client-side honeypot abort prevents real `fetch` calls when honeypot is filled, saving Web3Forms quota slots even when bots probe.
- Monitoring: check the Web3Forms dashboard daily during the first week of v1.0. If quota burns abnormally fast, add hCaptcha (free tier).
- Recovery: if quota IS exhausted, the failure state UX falls back to the obfuscated email reveal — recruiter still has a path to Eren.

### Pitfall 8: Lighthouse audit on `?view=3d` fails because GH Pages cold-cache
**What goes wrong:** First run after a deploy has cold CDN cache; LCP balloons; Performance score drops to 60s. Subsequent runs hit warm cache and score 90+.
**Why it happens:** GH Pages serves through a CDN (Fastly); cold-cache on first request to a path is realistic but not representative of "average" recruiter experience.
**How to avoid:** Run Lighthouse 3 times AFTER a "warmup" hit:
```bash
# Warmup: prime CDN cache
curl -s -o /dev/null https://eren-atalay.github.io/Portfolio_Website/
curl -s -o /dev/null https://eren-atalay.github.io/Portfolio_Website/?view=text
curl -s -o /dev/null https://eren-atalay.github.io/Portfolio_Website/?view=3d
sleep 5
# Then run lhci 3x and take median
npx @lhci/cli autorun --collect.url=... --collect.numberOfRuns=3
```
Document this in CHECKLIST-LAUNCH.md.

## Code Examples

Verified patterns from official sources + local node_modules inspection:

### `<EffectComposer>` lazy + Suspense
```typescript
// src/3d/ScenePostprocessing.tsx
// Source: 04-RESEARCH.md Pattern 3; CONTEXT D-05/D-06/D-07/D-09
// Verified: drei.docs.pmnd.rs/performances/performance-monitor 2026-05-08
import { Suspense, lazy, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';

const PostFX = lazy(() => import('./PostFX').then((m) => ({ default: m.PostFX })));

export function ScenePostprocessing() {
  const [tier, setTier] = useState<'high' | 'low'>('high');
  return (
    <>
      <PerformanceMonitor
        bounds={() => [30, 50]}
        flipflops={3}
        onIncline={() => setTier('high')}
        onDecline={() => setTier('low')}
        onFallback={() => setTier('low')}
      />
      {tier === 'high' && (
        <Suspense fallback={null}>
          <PostFX />
        </Suspense>
      )}
    </>
  );
}
```

### Postprocessing effects (corrected prop names)
```typescript
// src/3d/PostFX.tsx — separate module = separate Vite chunk
// Source: 04-RESEARCH.md Pattern 5
// Verified: /tmp/pp-check inspection of @react-three/postprocessing@3.0.4 +
//   postprocessing@6.39.1 type defs, 2026-05-08
import {
  EffectComposer,
  Bloom,
  Scanline,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';

export function PostFX() {
  return (
    // multisampling default in @react-three/postprocessing@3 is 8 — set to 0
    // explicitly for low-end GPU friendliness; mipmapBlur on Bloom is the
    // dominant antialiasing path for the dark scene.
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.6}      // CONTEXT D-08 (corrected from `threshold`)
        luminanceSmoothing={0.025}
        intensity={0.6}
        mipmapBlur
      />
      <Scanline
        density={1.25}                // REQUIREMENTS 3D-08
        opacity={0.15}                // wrapEffect → blendMode-opacity-value
      />
      <ChromaticAberration
        offset={[0.0008, 0.0008]}     // Vector2 tuple form
      />
      <Noise
        opacity={0.04}                // wrapEffect → blendMode-opacity-value
      />
    </EffectComposer>
  );
}
```

### Web3Forms contact submit
```typescript
// src/lib/web3forms.ts — single source of truth
// Source: 04-RESEARCH.md Pattern 7; docs.web3forms.com 2026-05-08
const ENDPOINT =
  import.meta.env.VITE_FORM_ENDPOINT ?? 'https://api.web3forms.com/submit';

export interface ContactFormPayload {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormResult {
  ok: boolean;
  diagnosticForLog?: string;
}

export async function submitContact(payload: ContactFormPayload): Promise<ContactFormResult> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (!accessKey) return { ok: false, diagnosticForLog: 'access_key not configured' };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: accessKey,
        name: payload.name,
        email: payload.email,
        message: payload.message,
        subject: `[Portfolio enquiry] from ${payload.name || '(name empty)'}`,
        from_name: 'Portfolio Contact Form',
      }),
    });
    if (res.ok) {
      const json = (await res.json()) as { success?: boolean };
      return { ok: json.success === true };
    }
    return { ok: false, diagnosticForLog: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, diagnosticForLog: err instanceof Error ? err.message : String(err) };
  }
}
```

### sitemap.xml (replace existing stub)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Source: 04-CONTEXT.md § Claude's Discretion (sitemap.xml content) -->
  <!-- 6 URLs: text-shell + 3D-shell + 4 deep-link focuses -->
  <url><loc>https://eren-atalay.github.io/Portfolio_Website/</loc><lastmod>2026-05-15</lastmod></url>
  <url><loc>https://eren-atalay.github.io/Portfolio_Website/?view=3d</loc><lastmod>2026-05-15</lastmod></url>
  <url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=projects</loc><lastmod>2026-05-15</lastmod></url>
  <url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=writeups</loc><lastmod>2026-05-15</lastmod></url>
  <url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=certs</loc><lastmod>2026-05-15</lastmod></url>
  <url><loc>https://eren-atalay.github.io/Portfolio_Website/?focus=contact</loc><lastmod>2026-05-15</lastmod></url>
</urlset>
```

**Note on `<changefreq>` and `<priority>`:** CONTEXT § Claude's Discretion is correct: major search engines (Google) deprecated these tags in 2023. Modern sitemaps use only `<loc>` + `<lastmod>`. The existing stub `public/sitemap.xml` includes `<changefreq>` + `<priority>` — Phase 4 should REMOVE them.

### CSP extension
```html
<!-- index.html — replace existing CSP <meta> -->
<!-- Source: 04-RESEARCH.md Pattern 7 + Pitfall 3 -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' data:;
               font-src 'self';
               connect-src 'self' https://api.web3forms.com;
               base-uri 'self';
               form-action 'self' https://api.web3forms.com;
               frame-ancestors 'none';" />
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom CRT shader on monitor mesh | `@react-three/postprocessing` Bloom + Scanline + ChromaticAberration + Noise | postprocessing@4+ ecosystem maturity (2024+) | Avoids custom GLSL surface — CLAUDE.md explicit |
| `framer-motion` package | `motion` package, import from `motion/react` | 2025 (Framer spin-off) | N/A for Phase 4 (no new motion) |
| Lighthouse `--emulated-form-factor=mobile` flag | `--form-factor=mobile` (or default; mobile is now default) | Lighthouse 11+ | Use `--form-factor` if needed; usually default |
| Sitemap.xml with `<changefreq>` + `<priority>` | Sitemap.xml with only `<loc>` + `<lastmod>` | 2023 — Google deprecated `<changefreq>` and `<priority>` | Existing stub uses deprecated tags; Phase 4 strips |
| `gh-pages` npm package + `gh-pages` branch | GitHub Actions + `actions/deploy-pages` | 2024+ | Already in place since Phase 1 |
| Formspree free tier (50/mo) | Web3Forms free tier (250/mo) | Web3Forms launch + tier expansion | CLAUDE.md verified-stack pick |

**Deprecated/outdated:**
- `<changefreq>` and `<priority>` in sitemap.xml — strip during Phase 4.
- Lighthouse `--emulated-form-factor` flag — replaced by `--form-factor` (current name).
- `vite-plugin-mdx` — Phase 3 already locked `@mdx-js/rollup` (official path).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Web3Forms free-tier limit is 250 submissions/month | Pattern 7, CTC-01 | If lower (e.g., 100), v1 might exhaust quota faster than expected. Mitigation: monitor dashboard week 1 + fallback obfuscated email always available. CLAUDE.md says 250/mo; I could not extract this directly from web3forms.com pricing page (403 fetch). `[ASSUMED based on CLAUDE.md citation; verify on web3forms.com/pricing manually]` |
| A2 | `~25-30 KB gz` for `@react-three/postprocessing` runtime + `~30-40 KB gz` for `postprocessing@6.x` library | Pattern 6 | If actual gz is 100+ KB, the 3D chunk hits 450 KB ceiling. Mitigation: measure with `npm run size` immediately after Plan 04-01 lands. `[ASSUMED based on bundlephobia for similar @react-three/* packages; not directly measured.]` |
| A3 | `npx gltfjsx --transform` defaults are appropriate for our scene (Draco standard level + WebP textures + 1024² hero / 512² props) | Pattern 2 | If output exceeds 2 MB total, asset pipeline must be rerun with explicit Draco level / KTX2 / further texture downsizing. Mitigation: 7-day timebox in CONTEXT D-04 — if can't ship within budget, fall back to v1.1. `[ASSUMED — gltfjsx defaults are a starting point; tune at execution.]` |
| A4 | `<PerformanceMonitor>` `flipflops={3}` is the right ping-pong cap | Pattern 4 | If too aggressive (flips to low after one bad frame run), real users on borderline devices stuck on low tier permanently. If too lax (Infinity default), oscillates indefinitely. `[ASSUMED based on drei docs convention; verify on real-device QA.]` |
| A5 | iOS Safari WebGL2 quirks are stable as of iOS 17+ (no new context-loss regressions in iOS 18) | Pitfall 17 + Pattern 16 step 7 | If iOS 18 has worse memory pressure handling, the 30-min soak may surface new failures requiring v1.0 ship without 3D shell on iOS. Mitigation: real-device QA catches it. `[ASSUMED — iOS 17 issues documented in three.js forum; iOS 18 unknown.]` |
| A6 | macOS native `screencapture` produces a 1× DPR PNG when `-R` flag is used (NOT 2× retina) | Pattern 12 | If screenshot is 2400×1260 instead of 1200×630, OG image fails dimension check. Mitigation: `sips` verification step in CHECKLIST-LAUNCH. `[ASSUMED — screencapture behavior; planner verifies during execution.]` |
| A7 | Web3Forms' `from_name` and `subject` fields are accepted on the free tier | Pattern 7 | If only PRO accepts, our `subject: '[Portfolio enquiry] from <Name>'` is silently dropped → notifications arrive with generic subject. Mitigation: verify in CTC-01 end-to-end test (Pattern 10). `[ASSUMED based on docs.web3forms.com — both listed as "optional" without PRO badge.]` |
| A8 | `connect-src 'self' https://api.web3forms.com` is sufficient — no Web3Forms CDN/asset endpoints needed beyond the submit endpoint | Pattern 7 + Pitfall 3 | If Web3Forms loads tracking pixels or analytics from a different subdomain, those would be blocked. Mitigation: test in dev with CSP enforcement enabled BEFORE deploy. `[ASSUMED — Web3Forms is a single-endpoint API per docs; no client-side JS to load.]` |
| A9 | Lighthouse default mobile preset (Slow 4G + Moto G4 + 4× CPU) is unchanged in current Lighthouse 13.3.0 | Pattern 13 | If preset has been replaced with newer device class (e.g. "Moto G Power"), CONTEXT D-17's named preset is misnamed but still equivalent. Mitigation: doc strings, not load-bearing for the assertion thresholds. `[VERIFIED via Lighthouse throttling.md but documentation may lag the binary; verify by inspecting `lhci autorun` output line "Emulated Moto G4..."]` |
| A10 | The composite GLB approach (4-5 separate Poly Haven models combined in code) totals ≤ 2 MB after `gltfjsx --transform` | Pattern 1 | If component models are larger than estimated, total breaches 2 MB GLB budget → size-limit fails → blocked. Mitigation: 7-day timebox in CONTEXT D-04. `[ASSUMED based on Poly Haven Metal Office Desk = 7K tris; per-prop budget assumes similar.]` |

## Open Questions (RESOLVED)

1. **Which Eren-handle to use across the live profile links?** — **RESOLVED.** Plan 04-03 surfaces handles at execution time via Eren-supplied input on `identity.ts`. Missing platform omitted per CONTEXT D-13 fallback. No platform = `<LiveProfiles />` returns null entirely.

2. **Which deployed URL host: `eren-atalay.github.io` or `erenatalaycs.github.io`?** — **RESOLVED.** Plan 04-04 Task 1 is a `checkpoint:decision` that asks Eren which is canonical. Whichever wins propagates to `index.html` `<link rel="canonical">`, `<meta og:url>`, `<meta og:image>`, JSON-LD `url`/`image`, `public/sitemap.xml`, `public/robots.txt`, and Lighthouse CI URLs (overrides CONTEXT D-17 if Eren picks differently).

3. **The Web3Forms 250/mo claim — is it still accurate in 2026?** — **RESOLVED.** Assumed 250/mo for planning. Eren verifies live limit at Plan 04-08 Task 3 (Gmail+Outlook delivery test). If lower than expected, hCaptcha integration becomes a v1.1 follow-up (not v1.0 blocker).

4. **Should the OG image be regenerated automatically on every deploy, or one-shot?** — **RESOLVED.** One-shot per Plan 04-08 Task 1 (`checkpoint:human-action`). Eren takes the screenshot at full resolution, runs ImageOptim, replaces `public/og-image.png`. Auto-regen via Playwright deferred to v1.1.

5. **Should Lighthouse-CI be a blocking CI gate or advisory?** — **RESOLVED.** Advisory non-blocking per Plan 04-07 Task 2 (`lighthouse.yml` workflow gives a build-trend artifact). OPS-03 sign-off authoritative source is the manual deployed-URL median-of-3 in Plan 04-08 Task 2.

## Environment Availability

> Confirms tools needed by Phase 4 are reachable. CI runs on Ubuntu via GH Actions; Eren's local dev is macOS.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build, lhci, gltfjsx | ✓ (.nvmrc + GH Actions) | 22 LTS | — |
| npm | Package install | ✓ | bundled with Node | — |
| `npx gltfjsx` | Pattern 2 (one-shot at integration) | ✓ via npm registry | 6.5.3 | gltf-transform CLI directly (CLAUDE.md "What NOT to Use" — but functional) |
| `npx @lhci/cli` | Pattern 13 (deployed-URL audit) | ✓ via npm registry | 0.15.1 | `npx lighthouse <url>` (raw CLI, single report instead of 3-runs + assert) |
| `exiftool` | Already-installed CI step (deploy.yml) | ✓ | apt-get installs `libimage-exiftool-perl` | — (already integrated; OPSEC checklist depends on it) |
| ImageOptim (macOS) | OG image compression | Author-side only | — | https://squoosh.app (web tool; Chrome) |
| Chrome (or Safari) at 1200px width | OG image screenshot | Author-side only | — | Playwright headless (devDep, optional path) |
| iOS device (Pattern 16) | Real-device QA | Author-side only | iPhone 12 / iOS 17+ recommended | None — CONTEXT D-16 rejects DevTools emulation + BrowserStack |
| Android device (Pattern 16) | Real-device QA | Author-side only | 4 GB RAM mid-tier, Chrome 130+ recommended | None |
| Web3Forms account | CTC-01 backend | Author-side, free signup | — | Formspree as fallback (lower free tier) |
| TryHackMe + HackTheBox profiles | CTC-03 link surfacing | Author-side; at least 1 platform required | — | Omit missing platform per CONTEXT D-13 |
| Cyber peer reviewer (named) | CONTEXT D-15 | Author-side, names at plan time | — | None — D-15 rejects anonymous public-sub feedback |
| Non-cyber usability reviewer | CONTEXT D-15 | Author-side, names at plan time | — | None |

**Missing dependencies with no fallback:**
- iOS device, Android device, named cyber peer, named usability peer — Eren must commit at plan-execution time. Phase 4 verification stays `human_needed` until they're filled in CHECKLIST-LAUNCH.md.

**Missing dependencies with fallback:**
- ImageOptim macOS app → squoosh.app web alternative.
- `@lhci/cli` → raw `npx lighthouse` (single-run with manual median-of-3).

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.2.4 (existing — Phase 1+2+3) + Playwright 1.59.1 (optional, dev-only, for OG image script) |
| Config file | `vitest.config.ts` (existing); no Playwright config in v1 |
| Quick run command | `npm test` (vitest run) |
| Full suite command | `npm test && npm run parity && npm run size && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| 3D-08 | `<PerformanceMonitor>` gates `<EffectComposer>` mount; tier-flip is instant; binary high/low | unit (component render under React Test Renderer with mocked drei `<PerformanceMonitor>`) | `npm test -- src/3d/ScenePostprocessing.test.tsx` | ❌ Wave 0 |
| 3D-08 | `<PostFX>` lazy-loads as separate chunk | manual + bundle inspection | `ls dist/assets/PostFX-*.js` after `npm run build` | manual |
| CTC-01 | `submitContact()` POSTs to Web3Forms with correct payload + access_key | unit (mock global fetch; assert URL + body shape) | `npm test -- src/lib/web3forms.test.ts` | ❌ Wave 0 |
| CTC-01 | `<ContactForm>` renders idle / submitting / success / failure states | unit (RTL render + click + setState) | `npm test -- src/ui/ContactForm.test.tsx` | ❌ Wave 0 |
| CTC-01 | Honeypot abort path — silent success, no fetch call | unit (mock fetch + spy that NOT called when honeypot value present) | `npm test -- src/ui/ContactForm.test.tsx` | ❌ Wave 0 |
| CTC-01 | End-to-end Gmail + Outlook delivery | manual (CHECKLIST-LAUNCH item) | Pattern 10 protocol | manual |
| CTC-03 | `<LiveProfiles>` renders both / single / neither correctly | unit (RTL render with various identity.ts mocks) | `npm test -- src/ui/LiveProfiles.test.tsx` | ❌ Wave 0 |
| OPS-03 | Lighthouse on deployed text shell ≥ thresholds | manual (median-of-3) | `npx @lhci/cli autorun --collect.url=...` | manual |
| OPS-04 | Real-device QA on 2 devices passes per Pattern 16 | manual | per-device protocol | manual |
| OPS-05 | Pre-launch checklist items pass | mixed (CI gates + manual) | `.github/workflows/deploy.yml` extended + `CHECKLIST-LAUNCH.md` filled | manual + CI |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test && npm run parity`
- **Phase gate:** Full suite green (incl. `npm run size`) + manual checklist items + real-device QA + peer review before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/setup.ts` — already exists Phase 1; Phase 4 may need fetch global mock helper (add to existing setup file, not a new file)
- [ ] `src/3d/ScenePostprocessing.test.tsx` — covers 3D-08 tier-flip
- [ ] `src/lib/web3forms.test.ts` — covers CTC-01 POST shape + honeypot abort
- [ ] `src/ui/ContactForm.test.tsx` — covers CTC-01 render states + honeypot client-side abort
- [ ] `src/ui/LiveProfiles.test.tsx` — covers CTC-03 single/both/neither render

*(jsdom does not render WebGL; `<PostFX>` itself is NOT unit-tested — Phase 2 RESEARCH established this convention. Visual verification on real device.)*

## Security Domain

> `security_enforcement` is enabled (CLAUDE.md OPSEC carries through every phase). Section included.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | no | Static portfolio — no user accounts |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | All content public |
| V5 Input Validation | yes | HTML5 `required` + `pattern` + `maxLength` on ContactForm; server-side Web3Forms also validates |
| V6 Cryptography | partial | Email obfuscation = rot13+base64 (anti-scrape, NOT encryption — explicit in `src/lib/obfuscate.ts`); no other crypto |
| V7 Error Handling | yes | Failure UX shows generic "Network error." (Pitfall 4 information disclosure mitigation) |
| V8 Data Protection | yes | No PII collected by us; Web3Forms is the data processor for contact submissions |
| V9 Communication | yes | All HTTPS (GH Pages enforces; Web3Forms enforces); CSP `connect-src` whitelist |
| V13 Misc / Configuration | yes | CSP `<meta>` tag; `rel="noopener noreferrer"` on external links; sourcemaps OFF; dev-helper strip |
| V14 Configuration | yes | No secrets in source; public-by-design Web3Forms key; build-time env injection |

### Known Threat Patterns for {React + R3F + Vite + GH Pages + Web3Forms}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via user-controlled content in MDX write-ups | Tampering | Phase 3 already locks: `<MDXProvider>` renders trusted MDX from repo; no user-supplied content. |
| XSS via Web3Forms reply (Eren receives email; not user-facing) | Tampering | Web3Forms server-side processes; Eren is the recipient — risk to Eren's email client, not the website. |
| OPSEC info disclosure in error messages | Information Disclosure | Pattern 7 + Pattern 18: `<ContactForm>` shows generic "Network error.", logs `diagnosticForLog` to dev console only. |
| OPSEC info disclosure in OG image | Information Disclosure | Pattern 12 step 8 OPSEC review; CHECKLIST-LAUNCH item. |
| OPSEC info disclosure in JSON-LD | Information Disclosure | STATE.md `[Phase 1] JSON-LD Person omits email`; Pattern 20 grep gate. |
| OPSEC info disclosure in source maps | Information Disclosure | `vite.config.ts build.sourcemap: false` (Phase 1 lock); CHECKLIST-OPSEC verifies. |
| Quota exhaustion attack on Web3Forms | DoS | Pattern 8 honeypot + Pattern 7 client-side abort + Pitfall 7 monitoring. |
| Plaintext-email leak in JS bundle | Information Disclosure | Pattern 20 grep gate; Phase 1 obfuscation pipeline. |
| Cross-origin POST blocked by CSP | Misconfiguration | Pitfall 3: CSP MUST extend `connect-src` for `https://api.web3forms.com`. |
| Bots scraping `target="_blank"` to phish | Tampering | OPS-05 audit: `rel="noopener noreferrer"` on every external link. |
| Stale dependency with CVE | Tampering | `npm audit --production` CI gate (Pattern 19). |
| GLB asset embedded with unwanted metadata | Information Disclosure | Pattern 1 + CHECKLIST-OPSEC: `gltf-transform inspect` + `exiftool` strip pipeline. |

## Sources

### Primary (HIGH confidence)
- `[VERIFIED: /tmp/pp-check/node_modules/@react-three/postprocessing@3.0.4/src/util.tsx]` — `wrapEffect` opacity routing
- `[VERIFIED: /tmp/pp-check/node_modules/postprocessing@6.39.1/build/types/index.d.ts]` — Bloom/Scanline/Noise/CA constructor options
- `[VERIFIED: /tmp/pp-check/node_modules/@react-three/postprocessing/dist/EffectComposer.d.ts]` — multisampling default = 8
- `[VERIFIED: drei.docs.pmnd.rs/performances/performance-monitor 2026-05-08]` — PerformanceMonitor API
- `[VERIFIED: docs.web3forms.com/llms-full.txt 2026-05-08]` — endpoint, fields, success shape
- `[VERIFIED: github.com/surjithctly/web3forms-docs spam-protection.md]` — botcheck = checkbox
- `[VERIFIED: polyhaven.com/a/metal_office_desk]` — CC0 + 7K tris + multiple texture resolutions
- `[VERIFIED: github.com/pmndrs/gltfjsx README]` — `--transform`, `--resolution`, `--format`, `--types` flags
- `[VERIFIED: googlechrome.github.io/lighthouse-ci/docs/configuration.html 2026-05-08]` — autorun + url + numberOfRuns + assert
- `[VERIFIED: github.com/GoogleChrome/lighthouse/docs/throttling.md]` — Slow 4G + Moto G4 default
- npm registry verified 2026-05-08:
  - `@react-three/postprocessing@3.0.4`
  - `postprocessing@6.39.1` (peer three `>= 0.168.0 < 0.185.0`)
  - `@lhci/cli@0.15.1`
  - `gltfjsx@6.5.3`
  - `lighthouse@13.3.0`
  - `@playwright/test@1.59.1`
  - `sharp@0.34.5`

### Secondary (MEDIUM confidence)
- `[CITED: docs.web3forms.com → "free tier 250/mo"]` — claim widely repeated; could not directly extract from web3forms.com/pricing (403). See A1.
- `[CITED: bundlephobia.com / npm trends — postprocessing pkg sizes]` — used for budget projection in Pattern 6.
- `[CITED: stackoverflow + dev.to articles on `<PerformanceMonitor>` flipflops semantics]`
- `[CITED: github.com/pmndrs/react-postprocessing issue #301 — R3F v9 compatibility]`
- `[CITED: discourse.threejs.org context-loss threads — iOS Safari WebGL2 quirks]`

### Tertiary (LOW confidence — flag for validation)
- The exact KB-gz contribution of `@react-three/postprocessing@3.0.4` runtime to our bundle — not directly measured; A2 estimate. Verify with `npm run size` post-Plan 04-01.
- `gltfjsx --transform` exact final size for our composite GLB — A3 estimate. Verify with `gltf-transform inspect` post-pipeline.
- macOS `screencapture -R 0,0,1200,630` produces a 1× DPR PNG — A6 assumption. Verify with `sips -g pixelWidth pixelHeight`.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified live; node_modules source inspected for correctness.
- Architecture: HIGH — building on Phase 2 + Phase 3 patterns that already shipped.
- Pitfalls: HIGH for technical (Bloom prop name, CSP, opacity routing); MEDIUM for operational (real-device QA depth, Web3Forms quota behavior).
- CC0 GLB shortlist: MEDIUM — license + polygon counts confirmed for shortlist items; final fit-to-frustum + size-limit pass deferred to execution.

**Research date:** 2026-05-08
**Valid until:** 2026-06-08 (30 days for stable; 7 days for Web3Forms quota policy or postprocessing version bumps).
