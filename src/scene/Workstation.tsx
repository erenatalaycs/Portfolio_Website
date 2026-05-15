// src/scene/Workstation.tsx
//
// Pure composition: Floor + Desk + single ultrawide Monitor (with a
// <MonitorOverlay> child holding the 5-tab content surface) + Lamp +
// Bookshelf.
//
// HS redesign (Task 2): the Phase 2/3 three-monitor mapping has been
// collapsed to a single ultrawide monitor. Content is organised across
// 5 tabs (whoami / projects / writeups / certs / contact) inside the
// monitor's <Html transform> overlay via <MonitorTabs>.
//
// v1.1 Phase 5 (ROOM-01..02): the desk-island is now enclosed by
// <Walls /> (3 inward-facing planes; back z=-2.5, left x=-2.0, right
// x=+2.0) and <Ceiling /> (slab at y=2.6 + recessed flush fixture
// emissive disc + 1 pointLight). OrbitControls.maxDistance tightened
// 4.0 → 2.6 in Plan 05-01 so the camera cannot exit the room.
//
// Source: 05-CONTEXT.md D-01..D-05, D-20..D-22, D-27; ROOM-01, ROOM-02.
//
// Monitor geometry:
//   - Frame:  1.10 × 0.46 × 0.04 m  (ultrawide ≈ 26:11)
//   - Screen: 1.04 × 0.40 m         (3 cm bezel each side, 3 cm top/bottom)
//   - Stand:  0.10 m cylinder bridging desk top (y=0.77) → frame bottom
//   - Center: y = 1.10 m (frame bottom at 0.87 m = desk top + 0.10 m stand)
//
// HTML overlay sized 1100×420 px at distanceFactor 0.38 → world
// dimensions ≈ 1.04 × 0.40 m, matches screen plane.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives;
//         03-CONTEXT.md D-01; 03-UI-SPEC.md § Monitor → content mapping
//         (superseded by single-monitor tab surface);
//         ~/.claude/plans/neon-tabbing-workstation.md Task 2.

import { Floor } from './Floor';
import { Walls } from './Walls';
import { Ceiling } from './Ceiling';
import { Window } from './Window';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Lamp } from './Lamp';
import { Bookshelf } from './Bookshelf';
import { MonitorOverlay } from './MonitorOverlay';
import { DeskDecor } from './DeskDecor';
import { WallDecor } from './WallDecor';
import { Chair } from './Chair';
import { MonitorTabs } from '../ui/MonitorTabs';

interface WorkstationProps {
  focused: boolean;
  onMonitorClick: () => void;
}

export function Workstation({ focused, onMonitorClick }: WorkstationProps) {
  return (
    <>
      <Floor />
      <Walls />
      <Ceiling />
      <Window />
      <Desk />
      <Monitor
        position={[0, 1.1, -0.05]}
        focused={focused}
        onClick={onMonitorClick}
        frameSize={[1.1, 0.46, 0.04]}
        screenSize={[1.04, 0.4]}
        standHeight={0.1}
      >
        <MonitorOverlay ariaLabel="Workstation monitor: tabbed content (whoami, projects, writeups, certs, contact)">
          <MonitorTabs />
        </MonitorOverlay>
      </Monitor>
      {/* Lamp at left-front corner of desk with a 180° y-rotation so the
          shade tilts toward -x (away from monitor center) instead of
          toward +x. Without this mirror, the shade's +0.05 local x-offset
          + tilt push the shade INTO the monitor's x extent ([-0.55, +0.55])
          even though the lamp base sits outside. With the rotation:
          - Neck at world x=-0.58 → outside monitor x range
          - Shade at world x ≈ -0.63 → clear of monitor frame entirely
          The lamp base extends 0.05 m off the desk left edge (desk x_max
          = -0.6, base radius = 0.07); minor visual cost. */}
      <Lamp position={[-0.58, 0.78, 0.18]} rotation={[0, Math.PI, 0]} />
      <Bookshelf />
      <DeskDecor />
      <WallDecor />
      <Chair />
    </>
  );
}
