// src/scene/Window.tsx
//
// v1.1 Phase 5 (ROOM-03): the room's single window, cut into the back
// wall (z = -2.5) offset-right at (x = +0.6, y = 1.4) per D-10. The
// component assembles 4 children inside one parent <group>:
//
//   1. Frame bezel — four thin slabs forming a rectangle the width and
//      height of the window opening (1.2 × 1.5 m per D-11). Color reads
//      SCENE_COLORS.wall so the bezel disappears into the wall (D-06).
//
//   2. Glass pane — a thin BoxGeometry(1.2, 1.5, 0.01) slab centered in
//      the opening. Material: MeshStandardMaterial with color="#0a1418"
//      (D-09 faint-blue glass tint), transparent + opacity 0.6,
//      roughness 0.15, metalness 0. Reads as glass, not as a hole.
//
//   3. Night-city texture plane — PlaneGeometry(1.2, 1.5) parented
//      behind the glass pane (z offset = -0.02 in local coords, so it
//      sits between the pane and the back wall). Material:
//      MeshBasicMaterial (intentionally unlit — the CanvasTexture
//      supplies the emissive look on its own) with map = the texture
//      created by createNightCityTexture(). Texture cached via useMemo
//      (D-19 — singleton lifecycle; NEVER regenerated per render).
//
//   4. Blinds child — <Blinds /> mounted at z=+0.02 in local coords so
//      the slats sit clearly in front of the glass pane (D-13 half-open
//      posture).
//
// Z-axis layout (local to the component origin, looking from the
// camera toward the back wall):
//
//          (further from camera, deeper inside wall)
//                          z = -0.02   night-city plane
//                          z =   0     glass pane
//                          z = +0.02   blinds slats
//          (closer to camera)
//
// World position [0.6, 1.4, -2.5 + 0.005]: the +0.005 ε pushes the
// whole assembly 5 mm forward of the back wall's interior face
// (z = -2.5). The wall is BoxGeometry 0.05 m thick centered at
// z = -2.525, so the interior face sits exactly at z = -2.5. The
// 5 mm Z offset prevents Z-fighting between the bezel's back surface
// and the wall's front surface.
//
// D-33: no new pointLight in this plan. Dynamic-light count stays at
// 5 (cap 6, headroom 1). The CanvasTexture is purely surface-readable
// (MeshBasicMaterial, unlit) — no backlight needed.
//
// Source: 05-CONTEXT.md D-08..D-11, D-13..D-19; ROOM-03.

import { useMemo } from 'react';
import { SCENE_COLORS } from './colors';
import { Blinds } from './Blinds';
import { createNightCityTexture } from './textures/nightCity';

// Window opening dimensions (D-11).
const WINDOW_WIDTH = 1.2;
const WINDOW_HEIGHT = 1.5;

// Frame bezel dimensions. Bezel is 0.04 m wide on the perimeter and
// 0.05 m deep (sits proud of the wall by ~0.05 m, which keeps it
// readable as a window casing without overpowering the composition).
const BEZEL_THICKNESS = 0.04;
const BEZEL_DEPTH = 0.05;

// World placement (D-10). Slight +Z offset prevents Z-fighting against
// the back wall's interior face at z=-2.5.
const WINDOW_POSITION: [number, number, number] = [0.6, 1.4, -2.5 + 0.005];

export function Window() {
  // D-19: createNightCityTexture is invoked once and cached for the
  // component's lifetime. The texture is module-singleton-shaped (pure
  // function); useMemo just prevents React strict-mode double-invokes
  // from doubling the work on dev mounts.
  const texture = useMemo(() => createNightCityTexture(), []);

  // Frame bezel geometry. Four slabs framing the 1.2 × 1.5 m opening:
  //   - top / bottom: span (WINDOW_WIDTH + 2 * BEZEL_THICKNESS) wide
  //     and BEZEL_THICKNESS tall, positioned above and below the opening.
  //   - left / right: span BEZEL_THICKNESS wide and WINDOW_HEIGHT tall,
  //     positioned to the sides of the opening (do NOT overlap top/bottom).
  const topY = WINDOW_HEIGHT / 2 + BEZEL_THICKNESS / 2;
  const bottomY = -(WINDOW_HEIGHT / 2 + BEZEL_THICKNESS / 2);
  const leftX = -(WINDOW_WIDTH / 2 + BEZEL_THICKNESS / 2);
  const rightX = WINDOW_WIDTH / 2 + BEZEL_THICKNESS / 2;
  const sidebarHeight = WINDOW_HEIGHT;
  const headerWidth = WINDOW_WIDTH + 2 * BEZEL_THICKNESS;

  return (
    <group position={WINDOW_POSITION}>
      {/* --- Frame bezel: 4 slabs around the opening --- */}
      {/* Top */}
      <mesh position={[0, topY, 0]} receiveShadow>
        <boxGeometry args={[headerWidth, BEZEL_THICKNESS, BEZEL_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, bottomY, 0]} receiveShadow>
        <boxGeometry args={[headerWidth, BEZEL_THICKNESS, BEZEL_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Left */}
      <mesh position={[leftX, 0, 0]} receiveShadow>
        <boxGeometry args={[BEZEL_THICKNESS, sidebarHeight, BEZEL_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>
      {/* Right */}
      <mesh position={[rightX, 0, 0]} receiveShadow>
        <boxGeometry args={[BEZEL_THICKNESS, sidebarHeight, BEZEL_DEPTH]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} metalness={0.0} />
      </mesh>

      {/* --- Night-city texture plane (behind the glass) ---
          MeshBasicMaterial = unlit. The procedural CanvasTexture is the
          only pixel source; the room's ambient + ceiling lights do not
          affect this plane. */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[WINDOW_WIDTH, WINDOW_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>

      {/* --- Glass pane (in front of the texture, behind the blinds) ---
          color #0a1418 (D-09) is the faint-blue glass tint; opacity 0.6
          lets the night-city texture read through. */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[WINDOW_WIDTH, WINDOW_HEIGHT, 0.01]} />
        <meshStandardMaterial
          color="#0a1418"
          transparent={true}
          opacity={0.6}
          roughness={0.15}
          metalness={0.0}
        />
      </mesh>

      {/* --- Blinds (in front of the glass; sandwiched between viewer
              and pane). The Blinds component handles internal slat
              layout. --- */}
      <Blinds position={[0, 0, 0.02]} />
    </group>
  );
}
