// src/app/main.tsx
// Source: 01-RESEARCH.md Pattern 2 + Pattern 3
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Self-hosted JetBrains Mono — only the two weights we use (per UI-SPEC: 400 + 600).
// These imports cause Vite to bundle the woff2 files and emit @font-face rules.
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/600.css';

// Tokens + Tailwind utilities (single CSS entrypoint).
import '../styles/tokens.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element #root not found in index.html');

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
