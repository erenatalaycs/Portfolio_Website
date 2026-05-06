// src/shells/TextShell.tsx
//
// Phase 2: shell composition unchanged except StickyNav → Header. Header
// now renders BOTH the $ goto nav line AND the $ view [3d] [text] toggle
// line. Camera toggle does not appear here (text shell — D-11).
//
// The 3D shell (Plan 04) renders the same Header with showCameraToggle and
// cameraMode/onCameraModeChange wired up.
//
// Source: 01-UI-SPEC.md § Single-page long-scroll structure (preserved);
//         02-UI-SPEC.md § View-toggle line layout (added)

import { SkipToContent } from '../ui/SkipToContent';
import { Header } from '../ui/Header';
import { Hero } from '../sections/Hero';
import { About } from '../sections/About';
import { Education } from '../sections/Education';
import { Skills } from '../sections/Skills';
import { Projects } from '../sections/Projects';
import { Certs } from '../sections/Certs';
import { Writeups } from '../sections/Writeups';
import { Contact } from '../sections/Contact';
import { BracketLink } from '../ui/BracketLink';
import { identity } from '../content/identity';

export function TextShell() {
  return (
    <>
      <SkipToContent />
      <Header currentView="text" />
      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-[72ch] px-4 md:px-6 py-12 font-mono text-fg"
      >
        <Hero />
        <About />
        <Education />
        <Skills />
        <Projects />
        <Certs />
        <Writeups />
        <Contact />
      </main>
      <footer
        role="contentinfo"
        className="mt-16 pb-8 px-4 md:px-6 mx-auto max-w-[72ch] text-muted text-sm font-mono"
      >
        <p>
          © {new Date().getFullYear()} {identity.name} — built solo · source on{' '}
          <BracketLink href="https://github.com/erenatalaycs/Portfolio_Website" external>
            GitHub
          </BracketLink>
        </p>
      </footer>
    </>
  );
}
