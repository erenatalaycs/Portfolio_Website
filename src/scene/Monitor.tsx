// src/scene/Monitor.tsx
//
// One monitor: frame/back + emissive screen + stand cylinder. The screen
// plane is the Phase 3 click-to-focus target; <MonitorOverlay> mounts
// above it as `children` to project DOM content.
//
// 15" compact-monitor proportions: 0.34 × 0.19 m screen; 0.36 × 0.21
// × 0.04 m frame. Shrunk from Phase 2's 24" original (0.58 × 0.35) so
// three monitors don't overlap on the 1.2-m procedural desk top.
// At spacing 0.4 m the three frames span 1.08 m with 4 cm gaps between
// them — visually distinct rectangles, all on desk.
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
      {/* Frame/back */}
      <mesh castShadow>
        <boxGeometry args={[0.36, 0.21, 0.04]} />
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
        <planeGeometry args={[0.34, 0.19]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={isFocused ? 2.0 : 1.5}
          toneMapped={false}
        />
      </mesh>
      {/* drei <Html transform occlude="blending"> overlay (Phase 3 — Plan 03-02). */}
      {children}
      {/* Stand: cylinder from desk top to monitor bottom (spec) */}
      <mesh position={[0, -0.25, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.15, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
