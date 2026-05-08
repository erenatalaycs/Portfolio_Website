// vite.config.ts
// Source: 01-RESEARCH.md Pattern 1 (Phase 1 base config); 02-RESEARCH.md
//         Pattern 9 Option A (explicit chunk filenames for size-limit globs);
//         02-RESEARCH.md Pattern 1 (automatic chunking ONLY — manual-chunks
//         option must not be set; see Vite issue #17653);
//         03-RESEARCH.md Pattern 1 (MDX 3 + Vite 8 — enforce: 'pre' before
//         plugin-react; providerImportSource for <MDXProvider>).
//
// !! DO NOT ADD a manual-chunks declaration to rollupOptions.output !!
// Phase 2 ships a React.lazy boundary around ThreeDShell. A static
// chunk entry forces those vendor bundles into the entry chunk,
// defeating capability-gated lazy-loading and blowing the size budget
// (Vite issue 17653 / 5189). The acceptance grep enforces this at CI.
//
// !! DO NOT REORDER plugins !!
// The MDX plugin uses { enforce: 'pre', ...mdx({...}) } so Vite sorts
// it before plugin-react regardless of array index. Remove enforce:'pre'
// and every .mdx file fails to parse with "Unexpected token" (Pitfall 1).
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';

// Single source of truth for the GH Pages base path.
const BASE = '/Portfolio_Website/';

// D-13: github-dark matches --color-bg #0d1117 exactly so the code-block
// backdrop reads as a recessed slab with no border. keepBackground:true
// lets Shiki's bg win (UI-SPEC § <CodeBlock> color contract).
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,
  defaultLang: 'plaintext',
};

export default defineConfig({
  base: BASE,
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
          remarkGfm,
        ],
        rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react({
      include: /\.(jsx|js|mdx|md|tsx|ts)$/,
    }),
    tailwindcss(),
  ],
  build: {
    sourcemap: false,
    target: 'es2022',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
