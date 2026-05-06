// src/scene/Workstation.tsx
//
// Pure composition: Floor + Desk + 3 Monitors + Lamp + Bookshelf. No state,
// no useFrame, no per-element interactivity (Phase 3 adds click-to-focus).
// 3-monitor layout per Claude's-discretion: 3 separate stands at ±0.45
// spacing with slight inward angle so all 3 fit the default camera frustum.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives;
//         02-RESEARCH.md Pattern 7; 02-CONTEXT.md D-04 (scale)

import { Floor } from './Floor';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Lamp } from './Lamp';
import { Bookshelf } from './Bookshelf';

export function Workstation() {
  return (
    <>
      <Floor />
      <Desk />
      {/* 3 monitors at desk-top + 0.2 m height (centred on screen plane);
          outermost at ±0.45 (within desk's 1.2m width) with 0.18 rad
          inward angle so the outer monitors face the camera position. */}
      <Monitor position={[-0.45, 0.95, -0.05]} rotation={[0, 0.18, 0]} />
      <Monitor position={[0, 0.95, -0.05]} rotation={[0, 0, 0]} />
      <Monitor position={[0.45, 0.95, -0.05]} rotation={[0, -0.18, 0]} />
      {/* Lamp on the left-back corner of desk top */}
      <Lamp position={[-0.5, 0.78, 0]} />
      <Bookshelf />
    </>
  );
}
