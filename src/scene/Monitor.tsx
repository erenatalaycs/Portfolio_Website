// src/scene/Monitor.tsx
//
// One monitor: frame/back + emissive screen + stand cylinder. The screen
// plane is the Phase 3 click-to-focus target; <MonitorOverlay> mounts
// above it as `children` to project DOM content.
//
// HS-redesign (Task 2): geometry is now parameterised so the same
// component can render the single ultrawide (1.10 × 0.46 m frame /
// 1.04 × 0.40 m screen) without the file having to change for any
// future re-sizing. Stand height is computed by the caller so it can
// place the stand bottom on the desk top exactly (no embedded-in-desk
// volume).
//
// Click semantics (Pattern 5) — unchanged:
//   - e.stopPropagation() prevents the click from also triggering
//     <Canvas onPointerMissed> (which is the outside-click defocus trigger).
//   - onFocusToggle is called with this monitor's id; <FocusController>
//     (Plan 03) decides whether this is a focus or re-click defocus based
//     on whether focused === monitorId.
//
// Source: 02-UI-SPEC.md § Procedural workstation primitives — Monitor rows;
//         02-CONTEXT.md D-06; 02-RESEARCH.md Pattern 7;
//         03-RESEARCH.md Pattern 3 + Pattern 5;
//         03-UI-SPEC.md § Monitor refactor (Option A locked);
//         ~/.claude/plans/neon-tabbing-workstation.md Task 2.

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
  /** Frame outer dimensions [w, h, d] (meters). */
  frameSize?: [number, number, number];
  /** Screen plane dimensions [w, h] (meters); should be slightly smaller than frame for bezel. */
  screenSize?: [number, number];
  /** Stand cylinder height (meters). Stand top sits at the frame's bottom edge,
   *  so stand center is at y = -frameH/2 - standHeight/2 in group-local coords. */
  standHeight?: number;
}

export function Monitor({
  position,
  rotation = [0, 0, 0],
  monitorId,
  focused,
  onFocusToggle,
  children,
  frameSize = [0.36, 0.21, 0.04],
  screenSize = [0.34, 0.19],
  standHeight = 0.15,
}: MonitorProps) {
  const isFocused = focused === monitorId;
  const [, frameH, frameD] = frameSize;
  const [screenW, screenH] = screenSize;
  // Stand: top sits at frame bottom edge so the cylinder bridges desk → frame.
  const standCenterY = -(frameH / 2) - standHeight / 2;
  // Screen plane sits just in front of the frame's front face (frameD/2 + 0.005).
  const screenZ = frameD / 2 + 0.005;
  return (
    <group position={position} rotation={rotation}>
      {/* Frame/back */}
      <mesh castShadow>
        <boxGeometry args={frameSize} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
      {/* Screen plane — interactive (Phase 3 click-to-focus). */}
      <mesh
        position={[0, 0, screenZ]}
        onClick={(e) => {
          e.stopPropagation();
          onFocusToggle(monitorId);
        }}
      >
        <planeGeometry args={[screenW, screenH]} />
        <meshStandardMaterial
          color={SCENE_COLORS.bg}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={isFocused ? 2.0 : 1.5}
          toneMapped={false}
        />
      </mesh>
      {/* drei <Html transform occlude="blending"> overlay (Phase 3 — Plan 03-02). */}
      {children}
      {/* Stand: cylinder spans desk top → frame bottom. */}
      <mesh position={[0, standCenterY, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.06, standHeight, 16]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.1} />
      </mesh>
    </group>
  );
}
