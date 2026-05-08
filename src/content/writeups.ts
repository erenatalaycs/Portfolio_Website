// src/content/writeups.ts
//
// Single source of truth for write-up frontmatter + compiled MDX
// components. Vite's import.meta.glob('./writeups/*.mdx', { eager: true })
// expands at build time into a static map of file paths → modules; each
// module's default export is the compiled MDX component, and `frontmatter`
// is a named export injected by remark-mdx-frontmatter at MDX-compile time
// (Plan 03-01 wired the rollup plugin).
//
// eager: true ships compiled write-ups in the same chunk as this barrel.
// For the 3D shell, that's the ThreeDShell-*.js chunk; for the lazy
// text-shell <WriteupsRoute>, the chunk-import boundary in TextShell.tsx
// is what splits the modules out (Pattern 7 Option A).
//
// Wave 4 ships an EMPTY directory (.gitkeep is the only file). Plan 06
// (Wave 5) authors 3 MDX files; the glob picks them up automatically and
// both shells render them — no consumer code change needed.
//
// Runtime sanity check (Pitfall 9): build-time TypeScript inference is a
// CAST, not validation; we throw at first import if a frontmatter field
// is missing. Catches drift cheaply.
//
// Source: 03-RESEARCH.md Pattern 9; 03-CONTEXT.md D-14;
//         03-UI-SPEC.md § Asset Inventory; vite.dev/guide/features#glob-import

import type { ComponentType } from 'react';

export type WriteupType = 'detection' | 'cti' | 'web-auth';
export type WriteupDisclaimer = 'home-lab';

export interface WriteupFrontmatter {
  title: string;
  slug: string;
  type: WriteupType;
  date: string;
  duration: string;
  tags: string[];
  sources: string[];
  attack_techniques: string[];
  disclaimer?: WriteupDisclaimer;
  author?: string;
}

export interface Writeup extends WriteupFrontmatter {
  Component: ComponentType;
}

const modules = import.meta.glob<{
  default: ComponentType;
  frontmatter: WriteupFrontmatter;
}>('./writeups/*.mdx', { eager: true });

function assertFrontmatter(fm: WriteupFrontmatter, path: string): void {
  const required: Array<keyof WriteupFrontmatter> = [
    'title',
    'slug',
    'type',
    'date',
    'duration',
    'tags',
    'sources',
    'attack_techniques',
  ];
  for (const key of required) {
    const val = fm?.[key];
    if (
      val === undefined ||
      val === null ||
      (Array.isArray(val) && val.length === 0 && key !== 'tags')
    ) {
      throw new Error(
        `Writeup at "${path}" missing required frontmatter field: "${String(key)}". Check Plan 06 frontmatter schema (D-14).`,
      );
    }
  }
}

export const writeups: Writeup[] = Object.entries(modules)
  .map(([path, mod]) => {
    assertFrontmatter(mod.frontmatter, path);
    return {
      ...mod.frontmatter,
      Component: mod.default,
    };
  })
  .sort((a, b) => b.date.localeCompare(a.date));

export function getWriteup(slug: string): Writeup | undefined {
  return writeups.find((w) => w.slug === slug);
}
