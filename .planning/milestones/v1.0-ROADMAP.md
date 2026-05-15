# Roadmap: Eren Atalay — Portfolio Website

**Created:** 2026-05-06
**Granularity:** coarse (4 phases, ~1 week each)
**Coverage:** 32/32 v1 requirements mapped
**Core value:** Make a cyber recruiter or hiring manager think *"this person actually gets this field"* within seconds — without ever forcing recruiters to wait for a 3D scene before they can find the CV and contact details.

## Overview

Four weeks, four phases, one principle: **the recruiter contract ships in Week 1, the scary 3D pipeline gets validated in Week 2 with throwaway primitives, content integration in Week 3 reuses what already exists, and Week 4 quarantines polish behind a pre-launch checklist.** If the project is dropped at the end of any week from Week 1 onwards, what's live is shippable. Each phase has a single dominant risk it retires: Phase 1 retires the recruiter-bounce risk, Phase 2 retires the R3F-on-GH-Pages risk, Phase 3 retires the content-drift risk, Phase 4 retires the OPSEC + cliché + accessibility risks under one final audit.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation + 2D Recruiter-Grade Shell** - Vite/React/TS/Tailwind scaffold, GH Pages deploy live, fully functional terminal-styled text shell with CV/contact reachable in <2s
- [ ] **Phase 2: 3D Shell + Asset Pipeline + Capability Gating** - Lazy-loaded 3D shell with placeholder workstation, capability detection routing weak devices to text shell, size-limit budgets in CI
- [ ] **Phase 3: Content Integration + MDX Write-ups + Camera Choreography** - drei `<Html>` monitors render shared `src/ui/*` components, `whoami` greeting, click-to-focus camera animation, MDX CTF write-ups
- [ ] **Phase 4: Real Asset, Postprocessing, Polish, Pre-Launch QA** - Real GLB workstation, Bloom/Scanline/CA postprocessing, Web3Forms wired, Lighthouse + real-device + OPSEC audit, ship

## Phase Details

### Phase 1: Foundation + 2D Recruiter-Grade Shell

**Goal:** A live, terminal-styled, recruiter-grade portfolio at `eren-atalay.github.io/Portfolio_Website/` with the CV and contact reachable in under two seconds — before any 3D code has been written.

**Depends on:** Nothing (first phase)

**Requirements:** FND-01, FND-02, FND-03, FND-04, CNT-01, CNT-04, CNT-05, TXT-01, TXT-02, TXT-03, TXT-04, TXT-05, CTC-02, OPS-01

**Why this phase exists (rationale for the user):** The recruiter contract from PROJECT.md (CV + contact + GitHub + LinkedIn in <2s) must be unconditionally satisfied before any 3D code is written. Locking in the deploy pipeline early surfaces GH-Pages quirks (base path, 404 fallback, asset URLs) with placeholder content rather than discovering them in Week 4 with finished content. This phase is the safety net for the entire project — if anything goes wrong in Weeks 2-4, what's live is still shippable.

**Success Criteria** (what must be TRUE):
  1. A recruiter on a throttled "Slow 4G" connection can land on the live site and reach the CV PDF, GitHub link, LinkedIn link, and (obfuscated) email within 2 seconds — all rendered as plain `<a>` tags in the document at first paint, before any R3F code executes.
  2. Every section listed in TXT-03 (About, Education, Certifications with honest "in progress" labels, Skills as a tag list, Projects, Write-ups, Contact) is present in the text shell and styled with the off-black + softened green terminal palette that passes WCAG AA contrast.
  3. A push to `main` triggers GitHub Actions, which builds, copies `dist/index.html` → `dist/404.html`, and deploys via `actions/deploy-pages`; deep-linking to `/Portfolio_Website/?focus=projects` does not 404 and scrolls to the projects section.
  4. `prefers-reduced-motion: reduce` is honoured site-wide and the entire text shell is keyboard-navigable end-to-end with a visible "Skip to content" focus order.
  5. The CV PDF in `public/assets/` has been verified clean of EXIF/metadata via `exiftool`, and an OPSEC pre-publish checklist exists in `.planning/` covering screenshot review, EXIF strip, and IP/hostname/employer-leak audits.

**Plans**: TBD

### Phase 2: 3D Shell + Asset Pipeline + Capability Gating

**Goal:** A lazy-loaded 3D shell mounting only when capability detection passes, displaying a placeholder workstation built from procedural primitives, with size-limit budgets enforced in CI — validating the entire R3F + GH Pages + Suspense pipeline before any real content or assets are poured into it.

**Depends on:** Phase 1

**Requirements:** 3D-01, 3D-02, 3D-03, 3D-04, 3D-09, OPS-02

**Why this phase exists (rationale for the user):** The 3D layer is where the unknowns live (R3F + drei version pinning, lazy-chunk splitting, GH Pages base-path interactions, capability heuristics, WebGL context loss). Surfacing those gotchas with throwaway primitive geometry — desk + 3 monitor boxes + emissive screens — costs nothing if a re-architecture is needed. This phase is also where the always-visible view-toggle ships, so power users on weak devices can still opt into 3D and weak-device users get the text shell automatically.

**Success Criteria** (what must be TRUE):
  1. On a capable desktop with WebGL2, the default landing experience is the 3D shell showing a placeholder workstation (desk + 3 monitor primitives + lamp + bookshelf) with clamped OrbitControls — and the JS bundle has split such that the text-shell path never downloads R3F/three/drei (verified in DevTools network tab).
  2. On mobile, a device with `deviceMemory<4`, `hardwareConcurrency≤4`, missing WebGL2, or `prefers-reduced-motion: reduce`, the user lands on the text shell automatically, while `?view=3d` overrides the heuristic and `?view=text` always serves the text shell.
  3. A view-toggle DOM overlay (sibling of `<Canvas>`, not inside it) is always visible in both shells and switches between them by updating `?view=` and remounting the chosen shell.
  4. Triggering a `webglcontextlost` event (via DevTools or real iOS Safari memory pressure) cleanly swaps the user to the text shell — no blank screen, no console crash, no half-restored scene.
  5. CI enforces `size-limit` budgets — text-shell initial JS <120 KB gz, 3D lazy chunk <450 KB gz, GLB <2.5 MB — and the build fails if any budget is exceeded.

**Plans:** 3/5 plans executed
- [x] 02-01-PLAN.md — Bootstrap R3F/drei/three deps, scene/colors.ts token mirror, vite.config chunkFileNames (no manualChunks) ✓ 2026-05-06
- [x] 02-02-PLAN.md — Capability detection (5 checks + tablet pass-through) + App.tsx React.lazy + Suspense + contextLost state lift ✓ 2026-05-06
- [x] 02-03-PLAN.md — BracketLink as/active props, shared Header, ViewToggle, CameraToggle, ContextLossBar full UI-SPEC implementation
- [x] 02-04-PLAN.md — ThreeDShell + procedural Workstation (Desk, 3 Monitors, Lamp, Bookshelf, Floor) + Lighting + OrbitControls + webglcontextlost listener
- [x] 02-05-PLAN.md — size-limit budgets in package.json + CI gate in deploy.yml (text <120 KB gz, 3D <450 KB gz, GLB <2.5 MB ignored until Phase 4)

**UI hint**: yes

### Phase 3: Content Integration + MDX Write-ups + Camera Choreography

**Goal:** The 3D scene's monitors render real content via drei `<Html transform occlude="blending">` reusing the same `src/ui/*` components the text shell already ships, plus the animated `whoami` greeting on the main monitor, click-to-focus camera animation per monitor, and 2-3 MDX CTF write-ups reachable from both shells with section-by-section parity.

**Depends on:** Phase 2

**Requirements:** CNT-02, CNT-03, 3D-05, 3D-06, 3D-07, TXT-06

**Why this phase exists (rationale for the user):** Components in `src/ui/*` are already mature from Phase 1, so this week is reuse, not authoring. drei `<Html transform occlude>` is exercised in earnest, and the MDX pipeline is wired with provenance citations baked into each CTF write-up to prevent the junior-authenticity trap (Pitfall 7). The "single source of truth" architecture from Phase 1 is what makes this week tractable — the same `<ProjectCard />` rendered in the text shell renders inside a 3D monitor with no fork.

**Success Criteria** (what must be TRUE):
  1. Each monitor in the 3D scene displays real, selectable, copy-paste-able DOM content (projects, CTF write-ups, terminal greeting) via drei `<Html transform occlude="blending">`, reading from `src/content/*.ts` through the same `src/ui/*` components used by the text shell — adding a new project to `projects.ts` updates both shells automatically.
  2. A visitor clicking a monitor triggers a GSAP camera-focus animation to the monitor's preset pose, with `?focus=projects|ctfs|cv|contact` deep-linking working in both shells (text shell scrolls to anchor, 3D shell animates camera) — and `prefers-reduced-motion: reduce` replaces lerped camera moves with instant cuts or short opacity fades.
  3. The main monitor plays an animated `whoami` terminal greeting that is constrained (not a fake REPL accepting input it can't handle), holds long enough to read, and skips to its final state when reduced-motion is set.
  4. 2-3 MDX-rendered CTF/lab write-ups exist in `src/content/ctf-writeups/`, are reachable from both shells, and each cites platform + date + sources/walkthroughs consulted (provenance rule from Pitfall 7).
  5. Every tool listed in `skills.ts` has at least one project or write-up on the same site demonstrating it (provenance rule from CNT-03), enforced by a manual audit before phase completion.

**Plans:** 7 plans

Plans:
- [x] 03-01-PLAN.md — MDX pipeline + 9 deps + vite.config @mdx-js/rollup with enforce:'pre' (CNT-02 foundation)
- [x] 03-02-PLAN.md — Monitor refactor (children) + MonitorOverlay (drei Html transform occlude="blending") + cameraPoses + Workstation overlay mount (3D-05)
- [x] 03-03-PLAN.md — FocusController (GSAP useGSAP single-timeline) + Controls forwardRef + ThreeDShell focused state + Canvas onPointerMissed + Header bracket → setQueryParams in 3D shell (3D-06)
- [x] 03-04-PLAN.md — WhoamiGreeting animated typing (3 prompts, useState+setTimeout chain, reduced-motion gate) + identity.status field + sticky-top CenterMonitorContent (3D-07)
- [x] 03-05-PLAN.md — MDX components (CodeBlock + ScreenshotFrame + ProvenanceFooter) + MDXRenderer full components map + WriteupList/View/Monitor + writeups barrel + ATT&CK lookup + lazy WriteupsRoute (Pattern 7 Option A) (CNT-02 + 3D-05)
- [ ] 03-06-PLAN.md — Author 3 collaborative MDX write-ups (Detection, CTI, Web Auth) — 3 human-verify checkpoints with OPSEC review (CNT-02 + CNT-03)
- [x] 03-07-PLAN.md — D-20 close-out (real CV/OG/identity/projects/skills/certs/education/bio) + scripts/check-parity.mjs + CI gate + OPSEC checklist Phase 3 extension + final live-deploy sweep (CNT-03 + TXT-06)

**UI hint**: yes

### Phase 4: Real Asset, Postprocessing, Polish, Pre-Launch QA

**Goal:** The placeholder workstation is replaced with a real Draco-compressed GLB (≤2 MB), postprocessing (Bloom + Scanline + ChromaticAberration + low Noise) is gated by `<PerformanceMonitor>`, the Web3Forms contact form is verified end-to-end into Gmail and Outlook, and the pre-launch checklist (≈25 items: Lighthouse, real-device QA, OPSEC audit, dev-helper strip, peer review) is executed.

**Depends on:** Phase 3

**Requirements:** 3D-08, CTC-01, CTC-03, OPS-03, OPS-04, OPS-05

**Why this phase exists (rationale for the user):** Polish work is obvious technically but absorbs unbounded time. Quarantining it to Week 4 forces shipment. All Week 4 work is gated by the pre-launch checklist drafted in Phase 1, which also forces the OPSEC final audit, the cyber-pro peer review (anti-cliché authenticity check), and the real-device QA pass that Pitfall 3 demands. This phase is where the project goes from "feature-complete" to "actually shipped to recruiters."

**Success Criteria** (what must be TRUE):
  1. The 3D scene loads a real Draco-compressed workstation GLB ≤2 MB with WebP textures (1024² hero / 512² props) and the postprocessing pipeline (Bloom + Scanline density 1.25 opacity 0.15 + ChromaticAberration offset 0.0008 + low Noise opacity 0.04) is enabled on `perfTier='high'`, disabled entirely on `perfTier='low'` via `<PerformanceMonitor>`, with no DOF, no SSAO, and no permanent Glitch effect.
  2. A real submission to the Web3Forms contact form (endpoint in `VITE_FORM_ENDPOINT`) lands in both a Gmail inbox AND an Outlook inbox (not spam), with TryHackMe and HackTheBox profile links surfaced near the contact / certifications section as a contact-fallback path.
  3. Lighthouse on the deployed text shell scores Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90 — with OG image (1200×630), JSON-LD `Person` schema, real `<title>`, meta description, favicon, sitemap, and robots.txt all in place.
  4. The site has been tested in-hand on one real iOS device (mid-tier model) and one real Android device (3-4 GB RAM tier) — text shell is excellent on both, 3D shell either works gracefully or is gracefully refused with the always-visible toggle to switch.
  5. The pre-launch checklist is fully executed and signed off: EXIF stripped from every image, all screenshots reviewed at full resolution for IPs/hostnames/employer leaks, no `console.log`/`<Stats>`/`<Perf>`/helpers in the production bundle (verified by `grep` + bundle inspection, gated by `import.meta.env.DEV`), `npm audit` clean, all external links carry `rel="noopener noreferrer"`, CSP `<meta>` tag present, one cyber-professional peer review and one non-cyber usability review completed.

**Plans:** 6/8 plans executed

Plans:
- [x] 04-01-PLAN.md — Postprocessing pipeline: install @react-three/postprocessing@~3.0.4 + ScenePostprocessing wrapper (PerformanceMonitor binary tier) + lazy PostFX (Bloom + Scanline + CA + Noise verified prop names) + size-limit PostFX entry + ThreeDShell mount (3D-08)
- [x] 04-02-PLAN.md — Web3Forms ContactForm: src/lib/web3forms.ts POST helper + src/ui/ContactForm.tsx (idle/submitting/sent/failed + honeypot silent abort) + tests + CSP extension in index.html + .env.example + mount in src/sections/Contact.tsx (CTC-01)
- [x] 04-03-PLAN.md — Live Profiles: extend Identity type (4 optional fields) + src/ui/LiveProfiles.tsx (LiveProfiles + LiveProfilesShortcut exports with both/single/neither variants) + tests + mount in Certs.tsx and Contact.tsx (CTC-03)
- [x] 04-04-PLAN.md — SEO surfaces: pick canonical GH-Pages host + replace public/sitemap.xml (six URLs no changefreq/priority) + reconcile index.html (canonical/og:url/og:image/twitter:image/JSON-LD url+image/title/meta description per UI-SPEC) + verify JSON-LD email omission + update robots.txt Sitemap host (OPS-05 + CTC-03 host alignment)
- [x] 04-05-PLAN.md — ContactForm + LiveProfilesShortcut mounted in 3D-shell center monitor (CenterMonitorContent.tsx extension; depends on 04-01/04-02/04-03; CTC-01 + CTC-03 single-source-of-truth)
- [x] 04-06-PLAN.md — Real GLB: CC0 Poly Haven composite (desk + lamp + bookshelf; **NO monitor.glb** — Poly Haven has no CC0 monitor model, procedural <Monitor> wrapper geometry retained) → gltfjsx --transform pipeline → public/assets/workstation/*.glb + LICENSE.txt + Workstation.tsx swap (primitive object={glb.scene}) + per-asset size-limit budgets (1000+500+500 KB; 869 KB on disk total); **7-day timebox per CONTEXT D-04 NOT triggered — shipped Path A in 14 min** (3D-08)
- [ ] 04-07-PLAN.md — Pre-launch automation: .planning/CHECKLIST-LAUNCH.md (14-item structure) + lighthouserc.json + 5 new BLOCKING CI gates in deploy.yml (dev-helper strip, target=_blank rel audit, CSP connect-src audit, JSON-LD email omission audit, npm audit) + advisory Lighthouse-CI job after deploy (OPS-03 advisory + OPS-05)
- [ ] 04-08-PLAN.md — Final ship gate (human_needed): OG image binary swap + full-resolution OPSEC review + Lighthouse manual median-of-3 + CTC-01 Gmail+Outlook delivery verification + real-device QA on iOS+Android (7-step protocol) + cyber peer review + non-cyber usability review + final OPSEC sweep (OPS-03 + OPS-04 + OPS-05 + CTC-01 sign-off)

**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 (decimal phases inserted as needed via `/gsd-insert-phase`).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation + 2D Recruiter-Grade Shell | 2/7 | In Progress | - |
| 2. 3D Shell + Asset Pipeline + Capability Gating | 3/5 | In Progress|  |
| 3. Content Integration + MDX Write-ups + Camera Choreography | 0/7 | Planned | - |
| 4. Real Asset, Postprocessing, Polish, Pre-Launch QA | 6/8 | In Progress | - |

---

*Roadmap created: 2026-05-06*
*Phase 4 plans created: 2026-05-08 (Plans 04-01 through 04-08; 4 waves; 8 plans)*
*Source: research/SUMMARY.md "Implications for Roadmap" section, refined with Pitfall-to-Phase Mapping from research/PITFALLS.md*
