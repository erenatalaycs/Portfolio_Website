// src/content/index.ts
// Barrel export — every consumer imports from '../content' (not from individual files).

export { SECTIONS } from './sections';
export type { SectionId } from './sections';
export { identity } from './identity';
export type { Identity } from './identity';
export { projects } from './projects';
export type { Project, ProjectStatus } from './projects';
export { certs } from './certs';
export type { Cert, CertStatus } from './certs';
export { skills } from './skills';
export type { SkillTag } from './skills';
export { education } from './education';
export type { EducationEntry } from './education';
