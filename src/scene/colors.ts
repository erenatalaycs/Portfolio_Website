// src/scene/colors.ts
//
// HEX mirror of src/styles/tokens.css @theme tokens. Three.js materials
// cannot read CSS custom properties — values are mirrored manually here.
// The sibling test (colors.test.ts) parses tokens.css and asserts parity,
// so any change to tokens.css that's not reflected here fails CI.
//
// Source: 02-UI-SPEC.md § Color § How Phase 1 tokens map to Three.js
//         materials (D-06); 02-RESEARCH.md Pattern 8

export const SCENE_COLORS = {
  bg: '#0d1117', // matches --color-bg
  surface: '#161b22', // matches --color-surface-1
  accent: '#7ee787', // matches --color-accent
  warn: '#e3b341', // matches --color-warn
} as const;

export type SceneColorKey = keyof typeof SCENE_COLORS;
