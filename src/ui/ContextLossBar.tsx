// src/ui/ContextLossBar.tsx
//
// PLACEHOLDER — Plan 02-02 ships this stub so App.tsx can import it without
// a missing-module error. Plan 02-03 OVERWRITES this file with the full
// UI-SPEC implementation (info bar with [!] glyph, body copy, [retry 3D],
// [×] dismiss button, role="status" aria-live="polite", 8-second auto-
// dismiss timer).
//
// Source: 02-UI-SPEC.md § Context-loss info bar (D-13); 02-RESEARCH.md
//         Common Pitfalls Pitfall 4 (relative ?view=3d href).

export function ContextLossBar() {
  // Plan 03 ships the real layout. This placeholder is just a non-null DOM
  // node so React mounting works during Plan 02's wiring tests.
  return <div role="status" aria-live="polite" data-testid="context-loss-bar-placeholder" />;
}
