// src/shells/TextShell.tsx
//
// Phase 2 + Phase 3 update: Phase 3 detects ?focus=writeups/<slug>
// and renders <Suspense><WriteupsRoute slug={...} /></Suspense>; MDX
// runtime + compiled write-ups load only at this chunk boundary
// (Pattern 7 Option A).
//
// The non-write-up path is unchanged: long-scroll body with all
// Phase 1 sections.
//
// Source: 03-RESEARCH.md Pattern 7 Option A;
//         01-UI-SPEC.md § Single-page long-scroll (preserved);
//         02-UI-SPEC.md § View-toggle line layout (preserved)

import { lazy, Suspense } from 'react';
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
import { useQueryParams } from '../lib/useQueryParams';
import { TerminalPrompt } from '../ui/TerminalPrompt';
import { getWriteup } from '../content/writeups';

const WriteupsRoute = lazy(() => import('../routes/WriteupsRoute'));

function WriteupsLoadingSkeleton({ slug }: { slug: string }) {
  const w = getWriteup(slug);
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto max-w-[72ch] px-4 md:px-6 py-12 font-mono text-fg"
    >
      <h1 className="text-xl font-semibold font-mono text-fg">
        <TerminalPrompt>
          <span className="text-fg">cat {slug}.md</span>
        </TerminalPrompt>
      </h1>
      {w && (
        <p className="mt-3 text-muted text-base font-mono">
          {w.date} · {w.duration}
        </p>
      )}
    </main>
  );
}

export function TextShell() {
  const params = useQueryParams();
  const focus = params.get('focus') ?? '';

  if (focus.startsWith('writeups/')) {
    const slug = focus.slice('writeups/'.length);
    return (
      <>
        <SkipToContent />
        <Header currentView="text" />
        <Suspense fallback={<WriteupsLoadingSkeleton slug={slug} />}>
          <WriteupsRoute slug={slug} />
        </Suspense>
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
