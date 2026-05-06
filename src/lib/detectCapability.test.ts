// src/lib/detectCapability.test.ts
//
// Coverage for the 5-check capability heuristic. Mocks navigator UA / platform
// / maxTouchPoints / deviceMemory / hardwareConcurrency per test, plus
// window.matchMedia for prefers-reduced-motion (Phase 1's tests/setup.ts polyfill,
// driven via the __setReducedMotion helper).
// Stubs HTMLCanvasElement.prototype.getContext for the WebGL2 dimension
// (jsdom doesn't implement WebGL — RESEARCH Open Question 2).
//
// Source: 02-RESEARCH.md Pattern 2 § "Test surface"

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { detectCapability, hasWebGL2, isAndroidTablet, isIpad, isPhone } from './detectCapability';
import { __setReducedMotion } from '../../tests/setup';

// Helper: temporarily redefine navigator properties for the duration of a test.
function setNavigator(props: {
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
  hardwareConcurrency?: number;
}): void {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(window.navigator, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
}

// Helper: stub HTMLCanvasElement.prototype.getContext to control WebGL2 detection.
// We don't call vi.spyOn here — we replace the prototype method directly so the
// mock survives across the synchronous detectCapability() call.
function mockWebGL2(supported: boolean): () => void {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    ...rest: unknown[]
  ): RenderingContext | null {
    if (contextId === 'webgl2') {
      return supported ? ({} as WebGL2RenderingContext) : null;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (orig as any).call(this, contextId, ...rest);
  } as typeof HTMLCanvasElement.prototype.getContext;
  return () => {
    HTMLCanvasElement.prototype.getContext = orig;
  };
}

function restoreNavigator(): void {
  // Reset to a known desktop-Chrome shape so each test starts from the same baseline.
  setNavigator({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    platform: 'MacIntel',
    maxTouchPoints: 0,
    hardwareConcurrency: 8,
  });
  // Clear deviceMemory — Safari-style undefined.
  Object.defineProperty(window.navigator, 'deviceMemory', {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

describe('detectCapability', () => {
  let restoreWebGL2: () => void = () => {};

  beforeEach(() => {
    restoreNavigator();
    __setReducedMotion(false);
    restoreWebGL2 = mockWebGL2(true);
  });

  afterEach(() => {
    restoreWebGL2();
    vi.restoreAllMocks();
  });

  describe('isPhone / tablet pass-through (D-01)', () => {
    it('iPhone UA → phone', () => {
      setNavigator({
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        platform: 'iPhone',
        maxTouchPoints: 5,
      });
      expect(isPhone()).toBe(true);
      expect(isIpad()).toBe(false);
    });

    it('Android phone (Mobile token) → phone', () => {
      setNavigator({
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
      });
      expect(isPhone()).toBe(true);
      expect(isAndroidTablet()).toBe(false);
    });

    it('iPad legacy UA → NOT phone (tablet pass-through)', () => {
      setNavigator({
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
        maxTouchPoints: 5,
      });
      expect(isIpad()).toBe(true);
      expect(isPhone()).toBe(false);
    });

    it('iPadOS 13+ UA (Macintosh + maxTouchPoints>1) → NOT phone', () => {
      setNavigator({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      });
      expect(isIpad()).toBe(true);
      expect(isPhone()).toBe(false);
    });

    it('Android tablet (Android UA without Mobile token) → NOT phone', () => {
      setNavigator({
        userAgent:
          'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        platform: 'Linux armv8l',
        maxTouchPoints: 5,
      });
      expect(isAndroidTablet()).toBe(true);
      expect(isPhone()).toBe(false);
    });

    it('macOS desktop (MacIntel + maxTouchPoints=0) → NOT iPad, NOT phone', () => {
      setNavigator({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      });
      expect(isIpad()).toBe(false);
      expect(isPhone()).toBe(false);
    });
  });

  describe('detectCapability composite', () => {
    it('desktop Chrome with WebGL2 → pass', () => {
      // restoreNavigator() in beforeEach already sets the desktop shape.
      const r = detectCapability();
      expect(r.pass).toBe(true);
      expect(r.reasons).toEqual([]);
    });

    it('no WebGL2 → fail with reasons including no-webgl2', () => {
      restoreWebGL2();
      restoreWebGL2 = mockWebGL2(false);
      const r = detectCapability();
      expect(r.pass).toBe(false);
      expect(r.reasons).toContain('no-webgl2');
    });

    it('prefers-reduced-motion: reduce → fail with reasons including reduced-motion', () => {
      __setReducedMotion(true);
      const r = detectCapability();
      expect(r.reasons).toContain('reduced-motion');
    });

    it('iPhone UA → fail with phone reason', () => {
      setNavigator({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
        platform: 'iPhone',
        maxTouchPoints: 5,
      });
      const r = detectCapability();
      expect(r.reasons).toContain('phone');
    });

    it('iPad UA → does NOT include phone reason (tablet pass-through)', () => {
      setNavigator({
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 12_0 like Mac OS X) Mobile/15E148',
        maxTouchPoints: 5,
      });
      const r = detectCapability();
      expect(r.reasons).not.toContain('phone');
    });

    it('deviceMemory=2 → fail with low-memory reason', () => {
      Object.defineProperty(window.navigator, 'deviceMemory', {
        value: 2,
        configurable: true,
        writable: true,
      });
      const r = detectCapability();
      expect(r.reasons).toContain('low-memory');
    });

    it('deviceMemory=undefined (Safari) → does NOT include low-memory', () => {
      Object.defineProperty(window.navigator, 'deviceMemory', {
        value: undefined,
        configurable: true,
        writable: true,
      });
      const r = detectCapability();
      expect(r.reasons).not.toContain('low-memory');
    });

    it('hardwareConcurrency=2 → fail with low-concurrency reason', () => {
      setNavigator({ hardwareConcurrency: 2 });
      const r = detectCapability();
      expect(r.reasons).toContain('low-concurrency');
    });

    it('hardwareConcurrency=8 → does NOT include low-concurrency', () => {
      setNavigator({ hardwareConcurrency: 8 });
      const r = detectCapability();
      expect(r.reasons).not.toContain('low-concurrency');
    });

    it('multiple failures aggregate in reasons array', () => {
      restoreWebGL2();
      restoreWebGL2 = mockWebGL2(false);
      setNavigator({
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148',
        platform: 'iPhone',
        hardwareConcurrency: 2,
        maxTouchPoints: 5,
      });
      Object.defineProperty(window.navigator, 'deviceMemory', {
        value: 2,
        configurable: true,
        writable: true,
      });
      const r = detectCapability();
      expect(r.pass).toBe(false);
      expect(r.reasons).toEqual(
        expect.arrayContaining(['no-webgl2', 'phone', 'low-memory', 'low-concurrency']),
      );
    });
  });

  describe('hasWebGL2 helper', () => {
    it('returns false when canvas.getContext("webgl2") returns null', () => {
      restoreWebGL2();
      restoreWebGL2 = mockWebGL2(false);
      expect(hasWebGL2()).toBe(false);
    });

    it('returns true when canvas.getContext("webgl2") returns a context', () => {
      // beforeEach already mocked WebGL2 = true.
      expect(hasWebGL2()).toBe(true);
    });
  });
});
