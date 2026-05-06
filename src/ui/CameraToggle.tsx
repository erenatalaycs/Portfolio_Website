// src/ui/CameraToggle.tsx
//
// The "$ camera  [orbit]  [free]" prompt line. Rendered ONLY inside the 3D
// shell (D-11 — meaningless in text shell). State is ephemeral (NOT URL,
// NOT cached client-side) — the parent (<ThreeDShell> or <Header>) holds
// the React hook, this toggle calls onChange to lift updates.
//
// Source: 02-UI-SPEC.md § Toggle component contract; 02-CONTEXT.md D-11

import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';

export type CameraMode = 'orbit' | 'free';

interface CameraToggleProps {
  cameraMode: CameraMode;
  onChange: (mode: CameraMode) => void;
}

export function CameraToggle({ cameraMode, onChange }: CameraToggleProps) {
  return (
    <div className="flex items-center gap-x-2 font-mono">
      <TerminalPrompt>
        <span className="text-fg">camera</span>
      </TerminalPrompt>
      <BracketLink
        as="button"
        active={cameraMode === 'orbit'}
        ariaPressed={cameraMode === 'orbit'}
        ariaLabel="Camera mode: orbit (clamped)"
        onClick={() => onChange('orbit')}
      >
        orbit
      </BracketLink>
      <BracketLink
        as="button"
        active={cameraMode === 'free'}
        ariaPressed={cameraMode === 'free'}
        ariaLabel="Camera mode: free (unclamped)"
        onClick={() => onChange('free')}
      >
        free
      </BracketLink>
    </div>
  );
}
