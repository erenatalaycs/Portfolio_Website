// src/ui/WriteupsMonitor.tsx
//
// Wave 2 placeholder. Mounts the existing text-shell <Writeups /> section
// verbatim so the right-monitor's MonitorOverlay has SOMETHING to render
// and the parity audit (Plan 03-07) sees `writeups` covered by a 3D
// monitor mount.
//
// Plan 03-05 (Wave 4) overwrites this with the real list/view switcher
// driven by useQueryParams() — when ?focus=writeups → <WriteupList />,
// when ?focus=writeups/<slug> → <WriteupView slug={...} />.
//
// Source: 03-UI-SPEC.md § <WriteupsMonitor> composition (D-19);
//         03-CONTEXT.md D-19

import { Writeups } from '../sections/Writeups';

export function WriteupsMonitor() {
  return <Writeups />;
}
