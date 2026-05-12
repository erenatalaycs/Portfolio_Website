// src/scene/Monitor.tsx
//
// One monitor: frame/back + emissive screen + stand cylinder. The screen
// plane is the Phase 3 click-to-focus target; <MonitorOverlay> mounts
// above it as `children` to project DOM content.
//
// 24" 16:9 ratio: 0.55 × 0.32 m screen; 0.58 × 0.35 × 0.04 m frame
// (Phase 2 spec — 02-UI-SPEC.md § Procedural workstation primitives;
//  Phase 4 04-UI-SPEC § Real GLB swap visual contract: "Camera poses
//  unchanged from Phase 2 D-04 / Phase 3 D-08" — monitor sizing is
//  part of that contract).
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
        <boxGeometry args={[0.58, 0.35, 0.04]} />
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
        <planeGeometry args={[0.55, 0.32]} />
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
