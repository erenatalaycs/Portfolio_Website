// src/3d/PostFX.tsx
//
// Lazy-loaded postprocessing pipeline (CONTEXT D-08, REQUIREMENTS 3D-08).
// Mounted only when ScenePostprocessing's perfTier === 'high'.
//
// API names are VERIFIED via @react-three/postprocessing@3.0.4 source
// inspection (RESEARCH Pattern 5):
//   - Bloom uses `luminanceThreshold` (NOT the unprefixed `threshold`
//     name — CONTEXT D-08 wrote it incorrectly; the React wrapper passes
//     unknown props through verbatim, so the unprefixed form is silently
//     ignored and Bloom falls back to its default of 1.0).
//   - `opacity` on Scanline + Noise is NOT a constructor option of the
//     underlying postprocessing@6.x Effect class — it is exposed by
//     @react-three/postprocessing's wrapEffect helper, which routes it
//     to `blendMode-opacity-value`. R3F's extend() reconciler then
//     sets `effect.blendMode.opacity.value = opacity`. Do NOT
//     "refactor" by removing or splitting these props.
//   - ChromaticAberration `offset` is a Vector2 tuple [x, y] (NOT scalar).
//   - EffectComposer multisampling default in @react-three/postprocessing@3
//     is 8 — explicitly setting 0 disables MSAA for low-end GPU
//     friendliness; mipmapBlur on Bloom is the dominant antialiasing path.
//
// Forbidden effects: see "Anti-Pattern Audit" in 04-UI-SPEC.md
// (depth-of-field blurs monitor text; ambient occlusion is too costly
// in dark scenes; permanent glitch nauseates; halftone screens read as
// print not CRT; pixelation destroys text readability).
//
// Source: 04-CONTEXT.md D-08; 04-RESEARCH.md Pattern 5;
//   04-UI-SPEC.md § Postprocessing Pipeline Color Contract

import {
  EffectComposer,
  Bloom,
  Scanline,
  ChromaticAberration,
  Noise,
} from '@react-three/postprocessing';

export function PostFX() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.025} intensity={0.6} mipmapBlur />
      <Scanline density={1.25} opacity={0.15} />
      <ChromaticAberration offset={[0.0008, 0.0008]} />
      <Noise opacity={0.04} />
    </EffectComposer>
  );
}
