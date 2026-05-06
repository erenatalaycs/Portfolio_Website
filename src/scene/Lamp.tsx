// src/scene/Lamp.tsx
//
// Simple desk lamp: cylindrical base + thin neck + cone shade + emissive
// bulb (warn amber). Claude's discretion: simple desk-lamp shape (cheapest
// geometry that reads as "lamp"). Position passed by parent; aimed roughly
// toward desk surface.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives — Lamp rows;
//         02-CONTEXT.md D-06 (no permanent blink — Phase 2 ships zero
//         per-frame animation consumers; reduced-motion gate would apply
//         if any animation were ever added)

import { SCENE_COLORS } from './colors';

interface LampProps {
  position: [number, number, number];
}

export function Lamp({ position }: LampProps) {
  return (
    <group position={position}>
      {/* Base disc: 7 cm radius, 2 cm tall */}
      <mesh castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Neck: 1.2 cm radius, 40 cm long, sitting on top of base */}
      <mesh position={[0, 0.21, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.4, 12]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.7} metalness={0.2} />
      </mesh>
      {/* Shade: open-bottom cone, tilted slightly toward desk */}
      <mesh position={[0.05, 0.46, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <coneGeometry args={[0.08, 0.1, 16, 1, true]} />
        <meshStandardMaterial
          color={SCENE_COLORS.surface}
          roughness={0.7}
          metalness={0.2}
          side={2 /* THREE.DoubleSide */}
        />
      </mesh>
      {/* Bulb: emissive warn-amber sphere inside the shade */}
      <mesh position={[0.05, 0.43, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.warn}
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
