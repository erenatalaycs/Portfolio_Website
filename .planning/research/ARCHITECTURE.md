# Architecture Research

**Domain:** 3D portfolio website (R3F + Tailwind, GitHub Pages, single maintainer)
**Researched:** 2026-05-06
**Confidence:** HIGH (component boundaries, data flow, deploy) / MEDIUM (asset budgets — depend on real GLTFs)

This file answers four load-bearing questions for the roadmap:

1. **Top-level shell:** SPA-with-anchor-sections vs multi-route — which works for a 3D-first site that must also serve recruiters in <5s?
2. **3D vs 2D fallback:** same tree / two routes / two builds?
3. **Where 3D content lives:** monolith Canvas vs composed scene; HTML overlay vs CSS3D vs render-to-texture for monitor content?
4. **Build order:** what does a solo junior dev ship first so something is live early?

The recommendations are concrete, not "options A–C."

---

## Standard Architecture

### System Overview

```
                       index.html (Vite-built, GitHub Pages /Portfolio_Website/)
                                          |
                                          v
                          +---------------------------------+
                          |         <App />                 |
                          |  - reads ?view= / device hint   |
                          |  - mounts ONE of the shells     |
                          +----------------+----------------+
                                           |
              +----------------------------+----------------------------+
              |                                                         |
              v                                                         v
   +---------------------+                                  +-------------------------+
   |   <ThreeDShell />   | (default on capable desktop)    |  <TextShell />          | (?view=text, mobile, low-end, prefers-reduced-motion)
   +----------+----------+                                  +-------------+-----------+
              |                                                            |
              | imports                                                    | imports
              v                                                            v
   +---------------------+                                  +-------------------------+
   |  src/scene/*        |                                  | src/text/*              |
   |  - <Workstation/>   |                                  | - <Header/>             |
   |    - <Desk/>        |                                  | - <CVSummary/>          |
   |    - <Monitor x3/>  |                                  | - <ProjectsList/>       |
   |    - <Lamp/>        |                                  | - <CTFList/>            |
   |    - <Bookshelf/>   |                                  | - <Contact/>            |
   |  - <Camera/>        |                                  +-------------+-----------+
   |  - <Controls/>      |                                                |
   |  - <SceneOverlay/>  | (drei <Html> bound to monitor screens)         |
   +----------+----------+                                                |
              |                                                            |
              | both shells read from                                      |
              v                                                            v
                          +---------------------------------+
                          |  src/content/*  (single source) |
                          |  - profile.ts                   |
                          |  - projects.ts                  |
                          |  - ctfs.ts (+ MDX bodies)       |
                          |  - certifications.ts            |
                          |  - skills.ts                    |
                          |  - education.ts                 |
                          +---------------------------------+
                                          ^
                                          |
                          +---------------------------------+
                          |  public/assets/                  |
                          |  - models/workstation.glb (Draco)|
                          |  - textures/*.webp               |
                          |  - cv.pdf                        |
                          |  - og-image.png                  |
                          +---------------------------------+
```

Key invariants:

- **Content is the only shared mutable surface.** Both shells pull from `src/content/*`. They never read from each other or from the DOM.
- **The Canvas is exactly one mount point** inside `<ThreeDShell />`. The text shell never instantiates R3F — that is the entire reason it loads fast.
- **There is no router on the critical path.** GitHub Pages cannot do server-side route fallbacks cleanly; we route at the App level via a single `?view=` query param. (See "Routing" below.)

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `<App />` | Decide which shell to render. Read `?view=text` and a one-time device-capability check. Mount `<TextShell />` or lazy-load `<ThreeDShell />`. | ~50 LOC, no dependencies on R3F |
| `<TextShell />` | Static, semantic HTML CV. First paint <1s on broadband. Crawler-readable. Tailwind only. | Vanilla React, no Canvas |
| `<ThreeDShell />` | Hosts `<Canvas>`, `<Suspense>`, `<Loader>`, scene overlay. Lazy-loaded via `React.lazy`. | R3F + drei |
| `<Workstation />` | Composes the room. No state, no logic — pure scene graph. | Composed of small primitives |
| `<Desk />`, `<Monitor />`, `<Lamp />`, `<Bookshelf />` | One file per scene part. Each owns its own GLTF reference and materials. Use `gltfjsx` to generate skeletons. | Pure mesh components |
| `<MonitorScreen monitorId>` | Renders interactive content onto a monitor's screen plane via drei `<Html transform occlude>`. Reads from `src/content`. | drei + content imports |
| `<Camera />` / `<Controls />` | OrbitControls (clamped) for free-look; on click of a monitor, animates camera to that monitor's "view" pose. | drei + small custom hook |
| `<SceneOverlay />` | DOM overlay siblings of Canvas: top-bar (`whoami` indicator, "View as text" toggle, contact email), bottom-bar (loading progress via `useProgress`). Tailwind, not inside Canvas. | Sibling div |
| `src/content/*` | Typed content collections. Single source of truth. | `.ts` files exporting typed records, MDX only for long-form CTF write-ups |
| `src/lib/device.ts` | One-shot capability check: WebGL2 supported? `prefers-reduced-motion`? `navigator.deviceMemory < 4`? `navigator.hardwareConcurrency < 4`? mobile UA? | ~30 LOC |

---

## Recommended Project Structure

```
portfolio/
├── index.html                  # Single entry; Vite injects scripts
├── public/
│   ├── 404.html                # Identical to index.html — SPA fallback for GH Pages
│   ├── assets/
│   │   ├── models/
│   │   │   └── workstation.glb # ONE consolidated, Draco-compressed model (target <2 MB)
│   │   ├── textures/           # WebP, 1024 max
│   │   └── cv.pdf
│   ├── og-image.png            # Static social preview
│   └── robots.txt
├── src/
│   ├── App.tsx                 # Shell selector
│   ├── main.tsx                # ReactDOM.createRoot
│   ├── shells/
│   │   ├── ThreeDShell.tsx     # Lazy-loaded; owns <Canvas>
│   │   └── TextShell.tsx       # Eager; ships in initial JS
│   ├── scene/
│   │   ├── Workstation.tsx
│   │   ├── Desk.tsx
│   │   ├── Monitor.tsx
│   │   ├── MonitorScreen.tsx   # The drei <Html> binding
│   │   ├── Lamp.tsx
│   │   ├── Bookshelf.tsx
│   │   ├── Camera.tsx
│   │   ├── Controls.tsx
│   │   └── effects/            # Postprocessing (optional, gated by perf monitor)
│   ├── ui/                     # DOM components used by BOTH shells
│   │   ├── TerminalPrompt.tsx  # The animated `whoami` greeting
│   │   ├── ProjectCard.tsx
│   │   ├── CTFCard.tsx
│   │   ├── ContactBlock.tsx    # Obfuscated email + GitHub + LinkedIn
│   │   └── ViewToggle.tsx      # 3D <-> Text switch
│   ├── content/
│   │   ├── profile.ts          # name, title, summary, contact
│   │   ├── projects.ts         # typed Project[]
│   │   ├── ctfs.ts             # typed CTF[] with optional MDX body refs
│   │   ├── certifications.ts
│   │   ├── skills.ts
│   │   ├── education.ts
│   │   ├── ctf-writeups/
│   │   │   ├── htb-machine-x.mdx
│   │   │   └── ...
│   │   └── index.ts            # Barrel exports
│   ├── lib/
│   │   ├── device.ts           # Capability detection
│   │   ├── obfuscate.ts        # Email anti-scrape
│   │   └── analytics.ts        # No-op or privacy-light (defer; out of scope v1)
│   └── styles/
│       └── globals.css         # Tailwind directives + terminal palette tokens
├── vite.config.ts              # base: '/Portfolio_Website/', plugins: [react(), mdx()]
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .github/workflows/deploy.yml # Build + deploy to gh-pages branch / Pages action
```

### Structure Rationale

- **`shells/` separation is the load-bearing decision.** Vite's tree-shaker drops anything `<TextShell />` doesn't import. R3F + three + drei + the GLTF is roughly ~300 KB gzipped — the text path must not pay that cost. Lazy-loading `<ThreeDShell />` via `React.lazy` is what makes the recruiter <5s contract achievable.
- **`scene/` is composed, not monolithic.** One file per scene part means: GLTFs can be swapped in pieces; materials are colocated with the mesh that uses them; `gltfjsx` output drops in cleanly; test/storybook later is feasible. A 600-line `<Scene>` god-component is the single most common R3F pitfall.
- **`ui/` is shared.** A `<ProjectCard />` rendered by drei `<Html>` inside a 3D monitor and a `<ProjectCard />` rendered as a list item in `<TextShell />` are the **same component**. This is why we don't fork content/styles between shells.
- **`content/` is `.ts` not JSON.** TS gives autocompletion, refactor safety, and lets us co-locate small helper functions (e.g., a `formatDateRange()`) — for a solo maintainer this is the lowest-friction option. CTF write-ups that have prose-heavy bodies use MDX (one file per write-up); short metadata stays in `ctfs.ts`. This is the "data + MDX for long-form" hybrid.
- **`public/assets/` not `src/assets/`.** Vite hashes and inlines anything in `src/`, which we don't want for large GLTFs (we want stable URLs cacheable by the browser, and we want them served as-is). `public/` is copied verbatim, respecting our `base` path.

---

## Architectural Patterns

### Pattern 1: Shell Selection at the App Boundary

**What:** `<App />` runs a synchronous capability check, then mounts exactly one shell. The 3D shell is `React.lazy()` — its bundle is fetched only when chosen.

**When to use:** Any time you need a hard, mutually-exclusive split between two render paths with very different cost profiles. This is our case: the text shell must ship in the initial bundle so recruiters get content immediately; the 3D shell must NOT.

**Trade-offs:**
- (+) Clean: each shell is its own world, no `if (is3D)` sprinkled across components.
- (+) Bundle math is obvious: open the network tab and you see only `text-shell.js` for the text path.
- (–) Two shells means two layouts to maintain. Mitigated by sharing `ui/` components and `content/`.

**Example:**

```tsx
// src/App.tsx
import { lazy, Suspense, useState } from 'react';
import { detectCapability } from './lib/device';
import TextShell from './shells/TextShell';
const ThreeDShell = lazy(() => import('./shells/ThreeDShell'));

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get('view'); // 'text' | '3d' | null
  const [view] = useState<'text' | '3d'>(() => {
    if (forced === 'text') return 'text';
    if (forced === '3d') return '3d';
    return detectCapability().shouldUse3D ? '3d' : 'text';
  });

  if (view === 'text') return <TextShell />;
  return (
    <Suspense fallback={<TextShell skeleton />}>
      <ThreeDShell />
    </Suspense>
  );
}
```

The Suspense fallback is the text shell itself (in skeleton mode) — so even during the 3D bundle download, the recruiter sees real content.

### Pattern 2: Composed Scene with Single GLTF Source

**What:** Each room element is a small React component. They all read meshes from one Draco-compressed `workstation.glb` (loaded once, shared via R3F's `useGLTF` cache).

**When to use:** Scenes where parts conceptually belong together but you want compositional reuse, named-mesh access, and the ability to attach interactivity per-piece (e.g., per-monitor click handlers). This is the standard R3F pattern.

**Trade-offs:**
- (+) One HTTP fetch for the whole room. Browser caches it.
- (+) `gltfjsx --transform` produces typed JSX you drop into each component file.
- (–) If you later need to swap one prop (say, replace the lamp), you re-export the whole GLTF. For a portfolio, that's fine.

**Example:**

```tsx
// src/scene/Monitor.tsx
import { useGLTF } from '@react-three/drei';
import { MonitorScreen } from './MonitorScreen';

export function Monitor({ id, position, content }: MonitorProps) {
  const { nodes, materials } = useGLTF('/Portfolio_Website/assets/models/workstation.glb');
  return (
    <group position={position} onClick={() => focusMonitor(id)}>
      <mesh geometry={nodes[`Monitor_${id}_Body`].geometry} material={materials.PlasticBlack} />
      <MonitorScreen monitorId={id} content={content} />
    </group>
  );
}
```

### Pattern 3: Monitor Screens via drei `<Html transform occlude>`

**What:** Content on a monitor's screen plane is rendered with drei's `<Html>` component in `transform` mode (so it follows the monitor's rotation/scale) with `occlude="blending"` (so 3D objects in front of it actually hide it).

**When to use:** When the content needs to be real, accessible HTML — selectable text, links, scrolling, copy-to-clipboard, anchor navigation — AND it must look like it lives on the monitor (rotates with it, gets occluded by the desk lamp swinging in front). This matches our requirements exactly: CV/projects/CTFs need to be read.

**Trade-offs and concrete decision:**

| Approach | Verdict | Why |
|----------|---------|-----|
| **drei `<Html transform occlude>`** (CHOSEN) | Real DOM means real selectable text, real links, full Tailwind. `transform` + `occlude` give it 3D presence. | Accessibility, SEO of the text rendered there, dead-simple to author. |
| CSS3DRenderer | Skip. | Heavier integration, no occlusion against WebGL geometry without manual effort, redundant given drei `<Html>` covers the same ground. |
| Render-to-texture (HTML on a canvas → texture) | Skip. | Loses selectable text, links, scroll. Visually nice but breaks the "recruiter copies email from the 3D scene" use case. Useful only if we wanted post-processing effects (CRT scanlines) — and those we'll do with a shader pass instead. |
| 2D modal that opens on monitor click | Skip as the *primary* mechanism. Fine as a supplemental "fullscreen this section" affordance. | Defeats the immersion the 3D scene is supposed to sell. |

Caveats from drei docs to plan around:
- `occlude="blending"` only correctly occludes rectangular HTML by default; pass a `geometry` prop matching the monitor's screen plane shape.
- `transform` mode can render slightly blurry on some devices — mitigation is the documented "scale parent down 0.5x, scale children up 2x" trick.
- Pointer events work, but z-index battles between multiple `<Html>` instances are real. We have only ~3 monitors so it's tractable.

**Example:**

```tsx
// src/scene/MonitorScreen.tsx
import { Html } from '@react-three/drei';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { ProjectsView } from '../ui/ProjectsView';

export function MonitorScreen({ monitorId, content }: Props) {
  return (
    <Html
      transform
      occlude="blending"
      distanceFactor={0.7}
      position={[0, 0, 0.01]}        // a hair in front of the screen mesh
      rotation={[0, 0, 0]}
      style={{ width: 800, height: 500 }}
      className="font-mono text-green-400 bg-black"
    >
      {monitorId === 'main' && <TerminalPrompt />}
      {monitorId === 'projects' && <ProjectsView />}
      {monitorId === 'ctfs' && <CTFsView />}
    </Html>
  );
}
```

### Pattern 4: Capability-Gated Default View

**What:** First-time visitor without `?view=` gets routed by `detectCapability()`. Mobile, no WebGL2, `prefers-reduced-motion`, or low device memory → text shell. Otherwise → 3D shell. There is always a visible toggle ("View as text" / "Enter the workstation") in both shells.

**When to use:** When the heavyweight experience is a feature, not a requirement, and the site has a real audience that might not want it. This is exactly our case (recruiter skim vs hiring manager engagement).

**Trade-offs:**
- (+) No "blank canvas" or "loading bar of doom" experience for the wrong device.
- (+) Power user can still force `?view=3d` on their phone.
- (–) Heuristic is imperfect. Mitigated by the always-visible toggle.

### Pattern 5: Content as Typed Data + MDX for Prose

**What:** Short, structured content (project metadata, cert list, skills) lives in `.ts` files as typed arrays. Long-form CTF write-ups live in `.mdx` files imported by `ctfs.ts`.

**When to use:** Solo maintainer who wants to update content without restarting their architecture brain. TS gives type-safety; MDX gives ergonomic prose with embedded React for code blocks/screenshots.

**Why not pure MDX everywhere:** Authoring a list of certifications as a markdown table is annoying; authoring it as a typed array of objects is trivial.

**Why not Contentlayer/Velite:** Contentlayer is archived (no longer maintained as of 2024). Velite works but is overkill for ~10 pieces of content owned by one person. For v1, Vite's built-in `@mdx-js/rollup` plugin is enough. Revisit if content grows past ~30 entries.

**Example:**

```ts
// src/content/projects.ts
export type Project = {
  id: string;
  title: string;
  summary: string;
  stack: string[];
  github?: string;
  live?: string;
  date: string; // ISO
};

export const projects: Project[] = [
  {
    id: 'homelab',
    title: 'Home Lab — pfSense / Suricata / ELK',
    summary: 'Routed traffic through Suricata IDS, shipped alerts to Elastic, dashboards in Kibana.',
    stack: ['pfSense', 'Suricata', 'Elastic Stack'],
    github: 'https://github.com/eren-atalay/homelab',
    date: '2025-09-01',
  },
  // ...
];
```

---

## Data Flow

### Content Flow (one direction, both shells)

```
src/content/*.ts
        |
        | static import (no fetch, no async)
        v
+----------------+         +-------------------+
| TextShell      |         | ThreeDShell       |
| reads content  |         | reads content     |
| renders HTML   |         | passes to <Html>  |
+----------------+         +-------------------+
                                    |
                                    v
                          drei <Html> on monitor
                                    |
                                    v
                          DOM (selectable, linkable)
```

There is no fetch, no API, no client-side state for content. Content changes require a rebuild — which is correct because GitHub Pages is static.

### Interaction Flow (3D shell)

```
User drag                        User click monitor
   |                                    |
   v                                    v
OrbitControls (clamped)        <Monitor onClick>
   |                                    |
   v                                    v
camera moves                     focusMonitor(id) hook
                                        |
                                        v
                              animates camera to preset pose
                                        |
                                        v
                              updates url ?focus=projects
                                        |
                                        v
                              <MonitorScreen> already showing content;
                              optional: zoom-in animation toggles a
                              "fullscreen" class on the <Html>
```

Deep links: `?view=3d&focus=projects` directly opens the 3D shell with the camera animating to the projects monitor on mount. This is how a recruiter shares a link to a specific section.

### State Surfaces

| State | Owner | Lifetime |
|-------|-------|----------|
| `view` (text vs 3d) | `<App />` (URL-derived, set once) | Page lifetime |
| `focus` (which monitor camera is aimed at) | `<ThreeDShell />` (URL-synced via `history.replaceState`) | Page lifetime |
| `loadingProgress` | drei `useProgress()` | Until GLTF loads |
| `perfTier` | drei `<PerformanceMonitor>` | Continuous, drives effect quality |

No Redux, no Zustand, no React Query for v1. The state surface is small enough that React's built-ins handle it.

---

## Routing & Deep Links — Concrete Recommendation

**Don't use React Router.** For this site:

- The "pages" of the site (Projects, CTFs, etc.) are **monitors in a 3D scene**, not separate documents.
- React Router on GitHub Pages requires either HashRouter (ugly URLs: `/#/projects`) or a 404.html SPA-fallback hack — and we still get only one HTML document, so the SEO benefit is zero.
- The 2D fallback is a single long-scroll page with anchor sections — that's idiomatic for portfolio CVs.

**Use:** A single `index.html`, a single React mount, and **query params** as the routing surface:

- `?view=text` — force text shell
- `?view=3d` — force 3D shell
- `?focus=projects|ctfs|cv|contact` — 3D camera focus, or anchor-scroll target in text shell

Rationale:
1. One HTML doc → recruiters and crawlers always land on something with content (the text shell renders synchronously with first JS).
2. Query params survive GitHub Pages with no hacks.
3. Deep links work in both shells (`?view=text&focus=projects` scrolls to `#projects`; `?view=3d&focus=projects` animates the camera).

For SEO, render the text shell's content into `index.html` at build time via a tiny pre-render script (or just accept that the bundled JS is small enough that crawlers will execute it; modern Googlebot does). Ship a real `<title>`, meta description, OG tags, and `application/ld+json` Person schema in `index.html`.

---

## 3D vs 2D Fallback — The Load-Bearing Decision

Three options were considered. The recommendation is **(a) same React tree, conditional shell mounting**, with a strong refinement.

### Option A — Same tree, conditional shell ✅ CHOSEN

`<App />` mounts either `<TextShell />` or `<ThreeDShell />`. The 3D shell is `React.lazy`-loaded so its bundle is not on the recruiter's critical path.

- **SEO:** One canonical URL. `<TextShell />` content can be SSG-pre-rendered into `index.html` at build (Vite + a tiny pre-render plugin), or just rely on JS-rendered SEO (acceptable for a personal portfolio).
- **Performance:** Text path ships React + Tailwind + content (~50–80 KB gz). 3D path additionally ships R3F + drei + three (~280–320 KB gz) + GLTF (target <2 MB). Recruiter on the text path never pays for the 3D path.
- **Maintenance:** Single repo, single build, single deploy. Shared `ui/` and `content/`.
- **Verdict:** Best for our solo-maintained, GitHub-Pages, recruiter-tolerance-<5s constraints.

### Option B — Two routes (`/` for 3D, `/text` for 2D) ❌

- Loses: under GitHub Pages, route fallbacks require either HashRouter or the 404.html copy hack.
- Gains: cleaner URLs to share. But query param `?view=text` is functionally equivalent.
- Verdict: All cost, no benefit for our constraints.

### Option C — Two builds entirely ❌

- Loses: doubles deploy complexity, doubles content drift risk, requires either two GH Pages sites or a build-time merge step.
- Gains: minor — each build is slightly smaller than the lazy-split approach.
- Verdict: The lazy-split in Option A already achieves the bundle isolation that justified Option C, without the maintenance cost. Skip.

### How "fast" is the text shell?

Targets (broadband, mid-range laptop, fresh cache):
- **Time to first byte:** GitHub Pages CDN, ~100ms.
- **Time to first paint:** <800ms (HTML + critical CSS + initial React mount).
- **Time to interactive (text shell):** <1.5s.
- **Recruiter sees CV summary, contact, GitHub/LinkedIn:** under the 5s contract. Comfortably.

3D shell targets:
- **Time to interactive (camera responsive):** <4s on broadband, <8s on slow 4G.
- **Frame rate:** 60fps target on mid-range laptop with PerformanceMonitor regression to 30fps + reduced effects on weaker devices.
- **First meaningful paint of scene:** <2.5s (loading screen visible from <1s).

---

## Asset Pipeline

```
Blender / source assets
        |
        | export GLTF
        v
gltf-pipeline + Draco compression
        |
        | gltfjsx --transform (also: webp textures, draco, dedupe, prune)
        v
public/assets/models/workstation.glb       <-- ONE file, target <2 MB
public/assets/textures/*.webp              <-- 1024px max, SRGB
        |
        v
useGLTF('/Portfolio_Website/assets/models/workstation.glb')
        |
        | cached by R3F across all components
        v
<Suspense fallback={<Loader/>}> wraps the scene
```

### Loading strategy

- **One Suspense boundary** at the top of the scene. drei's `<Loader>` reads `useProgress` and shows a terminal-styled progress bar (matches our aesthetic, doubles as content).
- **Don't lazy-load by section.** Splitting the GLTF would mean multiple HTTP fetches for what is conceptually one room; the room is small enough (target <2 MB) that one fetch wins.
- **Do lazy-load the `<ThreeDShell />` JS.** That's a separate chunk via `React.lazy`.
- **Texture format:** WebP with KTX2/Basis as a possible upgrade if we hit the budget.

### Performance budgets (concrete numbers)

| Asset | Budget | Hard ceiling |
|-------|--------|--------------|
| Initial HTML + critical CSS | 8 KB | 15 KB |
| Text shell JS (initial) | 80 KB gz | 120 KB gz |
| 3D shell JS (lazy chunk) | 320 KB gz | 450 KB gz |
| Workstation GLTF (Draco + WebP) | 1.5 MB | 2.5 MB |
| Total page weight on 3D path | ~2.0 MB | 3.5 MB |
| Total page weight on text path | <200 KB | 350 KB |
| Draw calls | <100 | 250 |
| Time to interactive (text) | <1.5s broadband | 3s slow 4G |
| Time to interactive (3D) | <4s broadband | 10s slow 4G |
| Frame rate (mid laptop) | 60 fps | 30 fps under regression |

These are budgets, not estimates. Enforce via Vite's `build.rollupOptions.output.manualChunks` and a CI size check (e.g., `size-limit`) once budgets matter.

---

## Build Order (One Month, Solo) — Justified

The principle: **something demoable in week 1; the riskiest 3D work in the middle weeks; polish last.** This order is shaped by two real constraints — the recruiter <5s contract has to be live early so the project is shippable at any moment, and the 3D work has the most unknowns so it gets the most slack.

### Phase 1 — Static skeleton + 2D fallback first (Week 1)

What ships:
- Vite + React + TS + Tailwind project scaffolded.
- `src/content/*` populated with real CV data.
- `<TextShell />` fully functional: terminal-styled CV, projects list, CTFs list, certs, skills, contact (obfuscated email + GitHub + LinkedIn).
- GitHub Pages deploy workflow. Site is live at `eren-atalay.github.io/Portfolio_Website/`.
- 404.html fallback in place. `vite.config` `base` set.

**Why first:** If the project gets dropped at end of week 1, Eren still has a live, recruiter-grade portfolio. This single property is what justifies the entire ordering.

### Phase 2 — 3D scene shell (Week 2)

What ships:
- `<ThreeDShell />` lazy-loaded from `<App />` based on capability check + `?view=`.
- A placeholder GLTF (a desk + 3 monitors, no detailed materials) loaded with Suspense and `<Loader>`.
- OrbitControls (clamped) for free-look. Camera focus animation skeleton.
- Empty monitor screens (just emissive material, no `<Html>`).
- View toggle DOM overlay.

**Why second:** Validates the whole pipeline (asset load, capability gating, lazy chunk, deploy, performance budget) before we pour content into it. If R3F + GH Pages has a gotcha (it doesn't, but if), we discover it now with a placeholder, not three weeks in with finished content.

### Phase 3 — Content integration into the 3D scene (Week 3)

What ships:
- drei `<Html transform occlude>` bindings on each monitor reading from `src/content`.
- Animated `whoami` terminal prompt on the main monitor.
- Per-monitor click → camera focus animation → fullscreen-able content.
- MDX pipeline for CTF write-ups; render inside the scene.
- Deep-link support (`?focus=projects`).

**Why third:** Components in `ui/` are now mature (built and shipped in Phase 1 inside `<TextShell />`), so we are reusing them, not authoring them. This is the highest-leverage week.

### Phase 4 — Polish, real model, deploy (Week 4)

What ships:
- Real workstation GLTF (Blender-built or sourced + customized) replaces the placeholder.
- Lighting pass (point light from monitors, lamp, rim light).
- Optional postprocessing (CRT scanlines, bloom on monitor emissives) — gated by `<PerformanceMonitor>`.
- Performance regression: lower DPR / disable effects on weak devices.
- Sound off by default; one tasteful keyboard tap on click? (decide; if scoped in.)
- Mobile pass: confirm text shell on mobile is excellent; confirm 3D path is gracefully refused or capped.
- SEO: meta tags, OG image, JSON-LD Person schema, sitemap.
- Final size pass: hit the budgets, run Lighthouse.

**Why last:** Polish work that's obvious to do, low-risk, but absorbs unbounded time if started early. Quarantining it to week 4 forces shipment.

### Build-order anti-patterns (do not do these)

| Anti-pattern | Why it kills the project |
|--------------|--------------------------|
| "Build the perfect 3D scene first, then add content" | You miss the recruiter contract entirely. The site sits on `localhost` for three weeks. |
| "Build a generic 3D portfolio, then theme it cyber later" | The cyber/terminal aesthetic IS the value prop. Build it in from `<TextShell />` Phase 1; the 3D scene inherits the language. |
| "Defer the deploy pipeline" | GH Pages quirks (base path, 404.html) WILL bite at the worst possible moment. Lock it in week 1, redeploy continuously. |
| "Big-bang content migration in week 4" | Content schema changes ripple through every component. Lock content shapes in week 1. |

---

## GitHub Pages Constraints — Concrete Handling

| Constraint | Handling |
|------------|----------|
| Deploys to `username.github.io/Portfolio_Website/` (subpath) | `vite.config.ts` `base: '/Portfolio_Website/'`; all asset URLs use `import.meta.env.BASE_URL` or relative paths. |
| Static files only, no SSR | We embrace it. No SSR features used. SEO via static `index.html` meta + optional Vite SSG pre-render of text shell. |
| No server-side route fallback | `public/404.html` is a copy of `index.html`. Any unknown URL serves the SPA, which then reads `?view=` / `?focus=`. |
| No HTTP headers config (no `Cache-Control` tuning) | Don't rely on it. Vite already hashes asset filenames; default GH Pages caching is acceptable for our scale. |
| Custom 404 not on the same path on user-pages vs project-pages | We deploy as a project page (`/Portfolio_Website/`). 404.html in `public/` lands at the project root. Verified pattern. |
| HTTPS only by default | Fine. No mixed-content concerns. |

Deploy workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: cp dist/index.html dist/404.html   # SPA fallback
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```

(Use the official `actions/deploy-pages` flow rather than the older `peaceiris/gh-pages` action — it's GitHub's recommended path now and avoids managing a separate `gh-pages` branch.)

---

## Scaling Considerations

For a personal portfolio, "scaling" means asset weight and code complexity, not user count.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| v1 (today, ~10 projects, 1 maintainer) | Current architecture as described. `.ts` content + occasional MDX. |
| Content grows past ~30 entries / Eren wants in-browser editing | Add Velite or netlify-cms-style editor; still static-deploy. |
| Multiple roles / blog / readership | Migrate to Astro or Next-on-Pages for SSG with route-based code splitting. The shell pattern transfers cleanly. |
| Custom domain | Drop `base` from `vite.config`. CNAME file in `public/`. No code rewrite needed. |
| Analytics required | Add Plausible (privacy-light, no cookies) — fits constraint. Defer beyond v1. |

Realistic first bottleneck: **GLTF size**. If the model creeps past 3 MB, the recruiter's 3D-path TTI degrades fast. Mitigations in priority order: more aggressive Draco compression → texture downsize to 512 → split off the bookshelf as a lazy chunk on close-up zoom.

---

## Anti-Patterns

### Anti-Pattern 1: God-Canvas

**What people do:** One file, `<Scene>`, 600+ lines, everything inside.

**Why it's wrong:** Unreadable; no piece can be reused; every change risks the whole scene; refactoring later means rewriting from scratch.

**Do this instead:** Compose the scene from small per-element files (`Desk.tsx`, `Monitor.tsx`, etc.). Use `gltfjsx --transform` to generate skeletons.

### Anti-Pattern 2: Forking Content Between Shells

**What people do:** Hardcode the CV in `<TextShell />` and *also* hardcode it inside the 3D monitor's `<Html>` content. Six months later, only one of them is up to date.

**Why it's wrong:** Two sources of truth → guaranteed drift. Recruiter sees stale info on whichever shell they happen to land on.

**Do this instead:** All content lives in `src/content/*`. Both shells import. Both render via shared `ui/*` components.

### Anti-Pattern 3: Loading the 3D Bundle on the Text Path

**What people do:** Import R3F at the top of `<App />` "for convenience." Vite ships it in the initial chunk. Recruiter on a phone downloads 300 KB they will never need.

**Why it's wrong:** Defeats the entire fallback rationale. The <5s recruiter contract becomes impossible.

**Do this instead:** `<ThreeDShell />` is `React.lazy()`. Verify with `vite-bundle-visualizer` after every meaningful change.

### Anti-Pattern 4: Render-to-Texture for Monitor Content

**What people do:** Render the CV into an offscreen canvas, use it as a texture on the monitor mesh.

**Why it's wrong:** The text isn't selectable. Links don't work. Crawlers can't read it. The "user copies email from the 3D scene" path is broken.

**Do this instead:** drei `<Html transform occlude>`. Real DOM, real text, real links. Visual fidelity loss is negligible if you nail the styling (monospace + scanlines via shader on the screen mesh underneath the `<Html>`).

### Anti-Pattern 5: HashRouter "because GitHub Pages"

**What people do:** Reach for `<HashRouter>` reflexively to avoid 404s.

**Why it's wrong:** Ugly URLs (`/#/projects`), worse SEO than even query params, and unnecessary. Our routing surface is tiny — query params plus an `id`-anchor scroll cover everything.

**Do this instead:** `?view=` and `?focus=`. 404.html copy of index.html. Done.

### Anti-Pattern 6: Skipping the Capability Check, Hoping Mobile Will "Just Work"

**What people do:** Mount the 3D scene on every device. Hope.

**Why it's wrong:** A janky scene at 8 fps on a $200 Android is the worst possible first impression — worse than no scene at all.

**Do this instead:** `detectCapability()` defaults mobile, low-memory, no-WebGL2, and `prefers-reduced-motion` users to text. Always-visible toggle for power users.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub Pages (hosting) | Static deploy via Pages action | Subpath `/Portfolio_Website/`; 404.html fallback |
| Email contact | Obfuscated `mailto:` link, optionally a static form-handler (Formspree, Web3Forms) — out of scope v1 | v1: obfuscated mailto only |
| GitHub (project repos) | External `<a target="_blank" rel="noopener">` links | No GitHub API at runtime |
| LinkedIn | External link | Same as above |
| Plausible / Umami | Out of scope v1 (privacy constraint) | Re-evaluate later |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `<App />` ↔ shells | Direct mount based on URL/capability | One-way; shells don't talk to App |
| `<TextShell />` / `<ThreeDShell />` ↔ `src/content/*` | Static imports only | No runtime fetching |
| `<ThreeDShell />` ↔ `<MonitorScreen />` | Props (content slice + focus state) | drei `<Html>` is the DOM portal |
| `src/scene/*` ↔ `src/ui/*` | `<MonitorScreen>` imports `ui/*` components | Same components used by text shell |
| Capability detection ↔ `<App />` | Synchronous on mount, never re-runs | Toggle is the user-controlled override |

---

## Sources

- [React Three Fiber — Examples](https://r3f.docs.pmnd.rs/getting-started/examples)
- [React Three Fiber — Scaling Performance (official)](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- [React Three Fiber — Hooks (Suspense / useLoader / useProgress)](https://r3f.docs.pmnd.rs/api/hooks)
- [drei — Html component (transform / occlude / blending)](https://drei.docs.pmnd.rs/misc/html)
- [drei Html — real occlusion discussion (issue #1129)](https://github.com/pmndrs/drei/issues/1129)
- [Combining WebGLRenderer & CSS3DRenderer — R3F discussion #820](https://github.com/pmndrs/react-three-fiber/discussions/820)
- [pmndrs/gltfjsx — GLTF → JSX with --transform compression](https://github.com/pmndrs/gltfjsx)
- [gltf.pmnd.rs — interactive GLTF → R3F converter](https://gltf.pmnd.rs/)
- [pmndrs/react-three-a11y — accessibility primitives for R3F](https://github.com/pmndrs/react-three-a11y)
- [R3F fallback canvas content discussion (issue #1326)](https://github.com/pmndrs/react-three-fiber/issues/1326)
- [Vite + GH Pages SPA 404 handling — DEV community walkthrough](https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p)
- [vite-plugin-github-pages-spa](https://github.com/sctg-development/vite-plugin-github-pages-spa)
- [Varun Vachhar — Modular WebGL with R3F (scene composition patterns)](https://varun.ca/modular-webgl/)
- [14islands/r3f-scroll-rig — keeping Canvas outside the router](https://github.com/14islands/r3f-scroll-rig)
- [MDX — official docs (content authoring)](https://mdxjs.com/)
- [Wawa Sensei — R3F loading screen pattern](https://wawasensei.dev/courses/react-three-fiber/lessons/loading-screen)

---
*Architecture research for: 3D portfolio website (R3F + Tailwind, GitHub Pages, solo maintainer)*
*Researched: 2026-05-06*
