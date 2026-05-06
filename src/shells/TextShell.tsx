// src/shells/TextShell.tsx
//
// Phase 1 only shell. Composes: SkipToContent, StickyNav, Hero, 7 sections,
// Footer.
//
// Phase 2 will add a sibling <ThreeDShell /> selected by ?view=; Phase 3
// will wrap the same content components inside drei <Html transform occlude>
// surfaces inside the 3D scene. The export shape (no props, named export) is
// stable.
//
// Source: 01-UI-SPEC.md § Single-page long-scroll structure; 01-CONTEXT.md D-01

import { SkipToContent } from '../ui/SkipToContent';
import { StickyNav } from '../ui/StickyNav';
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
      <StickyNav />
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
