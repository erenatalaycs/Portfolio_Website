// eslint.config.js
// Source: 01-RESEARCH.md Pattern 10
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'public/draco/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/anchor-has-content': 'error',
    },
  },
  // Node CLI scripts (.mjs) — author-time only, never bundled. Declare Node globals.
  // Source: 01-03-PLAN.md (Rule 3 deviation — encode-email.mjs uses process/console/Buffer).
  {
    files: ['scripts/**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      sourceType: 'module',
    },
  },
  prettierConfig, // ALWAYS LAST: disable rules conflicting with Prettier
);
