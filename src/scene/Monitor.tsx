// src/scene/Monitor.tsx
//
// One monitor: frame/back + emissive screen + stand cylinder. The screen
// plane is the Phase 3 click-to-focus target; <MonitorOverlay> mounts
// above it as `children` to project DOM content.
//
// 22" 16:9-ish ratio: 0.385 × 0.224 m screen; 0.406 × 0.245 × 0.04 m frame.
// (Scaled down from Phase 2's 24" original to feel proportional next to the
// 1.9-m real desk — 3 monitors span 1.30 m vs 1.48 m original, 68% of desk
// width vs 78%, with breathing room either side.)
//
// Phase 3 additions (Plan 03-02):
//   - children?: ReactNode prop — UI-SPEC § Monitor refactor Option A
//   - monitorId: FocusId prop — identifies which monitor for focus state
//   - focused: FocusId | null prop — drives subtle emissive-intensity feedback
//   - onFocusToggle: (id: FocusId) => void prop — fires on screen-plane click
//
// Click semantics (Pattern 5):
//   - e.stopPropagation() prevents the click from also triggering
//     <Canvas onPointerMissed> (which is the outside-click defocus trigger).
//   - onFocusToggle is called with this monitor's id; <FocusController>
//     (Plan 03) decides whether this is a focus or re-click defocus based
//     on whether focused === monitorId.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives — Monitor rows;
//         02-CONTEXT.md D-06; 02-RESEARCH.md Pattern 7;
//         03-RESEARCH.md Pattern 3 + Pattern 5;
//         03-UI-SPEC.md § Monitor refactor (Option A locked)

import type { ReactNode } from 'react';
import { SCENE_COLORS } from './colors';
import type { FocusId } from './cameraPoses';

interface MonitorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  monitorId: FocusId;
  focused: FocusId | null;
  onFocusToggle: (id: FocusId) => void;
  children?: ReactNode;
}

export function Monitor({
  position,
  rotation = [0, 0, 0],
  monitorId,
  focused,
  onFocusToggle,
  children,
}: MonitorProps) {
  const isFocused = focused === monitorId;
  return (
    <group position={position} rotation={rotation}>
      {/* Frame/back — 22" monitor proportions */}
      <mesh castShadow>
        <boxGeometry args={[0.406, 0.245, 0.04]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Screen plane — interactive (Phase 3 click-to-focus). */}
      <mesh
        position={[0, 0, 0.025]}
        onClick={(e) => {
          e.stopPropagation();
          onFocusToggle(monitorId);
        }}
      >
        <planeGeometry args={[0.385, 0.224]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={isFocused ? 2.0 : 1.5}
          toneMapped={false}
        />
      </mesh>
      {/* drei <Html transform occlude="blending"> overlay (Phase 3 — Plan 03-02). */}
      {children}
      {/* Stand: cylinder positioned so its top touches the frame bottom
          (frame extends from y=−0.1225 to y=+0.1225; stand length 0.15
          centred at y=−0.1975 → top at y=−0.1225, bottom at y=−0.2725).
          Monitor.y in Workstation.tsx is set to 0.75 + 0.2725 = 1.0225
          so the stand bottom rests on the new desk top (y=0.75). */}
      <mesh position={[0, -0.1975, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.15, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
