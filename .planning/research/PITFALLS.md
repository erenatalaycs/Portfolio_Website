# Pitfalls Research

**Domain:** 3D hacker-workstation cybersecurity portfolio (React + R3F + Tailwind + GitHub Pages, solo junior dev, ~1 month)
**Researched:** 2026-05-06
**Confidence:** HIGH for R3F/Three.js technical pitfalls (Context7-class sources, official R3F docs); HIGH for GitHub Pages deployment (multiple confirming sources); MEDIUM for cyber-portfolio cliché traps (junior-dev advice is well-documented; cyber-specific advice mostly inferred from general OPSEC + recruiter sources)

This research is **specific to the combination**: a junior cybersecurity analyst, with a 1-month solo timeline, building a fully 3D hacker-workstation site on a static-only host (GitHub Pages), where the audience is split 50/50 between recruiters who skim and hiring managers who explore. Generic 3D-web advice has been filtered out unless it directly hits this combo.

---

## Critical Pitfalls

These are the ones that most plausibly sink the project (visitor leaves, recruiter never sees CV, site crashes on the device a hiring manager actually uses, or career-damage from OPSEC slips).

### Pitfall 1: Recruiter cannot find CV/contact in 30 seconds because 3D scene gates everything

**What goes wrong:**
Recruiter opens the site, sees a loading bar (or worse, a blank canvas), waits 4–8 seconds, then has to figure out that the "right monitor" is the CV. Closes the tab. Eren is filtered out before the portfolio is read.

**Why it happens:**
The aesthetic temptation is to make the 3D the front door — load the scene, then everything is "in" the scene. PROJECT.md already names this risk ("recruiter audience won't tolerate a slow 3D load") but the trap is subtle: even if the 2D fallback is built, it's easy to ship a default flow where the visitor must opt out of the 3D, see the loader, and only then get redirected. The fallback ends up "available" but not "immediate."

**How to avoid:**
- Above-the-fold-in-DOM rule: the CV link, contact email, GitHub link, and LinkedIn link must exist as plain HTML/Tailwind text in the document at first paint, before any R3F code runs. They can be visually placed inside the "monitor frame" decoratively, but they're real `<a>` tags that exist before Canvas mounts.
- Have a `?cv` or `/cv` route (hash-based for GitHub Pages, see Pitfall 12) that bypasses Canvas entirely and renders just the 2D fallback. Link to this from your CV PDF and email signature.
- Time-budget the 3D path: if scene is not ready in N seconds (e.g. 4s on slow connection), auto-show the 2D fallback layer over the loader. Don't hide it behind an "I'm bored" button.
- Test on a throttled "Slow 4G" Chrome profile before each milestone, not just localhost.

**Warning signs:**
- The 2D fallback only renders if you click a button
- Lighthouse Largest Contentful Paint > 2.5s
- The CV PDF is fetched from inside Canvas/Suspense rather than linked as plain `<a href>`
- Your tab's `<title>` is generic ("Portfolio") instead of "Eren Atalay — CV / Cybersecurity"

**Phase to address:**
Phase 1 (foundation/scaffolding) — set the rule before any 3D code is written. Verify in Phase 4+ (deployment / pre-launch).

---

### Pitfall 2: setState in useFrame, or scene-rebuilding state updates

**What goes wrong:**
Animation jank, sustained 100% CPU, fan-screaming laptops, occasional Safari crash. Looks fine on the dev machine, awful on the recruiter's 4-year-old MacBook.

**Why it happens:**
It feels natural in React: "I want the camera to lerp toward the monitor when the user clicks, so I'll setState the target and let useFrame react to it." Or: "I'll store rotation in useState and update it 60fps." The official R3F docs explicitly say *"never setState inside useFrame"* — but every tutorial explains state in chapter one and refs in chapter five, so juniors miss the warning.

There's a second, sneakier version: putting derived data in component state higher up (e.g. `selectedMonitor`) such that switching it remounts a chunk of the scene graph, triggering material re-compilation and texture re-uploads. That single click can stutter the page for 200ms because Three.js had to rebuild geometries.

**How to avoid:**
- **Hard rule:** `useFrame` may only mutate refs (`mesh.current.position.x = …`) or call methods on Three.js objects. It must not call `setState`, `useState` setters, or Zustand setters.
- For "occasional updates" (which monitor is focused, terminal text, theme), state is fine — but the components consuming that state should be leaf components; `useState` should not live above the `<Canvas>` if its change re-renders the whole scene.
- Use Zustand with selector subscriptions for cross-component reactive data (so only consumers re-render).
- Memoize geometries and materials: `useMemo(() => new THREE.BoxGeometry(...), [])`, share materials across instances. The R3F docs are explicit: every material/light entered into the scene has to compile.
- Add a dev-only FPS counter (Drei's `<Stats />` or `r3f-perf`) and *remove it from production* (Pitfall 13).

**Warning signs:**
- Profile shows React rendering 60×/s during scene idle
- Clicking a monitor causes a visible stall (>100ms) before camera moves
- `console.log` placed in a component body fires constantly during animation
- Memory grows when you click monitors back-and-forth (geometries not being GC'd)

**Phase to address:**
Phase 2 or 3 (3D scene implementation). Add a CI/dev rule (custom ESLint rule or comment-based) flagging `setState`/setter calls inside `useFrame`. Verify with profiler before Phase 4 deployment.

**Sources:** [R3F Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls), [R3F Hooks](https://r3f.docs.pmnd.rs/api/hooks), [3 R3F Mistakes — Wawa Sensei](https://wawasensei.dev/tuto/3-react-three-fiber-mistakes)

---

### Pitfall 3: Scene crashes / context-lost on mid-tier mobile, with no auto-fallback

**What goes wrong:**
Visitor on a 3-year-old Android or pre-M1 iPad gets a frozen/black canvas, "WebGL context lost" in console, sometimes a full Safari tab kill. They never see anything. PROJECT.md acknowledges "likely defaulting to 2D fallback" on mobile — the trap is that "likely" becomes "didn't get to it before launch."

**Why it happens:**
- iOS Safari has aggressive WebGL memory limits and will drop the context with very little warning.
- M1/M2 Macs and iPads can ironically be *worse* for some scenes because WebKit's heuristics differ.
- A scene that ran at 60fps on the dev machine can OOM on a 3GB RAM Android with 4 textures loaded.
- The dev forgets to handle `webglcontextlost` events at all, so when it fires the scene goes black with no recovery.

**How to avoid:**
- Detect mobile + low-power devices on first load and **default to 2D fallback** without even attempting Canvas. Use `navigator.userAgent` mobile heuristics + `navigator.deviceMemory < 4` + `navigator.hardwareConcurrency <= 4` as a triage. Offer an explicit "Try 3D anyway" button.
- Listen for `webglcontextlost` on the renderer and fall back to 2D when it fires. Don't try to hot-recover — for a portfolio, a clean swap to 2D is better than a half-restored scene.
- Cap pixel ratio: `<Canvas dpr={[1, 1.5]} />` instead of letting it default to retina (this alone halves GPU load on iPhones).
- Cap target FPS on mobile: `frameloop="demand"` for the workstation scene if nothing's animating, so it doesn't burn battery rendering identical frames.
- Test on at least one real iOS device and one mid-tier Android (BrowserStack or a friend's phone) before launch — emulators lie about WebGL.

**Warning signs:**
- Console shows "WebGL context lost" on any device
- Scene is fine for 30 seconds then goes black
- Site warms the device up noticeably (battery drain >2%/min)
- DevTools "CPU 4× slowdown" + "Slow 4G" still hits 60fps (your dev machine is hiding the problem)

**Phase to address:**
Phase 3 (scene polish) for capability detection; Phase 5 (pre-launch) for real-device QA. Cannot be deferred — this is the primary risk on the audience's actual hardware.

**Sources:** [Three.js context lost on iOS](https://discourse.threejs.org/t/how-to-fix-context-lost-android-iphone-ios/56829), [Three.js iOS 17 context lost](https://discourse.threejs.org/t/three-js-broken-on-ios-17-with-context-lost/58025), [WebGL context lost on M4 iPad](https://discourse.threejs.org/t/webgl-context-lost-on-m4-ipad-app-and-browsers/79845)

---

### Pitfall 4: 2D fallback becomes a second-class citizen with less content than 3D

**What goes wrong:**
The recruiter who lands in 2D mode sees a stripped-down version: maybe just a CV link and three project cards. The hiring manager who explores the 3D scene sees CTF write-ups, certifications, education timeline, contact form, GitHub pinned repos, etc. The recruiter — who is the gatekeeper — sees less and rejects on incomplete-looking content.

**Why it happens:**
2D fallback is built last, as a "minimum to satisfy the requirement." The dev mentally treats 3D as the "real" portfolio and 2D as the consolation prize. It shows.

**How to avoid:**
- **Content-source-of-truth principle:** all content (CV summary, projects, write-ups, certs, skills, education, contact) lives in plain markdown/MDX or JSON. The 3D scene and 2D fallback are *both* views over the same data. Neither view should be missing a section the other has.
- Build the 2D fallback **first** as the actual content layout (Phase 1–2). Then build 3D over it. This inverts the usual order and forces parity.
- Enumerate every content section as a checklist and verify both views render every item before launch.
- The 2D view should not be ugly. Apply the same terminal/monospace aesthetic. It's not "the boring version" — it's "the fast version."

**Warning signs:**
- A new content item is added in 3D (e.g. a new CTF write-up appears on a monitor) and the 2D view doesn't get it automatically
- The 2D fallback has no "Contact" CTA when 3D does
- The 2D view loads in 1s but looks unstyled or generic
- You catch yourself thinking "the 2D fallback is just for old phones, recruiters won't see it"

**Phase to address:**
Phase 1 — establish content-as-data architecture. Phase 2 — build 2D first. Verify content parity in Phase 5 pre-launch.

---

### Pitfall 5: OPSEC slip — leaking address, employer details, home-lab IPs, or live CTF flags

**What goes wrong:**
- A screenshot of a home-lab dashboard reveals `192.168.x.y` along with a router model and ISP-issued hostname.
- A CTF write-up screenshot shows the flag still on screen for a CTF that's still running.
- Image EXIF includes GPS coords from a phone-taken photo.
- A "current role" mention names the QA/Test Fin-On employer in a way that violates an NDA or just embarrasses a client.
- A CV PDF includes a home address (UK postcode), full DOB, or a personal phone.

**Why it happens:**
This is the *exact* domain Eren is applying to work in. A leak here is doubly damaging: it suggests he doesn't practise the field. And it's invisible from inside Eren's own browser — he sees the page as the author, not as a hostile reader running exiftool.

**How to avoid:**
- **Pre-publish OPSEC checklist** — gate every release behind it:
  - All screenshots stripped of EXIF (`exiftool -all= image.png` or build-time pipeline equivalent like `sharp` re-encoding without metadata)
  - All screenshots manually reviewed at full size for: visible IPs, hostnames, browser tab titles, password-manager popups, internal Slack/Teams snippets, file paths revealing real name folders (`/Users/erenatalay/...`)
  - CTF write-ups only published *after* the CTF event is closed and the platform allows write-ups (TryHackMe/HTB rules vary; some require waiting for the box to be retired)
  - Flags redacted from screenshots (black box, not blur — blur can be reversed)
  - No employer NDA-covered details in any project description
  - CV PDF strips: home address (use city/region), DOB, personal phone if not desired publicly
- Add a contact email obfuscation layer: don't ship `mailto:eren@…` as plain text in HTML — use a JS-rendered version, or use a contact form with a static handler (Formspree, Web3Forms) that never exposes the address in the source.
- Run a final "view-source + view-network + exiftool image dump" pass before launch.
- For UK-based job hunt: the email and city are reasonable to publish; the home address is not.

**Warning signs:**
- You don't have an EXIF-stripping step in your build/asset pipeline
- Screenshots in `/public/images/` were dragged in from desktop without inspection
- Your CV PDF has metadata showing "Author: Eren Atalay, Created: …, Modified by: …" with software/path traces
- You're unsure whether a CTF you're writing about is still live

**Phase to address:**
Phase 1 — establish asset pipeline + checklist. Every content phase — apply checklist. Phase 5 — final OPSEC audit before deploy.

**Sources:** [CTF metadata forensics](https://ctf101.org/forensics/what-is-metadata/), [OPSEC handbook](https://medium.com/@varppi/opsec-privacy-handbook-5e0a012c58f6), [OPSEC in OSINT](https://sosintel.co.uk/opsec-in-osint-protecting-yourself-while-investigating/)

---

### Pitfall 6: Cybersecurity-portfolio clichés that signal "I don't actually work in this field"

**What goes wrong:**
The site uses Matrix code rain, a glitchy "I'm in" screen, glowing green-on-black "ACCESS GRANTED" buttons, and a stick-figure hooded hacker silhouette. Real cyber hiring managers — many of whom mock these in private — register the site as "junior who consumed Mr Robot, not someone who's done the work."

**Why it happens:**
The aesthetic is fun and references the dev cares about (Mr Robot, etc.), and tutorials abound. The trap is that the audience the site is *trying to reach* is exactly the audience that has seen this 1000 times.

**How to avoid:**
- The terminal/monospace aesthetic is fine — that's the brief. The traps to avoid specifically:
  - **Matrix rain** — overdone. If included, treat as small ambient detail, never the hero.
  - **"Hacking in progress" fake animations** — implies you don't know what hacking actually looks like.
  - **Skill bars (e.g., "Burp Suite ▓▓▓▓░ 80%")** — universally derided in dev/cyber portfolio reviews. Replace with: "Used in: HTB box X, project Y" — concrete attestation.
  - **Hooded silhouette / Guy Fawkes mask imagery** — anonymous-aesthetic clichés that read as cosplay.
  - **Fake terminal that doesn't accept any input** — feels like a broken toy. If you build a terminal, accept at least a few real commands (`ls`, `cat about.md`, `whoami`, `help`) gracefully and reject unknown ones with `command not found: foo`. The animated `whoami` greeting in PROJECT.md is good — that's a constrained, controlled animation, not a fake REPL.
  - **Listing every tool you've opened** — see Pitfall 7.
- Show, don't decorate: a real screenshot of an actual `nmap` output you ran, with a paragraph of analysis, beats any aesthetic flourish.
- Run the design past one real cybersecurity professional (LinkedIn DM, university alum, mentor) before launch and ask "does this look junior or does it look fake-senior?"

**Warning signs:**
- You're using a green-screen "code rain" effect
- Your skills section has bars/percentages
- The terminal animation on the main monitor doesn't accept any input — and the visitor *can* try to click it
- You've used the word "cyberpunk" or "hacker man" in a code comment
- A non-cyber friend says "looks cool!" but you've never tested on a cyber person

**Phase to address:**
Phase 1 (aesthetic decisions, copy) — set anti-cliché rules upfront. Phase 4–5 — peer review.

**Sources:** [How to Present a Cybersecurity Portfolio](https://artempolynko.com/blog/how-to-present-cybersecurity-portfolio/), [Why skill percentage bars are bad](https://www.frontendmentor.io/articles/building-an-effective-frontend-developer-portfolio--7cE8BfMG_), [Cybersecurity portfolio guide](https://www.cybersecuritydistrict.com/a-step-by-step-guide-to-building-a-cybersecurity-portfolio/)

---

### Pitfall 7: Junior-authenticity traps — claiming/copying/listing things you can't defend in interview

**What goes wrong:**
- Lists "Burp Suite, Metasploit, Volatility, Wireshark, Splunk, ELK, IDA, Ghidra, Cobalt Strike" as skills when half are tools opened once.
- Reproduces a CTF write-up nearly verbatim from another author (or the official platform writeup) without attribution.
- Describes a CTF box solution as if from first-principles thinking when steps were copy-pasted from a YouTube walkthrough.
- Inflates a class project ("Performed pen test of …") into something that sounds like enterprise consulting.

In interview, the hiring manager asks "walk me through how you'd use Volatility to triage a memory dump" and the candidate freezes. Worse, in cyber the community is *small* — the original write-up author may be on the hiring panel.

**Why it happens:**
Junior portfolio templates encourage "list everything you know." Cybersecurity is huge, juniors feel the gap, and padding feels like the safest option. It's the worst option.

**How to avoid:**
- **Skills rule:** every tool listed must have a project/write-up/HTB box on the same site that uses it. If there's no concrete artefact, it doesn't go on the skills list.
- **Provenance rule:** every CTF write-up explicitly cites: the platform, the box/event name, the date solved, and any sources consulted (other write-ups, hints used, walkthroughs watched). It's not weakness to say "I got stuck on the privilege escalation step and consulted [link] for the technique" — it's professional honesty.
- **First-person verifiable detail:** include something only you would have — a screenshot timestamp from your own machine, a custom note you took mid-solve, a mistake you made and how you recovered. This makes plagiarism detection trivial and builds trust.
- **Junior framing:** don't dodge it. "Recent graduate, building toward SOC analyst / blue team. Currently working through HTB Academy + TryHackMe SOC L1 path." Concrete, junior-honest framing beats fake-senior.
- **Defendable depth:** for the top 3–5 skills you list, mentally rehearse the interview answer "What's the most complex thing you've done with X?" If you can't answer in 60 seconds, demote or remove the skill.

**Warning signs:**
- Your skills list has more than ~12 tools/technologies
- A project description has no first-person detail you could only know if you'd done it
- A CTF write-up has no "where I got stuck" or "what I tried first" — just a clean victorious narrative
- You can't immediately name 2 things that went wrong on each project

**Phase to address:**
Phase 1 — content/skills inventory. Every content phase — provenance rule. Phase 5 — peer review for authenticity.

**Sources:** [What cybersecurity recruiters look for](https://myturn.careers/blog/what-cybersecurity-recruiters-really-look-for-in-a-candidate/), [Junior cybersecurity resume guidance](https://www.beamjobs.com/resumes/entry-level-cyber-security-resume-examples), [HackTheBox resume examples](https://www.hackthebox.com/blog/cybersecurity-resume-examples)

---

### Pitfall 8: 3D scene captures touch/scroll on mobile and traps the user

**What goes wrong:**
Visitor on a phone tries to scroll the page; the Canvas eats the gesture and rotates the camera instead. They can't scroll past the 3D section. They leave.

**Why it happens:**
`OrbitControls` and most R3F drag handlers default to capturing pointer events on the entire Canvas. On desktop this is fine; on mobile, the same gesture (vertical drag) collides with page scroll.

**How to avoid:**
- On mobile breakpoints, **disable Canvas drag-to-look** entirely. Replace with discrete tap-to-focus interactions ("tap a monitor to read it") and a fixed camera path.
- If you want any drag on mobile, restrict it horizontally only (`enableRotate: true, enablePan: false`, lock vertical) so vertical scroll always wins.
- Use `touch-action: pan-y` CSS on the Canvas wrapper to give the browser a hint that vertical pans are scrolls, not 3D.
- Test on real phones: rotate phone, scroll, tap, pinch — every gesture must do something predictable or be ignored.

**Warning signs:**
- On a phone, you can't scroll past the hero section
- Pinch-to-zoom either does nothing or zooms the camera unexpectedly
- The page bounces back to the top when you try to swipe up

**Phase to address:**
Phase 3 (interaction/controls). Verify on real device in Phase 5.

---

### Pitfall 9: GitHub Pages base path + SPA routing breaks deep links

**What goes wrong:**
- Site loads at `https://username.github.io/portfolio/` — works.
- Recruiter shares `https://username.github.io/portfolio/projects/honeypot-lab` — 404.
- After fix: assets fail to load because the base path is wrong (`/assets/...` instead of `/portfolio/assets/...`).
- Build artifact (`dist/`) gets accidentally committed; pushes get bigger every deploy; CI pipeline confused about source vs. output.

**Why it happens:**
Vite defaults assume root-domain hosting. GitHub Pages serves from `/<repo>/` for project sites. SPAs need a 404.html shim or hash routing because GitHub Pages does no client-side routing fallback.

**How to avoid:**
- Set `base: '/<repo-name>/'` in `vite.config.js` (or use `import.meta.env.BASE_URL` everywhere asset paths are constructed). For a custom domain later, change to `/`.
- Use hash routing for v1 (`#/projects/foo`) — simpler than the 404.html shim and works without any GitHub Pages tricks. Trade-off: slightly less clean URLs. Worth it for a one-month timeline.
- If using `BrowserRouter`, ship a `404.html` that's an exact copy of `index.html` (or use a redirect script like the `spa-github-pages` pattern), and configure router `basename` to match the base path.
- `.gitignore` includes `dist/` and `build/`. Deploy via GitHub Actions (`actions/deploy-pages` or `peaceiris/actions-gh-pages`) building on the runner — never commit built output.
- All env-style values must be inlined at build time (Vite replaces them statically). Do not assume runtime config — there's no server. If you need a "secret" (e.g., Formspree endpoint), it's a public URL anyway, so put it in `.env` as `VITE_FORM_ENDPOINT` and ship it.

**Warning signs:**
- Deploy works locally with `vite preview` but breaks on `username.github.io/repo/`
- Hard-refresh on a sub-route 404s
- `dist/` directory shows up in `git status`
- Asset URLs in dev are `/foo.png` but production fetches `/repo/foo.png` and you discover this only after deploy
- Your "secret" Formspree key looks like it's leaking — it isn't a secret; the entire bundle is public

**Phase to address:**
Phase 1 — repo + Vite + hosting setup, decide router strategy. Phase 4 — first deploy + sub-route smoke test.

**Sources:** [GitHub Pages SPA 404 handling](https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p), [Resolving Vite GitHub Pages base path](https://medium.com/@aleksej.gudkov/resolving-vite-v5-4-2-build-404-error-e1f13914f2d7), [Vite GitHub Pages plugin](https://github.com/sctg-development/vite-plugin-github-pages-spa), [Vite static deploy guide](https://vite.dev/guide/static-deploy)

---

### Pitfall 10: 3D scene with no keyboard path, no reduced-motion handling, no alt-content

**What goes wrong:**
- Keyboard-only user (or screen-reader user) lands on the page and finds nothing navigable. Bounces.
- User with `prefers-reduced-motion: reduce` set (vestibular disorder, migraine, motion sickness) gets a swooping camera ride and feels physically ill.
- A recruiter's accessibility-audit tool flags 0 accessible content; some employers screen for this.

**Why it happens:**
Canvas content is opaque to the accessibility tree by default. Reduced-motion is in the spec but R3F has no built-in respect for it.

**How to avoid:**
- The 2D fallback is the accessibility path. Make it reachable via a visible "Skip 3D / View text version" link as the first focusable element on the page (visually hidden until focus, like a "Skip to content" link).
- Detect `prefers-reduced-motion: reduce` (`window.matchMedia('(prefers-reduced-motion: reduce)').matches`) and:
  - Disable auto-camera flythroughs
  - Replace lerped camera transitions with instant cuts (or short, opacity-only fades)
  - Pause ambient animations (terminal cursor blink is fine; floating particles are not)
- Keyboard interaction model: arrow keys cycle focus through monitors; Enter activates; Escape returns to wide view. Document this in a small "?" panel.
- Every monitor's content has a corresponding `<section>` in the 2D fallback with proper headings (`<h1>`–`<h3>`).
- Contrast: the terminal-green-on-black aesthetic *can* fail WCAG AA. Use a green that hits at least 4.5:1 on black — `#00ff41` is iconic but can be eye-strain; `#5eff5e` or `#7dff90` reads better and still feels terminal-correct. Test with WebAIM contrast checker.
- Camera movement: avoid sudden rotations >30°/s; cap velocity. Even non-reduced-motion users get nauseated by aggressive cameras.

**Warning signs:**
- Tabbing through the page hits nothing inside the Canvas
- Lighthouse Accessibility score < 90
- You don't have a `useReducedMotion` hook (or equivalent) anywhere
- Default green-on-black has contrast ratio < 4.5:1
- One real user has said "that camera move made me feel a bit sick"

**Phase to address:**
Phase 1 — pick contrast-safe palette, set up reduced-motion hook stub. Phase 3 — wire reduced-motion to camera + animation. Phase 5 — Lighthouse + manual screen-reader pass.

**Sources:** [prefers-reduced-motion (web.dev)](https://web.dev/articles/prefers-reduced-motion), [WCAG C39 reduced-motion](https://www.w3.org/WAI/WCAG21/Techniques/css/C39), [Motion accessibility (Motion.dev)](https://motion.dev/docs/react-accessibility)

---

## Moderate Pitfalls

### Pitfall 11: Loading UX — blank screen, jarring snap from nothing to scene

**What goes wrong:**
First paint is empty (or just a spinner). 4 seconds later, the full 3D scene snaps in. Visitor has no idea what's happening; bounce rate spikes during that window.

**How to avoid:**
- Render a static "concept art" SVG/CSS rendition of the workstation as the immediate first paint — looks like the scene, takes zero JS. The 3D scene fades in over the top when ready.
- Use `useProgress` from `@react-three/drei` for an actual progress percentage, not an indeterminate spinner. Progress visible = perceived speed up.
- Preload critical assets (`useGLTF.preload(...)`) at module top so they kick off before mount.
- Show real content immediately: the CV link/contact bar (per Pitfall 1) is text and present at first paint regardless of scene state.

**Phase:** Phase 3 — loading sequence as part of scene polish.

**Sources:** [R3F Suspense + useProgress patterns](https://r3f.docs.pmnd.rs/tutorials/loading-models), [Wawa Sensei loading screen](https://wawasensei.dev/courses/react-three-fiber/lessons/loading-screen)

---

### Pitfall 12: Drei `<Html>` overlays — z-fighting, click-through bugs, accidental layout reflow

**What goes wrong:**
HTML labels on monitor screens flicker (z-fighting) when camera moves; clicks on overlay buttons either don't fire or also fire raycaster events on the mesh behind; the `<Html>` element triggers layout reflow on the parent page.

**How to avoid:**
- Prefer rendering monitor *content* as Three.js textures (canvas textures, R3F `useFBO`, or pre-rendered images) rather than `<Html>` for anything that's part of the "in-world" experience. Use `<Html>` only for floating UI chrome (close button, breadcrumb, "press Esc").
- When using `<Html>`, set `transform` and `occlude` props deliberately and test with camera at extreme angles.
- Stop event propagation explicitly: `onClick={(e) => { e.stopPropagation(); ... }}` on UI overlays so the underlying mesh raycaster doesn't also fire.
- If you do put the CV/long-form text inside `<Html>`: be aware that scrolling inside it on mobile is a separate gesture problem (see Pitfall 8).

**Phase:** Phase 2–3 (monitor content rendering).

**Sources:** [Drei Html + pointer events issues](https://github.com/pmndrs/drei/issues/319), [R3F event propagation](https://r3f.docs.pmnd.rs/api/events)

---

### Pitfall 13: Stats panels, debug helpers, dev-only logging shipped to production

**What goes wrong:**
Visitor sees an FPS counter in the corner. Console has 50 `console.log` lines from your scene-debugging session. A `<axesHelper />` is still in the scene. A `<gridHelper />` floor is visible.

**How to avoid:**
- Wrap every `<Stats />`, `<Perf />`, `<axesHelper />`, `<gridHelper />`, `<OrbitControls makeDefault />` (debug version with no constraints), and dev-only `<Leva />` panel in `{import.meta.env.DEV && <... />}`.
- Pre-launch checklist: `grep -r "console.log\|<Stats\|<Perf\|axesHelper\|gridHelper\|Leva" src/` and verify each hit is gated by DEV.
- Vite drops `console.log` in production if you configure terser; even better, just don't ship them.

**Phase:** Phase 5 — pre-launch checklist enforced.

---

### Pitfall 14: Oversized GLB / uncompressed textures / no Draco or KTX2

**What goes wrong:**
The desk model is 18MB because it was exported direct from Blender with PBR textures at 4K. First load takes 12 seconds on home broadband, longer on phone tethering.

**How to avoid:**
- Run all GLB through `gltf-transform optimize` (Draco for geometry, KTX2/Basis for textures, dedup, prune, weld). Target: each GLB under 1MB, all assets combined under 5MB.
- Texture sizes: 1024×1024 max for hero objects, 512×512 for background props. 4K is for product visualisation, not a portfolio.
- Use a single combined texture atlas where possible to reduce draw calls.
- Audit with `lhci` / Lighthouse "Total Byte Weight."

**Trade-off note:** Combining Draco + KTX2 has known interop issues with some loader setups (see source). Test the compressed pipeline early; have a fallback to "Draco-only + WebP textures" if KTX2 misbehaves.

**Phase:** Phase 2 (asset pipeline setup).

**Sources:** [Three.js Draco + KTX2 forum](https://discourse.threejs.org/t/compression-draco-ktx2-example/31382), [gltf-transform optimization](https://www.axl-devhub.me/en/blog/optimizing-3d-models)

---

### Pitfall 15: Contact form / email is broken, obfuscated, or goes to spam

**What goes wrong:**
The interested hiring manager clicks "Contact" → form throws a JS error (Formspree key wrong). Or `mailto:` opens a desktop client they don't have. Or the email arrives in Gmail spam folder because it's from a static-form-handler service the recruiter's domain blocks.

**How to avoid:**
- Provide **two** contact paths: a contact form (Formspree / Web3Forms / Getform) **and** a visible (obfuscated) email + LinkedIn link. If form fails, email and LinkedIn still work.
- Test the form end-to-end after deploy by submitting a real test message; confirm it lands in inbox (not spam) on at least Gmail and Outlook.
- Don't gate contact behind a captcha if you can avoid it on a portfolio (small spam volume, friction is high). Use Formspree's built-in honeypot.
- Email obfuscation: use JS to assemble the address (`['eren', 'example.com'].join('@')`), or use a button that copies to clipboard, or use a standard image — but always pair with the form so there's a fallback if JS breaks.
- Ensure the form's "from" address (when the handler sends the notification) doesn't look suspicious — most handlers let you customise the reply-to so the recruiter can hit reply directly.

**Phase:** Phase 4 (contact + deploy). Verify in Phase 5.

---

### Pitfall 16: Maintenance bomb — stack the dev can't update in 6 months

**What goes wrong:**
6 months later, Eren wants to add a new project. `npm install` fails — minor versions of R3F and three.js drifted, build script doesn't run, TypeScript errors after a tooling bump. The fix takes a Saturday. He gives up.

**How to avoid:**
- Pin major + minor versions of `react`, `react-dom`, `three`, `@react-three/fiber`, `@react-three/drei`. `~` not `^`. The R3F + three.js + drei version trio is famous for drifting.
- Use `package-lock.json` (committed) and CI a lock-file-respecting `npm ci` build.
- Document setup in `README.md`: Node version (in `.nvmrc`), `npm ci`, `npm run dev`, `npm run build`. One screen of instructions.
- Content-as-data (Pitfall 4): adding a new project = editing one MDX/JSON file, not touching scene code. This is the single biggest maintainability win.
- Set up Renovate or Dependabot at "monthly, security only" — keep updates predictable, skip the noise.

**Phase:** Phase 1 (project setup) + Phase 5 (docs).

---

### Pitfall 17: Postprocessing pipeline cost (bloom, glitch, scanlines) tanking framerate

**What goes wrong:**
Terminal aesthetic invites bloom + scanline + chromatic aberration + film grain shaders. Stack them all and a mid-range laptop drops to 20fps; mobile drops to 5fps and overheats.

**How to avoid:**
- Pick at most one heavy postprocess effect (e.g., bloom for the monitor glow). Skip film grain, chromatic aberration, scanlines unless you've measured them.
- Disable postprocessing entirely on mobile / low-power devices.
- Bake the look into textures where possible (a "scanline" texture overlay on a monitor mesh costs nothing; a full-scene scanline pass costs everything).
- Profile with Drei `<Stats />` per-effect: turn each off and measure the FPS gain.

**Phase:** Phase 3 (visual polish) — measure as you add effects, not at the end.

---

## Minor Pitfalls

### Pitfall 18: Tailwind purge breaks dynamic class names
Class strings constructed dynamically (`bg-${color}-500`) get stripped from the final CSS. Use full class names or Tailwind's safelist. **Phase:** Phase 2.

### Pitfall 19: GitHub Pages cache headers are aggressive
Visitors see stale versions for hours after deploy. Use cache-busting filenames (Vite does this by default) and mention "hard-refresh if seeing old version" in setup notes. **Phase:** Phase 4.

### Pitfall 20: Favicon, OG tags, and tab title forgotten
Default Vite favicon, generic `<title>`, no Open Graph image. When recruiter shares the link in Slack to a colleague, it shows a blank preview. Add: real favicon (initials), `<title>Eren Atalay — Cybersecurity Portfolio</title>`, OG image (1200×630 screenshot of the workstation), `description` meta. **Phase:** Phase 4.

### Pitfall 21: HTTPS / mixed content from form handler
If form handler is `http://`, browser blocks. All third-party endpoints must be `https://`. **Phase:** Phase 4.

### Pitfall 22: GitHub Pages monorepo / `gh-pages` branch confusion
Mixing up `main` vs `gh-pages` deploy branch, or the new GitHub Actions Pages flow vs. the legacy `gh-pages` branch flow. Pick GitHub Actions flow (newer, less branch-juggling), document it. **Phase:** Phase 1 / 4.

### Pitfall 23: Privacy-respecting analytics still leaking PII
"Privacy-respecting" analytics still add cookies and beacons. PROJECT.md says "keep it light." If you must, use Plausible/Umami self-hosted or Cloudflare Web Analytics — never GA4 on a portfolio that's meant to look privacy-aware. **Phase:** Phase 4 (decision); ideally skip entirely for v1.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoding project content as JSX inline in scene components | Fast to write | Adding a project means editing scene code; 2D fallback drifts | **Never** — content must be data-driven from day one (Pitfall 4) |
| Skipping the 2D fallback "for now" | Saves a week | Recruiters bounce; you ship 3 weeks late "fixing" it | Never on this project — fallback is the *primary* recruiter view |
| Skipping mobile testing until the end | Faster dev loop | Discover crashes the day before launch with no time to fix | Acceptable in Phase 1 only; mandatory by Phase 3 |
| Inlining R3F state in `useFrame` "just for this one animation" | Quick win | Compounds — every animation gets the pattern, eventual refactor required | **Never** — refs from day one (Pitfall 2) |
| `console.log`-driven scene debugging without a debug-flag pattern | Instant feedback | Logs ship to prod; sensitive paths leak | Acceptable in dev; gate with `import.meta.env.DEV` from day one |
| Using `^` ranges in `package.json` for R3F/three/drei | Latest features auto | Future builds break unpredictably | Never for this trio — use `~` (Pitfall 16) |
| Dropping accessibility "for v1, fix later" | Saves Lighthouse-tuning days | "Later" never comes; recruiter accessibility audits fail | Never — at minimum: skip-link, reduced-motion, contrast (Pitfall 10) |
| Listing every cyber tool you've ever opened on the skills section | Looks impressive at a glance | Interview destruction — "tell me about your Cobalt Strike work" | **Never** (Pitfall 7) |
| Putting CV PDF only inside the 3D scene | Aesthetic continuity | Recruiter can't get to it without loading scene | Never — must have a plain-HTML link path (Pitfall 1) |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Pages | Forgetting `base: '/<repo>/'` in Vite config | Set base; use `import.meta.env.BASE_URL` for runtime path constructions |
| GitHub Pages SPA routing | Using BrowserRouter without 404.html shim | Use HashRouter for v1; or copy index.html → 404.html in build (Pitfall 9) |
| Formspree / Web3Forms | Treating endpoint as secret | It's public — ship in `VITE_FORM_ENDPOINT`; don't try to hide |
| GitHub Actions deploy | Building locally and pushing `dist/` | `actions/deploy-pages` builds on runner; never commit `dist/` |
| `useGLTF` + Draco | Forgetting Draco decoder URL | `useGLTF.setDecoderPath('/draco/')` and ship decoder in public dir |
| GLB texture compression (KTX2) | Combining KTX2 + Draco without testing loader interop | Test compressed pipeline early; have fallback (Pitfall 14) |
| Drei `<Html>` | Mixing in-world content + chrome in same `<Html>` | Chrome only; in-world content as textures |
| `prefers-reduced-motion` | Setting it once at mount, ignoring runtime changes | Subscribe to media-query change events; react during session |
| LinkedIn / GitHub external links | Missing `rel="noopener noreferrer"` and `target="_blank"` | Add both — security + UX standard |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| State-driven animation in useFrame | 60 React renders/sec, 100% CPU | Refs only in useFrame (Pitfall 2) | Immediately on any non-flagship device |
| Unmemoized geometries / materials | Stutter on every scene mount, growing memory | `useMemo`, share materials, instance | Becomes obvious at ~10 mesh instances |
| Default device pixel ratio on retina | Mobile fans, battery drain, frame drops | `dpr={[1, 1.5]}` cap | iPhones / iPads immediately |
| No frustum culling on out-of-view meshes | GPU rendering things you can't see | Three.js culls by default — but `frustumCulled` can be turned off accidentally on imported GLB | At ~100+ meshes |
| Postprocessing stack | Frame rate halves per heavy effect | Pick one, measure, kill on mobile (Pitfall 17) | Mid-range laptops at 2+ effects; mobile at 1 |
| `frameloop="always"` when nothing animates | Battery drain, fan noise on idle | `frameloop="demand"` and `invalidate()` on interaction | Always wasted; pain shows up after 5 min on battery |
| Loading all assets eagerly | 8+ second first paint | Lazy-load monitors not in initial view; preload only the workstation hero | At 3+ MB total assets |
| 4K textures | 12s loads, 200MB GPU memory, mobile crashes | 1024² hero, 512² props, KTX2 compressed (Pitfall 14) | Anywhere not on gigabit + flagship hardware |

---

## Security Mistakes

Domain-relevant security issues beyond standard web hygiene. These matter extra here because the *audience* is security professionals.

| Mistake | Risk | Prevention |
|---------|------|------------|
| EXIF metadata in screenshots | GPS coords, device serial, software paths leak | EXIF strip in build pipeline + manual review (Pitfall 5) |
| Visible internal IPs / hostnames in lab screenshots | Reveals home network topology | Manually crop / black-box; verify at full size; prefer screenshots from VMs with sanitized hostnames |
| Live CTF flags in published write-ups | Violates platform rules; gets account banned; embarrasses publicly | Only publish after CTF closes; mask flags with black box, never blur |
| `mailto:` plain-text email scraping | Spam flood | Obfuscate via JS or contact form (Pitfall 15) |
| Employer details / NDA-covered content | Career damage; potential legal | Generic role descriptions; no client/product names from current QA role |
| CV PDF metadata | Author name, software, modification history, sometimes home path | `qpdf --linearize` or re-export with metadata stripped; verify with `exiftool` |
| Source-map leaking original code paths | Reveals project structure, sometimes secrets in comments | Disable production source maps OR review them — secrets in source comments stay there |
| Content Security Policy absent | XSS surface (low, but signals carelessness on a *cyber* portfolio) | Add a strict CSP via `<meta>` tag — even a basic one signals you know about it |
| HTTP form endpoint | Mixed content block + credential interception | All third-party endpoints `https://` |
| Real DOB / home address on publicly-linked CV | Identity theft / stalking surface | City + region only; full DOB → year only or omit |
| Dependencies with known CVEs | Looks bad on a *cyber* portfolio specifically | Run `npm audit`; fix before launch; ideally `npm audit` in CI |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| 3D loads before any content is visible | Recruiter bounces in the loader window | First-paint static "concept art" + content links present in DOM (Pitfalls 1, 11) |
| Camera capture trapping mobile scroll | User can't navigate; treats site as broken | Disable rotate on mobile or restrict to horizontal (Pitfall 8) |
| No way back from a "zoomed-in monitor" view | User feels stuck | Always-visible Esc button + Esc key + click-outside |
| Click-anywhere-to-continue prompt over a 3D scene | Feels like a video game intro, not a portfolio | Skip it; first interaction is the explore action itself |
| Audio / sound effects | Auto-played audio violates browser policy + annoys recruiters in open offices | No audio, or strictly user-initiated and off by default |
| "Press any key" terminal prompts that don't accept any key | Feels broken | Either accept input or remove the prompt |
| Dense terminal text at small font on mobile | Unreadable | Larger base font on mobile breakpoint, or fall back to 2D view |
| Custom cursor that hides system cursor | Disorienting; accessibility regression | Skip; or only on desktop and only as a small augmentation |
| No loading progress indication | "Is this broken?" → bounce | `useProgress` percentage (Pitfall 11) |
| Page title is "Vite + React" or similar default | Tab in recruiter's tab graveyard becomes invisible | "Eren Atalay — Cybersecurity Portfolio" (Pitfall 20) |

---

## "Looks Done But Isn't" Checklist

Pre-launch items that are routinely missing on demos.

- [ ] **CV is reachable without loading 3D** — there exists a path (link, route, or query param) that surfaces CV in <2s on slow connection. Verify on throttled "Slow 4G."
- [ ] **2D fallback has every section the 3D view has** — checklist of content sections compared between views.
- [ ] **Real-device test on iOS + Android** — not just DevTools mobile emulation; actual phone in hand.
- [ ] **Reduced-motion mode tested** — toggle in OS, reload, verify camera doesn't swoop.
- [ ] **Keyboard-only navigation tested** — unplug the mouse, can you reach CV / project / contact?
- [ ] **EXIF stripped from every image in `public/`** — `exiftool -all= public/**/*.{png,jpg}` and re-verify.
- [ ] **All screenshots reviewed at full resolution** — IPs, hostnames, tab titles, file paths checked.
- [ ] **No `console.log`, `<Stats>`, `<Perf>`, `axesHelper`, `gridHelper`, or `<Leva>` in production bundle** — grep + build inspection.
- [ ] **404 / sub-route deep link works** — open `username.github.io/repo/projects/foo` directly, must not 404.
- [ ] **Contact form submitted as a test, message arrived in inbox not spam** — check Gmail and Outlook.
- [ ] **OG tags set, OG image renders in LinkedIn/Slack preview** — paste link into LinkedIn DM compose to preview.
- [ ] **Favicon is real, not Vite default.**
- [ ] **`<title>` is real and includes name + "cybersecurity."**
- [ ] **Lighthouse: Performance ≥ 80, Accessibility ≥ 90, Best Practices ≥ 90, SEO ≥ 90 on the 2D fallback view.**
- [ ] **Skill list audit:** every tool listed has a project/write-up on the same site demonstrating it. No tool listed without evidence.
- [ ] **CTF write-up provenance check:** every write-up cites platform, date, and any walkthrough/hint sources consulted.
- [ ] **CV PDF metadata stripped** — `exiftool` shows no author, software, or path.
- [ ] **`npm audit` clean** (or each issue documented + acknowledged).
- [ ] **Tested in Safari (macOS + iOS)** — Safari is where R3F surprises live.
- [ ] **`prefers-reduced-motion` honoured** — confirm with macOS Reduce Motion setting.
- [ ] **No `dist/` or `build/` in the repo.**
- [ ] **External links have `rel="noopener noreferrer"`.**
- [ ] **CSP `<meta>` tag present** — at least a baseline (signals security awareness on a cyber portfolio).
- [ ] **Repo README explains how to run + deploy** — Node version, install, dev, build, deploy. One screen.
- [ ] **A non-cyber friend AND a cyber-professional both reviewed it** — different failure modes (ux + authenticity).

---

## Recovery Strategies

When pitfalls slip through despite prevention.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| 3D scene crashes on real device discovered post-launch | LOW | Add `?fallback=1` query, show 2D unconditionally, ship hotfix; investigate device class for next deploy |
| Recruiter says "couldn't find your CV" | LOW | Add a banner-level CV button to all views; verify all CV-link paths work |
| EXIF / IP leak discovered after publish | MEDIUM (depending on what leaked) | Remove asset, force-push history rewrite *only if necessary* (history of removed file may persist on GitHub mirrors), update screenshot, redeploy. For severe leaks (live CTF flags), notify the platform. |
| `setState` in `useFrame` causing pre-launch jank | MEDIUM | Refactor each occurrence to refs; use `useFrame` to mutate `mesh.current.*` instead of state |
| GitHub Pages base path broken after deploy | LOW | Set `base` in Vite config, redeploy; usually a 5-minute fix once diagnosed |
| 2D fallback content drift | MEDIUM | Refactor to single content source (MDX/JSON) + two views; not a quick fix but mandatory |
| Skill bars / Matrix rain shipped and getting silent rejection | LOW–MEDIUM | Remove; replace with project-attestation list. Most recruiters won't return if rejected, but the next batch sees the cleaner version |
| GLB too big, slow load | LOW | Run `gltf-transform optimize`, redeploy; usually 5–10× size reduction |
| Postprocessing crashing low-end devices | LOW | Gate effects on `deviceMemory`/`hardwareConcurrency`; redeploy |
| CTF write-up plagiarism allegation | HIGH (career risk) | Acknowledge openly, add attribution, link sources, rewrite from genuine first-person solve. Don't silently delete — the original publisher may have already seen it |
| Source map leaking dev paths/secrets | MEDIUM | Disable production source maps; rotate any leaked secrets; rebuild + redeploy |
| Email going to spam | LOW–MEDIUM | Switch to a different form handler; add SPF-friendly reply-to; mention LinkedIn as primary contact |

---

## Pitfall-to-Phase Mapping

This is the load-bearing section for roadmap planning. Use it to seed phase success criteria.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Recruiter can't find CV without loading 3D | Phase 1 (foundation rules) | Throttled-network test; static HTML inspection |
| 2. setState in useFrame / scene rebuilds | Phase 2–3 (scene impl) | Profiler shows no React rerenders during idle scene; ESLint/grep rule |
| 3. Mobile crash / context lost | Phase 3 (capability detection) + Phase 5 (real-device QA) | Real iOS + Android test; 30-min stress soak |
| 4. 2D fallback content parity | Phase 1 (content-as-data) + Phase 2 (build 2D first) | Section-by-section content checklist between views |
| 5. OPSEC leaks (EXIF, IPs, flags, employer) | Phase 1 (asset pipeline) + every content phase + Phase 5 audit | Final OPSEC checklist; exiftool sweep; manual screenshot review |
| 6. Cyber-portfolio clichés | Phase 1 (aesthetic rules) + Phase 5 peer review | Cyber-pro reviewer; explicit anti-cliché list |
| 7. Junior authenticity (skill list, CTF provenance) | Phase 1 (content inventory) + every content phase | Skills→evidence mapping audit; provenance citations on every write-up |
| 8. Mobile gesture capture | Phase 3 (interaction) | Real-device gesture test |
| 9. GitHub Pages base path / SPA 404 | Phase 1 (setup) + Phase 4 (deploy) | Sub-route deep-link test post-deploy |
| 10. Accessibility (keyboard, reduced-motion, contrast) | Phase 1 (palette) + Phase 3 (motion handling) + Phase 5 (audit) | Lighthouse ≥ 90; manual keyboard pass; reduced-motion toggle test |
| 11. Loading UX | Phase 3 (loading sequence) | Throttled-network UX walkthrough |
| 12. Drei `<Html>` overlays | Phase 2–3 (monitor content) | Camera-extreme-angle test; click propagation test |
| 13. Stats panels / debug helpers in prod | Phase 5 (pre-launch) | Bundle inspection; grep audit |
| 14. Oversized GLBs / textures | Phase 2 (asset pipeline) | Per-asset size budget; Lighthouse Total Byte Weight |
| 15. Broken contact path | Phase 4 (deploy) + Phase 5 (verify) | Real submission test on Gmail + Outlook |
| 16. Maintenance bomb | Phase 1 (deps + docs) | `npm ci` + `npm run build` from scratch verifies |
| 17. Postprocessing cost | Phase 3 (visual polish) | Per-effect FPS measurement on mid-tier device |
| 18–23. Minor (Tailwind purge, cache, OG, HTTPS, deploy branch, analytics) | Phase 4 (deploy/polish) | Pre-launch checklist |

---

## Sources

**R3F / Three.js technical (HIGH confidence):**
- [R3F Performance Pitfalls (official docs)](https://r3f.docs.pmnd.rs/advanced/pitfalls)
- [R3F Hooks docs](https://r3f.docs.pmnd.rs/api/hooks)
- [R3F Events docs](https://r3f.docs.pmnd.rs/api/events)
- [R3F Loading Models docs](https://r3f.docs.pmnd.rs/tutorials/loading-models)
- [3 R3F Mistakes I'll Never Make Again — Wawa Sensei](https://wawasensei.dev/tuto/3-react-three-fiber-mistakes)
- [Common R3F issues — Wawa Sensei](https://wawasensei.dev/tuto/react-three-fiber-projects-common-issues)
- [Loading screen patterns — Wawa Sensei](https://wawasensei.dev/courses/react-three-fiber/lessons/loading-screen)
- [Drei Html + pointer events issue](https://github.com/pmndrs/drei/issues/319)
- [Three.js context lost iOS/Android](https://discourse.threejs.org/t/how-to-fix-context-lost-android-iphone-ios/56829)
- [Three.js iOS 17 context lost](https://discourse.threejs.org/t/three-js-broken-on-ios-17-with-context-lost/58025)
- [WebGL context lost on M4 iPad](https://discourse.threejs.org/t/webgl-context-lost-on-m4-ipad-app-and-browsers/79845)
- [Draco + KTX2 compression discussion](https://discourse.threejs.org/t/compression-draco-ktx2-example/31382)
- [Optimizing 3D models for web — Axel Cuevas](https://www.axl-devhub.me/en/blog/optimizing-3d-models)

**GitHub Pages / Vite deployment (HIGH confidence):**
- [Vite Static Deploy Guide](https://vite.dev/guide/static-deploy)
- [Vite Env Variables and Modes](https://vite.dev/guide/env-and-mode)
- [Handling 404 Error in SPA on GitHub Pages](https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p)
- [Resolving Vite GitHub Pages 404](https://medium.com/@aleksej.gudkov/resolving-vite-v5-4-2-build-404-error-e1f13914f2d7)
- [vite-plugin-github-pages-spa](https://github.com/sctg-development/vite-plugin-github-pages-spa)
- [GitHub Pages SPA routing discussion](https://github.com/orgs/community/discussions/64096)

**Accessibility / motion (HIGH confidence):**
- [prefers-reduced-motion (web.dev)](https://web.dev/articles/prefers-reduced-motion)
- [WCAG C39 reduced-motion technique](https://www.w3.org/WAI/WCAG21/Techniques/css/C39)
- [prefers-reduced-motion (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [Motion accessibility (Motion.dev)](https://motion.dev/docs/react-accessibility)

**Cybersecurity portfolio + recruiter signals (MEDIUM confidence — synthesised from multiple sources):**
- [What Cybersecurity Recruiters Really Look For](https://myturn.careers/blog/what-cybersecurity-recruiters-really-look-for-in-a-candidate/)
- [How to Present a Cybersecurity Portfolio — Artem Polynko](https://artempolynko.com/blog/how-to-present-cybersecurity-portfolio/)
- [Cybersecurity Portfolio Step-by-Step Guide](https://www.cybersecuritydistrict.com/a-step-by-step-guide-to-building-a-cybersecurity-portfolio/)
- [HackTheBox cybersecurity resume examples](https://www.hackthebox.com/blog/cybersecurity-resume-examples)
- [Entry-level Cyber Security Resume Examples — BeamJobs](https://www.beamjobs.com/resumes/entry-level-cyber-security-resume-examples)

**Junior dev portfolio antipatterns (HIGH confidence — strongly converged):**
- [Building an Effective Frontend Developer Portfolio — Frontend Mentor](https://www.frontendmentor.io/articles/building-an-effective-frontend-developer-portfolio--7cE8BfMG_)
- [What I Learned After Reviewing 40 Developer Portfolios](https://dev.to/kethmars/what-i-learned-after-reviewing-over-40-developer-portfolios-9-tips-for-a-better-portfolio-4me7)
- [Junior Developer Portfolio Best Practices — DEV](https://dev.to/jtrevdev/junior-developer-portfolio-best-practices-4bj2)

**OPSEC / privacy (HIGH confidence for principles, MEDIUM for portfolio-specific application):**
- [OPSEC & Privacy Handbook — Varppi](https://medium.com/@varppi/opsec-privacy-handbook-5e0a012c58f6)
- [OPSEC in OSINT — SOS Intelligence](https://sosintel.co.uk/opsec-in-osint-protecting-yourself-while-investigating/)
- [Operational Security in the Digital Era — CyberForces](https://cyberforces.com/en/opsec-operational-security-in-the-digital-era)
- [CTF Forensics: Metadata — CTF101](https://ctf101.org/forensics/what-is-metadata/)
- [CTF Plagiarism Detection (research paper)](https://ceur-ws.org/Vol-3056/paper-11.pdf)

---
*Pitfalls research for: 3D hacker-workstation cybersecurity portfolio (R3F + Tailwind + GitHub Pages, solo junior, ~1 month)*
*Researched: 2026-05-06*
