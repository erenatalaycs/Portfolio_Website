// src/content/skills.ts
//
// Skill tags. Provenance rule (CNT-03 / REQUIREMENTS.md "Out of Scope"):
// every entry MUST be demonstrable in a project (projects.ts) or write-up
// (Phase 3). Don't pad with tools you've only opened once.
//
// Lowercase, hyphen-joined for multi-word: [active-directory], not [Active Directory].
//
// Source: 01-CONTEXT.md D-10; 01-UI-SPEC.md § Skills tag list

export interface SkillTag {
  name: string;
}

export const skills: SkillTag[] = [
  // TODO(checkpoint): Eren replaces with the real list. Suggested honest
  // defaults below (commented) — uncomment only the entries demonstrable in
  // a project or write-up. Plan 07 OPSEC reviews provenance before launch.
  // { name: 'python' },
  // { name: 'bash' },
  // { name: 'wireshark' },
  // { name: 'splunk' },
  // { name: 'nmap' },
  // { name: 'linux' },
  // { name: 'git' },
  // { name: 'tcp-ip' },
  // { name: 'mitre-att&ck' },
];
