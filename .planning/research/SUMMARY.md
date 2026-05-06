# Project Research Summary

**Project:** Eren Atalay — Portfolio Website (3D hacker workstation)
**Domain:** Junior cybersecurity analyst portfolio for the UK job market — 3D immersive scene + fast 2D recruiter path, static-deployed to GitHub Pages, solo-built in ~1 month
**Researched:** 2026-05-06
**Confidence:** HIGH overall

## Executive Summary

This is a *content-led cybersecurity portfolio dressed in a 3D hacker-workstation*, not a 3D-tech demo with a CV bolted on. Eren is a summer-2025 graduate currently in a non-cyber QA role trying to break into a junior cyber analyst seat in the UK. The audience splits 50/50: recruiters who skim for name/role/CV/contact in under 30 seconds, and technical hiring managers who will explore write-ups and home-lab evidence. Every load-bearing decision below flows from that dual-audience reality — the 3D scene must impress hiring managers without ever being able to gate a recruiter from finding the CV.

The recommended approach is a **single-repo, single-build Vite + React 19 + R3F v9 SPA** that mounts one of two shells at the App boundary based on `?view=` and a synchronous capability check. The text shell ships in the initial bundle (~80 KB gz) so the recruiter contract is unconditional; the 3D shell is `React.lazy`-loaded and reuses the same content + UI components via drei `<Html transform occlude>` projected onto monitor screens. Routing is **query params + a `404.html` copy of `index.html`** — no React Router, no HashRouter — because the "pages" are monitors in one scene, not separate documents. Content is typed `.ts` data plus MDX for long-form CTF write-ups; both shells render the same data through shared `ui/*` components, so they cannot drift. Deployment is GitHub Actions → `actions/deploy-pages`.

The four risks that most plausibly sink the project: (1) the recruiter cannot reach the CV without loading 3D — fix by making CV/contact links plain HTML in the document at first paint, and by building the 2D shell first; (2) the 3D scene crashes on a mid-tier mobile or fails for a `prefers-reduced-motion` user — fix by capability-gating the default view and treating the 2D shell as the accessibility story; (3) OPSEC slips (EXIF, home-lab IPs, live CTF flags, employer/NDA leaks) — uniquely damaging for a *cyber* candidate; (4) junior-authenticity traps (Matrix rain, skill bars, padded tool lists, plagiarised write-ups) — actively lower credibility with the exact audience being targeted.

## Key Findings

### Recommended Stack

**Vite 8 + React 19 + TypeScript 5.9** baseline (TS 5.9, *not* 6 — R3F/drei type defs lag); 3D layer is **R3F 9.6 + Three.js 0.184 + drei 10.7 + @react-three/postprocessing 3**, with versions pinned (`~`, not `^`). Tailwind CSS v4 via `@tailwindcss/vite` is zero-config and serves both 3D HUD and 2D shell. MDX through `@mdx-js/rollup` (official path, not `vite-plugin-mdx`) with `rehype-pretty-code` + Shiki. Animation tooling split: `useFrame` + `@react-spring/three` inside Canvas, `motion/react` for 2D UI, GSAP only for boot-up + camera choreography. Contact form is **Web3Forms** (250 free/month, no backend). Asset pipeline is **`gltfjsx --transform`** at author time only.

**Core technologies:**
- **Vite 8 + React 19 + TypeScript 5.9** — fast dev, static build, zero SSR baggage
- **R3F 9.6 + Three.js 0.184 + drei 10.7** — declarative 3D; drei is non-optional (`<Html transform occlude>`, OrbitControls, useGLTF)
- **@react-three/postprocessing 3** — Bloom + Scanline + ChromaticAberration + Noise (avoid Glitch/DOF/SSAO permanent loop)
- **Tailwind CSS v4** via `@tailwindcss/vite` — terminal palette tokens in `@theme`
- **MDX (`@mdx-js/rollup`) + rehype-pretty-code + Shiki** — build-time syntax highlighting, zero runtime cost
- **motion/react** + **GSAP** — 2D UI animation, 3D timeline choreography
- **Web3Forms** — static-friendly contact form
- **GitHub Actions (`actions/deploy-pages`)** — clean CI deploy
- **`gltfjsx --transform` + `@gltf-transform/cli`** — once-per-asset CLI optimization, target <2 MB total GLB

**Explicitly do NOT use:** `@react-three/a11y` (last release May 2022, dead), `framer-motion` (legacy name; use `motion`), CRA, Next.js, `vite-plugin-mdx` (third-party), Prism.js, Tailwind v3, `mailto:` in raw HTML, custom shaders in v1.

### The 2D Fallback Is the Spine of the Project

The 2D shell is **not** an accessibility consolation prize — it *is* the recruiter view, the accessibility story, the SEO surface, and the mobile experience. Build it first (Phase 1), styled with the same terminal aesthetic as the 3D scene, containing every section the 3D scene contains. There is exactly **one source of truth for content** (`src/content/*.ts` + MDX), and exactly **one set of UI components** (`src/ui/*`). The 3D scene wraps those components in drei `<Html transform occlude>` projected onto monitor screens; the 2D shell renders them in a normal column. The text shell ships in the initial bundle; the 3D shell is `React.lazy`-loaded so recruiters never pay for Three.js they will not see.

### Expected Features

**Must have (table stakes):**
- Name + "Junior Cybersecurity Analyst" + UK location above the fold, plain HTML at first paint
- CV PDF download as plain `<a href>` (`Eren-Atalay-CV.pdf`)
- Obfuscated email (JS-decoded), GitHub link, LinkedIn link — reachable in <2s
- About / education / certifications (honest "in progress" labels) / skills as tag list (no skill bars)
- 3-5 projects with title/tools/what-was-done/link
- 2-3 CTF or lab write-ups (MDX, with screenshots, MITRE ATT&CK / NIST mapping where genuine)
- TryHackMe + HackTheBox profile links
- `prefers-reduced-motion` honoured site-wide; keyboard-navigable; semantic HTML
- OpenGraph card + JSON-LD `Person` schema + real `<title>` + favicon
- Custom 404 page in terminal style

**Should have (differentiators):**
- 3D hacker-workstation scene (defining feature, but only with 2D escape hatch)
- Animated `whoami` terminal greeting (constrained, not a fake REPL)
- Per-monitor "apps" — each monitor *is* a content surface
- Real artifact-rich write-ups (Wireshark/Splunk/Nmap/Burp screenshots, sanitised, watermarked "Home Lab — Synthetic Data")
- Home-lab architecture diagram (Mermaid is fine)
- Honest "currently learning / next cert" section
- Web3Forms contact form (paired with obfuscated email as fallback)

**Defer to v1.x or v2:** Custom domain, light/dark theme toggle, multi-language, analytics, blog with RSS, keyboard shortcut overlay, source-code Easter egg, PGP key, live HTB/THM badge widgets, full Blender-modelled workstation, custom CRT shader, scroll-driven camera tour, BrowserRouter for clean URLs.

**Anti-features (do NOT build):**
- Matrix code rain, padlock/shield/binary motifs, hooded-hacker silhouettes, fake "hacking in progress" GIFs
- Self-titling as "Ethical Hacker" or "Pentester" when evidence is TryHackMe rooms
- Skill bars / star ratings ("Python 87%", "★★★☆☆")
- Fake interactive password prompt; fake terminal that doesn't accept input; fake security dashboard with random data
- Type-out animation on every paragraph
- Pure black + saturated pure green text (fails WCAG AA)
- Listing every TryHackMe room ever; padded skills lists
- Home address, personal phone, full DOB on the public site
- Auto-playing music, "Hire me" pop-up modals, custom cursors that hide system cursor
- Any screenshot with un-redacted IPs, hostnames, employer data, or live CTF flags

### Architecture Approach

**Single SPA, two shells, query-param routing, content-as-data.** `<App />` reads `?view=` and runs a one-shot capability check (`detectCapability()`: WebGL2? `deviceMemory < 4`? `hardwareConcurrency < 4`? mobile UA? `prefers-reduced-motion`?), then mounts exactly one of `<TextShell />` (eager) or `<ThreeDShell />` (`React.lazy`). Both shells import from `src/content/*.ts` (typed data + MDX) and render through shared `src/ui/*` components. The 3D scene is composed (one file per element: `Desk`, `Monitor`, `Lamp`, `Bookshelf`), reading from one consolidated Draco-compressed `workstation.glb` (target <2 MB). Monitor screens use **drei `<Html transform occlude="blending">`** so content remains real, selectable, copy-paste-able DOM with full Tailwind styling. Deep links: `?view=text|3d&focus=projects|ctfs|cv|contact`.

**Major components:**
1. `<App />` — synchronous shell selector, ~50 LOC, no R3F dependency
2. `<TextShell />` — eager, semantic HTML CV; first paint <800ms
3. `<ThreeDShell />` — lazy, hosts `<Canvas>`, drei `<Loader>`, scene overlay (sibling DOM)
4. `src/scene/*` — composed: `<Workstation />`, `<Desk />`, `<Monitor />` ×3, `<Lamp />`, `<Bookshelf />`, `<Camera />`, `<Controls />`, `<MonitorScreen />`
5. `src/ui/*` — shared between shells (`<TerminalPrompt />`, `<ProjectCard />`, `<CTFCard />`, `<ContactBlock />`, `<ViewToggle />`)
6. `src/content/*` — typed TS data + `ctf-writeups/*.mdx`
7. `src/lib/device.ts` — capability detection, ~30 LOC
8. `public/assets/` — `models/workstation.glb`, `textures/*.webp`, `cv.pdf`, `og-image.png`
9. `.github/workflows/deploy.yml` — checkout → install → build → `cp dist/index.html dist/404.html` → `actions/deploy-pages`

### Critical Pitfalls (Surfaced Next to Their Decisions)

1. **Recruiter cannot find CV without loading 3D.** Highest-impact failure mode. *Prevention:* CV link, obfuscated email, GitHub, LinkedIn must be plain `<a>` tags in the document at first paint, before any R3F code runs. Text shell ships in the initial bundle. `?view=text` always serves the 2D shell. Verify on throttled "Slow 4G."

2. **3D crashes on mid-tier mobile / iOS Safari context-loss / no fallback for `prefers-reduced-motion`.** *Prevention:* Default mobile + `deviceMemory < 4` + `hardwareConcurrency <= 4` + missing-WebGL2 + `prefers-reduced-motion: reduce` to text shell. `<Canvas dpr={[1, 1.5]} />`. Listen for `webglcontextlost` and swap to text shell on fire. Test on real iOS + real Android.

3. **2D fallback ships as second-class citizen.** *Prevention:* Content-as-data architecture from day one. Both shells are views over `src/content/*`. Build text shell first; build 3D scene over it. Pre-launch checklist enforces section-by-section parity.

4. **OPSEC slips — EXIF/IPs/flags/employer leaks.** Uniquely damaging for a cyber candidate. *Prevention:* Asset-pipeline checklist: `exiftool -all=`; manual full-resolution review for IPs/hostnames/tab-titles/file-paths; CTF write-ups only after the box retires; flags redacted with black-box overlay (never blur — reversible); CV PDF metadata stripped + verified; city-only on public CV.

5. **Cyber-portfolio clichés + junior-authenticity traps.** *Prevention:* Anti-cliché list at Phase 1; every tool listed in skills must have a project/write-up demonstrating it (provenance rule); every CTF write-up cites platform + date + sources consulted (including walkthroughs/hints); peer review by one real cyber professional before launch.

Secondary technical pitfalls absorbed by the chosen architecture: `setState` in `useFrame` (refs only — codify as ESLint or grep rule); GLB oversize (gltf-transform pipeline + 1024² hero / 512² prop caps + `size-limit`); GH Pages base-path / SPA-404 (Vite `base` + `cp dist/index.html dist/404.html`); `<Html>` z-fighting + click-through (deliberate `transform occlude="blending"` + `e.stopPropagation()`); debug helpers in production (`import.meta.env.DEV` gate); contact form failure (Web3Forms paired with obfuscated email + LinkedIn).

## Reconciled Disagreements

### Routing: query params + `404.html` copy (NOT React Router)

STACK.md recommends HashRouter; ARCHITECTURE.md recommends no router — query params + `public/404.html` as a copy of `index.html`. **Architecture recommendation wins for v1.**

Reasoning:
- Tiny routing surface — at most ~6 destinations: text shell, 3D shell, 4 monitor focuses. `?view=3d&focus=projects` covers all of it.
- The "pages" are monitors in one scene, not separate documents. No semantic gain from path-based URLs because there is exactly one HTML document either way.
- HashRouter URLs (`/#/projects/foo`) are aesthetically poor and offer zero SEO benefit on a single-document site.
- `cp dist/index.html dist/404.html` in the GitHub Actions workflow is a single-line solution.
- HashRouter remains a clean v2 escape hatch.

**Revisit-trigger for v2:** if write-up count grows past ~10 and per-write-up shareable URLs become valuable, promote MDX write-ups to first-class routes via React Router 7 declarative mode + HashRouter. This is a code change, not an architecture change.

### 2D fallback: build it FIRST, parity is mandatory

FEATURES.md (P1), ARCHITECTURE.md (structurally), PITFALLS.md ("build 2D first") all say the same thing. **Unified directive:** Text shell is built first (Phase 1) as the actual content layout — fully terminal-styled, every section present, recruiter-grade. The 3D scene (Phase 2-3) is built *over it*, reusing `src/content/*` and `src/ui/*` so the two views cannot drift. Pre-launch verification requires section-by-section content parity.

## Implications for Roadmap

The build order is constrained by one principle: **something demoable and recruiter-grade must be live by the end of Week 1.** The 3D scene has the most unknowns and gets the middle weeks; polish absorbs unbounded time and is quarantined to Week 4.

### Phase 1 — Foundation + 2D Recruiter-Grade Shell (Week 1)

**Rationale:** The recruiter contract (CV + contact + GitHub + LinkedIn in <2s) must be unconditionally satisfied before any 3D code is written. Locks in the deploy pipeline early so GH-Pages quirks surface with placeholder content, not Week 4 with finished content.

**Delivers:**
- Vite 8 + React 19 + TS 5.9 + Tailwind v4 scaffolded; pinned `~` versions for the R3F/three/drei trio.
- `src/content/*.ts` populated with real CV data; `ctf-writeups/` MDX directory created.
- Fully functional `<TextShell />` — terminal-styled, every section, plain `<a>` tags for CV/email/GitHub/LinkedIn at first paint, custom 404, OG tags, JSON-LD `Person` schema, favicon, real `<title>`.
- Email obfuscation utility (`src/lib/obfuscate.ts`).
- Reduced-motion hook stub; contrast-safe terminal palette decided (off-black `#0a0e0a` + softened green `#7ee787`, NOT pure black + saturated `#00ff41`).
- GitHub Actions deploy workflow live; site at `eren-atalay.github.io/Portfolio_Website/`; `vite.config.ts` `base: '/Portfolio_Website/'`; `404.html` copy in workflow; `.gitignore` excludes `dist/`.
- OPSEC asset pipeline: `exiftool` strip step documented; CV PDF metadata-stripped + verified; pre-publish checklist drafted.

### Phase 2 — 3D Shell + Asset Pipeline + Capability Gating (Week 2)

**Rationale:** Validates the entire 3D pipeline (lazy load, asset fetch, capability gating, performance budgets) with a placeholder scene before pouring content into it.

**Delivers:**
- `<ThreeDShell />` lazy-loaded via `React.lazy`; Suspense fallback is `<TextShell />` skeleton.
- `detectCapability()` defaulting mobile / low-memory / no-WebGL2 / `prefers-reduced-motion` users to text shell; `?view=` overrides; always-visible toggle.
- Placeholder workstation: procedural primitives + emissive screens. drei `<Loader>` (terminal-styled progress).
- Clamped OrbitControls (rotate-only on mobile or `touch-action: pan-y`); camera focus animation skeleton.
- gltfjsx + `@gltf-transform/cli` documented; WebP + Draco + KTX2 with Draco-only + WebP fallback path.
- `webglcontextlost` listener swaps to text shell.
- `<Canvas dpr={[1, 1.5]} />`, `frameloop="demand"` where appropriate.
- View-toggle DOM overlay (sibling of Canvas).
- `size-limit`: text shell <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB.

### Phase 3 — Content Integration + MDX Write-ups + Camera Choreography (Week 3)

**Rationale:** Components in `src/ui/*` are already mature from Phase 1, so this week is reuse, not authoring. drei `<Html transform occlude>` is exercised in earnest.

**Delivers:**
- drei `<Html transform occlude="blending">` bindings on each monitor reading from `src/content/*` via shared `src/ui/*`.
- Animated `whoami` terminal greeting on main monitor (constrained, not fake REPL); freezes long enough to read; respects reduced-motion.
- Per-monitor click → camera focus animation (GSAP timeline) → optional "fullscreen" CSS class on focused `<Html>`.
- Deep-link support: `?focus=projects` opens 3D shell with camera animating; `?view=text&focus=projects` scrolls to `#projects`.
- MDX-rendered CTF write-ups (P1 2-3 write-ups) reachable both inside 3D scene's write-ups monitor AND in text shell.
- Reduced-motion handling for camera moves (instant cuts or short opacity fades).
- Keyboard navigation: arrow keys cycle monitor focus; Enter activates; Escape returns to wide view; `?` cheat-sheet panel.
- `e.stopPropagation()` on `<Html>` chrome click handlers.

### Phase 4 — Real Asset, Postprocessing, Polish, Pre-Launch QA (Week 4)

**Rationale:** Polish work is obvious technically but absorbs unbounded time. Quarantining to Week 4 forces shipment. All Week 4 work is gated by the pre-launch checklist.

**Delivers:**
- Real workstation GLB (Blender-modelled or sourced + customised, passed through `gltfjsx --transform`). Target <2 MB.
- Lighting: emissive monitors + lamp + rim light. drei `<Environment preset="night">` (no large HDRI fetch).
- Postprocessing: Bloom + Scanline (density 1.25, opacity 0.15) + ChromaticAberration (offset 0.0008) + low Noise (opacity 0.04). `Glitch` only on boot-up sequence (one-shot). NO DOF, NO SSAO, NO permanent Glitch. Disabled entirely on `perfTier='low'` via drei `<PerformanceMonitor>`.
- Web3Forms contact form wired (endpoint in `VITE_FORM_ENDPOINT`, public); paired with obfuscated email + LinkedIn DM as fallback. End-to-end test: real submission → confirm Gmail + Outlook inbox (not spam).
- TryHackMe + HTB profile links in contact / certs section.
- Mobile pass on real iOS + real Android.
- SEO completeness: meta description, OG image (1200×630), JSON-LD `Person`, sitemap, robots.txt.
- Final size pass: hit budgets, Lighthouse on text shell (Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90).
- Pre-launch checklist (23-item "Looks Done But Isn't" list) executed; OPSEC final audit.
- Strip all dev helpers via `import.meta.env.DEV` gate; verify with `grep` + bundle inspection.
- One peer review by cyber professional + one usability review by non-cyber person.
- CSP `<meta>` tag (baseline); `npm audit` clean; external links `rel="noopener noreferrer"`.

### Phase Ordering Rationale

- **Recruiter contract first.** End-of-Week-1 must be live and shippable. If anything goes wrong in Weeks 2-4, Eren still has a recruiter-grade portfolio.
- **Validate the scary pipeline before pouring content into it.** Week 2's placeholder 3D scene exists to surface R3F + GH Pages quirks while the cost is throwaway primitive geometry.
- **Reuse, don't re-author.** Week 3's content integration only works because Week 1 already built `src/content/*` and `src/ui/*`.
- **Quarantine polish.** Week 4 work is unbounded otherwise. By gating it explicitly behind the pre-launch checklist, polish becomes a finite list.
- **OPSEC + anti-cliché are rules, not phases.** Set in Week 1, enforced at every content touch through Week 4.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Versions verified live against npm registry 2026-05-06; pairing rules verified in R3F + drei docs. |
| Features | **HIGH** | Multiple converging cyber-portfolio sources; live junior portfolios surveyed; UK-market grounding. |
| Architecture | **HIGH** | Component boundaries, data flow, deploy approach map to standard R3F + GH Pages patterns. |
| Pitfalls | **HIGH** | Technical pitfalls cite official docs; OPSEC + cliché traps MEDIUM but consistent across sources. |

**Overall confidence:** HIGH

### Gaps to Address

- **Real-device QA matrix.** "Mid-tier mobile" is intentionally vague — Phase 2 must commit to specific test devices (e.g., iPhone 12 / iOS 17, Android in 3-4 GB RAM range, M1 iPad).
- **Whether to ship a custom CRT shader.** Decision: pure postprocessing recipe in Phase 4 first; only fall back to shader-on-mesh if postprocessing fails the perf budget.
- **Workstation GLB authoring path.** Roadmap recommends procedural for v1 budget; if Eren has Blender skill or finds a CC0 model, swap in via gltfjsx. Week-4 fork point.
- **Source maps in production.** Default Vite ships them. Decision: turn off `build.sourcemap` for production builds. Flag for Phase 1.
- **Reduced-motion and the `whoami` greeting.** Skip-to-final-state if reduced-motion is set; do NOT skip the greeting entirely (it's content). Codify in Phase 1.

---

*Research completed: 2026-05-06*
*Ready for roadmap: yes*
