// src/shells/ThreeDShell.tsx
//
// The 3D shell: shared <Header /> (with view + camera toggles) + <main>
// containing <Canvas> with the procedural workstation + footer.
//
// Camera-mode state held HERE (D-11 — ephemeral, NOT URL, NOT cached
// across reloads). Re-renders when toggled; <Controls> reads the prop and
// swaps clamps without remounting.
//
// HS redesign (Task 3): the Phase 3 three-monitor focus contract has
// collapsed to a single boolean. Click the (single ultrawide) monitor
// → focused; click background or Esc → overview. URL ?focus=<tab>
// mirrors both the boolean and the activeTab (via FocusController).
//
// Source: 02-UI-SPEC.md § 3D shell DOM structure (3D-03);
//         02-RESEARCH.md Pattern 3, Pattern 5;
//         02-CONTEXT.md D-09, D-11, D-13, D-14;
//         03-RESEARCH.md Example 2 + Pattern 5;
//         03-UI-SPEC.md § Click-outside defocus + § ARIA contract;
//         ~/.claude/plans/neon-tabbing-workstation.md Task 3.

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
import { setQueryParams } from '../lib/useQueryParams';
import { BracketLink } from '../ui/BracketLink';
import { identity } from '../content/identity';
import { useTabStore } from '../store/tabStore';

interface ThreeDShellProps {
  onContextLost: () => void;
}

export default function ThreeDShell({ onContextLost }: ThreeDShellProps) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [focused, setFocused] = useState<boolean>(false);
  const activeTab = useTabStore((s) => s.activeTab);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const onMonitorClick = () => {
    const next = !focused;
    setFocused(next);
    // URL mirrors state: ?focus=<tab> when focused, no ?focus= when overview.
    setQueryParams({ focus: next ? activeTab : null });
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
          camera={{ position: [1.3, 1.5, 1.3], fov: 50, near: 0.1, far: 50 }}
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
              'Interactive 3D workstation scene. A single ultrawide monitor renders tabbed content (whoami, projects, writeups, certs, contact). Drag to look around. Click the monitor to focus, press Escape to return.',
            );
            gl.domElement.style.touchAction = 'pan-y';
            // First-paint trigger: with frameloop="demand" R3F v9 + React 19
            // no longer guarantees an initial render on scene-tree commit;
            // without this the canvas stays black until user input invalidates.
            invalidate();
          }}
          onPointerMissed={() => {
            if (focused) {
              setFocused(false);
              setQueryParams({ focus: null });
            }
          }}
        >
          <Lighting />
          <Workstation focused={focused} onMonitorClick={onMonitorClick} />
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
