// src/scene/Ceiling.tsx
//
// v1.1 Phase 5 (ROOM-02): ceiling slab + recessed flush fixture.
//
//   - Ceiling slab: BoxGeometry(4.0, 0.05, 5.0) at (0, 2.625, 0) — interior
//     (underside) face at y = 2.6 per D-03. Same matte material as Walls
//     (roughness 0.95, metalness 0, color SCENE_COLORS.wall, receiveShadow).
//
//   - Recessed flush fixture (D-20..D-22):
//       * Emissive disc: CylinderGeometry(0.12, 0.12, 0.02, 24) at
//         (0, 2.59, 0). Disc body uses SCENE_COLORS.wall (invisible against
//         the ceiling); the emissive '#e8eef5' is what reads as the glow.
//         emissiveIntensity = EMISSIVE_BUDGET.CEILING_FIXTURE (Plan 05-01).
//       * PointLight at (0, 2.55, 0): color #d4dce4 cool white,
//         intensity 0.3, distance 4.0, decay 2.0, castShadow false (D-21 —
//         only the directional in Lighting.tsx casts shadows).
//
// Cool-white recessed-fixture tones (#e8eef5 emissive, #d4dce4 light) are
// inlined as JSX hex literals — one-off (D-22). Promote to SCENE_COLORS
// only if a second cool-white emitter ships in v1.1+.
//
// D-22 code-context decision: the fixture's pointLight lives HERE (with
// the fixture mesh), NOT in Lighting.tsx. Keeps the visible source and the
// invisible illumination paired.
//
// D-33 dynamic-light enumeration after this file lands: 4 → 5 total
// (cap = 6, headroom = 1). Phase 6 BED-03 consumes the final slot.
// Shadow-caster count stays at 1.
//
// Known minor visual oddity (NOT a blocker — surface only if it reads
// wrong in the smoke step): the directional light is at world (3, 4, 2),
// i.e. ABOVE the ceiling at y=2.6. From inside the room, the ceiling
// underside is lit only by ambient + this recessed fixture, which reads
// correctly as "lit from inside." If a smoke pass disagrees, a follow-up
// Plan 05-04 can move the directional to y < 2.6.
//
// Source: 05-CONTEXT.md D-03, D-07, D-20..D-22, D-25, D-33; ROOM-02.

import { SCENE_COLORS } from './colors';
import { EMISSIVE_BUDGET } from './emissiveBudget';

export function Ceiling() {
  return (
    <>
      {/* Ceiling slab — interior (underside) face at y = 2.6 */}
      <mesh receiveShadow position={[0, 2.625, 0]}>
        <boxGeometry args={[4.0, 0.05, 5.0]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Recessed flush fixture — emissive disc reads as the glow source.
          Inline hex "#e8eef5" is the one-off cool-white emissive (D-22);
          promote to SCENE_COLORS only if a second cool-white emitter
          ships in v1.1+. */}
      <mesh position={[0, 2.59, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 24]} />
        <meshStandardMaterial
          color={SCENE_COLORS.wall}
          emissive="#e8eef5"
          emissiveIntensity={EMISSIVE_BUDGET.CEILING_FIXTURE}
        />
      </mesh>
      {/* Cool-white fill light. castShadow=false — only the directional
          in Lighting.tsx casts shadows (1 shadow-caster cap per D-21).
          Inline hex "#d4dce4" matches the cool-white fixture; one-off
          per D-22 (see comment above). */}
      <pointLight
        position={[0, 2.55, 0]}
        color="#d4dce4"
        intensity={0.3}
        distance={4.0}
        decay={2.0}
        castShadow={false}
      />
    </>
  );
}
