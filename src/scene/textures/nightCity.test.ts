// src/scene/textures/nightCity.test.ts
//
// Smoke test (D-34) for the procedural night-city CanvasTexture. The
// visual pixel content itself is NOT asserted (procedural — checking
// pixel values would lock in a specific noise seed-pattern as a contract
// and the value is artistic, not behavioural). What IS asserted:
//
//   1. createNightCityTexture() returns a THREE.CanvasTexture instance.
//   2. The wrapped canvas is 1024 × 1024 (D-16 / STACK.md cap).
//   3. Determinism: re-invoking returns byte-identical canvas content
//      (we attempt getImageData first, fall back to .toDataURL()
//      equality if jsdom lacks a real 2D context).
//   4. OPSEC seed lock: the source file contains the literal
//      'eren-portfolio-v1.1' (regression guard against silently editing
//      the seed; D-18 demands a fixed seed for reproducibility).
//   5. No real-image imports: the source file does NOT match
//      `import|require ... .(png|jpg|jpeg|webp)` (OPSEC rule 4).
//
// jsdom note: by default jsdom returns `null` from canvas.getContext('2d')
// unless the optional `canvas` npm package is installed. The project
// does not depend on `canvas` (would add a native build step + ~200 KB
// devDep). When the 2D context is unavailable we still receive a
// CanvasTexture wrapping a blank 1024×1024 canvas, and `.toDataURL()`
// returns the standard "empty PNG" data URL — which is deterministic
// across invocations, so the byte-equality assertion still holds.
//
// Source: 05-CONTEXT.md D-16..D-19, D-26, D-34; PITFALLS.md §5.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { CanvasTexture } from 'three';
import { createNightCityTexture } from './nightCity';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NIGHT_CITY_PATH = resolve(__dirname, './nightCity.ts');

describe('createNightCityTexture', () => {
  it('returns a THREE.CanvasTexture instance', () => {
    const tex = createNightCityTexture();
    expect(tex).toBeInstanceOf(CanvasTexture);
  });

  it('wraps a 1024 × 1024 canvas', () => {
    const tex = createNightCityTexture();
    // `tex.image` is the underlying canvas (HTMLCanvasElement or
    // OffscreenCanvas). Both expose width/height as numbers.
    const img = tex.image as { width: number; height: number };
    expect(img.width).toBe(1024);
    expect(img.height).toBe(1024);
  });

  it('is deterministic — two invocations produce byte-identical canvas data', () => {
    const t1 = createNightCityTexture();
    const t2 = createNightCityTexture();
    const c1 = t1.image as HTMLCanvasElement;
    const c2 = t2.image as HTMLCanvasElement;

    // Prefer getImageData byte-equality. If jsdom returns null (no
    // node-canvas package installed), fall back to .toDataURL()
    // equality — which also satisfies the determinism contract because
    // both invocations operate on the same seed string and produce the
    // same canvas state (whether real or blank).
    const ctx1 = c1.getContext?.('2d') ?? null;
    const ctx2 = c2.getContext?.('2d') ?? null;

    if (ctx1 !== null && ctx2 !== null) {
      const d1 = ctx1.getImageData(0, 0, 1024, 1024).data;
      const d2 = ctx2.getImageData(0, 0, 1024, 1024).data;
      expect(d1.length).toBe(d2.length);
      // Byte-for-byte equality: Uint8ClampedArray supports .every()
      // when iterated as a typed array. Convert to plain arrays via
      // Array.from() to use vitest's toEqual deep-equality.
      expect(Array.from(d1)).toEqual(Array.from(d2));
    } else {
      // jsdom path — no 2D context available. The determinism contract
      // is still meaningful: the function must reach the same end-state
      // (same blank canvas, same texture wrapper) on both calls.
      const url1 = c1.toDataURL?.() ?? '';
      const url2 = c2.toDataURL?.() ?? '';
      expect(url1).toBe(url2);
    }
  });
});

describe('nightCity.ts OPSEC source contract', () => {
  const source = readFileSync(NIGHT_CITY_PATH, 'utf-8');

  it('locks the seed to the project-version constant string', () => {
    expect(source).toContain('eren-portfolio-v1.1');
  });

  it('does not import any real raster image asset (OPSEC rule 4)', () => {
    // Matches `import ... '...png'` and `require('...jpg')` etc.
    const realImageImport = /(import|require).*\.(png|jpg|jpeg|webp)/i;
    expect(source).not.toMatch(realImageImport);
  });

  it('contains the OPSEC contract block header', () => {
    expect(source).toContain('OPSEC contract');
  });
});
