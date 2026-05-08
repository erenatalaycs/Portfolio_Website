// src/routes/WriteupsRoute.tsx
//
// Lazy-loaded text-shell route — TextShell mounts via React.lazy when
// ?focus=writeups/<slug>. MDX runtime + compiled write-ups + WriteupView
// land in this chunk only — recruiters who skim the index never download
// them (Pattern 7 Option A).
//
// Source: 03-RESEARCH.md Pattern 7 Option A; 03-UI-SPEC.md §
//         <WriteupView> in-place rendering

import { WriteupView } from '../ui/WriteupView';

interface WriteupsRouteProps {
  slug: string;
}

export default function WriteupsRoute({ slug }: WriteupsRouteProps) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto max-w-[72ch] px-4 md:px-6 py-12 font-mono text-fg"
    >
      <WriteupView slug={slug} />
    </main>
  );
}
