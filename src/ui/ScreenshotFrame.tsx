// src/ui/ScreenshotFrame.tsx
//
// MDX component for embedded screenshots in write-ups. Required props:
//   - n:       figure number (1, 2, 3...) — author increments manually
//   - src:     relative to public/assets/writeups/<slug>/
//   - alt:     mandatory accessibility text (NOT the caption)
//   - caption: one-line sighted-reader description
//
// Renders bordered figure + img + "fig {n} — {caption}" + mandatory
// accent-green [✓ sanitized] badge — UI-SPEC OPSEC discipline made visible.
//
// Source: 03-RESEARCH.md Pattern 10b; 03-UI-SPEC.md § <ScreenshotFrame>;
//         03-CONTEXT.md D-16

import { assetUrl } from '../lib/baseUrl';

interface ScreenshotFrameProps {
  src: string;
  alt: string;
  n: number;
  caption: string;
}

export function ScreenshotFrame({ src, alt, n, caption }: ScreenshotFrameProps) {
  return (
    <figure
      className="my-4 border p-2"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
      }}
    >
      <img src={assetUrl(`writeups/${src}`)} alt={alt} className="block w-full h-auto" />
      <figcaption className="mt-2 text-base font-mono text-muted">
        <span>
          fig {n} — {caption}
        </span>
        <span className="text-accent ml-2" aria-label="Sanitized per OPSEC checklist">
          [✓ sanitized]
        </span>
      </figcaption>
    </figure>
  );
}
