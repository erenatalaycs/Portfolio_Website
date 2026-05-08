#!/usr/bin/env node
// scripts/check-parity.mjs
//
// TXT-06 + CNT-03 + Pitfall 8 parity audit. Runs in CI BEFORE `vite build`
// (gated via package.json scripts.build chain). Exits non-zero with a
// human-readable error message on drift; exits 0 on pass.
//
// Three assertions, all collected (one error does not short-circuit the
// others — easier to diagnose multi-source drift in one CI run):
//
//  1. TXT-06 — every SECTIONS id has a text-shell render
//              (src/sections/<Title>.tsx exists, case-insensitive)
//              OR is in THREE_D_MOUNTS values (3D mount covers it)
//  2. CNT-03 — every skills.ts tag appears (case-insensitive, hyphen-
//              normalised) in some project tagline OR some write-up
//              frontmatter `tags:` array
//  3. Pitfall 8 — every ATT&CK id referenced in writeups[*].attack_techniques
//                 exists as a key in src/content/attack-techniques.ts
//
// Hand-maintained 3D mount mapping (RESEARCH Pattern 11) — JSX AST parsing
// is fragile; the const below is THE single source of truth for which
// sections are covered by 3D-shell monitor mounts. UPDATE when Phase 3+
// adds another monitor mount.
//
// Source: 03-RESEARCH.md Pattern 11; 03-UI-SPEC.md § Section parity audit;
//         03-CONTEXT.md D-19

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const THREE_D_MOUNTS = {
  left: ['projects'],
  center: ['about', 'skills', 'whoami'],
  right: ['writeups'],
};

const errors = [];

// ─── Assertion 1: TXT-06 section parity ───────────────────────────────────
function assertSectionParity() {
  const sectionsPath = join(ROOT, 'src/content/sections.ts');
  const sectionsSource = readFileSync(sectionsPath, 'utf8');
  const sectionIds = [...sectionsSource.matchAll(/id:\s*'([^']+)'/g)].map((m) => m[1]);

  if (sectionIds.length === 0) {
    errors.push(`TXT-06: no SECTIONS ids extracted from ${sectionsPath} — regex drift?`);
    return;
  }

  const threeDIds = new Set(Object.values(THREE_D_MOUNTS).flat());
  const sectionsDir = join(ROOT, 'src/sections');
  const sectionFiles = readdirSync(sectionsDir).map((f) => f.toLowerCase());

  for (const id of sectionIds) {
    const expectedFile = `${id.toLowerCase()}.tsx`;
    const hasTextRender = sectionFiles.includes(expectedFile);
    const hasThreeDMount = threeDIds.has(id);
    if (!hasTextRender && !hasThreeDMount) {
      errors.push(
        `TXT-06: section id "${id}" has no text-shell render (expected src/sections/${id[0].toUpperCase()}${id.slice(1)}.tsx) and no 3D mount in THREE_D_MOUNTS — recruiters cannot reach it.`,
      );
    }
  }
}

// ─── Assertion 2: CNT-03 skills provenance ────────────────────────────────
function normaliseForMatch(s) {
  // Lowercase + replace hyphens with spaces so "microsoft-365" matches
  // "Microsoft 365" and vice versa.
  return s.toLowerCase().replace(/-/g, ' ');
}

function assertSkillsProvenance() {
  const skillsPath = join(ROOT, 'src/content/skills.ts');
  const skillsSource = readFileSync(skillsPath, 'utf8');
  const skillNames = [...skillsSource.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]);

  if (skillNames.length === 0) {
    // Empty list is allowed (Phase 1 ships an empty placeholder). Skip silently.
    return;
  }

  // Provenance corpus: project taglines + write-up frontmatter tags
  const projectsSource = readFileSync(join(ROOT, 'src/content/projects.ts'), 'utf8');
  const projectTaglines = [...projectsSource.matchAll(/tagline:\s*\n?\s*'([^']+)'/g)].map(
    (m) => m[1],
  );

  const writeupsDir = join(ROOT, 'src/content/writeups');
  const writeupTags = [];
  if (existsSync(writeupsDir)) {
    for (const file of readdirSync(writeupsDir)) {
      if (!file.endsWith('.mdx')) continue;
      const mdx = readFileSync(join(writeupsDir, file), 'utf8');
      // Extract `tags: [a, b, c]` or `tags:\n  - a\n  - b` from the frontmatter
      const inlineTagsMatch = mdx.match(/^tags:\s*\[([^\]]+)\]/m);
      if (inlineTagsMatch) {
        writeupTags.push(
          ...inlineTagsMatch[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')),
        );
      }
      const blockTagsMatch = mdx.match(/^tags:\s*\n((?:\s+-\s+[^\n]+\n?)+)/m);
      if (blockTagsMatch) {
        writeupTags.push(
          ...blockTagsMatch[1]
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.startsWith('- '))
            .map((line) =>
              line
                .slice(2)
                .trim()
                .replace(/^["']|["']$/g, ''),
            ),
        );
      }
    }
  }

  const corpus = [...projectTaglines.map(normaliseForMatch), ...writeupTags.map(normaliseForMatch)];

  for (const skill of skillNames) {
    const needle = normaliseForMatch(skill);
    const hit = corpus.some((entry) => entry.includes(needle));
    if (!hit) {
      errors.push(
        `CNT-03: skill "${skill}" has no provenance — does not appear in any project tagline or write-up frontmatter tag. Either add a project that demonstrates it OR remove from skills.ts (provenance rule).`,
      );
    }
  }
}

// ─── Assertion 3: Pitfall 8 ATT&CK lookup completeness ─────────────────────
function assertAttackLookupCompleteness() {
  const writeupsDir = join(ROOT, 'src/content/writeups');
  if (!existsSync(writeupsDir)) return;

  const referenced = new Set();
  for (const file of readdirSync(writeupsDir)) {
    if (!file.endsWith('.mdx')) continue;
    const mdx = readFileSync(join(writeupsDir, file), 'utf8');
    // Extract `attack_techniques: ['T1140', 'T1105']` or block form
    const inline = mdx.match(/^attack_techniques:\s*\[([^\]]+)\]/m);
    if (inline) {
      inline[1]
        .split(',')
        .map((t) => t.trim().replace(/^["']|["']$/g, ''))
        .forEach((id) => referenced.add(id));
    }
    const block = mdx.match(/^attack_techniques:\s*\n((?:\s+-\s+[^\n]+\n?)+)/m);
    if (block) {
      block[1]
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.startsWith('- '))
        .map((line) =>
          line
            .slice(2)
            .trim()
            .replace(/^["']|["']$/g, ''),
        )
        .forEach((id) => referenced.add(id));
    }
  }

  if (referenced.size === 0) return;

  const lookupPath = join(ROOT, 'src/content/attack-techniques.ts');
  if (!existsSync(lookupPath)) {
    errors.push(
      `Pitfall 8: writeups reference ATT&CK techniques (${[...referenced].join(', ')}) but src/content/attack-techniques.ts is missing.`,
    );
    return;
  }
  const lookupSource = readFileSync(lookupPath, 'utf8');
  for (const id of referenced) {
    // Match "T1140": '...' or 'T1140': "..." as object key
    const keyPattern = new RegExp(`['"\`]${id.replace(/\./g, '\\.')}['"\`]\\s*:`);
    if (!keyPattern.test(lookupSource)) {
      errors.push(
        `Pitfall 8: ATT&CK id "${id}" referenced in writeup frontmatter but missing from attack-techniques.ts — ProvenanceFooter would render fallback "(unknown technique)".`,
      );
    }
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────
assertSectionParity();
assertSkillsProvenance();
assertAttackLookupCompleteness();

if (errors.length > 0) {
  console.error(
    `\n✗ Parity audit failed (${errors.length} error${errors.length === 1 ? '' : 's'}):\n`,
  );
  for (const err of errors) console.error(`  • ${err}`);
  console.error('');
  process.exit(1);
}

console.log('✓ Parity audit passed: TXT-06 + CNT-03 + Pitfall 8 all green.');
