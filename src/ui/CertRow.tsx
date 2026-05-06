// src/ui/CertRow.tsx
//
// Status-driven leading bracket:
//   earned       → [✓] (accent green)
//   in-progress  → [ ] (warn amber)  — date mandatory: target Mon YYYY
//   planned      → [ ] (warn amber)
//
// Source: 01-UI-SPEC.md § Certifications; D-10

import type { ReactNode } from 'react';
import type { Cert } from '../content/certs';

interface CertRowProps {
  cert: Cert;
}

function formatYearMonth(iso: string | undefined): string {
  if (!iso) return '';
  // iso is YYYY-MM (per certs.ts JSDoc).
  const [yyyy, mm] = iso.split('-');
  const date = new Date(Number(yyyy), Number(mm) - 1, 1);
  return date.toLocaleString('en-GB', { month: 'short', year: 'numeric' });
}

export function CertRow({ cert }: CertRowProps) {
  let bracket: ReactNode;
  let trailing: ReactNode;

  if (cert.status === 'earned') {
    bracket = <span className="text-accent">[✓]</span>;
    trailing = (
      <>
        — <span className="text-accent">earned</span>{' '}
        <span className="text-muted">{formatYearMonth(cert.date)}</span>
      </>
    );
  } else if (cert.status === 'in-progress') {
    bracket = <span className="text-warn">[ ]</span>;
    trailing = (
      <>
        — in progress, target <span className="text-muted">{formatYearMonth(cert.date)}</span>
      </>
    );
  } else {
    bracket = <span className="text-warn">[ ]</span>;
    trailing = <>— planned</>;
  }

  return (
    <li
      className={[
        'flex flex-wrap items-baseline gap-x-2 py-1 font-mono',
        'hover:bg-surface-1 hover:border-l-2 hover:border-l-accent hover:-ml-2 hover:pl-2',
      ].join(' ')}
    >
      {bracket}
      <span className="text-fg">{cert.name}</span>
      <span className="text-fg">{trailing}</span>
    </li>
  );
}
