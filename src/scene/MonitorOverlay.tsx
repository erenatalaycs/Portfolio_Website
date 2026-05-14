// src/scene/MonitorOverlay.tsx
//
// The single component that wraps every monitor's DOM content with a
// drei <Html transform occlude="blending"> projection. Owns:
//   - DOM outer dimensions (HS redesign: 1100×420 px default — calibrated
//     for the 1.04×0.40 m ultrawide screen plane via DISTANCE_FACTOR.
//     world_size = CSS_px × DF / 400 → 1100 × 0.38 / 400 ≈ 1.045 m)
//   - distanceFactor calibration (cameraPoses.ts — empirical, NOT spec)
//   - opaque bg-bg backplate (UI-SPEC anti-emissive-bleed)
//   - role="region" + aria-label for screen-reader naming
//   - internal scrollable region (D-02)
//   - stopPropagation on pointer/click/wheel (Pitfall 5 + UI-SPEC §
//     Touch / pointer behaviour)
//
// The 1mm z-offset (position={[0, 0, 0.026]}) prevents z-fighting with
// the Phase 2 screen plane mesh at z=0.025 (Pitfall 3). With the
// HS-redesign monitor's larger frame depth (frameD/2 + 0.005 ≈ 0.025),
// the offset still clears.
//
// Source: 03-RESEARCH.md Pattern 3; 03-UI-SPEC.md § <MonitorOverlay> contract;
//         03-CONTEXT.md D-02, D-03;
//         ~/.claude/plans/neon-tabbing-workstation.md Task 2.

import { Html } from '@react-three/drei';
import type { ReactNode } from 'react';
import { DISTANCE_FACTOR } from './cameraPoses';

interface MonitorOverlayProps {
  children: ReactNode;
  ariaLabel: string;
  /** DOM width in pixels (default 1100 — ultrawide). */
  widthPx?: number;
  /** DOM height in pixels (default 420 — ultrawide). */
  heightPx?: number;
}

export function MonitorOverlay({
  children,
  ariaLabel,
  widthPx = 1100,
  heightPx = 420,
}: MonitorOverlayProps) {
  return (
    <Html
      transform
      occlude="blending"
      position={[0, 0, 0.026]}
      distanceFactor={DISTANCE_FACTOR}
      style={{ width: `${widthPx}px`, height: `${heightPx}px` }}
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
