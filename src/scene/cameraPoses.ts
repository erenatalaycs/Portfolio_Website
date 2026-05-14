// src/scene/cameraPoses.ts
//
// Single source of truth for the two camera poses + drei <Html>
// distanceFactor. Consumed by:
//   - <MonitorOverlay>      (DISTANCE_FACTOR)
//   - <FocusController>     (MONITOR_FOCUS_POSE + DEFAULT_ORBIT_POSE)
//
// HS redesign (Task 3): the Phase 3 three-pose contract has been
// collapsed to a 2-pose toggle (overview ↔ focused). FocusController
// now owns a simple boolean `focused` state — no FocusId enum, no
// per-monitor pose dictionary.
//
// DISTANCE_FACTOR — empirical, NOT spec. Formula: world_size = CSS_px ×
// DF / 400. MonitorOverlay default is 1100×420 px; target ultrawide
// screen plane 1.04×0.40 m. Compute:
//   width:  1.04 × 400 / 1100 = 0.378
//   height: 0.40 × 400 / 420  = 0.381
// Use 0.38 — matches both dimensions to ±1%.
//
// Source: 03-RESEARCH.md Pattern 12; 03-UI-SPEC.md § Per-monitor focus poses;
//         03-CONTEXT.md D-08, D-11;
//         ~/.claude/plans/neon-tabbing-workstation.md Task 2-3.

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

// Focused pose — camera ~0.85 m in front of the ultrawide monitor at
// near-eye height; the screen fills the frustum.
export const MONITOR_FOCUS_POSE: CameraPose = {
  position: [0, 1.2, 0.85],
  target: [0, 1.1, -0.05],
};

// Overview pose — room-scale. Slightly above standing eye height so the
// desk + Task 4-6 procedural decor read naturally. Target the monitor
// mid-band so overview never loses the screen.
export const DEFAULT_ORBIT_POSE: CameraPose = {
  position: [1.4, 1.6, 1.6],
  target: [0, 1.05, 0],
};

// drei <Html transform> empirical DF — see top-of-file derivation.
export const DISTANCE_FACTOR = 0.38;
