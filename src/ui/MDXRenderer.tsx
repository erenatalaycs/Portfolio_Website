// src/ui/MDXRenderer.tsx
//
// OVERWRITES Plan 03-01 placeholder. <MDXProvider> with the full
// components map per UI-SPEC § MDX section headings + § <CodeBlock>
// chrome (D-16).
//
// Built-in tag overrides:
//   h1   → write-up title prompt-prefix ($ cat <slug>.md)
//   h2   → section heading prompt-prefix ($ cat <kebab>.md)
//   code → inline only (fenced blocks pass through to figure → CodeBlock)
//   a    → BracketLink with external detection
//   figure → CodeBlock (rehype-pretty-code wraps fenced code in <figure>)
//
// Custom components (authors use directly in MDX):
//   ScreenshotFrame, ProvenanceFooter
//
// Source: 03-RESEARCH.md Pattern 8; 03-UI-SPEC.md § MDX section headings;
//         03-CONTEXT.md D-16

import { MDXProvider } from '@mdx-js/react';
import type { ComponentProps, ReactNode } from 'react';
import { TerminalPrompt } from './TerminalPrompt';
import { BracketLink } from './BracketLink';
import { CodeBlock } from './CodeBlock';
import { ScreenshotFrame } from './ScreenshotFrame';
import { ProvenanceFooter } from './ProvenanceFooter';

function WriteupH1({ children }: ComponentProps<'h1'>) {
  return (
    <h1 className="text-xl font-semibold font-mono text-fg mt-6 mb-3">
      <TerminalPrompt>
        <span className="text-fg">{children}</span>
      </TerminalPrompt>
    </h1>
  );
}

function kebab(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function WriteupH2({ children }: ComponentProps<'h2'>) {
  const text = typeof children === 'string' ? children : String(children);
  return (
    <h2 className="text-xl font-semibold font-mono text-fg mt-6 mb-3">
      <TerminalPrompt>
        <span className="text-fg">cat {kebab(text)}.md</span>
      </TerminalPrompt>
    </h2>
  );
}

function InlineCode({ children, ...rest }: ComponentProps<'code'>) {
  // rehype-pretty-code adds data-language to fenced <code> elements.
  // Inline code (no parent <pre>) won't have it — apply UI-SPEC inline
  // styling. Fenced code passes through unchanged so CodeBlock chrome wraps.
  if ('data-language' in rest) {
    return <code {...rest}>{children}</code>;
  }
  return (
    <code className="bg-surface-1 px-1 text-fg" {...rest}>
      {children}
    </code>
  );
}

function MDXLink(props: ComponentProps<'a'>) {
  const isExternal = props.href?.startsWith('http') ?? false;
  return (
    <BracketLink href={props.href ?? '#'} external={isExternal}>
      {props.children}
    </BracketLink>
  );
}

const components = {
  h1: WriteupH1,
  h2: WriteupH2,
  code: InlineCode,
  a: MDXLink,
  figure: CodeBlock,
  ScreenshotFrame,
  ProvenanceFooter,
};

export function MDXRenderer({ children }: { children: ReactNode }) {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}
