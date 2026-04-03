'use client';

import { GIRScore } from '@/lib/types';

interface GIRBadgeProps {
  gir: GIRScore;
  showDetails?: boolean;
}

export function GIRBadge({ gir, showDetails = false }: GIRBadgeProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: showDetails ? 'flex-start' : 'center' }}>
      <div
        className="gir-badge"
        style={{
          backgroundColor: `${gir.couleur}18`,
          border: `1.5px solid ${gir.couleur}60`,
          color: gir.couleur,
        }}
      >
        <span style={{ fontSize: '10px' }}>■</span>
        GIR {gir.niveau}
      </div>
      {showDetails && (
        <>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', maxWidth: '220px' }}>
            {gir.description}
          </p>
          {gir.eligibleAPA && (
            <span className="chip" style={{ fontSize: '0.7rem', color: '#84cc16', borderColor: 'rgba(132,204,22,0.3)', background: 'rgba(132,204,22,0.08)' }}>
              ✓ Éligible APA
            </span>
          )}
        </>
      )}
    </div>
  );
}
