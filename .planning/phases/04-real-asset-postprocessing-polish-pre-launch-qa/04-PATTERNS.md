# Phase 4: Real Asset, Postprocessing, Polish, Pre-Launch QA — Pattern Map

**Mapped:** 2026-05-08
**Files analyzed:** 14 (new + modified)
**Analogs found:** 14 / 14

---

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `src/ui/ContactForm.tsx` (NEW) | component (form) | request-response (POST → success/failure UI) | `src/ui/EmailReveal.tsx` (button → reveal state) + `src/ui/ContextLossBar.tsx` (multi-state inline panel + `[!]` warn glyph + retry/dismiss BracketLinks) | role-match (no analog form exists; combine two close patterns) |
| `src/ui/ContactForm.test.tsx` (NEW) | test | unit | `src/ui/BracketLink.test.tsx` (vitest + RTL describe/it shape) | exact |
| `src/ui/LiveProfiles.tsx` (NEW) | component (sub-list) | static read from `identity` | `src/ui/CertRow.tsx` + the parent loop in `src/sections/Certs.tsx` | exact (same `<li>` + BracketLink + muted handle pattern) |
| `src/lib/web3forms.ts` (NEW) | utility | request-response helper | `src/lib/obfuscate.ts` (single-purpose helper, JSDoc-led, plain async fn) | role-match |
| `src/3d/ScenePostprocessing.tsx` (NEW) | component (scene wrapper) | event-driven (PerformanceMonitor onIncline/onDecline → state) | `src/scene/FocusController.tsx` is closest in spirit; for state + lazy/Suspense the analog is the `WriteupsRoute` lazy split in `src/shells/TextShell.tsx` lines 32, 60-68 | role-match |
| `src/3d/PostFX.tsx` (NEW) | component (scene leaf) | static (declarative effect tree) | `src/scene/Lighting.tsx` (tiny declarative R3F scene-leaf component; one return; no state) | exact |
| `src/3d/PostFX.test.tsx` (NEW) | test | unit (smoke) | `src/scene/colors.test.ts` (parses companion file; runs as vitest) — for render-style smoke, see `src/ui/ContextLossBar.test.tsx` | role-match |
| `src/scene/Workstation.tsx` (MODIFY) | component (scene composer) | static (composes children) | itself — current procedural composition stays as the fallback shape; replace primitive children with `<primitive object={glb.scene}>` per RESEARCH Pattern 1 | self-modify |
| `src/sections/Contact.tsx` (MODIFY) | section | static layout | itself — append `<ContactForm />` and a `See also:` BracketLink line under the existing email/GitHub/LinkedIn strip | self-modify |
| `src/sections/Certs.tsx` (MODIFY) | section | static layout | itself — append `<LiveProfiles />` after the existing `<ul>` of `<CertRow>` | self-modify |
| `src/content/identity.ts` (MODIFY) | content/types | static export | itself — extend the `Identity` interface with four optional fields (`tryHackMeUrl?`, `tryHackMeHandle?`, `hackTheBoxUrl?`, `hackTheBoxHandle?`) | self-modify |
| `index.html` (MODIFY) | config (HTML) | static | itself — extend CSP `connect-src` with `https://api.web3forms.com`; verify JSON-LD email omission stays | self-modify |
| `public/sitemap.xml` (MODIFY) | config (XML) | static | itself — currently 1 URL; replace with 6 URLs per CONTEXT § Claude's Discretion | self-modify |
| `public/robots.txt` (MODIFY-MAYBE) | config (text) | static | itself — verify host matches whichever GH-Pages handle wins (`erenatalaycs` vs `eren-atalay`) | self-modify |
| `.github/workflows/deploy.yml` (MODIFY) | CI | event-driven | itself — append optional advisory Lighthouse-CI job AFTER the deploy job | self-modify |
| `scripts/check-parity.mjs` (MODIFY-OPTIONAL) | utility (build-time gate) | batch transform (read files → emit errors) | itself — add an optional 4th assertion that `<ContactForm />` is imported by both `src/sections/Contact.tsx` AND a 3D-shell mount path | self-modify |
| `.planning/CHECKLIST-LAUNCH.md` (NEW) | docs (checklist) | static | `.planning/CHECKLIST-OPSEC.md` (existing — copy heading style + `- [ ] **[CI]** ...` and `- [ ] ...` row shapes verbatim) | exact |
| `public/assets/workstation/workstation.glb` (NEW) | asset (binary) | static (loaded by drei `useGLTF`) | (no analog — first real GLB consumer); pattern source: `src/scene/Workstation.tsx` `<primitive>` insertion + `src/lib/baseUrl.ts` for asset URL | new |
| `public/assets/workstation/LICENSE.txt` (NEW) | docs (provenance) | static | (no analog — first asset licence file) | new |
| `public/assets/og-image.png` (REPLACE) | asset (binary) | static (referenced by `<meta og:image>`) | itself (Phase 1 placeholder) | self-modify |

---

## Pattern Assignments

### `src/ui/ContactForm.tsx` (NEW — component, request-response)

**Analog A — multi-state inline panel with `[!]` warn glyph + retry/dismiss BracketLinks:** `src/ui/ContextLossBar.tsx`
**Analog B — pre-click button → revealed state with clipboard side-effect + `(copied)` toast:** `src/ui/EmailReveal.tsx`

**Imports pattern (combine both analogs)** — copy the import shape from `ContextLossBar.tsx` lines 18-19 plus `EmailReveal.tsx` line 18-19:

```typescript
import { useState, type FormEvent } from 'react';
import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';
import { EmailReveal } from './EmailReveal';
import { identity } from '../content/identity';
```

**Component-state shape pattern** — copy from `EmailReveal.tsx` lines 27-30 (per-render switch on local state, no useEffect for the success/failure DOM swap):

```typescript
const [email, setEmail] = useState<string | null>(null);
const [copied, setCopied] = useState(false);

if (email) { return /* revealed JSX */; }
return /* pre-click button */;
```

Phase 4 ContactForm extends to a 3-way switch:

```typescript
type SubmitState = 'idle' | 'submitting' | 'sent' | 'failed';
const [submitState, setSubmitState] = useState<SubmitState>('idle');
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [emailError, setEmailError] = useState(false);

if (submitState === 'sent') return <SuccessBlock onReset={() => setSubmitState('idle')} />;
if (submitState === 'failed') return <FailureBlock onRetry={handleSubmit} />;
return <FormElement … />;
```

**Submit handler pattern** — adapt `EmailReveal.tsx` lines 59-64 (`onClick={async () => { … }}` with try/catch-style fallback):

```typescript
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();
  if (botcheckRef.current?.value) {
    // honeypot tripped — silent success per CONTEXT D-11 + UI-SPEC § Honeypot
    setSubmitState('sent');
    return;
  }
  setSubmitState('submitting');
  try {
    const res = await postWeb3Forms({ name, email, message });
    setSubmitState(res.ok ? 'sent' : 'failed');
  } catch {
    setSubmitState('failed');
  }
}
```

**Success-state JSX pattern** — copy the `[!]` glyph + BracketLinks idiom from `ContextLossBar.tsx` lines 44-71. The structural template (success has no `[!]`; failure does):

```jsx
// Success — adapt ContextLossBar's row layout WITHOUT the [!] glyph
<div role="status" aria-live="polite" className="font-mono text-fg flex flex-col gap-2">
  <h2 className="text-xl font-semibold">
    <TerminalPrompt><span className="text-fg">message_sent</span></TerminalPrompt>
  </h2>
  <p>Delivered to eren.atalay@…  — I&apos;ll reply within 48h.</p>
  <BracketLink as="button" onClick={onReset}>send another</BracketLink>
</div>

// Failure — copy ContextLossBar lines 44-71 verbatim, swap copy:
<div role="status" aria-live="polite" className="font-mono text-fg flex flex-col gap-2">
  <span aria-hidden="true" className="text-warn">[!]</span>
  <h2 className="text-xl font-semibold">
    <TerminalPrompt><span className="text-fg">message_failed</span></TerminalPrompt>
  </h2>
  <p>Network error. Try email instead: <EmailReveal encoded={identity.emailEncoded} /></p>
  <BracketLink as="button" onClick={onRetry}>retry</BracketLink>
</div>
```

The literal `[!]` warn-amber glyph appears in `ContextLossBar.tsx` lines 55-57:

```jsx
<span aria-hidden="true" className="text-warn">
  [!]
</span>
```

Reuse VERBATIM for the failure state.

**Form structure pattern** — UI-SPEC § Layout & Interaction Contract has the canonical JSX block; mirror it. No analog form exists in the repo; pattern for input styling comes from the bordered terminal-aesthetic conventions in `tokens.css` lines 7-18 (`--color-surface-1`, `--color-accent`, `--color-focus`).

**Honeypot pattern** — the literal block from UI-SPEC § Honeypot lines 187-194 — `<div style={{display:'none'}} aria-hidden="true">` with `<input name="botcheck" tabIndex={-1} autoComplete="off">`.

**Web3Forms POST helper:** delegated to `src/lib/web3forms.ts` (NEW). See that file's pattern below.

**Required-field marker pattern** — copy from `BracketLink.tsx` line 89 (the `aria-hidden` glyph idiom):

```jsx
<span className="text-accent" aria-hidden="true">*</span>
```

**Focus-ring pattern** — copy literal from `tokens.css` lines 36-39:

```css
:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }
```

JSX consumers (every analog: `BracketLink.tsx` lines 62-63, `EmailReveal.tsx` lines 41-42, `SkipToContent.tsx` line 24) use:

```typescript
'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'
```

Apply to every `<input>`, `<textarea>`, and the submit `BracketLink as="button">`.

---

### `src/ui/ContactForm.test.tsx` (NEW — test, unit)

**Analog:** `src/ui/BracketLink.test.tsx` (lines 1-60)

**Imports pattern (verbatim — copy lines 8-11):**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ContactForm } from './ContactForm';
```

**Describe/it block shape — copy `BracketLink.test.tsx` lines 13-22:**

```typescript
describe('ContactForm', () => {
  describe('idle state', () => {
    it('renders name, email, message labels', () => {
      render(<ContactForm />);
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    });
  });
  // …
});
```

**Mock pattern for `fetch`** — vitest `vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 200 }))`. No fetch-mock in the existing tests; introduce inline.

**Tests to author:** idle render, honeypot silent-success path, submit happy path (200 → success state), submit failure path (500 → failure state), email-blur validation toggle, character counter live-update.

---

### `src/ui/LiveProfiles.tsx` (NEW — component, static identity read)

**Analog (parent pattern):** `src/sections/Certs.tsx` lines 8-32
**Analog (row shape):** `src/ui/CertRow.tsx` lines 49-60

**Imports pattern — adapt `Certs.tsx` lines 4-6:**

```typescript
import { identity } from '../content/identity';
import { TerminalPrompt } from './TerminalPrompt';
import { BracketLink } from './BracketLink';
```

**Top-level conditional pattern** — UI-SPEC § Live profiles sub-list layout lines 419-440 has the canonical JSX. Combine with `CertRow.tsx`'s row template (lines 49-60):

```typescript
// Whole-block guard — both missing → render nothing
if (!identity.tryHackMeUrl && !identity.hackTheBoxUrl) return null;

return (
  <div className="mt-8">
    <h3 className="text-xl font-semibold font-mono text-fg">
      <TerminalPrompt>
        <span className="text-fg">ls certs/live-profiles/</span>
      </TerminalPrompt>
    </h3>
    <ul className="mt-3 flex flex-col gap-2">
      {identity.tryHackMeUrl && (
        <li className="flex flex-wrap items-baseline gap-x-3 py-1 font-mono">
          <BracketLink href={identity.tryHackMeUrl} external>TryHackMe profile</BracketLink>
          {identity.tryHackMeHandle && (
            <span className="text-muted text-sm">@{identity.tryHackMeHandle}</span>
          )}
        </li>
      )}
      {identity.hackTheBoxUrl && (
        <li className="flex flex-wrap items-baseline gap-x-3 py-1 font-mono">
          <BracketLink href={identity.hackTheBoxUrl} external>HackTheBox profile</BracketLink>
          {identity.hackTheBoxHandle && (
            <span className="text-muted text-sm">@{identity.hackTheBoxHandle}</span>
          )}
        </li>
      )}
    </ul>
  </div>
);
```

**Section-heading pattern (`<TerminalPrompt>` + `text-xl font-semibold`)** — exact copy from `Certs.tsx` lines 12-18 except `<h3>` instead of `<h2>` (UI-SPEC § Live profiles sub-list layout — semantic hierarchy: parent owns `<h2>`, sub-list owns `<h3>`).

**External BracketLink pattern (auto-attaches `target="_blank" rel="noopener noreferrer"` per OPS-05)** — verified in `BracketLink.tsx` lines 96 and `BracketLink.test.tsx` lines 23-32. Use `external` prop; do NOT hand-write `target/rel`.

**Single-platform fallback** — pattern is the explicit `&&` short-circuit per row, plus the whole-block guard at function top. UI-SPEC § Empty / placeholder states locks the rule.

---

### `src/lib/web3forms.ts` (NEW — utility, request-response helper)

**Analog:** `src/lib/obfuscate.ts` (lines 1-49)

**Imports + JSDoc-led helper pattern (copy `obfuscate.ts` shape):**

```typescript
// src/lib/web3forms.ts
//
// Web3Forms POST helper. Single source of truth for the endpoint URL
// + field marshalling. Public-by-design access key per CONTEXT D-11.
//
// CSP: index.html `connect-src` allows https://api.web3forms.com (Phase 4).
//
// Source: 04-CONTEXT.md D-10/D-11/D-12; 04-RESEARCH.md Pattern 7;
//   web3forms.com/docs

const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT ?? 'https://api.web3forms.com/submit';
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export interface Web3FormsResponse {
  ok: boolean;
  status: number;
}

export async function postWeb3Forms(payload: ContactPayload): Promise<Web3FormsResponse> {
  const body = new FormData();
  body.set('access_key', ACCESS_KEY);
  body.set('subject', `[Portfolio enquiry] from ${payload.name || '(name empty)'}`);
  body.set('name', payload.name);
  body.set('email', payload.email);
  body.set('message', payload.message);
  try {
    const res = await fetch(ENDPOINT, { method: 'POST', body });
    return { ok: res.ok, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}
```

**Vite `import.meta.env.VITE_*` pattern** — copy from `src/lib/baseUrl.ts` lines 12-17 (the documented "use the dot form, not the bracket form" rule applies here too).

**Async helper + best-effort try/catch pattern** — copy from `obfuscate.ts` lines 40-48:

```typescript
export async function revealEmail(encoded: string): Promise<string> {
  const email = decodeEmail(encoded);
  try {
    await navigator.clipboard?.writeText(email);
  } catch {
    /* clipboard blocked — non-fatal */
  }
  return email;
}
```

Same shape: `async function`, try-around-the-side-effect, return a typed result.

---

### `src/3d/ScenePostprocessing.tsx` (NEW — component, event-driven)

**Analog (lazy + Suspense split):** `src/shells/TextShell.tsx` lines 32 + 60-68

**Lazy import pattern (copy `TextShell.tsx` line 32 verbatim form):**

```typescript
const PostFX = lazy(() => import('./PostFX').then((m) => ({ default: m.PostFX })));
```

(`TextShell.tsx` does it as `const WriteupsRoute = lazy(() => import('../routes/WriteupsRoute'));` — adapt to named-export form because PostFX is a named export per RESEARCH Pattern 3.)

**Suspense fallback pattern (adapt `TextShell.tsx` lines 66-68):**

```jsx
<Suspense fallback={null}>
  <PostFX />
</Suspense>
```

`fallback={null}` is the canonical "no-effects-is-the-fallback" per CONTEXT D-07.

**State + handler pattern** — adapt the camera-mode state shape from `ThreeDShell.tsx` line 52: `const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');` →

```typescript
const [tier, setTier] = useState<'high' | 'low'>('high');
```

**Imports pattern:**

```typescript
import { Suspense, lazy, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';
```

**Full body (per RESEARCH Pattern 3):**

```typescript
export function ScenePostprocessing() {
  const [tier, setTier] = useState<'high' | 'low'>('high');
  return (
    <>
      <PerformanceMonitor
        bounds={() => [30, 50]}
        flipflops={3}
        onIncline={() => setTier('high')}
        onDecline={() => setTier('low')}
        onFallback={() => setTier('low')}
      />
      {tier === 'high' && (
        <Suspense fallback={null}>
          <PostFX />
        </Suspense>
      )}
    </>
  );
}
```

---

### `src/3d/PostFX.tsx` (NEW — component, declarative scene leaf)

**Analog:** `src/scene/Lighting.tsx` (lines 1-22)

**Component shape — copy `Lighting.tsx` verbatim form:** comment header → single-named-export → return-fragment with declarative children → no state, no effects.

**Imports + body (per RESEARCH Pattern 5 verified API names):**

```typescript
// src/3d/PostFX.tsx
//
// Lazy-loaded postprocessing pipeline (CONTEXT D-08, REQUIREMENTS 3D-08).
// Mounted only when ScenePostprocessing's perfTier === 'high'.
// API names verified via @react-three/postprocessing@3.0.4 source
// (RESEARCH Pattern 5): Bloom uses `luminanceThreshold` (NOT `threshold`);
// Scanline + Noise opacity routed via blendMode-opacity-value through
// wrapEffect; ChromaticAberration `offset` is a [x,y] tuple.
//
// Source: 04-CONTEXT.md D-08; 04-RESEARCH.md Pattern 3 + Pattern 5

import {
  EffectComposer,
  Bloom,
  Scanline,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.6}
        luminanceSmoothing={0.025}
        intensity={0.6}
        mipmapBlur
      />
      <Scanline density={1.25} opacity={0.15} />
      <ChromaticAberration offset={[0.0008, 0.0008]} />
      <Noise opacity={0.04} />
    </EffectComposer>
  );
}
```

**Critical correction — do NOT copy CONTEXT D-08 prop names verbatim:** RESEARCH Pattern 5 catches three errors that would silently no-op:
- `threshold={0.6}` → must be `luminanceThreshold={0.6}` (the wrapped class field)
- `offset={0.0008}` → must be `offset={[0.0008, 0.0008]}` (Vector2 tuple)
- `opacity` on Scanline/Noise works only via `blendMode-opacity-value` routing in `wrapEffect` — verified in `node_modules/@react-three/postprocessing/src/util.tsx`. The literal `opacity` prop IS valid in JSX.

---

### `src/3d/PostFX.test.tsx` (NEW — test, smoke)

**Analog (vitest companion-file pattern):** `src/scene/colors.test.ts`
**Analog (RTL render-smoke):** `src/ui/ContextLossBar.test.tsx` (referenced from earlier; uses RTL)

**Pattern decision:** Per CLAUDE.md "Don't try to unit-test 3D scenes in jsdom — it can't render WebGL. Test pure logic only" — `PostFX.test.tsx` should be a structural import-smoke test (verifies the module loads and exports `PostFX` without parsing/grammar errors), NOT a Three.js-rendered scene test. Use a single `expect(PostFX).toBeDefined()` and `expect(typeof PostFX).toBe('function')`. The integration is verified via the size-limit budget (PostFX chunk emits) and via the deployed-URL Lighthouse run.

```typescript
import { describe, it, expect } from 'vitest';
import { PostFX } from './PostFX';

describe('PostFX', () => {
  it('exports a function component', () => {
    expect(typeof PostFX).toBe('function');
    expect(PostFX.name).toBe('PostFX');
  });
});
```

---

### `src/scene/Workstation.tsx` (MODIFY — composer)

**Analog:** itself (lines 37-79)

**Current composition pattern (lines 38-78):**

```jsx
<>
  <Floor />
  <Desk />
  <Monitor position={[-0.45, 0.95, -0.05]} rotation={[0, 0.18, 0]} monitorId="left" focused={focused} onFocusToggle={onFocusToggle}>
    <MonitorOverlay ariaLabel="Left monitor: projects">
      <Projects />
    </MonitorOverlay>
  </Monitor>
  {/* … center, right … */}
  <Lamp position={[-0.5, 0.78, 0]} />
  <Bookshelf />
</>
```

**Phase 4 swap pattern (per RESEARCH Pattern 1 + 2 — composite CC0 path):**

```jsx
import { useGLTF } from '@react-three/drei';
import { assetUrl } from '../lib/baseUrl';

useGLTF.preload(assetUrl('workstation/desk.glb'));
useGLTF.preload(assetUrl('workstation/monitor.glb'));
useGLTF.preload(assetUrl('workstation/lamp.glb'));
useGLTF.preload(assetUrl('workstation/bookshelf.glb'));

export function Workstation({ focused, onFocusToggle }: WorkstationProps) {
  const desk = useGLTF(assetUrl('workstation/desk.glb'));
  // …
  return (
    <>
      <Floor />
      <primitive object={desk.scene} position={[0, 0, 0]} />
      <Monitor position={[-0.45, 0.95, -0.05]} rotation={[0, 0.18, 0]} monitorId="left" focused={focused} onFocusToggle={onFocusToggle}>
        <MonitorOverlay ariaLabel="Left monitor: projects">
          <Projects />
        </MonitorOverlay>
      </Monitor>
      {/* … keep <Monitor> wrappers (they own click-to-focus + screen plane);
            their procedural geometry props can stay or move to <primitive> children … */}
    </>
  );
}
```

**Key invariants (DO NOT change):**
- The three `<Monitor>` wrappers stay (they own click handling + the screen plane that `<MonitorOverlay>` projects onto). Per CONTEXT D-03: camera/scale poses unchanged.
- `<MonitorOverlay>` `position={[0, 0, 0.026]}` and `distanceFactor={DISTANCE_FACTOR}` from `cameraPoses.ts` line 46 stay; only `DISTANCE_FACTOR` itself may need re-tuning if the GLB's screen plane differs in size from the procedural placeholder.
- `<Floor />` stays (procedural — no GLB ground plane needed; SCENE_COLORS.bg keeps the dark room consistent).

**Asset-URL pattern — copy from `WhoamiGreeting.tsx` line 122:**

```typescript
href={assetUrl(identity.cvFilename)}
// → for GLBs: assetUrl('workstation/desk.glb')
```

`baseUrl.ts` lines 14-17 is the canonical helper — never hand-write `/Portfolio_Website/...`.

**Fallback path (D-04 timebox blown):** keep file unchanged; ship procedural.

---

### `src/sections/Contact.tsx` (MODIFY — section)

**Analog:** itself (lines 14-39)

**Current pattern (lines 14-39):** `<section id="contact">` → `<h2>` with `<TerminalPrompt>cat contact.md</TerminalPrompt>` → `<div className="mt-3 …">` containing intro paragraph + flex-row of `<EmailReveal>` + `<BracketLink>` GitHub + LinkedIn.

**Phase 4 extension — append below the existing strip (UI-SPEC § Form mount-point integration lines 386-404):**

```jsx
<section id="contact" className="mt-12 scroll-mt-20">
  {/* existing h2 + intro p + email/GitHub/LinkedIn strip — unchanged */}

  {/* NEW Phase 4: ContactForm */}
  <div className="mt-6">
    <ContactForm />
  </div>

  {/* NEW Phase 4: See also: shortcut to live profiles (CTC-03 secondary) */}
  {(identity.tryHackMeUrl || identity.hackTheBoxUrl) && (
    <p className="mt-6 flex flex-wrap items-baseline gap-x-2 text-fg font-mono">
      <span>See also:</span>
      {identity.tryHackMeUrl && <BracketLink href={identity.tryHackMeUrl} external>TryHackMe profile</BracketLink>}
      {identity.hackTheBoxUrl && <BracketLink href={identity.hackTheBoxUrl} external>HackTheBox profile</BracketLink>}
    </p>
  )}
</section>
```

**Spacing constant `mt-6` (24px)** — UI-SPEC § Spacing Scale row "lg" plus § Layout & Interaction Contract for ContactForm container.

**Existing email/GitHub/LinkedIn strip stays** — UI-SPEC § Form mount-point integration: "the email + GitHub + LinkedIn strip stays at the top (recruiter-fast-path: links remain reachable in <2s)".

---

### `src/sections/Certs.tsx` (MODIFY — section)

**Analog:** itself (lines 8-32)

**Current pattern:** section + h2 + conditional empty-state OR `<ul>` map of `<CertRow>`.

**Phase 4 extension — append `<LiveProfiles />` below the cert list:**

```jsx
<section id="certs" className="mt-12 scroll-mt-20">
  {/* existing h2 + cert ul — unchanged */}

  {/* NEW Phase 4: Live profiles sub-list (CTC-03 primary) */}
  <LiveProfiles />
</section>
```

`<LiveProfiles />` itself owns the visibility guard (`return null` when both URLs absent). The parent does NOT duplicate the guard.

---

### `src/content/identity.ts` (MODIFY — content/types)

**Analog:** itself (lines 18-46)

**Current `Identity` interface (lines 18-33):** explicit fields, all required-or-marked-optional with `?`, with JSDoc per non-obvious field.

**Phase 4 extension — add four optional fields per CONTEXT D-13:**

```typescript
export interface Identity {
  // … existing fields …

  /** Phase 4 CTC-03 — TryHackMe live profile URL. Omit if no THM presence. */
  tryHackMeUrl?: string;
  /** Display handle, rendered as @{handle} in muted color. */
  tryHackMeHandle?: string;
  /** Phase 4 CTC-03 — HackTheBox live profile URL. Omit if no HTB presence. */
  hackTheBoxUrl?: string;
  /** Display handle, rendered as @{handle} in muted color. */
  hackTheBoxHandle?: string;
}

export const identity: Identity = {
  // … existing values …
  // Real handles populated by Eren at execution time per CONTEXT D-13.
};
```

**JSDoc-comment-per-field pattern** — copy from current lines 30-32 (`/** Used by Plan 06 JSON-LD homeLocation.name */`) — every new field gets a short comment naming the consumer.

---

### `index.html` (MODIFY — config)

**Analog:** itself (lines 58-62 — CSP) and (lines 67-81 — JSON-LD)

**Current CSP (lines 58-62):**

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
/>
```

**Phase 4 patch — extend `connect-src`:**

```
connect-src 'self' https://api.web3forms.com;
```

(Single-line edit; everything else preserved verbatim.)

**Current JSON-LD (lines 64-81)** — already omits `email` per OPSEC. Phase 4 verifies this survives; CHECKLIST-LAUNCH.md item: "JSON-LD Person schema verified — passes schema.org validator AND no `email` field present."

**OG image meta (lines 39-42, 53-56)** — already references `assets/og-image.png` at absolute URL. Phase 4 replaces the binary, not the meta. Verify host matches `eren-atalay` vs `erenatalaycs` resolution per RESEARCH § Architectural Responsibility Map (the GH-Pages handle reconciliation is required pre-launch).

---

### `public/sitemap.xml` (MODIFY — config)

**Analog:** itself (lines 1-9 — current 1-URL form)

**Current pattern:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://erenatalaycs.github.io/Portfolio_Website/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

**Phase 4 replacement — 6 URLs per CONTEXT § Claude's Discretion + UI-SPEC § SEO surfaces:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://{HOST}/Portfolio_Website/</loc><lastmod>2026-05-08</lastmod></url>
  <url><loc>https://{HOST}/Portfolio_Website/?view=3d</loc><lastmod>2026-05-08</lastmod></url>
  <url><loc>https://{HOST}/Portfolio_Website/?focus=projects</loc><lastmod>2026-05-08</lastmod></url>
  <url><loc>https://{HOST}/Portfolio_Website/?focus=writeups</loc><lastmod>2026-05-08</lastmod></url>
  <url><loc>https://{HOST}/Portfolio_Website/?focus=certs</loc><lastmod>2026-05-08</lastmod></url>
  <url><loc>https://{HOST}/Portfolio_Website/?focus=contact</loc><lastmod>2026-05-08</lastmod></url>
</urlset>
```

UI-SPEC explicit: "no `<changefreq>`, no `<priority>` (deprecated by major search engines per 2026)."

`{HOST}` resolves to the chosen GH-Pages handle (must match `index.html` canonical URL + `robots.txt` Sitemap line).

---

### `public/robots.txt` (MAYBE-MODIFY)

**Analog:** itself

```
User-agent: *
Allow: /
Sitemap: https://erenatalaycs.github.io/Portfolio_Website/sitemap.xml
```

Already correct per CONTEXT § Claude's Discretion. Only modify if the GH-Pages handle changes from `erenatalaycs` to `eren-atalay`.

---

### `.github/workflows/deploy.yml` (MODIFY — CI)

**Analog:** itself (lines 105-134 — existing build job ladder)

**Existing build-step pattern (lines 38-134):** numbered comments → `name:` + `run:` step → optional `if:` guard. Pre-build CI gates (tsc, eslint, prettier, vitest, exiftool, parity, vite build, size-limit, 404 copy, upload-pages-artifact) all complete before the `deploy` job (lines 136-145) runs.

**Phase 4 extension (per CONTEXT D-17 — advisory non-blocking):**

```yaml
  lighthouse:
    needs: deploy
    runs-on: ubuntu-latest
    if: ${{ success() }}
    continue-on-error: true   # advisory per CONTEXT D-17
    steps:
      - name: Run Lighthouse-CI on deployed text shell
        run: |
          npx -y @lhci/cli@~0.15.1 autorun \
            --collect.url=https://{HOST}/Portfolio_Website/?view=text \
            --collect.url=https://{HOST}/Portfolio_Website/?view=3d \
            --collect.numberOfRuns=3 \
            --upload.target=temporary-public-storage \
            --assert.preset=lighthouse:no-pwa
```

**Step-naming + `run: |` block pattern** — copy from existing lines 60-71 (`Strip metadata from public/assets`) which has the same multi-line bash + indentation conventions.

**`needs:` + `runs-on:` job-shape pattern** — copy from existing `deploy:` job lines 136-141.

**Non-blocking convention** — `continue-on-error: true` is canonical for advisory CI; the existing blocking gates (tsc, eslint, etc.) intentionally lack this flag.

---

### `scripts/check-parity.mjs` (MAYBE-MODIFY — utility)

**Analog:** itself (lines 41-205)

**Existing assertion-collection pattern (lines 41-205):** `const errors = [];` accumulator → 3 named `assertX()` functions → run all → exit code based on `errors.length`. Per RESEARCH § Recommended Project Structure, Phase 4 addition is OPTIONAL; the import resolution by Vite already breaks the build if `<ContactForm />` is missing from `Contact.tsx`. If added, the new assertion follows the existing pattern:

```javascript
function assertContactFormParity() {
  const contactPath = join(ROOT, 'src/sections/Contact.tsx');
  const contactSource = readFileSync(contactPath, 'utf8');
  if (!contactSource.includes('<ContactForm')) {
    errors.push(
      `CTC-01: <ContactForm /> not mounted in src/sections/Contact.tsx — text-shell recruiters cannot reach the form.`,
    );
  }
  // 3D-shell mount: ContactForm is mounted via CenterMonitorContent.tsx
  const centerPath = join(ROOT, 'src/ui/CenterMonitorContent.tsx');
  if (existsSync(centerPath)) {
    const centerSource = readFileSync(centerPath, 'utf8');
    if (!centerSource.includes('<ContactForm')) {
      errors.push(
        `CTC-01: <ContactForm /> not mounted in src/ui/CenterMonitorContent.tsx — 3D-shell recruiters cannot reach the form.`,
      );
    }
  }
}
```

**Recommendation:** SKIP this assertion. Vite's import-graph already enforces presence; an extra parity assertion duplicates work for low value. CONTEXT § Specifics for Phase 4 explicitly notes the form mount points are already TXT-06-covered.

---

### `.planning/CHECKLIST-LAUNCH.md` (NEW — docs)

**Analog:** `.planning/CHECKLIST-OPSEC.md` (lines 1-89)

**File-shell pattern — copy `CHECKLIST-OPSEC.md` lines 1-5 verbatim form:**

```markdown
# Pre-Launch Checklist

> Run before tagging v1.0. Distinct from CHECKLIST-OPSEC.md which is per-release.
> Each item is either CI-enforced or human-author-owned; tags are explicit.

## Lighthouse on deployed URL (OPS-03 — CONTEXT D-17)
…
```

**Section-heading shape + `- [ ]` row patterns — copy verbatim from CHECKLIST-OPSEC.md:**

```markdown
## Asset Metadata

- [ ] **[CI]** `exiftool -all= -P -overwrite_original public/assets/*` succeeded.
- [ ] **[CI]** Verify step passes — no Author / GPS* / CreatorTool / Software / DocumentID metadata in any file under `public/assets/`.
- [ ] CV PDF: opened in Preview / Adobe Reader; "Document Properties" shows no Author, Title, Subject, Producer beyond the generic exporter.
```

The exact item phrasings come from UI-SPEC § Pre-launch checklist files (CONTEXT D-14) lines 290-303 — verbatim contract.

**Fillable rows pattern** — UI-SPEC has `___` placeholders for human-fill values:

```markdown
- [ ] Cyber peer review — Reviewer: ___, Date: ___, Verdict: ___, Notes: ___
- [ ] iOS device — Model: ___, iOS version: ___, Test date: ___, Text shell: PASS/FAIL, 3D shell: PASS/FAIL/REFUSED-GRACEFULLY, Notes: ___
```

**Footer pattern — copy from CHECKLIST-OPSEC.md line 88:**

```markdown
---

> Last updated: 2026-05-08 · run before v1.0 release.
```

---

### `public/assets/workstation/workstation.glb` + `LICENSE.txt` (NEW — assets)

**No code analog** (first GLB consumer).

**Generation pattern (RESEARCH Pattern 2):** `npx gltfjsx@~6.5 ./source-assets/desk.glb --transform --resolution 1024 --format webp --types --output ./public/assets/workstation/desk.glb`. Run ONCE at integration time; commit both the `.glb` and (optionally) the typed `.tsx`. Repeat per asset (monitor: 512², lamp: 512², bookshelf: 512²).

**LICENSE.txt content pattern** — UI-SPEC § Asset Inventory line 533: "Records source asset URL, license (CC0 / CC-BY / etc.), author attribution if any, download date, modifications." Plain-text file; no analog in repo. Author at integration time:

```
workstation.glb composite
=========================

Source assets:
- desk.glb           — https://polyhaven.com/a/metal_office_desk
                       License: CC0 1.0 Universal
                       Author: Poly Haven (Greg Zaal et al.)
                       Downloaded: 2026-05-XX
                       Modifications: gltfjsx --transform --resolution 1024 --format webp
- monitor.glb        — …
- lamp.glb           — …
- bookshelf.glb      — …

All sources are CC0 — no attribution required, but recorded here for provenance.
```

---

### `public/assets/og-image.png` (REPLACE — asset)

**No code analog** (binary).

**Generation pattern (RESEARCH § Architectural Responsibility Map):** macOS native screenshot (`Cmd-Shift-4 → space → click window`) of the deployed text-shell hero block at 1200×630, run through ImageOptim or squoosh.app to compress to <200 KB.

**OPSEC concern (CHECKLIST-OPSEC.md § Screenshot Review lines 14-23):** screenshot must contain no notifications, no other tabs, no file paths, no autofill suggestions. The exiftool CI gate (deploy.yml lines 60-104) strips XMP/EXIF on every release.

---

## Shared Patterns

### Tailwind v4 `@theme` token usage
**Source:** `src/styles/tokens.css` lines 7-18
**Apply to:** every new file with JSX (`ContactForm.tsx`, `LiveProfiles.tsx`)

```css
@theme {
  --color-bg:        #0d1117;
  --color-fg:        #c9d1d9;
  --color-accent:    #7ee787;
  --color-warn:      #e3b341;
  --color-negative:  #ff7b72;
  --color-muted:     #8b949e;
  --color-surface-1: #161b22;
  --color-focus:     #79c0ff;
  --font-mono:       'JetBrains Mono', ui-monospace, …;
}
```

JSX consumers always use Tailwind utility classes (`text-fg`, `text-accent`, `text-warn`, `text-muted`, `bg-bg`, `bg-surface-1`, `border-surface-1`, `outline-focus`, `font-mono`). NEVER hex literals. Verified across `BracketLink.tsx`, `EmailReveal.tsx`, `CertRow.tsx`, `ContextLossBar.tsx`, `WhoamiGreeting.tsx`, `Contact.tsx`, `Certs.tsx`, `About.tsx` — single rule, zero exceptions.

### `:focus-visible` ring pattern
**Source:** `src/styles/tokens.css` lines 36-39 (the global default), then per-element overrides via Tailwind utilities
**Apply to:** every interactive element added by Phase 4

```typescript
'focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2'
```

(Verified in `BracketLink.tsx` line 63, `EmailReveal.tsx` line 41, `SkipToContent.tsx` line 24.)

### External link safety pattern
**Source:** `src/ui/BracketLink.tsx` line 96
**Apply to:** every `<BracketLink>` rendered with an `external` URL (TryHackMe, HackTheBox, GitHub, LinkedIn, etc.)

```typescript
const externalProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
```

Phase 4 NEVER hand-writes `target="_blank"`. Pass `external` to BracketLink instead. CHECKLIST-LAUNCH.md grep audit (`grep -E 'target="_blank"' dist/index.html | grep -v 'noopener noreferrer'` returns empty) verifies.

### Asset URL pattern
**Source:** `src/lib/baseUrl.ts` lines 12-17
**Apply to:** every `public/assets/...` reference in JSX (GLB paths, og-image references in dynamic JSX, etc.)

```typescript
export const BASE: string = import.meta.env.BASE_URL;
export function assetUrl(filename: string): string {
  return `${BASE}assets/${filename}`;
}
```

GLB consumption: `useGLTF(assetUrl('workstation/desk.glb'))`. NEVER `/Portfolio_Website/...` literal — Vite handles base path via this helper.

### Vite env-var pattern (for `VITE_WEB3FORMS_KEY`, `VITE_FORM_ENDPOINT`)
**Source:** `src/lib/baseUrl.ts` line 12 + RESEARCH § Architectural Responsibility Map
**Apply to:** `src/lib/web3forms.ts`

```typescript
const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT ?? 'https://api.web3forms.com/submit';
```

The dot form is required; the bracket form (`import.meta.env['BASE_URL']`) does NOT static-replace at build time.

### `useReducedMotion` hook gating pattern
**Source:** `src/lib/useReducedMotion.ts` (full file) + `src/ui/WhoamiGreeting.tsx` lines 49-56
**Apply to:** any future Phase 4 component that adds animation. Phase 4 ships ZERO new motion (UI-SPEC § Animation contract: postprocessing is static, tier-flip is instant), so this hook is loaded-but-unused in Phase 4. The pattern is documented for the planner to confirm "no Phase 4 component needs this hook" rather than miss a regression.

```typescript
const reduced = useReducedMotion();
const [state, setState] = useState<…>(() =>
  reduced ? FINAL_STATE : INITIAL_STATE,
);
useEffect(() => {
  if (reduced) return;
  // motion timeline
}, [state, reduced]);
```

### Section composition pattern
**Source:** `src/sections/About.tsx` (full file) + `src/sections/Contact.tsx` (full file) + `src/sections/Certs.tsx` (full file)
**Apply to:** any future section work; for Phase 4 specifically — preserve the section shell when modifying `Contact.tsx` and `Certs.tsx`.

```jsx
<section id="contact" className="mt-12 scroll-mt-20">
  <h2
    tabIndex={-1}
    className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
  >
    <TerminalPrompt><span className="text-fg">cat contact.md</span></TerminalPrompt>
  </h2>
  <div className="mt-3 text-fg text-base font-normal leading-relaxed font-mono space-y-2">
    {/* body */}
  </div>
</section>
```

`mt-12 scroll-mt-20` (anchor-target) and `tabIndex={-1}` on the heading are non-negotiable — keyboard navigation lands on the heading after `?focus=` deep links.

### Lazy chunk + Suspense fallback pattern
**Source:** `src/shells/TextShell.tsx` lines 32 + 60-68
**Apply to:** `src/3d/ScenePostprocessing.tsx`

```typescript
const PostFX = lazy(() => import('./PostFX').then((m) => ({ default: m.PostFX })));

// later, in JSX:
<Suspense fallback={null}>
  <PostFX />
</Suspense>
```

`fallback={null}` (NOT a skeleton) is the canonical "graceful no-effect intermediate is the legitimate UX" per CONTEXT D-07.

### Section-heading TerminalPrompt pattern
**Source:** `src/sections/Certs.tsx` lines 12-18, `src/sections/About.tsx` lines 9-16, `src/sections/Contact.tsx` lines 17-24
**Apply to:** `src/ui/LiveProfiles.tsx` (`$ ls certs/live-profiles/`) + the success/failure terminal blocks in `src/ui/ContactForm.tsx` (`$ message_sent` / `$ message_failed`)

```jsx
<h3 className="text-xl font-semibold font-mono text-fg">
  <TerminalPrompt><span className="text-fg">ls certs/live-profiles/</span></TerminalPrompt>
</h3>
```

Use `<h3>` for sub-list (parent owns `<h2>`); same `text-xl font-semibold` weight per UI-SPEC § Typography ("section hierarchy comes from spacing + the prompt prefix, not from a font-size step").

### CI gate pattern (size-limit, parity, exiftool)
**Source:** `.github/workflows/deploy.yml` lines 105-123
**Apply to:** the new Lighthouse-CI step in `deploy.yml`

```yaml
- name: <Step Name>
  run: <command>
```

Existing gates are blocking; Phase 4's Lighthouse step is advisory (`continue-on-error: true`) per CONTEXT D-17.

---

## No Analog Found

| File | Role | Data Flow | Reason / Pattern source |
|------|------|-----------|-------------------------|
| `public/assets/workstation/workstation.glb` | binary asset | static | First real GLB; pipeline source = RESEARCH Pattern 1 + 2 (CC0 shortlist + `gltfjsx --transform` flags) |
| `public/assets/workstation/LICENSE.txt` | provenance docs | static | First asset license file; format = UI-SPEC § Asset Inventory line 533 + RESEARCH § GLB authoring |
| `public/assets/og-image.png` (binary content) | binary asset | static | Generation = macOS screenshot + ImageOptim, manual; OPSEC review = CHECKLIST-OPSEC.md § Screenshot Review |

These three files have no code analog; their production is documented in RESEARCH.md (asset shortlist + pipeline) and OPSEC checklist (review steps).

---

## Metadata

**Analog search scope:** `src/ui/`, `src/scene/`, `src/sections/`, `src/lib/`, `src/shells/`, `src/content/`, `src/styles/`, `scripts/`, `.github/workflows/`, `.planning/`, `index.html`, `public/`
**Files scanned:** 27 source files + 4 config files + 2 checklist docs
**Pattern extraction date:** 2026-05-08
