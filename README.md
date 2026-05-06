# Portfolio Website

Eren Atalay — Junior Cybersecurity Analyst (UK).
Static site, deployed to GitHub Pages: <https://erenatalaycs.github.io/Portfolio_Website/>.

Phase 1 (this commit set) ships the 2D recruiter-grade text shell. The 3D
workstation lands in Phase 2 (planned).

---

## Prerequisites

- **Node.js** ≥ 22.12.0 (Vite 8 requirement; verified by `package.json` `engines`).
- **npm** (bundled with Node).

## Local dev

```bash
npm install
npm run dev          # http://localhost:5173/Portfolio_Website/
npm run build        # produces dist/
npm run preview      # serves dist/ at the production base path locally
```

Other scripts:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint .
npm run format:check # prettier --check .
npm run format       # prettier --write .
npm test             # vitest run (utility tests only)
npm run encode-email # encode plaintext email → rot13+base64 string for src/content/identity.ts
```

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which:

1. Runs the CI gates (`tsc --noEmit`, `eslint`, `prettier --check`, `vitest`).
2. Strips EXIF/metadata from every file in `public/assets/` and verifies none remains
   (build fails if any non-allowlisted tag is left).
3. Builds the production bundle (`npm run build` → `dist/`).
4. Copies `dist/index.html` → `dist/404.html` so GitHub Pages deep links resolve.
5. Uploads `dist/` as a Pages artifact and deploys via `actions/deploy-pages@v5`.

Manual deploy: `Actions → Deploy to GitHub Pages → Run workflow` (uses `workflow_dispatch`).

## First-deploy setup (ONE TIME, manual)

GitHub Actions cannot enable Pages for the first time — that is a security
boundary. Before the first push to `main`:

1. Open the repo on GitHub.
2. Go to **Settings → Pages**.
3. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch").
4. Save. There is no further configuration; the workflow will own deploys from now on.

Symptom if skipped: `actions/deploy-pages` fails with `Get Pages site failed`
or `Pages site is not enabled for this repository`. Fix is to flip the toggle
above and re-run the workflow.

## OPSEC

- The CV PDF, OG image, and any future `public/assets/*` files have all writable
  EXIF/XMP/GPS/Author/CreatorTool tags stripped by CI before upload.
- Manual review checklist for screenshots, source bundle, external links, and
  personal info: `.planning/CHECKLIST-OPSEC.md` (added in Plan 07).

## Tech stack (Phase 1)

React 19 · Vite 8 · TypeScript 5.9 · Tailwind CSS v4 · ESLint 9 (flat config) ·
Prettier 3 · Vitest 3 · self-hosted JetBrains Mono via `@fontsource`.

No 3D in Phase 1. R3F + drei + postprocessing land in Phase 2.

## Project status

See [`.planning/ROADMAP.md`](./.planning/ROADMAP.md) and
[`.planning/STATE.md`](./.planning/STATE.md) for current position.
