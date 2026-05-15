// src/scene/emissiveBudget.ts
//
// Single source of truth for emissive intensity ceilings across the v1.1
// scene (ROOM-04). Every emissive component in v1.1 — including the three
// v1.0 emitters that this Plan 05-01 refactors (Monitor, Lamp, WallDecor)
// — reads its `emissiveIntensity` from this object instead of hard-coding
// a literal. Centralization is the structural prerequisite for Phase 7's
// ≤ 4-distinct-hues guardrail and for every later phase that adds an
// emitter (Phase 6 rack LEDs + bedside lamp; Phase 7 bias-light + LED
// strip; Phase 8 cat — no emitter).
//
// `toneMapped:false` privilege is exclusive to NEON_STRIP (D-25). The
// Bloom luminanceThreshold (Plan 04-01) is calibrated against the
// tone-mapped surfaces; broadening the privilege to a second surface
// requires re-tuning Bloom.
//
// Smoke test in emissiveBudget.test.ts asserts every value is a finite
// number in [0, 10]. No pixel-level assertions — those are a design call.
//
// Source: 05-CONTEXT.md D-23..D-26 (verbatim values); ROOM-04.

export const EMISSIVE_BUDGET = {
  /** WallDecor NeonStrip — cyan accent above monitor. Exclusive
   *  `toneMapped:false` consumer (D-25). */
  NEON_STRIP: 2.5,
  /** Monitor.tsx emissive screen plane. Focus state multiplies this
   *  by ~1.333× (preserves HS-redesign focus-pop ratio). */
  MONITOR_SCREEN: 0.6,
  /** Phase 7 WARM-03 — bias-light plane behind monitor. */
  BIAS_LIGHT: 0.4,
  /** Phase 7 WARM-04 — under-desk LED strip. */
  LED_STRIP: 0.35,
  /** Phase 6 CYB-02 — Raspberry Pi cluster activity LEDs (during the
   *  blink-on half-cycle; off half-cycle is 0). */
  RACK_LED: 1.2,
  /** Lamp.tsx warm-amber bulb sphere. */
  LAMP_BULB: 0.8,
  /** Phase 6 BED-03 — bedside lamp on the nightstand. Warmer than
   *  ceiling fixture; counts against the 6-dynamic-light cap. */
  BEDSIDE_LAMP: 0.6,
  /** Plan 05-02 — recessed flush ceiling fixture emissive disc.
   *  Cool white. PointLight is fill only; this is the visible glow. */
  CEILING_FIXTURE: 0.5,
} as const;

export type EmissiveSurface = keyof typeof EMISSIVE_BUDGET;
