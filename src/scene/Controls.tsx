// src/scene/Controls.tsx
//
// drei <OrbitControls> with hybrid clamp swap (D-08). Default mode='orbit'
// applies the 6 mid-tier clamps; mode='free' omits them (drei defaults =
// full sphere). Damping is gated by useReducedMotion (UI-SPEC: only motion
// difference between reduced and standard users).
//
// Phase 3 additions (Plan 03-03):
//   - forwardRef so <FocusController> can mutate controls.enabled +
//     controls.target directly via the ref.
//   - optional `enabled` prop — when defined, drives OrbitControls.enabled
//     directly (used during camera focus animation to disable drag);
//     when undefined, drei defaults to true.
//
// Phase 5 update (D-27, ROOM-01): maxDistance tightened 4.0 → 2.6
// because Plan 05-02 walls bound the room at z=-2.5 / x=±2.0 / y=2.6;
// room half-diagonal ≈ 3.4 m, but the camera target (0, 0.85, 0)
// keeps the camera comfortably inside at distance 2.6. Both shipped
// poses (overview, focused-on-monitor) still frame correctly:
//   - overview pose distance ≈ 2.20 m (< 2.6 ✓)
//   - focused pose distance ≈ 0.91 m (already < minDistance 1.2;
//     unchanged from pre-Phase-5 — initial pose is set imperatively
//     by FocusController and is allowed to violate clamps until the
//     user drags).
//
// Source: 02-UI-SPEC.md § Camera contract (D-08); 02-RESEARCH.md Pattern 4;
//         02-CONTEXT.md D-08, D-11;
//         03-RESEARCH.md Pattern 4 (FocusController mutates ref);
//         03-CONTEXT.md D-09 (controls.enabled = false during focus);
//         05-CONTEXT.md D-27 (maxDistance 4.0 → 2.6)

import { forwardRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { CameraMode } from '../ui/CameraToggle';
import { useReducedMotion } from '../lib/useReducedMotion';

interface ControlsProps {
  cameraMode: CameraMode;
  enabled?: boolean;
}

const ORBIT_CLAMPS = {
  minPolarAngle: Math.PI / 3,
  maxPolarAngle: Math.PI * (100 / 180),
  minAzimuthAngle: -Math.PI / 2,
  maxAzimuthAngle: Math.PI / 2,
  minDistance: 1.2,
  maxDistance: 2.6,
} as const;

export const Controls = forwardRef<OrbitControlsImpl, ControlsProps>(function Controls(
  { cameraMode, enabled },
  ref,
) {
  const reduced = useReducedMotion();
  const clamps = cameraMode === 'orbit' ? ORBIT_CLAMPS : {};
  const enabledProp = enabled === undefined ? {} : { enabled };
  return (
    <OrbitControls
      ref={ref}
      makeDefault
      target={[0, 0.85, 0]}
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={0.08}
      {...clamps}
      {...enabledProp}
    />
  );
});
