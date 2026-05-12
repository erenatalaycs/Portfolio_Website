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
// Source: 02-UI-SPEC.md § Camera contract (D-08); 02-RESEARCH.md Pattern 4;
//         02-CONTEXT.md D-08, D-11;
//         03-RESEARCH.md Pattern 4 (FocusController mutates ref);
//         03-CONTEXT.md D-09 (controls.enabled = false during focus)

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
  maxDistance: 4.0,
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
