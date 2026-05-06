// src/ui/ProjectRow.tsx
//
// Single project row: `[<status-bracket-if-not-shipped>] <slug> — <tagline>`.
// Slug is an <a> linking to GitHub or in-page anchor; em-dash separator;
// hover/focus surfaces the bg-surface-1 + 2px left border affordance.
//
// Source: 01-UI-SPEC.md § Project rows; D-13

import type { Project } from '../content/projects';
import { BracketLink } from './BracketLink';

interface ProjectRowProps {
  project: Project;
}

export function ProjectRow({ project }: ProjectRowProps) {
  // Shipped → no leading bracket per UI-SPEC.
  // In-progress / planned → warn-color [ ] leading bracket.
  const leadingBracket =
    project.status === 'shipped' ? null : <span className="text-warn">[ ]</span>;

  const slugNode = project.href ? (
    <BracketLink
      href={project.href}
      external={project.href.startsWith('http')}
      className="px-0 mx-0"
    >
      {project.slug}
    </BracketLink>
  ) : (
    <span className="text-fg">{project.slug}</span>
  );

  return (
    <li
      className={[
        'flex flex-wrap items-baseline gap-x-2 py-1',
        'hover:bg-surface-1 hover:border-l-2 hover:border-l-accent hover:-ml-2 hover:pl-2',
        'focus-within:bg-surface-1 focus-within:border-l-2 focus-within:border-l-accent focus-within:-ml-2 focus-within:pl-2',
      ].join(' ')}
    >
      {leadingBracket && <span className="font-mono">{leadingBracket}</span>}
      <span className="font-mono">{slugNode}</span>
      <span className="text-fg font-mono">— {project.tagline}</span>
    </li>
  );
}
