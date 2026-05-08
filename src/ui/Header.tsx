// src/ui/Header.tsx
//
// Shared sticky header rendered by BOTH shells. Replaces Phase 1's
// <StickyNav /> — the `$ goto` line is preserved verbatim, with a new
// `$ view [3d] [text] [│ $ camera [orbit] [free]]` line below.
//
// In the 3D shell, this header is the DOM-overlay sibling of <Canvas>
// required by 3D-03 (always-visible view toggle).
//
// Source: 02-UI-SPEC.md § View-toggle line layout (D-10 / D-11); § Mobile
//         breakpoints; 02-RESEARCH.md Pattern 6; 02-CONTEXT.md D-10, D-11

import { SECTIONS } from '../content/sections';
import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';
import { ViewToggle } from './ViewToggle';
import { CameraToggle, type CameraMode } from './CameraToggle';
import { setQueryParams } from '../lib/useQueryParams';

interface HeaderProps {
  currentView: 'text' | '3d';
  showCameraToggle?: boolean;
  cameraMode?: CameraMode;
  onCameraModeChange?: (mode: CameraMode) => void;
}

export function Header({
  currentView,
  showCameraToggle,
  cameraMode,
  onCameraModeChange,
}: HeaderProps) {
  const renderCameraToggle =
    !!showCameraToggle && cameraMode !== undefined && onCameraModeChange !== undefined;

  return (
    <header
      role="banner"
      className={[
        'sticky top-0 z-10',
        'bg-bg',
        'border-b border-b-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]',
      ].join(' ')}
    >
      <div className="flex flex-col font-mono">
        {/* Line 1: $ goto [about] [skills] ... — Phase 1 contract preserved */}
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-3">
          <TerminalPrompt>
            <span className="text-fg">goto</span>
          </TerminalPrompt>
          {SECTIONS.map((s) => (
            <BracketLink
              key={s.id}
              href={`#${s.id}`}
              onClick={
                currentView === '3d'
                  ? (e) => {
                      // 3D shell: delegate to FocusController via URL.
                      // Text shell: anchor href handles scroll natively.
                      e.preventDefault();
                      setQueryParams({ focus: s.id });
                    }
                  : undefined
              }
            >
              {s.label}
            </BracketLink>
          ))}
        </nav>

        {/* Line 2: $ view [3d] [text]  │  $ camera [orbit] [free] (3D-shell only) */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pb-3">
          <ViewToggle currentView={currentView} />
          {renderCameraToggle && (
            <>
              <span
                aria-hidden="true"
                className={[
                  // Vertical divider — UI-SPEC: h-4 mx-2 with 20%-mix accent border-left.
                  'hidden sm:inline-block',
                  'h-4 mx-2',
                  'border-l border-l-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]',
                ].join(' ')}
              />
              <CameraToggle cameraMode={cameraMode} onChange={onCameraModeChange} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
