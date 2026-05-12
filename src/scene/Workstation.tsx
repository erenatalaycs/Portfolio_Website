// src/scene/Workstation.tsx
//
// TEMP DIAG (2026-05-12): reverted to Phase 2 procedural geometry while
// isolating the Phase 4 black-scene bug. The Plan 04-06 GLB swap is
// stashed in commit 7019d08 — restore via `git show 7019d08:src/scene/Workstation.tsx`.
// If 3D appears with procedural shapes, the Poly Haven GLBs are the
// culprit (likely unit/scale convention mismatch).
//
// Original Phase 4 Plan 04-06 doc:
// Pure composition: Floor + Desk + 3 Monitors (each with a <MonitorOverlay>
// child holding section content) + Lamp + Bookshelf.

import { Floor } from './Floor';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Lamp } from './Lamp';
import { Bookshelf } from './Bookshelf';
import { MonitorOverlay } from './MonitorOverlay';
import type { FocusId } from './cameraPoses';
import { Projects } from '../sections/Projects';
import { CenterMonitorContent } from '../ui/CenterMonitorContent';
import { WriteupsMonitor } from '../ui/WriteupsMonitor';

interface WorkstationProps {
  focused: FocusId | null;
  onFocusToggle: (id: FocusId) => void;
}

export function Workstation({ focused, onFocusToggle }: WorkstationProps) {
  return (
    <>
      <Floor />
      <Desk />
      <Monitor
        position={[-0.45, 0.95, -0.05]}
        rotation={[0, 0.18, 0]}
        monitorId="left"
        focused={focused}
        onFocusToggle={onFocusToggle}
      >
        <MonitorOverlay ariaLabel="Left monitor: projects">
          <Projects />
        </MonitorOverlay>
      </Monitor>
      <Monitor
        position={[0, 0.95, -0.05]}
        rotation={[0, 0, 0]}
        monitorId="center"
        focused={focused}
        onFocusToggle={onFocusToggle}
      >
        <MonitorOverlay ariaLabel="Center monitor: identity, about, and skills">
          <CenterMonitorContent />
        </MonitorOverlay>
      </Monitor>
      <Monitor
        position={[0.45, 0.95, -0.05]}
        rotation={[0, -0.18, 0]}
        monitorId="right"
        focused={focused}
        onFocusToggle={onFocusToggle}
      >
        <MonitorOverlay ariaLabel="Right monitor: write-ups">
          <WriteupsMonitor />
        </MonitorOverlay>
      </Monitor>
      <Lamp position={[-0.5, 0.78, 0]} />
      <Bookshelf />
    </>
  );
}
