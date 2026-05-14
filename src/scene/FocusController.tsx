// src/scene/FocusController.tsx
//
// Pure controller (returns null). Owns the camera dolly between two
// poses — overview ↔ focused — driven by a boolean `focused` state in
// <ThreeDShell>.
//
// HS redesign (Task 3): the Phase 3 three-pose-per-monitor contract has
// been collapsed to a single 2-pose toggle. URL ?focus= now drives BOTH
// the camera-focused boolean AND the activeTab (MonitorTabs surface)
// for deep-link compatibility:
//
//   URL value           focused   activeTab
//   ---------           -------   ---------
//   (absent)            false     (unchanged)
//   whoami              true      whoami
//   about               true      whoami           (Phase 3 alias)
//   projects            true      projects
//   writeups            true      writeups
//   writeups/<slug>     true      writeups         (slug consumed by WriteupsMonitor)
//   certs               true      certs
//   contact             true      contact
//
// State is the truth; URL is a mirror. <ThreeDShell> writes the URL on
// click; this controller reads URL changes (back/forward, deep links,
// header [bracket] taps) and syncs state.
//
// Camera animation: single GSAP timeline (1000 ms power2.inOut), reused
// from Phase 3 D-08 pattern. Controls disabled during animation;
// re-enabled onComplete only when returning to overview (D-09 lock).
// invalidate() in onUpdate is required because Canvas frameloop="demand"
// only paints on explicit invalidation.
//
// First-mount with ?focus= → instant snap (D-11 — no cinematic intro).
// Reduced-motion → instant cut.
//
// Esc keydown → defocus + clear ?focus= from URL.
//
// Source: 03-RESEARCH.md Pattern 4, Pattern 6; 03-UI-SPEC.md §
//         <FocusController>; 03-CONTEXT.md D-08, D-09, D-10, D-11;
//         ~/.claude/plans/neon-tabbing-workstation.md Task 3.

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { useThree } from '@react-three/fiber';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useReducedMotion } from '../lib/useReducedMotion';
import { useQueryParams, setQueryParams } from '../lib/useQueryParams';
import { MONITOR_FOCUS_POSE, DEFAULT_ORBIT_POSE } from './cameraPoses';
import { useTabStore, type MonitorTab } from '../store/tabStore';

gsap.registerPlugin(useGSAP);

interface FocusControllerProps {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  focused: boolean;
  setFocused: (next: boolean) => void;
}

/** Parse the URL ?focus= value into a {focused, tab} tuple. */
function parseUrlFocus(params: URLSearchParams): {
  focused: boolean;
  tab: MonitorTab | null;
} {
  const raw = params.get('focus');
  if (raw === null) return { focused: false, tab: null };
  // Phase 3 alias: 'about' → whoami
  if (raw === 'about') return { focused: true, tab: 'whoami' };
  // 'writeups/<slug>' → writeups (slug handled by <WriteupsMonitor>)
  if (raw === 'writeups' || raw.startsWith('writeups/')) {
    return { focused: true, tab: 'writeups' };
  }
  if (raw === 'whoami' || raw === 'projects' || raw === 'certs' || raw === 'contact') {
    return { focused: true, tab: raw };
  }
  // Unknown focus value — treat as "focus the monitor, leave tab alone".
  return { focused: true, tab: null };
}

export function FocusController({ controlsRef, focused, setFocused }: FocusControllerProps) {
  // invalidate() is required for frameloop="demand" — controls.update() alone
  // does not request a repaint, so the dolly state mutates without rendering.
  const { camera, invalidate } = useThree();
  const reduced = useReducedMotion();
  const params = useQueryParams();
  const isFirstMount = useRef(true);
  const setActiveTab = useTabStore((s) => s.setActiveTab);
  const activeTab = useTabStore((s) => s.activeTab);

  const urlState = parseUrlFocus(params);

  // URL → state sync. Runs on any URL change (back/forward, deep links,
  // header BracketLink clicks, programmatic setQueryParams).
  useEffect(() => {
    if (urlState.focused !== focused) {
      setFocused(urlState.focused);
    }
    if (urlState.tab && urlState.tab !== activeTab) {
      setActiveTab(urlState.tab);
    }
  }, [urlState.focused, urlState.tab, focused, activeTab, setFocused, setActiveTab]);

  // GSAP camera dolly. Reverts on dependency change so Strict Mode
  // double-mount does not leak orphan tweens.
  useGSAP(
    () => {
      const controls = controlsRef.current;
      if (!controls) return;

      const targetPose = focused ? MONITOR_FOCUS_POSE : DEFAULT_ORBIT_POSE;

      if (isFirstMount.current || reduced) {
        camera.position.set(...targetPose.position);
        controls.target.set(...targetPose.target);
        controls.update();
        controls.enabled = !focused;
        isFirstMount.current = false;
        invalidate();
        return;
      }

      controls.enabled = false;
      const tl = gsap.timeline({
        onUpdate: () => {
          controls.update();
          invalidate();
        },
        onComplete: () => {
          // Re-enable only when returning to overview (D-09 lock).
          controls.enabled = !focused;
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

  // Esc keydown — defocus + clear ?focus=.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focused) {
        setFocused(false);
        setQueryParams({ focus: null });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focused, setFocused]);

  return null;
}
