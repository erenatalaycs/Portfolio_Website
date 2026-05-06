// src/shells/ThreeDShell.tsx
//
// The 3D shell: shared <Header /> (with view + camera toggles) + <main>
// containing <Canvas> with the procedural workstation + footer.
//
// Camera-mode state is held HERE (D-11 — ephemeral, NOT URL, NOT cached
// across reloads). Re-renders when toggled; <Controls> reads the prop and
// swaps clamps without remounting (RESEARCH Pattern 4 — prop-swap not
// key-swap).
//
// webglcontextlost listener registered in <Canvas onCreated>. On fire:
// event.preventDefault() (allows browser to attempt restoration later) +
// call props.onContextLost() so App.tsx can lift to TextShell + show the
// ContextLossBar (D-13).
//
// Source: 02-UI-SPEC.md § 3D shell DOM structure (3D-03); § <Canvas>
//         configuration; 02-RESEARCH.md Pattern 3, Pattern 5;
//         02-CONTEXT.md D-09, D-11, D-13, D-14

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Header } from '../ui/Header';
import type { CameraMode } from '../ui/CameraToggle';
import { Workstation } from '../scene/Workstation';
import { Lighting } from '../scene/Lighting';
import { Controls } from '../scene/Controls';
import { BracketLink } from '../ui/BracketLink';
import { identity } from '../content/identity';

interface ThreeDShellProps {
  onContextLost: () => void;
}

export default function ThreeDShell({ onContextLost }: ThreeDShellProps) {
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit'); // D-11 ephemeral

  return (
    <>
      <Header
        currentView="3d"
        showCameraToggle
        cameraMode={cameraMode}
        onCameraModeChange={setCameraMode}
      />
      <main
        id="main"
        tabIndex={-1}
        className="flex-1 min-h-0 relative font-mono"
        // The 3D shell's <main> fills remaining height; flexbox parent on <body>
        // (set globally by index.html: <body class="... flex flex-col min-h-screen">)
        // makes the Canvas size to the viewport minus header/footer.
      >
        <Canvas
          className="block w-full h-full"
          camera={{ position: [2.4, 1.4, 2.4], fov: 50, near: 0.1, far: 50 }}
          dpr={[1, 1.5]}
          frameloop="demand"
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            // 3D-09: webglcontextlost → App-level state → instant swap to
            // TextShell + ContextLossBar (D-13). Browser restoration is
            // possible via `webglcontextrestored`, but D-14 says we always
            // do a full page reload via [retry 3D] instead, so we don't
            // listen for restored.
            const handler = (event: Event) => {
              event.preventDefault();
              onContextLost();
            };
            gl.domElement.addEventListener('webglcontextlost', handler);
            // ARIA per UI-SPEC.
            gl.domElement.setAttribute(
              'aria-label',
              'Interactive 3D workstation scene. Drag to look around.',
            );
            // touch-action: pan-y so vertical scroll passes through Canvas
            // on touch devices (RESEARCH Pattern 10 / Pitfall 8).
            gl.domElement.style.touchAction = 'pan-y';
          }}
        >
          <Lighting />
          <Workstation />
          <Controls cameraMode={cameraMode} />
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
