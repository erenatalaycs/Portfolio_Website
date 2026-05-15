// src/scene/DeskDecor.tsx
//
// Procedural desk + floor decor for the HS-redesign scene:
//   - Keyboard (thin wide box, subtle backlight emissive strip)
//   - Mouse   (small low box)
//   - Mug     (cylinder)
//   - Tower PC (standing box on floor, front-panel power LED + intake
//              vent emissive accent)
//
// All primitives. No GLB. No new dependencies. Reuses SCENE_COLORS for
// frame surfaces; cyan/teal literal `#22d3ee` for the LED + backlight
// accents (matches the planned neon-strip accent in Task 5, so the
// scene reads as one HS-tinted palette rather than ad-hoc colors).
//
// World coordinates:
//   - Desk top at y = 0.77 m (Desk.tsx places box at y=0.75 with
//     thickness 0.04 m → top face at 0.77).
//   - Floor at y = 0 m.
//   - Desk volume spans x ∈ [-0.6, 0.6], z ∈ [-0.3, 0.3].
//   - Lamp at [-0.5, 0.78, 0]; keep decor clear of that region.
//
// Source: ~/.claude/plans/neon-tabbing-workstation.md Task 4;
//         05-CONTEXT.md D-23..D-24 — file-local intensity constants
//         introduced so the drift-guard (no numeric literals on
//         emissiveIntensity in src/scene/*.tsx) holds. These HS-redesign
//         decorative emitters predate D-23's named budget; once Phase 6
//         lands the Pi-cluster rack LED (CYB-02), `KEYBOARD_BACKLIGHT_*`
//         and `TOWER_*` should be reconsidered for inclusion in
//         EMISSIVE_BUDGET — for now they stay file-local to preserve
//         exact HS-redesign behavior without inventing un-decisioned
//         budget keys.

import { SCENE_COLORS } from './colors';

// HS neon accent — matches Task 5 neon strip; same value reused across
// every emissive accent so the scene reads as one HS-tinted palette.
const NEON_CYAN = '#22d3ee';

// File-local emissive intensities (HS-redesign era, pre-D-23). Drift-
// guard-compliant: any future change should consider centralizing into
// EMISSIVE_BUDGET if a similar surface lands in Phase 6+.
const KEYBOARD_BACKLIGHT_INTENSITY = 1.0;
const TOWER_LED_INTENSITY = 1.4;
const TOWER_INTAKE_INTENSITY = 0.6;

const DESK_TOP_Y = 0.77;

function Keyboard() {
  const w = 0.42;
  const h = 0.015;
  const d = 0.14;
  const y = DESK_TOP_Y + h / 2;
  return (
    <group position={[0, y, 0.14]}>
      {/* Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* Subtle backlight strip — thin emissive plane on the keyboard's
          front bevel. Bloom from Plan 04-01 picks this up. */}
      <mesh position={[0, -h / 2 + 0.001, d / 2 + 0.0005]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 0.92, 0.004]} />
        <meshStandardMaterial
          color={NEON_CYAN}
          emissive={NEON_CYAN}
          emissiveIntensity={KEYBOARD_BACKLIGHT_INTENSITY}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Mouse() {
  const w = 0.06;
  const h = 0.025;
  const d = 0.1;
  const y = DESK_TOP_Y + h / 2;
  return (
    <mesh position={[0.28, y, 0.15]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.45} metalness={0.25} />
    </mesh>
  );
}

function Mug() {
  const r = 0.04;
  const h = 0.1;
  const y = DESK_TOP_Y + h / 2;
  return (
    <group position={[0.46, y, 0.07]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 0.95, h, 24]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Handle: thin torus on the side */}
      <mesh position={[r + 0.005, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.022, 0.005, 8, 16, Math.PI]} />
        <meshStandardMaterial color={SCENE_COLORS.surface} roughness={0.85} metalness={0.05} />
      </mesh>
    </group>
  );
}

function TowerPC() {
  const w = 0.2;
  const h = 0.45;
  const d = 0.45;
  const y = h / 2; // floor at y=0; tower bottom at floor.
  // Place left of desk, just behind the front edge so it's visible in overview.
  return (
    <group position={[-0.85, y, -0.05]}>
      {/* Chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={SCENE_COLORS.bg} roughness={0.65} metalness={0.3} />
      </mesh>
      {/* Front-panel power LED — small emissive square near top-front */}
      <mesh position={[w / 2 - 0.025, h / 2 - 0.04, d / 2 + 0.0005]}>
        <planeGeometry args={[0.012, 0.012]} />
        <meshStandardMaterial
          color={NEON_CYAN}
          emissive={NEON_CYAN}
          emissiveIntensity={TOWER_LED_INTENSITY}
          toneMapped={false}
        />
      </mesh>
      {/* Intake vent — emissive horizontal strip lower on the front panel */}
      <mesh position={[0, -h / 4, d / 2 + 0.0005]}>
        <planeGeometry args={[w * 0.7, 0.006]} />
        <meshStandardMaterial
          color={NEON_CYAN}
          emissive={NEON_CYAN}
          emissiveIntensity={TOWER_INTAKE_INTENSITY}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function DeskDecor() {
  return (
    <>
      <Keyboard />
      <Mouse />
      <Mug />
      <TowerPC />
    </>
  );
}
