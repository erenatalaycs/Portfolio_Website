// src/scene/colors.test.ts
//
// Drift assertion: SCENE_COLORS must match the corresponding @theme tokens
// in src/styles/tokens.css. Editing one file without updating the other
// fails this test, gating CI.
//
// Source: 02-RESEARCH.md Pattern 8 § "Drift test (single-file, jsdom-free)"

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SCENE_COLORS } from './colors';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('SCENE_COLORS mirrors tokens.css', () => {
  const tokensCss = readFileSync(resolve(__dirname, '../styles/tokens.css'), 'utf-8');

  function token(name: string): string {
    const re = new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`);
    const m = tokensCss.match(re);
    if (!m) throw new Error(`tokens.css missing --color-${name}`);
    return m[1].toLowerCase();
  }

  it.each([
    ['bg', 'bg'],
    ['surface', 'surface-1'],
    ['accent', 'accent'],
    ['warn', 'warn'],
    ['wall', 'wall'],
  ])('SCENE_COLORS.%s matches --color-%s', (sceneKey, tokenName) => {
    expect(SCENE_COLORS[sceneKey as keyof typeof SCENE_COLORS].toLowerCase()).toBe(
      token(tokenName),
    );
  });
});
