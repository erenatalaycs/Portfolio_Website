// src/scene/cameraPoses.ts
//
// Single source of truth for Phase 3 camera poses + drei <Html>
// distanceFactor. Consumed by:
//   - <MonitorOverlay>      (DISTANCE_FACTOR)
//   - <FocusController>     (MONITOR_FOCUS_POSES + DEFAULT_ORBIT_POSE) — Plan 03
//
// Per-monitor focus poses match Plan 04-06 Workstation.tsx monitor positions
// (raised from y=0.95 → y=1.075 to sit on the real GLB desk top at y=0.75 m):
//   left:   [-0.45, 1.075, -0.05]  rotation [0,  0.18, 0]
//   center: [0,     1.075, -0.05]  rotation [0,  0,    0]
//   right:  [0.45,  1.075, -0.05]  rotation [0, -0.18, 0]
//
// The +0.05/+0.10 y-offset on the focus position gives a slight head-down
// angle — natural eye level for a seated user. The +0.65/+0.7 z-offset
// places the camera ~70 cm in front of the screen plane (D-08).
//
// DEFAULT_ORBIT_POSE: pulled back to [3.0, 1.7, 3.0] and target raised to
// [0, 0.9, 0] to frame the wider real-desk envelope (1.9 m wide vs 1.2 m
// procedural). target.y=0.9 lines up with the monitor mid-band.
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
  left: { position: [-0.45, 1.45, 0.7], target: [-0.45, 1.3785, -0.05] },
  center: { position: [0, 1.48, 0.65], target: [0, 1.3785, -0.05] },
  right: { position: [0.45, 1.45, 0.7], target: [0.45, 1.3785, -0.05] },
};

export const DEFAULT_ORBIT_POSE: CameraPose = {
  position: [3.6, 1.9, 3.6],
  target: [0, 1.25, 0],
};

// drei <Html transform distanceFactor>: matrix elements multiplied by
// DF/400. Higher DF → BIGGER HTML in world (the docs are misleading;
// empirical: DF=2.6 → HTML bigger than monitor; DF=8 → way bigger;
// DF=1.3 ≈ proportional to Phase 2's DF=1.8 calibration scaled by the
// new screen plane ratio (0.385/0.55 = 0.7)).
export const DISTANCE_FACTOR = 1.3;
