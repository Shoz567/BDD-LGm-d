'use client'

import { useState } from 'react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { ChatWidget } from '@/components/chat-widget'
import { ModeComptoir } from '@/components/home/mode-comptoir'
import { ModeGestion } from '@/components/home/mode-gestion'

export default function HomePage() {
  const [mode, setMode] = useState<'comptoir' | 'gestion'>('comptoir')

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar
        showModeSwitch
        currentMode={mode}
        onModeChange={setMode}
      />

      <main className="flex-1">
        <div className="relative">
          <div
            className={`transition-opacity duration-300 ${
              mode === 'comptoir' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            <ModeComptoir />
          </div>
          <div
            className={`transition-opacity duration-300 ${
              mode === 'gestion' ? 'opacity-100' : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            <ModeGestion />
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
