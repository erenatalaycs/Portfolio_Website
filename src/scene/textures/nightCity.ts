// src/scene/textures/nightCity.ts
//
// v1.1 Phase 5 (ROOM-03): procedural night-city CanvasTexture authored
// behind the back-wall window. Module-scope pure function (not a hook)
// because the texture is generated once per page load and shared as a
// singleton across the lifetime of <Window />.
//
// Source: 05-CONTEXT.md D-16..D-19; PITFALLS.md §5 (window OPSEC leak —
// the rule the OPSEC contract block below cites verbatim);
// research/STACK.md "Hidden risk: cap textures at 1024×1024".

/**
 * OPSEC contract — procedural night-city texture.
 *
 * This module synthesises a 1024×1024 CanvasTexture from a SEEDED
 * deterministic PRNG. The output contains:
 *   - vertical gradient dark-blue sky (no astronomical accuracy)
 *   - generic black rectangle "building" silhouettes (no real buildings)
 *   - random yellow window-light dots (purely procedural)
 *   - sparse red aircraft warning lights
 *
 * RULES (binding — do not violate):
 *   1. No real photos. No skyline references.
 *   2. No identifiable buildings, landmarks, or place names anywhere in
 *      this file (comments, variable names, or generated content).
 *   3. The seed key is fixed at 'eren-portfolio-v1.1' so the texture is
 *      reproducible (build-time auditable) and provably non-photographic.
 *   4. If you need to change the look, change the algorithm — never
 *      import a real image.
 */

import { CanvasTexture, SRGBColorSpace } from 'three';

// Fixed seed key per D-18 / OPSEC rule 3 — DO NOT change without an
// explicit OPSEC review. Bumping the project version intentionally
// re-rolls the pattern; for v1.1 the key is frozen.
const SEED_KEY = 'eren-portfolio-v1.1';

// Canvas dimensions per D-16 / STACK.md cap (1024×1024 ceiling).
const CANVAS_SIZE = 1024;

// Pattern color palette (D-17). All values are inlined here rather than
// imported from SCENE_COLORS because they are texture-internal pixel
// constants — they never reach a Three.js material directly.
const SKY_TOP = '#02050a'; // gradient top (deeper)
const SKY_BOTTOM = '#06101a'; // gradient bottom (lifted)
const SILHOUETTE = '#000000'; // building silhouette
const WINDOW_LIGHT = '#f3d27a'; // yellow window dot
const WARNING_LIGHT = '#ff4d4d'; // red aircraft warning light

// Building-silhouette tuning (D-17 step 3).
const SILHOUETTE_BAND_RATIO = 0.4; // bottom 40 % of canvas is silhouettes
const SILHOUETTE_RECT_MIN = 14; // min rectangle count
const SILHOUETTE_RECT_MAX = 24; // max rectangle count
const RECT_WIDTH_MIN = 40;
const RECT_WIDTH_MAX = 140;
const RECT_HEIGHT_MIN = 80;
const RECT_HEIGHT_MAX = 340;
const RECT_GAP_MAX = 8;

// Per-canvas window-light density target (D-17 step 4).
const TARGET_TOTAL_WINDOW_DOTS = 80;
const WINDOW_DOT_SIZE = 2;
const WINDOW_DOT_ALPHA = 0.8;

// Aircraft warning lights (D-17 step 5).
const WARNING_LIGHT_COUNT = 5;
const WARNING_DOT_SIZE = 4;

/**
 * 32-bit string hash → integer seed (xmur3 / Mulberry32 companion).
 * Pure: same input → same output. No external deps.
 */
function xmur3(str: string): () => number {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

/**
 * Mulberry32 — 32-bit seeded PRNG, ~3-line state.
 * Returns a function producing floats in [0, 1). Deterministic from seed.
 */
function mulberry32(seedInt: number): () => number {
  let a = seedInt >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Get a 2D canvas at the project's pinned dimensions, preferring
 *  OffscreenCanvas when available (browser) and falling back to a DOM
 *  canvas (jsdom + tests). Returns null when no canvas API is present. */
function makeCanvas(): HTMLCanvasElement | OffscreenCanvas | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(CANVAS_SIZE, CANVAS_SIZE);
  }
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = CANVAS_SIZE;
    c.height = CANVAS_SIZE;
    return c;
  }
  return null;
}

/**
 * Synthesise a deterministic 1024×1024 night-city CanvasTexture.
 *
 * Determinism contract (D-18 + nightCity.test.ts): invoking twice on
 * the same machine MUST produce byte-identical canvas pixel data. The
 * only randomness source is the seeded PRNG keyed by SEED_KEY — no
 * non-seeded random calls anywhere. No real-image imports allowed.
 */
export function createNightCityTexture(): CanvasTexture {
  const canvas = makeCanvas();
  if (canvas === null) {
    // No DOM, no OffscreenCanvas — return an empty CanvasTexture so the
    // call site (Three.js material map) still receives a Texture-shaped
    // object. In practice this branch only fires in non-browser, non-
    // jsdom environments (e.g. raw node), which the project does not
    // target. The fallback keeps the function's signature honest.
    const stub = document.createElement('canvas');
    stub.width = CANVAS_SIZE;
    stub.height = CANVAS_SIZE;
    const tex = new CanvasTexture(stub);
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  // Cast to the union's draw context — both OffscreenCanvas and
  // HTMLCanvasElement expose getContext('2d') with a compatible
  // CanvasRenderingContext2D-like surface for our use (fillRect,
  // createLinearGradient, fillStyle, globalAlpha).
  const ctx = (canvas as HTMLCanvasElement | OffscreenCanvas).getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (ctx === null) {
    const tex = new CanvasTexture(canvas as HTMLCanvasElement);
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }

  // -------- Seeded PRNG --------
  // OPSEC rule 3: SEED_KEY is the sole randomness source. Built-in
  // non-seeded random APIs MUST NOT appear anywhere in this file (the
  // test file string-greps for the forbidden identifier to enforce).
  const seedFn = xmur3(SEED_KEY);
  const rand = mulberry32(seedFn());

  // -------- 1. Vertical gradient sky --------
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_SIZE);
  gradient.addColorStop(0, SKY_TOP);
  gradient.addColorStop(1, SKY_BOTTOM);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  // -------- 2. Building silhouette band --------
  // Pack rectangles left-to-right along the bottom band. Each rect has
  // varying width / height / small gap. All sizes driven by the seeded
  // PRNG. No real-skyline shape is reproduced; rectangle ordering and
  // sizing is pure noise.
  const bandTopY = Math.floor(CANVAS_SIZE * (1 - SILHOUETTE_BAND_RATIO));
  const rectCount =
    SILHOUETTE_RECT_MIN + Math.floor(rand() * (SILHOUETTE_RECT_MAX - SILHOUETTE_RECT_MIN + 1));

  interface SilhouetteRect {
    x: number;
    y: number;
    w: number;
    h: number;
  }
  const rects: SilhouetteRect[] = [];

  let cursorX = 0;
  for (let i = 0; i < rectCount && cursorX < CANVAS_SIZE; i++) {
    const w = RECT_WIDTH_MIN + Math.floor(rand() * (RECT_WIDTH_MAX - RECT_WIDTH_MIN + 1));
    const h = RECT_HEIGHT_MIN + Math.floor(rand() * (RECT_HEIGHT_MAX - RECT_HEIGHT_MIN + 1));
    const x = cursorX;
    const y = CANVAS_SIZE - h; // anchored to the bottom of canvas
    // Clamp the rect into the silhouette band (no rect exceeds the band
    // by more than its height — that's by construction since y is
    // canvas-bottom-anchored and h ≤ RECT_HEIGHT_MAX < silhouette band
    // is allowed to extend slightly above bandTopY for taller buildings).
    rects.push({ x, y, w, h });
    cursorX += w + Math.floor(rand() * (RECT_GAP_MAX + 1));
  }

  ctx.fillStyle = SILHOUETTE;
  for (const r of rects) {
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  // Bandfloor — guarantee no sky color leaks between rectangles below
  // the band top: fill the very bottom row of pixels.
  ctx.fillRect(0, bandTopY + Math.floor((CANVAS_SIZE - bandTopY) * 0.95), CANVAS_SIZE, CANVAS_SIZE);

  // -------- 3. Window-light dots inside silhouettes --------
  // Density proportional to rect area so taller rectangles get more
  // window lights. Sum of per-rect targets ≈ TARGET_TOTAL_WINDOW_DOTS.
  const totalRectArea = rects.reduce((acc, r) => acc + r.w * r.h, 0) || 1;

  ctx.fillStyle = WINDOW_LIGHT;
  ctx.globalAlpha = WINDOW_DOT_ALPHA;
  for (const r of rects) {
    const share = (r.w * r.h) / totalRectArea;
    const dotsThisRect = Math.max(1, Math.round(TARGET_TOTAL_WINDOW_DOTS * share));
    for (let d = 0; d < dotsThisRect; d++) {
      // Inset by 4 px so dots don't kiss the rect edges.
      const dx = r.x + 4 + Math.floor(rand() * Math.max(1, r.w - 8));
      const dy = r.y + 4 + Math.floor(rand() * Math.max(1, r.h - 8));
      ctx.fillRect(dx, dy, WINDOW_DOT_SIZE, WINDOW_DOT_SIZE);
    }
  }
  ctx.globalAlpha = 1.0;

  // -------- 4. Aircraft warning lights on tallest rectangles --------
  // Pick the WARNING_LIGHT_COUNT tallest rects (by height) and place a
  // single red dot at the top edge of each. "Tallest" is computed on a
  // copy so the ordering of `rects` is preserved (which matters because
  // ordering affects nothing visible — but consistency keeps the test
  // determinism check stable across silhouette rendering ordering).
  const tallest = [...rects].sort((a, b) => b.h - a.h).slice(0, WARNING_LIGHT_COUNT);
  ctx.fillStyle = WARNING_LIGHT;
  for (const r of tallest) {
    const cx = r.x + Math.floor(r.w / 2) - Math.floor(WARNING_DOT_SIZE / 2);
    const cy = r.y - Math.floor(WARNING_DOT_SIZE / 2);
    ctx.fillRect(cx, cy, WARNING_DOT_SIZE, WARNING_DOT_SIZE);
  }

  // -------- 5. Wrap as Three.js CanvasTexture --------
  // OffscreenCanvas is accepted by CanvasTexture's constructor; the
  // type def widens to TexImageSource so the cast is type-safe here.
  const texture = new CanvasTexture(canvas as HTMLCanvasElement);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
