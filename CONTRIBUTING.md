# Contributing to Portfolio_Website

This is a solo-maintained project. The notes below exist to make the cyber-portfolio
release gates explicit and easy to follow when re-running them after a content change.

## Setup

See `README.md` for the one-time GitHub Pages source toggle and local dev commands.

## Local Workflow

```bash
npm install
npm run dev          # http://localhost:5173/Portfolio_Website/
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run format:check # prettier --check
npm run test         # vitest run
npm run build        # vite build
npm run preview      # serve dist/ for smoke testing
```

## Release Gate — OPSEC Checklist

Before every release that touches:

- `public/assets/` (any file — images, PDFs, OG card)
- screenshots in any section or write-up
- the CV PDF
- identity, projects, certs, skills, education, or write-up content

…run through `.planning/CHECKLIST-OPSEC.md` end-to-end. Items tagged `[CI]` are enforced
automatically by `.github/workflows/deploy.yml` (the deploy will fail if metadata
remains in `public/assets/*`). The remaining items are manual review.

The checklist is the V8 (Data Protection) ASVS L1 control for this project. Skipping
it is the single most likely way to publish something that ends a cybersecurity job
search before it starts (`.planning/research/PITFALLS.md` Pitfall 5).

## Phase Discipline

This repo is built phase-by-phase via `/gsd-execute-phase`. Don't add features that
belong to a later phase — the milestone audit will catch it. See `.planning/ROADMAP.md`
for phase scope.
