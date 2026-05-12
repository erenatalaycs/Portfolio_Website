// src/scene/Workstation.tsx
//
// Phase 4 (Plan 04-06): CC0 Poly Haven composite — desk, lamp, bookshelf
// ship as Draco-compressed GLBs (`public/assets/workstation/*.glb`). The
// `<Monitor>` wrappers retain their procedural geometry because Poly Haven
// has no CC0 monitor model (API search 2026-05-11 returned only
// `chinese_screen_panels`, a folding privacy screen). See
// `public/assets/workstation/LICENSE.txt` for full provenance.
//
// Monitor → content mapping (Phase 3 D-01):
//   Left   = <Projects />                      — projects.ts (CNT-03)
//   Center = <CenterMonitorContent />          — Whoami + About + Skills + Contact
//   Right  = <WriteupsMonitor />               — list/view
//
// The three procedural `<Monitor>` wrappers stay — they own the click
// handler, focus state, and the screen plane that drei <Html transform>
// projects DOM content onto (Phase 3 D-03 contract; UI-SPEC § Real GLB
// swap visual contract).
//
// Scaling + positioning: each GLB is scaled with a single uniform factor
// tuned so the asset's bounding box approximates the Phase 2 procedural
// envelope (D-04: 1 unit = 1 metre). Camera poses (Phase 2 D-04 + Phase 3
// D-08) are unchanged per CONTEXT D-03.
//
// Emissive override: lamp's `desk_lamp_arm_01_light` material is
// reauthored at scene-mount time to use --color-warn (#e3b341), per
// UI-SPEC § Real GLB swap visual contract option (b). The desk and
// bookshelf carry no emissive (their CC0 textures are diffuse).
//
// Source: 04-06-PLAN.md §<tasks>, 04-CONTEXT.md D-01..D-04,
//         04-UI-SPEC.md § Real GLB swap visual contract,
//         04-RESEARCH.md Pattern 1 + Pattern 2

import { useEffect, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Floor } from './Floor';
import { Monitor } from './Monitor';
import { MonitorOverlay } from './MonitorOverlay';
import { SCENE_COLORS } from './colors';
import type { FocusId } from './cameraPoses';
import { Projects } from '../sections/Projects';
import { CenterMonitorContent } from '../ui/CenterMonitorContent';
import { WriteupsMonitor } from '../ui/WriteupsMonitor';
import { BASE, assetUrl } from '../lib/baseUrl';

// Draco decoder self-hosted at public/draco/ — CSP `script-src 'self'`
// blocks drei's default `https://www.gstatic.com/draco/...` CDN. setDecoderPath
// MUST run before any useGLTF call below. NOTE: cannot use assetUrl() here —
// that helper hardcodes the `assets/` subpath; draco lives at the project
// root next to assets/, not under it. Compose from BASE directly.
useGLTF.setDecoderPath(`${BASE}draco/`);

// Preload at module scope so the GLB fetch starts before <Workstation />
// mounts; the lazy 3D chunk is already a Suspense boundary in <App />.
useGLTF.preload(assetUrl('workstation/desk.glb'));
useGLTF.preload(assetUrl('workstation/lamp.glb'));
useGLTF.preload(assetUrl('workstation/bookshelf.glb'));

interface WorkstationProps {
  focused: FocusId | null;
  onFocusToggle: (id: FocusId) => void;
}

// Hex-string → integer for THREE.Color.setHex(). SCENE_COLORS values are
// `#rrggbb`; the leading `#` must be stripped.
const hexToInt = (hex: string): number => parseInt(hex.replace('#', ''), 16);

export function Workstation({ focused, onFocusToggle }: WorkstationProps) {
  const desk = useGLTF(assetUrl('workstation/desk.glb'));
  const lamp = useGLTF(assetUrl('workstation/lamp.glb'));
  const bookshelf = useGLTF(assetUrl('workstation/bookshelf.glb'));

  // Clone each scene so we can mount it without mutating the cached source
  // returned by useGLTF (drei's cache lives across remounts). Without this
  // clone the emissive override would persist if the scene unmounts/remounts.
  const deskScene = useMemo(() => desk.scene.clone(true), [desk.scene]);
  const lampScene = useMemo(() => lamp.scene.clone(true), [lamp.scene]);
  const bookshelfScene = useMemo(() => bookshelf.scene.clone(true), [bookshelf.scene]);

  // Lamp bulb emissive override (UI-SPEC § Real GLB swap visual contract
  // option b). The material name `desk_lamp_arm_01_light` was confirmed by
  // running `gltfjsx --types --console` against the source asset on
  // 2026-05-11; see SUMMARY for inspection notes.
  useEffect(() => {
    lampScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
        if (child.material.name === 'desk_lamp_arm_01_light') {
          // Clone the material so the cached source isn't mutated.
          const cloned = child.material.clone();
          cloned.emissive = new THREE.Color(hexToInt(SCENE_COLORS.warn));
          cloned.emissiveIntensity = 2.0;
          cloned.toneMapped = false;
          child.material = cloned;
        }
      }
    });
  }, [lampScene]);

  return (
    <>
      <Floor />
      {/* Desk: real-world 2.0 × 0.95 × 0.79 m → scaled 0.95 so the top
          surface sits at y≈0.75 m (real-world ergonomic desk height).
          Width becomes 1.9 m (wider than Phase 2's 1.2 m procedural
          envelope) — camera framing is widened to match. Asset origin
          at floor level (0,0,0). */}
      <primitive object={deskScene} position={[0, 0, 0]} scale={0.95} />
      <Monitor
        position={[-0.45, 1.075, -0.05]}
        rotation={[0, 0.18, 0]}
        monitorId="left"
        focused={focused}
        onFocusToggle={onFocusToggle}
      >
        <MonitorOverlay ariaLabel="Left monitor: projects">
          <Projects />
        </MonitorOverlay>
      </Monitor>
      <Monitor
        position={[0, 1.075, -0.05]}
        rotation={[0, 0, 0]}
        monitorId="center"
        focused={focused}
        onFocusToggle={onFocusToggle}
      >
        <MonitorOverlay ariaLabel="Center monitor: identity, about, and skills">
          <CenterMonitorContent />
        </MonitorOverlay>
      </Monitor>
      <Monitor
        position={[0.45, 1.075, -0.05]}
        rotation={[0, -0.18, 0]}
        monitorId="right"
        focused={focused}
        onFocusToggle={onFocusToggle}
      >
        <MonitorOverlay ariaLabel="Right monitor: write-ups">
          <WriteupsMonitor />
        </MonitorOverlay>
      </Monitor>
      {/* Lamp: real-world 0.62 × 0.41 × 0.88 m (W × D × H) → scale 0.5
          gives 0.31 × 0.205 × 0.44 m. Base sits ON the new desk top
          (y=0.75 m), not above it. */}
      <primitive object={lampScene} position={[-0.5, 0.75, 0]} scale={0.5} />
      {/* Bookshelf: real-world 1.37 × 0.58 × 2.06 m → scale 0.85 fits the
          new desk envelope (1.165 × 0.493 × 1.751 m — real bookshelf height).
          Anchored 0.6 m behind the desk centre, ground level. */}
      <primitive object={bookshelfScene} position={[0, 0, -0.6]} scale={0.85} />
    </>
  );
}
