// src/scene/Workstation.tsx
//
// Pure composition: Floor + Desk + 3 Monitors (each with a <MonitorOverlay>
// child holding section content) + Lamp + Bookshelf. The 3 monitors now
// accept focus state + click toggle (passed down from <ThreeDShell> via
// Plan 03's <FocusController>).
//
// Task 1 (HS redesign — interim state): the center monitor's content is
// now a 5-tab surface (<MonitorTabs />). Left/right monitors still hold
// Projects + WriteupsMonitor as in Phase 3 — those will be removed in
// Task 2 when the scene collapses to a single ultrawide monitor.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives;
//         03-CONTEXT.md D-01; 03-UI-SPEC.md § Monitor → content mapping;
//         03-RESEARCH.md Example 3;
//         ~/.claude/plans/neon-tabbing-workstation.md — Task 1 + Task 2.

import { Floor } from './Floor';
import { Desk } from './Desk';
import { Monitor } from './Monitor';
import { Lamp } from './Lamp';
import { Bookshelf } from './Bookshelf';
import { MonitorOverlay } from './MonitorOverlay';
import type { FocusId } from './cameraPoses';
import { Projects } from '../sections/Projects';
import { MonitorTabs } from '../ui/MonitorTabs';
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
        position={[-0.4, 0.95, -0.05]}
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
        <MonitorOverlay ariaLabel="Center monitor: tabbed content (whoami, projects, writeups, certs, contact)">
          <MonitorTabs />
        </MonitorOverlay>
      </Monitor>
      <Monitor
        position={[0.4, 0.95, -0.05]}
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
