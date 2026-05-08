// src/ui/WriteupsMonitor.tsx
//
// OVERWRITES Plan 03-02 placeholder. Right-monitor switcher: reads
// ?focus= via useQueryParams; when focus starts with 'writeups/',
// renders <WriteupView slug={...} />; else <WriteupList />.
//
// In-place mode (D-19): the right monitor's content swaps without a
// camera animation. <FocusController> stays at 'right' regardless.
//
// Source: 03-UI-SPEC.md § <WriteupsMonitor> composition (D-19);
//         03-CONTEXT.md D-19

import { useQueryParams } from '../lib/useQueryParams';
import { WriteupList } from './WriteupList';
import { WriteupView } from './WriteupView';

export function WriteupsMonitor() {
  const params = useQueryParams();
  const focus = params.get('focus') ?? '';
  if (focus.startsWith('writeups/')) {
    const slug = focus.slice('writeups/'.length);
    return <WriteupView slug={slug} />;
  }
  return <WriteupList />;
}
