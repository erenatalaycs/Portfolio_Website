// src/lib/useReducedMotion.test.ts
//
// Tests for the useReducedMotion hook. Uses the matchMedia polyfill from
// tests/setup.ts to flip the reduced-motion match value mid-test.
// Source: 01-03-PLAN.md Task 1 Step 1.9

import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';
import { __setReducedMotion } from '../../tests/setup';

describe('useReducedMotion', () => {
  it('returns false when matchMedia.matches is false (default)', () => {
    __setReducedMotion(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when matchMedia.matches is true', () => {
    __setReducedMotion(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('reacts to a mid-session toggle', () => {
    __setReducedMotion(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
    act(() => __setReducedMotion(true));
    expect(result.current).toBe(true);
  });
});
