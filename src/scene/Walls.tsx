// src/scene/Walls.tsx
//
// v1.1 Phase 5 (ROOM-01): three inward-facing wall planes bounding the
// desk-island. Back wall at z = -2.5, left wall at x = -2.0, right wall
// at x = +2.0 (D-03). Each wall is a BoxGeometry slab 0.05 m thick (D-02)
// with a matte MeshStandardMaterial — roughness 0.95, metalness 0 (D-05) —
// reading `SCENE_COLORS.wall` (#0c0e12) from Plan 05-01.
//
// All three walls `receiveShadow`; the project's single shadow-caster is
// the directional light at (3, 4, 2) in Lighting.tsx (D-21 — cap = 1
// shadow-caster).
//
// D-30 discretion call: a SINGLE `Walls` component renders all three wall
// meshes inline instead of breaking out `WallLeft` / `WallRight` /
// `WallBack` subcomponents — three meshes that share the same material is
// not enough surface area to justify three exports.
//
// Source: 05-CONTEXT.md D-01..D-05, D-30; ROOM-01.

import { SCENE_COLORS } from './colors';

// Documented dimensions (D-01..D-03). Positions below use the inlined
// literals so they read against the plan's grep gates and against the
// physical-assembly math in the file header.
const ROOM_WIDTH = 4.0;
const ROOM_DEPTH = 5.0;
const ROOM_HEIGHT = 2.6;
const WALL_THICKNESS = 0.05;

export function Walls() {
  return (
    <>
      {/* Back wall — interior face z = -2.5 (slab center z = -2.525) */}
      <mesh receiveShadow position={[0, 1.3, -2.525]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Left wall — interior face x = -2.0 (slab center x = -2.025) */}
      <mesh receiveShadow position={[-2.025, 1.3, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Right wall — interior face x = +2.0 (slab center x = +2.025) */}
      <mesh receiveShadow position={[2.025, 1.3, 0]}>
        <boxGeometry args={[WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
    </>
  );
}
