// src/sections/Projects.tsx
// Source: 01-UI-SPEC.md § Section headings + § Project rows

import { projects } from '../content/projects';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { ProjectRow } from '../ui/ProjectRow';

export function Projects() {
  return (
    <section id="projects" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">ls projects/</span>
        </TerminalPrompt>
      </h2>
      {projects.length === 0 ? (
        <p className="mt-3 text-muted text-base font-normal font-mono">
          # No projects published yet — see [GitHub] for ongoing work.
        </p>
      ) : (
        <ul className="mt-3 text-base font-normal font-mono">
          {projects.map((p) => (
            <ProjectRow key={p.slug} project={p} />
          ))}
        </ul>
      )}
    </section>
  );
}
