// src/3d/ScenePostprocessing.tsx
//
// Postprocessing tier-gating wrapper. drei <PerformanceMonitor> probes
// fps; binary perfTier flip mounts/unmounts <PostFX> via React.lazy +
// Suspense.
//
// Tier semantics (CONTEXT D-05 / D-06):
//   - `bounds={() => [30, 50]}` — drei API requires a function returning
//     a [lower, upper] tuple. Static-array form does NOT exist (RESEARCH
//     Pattern 4 correction to CONTEXT D-05). Lower bound 30 = decline
//     trigger; upper 50 = incline trigger.
//   - `flipflops={3}` — after 3 ping-pong flips between bounds, drei
//     calls onFallback and stops monitoring. Defensive: onFallback also
//     forces tier='low' to prevent oscillation on borderline devices.
//   - Tier flip = instant mount/unmount (CONTEXT D-07; UI-SPEC § Tier-flip
//     visual contract). No fade animation, no transition.
//
// Lazy boundary (CONTEXT D-09): the @react-three/postprocessing chunk
// ships in a SEPARATE Vite chunk (dist/assets/PostFX-*.js). Low-tier
// devices never download postprocessing JS — verified by size-limit
// (package.json 4th entry, 50 KB gz limit).
//
// Source: 04-CONTEXT.md D-05/D-06/D-07/D-09; 04-RESEARCH.md Pattern 3 +
//   Pattern 4; 04-UI-SPEC.md § Postprocessing pipeline integration

import { Suspense, lazy, useState } from 'react';
import { PerformanceMonitor } from '@react-three/drei';

const PostFX = lazy(() => import('./PostFX').then((m) => ({ default: m.PostFX })));

type PerfTier = 'high' | 'low';

export function ScenePostprocessing() {
  const [tier, setTier] = useState<PerfTier>('high');

  return (
    <>
      <PerformanceMonitor
        bounds={() => [30, 50]}
        flipflops={3}
        onIncline={() => setTier('high')}
        onDecline={() => setTier('low')}
        onFallback={() => setTier('low')}
      />
      {tier === 'high' && (
        <Suspense fallback={null}>
          <PostFX />
        </Suspense>
      )}
    </>
  );
}
