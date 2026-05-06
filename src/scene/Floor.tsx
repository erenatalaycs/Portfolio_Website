// src/scene/Floor.tsx
//
// Subtle dark floor plane (D-05). Same colour as background but a distinct
// plane so SSAO/shadows render under the desk. NO walls, NO ceiling, NO sky.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives — Floor row;
//         02-CONTEXT.md D-05

import { SCENE_COLORS } from './colors';

export function Floor() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color={SCENE_COLORS.bg} roughness={1.0} metalness={0.0} />
    </mesh>
  );
}
