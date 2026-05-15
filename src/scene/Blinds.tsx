// src/scene/Blinds.tsx
//
// v1.1 Phase 5 (ROOM-03): horizontal venetian-blinds group, half-open
// posture (D-12..D-15). 14 thin BoxGeometry slats stacked along the Y
// axis, each tilted ~30° around the X axis. Aluminum sheen via
// MeshStandardMaterial (`#c8cdd4` / roughness 0.45 / metalness 0.55 —
// subtle, not chrome).
//
// Parented inside <Window /> (not directly inside Workstation), so the
// component takes optional position/rotation props that the parent can
// pass without coupling — every other scene component follows the same
// "optional position/rotation" pattern (see Lamp.tsx).
//
// D-15: parent group has a single Y position so v1.2 can add a
// raise/lower animation. In v1.1 the position is static — no
// per-frame animation hook is used in this component (the acceptance
// grep enforces the per-frame-hook ban).
//
// Z-fight prevention: slats sit at the parent's local origin and the
// parent (<Window />) positions them at z=+0.02 relative to the glass
// pane, so the slats render clearly in front of the glass without
// punching into it.
//
// Source: 05-CONTEXT.md D-08, D-12..D-15; ROOM-03.

// Slat dimensions are inlined in the boxGeometry args literal below so
// the plan's grep gate (`grep -F '1.2, 0.025, 0.012'`) matches against
// the source. The other tuning constants stay named.
const SLAT_COUNT = 14;
const SLAT_Y_RANGE_HALF = 0.75; // slats span Y ∈ [-0.75, +0.75]
const SLAT_TILT_X = Math.PI / 6; // 30° half-open posture (D-13)
const SLAT_COLOR = '#c8cdd4'; // cool aluminum (D-08)

interface BlindsProps {
  /** Optional position passed by the parent (Window.tsx). Defaults to
   *  the parent's origin (group anchor). */
  position?: [number, number, number];
  /** Optional rotation. Default = identity. */
  rotation?: [number, number, number];
}

export function Blinds({ position = [0, 0, 0], rotation = [0, 0, 0] }: BlindsProps) {
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: SLAT_COUNT }, (_, i) => {
        // Even Y distribution across the full window height (1.5 m).
        // For i ∈ [0, 13]: y = (i / 13) * 1.5 - 0.75
        // — bottom slat at y=-0.75, top slat at y=+0.75.
        const y = (i / (SLAT_COUNT - 1)) * (SLAT_Y_RANGE_HALF * 2) - SLAT_Y_RANGE_HALF;
        return (
          <mesh key={i} position={[0, y, 0]} rotation={[SLAT_TILT_X, 0, 0]} castShadow={false}>
            <boxGeometry args={[1.2, 0.025, 0.012]} />
            <meshStandardMaterial color={SLAT_COLOR} roughness={0.45} metalness={0.55} />
          </mesh>
        );
      })}
    </group>
  );
}
