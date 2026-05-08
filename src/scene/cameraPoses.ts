// src/scene/cameraPoses.ts
//
// Single source of truth for Phase 3 camera poses + drei <Html>
// distanceFactor. Consumed by:
//   - <MonitorOverlay>      (DISTANCE_FACTOR)
//   - <FocusController>     (MONITOR_FOCUS_POSES + DEFAULT_ORBIT_POSE) — Plan 03
//
// Per-monitor focus poses match Phase 2 Workstation.tsx monitor positions:
//   left:   [-0.45, 0.95, -0.05]  rotation [0,  0.18, 0]
//   center: [0,     0.95, -0.05]  rotation [0,  0,    0]
//   right:  [0.45,  0.95, -0.05]  rotation [0, -0.18, 0]
//
// The +0.05/+0.10 y-offset on the focus position gives a slight head-down
// angle — natural eye level for a seated user. The +0.65/+0.7 z-offset
// places the camera ~70 cm in front of the screen plane (D-08).
//
// DISTANCE_FACTOR is the empirical calibration (Pattern 12) that scales
// the 600x400 px DOM onto the 0.55x0.32 m screen plane such that 14 px
// text is legible from default orbit pose. 1.8 is the starting point;
// verify in dev mode (Pattern 12 verification recipe).
//
// Source: 03-RESEARCH.md Pattern 12; 03-UI-SPEC.md § Per-monitor focus poses;
//         03-CONTEXT.md D-08, D-11

export type FocusId = 'left' | 'center' | 'right';

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export const MONITOR_FOCUS_POSES: Record<FocusId, CameraPose> = {
  left: { position: [-0.45, 1.0, 0.7], target: [-0.45, 0.95, -0.05] },
  center: { position: [0, 1.05, 0.65], target: [0, 0.95, -0.05] },
  right: { position: [0.45, 1.0, 0.7], target: [0.45, 0.95, -0.05] },
};

export const DEFAULT_ORBIT_POSE: CameraPose = {
  position: [2.4, 1.4, 2.4],
  target: [0, 0.6, 0],
};

// Calibrated empirically per Pattern 12. Tune at first dev render if
// 600x400 DOM doesn't fill the 0.55x0.32 m screen plane cleanly OR
// if 14 px text is unreadable at default orbit pose.
export const DISTANCE_FACTOR = 1.8;
