'use client';

import { DEMO_PERSONAS } from '@/lib/personas';
import { DemoPersona } from '@/lib/types';

interface PersonaSelectorProps {
  onSelect: (persona: DemoPersona) => void;
  onClose: () => void;
}

export function PersonaSelector({ onSelect, onClose }: PersonaSelectorProps) {
  const girColors = ['', '#dc2626', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '640px', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '2px' }}>
              🎭 Mode Démo — Sélectionner un cas patient
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              6 cas couvrant tous les niveaux de dépendance
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-secondary)',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            ✕ Fermer
          </button>
        </div>

        {/* Personas grid */}
        <div style={{
          padding: '16px 24px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}>
          {DEMO_PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => { onSelect(persona); onClose(); }}
              style={{
                background: 'var(--color-bg-elevated)',
                border: `1px solid ${girColors[persona.girAttendu]}30`,
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 150ms ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${girColors[persona.girAttendu]}80`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = `${girColors[persona.girAttendu]}30`;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '1.5rem' }}>{persona.emoji}</span>
                <span style={{
                  background: `${girColors[persona.girAttendu]}18`,
                  border: `1px solid ${girColors[persona.girAttendu]}50`,
                  color: girColors[persona.girAttendu],
                  borderRadius: '999px',
                  padding: '2px 10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>
                  GIR {persona.girAttendu}
                </span>
              </div>
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '2px' }}>
                  {persona.nom} — {persona.age}
                </p>
                <p style={{ fontSize: '0.775rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  {persona.scenario}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
