// src/scene/Desk.tsx
//
// Desk top + 4 legs in surface-1 colour. Real-life-scaled: 1.2m wide ×
// 0.6m deep × 0.75m tall (D-04).
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives;
//         02-CONTEXT.md D-04, D-06; 02-RESEARCH.md Pattern 7

import { SCENE_COLORS } from './colors';

const LEG_POSITIONS: Array<[number, number, number]> = [
  [-0.55, 0.365, -0.25],
  [0.55, 0.365, -0.25],
  [-0.55, 0.365, 0.25],
  [0.55, 0.365, 0.25],
];

export function Desk() {
  return (
    <group>
      {/* Top: 1.2 × 0.04 × 0.6 m, top surface at y = 0.75 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.04, 0.6]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.8} metalness={0.05} />
      </mesh>
      {/* 4 legs: 0.05 × 0.73 × 0.05 */}
      {LEG_POSITIONS.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={[0.05, 0.73, 0.05]} />
          <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.8} metalness={0.05} />
        </mesh>
      ))}
    </group>
  );
}
