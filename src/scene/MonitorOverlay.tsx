// src/scene/MonitorOverlay.tsx
//
// The single component that wraps every monitor's DOM content with a
// drei <Html transform occlude="blending"> projection. Owns:
//   - 600x400 px outer DOM size (Phase 3 D-03 real-pixel-density spec —
//     calibrated for the 24" 0.55x0.32 m screen plane)
//   - distanceFactor calibration (cameraPoses.ts)
//   - opaque bg-bg backplate (UI-SPEC anti-emissive-bleed)
//   - role="region" + aria-label for screen-reader naming
//   - internal scrollable region (D-02)
//   - stopPropagation on pointer/click/wheel (Pitfall 5 + UI-SPEC §
//     Touch / pointer behaviour)
//
// The 1mm z-offset (position={[0, 0, 0.026]}) prevents z-fighting with
// the Phase 2 screen plane mesh at z=0.025 (Pitfall 3).
//
// Source: 03-RESEARCH.md Pattern 3; 03-UI-SPEC.md § <MonitorOverlay> contract;
//         03-CONTEXT.md D-02, D-03

import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';
import { DISTANCE_FACTOR } from './cameraPoses';

interface MonitorOverlayProps {
  children: ReactNode;
  ariaLabel: string;
}

export function MonitorOverlay({ children, ariaLabel }: MonitorOverlayProps) {
  return (
    <Html
      transform
      occlude="blending"
      position={[0, 0, 0.026]}
      distanceFactor={DISTANCE_FACTOR}
      style={{ width: '600px', height: '400px' }}
      wrapperClass="monitor-overlay-wrapper"
    >
      {/*
        eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events --
        The pointer/click/wheel handlers are pure event-isolation safety belts
        (Pitfall 5 + T-03-02-05 mitigation): they stop propagation only and
        do NOT add interactive UI affordance. The semantic role here is
        "region" (a labelled scrollable landmark), not a button. Keyboard
        users interact with the focusable descendants inside `children`.
      */}
      <div
        role="region"
        aria-label={ariaLabel}
        className="w-full h-full bg-bg text-fg font-mono p-4 overflow-auto"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Html>
  );
}
