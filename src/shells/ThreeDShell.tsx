// src/shells/ThreeDShell.tsx
//
// PLACEHOLDER — Plan 02-02 ships this stub so App.tsx's React.lazy import
// resolves without a runtime "Module not found" error during Wave 2 / Wave 3.
// Plan 02-04 OVERWRITES this file with the full R3F implementation:
// <Header /> + <main><Canvas ...><Lighting /><Workstation /><Controls /></Canvas></main>
// + <Footer />, plus the webglcontextlost listener that calls onContextLost().
//
// The default export shape (default-exported component, props = { onContextLost }) is
// contract-locked — Plan 02-04 implements this exact signature.
//
// Source: 02-UI-SPEC.md § 3D shell DOM structure (3D-03); 02-RESEARCH.md Pattern 5

interface ThreeDShellProps {
  onContextLost: () => void;
}

export default function ThreeDShell(props: ThreeDShellProps) {
  // Plan 04 replaces this. Until then, render a non-empty marker so the
  // lazy + Suspense flow works end-to-end during plan reviews. The prop is
  // referenced (typeof-only) so the linter sees it as used; Plan 04 wires
  // the real webglcontextlost path that calls props.onContextLost().
  void props.onContextLost;
  return (
    <div data-testid="three-d-shell-placeholder" className="font-mono text-fg p-6">
      [3D shell placeholder — Plan 04 will replace this with the procedural workstation scene.]
    </div>
  );
}
