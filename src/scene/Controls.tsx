// src/scene/Controls.tsx
//
// drei <OrbitControls> with hybrid clamp swap (D-08). Default mode='orbit'
// applies the 6 mid-tier clamps; mode='free' omits them (drei defaults =
// full sphere). Damping is gated by useReducedMotion (UI-SPEC: only motion
// difference between reduced and standard users).
//
// Source: 02-UI-SPEC.md § Camera contract (D-08); 02-RESEARCH.md Pattern 4;
//         02-CONTEXT.md D-08, D-11

import { OrbitControls } from '@react-three/drei';
import type { CameraMode } from '../ui/CameraToggle';
import { useReducedMotion } from '../lib/useReducedMotion';

interface ControlsProps {
  cameraMode: CameraMode;
}

const ORBIT_CLAMPS = {
  minPolarAngle: Math.PI / 3, // 60°
  maxPolarAngle: Math.PI * (100 / 180), // 100°
  minAzimuthAngle: -Math.PI / 2, // -90°
  maxAzimuthAngle: Math.PI / 2, // +90°
  minDistance: 1.2,
  maxDistance: 4.0,
} as const;

export function Controls({ cameraMode }: ControlsProps) {
  const reduced = useReducedMotion();
  // Free mode: spread an empty object → drei OrbitControls uses its defaults
  // (full polar + azimuth + zoom). Prop-swap, NOT key-swap (RESEARCH
  // anti-pattern note — never remount controls per render).
  const clamps = cameraMode === 'orbit' ? ORBIT_CLAMPS : {};
  return (
    <OrbitControls
      makeDefault
      target={[0, 0.6, 0]}
      enablePan={false}
      enableDamping={!reduced}
      dampingFactor={0.08}
      {...clamps}
    />
  );
}
