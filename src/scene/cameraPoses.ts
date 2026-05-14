// src/scene/cameraPoses.ts
//
// Single source of truth for camera poses + drei <Html> distanceFactor.
// Consumed by:
//   - <MonitorOverlay>      (DISTANCE_FACTOR)
//   - <FocusController>     (MONITOR_FOCUS_POSES + DEFAULT_ORBIT_POSE)
//
// HS redesign (Task 2): the scene now hosts a single ultrawide monitor
// at world position [0, 1.10, -0.05]. The Phase 3 three-pose contract
// (left / center / right) survives in the FocusId type for backward
// compatibility with FocusController's URL parser, but only `center` is
// actually targeted; `left` and `right` fall back to the same pose.
// Task 3 will collapse FocusId to a 2-state boolean.
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
//         ~/.claude/plans/neon-tabbing-workstation.md Task 2.

export type FocusId = 'left' | 'center' | 'right';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

// Monitor frame center at [0, 1.10, -0.05] (Workstation.tsx). Focus pose
// places camera ~0.85 m in front of the monitor at near-eye height — the
// ultrawide screen fills the frustum at this distance.
const MONITOR_FOCUS_POSE: CameraPose = {
  position: [0, 1.20, 0.85],
  target: [0, 1.10, -0.05],
};

export const MONITOR_FOCUS_POSES: Record<FocusId, CameraPose> = {
  left: MONITOR_FOCUS_POSE,
  center: MONITOR_FOCUS_POSE,
  right: MONITOR_FOCUS_POSE,
};

// Overview pose — the "room-scale" camera. Sits slightly above standing
// eye height to show desk + decor (Task 4-6 procedural decor) from a
// natural angle. Target the monitor mid-band (y=1.10) so the camera
// always frames the screen.
export const DEFAULT_ORBIT_POSE: CameraPose = {
  position: [1.4, 1.6, 1.6],
  target: [0, 1.05, 0],
};

// drei <Html transform> empirical DF — see top-of-file derivation.
export const DISTANCE_FACTOR = 0.38;
