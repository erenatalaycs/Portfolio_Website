# Stack Research

**Domain:** 3D portfolio website (hacker-workstation aesthetic) — static build, GitHub Pages, solo-maintained
**Researched:** 2026-05-06
**Confidence:** HIGH (versions verified against npm registry; capabilities verified against Context7 / official docs as of May 2026)

> Audience for this doc: a roadmap planner picking phase contents, and Eren as the implementer. Be prescriptive — every row below is "use this, not that."

---

## TL;DR — The Stack in One Paragraph

**Vite 8 + React 19 + TypeScript 6** as the build/runtime baseline. **React Three Fiber 9 + Three.js r184 + Drei 10** for the 3D scene; **`<Html transform occlude="blending">` from drei** for monitor screens (NOT raw CSS3DRenderer). **`@react-three/postprocessing` 3** for the CRT/terminal look (Bloom + Scanline + ChromaticAberration + subtle Noise; avoid Glitch on permanent loop). **Tailwind CSS v4 via `@tailwindcss/vite`** for both the 3D HUD overlay and the 2D fallback. **React Router v7 in declarative mode + `HashRouter`** for routing on GitHub Pages (avoids the SPA-404 problem without prerender complexity). **MDX via `@mdx-js/rollup` + `rehype-pretty-code` (Shiki)** for CTF write-ups with build-time syntax highlighting. **Motion (formerly Framer Motion) v12** for 2D UI animation; **R3F's `useFrame` + drei's animation helpers** for 3D animation. **`gltfjsx --transform` (driving `@gltf-transform/cli` under the hood)** for any GLB asset pipeline. **Web3Forms** for the contact form (free tier, GitHub-Pages-compatible, no backend). **`gh-pages` npm OR a GitHub Actions deploy workflow** for publishing — prefer Actions.

The ONE non-obvious decision: **don't use `@react-three/a11y`** — it has been unpublished/stale since May 2022. Build the 2D fallback as a real route serving real semantic HTML; that's the actual accessibility story for a 3D portfolio.

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **React** | `19.2.x` | UI runtime | R3F v9 pairs specifically with React 19; React Compiler can auto-memoize R3F components in 2026, reducing the "wrap every frame-driven component in `useMemo`" burden. |
| **TypeScript** | `5.9.x` (NOT 6.x yet) | Type system | TS 6 just shipped (mid-2026) and several R3F/drei type defs target TS 5.x. Hold on 5.9 until R3F v10 lands. |
| **Vite** | `8.x` | Build tool + dev server | Standard for non-SSR React apps in 2026. Native ESM dev, Rollup-based prod build, first-party Tailwind v4 plugin, trivial GitHub Pages config (just set `base`). Alternatives (CRA, Next.js static export) are wrong for this project — see "What NOT to Use." |
| **React Three Fiber** (`@react-three/fiber`) | `9.6.x` | Declarative React renderer for Three.js | The de-facto React-3D renderer. v9 is the React-19-compatible line. Reconciler is bundled, so you don't fight peer-dep mismatches. |
| **Three.js** (`three`) | `0.184.x` | WebGL engine under R3F | Pinned by `@react-three/fiber`'s peer range. Don't upgrade `three` independently of R3F/drei or you'll hit type-mismatch errors. |
| **@react-three/drei** | `10.7.x` | R3F helpers (cameras, controls, loaders, `Html`, environments, primitive shapes) | This is non-optional for this project. `<Html transform occlude>` IS the monitor-screen solution. `<OrbitControls>`, `<PerspectiveCamera makeDefault>`, `<Environment>`, `<useGLTF>`, `<Text>` all live here. |
| **@react-three/postprocessing** | `3.0.x` | CRT / bloom / scanline / chromatic aberration effects | Wraps the `postprocessing` library declaratively. Has every effect needed for terminal aesthetic out of the box. Last release Feb 2025 — actively maintained. |
| **Tailwind CSS** | `4.2.x` (via `@tailwindcss/vite` `4.2.x`) | Utility CSS for the HUD overlay AND the 2D fallback page | v4 has zero-config in Vite — one CSS import, one plugin, no `tailwind.config.js` required for basic projects. Perfect for a solo-maintained terminal-aesthetic site (mono fonts, dark palette, small set of green/amber accents). |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **react-router** | `7.15.x` (declarative mode) | Client-side routing for `/`, `/2d`, `/projects/:slug`, `/writeups/:slug` | Use `HashRouter` (not `BrowserRouter`) for GitHub Pages — avoids the 404-on-refresh trap without needing the `404.html` redirect hack. URLs become `/#/projects/foo` which is fine for a portfolio. Stay in **declarative** mode (not data/framework mode) — those are for SSR/loaders we don't have. |
| **motion** (formerly framer-motion) | `12.38.x` | 2D UI animation: terminal text typing, monitor-content reveals, page transitions, the 2D fallback's micro-interactions | Imports moved from `framer-motion` to `motion/react` in 2025. Use this, not the legacy `framer-motion` package. |
| **gsap** | `3.15.x` | Complex scripted timelines (e.g. the boot-up sequence: scanlines flicker → CRT power-on glow → `whoami` types → camera dollies in) | GSAP became fully free in early 2026 (Webflow acquisition). Use it ONLY for camera/scene choreography that needs precise timeline control; don't use it for routine UI animation (Motion is enough there). |
| **@mdx-js/rollup** + **@mdx-js/react** | `3.1.x` | Author CTF write-ups in MDX, embed React components (e.g. `<Terminal>`, `<Hexdump>`) inside | Official MDX-on-Vite path. Not `vite-plugin-mdx` — that's a third-party shim and the official recommendation since MDX v2 has been `@mdx-js/rollup`. |
| **rehype-pretty-code** + **shiki** | `0.14.x` / `4.0.x` | Build-time syntax highlighting for code blocks in MDX (Bash, Python, C, asm, hex) | Build-time, not runtime — zero JS shipped to browser for highlighting. Uses VS Code's TextMate grammars so the colours match what recruiters see in their editor. Pair with a monochrome-ish theme (e.g. `github-dark`, `vesper`, or a custom `min-dark` variant) to fit terminal aesthetic. |
| **zustand** | `5.0.x` | Tiny state store for cross-canvas-and-DOM state (which monitor is focused, is 2D fallback active, prefers-reduced-motion flag) | The pmndrs ecosystem standard. R3F itself uses it internally. Do NOT reach for Redux or Context-only patterns here — Context across the Canvas boundary is awkward; zustand sidesteps it. |
| **leva** | `0.10.x` | Dev-only GUI for tweaking 3D scene parameters (light intensity, bloom threshold, camera FOV) | DEV USE ONLY — wrap behind `import.meta.env.DEV` and tree-shake out of prod. Massively speeds up "find the right look" iteration without re-deploying. |
| **r3f-perf** | `7.2.x` | Dev-only performance HUD: drawcalls, GPU memory, FPS, triangle count | DEV USE ONLY. Watch this while building scene to catch the "I shipped a 50MB GLB" mistake before deploy. |
| **maath** | `0.10.x` | Math helpers for R3F (eased lerp, easings, vector utilities) | When animating camera moves between monitor focus positions; cleaner than rolling your own easing. Optional but tiny. |
| **@web3forms/...** (no SDK; just `fetch` to their endpoint) | n/a (HTTP API) | Contact form on a static site | Free tier: 250 submissions/month, unlimited forms, no backend, works on GitHub Pages. Better free tier than Formspree (50/mo). Setup: one access key in a hidden input, POST to `https://api.web3forms.com/submit`. |
| **gltfjsx** (`gltfjsx`) | `6.5.x` | CLI: convert `.glb` → typed JSX component + run `--transform` to produce a Draco-compressed, KTX2-textured, deduped, instanced GLB | Run once per asset at author time, commit both the optimized `.glb` and the generated `.tsx`. Don't run at build time. |
| **@gltf-transform/cli** | `4.3.x` | Asset pipeline (texture-compress KTX2, draco, prune, dedup, instance) | gltfjsx already shells out to this with `--transform`. List it explicitly so it's installed and pinned. KTX2 alone is the difference between a 26 MB and a 600 KB scene. |
| **gh-pages** (npm) | `6.3.x` | One-shot CLI deploy: `npm run deploy` → pushes `dist/` to `gh-pages` branch | Acceptable for v1 if you don't want to write a workflow. **But prefer GitHub Actions** (no extra dep, builds always run on a clean slate). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **GitHub Actions** (`actions/configure-pages`, `actions/deploy-pages`) | Automated deploy on push to `main` | The 2026-recommended approach. Set repo's Pages source to "GitHub Actions" (Settings → Pages → Source: GitHub Actions). Build runs in CI, dist is uploaded as a Pages artifact. No `gh-pages` branch needed. |
| **ESLint** `9.x` (NOT 10.x yet) | Linting | ESLint 10 just shipped; most plugins still target 9. Hold on `eslint@9` for ecosystem stability. Pair with `@typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`. |
| **Prettier** `3.x` | Formatting | Standard. No surprises. |
| **Vitest** `2.x` | Tests for utility code (route logic, MDX frontmatter parsing, the prefers-reduced-motion hook) | Don't try to unit-test 3D scenes in jsdom — it can't render WebGL. Test pure logic only; visually verify the canvas in browser. |
| **Playwright** (optional, light usage) | Smoke test: 2D fallback route loads under 5s, contact form posts successfully (using a Web3Forms test mode), navigation works | Optional for v1. Add later if regressions become painful. |

---

## The 3D-Monitors-Displaying-HTML Decision (most important call in the stack)

**Use drei's `<Html>` component with `transform occlude="blending"` props.** Do NOT set up `CSS3DRenderer` directly.

**Why:**

- `<Html transform>` projects DOM content onto a 3D plane via CSS `matrix3d`, so React content (terminal output, code blocks, MDX-rendered write-ups) renders pixel-perfectly inside the 3D scene with full text selection, copy/paste, and accessibility tree intact.
- `occlude="blending"` makes the HTML correctly hide behind 3D geometry (e.g. when you orbit the camera around the back of a monitor, the screen's content is occluded by the monitor's housing), which raw `CSS3DRenderer` cannot do.
- `<Html>` is built on top of `CSS3DRenderer` internally — you get its capabilities without managing two renderers, two scenes, and the Z-index reconciliation pain.
- Iframes in `CSS3DRenderer` have known interaction blind spots at oblique angles. We control all monitor content (it's our own React components), so `<Html>` with React children avoids that entirely.

**Pattern for a monitor:**

```tsx
function Monitor({ position, rotation, children }) {
  return (
    <group position={position} rotation={rotation}>
      {/* The physical monitor mesh from your GLB */}
      <MonitorChassis />
      {/* The screen surface - HTML projected onto a flat plane in front of the chassis */}
      <Html
        transform
        occlude="blending"
        distanceFactor={1.2}
        position={[0, 0, 0.01]}    // a hair in front of the screen mesh
        wrapperClass="monitor-screen"
        style={{ width: 800, height: 600, pointerEvents: 'auto' }}
      >
        {children /* <TerminalApp />, <CVApp />, <ProjectsApp />, ... */}
      </Html>
    </group>
  )
}
```

**Known caveat:** in `transform` mode the HTML can blur on some devices. Drei's docs recommend scaling the parent container up and counter-scaling the inner content (e.g. parent `width: 800px`, inner `transform: scale(0.5)` with double-resolution content) — keep this trick in your back pocket if the terminal text looks fuzzy on a 4K monitor.

---

## The 2D Fallback Decision (concrete, not hand-wavy)

**Build the 2D fallback as a real, separate route at `/#/2d`** (with HashRouter), and serve it under three conditions:

1. **User-toggled** — visible "Skip 3D / Recruiter view" button on the landing page from second one (don't make recruiters wait for the 3D scene to even render the toggle). Persist choice in `localStorage` so they don't re-pick it every visit.
2. **Auto-redirect on `prefers-reduced-motion: reduce`** — the OS-level signal users with vestibular issues, sensory sensitivities, or low-power-mode laptops set. WCAG 2.3.3 essentially requires honouring it for non-essential motion.
3. **Auto-redirect on capability check** — if `navigator.deviceMemory < 4` OR `navigator.hardwareConcurrency < 4` OR there's no WebGL2 context, redirect immediately. Don't try to detect "is this a recruiter's MacBook Air on hotel Wi-Fi" with heuristics — just gate on hardware/WebGL.

**The 2D fallback is NOT "a screenshot of the 3D scene."** It is a fully-laid-out static HTML page with:
- name, tagline ("Junior Cybersecurity Analyst"), current location/availability
- CV summary (visible immediately, NOT behind a click)
- Direct download link to the CV PDF
- GitHub, LinkedIn, email links above the fold
- Projects list with links to each write-up
- Certifications list
- Same terminal/monospace aesthetic (Tailwind-styled DOM, not Canvas) so visual identity carries across

**Both routes share:** the MDX write-up content, the projects data array, and the contact form component. The 3D route wraps these in `<Html>` projected onto monitors; the 2D route lays them out in a normal column. **One source of truth, two presentations.** This is the entire reason to keep React + Tailwind on both sides — the alternative (rebuild content twice) is a maintenance trap.

**Rendering both at build time:** Vite builds a single SPA bundle and both routes are reachable from one `index.html`. That's fine — GitHub Pages serves the bundle, the HashRouter handles route switching client-side. The 2D route is only "fast" if you code-split the 3D scene out of the 2D bundle (use `React.lazy` + `<Suspense>` for the entire `<Scene3D>` import). Without code-splitting, the recruiter pays for Three.js even if they never see it.

---

## Accessibility for 3D (the realistic answer)

**`@react-three/a11y` is unmaintained.** Latest publish: **May 2022** (verified against the npm registry on 2026-05-06). It still installs, but it predates React 18's strict mode, R3F v8/v9, and modern React patterns. **Do not adopt it.**

The realistic accessibility approach for this site is:

1. **The 2D fallback IS the accessibility story** for keyboard-only / screen-reader / low-vision users. It's a proper semantic HTML page with `<h1>`, `<nav>`, `<article>`, etc.
2. **Honour `prefers-reduced-motion`** at the boundary: if it's set, auto-route to `/2d`, OR keep 3D but disable the boot-up sequence, camera auto-orbit, glitch effect, and bloom pulse. Use a `useReducedMotion()` hook.
3. **Honour `prefers-color-scheme`** is moot here — the site is dark by design — but explicitly declare `color-scheme: dark` so user-agents render scrollbars/form controls in matching shades.
4. **Keyboard navigation in 3D:** Each monitor click target should also be reachable via Tab. Use a hidden focusable list of "go to CV monitor / projects monitor / writeups monitor" links, styled `sr-only` Tailwind class, that programmatically dolly the camera. The 3D scene becomes a visual presentation of an underlying linear DOM structure.
5. **Document what the canvas is** with a `<canvas aria-label="3D hacker workstation. Use the 'Skip to recruiter view' button or Tab to navigate sections.">`.

This is not a perfect a11y story — 3D-canvas portfolios fundamentally aren't — but the 2D fallback shifts it from "exclusionary" to "accommodating." That's the right bar for v1.

---

## Email Obfuscation Strategy (anti-scrape)

The user explicitly opted into a public email. Protect it with a **layered, low-effort approach**:

1. **Don't put a plain `mailto:eren@...` in source.** That's the primary harvester target.
2. **Render the email at runtime via JS** — store it as a Base64 string or split into `["eren", "atalay-domain", "tld"]` array, decode/concatenate in a `useEffect`, and write it into the DOM only after mount. This defeats >90% of HTML scrapers (they don't execute JS).
3. **Use a CSS direction-reversal decoy as a backup** — render the email reversed in source (`<span class="obfuscated">moc.elpmaxe@nere</span>`) with `direction: rtl` and `unicode-bidi: bidi-override` so it displays correctly. Defeats the remaining naïve scrapers.
4. **Primary contact UX is the form, not the mailto.** The Web3Forms-backed contact form is the recommended path; the email is the "if you prefer" fallback. This means even if the email gets scraped, most legitimate contact still arrives via form.
5. **Don't use Cloudflare email-obfuscation** — it requires Cloudflare in front of the site, which conflicts with the GitHub Pages-only constraint.

---

## Animation: When to Use Which Tool

| Tool | Use For | Don't Use For |
|------|---------|---------------|
| **R3F's `useFrame`** | Per-frame 3D scene updates (gentle camera bob, monitor blink animation, terminal cursor) | UI animations (use Motion); long timeline sequences (use GSAP) |
| **drei animation helpers** (`useSpring` from `@react-spring/three`, `Float`, `MeshTransmissionMaterial`) | Declarative spring-based 3D motion: e.g. "monitor leans forward when hovered" | Anything that needs precise timing |
| **Motion (motion/react)** | All 2D UI: page transitions, monitor-content reveal, terminal text typing, button hovers, modal open/close | Heavy 3D camera choreography (use GSAP) |
| **GSAP** | The boot-up sequence, the camera dolly between monitor focus states, scroll-driven scene changes if you add them | Anything Motion can do — GSAP is heavier and overkill for routine UI |

---

## Installation

```bash
# Scaffold
npm create vite@latest portfolio -- --template react-ts
cd portfolio

# Core 3D
npm install three@~0.184.0 @react-three/fiber@~9.6 @react-three/drei@~10.7 @react-three/postprocessing@~3.0

# Routing
npm install react-router@~7.15

# Animation
npm install motion@~12.38 gsap@~3.15 @react-spring/three@~9.7 maath@~0.10

# State
npm install zustand@~5.0

# MDX + syntax highlighting
npm install @mdx-js/rollup@~3.1 @mdx-js/react@~3.1 rehype-pretty-code@~0.14 shiki@~4.0

# Tailwind v4
npm install -D tailwindcss@~4.2 @tailwindcss/vite@~4.2

# Dev-only debug helpers
npm install -D leva@~0.10 r3f-perf@~7.2

# Asset pipeline (run as needed, not at build time)
npm install -D gltfjsx@~6.5 @gltf-transform/cli@~4.3

# Optional deploy helper (or use GitHub Actions instead)
npm install -D gh-pages@~6.3

# Lint/type
npm install -D typescript@~5.9 eslint@~9 @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh prettier@~3
```

**Vite config (`vite.config.ts`):**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import rehypePrettyCode from 'rehype-pretty-code'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/portfolio-website/',  // CHANGE to repo name; '/' if user.github.io root
  plugins: [
    { enforce: 'pre', ...mdx({
      rehypePlugins: [[rehypePrettyCode, { theme: 'vesper' }]],
    }) },
    react(),
    tailwindcss(),
  ],
})
```

**`src/index.css`:**

```css
@import "tailwindcss";

@theme {
  --font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
  --color-terminal-bg: #0a0e0a;
  --color-terminal-fg: #33ff33;
  --color-terminal-amber: #ffb000;
}
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Vite 8** | **Next.js 15 static export** (`output: 'export'`) | If you later want SSG with per-route HTML (better SEO, no hash router) AND you're willing to deal with Next's static-export caveats. Overkill for a portfolio with ~7 routes. |
| **HashRouter** | **BrowserRouter + GitHub Pages 404.html SPA shim** | If clean URLs (`/projects/foo`, not `/#/projects/foo`) matter for SEO/sharing. Requires a `404.html` redirect script. Doable, slightly fragile, defer to v2. |
| **drei `<Html transform>`** | **Render-to-texture** (render React content to a hidden `<canvas>`, sample as a `THREE.CanvasTexture`) | If you need the screen content to interact with 3D lighting/shadows realistically (e.g. screen glow on the desk surface). The bloom postprocess gives you that look without the complexity for v1. |
| **Web3Forms** | **Formspree / Static Forms / EmailJS** | Formspree's free tier (50/mo) is tighter; pick it if you already have an account. EmailJS sends from the browser, exposing your Service ID — fine for pet projects, less professional. |
| **Motion** | **react-spring** | If the rest of your animation is already spring-based (which is true for `@react-spring/three`'s 3D springs). Many people use both: react-spring inside Canvas, Motion outside. The recommendation already does that. |
| **GitHub Actions deploy** | **`gh-pages` npm package** | If you want one-command deploy from your laptop and don't care about CI hygiene. Acceptable for solo v1. |
| **`gltfjsx --transform`** | **`@gltf-transform/cli` directly** | If you want fine-grained control over the optimization pipeline (e.g. specific texture sizes per material). gltfjsx's defaults are already excellent for portfolio scenes. |
| **rehype-pretty-code (Shiki, build-time)** | **Prism.js (runtime)** | If you need themes Shiki doesn't have OR you have ~50+ MDX files where build-time highlighting becomes slow. Neither applies here. |
| **Procedural geometry for the desk/monitors** | **Modeled in Blender, exported as GLB** | If the look-and-feel demands a specific style only achievable through proper modeling. For v1, primitive shapes (`<boxGeometry>`, `<cylinderGeometry>`) plus emissive materials and a CRT shader will get you 80% of the aesthetic at 5% of the time-cost. Plan to swap in Blender models for v2. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Create React App** | Deprecated by the React team in 2025; no Vite-equivalent dev speed; no maintained build pipeline. | **Vite 8** |
| **Next.js (anything other than static export)** | SSR/ISR/RSC features can't run on GitHub Pages — wasted runtime complexity. Even static export adds Next-specific routing semantics for no benefit here. | **Vite + React Router** |
| **Raw `CSS3DRenderer`** (without drei) | Two-renderer juggling, manual occlusion, blind spots on iframes, doesn't compose with R3F's reconciler. | **drei `<Html transform occlude="blending">`** |
| **`@react-three/a11y`** | Last published May 2022; predates React 18 strict mode and R3F v9. Effectively unmaintained. | **Build a real 2D fallback route + honour `prefers-reduced-motion`** |
| **`framer-motion`** (the legacy package name) | Frozen — replaced by the `motion` package after the 2025 spin-off from Framer. | **`motion` (import from `motion/react`)** |
| **`vite-plugin-mdx`** (the third-party one) | Older, not maintained in lockstep with MDX v3. | **`@mdx-js/rollup`** (official) |
| **Prism.js** for syntax highlighting | Runtime cost; older grammar accuracy; no VS Code theme parity. | **rehype-pretty-code + Shiki** (build-time, VS Code grammars) |
| **Tailwind v3 with PostCSS config** | Slower build, requires `tailwind.config.js` and `postcss.config.js` boilerplate. | **Tailwind v4 with `@tailwindcss/vite`** (zero config) |
| **`mailto:` links in source** | Trivially scraped by spam harvesters; the user's email is a real public email. | **Web3Forms contact form + JS-decoded mailto fallback** |
| **`BrowserRouter`** on GitHub Pages without a 404.html shim | Hard refresh on `/projects/foo` returns a 404 because GH Pages serves static files only. | **`HashRouter`** (or BrowserRouter + `404.html` redirect — accept the complexity if clean URLs matter) |
| **Big sky/HDRI environment maps loaded synchronously** | Network-blocking on first paint; inflates the time-to-3D from "1s" to "5s." | **`<Environment preset="night">` from drei** (small built-in maps) OR a procedural starfield, OR no environment at all (the "dark room" aesthetic doesn't need one) |
| **Three.js custom shaders in v1** | Easy to write; very easy to ship a shader compile error to production that nukes the entire scene. | **Drei's prebuilt materials + postprocess Bloom/Scanline.** Save custom GLSL for v2 once the scene is stable. |
| **Dynamic GLB loading from a CDN** | Adds a runtime dep on a third-party CDN; CORS surprises; CSP headaches. | **Bundle GLBs in `/public` and reference relatively** — Vite copies them to `dist/` and the GH Pages base path handles URL rewriting. |
| **`leva` and `r3f-perf` in production builds** | Ships dev tooling to recruiters; bloats bundle. | **Wrap in `import.meta.env.DEV` checks** so they tree-shake out. |
| **Analytics with personal data (GA4, Plausible Cloud, etc.)** | Conflicts with the project's privacy-respecting constraint, and GH Pages can't host server-side. | **Don't ship analytics in v1.** If you want light pageview counts later, GoatCounter or a privacy-respecting Cloudflare-side counter. |

---

## CRT / Terminal Postprocessing Recipe (concrete starting point)

```tsx
import { EffectComposer, Bloom, Scanline, ChromaticAberration, Noise } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'

<EffectComposer>
  {/* The signature green-monitor glow */}
  <Bloom
    intensity={0.6}
    kernelSize={KernelSize.LARGE}
    luminanceThreshold={0.4}
    luminanceSmoothing={0.2}
    mipmapBlur
  />
  {/* Subtle CRT scanlines - density 1.0-1.5 reads as CRT, higher reads as broken */}
  <Scanline blendFunction={BlendFunction.OVERLAY} density={1.25} opacity={0.15} />
  {/* Just-perceptible color fringing at screen edges */}
  <ChromaticAberration offset={[0.0008, 0.0008]} blendFunction={BlendFunction.NORMAL} />
  {/* Fine grain - keep low, this is a portfolio not a horror game */}
  <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
</EffectComposer>
```

**Effects to AVOID on a permanent loop:**
- **`Glitch`** — looks cool for 2 seconds, then nauseates the visitor. Use it ONCE during the boot-up sequence, then disable.
- **`DotScreen`** — too aggressive for terminal aesthetic; reads as halftone print, not CRT.
- **`Pixelation` at low resolutions** — destroys text readability; the whole point of monitors-as-content-surfaces is that text is sharp.
- **`DepthOfField`** — looks great in product showcases but blurs the very content (text on monitors) recruiters are trying to read. Avoid.
- **`SSAO`** — expensive, marginal visual gain in a dark scene. Skip for v1.

---

## Stack Patterns by Variant

**If the v1 budget is "month-ish" (current plan):**
- Procedural geometry for desk/monitors (no Blender modeling)
- One ambient + one rim light + emissive monitor screens
- `<Environment preset="night">` (drei built-in)
- Postprocessing recipe above
- 3-4 monitor "apps" (CV, projects list, writeups list, contact)
- 2D fallback as a single long-scroll page

**If timeline expands to 2-3 months (v2):**
- Custom-modeled Blender desk with proper PBR materials
- Custom CRT shader for screen curvature + barrel distortion
- Per-monitor "boot up" animation when first focused
- Scroll-driven camera tour as an alternative to free-look
- BrowserRouter + 404.html shim for clean URLs

**If accessibility/recruiter usage data shows >50% landing on 2D:**
- Reverse the priority: 2D becomes default, 3D is the "Enter the Workstation" opt-in
- This is the right fallback for "if my recruiter audience hate 3D" — you don't need to predict it now, instrument it later

---

## Version Compatibility (verified 2026-05-06 against npm registry)

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@react-three/fiber@9.x` | `react@19.x` | v9 is the React-19 line. v8 pairs with React 18. Don't mix. |
| `@react-three/drei@10.x` | `@react-three/fiber@9.x`, `three@~0.184.x` | Drei pins three's range tightly. Don't manually upgrade `three`. |
| `@react-three/postprocessing@3.x` | `@react-three/fiber@9.x`, `three@~0.184.x` | Wraps `postprocessing@7.x` (vanilla). |
| `tailwindcss@4.2.x` | `@tailwindcss/vite@4.2.x`, `vite@8.x` | The version numbers must match between `tailwindcss` and `@tailwindcss/vite` — they release in lockstep in v4. |
| `react-router@7.x` (declarative mode) | `react@19.x` | Don't import from `react-router-dom` — in v7 it's just `react-router`. |
| `motion@12.x` | `react@18.x` or `react@19.x` | Import from `motion/react`, not `framer-motion`. |
| `@mdx-js/rollup@3.x` | `vite@5+`, `@mdx-js/react@3.x` | MDX 3 is ESM-only — set `"type": "module"` in `package.json`. |
| `rehype-pretty-code@0.14.x` | `shiki@^1.0` (and now `^4.0`) | Pin shiki to a working major if you hit grammar regressions. |
| `gltfjsx@6.x` | `three@~0.184.x` (for the `--transform` output target) | Run as a CLI tool, not an import — it's a code generator. |

---

## Confidence per Recommendation

| Decision | Confidence | Verification |
|----------|------------|--------------|
| Vite 8 over CRA / Next.js | **HIGH** | Vite 8 confirmed on npm (`8.0.10`); CRA officially deprecated 2025; Next.js static-export overhead is well-documented. |
| R3F v9 + React 19 + drei 10 | **HIGH** | Versions verified live on npm registry; pairing rules verified in Context7 R3F docs ("`@react-three/fiber@9` pairs with `react@19`"). |
| `<Html transform occlude="blending">` for monitors | **HIGH** | Verified in Context7 drei docs and three.js forum discussions; identified as the standard solution. |
| `@react-three/postprocessing` for CRT effects | **HIGH** | All four effects (Bloom, Scanline, ChromaticAberration, Glitch) verified in Context7 postprocessing docs; library actively maintained (last release Feb 2025). |
| Tailwind v4 + `@tailwindcss/vite` | **HIGH** | Verified on npm; official install guide is current; Tailwind v3 is legacy. |
| HashRouter for GitHub Pages | **HIGH** | Verified in React Router v7 docs and official GH community discussions; the BrowserRouter SPA-404 problem is well-known. |
| Web3Forms over Formspree | **MEDIUM** | Free tier difference (250 vs 50/mo) is verified, but quality of deliverability for either at scale isn't directly verified — fine for portfolio volumes. |
| `@react-three/a11y` is unmaintained | **HIGH** | Verified directly: `npm registry → @react-three/a11y → latest publish 2022-05-15`. Nearly 4 years stale. |
| Motion (not framer-motion) | **HIGH** | Verified rebrand happened in 2025; both packages exist on npm but `motion` is the actively-developed line. |
| GSAP free in 2026 | **HIGH** | Webflow acquisition + license change confirmed by GSAP's official pricing page. |
| `gltfjsx --transform` workflow | **HIGH** | Documented on the pmndrs/gltfjsx repo; standard pmndrs ecosystem workflow. |
| MDX via `@mdx-js/rollup` (not `vite-plugin-mdx`) | **HIGH** | Official MDX docs explicitly recommend `@mdx-js/rollup` for Vite. |
| Procedural geometry for v1 over Blender | **MEDIUM** | This is a time-budget judgement call, not a technical one. If Eren has prior Blender skill, modeling first is fine. The recommendation reflects the stated solo + "month-ish" constraint. |
| Avoid DOF / SSAO postprocessing | **MEDIUM** | Performance-and-readability reasoning is sound; based on experience, not measured on this specific scene. Re-evaluate if scene allows. |

---

## Sources

**Context7 (HIGH-confidence library docs):**
- `/pmndrs/react-three-fiber` — installation, React 19 pairing, v9 changes
- `/pmndrs/drei` — `<Html>` component props, `transform`, `occlude`, blending mode
- `/pmndrs/react-postprocessing` — Bloom, Scanline, ChromaticAberration, Glitch, Noise effect APIs
- `/vitejs/vite` — Vite 7/8 build and base-path configuration

**Official documentation (HIGH confidence):**
- [React Three Fiber v9 migration guide](https://r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
- [drei controls introduction](http://drei.docs.pmnd.rs/controls/introduction)
- [Vite static deploy guide](https://vite.dev/guide/static-deploy)
- [Tailwind CSS v4 install with Vite](https://tailwindcss.com/docs)
- [`@tailwindcss/vite` on npm](https://www.npmjs.com/package/@tailwindcss/vite)
- [React Router modes (declarative/data/framework)](https://reactrouter.com/start/modes)
- [`@mdx-js/rollup` docs](https://mdxjs.com/packages/rollup/)
- [rehype-pretty-code docs](https://rehype-pretty.pages.dev/)
- [Motion (formerly Framer Motion) docs](https://motion.dev/docs/react-quick-start)
- [GSAP pricing (free as of 2026)](https://gsap.com/pricing/)
- [pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx)
- [three.js CSS3DRenderer docs](https://threejs.org/docs/pages/CSS3DRenderer.html)
- [Web3Forms](https://web3forms.com/)
- [pmndrs/react-three-a11y (last release May 2022)](https://github.com/pmndrs/react-three-a11y)

**npm registry (HIGH confidence — version pins verified live 2026-05-06):**
- All version numbers in this document were retrieved directly from `https://registry.npmjs.org/<pkg>/latest` on 2026-05-06.

**Community resources (MEDIUM confidence — patterns and idioms):**
- [Three.js forum: combining WebGLRenderer + CSS3DRenderer](https://discourse.threejs.org/t/implementing-html-into-three-js/51375)
- [GitHub: Vite + GH Pages deploy demo](https://github.com/sitek94/vite-deploy-demo)
- [GitHub orgs/community: BrowserRouter + GH Pages incompatibility](https://github.com/orgs/community/discussions/36010)
- [Spencer Mortensen: Email obfuscation in 2026](https://spencermortensen.com/articles/email-obfuscation/)
- [Pope Tech: Accessible animation and `prefers-reduced-motion`](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/)

---

*Stack research for: 3D portfolio website (hacker-workstation aesthetic, GitHub Pages, solo-maintained)*
*Researched: 2026-05-06*
