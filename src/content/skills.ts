// src/content/skills.ts
//
// Skill tags. Provenance rule (CNT-03 / REQUIREMENTS.md "Out of Scope"):
// every entry MUST be demonstrable in a project tagline (projects.ts) OR
// a write-up frontmatter `tags:` (Phase 3+). The parity script enforces.
//
// Lowercase, hyphen-joined for multi-word: [microsoft-365], not [Microsoft 365].
// Substring matching in the parity script normalises hyphens ↔ spaces so
// taglines can use natural prose ("Microsoft 365") while skills stay hyphenated.
//
// Source: 01-CONTEXT.md D-10; 01-UI-SPEC.md § Skills tag list

export interface SkillTag {
  name: string;
}

export const skills: SkillTag[] = [
  { name: 'python' },
  { name: 'scikit-learn' },
  { name: 'pandas' },
  { name: 'wazuh' },
  { name: 'siem' },
  { name: 'linux' },
  { name: 'microsoft-365' },
  { name: 'azure-ad' },
  { name: 'cloudflare' },
  { name: 'react' },
  { name: 'tailwind' },
  { name: 'r3f' },
];
