// src/scene/Workstation.tsx
//
// Pure composition: Floor + Desk + 3 Monitors (each with a <MonitorOverlay>
// child holding section content) + Lamp + Bookshelf. The 3 monitors now
// accept focus state + click toggle (passed down from <ThreeDShell> via
// Plan 03's <FocusController>).
//
// Monitor → content mapping (D-01):
//   Left   = <Projects />                      — projects.ts (CNT-03)
//   Center = <CenterMonitorContent />          — Whoami (Plan 04) + About + Skills
//   Right  = <WriteupsMonitor />               — list/view (Plan 05)
//
// Single source of truth: the same <Projects /> and <About />/<Skills />
// and <Writeups /> components render in BOTH shells. Adding a new entry
// in src/content/* updates both shells automatically.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives;
//         03-CONTEXT.md D-01; 03-UI-SPEC.md § Monitor → content mapping;
//         03-RESEARCH.md Example 3

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
