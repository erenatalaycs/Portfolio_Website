// src/sections/Skills.tsx
// Source: 01-UI-SPEC.md § Section headings + § Skills tag list

import { skills } from '../content/skills';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { SkillTag } from '../ui/SkillTag';

export function Skills() {
  return (
    <section id="skills" className="mt-12 scroll-mt-20">
      <h2
        tabIndex={-1}
        className="text-xl font-semibold font-mono text-fg focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2"
      >
        <TerminalPrompt>
          <span className="text-fg">ls skills/</span>
        </TerminalPrompt>
      </h2>
      {skills.length === 0 ? (
        <p className="mt-3 text-muted text-base font-normal font-mono">
          # Skill list pending — populated at content-fill checkpoint.
        </p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-base">
          {skills.map((s) => (
            <SkillTag key={s.name} name={s.name} />
          ))}
        </ul>
      )}
    </section>
  );
}
