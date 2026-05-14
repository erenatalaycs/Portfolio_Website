// src/scene/Chair.tsx
//
// Simple procedural office chair: seat + backrest + center column + base
// disc. Office-chair shape (single column + circular base) reads more
// "workstation" than four-legged kitchen-chair geometry; same vertex
// budget. Slight y-rotation so it doesn't read as a perfectly aligned
// CAD model.
//
// Position rationale:
//   - Desk at z=0 (front edge at z=0.30); person sits facing -z.
//   - Seat center at z=0.55 — just in front of desk edge so the
//     person's "legs" go under the desk top.
//   - Backrest center at z=0.73 — behind the seat (further from desk,
//     between camera and desk).
//   - In overview pose ([1.4, 1.6, 1.6]) the chair reads as foreground;
//     in focused pose ([0, 1.20, 0.85]) the chair is behind the camera
//     (z > 0.85) → never occludes the monitor.
//
// Source: ~/.claude/plans/neon-tabbing-workstation.md Task 6.

import { SCENE_COLORS } from './colors';

export function Chair() {
  return (
    <group position={[0, 0, 0.55]} rotation={[0, 0.08, 0]}>
      {/* Seat: 0.42 × 0.05 × 0.42 at y = 0.45 */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.05, 0.42]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Backrest: 0.42 × 0.55 × 0.06, centered at z = +0.18 (behind seat),
          y = 0.75 (so it spans from seat top y=0.475 to y=1.025). */}
      <mesh position={[0, 0.75, 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.55, 0.06]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.7} metalness={0.15} />
      </mesh>
      {/* Center column: cylinder r=0.03, h=0.40, at y=0.225 — spans floor
          base disc to seat bottom. */}
      <mesh position={[0, 0.225, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.55} metalness={0.4} />
      </mesh>
      {/* Base disc: r=0.22, h=0.02 at floor (y=0.01). */}
      <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.22, 0.02, 24]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.55} metalness={0.4} />
      </mesh>
    </group>
  );
}
