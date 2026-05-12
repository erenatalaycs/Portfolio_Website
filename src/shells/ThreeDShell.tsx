// src/shells/ThreeDShell.tsx
//
// The 3D shell: shared <Header /> (with view + camera toggles) + <main>
// containing <Canvas> with the procedural workstation + footer.
//
// Camera-mode state held HERE (D-11 — ephemeral, NOT URL, NOT cached
// across reloads). Re-renders when toggled; <Controls> reads the prop and
// swaps clamps without remounting.
//
// Phase 3 additions (Plan 03-03):
//   - focused: FocusId | null state (URL ↔ state sync via FocusController)
//   - controlsRef: forwarded to <Controls> so <FocusController> mutates
//     OrbitControls.enabled + .target directly (Pattern 4)
//   - onFocusToggle: handler called by <Monitor> screen-plane onClick
//     (re-click on focused monitor → defocus; otherwise → focus that id)
//   - <Canvas onPointerMissed>: outside-click defocus (D-10 #2)
//   - Expanded canvas aria-label (UI-SPEC § ARIA contract Phase 3)
//   - <FocusController> mounted inside <Canvas> (uses useThree)
//
// Source: 02-UI-SPEC.md § 3D shell DOM structure (3D-03);
//         02-RESEARCH.md Pattern 3, Pattern 5;
//         02-CONTEXT.md D-09, D-11, D-13, D-14;
//         03-RESEARCH.md Example 2 + Pattern 5;
//         03-UI-SPEC.md § Click-outside defocus + § ARIA contract

import { useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Header } from '../ui/Header';
import type { CameraMode } from '../ui/CameraToggle';
import { Workstation } from '../scene/Workstation';
import { Lighting } from '../scene/Lighting';
import { Controls } from '../scene/Controls';
import { FocusController } from '../scene/FocusController';
import { ScenePostprocessing } from '../3d/ScenePostprocessing';
import type { FocusId } from '../scene/cameraPoses';
import { setQueryParams } from '../lib/useQueryParams';
import { BracketLink } from '../ui/BracketLink';
import { identity } from '../content/identity';

interface ThreeDShellProps {
  onContextLost: () => void;
}

// FocusId → URL ?focus= value mapping (inverse of parseFocusFromUrl).
const URL_VALUE_FOR: Record<FocusId, string> = {
  left: 'projects',
  center: 'about',
  right: 'writeups',
};

export default function ThreeDShell({ onContextLost }: ThreeDShellProps) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [focused, setFocused] = useState<FocusId | null>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const onFocusToggle = (id: FocusId) => {
    const next: FocusId | null = focused === id ? null : id;
    setFocused(next);
    setQueryParams({ focus: next === null ? null : URL_VALUE_FOR[next] });
  };

  return (
    <>
      <Header
        currentView="3d"
        showCameraToggle
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
      />
      <main id="main" tabIndex={-1} className="flex-1 min-h-0 relative font-mono">
        <Canvas
          className="block"
          style={{ position: 'absolute', inset: 0 }}
          camera={{ position: [3.0, 1.7, 3.0], fov: 50, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl, invalidate }) => {
            const handler = (event: Event) => {
              event.preventDefault();
              onContextLost();
            };
            gl.domElement.addEventListener('webglcontextlost', handler);
            gl.domElement.setAttribute(
              'aria-label',
              'Interactive 3D workstation scene. Three monitors render projects, identity, and write-ups. Drag to look around. Click a monitor to focus, press Escape to return.',
            );
            gl.domElement.style.touchAction = 'pan-y';
            // First-paint trigger: with frameloop="demand" R3F v9 + React 19
            // no longer guarantees an initial render on scene-tree commit;
            // without this the canvas stays black until user input invalidates.
            invalidate();
          }}
          onPointerMissed={() => {
            if (focused !== null) {
              setFocused(null);
              setQueryParams({ focus: null });
            }
          }}
        >
          <Lighting />
          <Workstation focused={focused} onFocusToggle={onFocusToggle} />
          <Controls cameraMode={cameraMode} ref={controlsRef} />
          <FocusController controlsRef={controlsRef} focused={focused} setFocused={setFocused} />
          <ScenePostprocessing />
        </Canvas>
      </main>
      <footer
        role="contentinfo"
        className="mt-16 pb-8 px-4 md:px-6 mx-auto max-w-[72ch] text-muted text-sm font-mono"
      >
        <p>
          © {new Date().getFullYear()} {identity.name} — built solo · source on{' '}
          <BracketLink href="https://github.com/erenatalaycs/Portfolio_Website" external>
            GitHub
          </BracketLink>
        </p>
      </footer>
    </>
  );
}
