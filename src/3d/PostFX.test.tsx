// src/3d/PostFX.test.tsx
//
// Smoke test only — jsdom cannot render WebGL (CLAUDE.md "Don't try to
// unit-test 3D scenes in jsdom — it can't render WebGL"). Visual
// verification is in Plan 04-08 (real-device QA on iOS + Android).
//
// Source: 04-PATTERNS.md § PostFX.test.tsx; 04-RESEARCH.md Pattern 5

import { describe, it, expect } from 'vitest';
import { PostFX } from './PostFX';

describe('PostFX', () => {
  it('exports a function component', () => {
    expect(typeof PostFX).toBe('function');
    expect(PostFX.name).toBe('PostFX');
  });
});
