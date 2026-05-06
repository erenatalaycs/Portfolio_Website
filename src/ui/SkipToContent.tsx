// src/ui/SkipToContent.tsx
//
// First focusable element on the page. sr-only by default; on :focus, becomes
// visible at top-left, accent-green text on bg, with the focus-ring outline.
// Targets <main id="main"> so Tab → Enter lands the keyboard user past the
// sticky nav and the StickyNav's six [bracket] links.
//
// Source: 01-UI-SPEC.md § Skip-to-content link; TXT-05; Phase-1 success
//   criterion 4 (full keyboard navigation; semantic landmarks).

export function SkipToContent() {
  return (
    <a
      href="#main"
      className={[
        // sr-only baseline — invisible to sighted users until focused
        'sr-only',
        // On focus: anchor becomes visible at top-left
        'focus:not-sr-only',
        'focus:fixed focus:top-2 focus:left-2 focus:z-50',
        'focus:px-3 focus:py-2',
        'focus:bg-bg focus:text-accent',
        // Focus ring per UI-SPEC § Color § Focus ring (2px solid #79c0ff offset 2px)
        'focus:outline-2 focus:outline-focus focus:outline-offset-2',
        'focus:font-mono',
      ].join(' ')}
    >
      Skip to content
    </a>
  );
}
