// src/ui/CenterMonitorContent.tsx
//
// Composition for the center monitor's <Html transform> overlay:
//   - sticky <WhoamiGreeting> at top (Plan 03-04 inserts; Wave 2 ships an
//     empty sticky placeholder so the layout doesn't shift when WhoamiGreeting
//     lands)
//   - <About /> body                          — single source of truth
//   - <Skills /> tag list                     — single source of truth
//
// Single scrollable container (D-04). The sticky-top WhoamiGreeting block
// stays visible as the user scrolls down to read About + Skills.
//
// Source: 03-UI-SPEC.md § <CenterMonitorContent> composition (D-04);
//         03-CONTEXT.md D-04

import { About } from '../sections/About';
import { Skills } from '../sections/Skills';

export function CenterMonitorContent() {
  return (
    <div className="space-y-6">
      {/* sticky <WhoamiGreeting /> mount slot — filled by Plan 03-04 */}
      <About />
      <Skills />
    </div>
  );
}
