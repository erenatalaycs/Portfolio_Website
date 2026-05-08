// src/ui/MDXRenderer.tsx
//
// Phase 3 Wave 1 — placeholder. Wraps children in @mdx-js/react's
// <MDXProvider> with an EMPTY components map. Plan 03-05 (Wave 4)
// overwrites this with the real components map (h1, h2, code, a, pre,
// CodeBlock, ScreenshotFrame, ProvenanceFooter).
//
// Why ship the placeholder now: Plan 03-02 needs a stable import path
// for <MDXRenderer> when wiring monitor overlays. Empty components map
// means MDX renders use default tag-name resolution — fine for Wave 1
// because no MDX file exists yet.
//
// Source: 03-RESEARCH.md Pattern 8; 03-CONTEXT.md D-16
import { MDXProvider } from '@mdx-js/react';
import type { ReactNode } from 'react';

const components = {} as const;

export function MDXRenderer({ children }: { children: ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
