// src/ui/WriteupView.tsx
//
// Single-write-up renderer. Resolves slug via getWriteup(); falls
// through to <NotFound /> on miss (UI-SPEC § Empty/placeholder states).
//
// Renders:
//   - [← back to list] button (top-left absolute; updates ?focus=writeups)
//   - <MDXRenderer><Component /></MDXRenderer>
//   - auto-mounted <ProvenanceFooter frontmatter={...} />
//
// Source: 03-RESEARCH.md Pattern 10c auto-mount; 03-UI-SPEC.md §
//         <WriteupView>; 03-CONTEXT.md D-19

import { BracketLink } from './BracketLink';
import { NotFound } from './NotFound';
import { MDXRenderer } from './MDXRenderer';
import { ProvenanceFooter } from './ProvenanceFooter';
import { getWriteup } from '../content/writeups';
import { setQueryParams } from '../lib/useQueryParams';

interface WriteupViewProps {
  slug: string;
}

export function WriteupView({ slug }: WriteupViewProps) {
  const writeup = getWriteup(slug);
  if (!writeup) return <NotFound />;
  const { Component, ...frontmatter } = writeup;
  return (
    <article className="relative font-mono">
      <div className="absolute top-4 left-4 z-10">
        <BracketLink
          as="button"
          onClick={(e) => {
            e.preventDefault();
            setQueryParams({ focus: 'writeups' });
          }}
          ariaLabel="Back to write-ups list"
        >
          ← back to list
        </BracketLink>
      </div>
      <div className="pt-12 text-fg text-base font-normal leading-relaxed">
        <MDXRenderer>
          <Component />
        </MDXRenderer>
        <ProvenanceFooter frontmatter={frontmatter} />
      </div>
    </article>
  );
}
