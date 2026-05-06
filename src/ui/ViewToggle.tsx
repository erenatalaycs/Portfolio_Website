// src/ui/ViewToggle.tsx
//
// The "$ view  [3d]  [text]" prompt line. Renders a TerminalPrompt prefix
// followed by two BracketLink-as-button toggles. URL is the single source
// of truth (D-12) — clicks update ?view= via setQueryParams; the qpchange
// event triggers App re-render.
//
// Source: 02-UI-SPEC.md § Toggle component contract; 02-CONTEXT.md D-09, D-10, D-12

import { BracketLink } from './BracketLink';
import { TerminalPrompt } from './TerminalPrompt';
import { setQueryParams } from '../lib/useQueryParams';

interface ViewToggleProps {
  currentView: 'text' | '3d';
}

export function ViewToggle({ currentView }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-x-2 font-mono">
      <TerminalPrompt>
        <span className="text-fg">view</span>
      </TerminalPrompt>
      <BracketLink
        as="button"
        active={currentView === '3d'}
        ariaPressed={currentView === '3d'}
        ariaLabel="Switch to 3D view"
        onClick={() => setQueryParams({ view: '3d' })}
      >
        3d
      </BracketLink>
      <BracketLink
        as="button"
        active={currentView === 'text'}
        ariaPressed={currentView === 'text'}
        ariaLabel="Switch to text view"
        onClick={() => setQueryParams({ view: 'text' })}
      >
        text
      </BracketLink>
    </div>
  );
}
