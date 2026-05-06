// src/scene/Bookshelf.tsx
//
// Back panel + 3 shelf planes. Claude's discretion: bare shelves (cheapest
// geometry; box-stack books deferred to Phase 4 GLB). 1.0 m wide × 1.5 m
// tall × 0.04 m thick panel behind the desk.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives — Bookshelf rows;
//         02-CONTEXT.md D-06

import { SCENE_COLORS } from './colors';

const SHELF_HEIGHTS = [0.45, 0.85, 1.25];

export function Bookshelf() {
  return (
    <group position={[0, 0.75, -0.6]}>
      {/* Back panel: 1.0 × 1.5 × 0.04 m, centred at y=0.75 (so bottom at y=0,
          top at y=1.5). Position group y=0.75 means panel origin at world y=0.75. */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.0, 1.5, 0.04]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* 3 shelf planes — relative to group origin (which is at desk-top height). */}
      {SHELF_HEIGHTS.map((y, i) => (
        <mesh key={i} position={[0, y - 0.75, 0.13]} castShadow receiveShadow>
          <boxGeometry args={[0.96, 0.02, 0.25]} />
          <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.8} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}
