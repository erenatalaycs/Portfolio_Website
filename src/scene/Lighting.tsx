// src/scene/Lighting.tsx
//
// HS-redesign lighting (Task 7):
//   - ambient: dim cool-blue cast (lived-in atmosphere; not pure dark)
//   - directional key: lowered intensity (0.8 → 0.45) to push the
//     dim feel; still casts the same shadow map
//   - cyan accent point light behind monitor: paints a neon halo on
//     bookshelf + tower + wall poster (matches Hacker Simulator's
//     dual-monitor backlight)
//   - warm accent point light at the lamp bulb: contrasts the cyan
//     wash so the scene reads as a real desk lamp + neon strip combo
//
// Phase 2 D-07 originally prescribed "ambient + directional + emissive
// only" — that constraint is intentionally superseded for the HS look.
// Point lights are still cheap (2 added; Three.js handles up to ~8
// without measurable cost on the static workstation scene).
//
// Source: 02-UI-SPEC.md § Lighting (D-07 — superseded for HS look);
//         02-CONTEXT.md D-07;
//         ~/.claude/plans/neon-tabbing-workstation.md Task 7;
//         /tmp/hs2.jpg — Hacker Simulator monitor backlight reference.

export function Lighting() {
  return (
    <>
      {/* Ambient: cool-blue dim cast — sets the "after-hours room" floor. */}
      <ambientLight intensity={0.18} color="#1a2940" />
      {/* Key: directional light from upper-right, lowered intensity. */}
      <directionalLight
        intensity={0.45}
        position={[3, 4, 2]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      {/* Cyan accent: behind/above monitor — paints the wall neon halo. */}
      <pointLight
        position={[0, 1.3, -0.4]}
        color="#22d3ee"
        intensity={3.5}
        distance={2.8}
        decay={2}
      />
      {/* Warm accent: at the lamp bulb's approximate world position.
          Lamp local bulb is at [0.05, 0.43, 0] inside group at
          [-0.5, 0.78, 0] → world ~ [-0.45, 1.21, 0]. */}
      <pointLight
        position={[-0.45, 1.21, 0]}
        color="#e3b341"
        intensity={1.2}
        distance={1.3}
        decay={2}
      />
    </>
  );
}
