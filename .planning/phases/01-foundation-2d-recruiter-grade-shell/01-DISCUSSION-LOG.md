# Phase 1: Foundation + 2D Recruiter-Grade Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in `01-CONTEXT.md` — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 1-Foundation + 2D Recruiter-Grade Shell
**Areas discussed:** Shell & navigation model, Aesthetic depth & typography, Content readiness, 404 + CI/deploy

---

## Shell & navigation model

### Q1: How is the text shell organised on screen?

| Option | Description | Selected |
|--------|-------------|----------|
| Single long-scroll page | One `<main>` with all sections stacked vertically; `?focus=` scrolls via `scrollIntoView`. Best for recruiter Cmd-F skim and SEO. | ✓ |
| Sectioned panels swapped by `?focus=` | One section visible at a time; remounts on focus change. More 'app-like' but worse for SEO and skim. | |
| Hybrid — sticky hero + scroll body | Hero block sticky at top; sections below scroll independently. Mid-complexity. | |

**User's choice:** Single long-scroll page.

### Q2: What sits above the fold on first paint?

| Option | Description | Selected |
|--------|-------------|----------|
| Recruiter contract block | Name + tagline + 4 plain `<a>` tags + bio sentence. No animation. | |
| Terminal-style `whoami` static block | `$ whoami` / identity / `$ links --all` / `[CV] [GitHub] [LinkedIn] [email]`. Static in Phase 1; animated `whoami` is Phase 3 / 3D-07. | ✓ |
| Recruiter block + 'currently' status line | Same as option 1 plus an availability/studying status line. | |

**User's choice:** Terminal-style `whoami` static block.
**Notes:** Locked that the four contact anchors live INLINE inside the `whoami` output as real `<a>` tags so TXT-02 first-paint requirement is satisfied without a separate hero block.

### Q3: How does the user navigate between sections?

| Option | Description | Selected |
|--------|-------------|----------|
| Sticky terminal command-list nav | `$ goto [about] [skills] [projects] [certs] [writeups] [contact]`. Each `[bracket]` is `<a href="#section">`. Sticky top. | ✓ |
| ASCII tree sidebar (desktop) + collapsed mobile menu | Left rail with ASCII tree; collapses on mobile. More structurally cyber but more code and harder on narrow screens. | |
| No persistent nav — inline section anchors only | Lightest implementation; recruiters use Cmd-F. | |

**User's choice:** Sticky terminal command-list nav.

### Q4: How does `?focus=<section>` behave?

| Option | Description | Selected |
|--------|-------------|----------|
| Smooth `scrollIntoView` to `#section`, no other side effect | `prefers-reduced-motion: reduce` → instant jump. Visible focus ring on heading. Same anchor list Phase 2's 3D shell will use as camera-focus presets. | ✓ |
| Scroll + briefly highlight the target section | 1-second pulse on a left-edge bar after scroll lands. | |
| Strict scroll-to + auto-focus first interactive element | Most accessible; some users find auto-focus jarring. | |

**User's choice:** Smooth `scrollIntoView` to `#section`, no other side effect.

### Q5: Sticky nav on mobile / narrow viewports?

| Option | Description | Selected |
|--------|-------------|----------|
| Wraps to multiple lines, stays sticky | No JS, no horizontal scroll. A real terminal wraps. | ✓ |
| Horizontal-scroll bar | Compact but recruiters may miss off-screen items. | |
| Collapses to `[menu ▾]` command | More 'app-like'; needs ARIA disclosure pattern. | |

**User's choice:** Wraps to multiple lines, stays sticky.

### Q6: Hero contact links — inline in `whoami`, or in a separate block?

| Option | Description | Selected |
|--------|-------------|----------|
| Inline inside the `whoami` output | One block satisfies first paint + recruiter contract + aesthetic. Each `[bracket]` is a real `<a>` tag. | ✓ |
| `whoami` block + separate contact-card block below it | Two blocks, small redundancy, safer for recruiters who don't read terminal output. | |
| `whoami` only; links live in the sticky nav | Tightest visual; risks pushing contact below the fold on tiny screens. | |

**User's choice:** Inline inside the `whoami` output.

---

## Aesthetic depth & typography

### Q1: How 'terminal-y' does the text shell go?

| Option | Description | Selected |
|--------|-------------|----------|
| Terminal accents over a clean reading layout | Mono font; section headings styled as prompt lines; bodies are quiet, readable. No ASCII boxes everywhere, no blinking cursor on body, no type-out animation. | ✓ |
| Full TTY mimicry | Every section in ASCII boxes; blinking cursor; ANSI-style highlights. Risks 'gimmick' read; PITFALLS.md flags fake-terminal as a junior trap. | |
| Minimal terminal styling | Mono + dark + a single `$ ./eren-atalay --view=text` line; sections are normal h2s. Safest, least distinctive. | |

**User's choice:** Terminal accents over a clean reading layout.

### Q2: Which mono font?

| Option | Description | Selected |
|--------|-------------|----------|
| JetBrains Mono | Self-hosted via `@fontsource/jetbrains-mono`. Excellent ligatures, terminal-designed. ~30 KB woff2 regular. | ✓ |
| IBM Plex Mono | Self-hosted; more 'institutional', less code-ligature-friendly. | |
| Berkeley Mono / Commit Mono / other paid | Beautiful but licensing complexity. | |
| System mono (`ui-monospace`, `SFMono-Regular`, …) | Zero font payload; loses 'this person picked a typeface' signal. | |

**User's choice:** JetBrains Mono (self-hosted via `@fontsource/jetbrains-mono`).

### Q3: Terminal palette HEX values?

| Option | Description | Selected |
|--------|-------------|----------|
| Off-black + dim green + soft amber | bg `#0B0F0E`, body `#B8C7B8` (~9.6:1), link `#6FCF97`, warn `#E0B070`. Mature, AA+++. | |
| Off-black + cooler cyan-tinted text + green accent | bg `#0B0F12`, body `#B8C5CC`, accent `#6FCF97`, warn `#E0B070`. Less 'monitor green'. | |
| You decide — define principle in CONTEXT.md | Lock the principle (off-black + softened green/amber, AA+ everywhere); planner picks exact tokens. | ✓ |

**User's choice:** You decide — defined as Claude/planner discretion in CONTEXT.md.
**Notes:** Pinned principle: off-black bg + softened-green body + softened amber for warnings. Every body-text and accent contrast pair must pass WCAG AA against the bg. Encode as Tailwind v4 `@theme` tokens. Pure `#000000` + `#00ff41` is forbidden (REQUIREMENTS.md "Out of Scope").

### Q4: How are content lists rendered?

| Option | Description | Selected |
|--------|-------------|----------|
| `$ ls`-style with bracketed tags | Skills `[python] [bash] …`; Projects `$ ls projects/` then row entries; Certs `[✓]` / `[ ] — in progress, target …`. | ✓ |
| Cards/blocks with mono headers | Each project is a bordered block; skills as a tag cloud. Reads faster, less cyber-native. | |
| Hybrid — prompt-led headings, plain prose bodies | Section headings are `$ cat` style; bodies are normal h3 + paragraph. Cleanest reading experience. | |

**User's choice:** `$ ls`-style with bracketed tags.

---

## Content readiness for Phase 1

### Q1: Phase 1's content-depth target?

| Option | Description | Selected |
|--------|-------------|----------|
| Real for what's ready, lean-but-real for Projects, stub for Write-ups | Real now: About, Education, Skills, Certs, CV, links. Lean-but-real: Projects (1-2 real + 1 in-progress stub). Stub: Write-ups (placeholder; real in Phase 3). | ✓ |
| Real content for everything, full depth | Postpones nothing to Phase 3 except the MDX pipeline. Risks burning Phase 1 time on content authoring. | |
| Scaffold + 'coming soon' placeholders everywhere except CV/links/identity | Lightest Phase 1 lift; risks recruiter seeing a half-built site. | |

**User's choice:** Real for what's ready, lean-but-real for Projects, stub for Write-ups.

### Q2: Where does the content text come from?

| Option | Description | Selected |
|--------|-------------|----------|
| User provides during/after planning | Phase 1 ships schema + rendering; Eren provides the actual text into `src/content/*.ts`. | ✓ |
| Claude drafts from PROJECT.md + stated background; user edits | Fast; risks fabricated specifics. | |
| Ship with TODO markers; content-fill is Phase 1.x | Cleanest separation; ships half-empty temporarily. | |

**User's choice:** User provides content during/after planning.

### Q3: What content is ready right now? (multi-select)

| Option | Selected |
|--------|----------|
| CV PDF | ✓ |
| Real GitHub + LinkedIn URLs + email | ✓ |
| Real cert names with statuses (earned / studying / planned) | ✓ |
| 3+ real cyber project descriptions with GitHub links | |

**User's selection:** CV PDF, GitHub/LinkedIn/email, real cert names with statuses.
**Notes:** Project descriptions are NOT yet ready — drives Q4 below.

### Q4: What does the Projects section render in Phase 1, given the gap?

| Option | Description | Selected |
|--------|-------------|----------|
| Real projects you have + a single honest 'in progress' stub | If 1-2 real GitHub repos are presentable, list those + one '[ ] home-lab — write-up planned' stub. Phase 3 expands to 3-5 with provenance. | ✓ |
| Single block: 'Currently building — see GitHub for live commits' + GitHub link | No project list at all; section just points to GitHub. Honest but weak for a recruiter who doesn't click through. | |
| Skip Projects section in Phase 1 entirely (deviation from TXT-03) | Wait for Phase 3 to ship Projects at full quality. Requires explicit acknowledgement of the deferral. | |

**User's choice:** Real projects you have + a single honest 'in progress' stub.

---

## 404 + CI/deploy

### Q1: Terminal-style 404 page voice?

| Option | Description | Selected |
|--------|-------------|----------|
| Shell-not-found voice with sitemap fallback | `bash: cd: <path>: No such file or directory` + `$ goto [about] [skills] …` sitemap fallback + `[home]` link. Reuses the section-list const. | ✓ |
| Single-line cyber-themed 404 + home link | 'access denied: 404' / 'page not found — the firewall says no'. Atmospheric, less navigable. | |
| GH Pages default 404 | Cheapest; clashes with aesthetic. Rejected by FND-04 anyway. | |

**User's choice:** Shell-not-found voice with sitemap fallback.

### Q2: When does GitHub Actions deploy?

| Option | Description | Selected |
|--------|-------------|----------|
| Every push to `main` | Workflow on push to main: install → build → cp `index.html`→`404.html` → `actions/deploy-pages`. Also `workflow_dispatch` for manual re-deploy. | ✓ |
| PR-driven only — branch protection on main | Self-review for solo. PR description acts as deploy log. | |
| Manual `workflow_dispatch` only | Maximum control; loses 'push and forget'. | |

**User's choice:** Every push to `main` (also triggerable via `workflow_dispatch`).

### Q3: Which CI gates ship in Phase 1? (multi-select)

| Option | Selected |
|--------|----------|
| TypeScript typecheck (`tsc --noEmit`) | ✓ |
| ESLint (`eslint .`) | ✓ |
| Prettier `--check` formatting | ✓ |
| `size-limit` budget check | |

**User's selection:** typecheck + lint + format.
**Notes:** `size-limit` deferred to Phase 2 per OPS-02 mapping.

### Q4: OPSEC pipeline scope and automation level (OPS-01)?

| Option | Description | Selected |
|--------|-------------|----------|
| Markdown checklist + one CI job that runs `exiftool` on `/public/assets/*` | ~25-item checklist + automated metadata gate. Manual review steps stay manual; metadata gate is automated. | ✓ |
| Markdown checklist only — all manual | Lightest; relies on discipline. | |
| Full automation — grep for IPs/hostnames/employer terms + redaction validator | Higher upfront cost; manual review remains the load-bearing step anyway. | |

**User's choice:** Markdown checklist + one CI job that runs `exiftool` on `/public/assets/*`.

### Q5: Preview / staging strategy?

| Option | Description | Selected |
|--------|-------------|----------|
| No preview env — push-to-main lands live | v1 has no users yet; deployed site IS staging. | ✓ |
| PR preview deploys via Netlify Drop or similar | Costs an extra service; GH Pages doesn't natively do per-PR preview. | |
| Build-only PR check (no deploy preview) | PRs run install + build + typecheck + lint; only main deploys. Reasonable middle ground. | |

**User's choice:** No preview env — push-to-main lands live.

---

## Claude's Discretion

User explicitly delegated these to the planner / executor (D-09 + closing summary):

- Exact HEX values for the terminal palette (off-black, softened green, softened amber); must pass WCAG AA on every body-text and accent pair against bg. Encode as Tailwind v4 `@theme` tokens.
- Body text max-width / line-length (~70-80 ch is the standard for monospace).
- Font weights and line-heights (regular + medium is enough; line-height ≥ 1.5 for body).
- Repo top-level layout under `src/` — strong default is `.planning/research/SUMMARY.md` and `.planning/research/ARCHITECTURE.md` (`src/app/`, `src/shell/`, `src/sections/`, `src/ui/`, `src/content/`, `src/lib/`, `src/styles/`).
- About paragraph length (1 short or 2-3 short paragraphs; honest junior cyber voice; no clichés).
- Cursor-block visual: static `█` glyph after the hero `whoami` line; if animated at all, ONLY on the hero cursor and gated by `prefers-reduced-motion`.
- JSON-LD `Person` schema fields (CNT-05) — name, jobTitle, url, sameAs (GitHub + LinkedIn), email (obfuscated), image, homeLocation; fill from `src/content/identity.ts`.
- Email obfuscation algorithm in `src/lib/obfuscate.ts` (TXT-04) — JS-decoded, not raw `mailto:`. Pick a simple reversible encoding (rot13 / base64 / char-array reassembly) and document the choice in the file's comment. Fall back to a "click to reveal" button rather than the raw address.

## Deferred Ideas

No new deferred ideas surfaced during discussion (the user redirected nothing). Items not in Phase 1 are already mapped in REQUIREMENTS.md / ROADMAP.md to Phase 2 / 3 / 4 or v2; the comprehensive list is in `01-CONTEXT.md` `<deferred>` section.
