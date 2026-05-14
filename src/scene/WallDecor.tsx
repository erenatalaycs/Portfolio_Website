// src/scene/WallDecor.tsx
//
// Two "wall-mounted" decor planes for the HS-redesign scene:
//   - Neon strip — thin emissive plane above the monitor, cyan/teal,
//     glow amplified by existing Bloom (Plan 04-01 luminanceThreshold
//     already tuned for emissive surfaces).
//   - Wall poster — canvas-generated texture rendering a monospace
//     whoami snippet inside an ASCII-framed accent border. No external
//     image asset — texture is built at runtime via a 2D canvas,
//     same-origin → no CSP change required.
//
// Position rationale (Phase 2 envelope):
//   - Desk centered at z=0, bookshelf at z=-0.6 (acts as backdrop).
//   - Monitor at [0, 1.10, -0.05]; frame top at y ≈ 1.33.
//   - Neon strip floats above monitor at y=1.55, slightly behind so it
//     reads as wall-mounted (not stuck-on-monitor).
//   - Wall poster offset to the right (x=+1.0) so it doesn't overlap
//     bookshelf (x ∈ [-0.5, 0.5]); rotated slightly toward the
//     overview camera for legibility.
//
// Source: ~/.claude/plans/neon-tabbing-workstation.md Task 5.

import { useMemo, useEffect } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

const NEON_CYAN = '#22d3ee';
const NEON_TEAL = '#0fb5c2';

function NeonStrip() {
  return (
    <mesh position={[0, 1.55, -0.15]}>
      <planeGeometry args={[1.4, 0.025]} />
      <meshStandardMaterial
        color={NEON_CYAN}
        emissive={NEON_CYAN}
        emissiveIntensity={2.0}
        toneMapped={false}
      />
    </mesh>
  );
}

function usePosterTexture(): CanvasTexture | null {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const W = 500;
    const H = 700;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Background — same as scene bg so the poster reads as a recessed slab.
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, W, H);

    // Outer accent border — single thin rectangle in cyan-teal.
    ctx.strokeStyle = NEON_TEAL;
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, W - 40, H - 40);

    // ASCII-art corner ticks at the four corners (4-char each).
    ctx.fillStyle = NEON_CYAN;
    ctx.font = '20px monospace';
    ctx.textBaseline = 'top';
    ctx.fillText('+--', 14, 14);
    ctx.fillText('--+', W - 50, 14);
    ctx.fillText('+--', 14, H - 36);
    ctx.fillText('--+', W - 50, H - 36);

    // Body text — green-accent palette matching SCENE_COLORS.accent.
    ctx.fillStyle = '#7ee787';
    ctx.font = '24px monospace';

    const lines: ReadonlyArray<readonly [number, string, string?]> = [
      [80, '$ whoami'],
      [115, 'eren.atalay'],
      [155, '  role: junior'],
      [185, '        cybersec analyst'],
      [215, '  loc:  UK'],
      [245, '  open: SOC / detect'],
      [295, '$ cat motto.txt'],
      [330, '> if it is not'],
      [360, '> documented,'],
      [390, '> it did not happen.'],
      [450, '$ ls /proc/links/'],
      [485, '  github.com/erenatalaycs'],
      [515, '  linkedin/in/eren-atalay'],
      [560, '$ █'],
    ];

    for (const [y, text] of lines) {
      ctx.fillText(text, 50, y);
    }

    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  }, []);
}

function WallPoster() {
  const tex = usePosterTexture();
  useEffect(() => {
    return () => {
      tex?.dispose();
    };
  }, [tex]);
  if (!tex) return null;
  return (
    <mesh position={[1.05, 1.05, -0.55]} rotation={[0, -0.18, 0]} castShadow>
      <planeGeometry args={[0.5, 0.7]} />
      <meshStandardMaterial map={tex} roughness={0.85} metalness={0.0} />
    </mesh>
  );
}

export function WallDecor() {
  return (
    <>
      <NeonStrip />
      <WallPoster />
    </>
  );
}
