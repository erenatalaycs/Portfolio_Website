// src/scene/Monitor.tsx
//
// One monitor: frame/back + emissive screen + stand cylinder. The screen
// plane is the Phase 3 drop-in surface for drei <Html transform occlude>;
// Phase 2 ships emissive-green plane only.
//
// 24" 16:9 ratio: 0.55 × 0.32 m screen; 0.58 × 0.35 × 0.04 m frame.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives — Monitor rows;
//         02-CONTEXT.md D-06; 02-RESEARCH.md Pattern 7

import { SCENE_COLORS } from './colors';

interface MonitorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
}

export function Monitor({ position, rotation = [0, 0, 0] }: MonitorProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Frame/back */}
      <mesh castShadow>
        <boxGeometry args={[0.58, 0.35, 0.04]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Screen plane — emissive accent (Phase 2 placeholder; Phase 3
          overlays drei <Html transform occlude="blending">). */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[0.55, 0.32]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      {/* Stand: cylinder from desk top to monitor bottom */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.15, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
