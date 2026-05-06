# Eren Atalay — Portfolio Website

## What This Is

A 3D "hacker workstation" portfolio site for Eren Atalay, a junior cybersecurity analyst who graduated in summer 2025 and is job-hunting in the UK. Visitors land in a dark desk-and-monitors scene rendered with a terminal/hacker aesthetic; they can drag to look around the room and click monitors to read CV, projects, CTF write-ups, certifications, skills, and education. A fast 2D fallback view exists for recruiters who skim and for low-power devices.

## Core Value

The site must make a cybersecurity recruiter or hiring manager think *"this person actually gets this field"* within seconds — without forcing recruiters to wait for a 3D scene to load before they can find the CV and contact details.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 3D hacker-workstation scene as the primary landing experience (desk, monitors, room atmosphere)
- [ ] Free-look + click navigation: drag to look around the room, click monitors to engage with content
- [ ] Animated terminal `whoami` greeting on the main monitor as the first thing the visitor sees
- [ ] Section content surfaced through the workstation: CV/resume, cyber projects, CTF/lab write-ups, certifications, skills, education, contact
- [ ] Terminal/hacker aesthetic applied consistently (monospace, dark palette, terminal motifs) across both 3D and 2D views
- [ ] Fast 2D fallback view that recruiters can opt into (or that auto-serves on slow devices) — surfaces CV summary, links, and contact in under 5 seconds
- [ ] Public-facing identity: real full name (Eren Atalay), email contact, GitHub link, LinkedIn link
- [ ] Hosted on GitHub Pages as a static build, deployed from the repo
- [ ] Responsive behaviour: usable on mobile (likely defaulting to 2D fallback) and on desktop

### Out of Scope

- Custom domain — github.io subdomain is fine for v1, can be added later without rework
- CMS / blog backend — write-ups are authored as static markdown / MDX, not edited in-browser
- Authentication or private content — entire site is public
- Server-side / API code — GitHub Pages is static-only
- Multiple languages — English-only for v1
- Real-time / multiplayer features in the 3D scene — it's a portfolio, not a hangout
- Tracking and analytics with personal data — keep it light and privacy-respecting

## Context

- **Career situation:** Eren graduated last summer, is currently in a non-cybersecurity role (QA/Test on a fintech platform), and is using this portfolio to break into a cyber analyst role specifically. The site needs to *position him as a cyber person*, not as a generalist.
- **Audience split:** "Recruiters and technical hiring managers, both equally." Recruiters want a 30-second skim; hiring managers will engage with the 3D scene and read write-ups. The 2D-fallback decision flows directly from this — we don't pick one audience, we serve both.
- **Aesthetic decision:** Terminal/hacker direction (monospace, dark, command-line motifs) was chosen over glass+neon, deep-space minimal, and cyberpunk. It's the most on-brand for cyber and the easiest to execute well without it looking like a generic SaaS landing page.
- **3D scope:** "Full 3D scene" was chosen over hero-only or accents — but framed as the hacker workstation specifically (desk + monitors + room), not free-form 3D space. The monitors give us natural surfaces to embed content without inventing UI from scratch.
- **Existing assets to incorporate:** CV/resume PDF, cyber projects (likely on GitHub), CTF/lab write-ups (some written, some to be written), certifications (earned and/or in-progress), skills, education.

## Constraints

- **Tech stack:** React + React Three Fiber (Three.js) + Tailwind CSS, building to a static bundle. R3F is the right balance: declarative 3D in React, mature ecosystem, well-documented for portfolios.
- **Hosting:** GitHub Pages — static files only, served from the repo. No server-side rendering, no APIs, no env-secret-dependent integrations at runtime.
- **Performance:** The 3D scene must load on reasonable home broadband; on slow / low-end devices, the 2D fallback should serve so the recruiter never sees a blank or janky scene.
- **Timeline:** Roughly one month to v1 ("month-ish"). Quality matters more than shipping next week, but it's not a year-long project either.
- **Maintenance:** Solo-maintained by Eren. Avoid stacks that need a dedicated team or paid services to keep alive.
- **Privacy:** Real name + email are public. Email contact should resist spam scraping (e.g., obfuscation or a contact form with a static form-handler).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 3D direction is "hacker workstation" (desk + monitors), not network graph or server-room city | Natural surfaces (monitors) for content; on-brand for cyber; easier to execute well than abstract 3D | — Pending |
| Interaction model: free-look + click | Most exploratory / impressive for technical visitors; click is still discoverable for non-3D-natives | — Pending |
| Stack: React + React Three Fiber + Tailwind | R3F is the modern standard for 3D web in React; Tailwind keeps the terminal aesthetic fast to iterate on | — Pending |
| Always ship a fast 2D fallback, not just optimise the 3D | Recruiter audience won't tolerate a slow 3D load; fallback de-risks the whole project | — Pending |
| Host on GitHub Pages, no custom domain for v1 | Free; static-only constraint forces simplicity; domain can be added later without rework | — Pending |
| Aesthetic: terminal/hacker (monospace, dark, command-line motifs) | Most on-brand for cyber; user picked it explicitly over glass/neon, deep-space, and cyberpunk variants | — Pending |
| Public info: real name + email + GitHub + LinkedIn | User explicitly opted into all four — no anonymisation needed | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-06 after initialization*
