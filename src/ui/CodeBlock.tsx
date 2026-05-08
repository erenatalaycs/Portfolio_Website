// src/ui/CodeBlock.tsx
//
// MDX `figure` override for rehype-pretty-code's output (Pattern 10a
// Alternate — figure-based extraction). rehype-pretty-code wraps fenced
// code in <figure data-rehype-pretty-code-figure> with [<figcaption>title</figcaption>,
// <pre data-language="..."><code>...</code></pre>] as children.
//
// We walk children to extract filename (figcaption text) + language
// (pre's data-language) and render a chrome strip with [copy] button.
//
// UI-SPEC § <CodeBlock> chrome (D-16):
//   <filename muted>   <flex-1 spacer>   <lang muted>   [copy]
//   ─────────────────────────────────────────────────────────
//   <code area, Shiki-tokenised>
//
// [copy] → [copied] for 1.5s on success (Phase 1 EmailReveal pattern).
//
// Source: 03-RESEARCH.md Pattern 10a Alternate; 03-UI-SPEC.md §
//         <CodeBlock> chrome copy + color contract; 03-CONTEXT.md D-16

import {
  Children,
  isValidElement,
  useRef,
  useState,
  type ReactNode,
  type ReactElement,
} from 'react';
import { BracketLink } from './BracketLink';

interface CodeBlockProps {
  children?: ReactNode;
}

function findChild(children: ReactNode, tag: string): ReactElement | null {
  let found: ReactElement | null = null;
  Children.forEach(children, (c) => {
    if (found) return;
    if (
      isValidElement(c) &&
      (c.type === tag || (c as ReactElement<{ tagName?: string }>).props?.tagName === tag)
    ) {
      found = c as ReactElement;
    }
  });
  return found;
}

function getStringContent(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(getStringContent).join('');
  if (isValidElement(node))
    return getStringContent((node.props as { children?: ReactNode }).children);
  return '';
}

export function CodeBlock({ children }: CodeBlockProps) {
  const figcaption = findChild(children, 'figcaption');
  const pre = findChild(children, 'pre');
  const filename = figcaption
    ? getStringContent((figcaption.props as { children?: ReactNode }).children)
    : '';
  const lang =
    (pre?.props as { ['data-language']?: string } | undefined)?.['data-language'] ?? 'plaintext';

  const codeRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    const text = codeRef.current?.querySelector('code')?.textContent ?? '';
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      className="my-4 border"
      style={{
        borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
      }}
    >
      {/* chrome strip */}
      <div
        className="flex items-center gap-2 px-4 py-2 text-base font-mono bg-surface-1 border-b"
        style={{
          borderColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)',
        }}
      >
        <span className="text-muted flex-1">{filename}</span>
        <span className="text-muted">{lang}</span>
        <BracketLink as="button" onClick={onCopy} ariaLabel="Copy code to clipboard">
          {copied ? 'copied' : 'copy'}
        </BracketLink>
        <span aria-live="polite" className="sr-only">
          {copied ? 'Copied to clipboard' : ''}
        </span>
      </div>
      {/* code area — pre + code with all rehype-pretty-code data attrs intact */}
      <div ref={codeRef} className="px-4 py-3 text-base overflow-x-auto">
        {pre}
      </div>
    </div>
  );
}
