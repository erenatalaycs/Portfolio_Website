// src/scene/FocusController.tsx
//
// Pure controller (returns null). Reads ?focus= via useQueryParams,
// owns the focused FocusId state, animates camera.position +
// OrbitControls.target via a single GSAP timeline (1000 ms power2.inOut),
// disables OrbitControls during animation, re-enables onComplete only
// when returning to null (default orbit) — D-09 lock.
//
// First-mount with ?focus= → instant snap (D-11 — no cinematic intro).
// Reduced-motion → instant cut (UI-SPEC § Reduced-motion handling).
//
// Esc keydown listener registered at this component's effect (mounts only
// inside <ThreeDShell> per D-19 Claude's-discretion lock).
//
// gsap.registerPlugin(useGSAP) called at module top so Strict Mode
// double-mount doesn't double-register (Pitfall 2).
//
// Source: 03-RESEARCH.md Pattern 4, Pattern 6; 03-UI-SPEC.md §
//         <FocusController>; 03-CONTEXT.md D-08, D-09, D-10, D-11

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useQueryParams, setQueryParams } from '../lib/useQueryParams';
import { MONITOR_FOCUS_POSES, DEFAULT_ORBIT_POSE, type FocusId } from './cameraPoses';

gsap.registerPlugin(useGSAP);

interface FocusControllerProps {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  focused: FocusId | null;
  setFocused: (next: FocusId | null) => void;
}

function parseFocusFromUrl(params: URLSearchParams): FocusId | null {
  const f = params.get('focus');
  if (!f) return null;
  if (f === 'projects') return 'left';
  if (f === 'about' || f === 'whoami') return 'center';
  if (f === 'writeups' || f.startsWith('writeups/')) return 'right';
  return null;
}

export function FocusController({ controlsRef, focused, setFocused }: FocusControllerProps) {
  // `invalidate` is required because <Canvas frameloop="demand"> only paints
  // when explicitly requested. controls.update() syncs OrbitControls' internal
  // state but does NOT request a paint — without invalidate() the camera moves
  // and the GSAP timeline ticks, but the scene is never re-rendered.
  const { camera, invalidate } = useThree();
  const reduced = useReducedMotion();
  const params = useQueryParams();
  const isFirstMount = useRef(true);

  const focusFromUrl = parseFocusFromUrl(params);

  // Sync URL → focused state on URL change (header [bracket] click in 3D
  // shell, browser back/forward, deep-link arrival).
  useEffect(() => {
    if (focusFromUrl !== focused) {
      setFocused(focusFromUrl);
    }
  }, [focusFromUrl, focused, setFocused]);

  // GSAP timeline — re-runs on focused change. useGSAP wraps gsap.context()
  // automatically; reverts on dependency change so Strict Mode double-mount
  // doesn't leak orphan tweens (Pitfall 2).
  useGSAP(
    () => {
      const controls = controlsRef.current;
      if (!controls) return;

      const targetPose = focused ? MONITOR_FOCUS_POSES[focused] : DEFAULT_ORBIT_POSE;

      // First-mount with ?focus= → instant snap (D-11). Reduced-motion →
      // instant cut (UI-SPEC § Reduced-motion handling).
      if (isFirstMount.current || reduced) {
        camera.position.set(...targetPose.position);
        controls.target.set(...targetPose.target);
        controls.update();
        controls.enabled = focused === null;
        isFirstMount.current = false;
        invalidate();
        return;
      }

      // Animated transition. Single timeline with two parallel .to() calls
      // (Pattern 4 — single timeline gives atomic onComplete, NOT two
      // parallel gsap.to() which would race).
      controls.enabled = false;
      const tl = gsap.timeline({
        onUpdate: () => {
          controls.update();
          invalidate();
        },
        onComplete: () => {
          // Re-enable AFTER animation, ONLY when returning to null orbit
          // pose (D-09 + Claude's-discretion lock).
          controls.enabled = focused === null;
        },
      });
      tl.to(
        camera.position,
        {
          x: targetPose.position[0],
          y: targetPose.position[1],
          z: targetPose.position[2],
          duration: 1.0,
          ease: 'power2.inOut',
        },
        0,
      ).to(
        controls.target,
        {
          x: targetPose.target[0],
          y: targetPose.target[1],
          z: targetPose.target[2],
          duration: 1.0,
          ease: 'power2.inOut',
        },
        0,
      );
    },
    { dependencies: [focused, reduced] },
  );

  // Esc keydown — defocus to null + clear ?focus= from URL.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focused !== null) {
        setFocused(null);
        setQueryParams({ focus: null });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, setFocused]);

  return null;
}
