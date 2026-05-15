// src/scene/emissiveBudget.test.ts
//
// Smoke test (D-26 + D-34): every EMISSIVE_BUDGET value must be a finite
// number in [0, 10]. Catches accidental NaN/Infinity/negative/giant from
// future refactors without locking in specific visual values (which are
// a Claude's-discretion design call, not a contract).
//
// Source: 05-CONTEXT.md D-23..D-26, D-34.

import { describe, it, expect } from 'vitest';
import { EMISSIVE_BUDGET } from './emissiveBudget';

describe('EMISSIVE_BUDGET', () => {
  it.each(Object.entries(EMISSIVE_BUDGET))(
    '%s is a finite number in [0, 10]',
    (_key, value) => {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    },
  );

  it('exports all 8 D-23 keys', () => {
    expect(Object.keys(EMISSIVE_BUDGET).sort()).toEqual(
      [
        'BEDSIDE_LAMP',
        'BIAS_LIGHT',
        'CEILING_FIXTURE',
        'LAMP_BULB',
        'LED_STRIP',
        'MONITOR_SCREEN',
        'NEON_STRIP',
        'RACK_LED',
      ].sort(),
    );
  });
});
