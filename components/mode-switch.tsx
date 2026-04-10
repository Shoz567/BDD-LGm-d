'use client'

import { useRef, useState, useEffect } from 'react'

interface ModeSwitchProps {
  mode: 'comptoir' | 'gestion'
  onModeChange: (mode: 'comptoir' | 'gestion') => void
}

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  const btnComptoir = useRef<HTMLButtonElement>(null)
  const btnGestion = useRef<HTMLButtonElement>(null)
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 6, width: 0 })

  useEffect(() => {
    const active = mode === 'comptoir' ? btnComptoir.current : btnGestion.current
    if (active) {
      setPillStyle({ left: active.offsetLeft, width: active.offsetWidth })
    }
  }, [mode])

  const isGestion = mode === 'gestion'

  return (
    <div
      className="relative inline-flex items-center rounded-full p-1.5 select-none"
      style={{
        background: isGestion ? 'rgba(255,255,255,0.12)' : '#e8f3ef',
        border: isGestion ? '1px solid rgba(255,255,255,0.2)' : '1px solid #d0e6dd',
      }}
    >
      {/* Sliding pill */}
      <span
        aria-hidden="true"
        className="absolute top-1.5 bottom-1.5 rounded-full transition-all duration-300 ease-out"
        style={{
          left: pillStyle.left,
          width: pillStyle.width,
          background: '#294e46',
        }}
      />

      {/* Comptoir button */}
      <button
        ref={btnComptoir}
        onClick={() => onModeChange('comptoir')}
        type="button"
        className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors duration-200"
        aria-pressed={mode === 'comptoir'}
      >
        <span
          className="text-xs transition-colors duration-200"
          style={{ color: mode === 'comptoir' ? '#e97123' : isGestion ? 'rgba(255,255,255,0.5)' : '#7a8c85' }}
        >
          ●
        </span>
        <span className="text-left">
          <span
            className="block text-xs font-semibold leading-tight transition-colors duration-200"
            style={{ color: mode === 'comptoir' ? '#ffffff' : isGestion ? 'rgba(255,255,255,0.6)' : '#667085' }}
          >
            Mode comptoir
          </span>
          <span
            className="block text-[10px] leading-tight transition-colors duration-200"
            style={{ color: mode === 'comptoir' ? 'rgba(255,255,255,0.7)' : isGestion ? 'rgba(255,255,255,0.4)' : '#9aa89f' }}
          >
            prix publics TTC
          </span>
        </span>
      </button>

      {/* Gestion button */}
      <button
        ref={btnGestion}
        onClick={() => onModeChange('gestion')}
        type="button"
        className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full transition-colors duration-200"
        aria-pressed={mode === 'gestion'}
      >
        <span
          className="text-xs transition-colors duration-200"
          style={{ color: mode === 'gestion' ? '#e97123' : isGestion ? 'rgba(255,255,255,0.3)' : '#7a8c85' }}
        >
          ●
        </span>
        <span className="text-left">
          <span
            className="block text-xs font-semibold leading-tight transition-colors duration-200"
            style={{ color: mode === 'gestion' ? '#ffffff' : isGestion ? 'rgba(255,255,255,0.6)' : '#667085' }}
          >
            Mode gestion
          </span>
          <span
            className="block text-[10px] leading-tight transition-colors duration-200"
            style={{ color: mode === 'gestion' ? 'rgba(255,255,255,0.7)' : isGestion ? 'rgba(255,255,255,0.4)' : '#9aa89f' }}
          >
            suivi &amp; commandes HT
          </span>
        </span>
      </button>
    </div>
  )
}
