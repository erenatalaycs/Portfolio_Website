// src/ui/SkillTag.tsx
//
// Non-interactive [tag] rendering. Skills are statements of fact, not links.
// Forbidden: skill bars, percentages, star ratings, color-coded levels.
//
// Source: 01-UI-SPEC.md § Skills tag list; D-10

interface SkillTagProps {
  name: string;
}

export function SkillTag({ name }: SkillTagProps) {
  return (
    <li className="text-accent text-sm font-mono whitespace-nowrap">
      [<span className="text-accent">{name}</span>]
    </li>
  );
}
