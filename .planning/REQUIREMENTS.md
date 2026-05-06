# Requirements: Eren Atalay — Portfolio Website

**Defined:** 2026-05-06
**Core Value:** Make a cyber recruiter or hiring manager think *"this person actually gets this field"* within seconds — without ever forcing recruiters to wait for a 3D scene before they can find the CV and contact details.

## v1 Requirements

### Foundation & Hosting

- [x] **FND-01**: Vite + React 19 + TypeScript + Tailwind v4 scaffold with pinned R3F / three / drei versions
- [x] **FND-02**: GitHub Pages deploy via GitHub Actions (`actions/deploy-pages`), `vite.config.ts` `base` set, `404.html` copy of `index.html` produced in CI
- [x] **FND-03**: Query-param routing (`?view=text|3d&focus=…`) — no React Router in v1
- [x] **FND-04**: Custom 404 page rendered in terminal style

### Content & SEO

- [ ] **CNT-01**: Typed content layer (`src/content/*.ts`) covering projects, certifications, skills, education, experience
- [ ] **CNT-02**: MDX write-up pipeline (`@mdx-js/rollup` + `rehype-pretty-code` + Shiki) and 2–3 CTF/lab write-ups authored during the build
- [ ] **CNT-03**: 3–5 cyber projects published, each with provenance (every tool listed in skills has at least one project or write-up demonstrating it)
- [x] **CNT-04**: CV PDF in repo, EXIF/metadata stripped, downloadable from both shells
- [x] **CNT-05**: SEO basics — OG tags, JSON-LD `Person` schema, real `<title>`, meta description, favicon

### Text Shell (Recruiter Path)

- [ ] **TXT-01**: `<TextShell />` ships in the initial bundle (target ≤120 KB gz), terminal-styled with WCAG-AA contrast (off-black + softened green, NOT pure black + saturated green)
- [ ] **TXT-02**: Name + "Junior Cybersecurity Analyst" + UK + CV/email/GitHub/LinkedIn rendered as plain HTML at first paint, before any R3F code executes
- [ ] **TXT-03**: All sections present in text shell — About, Education, Certifications (with honest "in progress" labels), Skills (tag list, no progress bars), Projects, Write-ups, Contact
- [x] **TXT-04**: Email obfuscation utility (`src/lib/obfuscate.ts`) — JS-decoded, no raw `mailto:` HTML
- [ ] **TXT-05**: `prefers-reduced-motion` honoured site-wide; full keyboard navigation; semantic HTML throughout
- [ ] **TXT-06**: Section-by-section content parity between text shell and 3D shell, enforced at pre-launch QA

### 3D Workstation Shell (Hiring-Manager Path)

- [ ] **3D-01**: `<ThreeDShell />` lazy-loaded via `React.lazy`, Suspense fallback shows text-shell skeleton
- [ ] **3D-02**: `detectCapability()` synchronous check — mobile UA / `deviceMemory<4` / `hardwareConcurrency≤4` / no-WebGL2 / `prefers-reduced-motion: reduce` all default to text shell; `?view=3d` overrides
- [ ] **3D-03**: View-toggle DOM overlay always visible (sibling of `<Canvas>`)
- [ ] **3D-04**: Composed scene — `<Desk />`, `<Monitor />` ×3, `<Lamp />`, `<Bookshelf />` — using procedural primitives in Week 2 and a Draco-compressed GLB (≤2 MB) in Week 4
- [ ] **3D-05**: drei `<Html transform occlude="blending">` on each monitor renders the same `src/ui/*` components used by the text shell — single source of truth
- [ ] **3D-06**: Free-look + click navigation — clamped `OrbitControls` for drag-to-look, click monitor → GSAP camera-focus animation
- [ ] **3D-07**: Animated `whoami` terminal greeting on the main monitor (constrained, not a fake REPL); skips to final state when `prefers-reduced-motion` is set
- [ ] **3D-08**: Postprocessing pipeline — Bloom + Scanline (density 1.25, opacity 0.15) + ChromaticAberration (offset 0.0008) + low Noise; gated by drei `<PerformanceMonitor>` and disabled on low-perf tier; no DOF, no SSAO, no permanent Glitch
- [ ] **3D-09**: `webglcontextlost` listener swaps gracefully to the text shell (no blank screen, no crash)

### Contact & External Links

- [ ] **CTC-01**: Web3Forms contact form (free tier, 250/mo), endpoint in `VITE_FORM_ENDPOINT`; verified end-to-end into both Gmail and Outlook (not spam) before launch
- [ ] **CTC-02**: GitHub and LinkedIn link-outs reachable from both shells in <2 seconds
- [ ] **CTC-03**: TryHackMe and HackTheBox profile links surfaced near contact / certifications

### OPSEC & Polish

- [x] **OPS-01**: Asset OPSEC pipeline — `exiftool -all=` strip step + manual full-resolution review of every screenshot; no IPs, hostnames, paths, employer info, or live CTF flags published
- [ ] **OPS-02**: `size-limit` budgets enforced in CI — text shell <120 KB gz, 3D chunk <450 KB gz, GLB <2.5 MB
- [ ] **OPS-03**: Lighthouse on text shell — Performance ≥80, Accessibility ≥90, Best Practices ≥90, SEO ≥90
- [ ] **OPS-04**: Real-device QA pass on iOS (one mid-tier model) and Android (3–4 GB RAM tier) before launch
- [ ] **OPS-05**: Pre-launch checklist executed (≈25 items: redirects, OG image, favicon, console errors, Lighthouse, dev-helper strip via `import.meta.env.DEV`, `npm audit` clean, external links `rel="noopener noreferrer"`, etc.)

## v2 Requirements

Deferred to a future release once v1 is shipped and validated.

### Aesthetic & 3D

- **V2-3D-01**: Real Blender-modelled workstation GLB (replacing v1 sourced/simpler model)
- **V2-3D-02**: Custom CRT shader on monitor surfaces (replacing v1 postprocessing-only effect)
- **V2-3D-03**: Scroll-driven camera tour as an alternative navigation mode
- **V2-3D-04**: Source-code Easter egg

### Content & Domain

- **V2-CNT-01**: Light/dark theme toggle
- **V2-CNT-02**: Multi-language support (TR / EN)
- **V2-CNT-03**: Blog with RSS for ongoing write-ups
- **V2-CNT-04**: Live TryHackMe / HackTheBox badge widgets (real-time stats, not just link-outs)
- **V2-CNT-05**: PGP key on the site (only if Eren commits to maintaining it)

### Routing & Hosting

- **V2-RTE-01**: HashRouter or BrowserRouter with per-write-up shareable URLs (trigger: write-up count grows past ~10)
- **V2-HST-01**: Custom domain (e.g. `erenatalay.dev` or similar)

### Polish

- **V2-POL-01**: Keyboard shortcut overlay (`?` opens cheat-sheet panel)
- **V2-POL-02**: Privacy-respecting analytics (e.g. Plausible) for visitor signal during job hunt

## Out of Scope

Explicit exclusions. Anti-features from research are documented here so they cannot be re-added on a whim.

| Feature | Reason |
|---------|--------|
| Matrix code rain | Cyber-portfolio cliché; signals "doesn't get the field" to technical hiring managers |
| Padlock / shield / glowing-binary motifs | Same — recruiter-side anti-pattern; better to show real tool output |
| Hooded-hacker silhouette imagery | Cliché; clashes with the credible junior framing |
| Fake "hacking in progress" GIFs | Cliché; can't be reconciled with honest junior positioning |
| Self-titling as "Ethical Hacker" or "Pentester" | Honest "Junior Cybersecurity Analyst" / "Aspiring SOC Analyst" outperforms when evidence is TryHackMe rooms |
| Skill bars / star ratings ("Python 87%", "★★★☆☆") | Recruiters and engineers explicitly mock these; tag list with provenance is the standard |
| Listing every tool ever opened ("Skills: Burp Suite" with no Burp work shown) | Provenance rule — every listed tool must have a project or write-up demonstrating it |
| Plagiarised CTF write-ups | Career-damaging in the small, well-networked cyber community |
| Fake interactive password prompt / fake terminal that doesn't accept input | Gimmicks that break on first interaction; recruiter walks away |
| Fake security dashboard with random data | Implies experience that isn't real |
| Type-out animation on every paragraph | Slows reading; honoured only on the `whoami` greeting |
| Pure black + saturated pure green text (`#000000` + `#00ff41`) | Fails WCAG AA contrast; off-black + softened green is the alternative |
| Auto-playing music | Universal anti-pattern |
| "Hire me" / newsletter pop-up modals | Annoys recruiters; reduces credibility |
| Custom cursors that hide the system cursor | Accessibility violation |
| Home address / personal phone / full DOB on the public site | Privacy; phone goes only on the downloaded CV PDF; city-only on public page |
| Backend API or server-side rendering | GitHub Pages is static-only; not a v1 constraint to fight |
| Authentication / private content | Portfolio is fully public |
| Real-time / multiplayer features in the 3D scene | It's a portfolio, not a hangout |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 1 | Complete |
| FND-02 | Phase 1 | Complete |
| FND-03 | Phase 1 | Pending |
| FND-04 | Phase 1 | Complete |
| CNT-01 | Phase 1 | Pending |
| CNT-02 | Phase 3 | Pending |
| CNT-03 | Phase 3 | Pending |
| CNT-04 | Phase 1 | Complete |
| CNT-05 | Phase 1 | Complete |
| TXT-01 | Phase 1 | Pending |
| TXT-02 | Phase 1 | Pending |
| TXT-03 | Phase 1 | Pending |
| TXT-04 | Phase 1 | Pending |
| TXT-05 | Phase 1 | Pending |
| TXT-06 | Phase 3 | Pending |
| 3D-01 | Phase 2 | Pending |
| 3D-02 | Phase 2 | Pending |
| 3D-03 | Phase 2 | Pending |
| 3D-04 | Phase 2 | Pending |
| 3D-05 | Phase 3 | Pending |
| 3D-06 | Phase 3 | Pending |
| 3D-07 | Phase 3 | Pending |
| 3D-08 | Phase 4 | Pending |
| 3D-09 | Phase 2 | Pending |
| CTC-01 | Phase 4 | Pending |
| CTC-02 | Phase 1 | Pending |
| CTC-03 | Phase 4 | Pending |
| OPS-01 | Phase 1 | Complete |
| OPS-02 | Phase 2 | Pending |
| OPS-03 | Phase 4 | Pending |
| OPS-04 | Phase 4 | Pending |
| OPS-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32 ✓
- Unmapped: 0

**Per-phase counts:**
- Phase 1 (Foundation + 2D Shell): 14 requirements
- Phase 2 (3D Shell + Asset Pipeline + Capability Gating): 6 requirements
- Phase 3 (Content Integration + MDX + Camera Choreography): 6 requirements
- Phase 4 (Real Asset, Postprocessing, Polish, Pre-Launch QA): 6 requirements

---
*Requirements defined: 2026-05-06*
*Last updated: 2026-05-06 after roadmap creation (traceability populated)*
