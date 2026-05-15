# Milestones

## v1.0 MVP (Shipped: 2026-05-15)

**Phases completed:** 4 phases, 27 plans, 73 tasks across 150 commits over 9 days (2026-05-06 → 2026-05-15). 142 files / +36k insertions / ~5.8k LOC TS+TSX.

**Live URL:** `https://erenatalaycs.github.io/Portfolio_Website/` (tag `hs-redesign-v1`)

**Key accomplishments:**

- **Recruiter-first text shell** — Vite 8 + React 19 + TS 5.9 + Tailwind v4 SPA with terminal-styled sticky-nav text shell. Rot13+base64 email obfuscation, JSON-LD Person, baseline CSP, JetBrains Mono self-hosted, 4-gate CI. Initial bundle ≤120 KB gz.
- **Lazy-loaded 3D shell with capability gating** — `detectCapability()` (mobile UA / `deviceMemory<4` / `hardwareConcurrency≤4` / no-WebGL2 / `prefers-reduced-motion`) routes weak devices to text shell; `?view=text|3d` URL overrides. Lazy R3F chunk ≤450 KB gz budget; `webglcontextlost` swaps to text shell with retry preserving GH Pages base path.
- **Content layer + camera choreography** — Typed `src/content/*.ts` modules (identity, projects, certs, skills, education, writeups). MDX + Shiki pipeline. GSAP camera focus state machine. Animated `whoami` greeting with reduced-motion skip. Single-source-of-truth: same `src/ui/*` + `src/sections/*` components reused inside drei `<Html transform occlude>` monitors.
- **Postprocessing + contact + live profiles** — Bloom + Scanline + ChromaticAberration + Vignette gated by `<PerformanceMonitor>` (lazy 84.9 KB gz chunk). Web3Forms contact form with honeypot silent-abort + CSP allow-list. TryHackMe + HackTheBox `volvoxkill` live-profile shortcuts mounted in Certs + Contact.
- **HS-redesign late pivot** (tag `hs-redesign-v1`, commits `5b2ddb3` + `0349c88`) — Replaced the 3-monitor mapping with one ultrawide + 5-tab `MonitorTabs` (zustand store + `role=group`/`aria-pressed`), procedural desk/wall/chair decor, HS-tinted lighting, 2-pose camera. This is the actual v1.0 look.
- **CI/CD launch QA gates** (Plan 04-07) — GH Actions `configure-pages@v6` + `deploy-pages@v5`; size-limit budgets enforced (text shell ≤120 KB gz, 3D chunk ≤450 KB gz, postprocessing ≤100 KB gz). CI exit-fails on dev-helper leaks, missing `rel=noopener`, CSP regression, JSON-LD email leak, or high/critical npm advisories. Lighthouse runs advisory.

**Audit verdict:** `gaps_found` (25/32 requirements satisfied) — all gaps are by-design deferrals tracked in `STATE.md` Deferred Items and `milestones/v1.0-MILESTONE-AUDIT.md`. Zero cross-phase wiring broken; substantively a healthy "shipped + pending human pre-launch QA" state.

**Known deferred items at close:** 5 (Phase 1 verification human_needed, Plan 03-06 write-ups, Plan 04-08 human sign-off, 3D-08 GLB rolled back to procedural, CTC-01 delivery test) — see `STATE.md` Deferred Items and `milestones/v1.0-MILESTONE-AUDIT.md`.
