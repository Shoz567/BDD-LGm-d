'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LogOut, Settings, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ModeSwitch } from '@/components/mode-switch'

interface TopBarProps {
  showModeSwitch?: boolean
  currentMode?: 'comptoir' | 'gestion'
  onModeChange?: (mode: 'comptoir' | 'gestion') => void
  isAdmin?: boolean
}

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/bientot-disponible', label: 'Documentation' }
]

export function TopBar({
  showModeSwitch = true,
  currentMode = 'comptoir',
  onModeChange,
  isAdmin = false
}: TopBarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isGestion = currentMode === 'gestion'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e4ebe7] relative" style={{ boxShadow: '0 1px 4px rgba(41,78,70,.06)' }}>
      {/* Gradient micro-border at bottom of full header */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[2px] pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, #294e46 0%, #e97123 50%, #294e46 100%)', opacity: 0.4 }}
      />
      {/* Main top bar */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between gap-4" style={{ height: '76px' }}>

          {/* Left: Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/lgmad-logo.png"
              alt="LGm@d logo"
              width={120}
              height={72}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Center: Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: '#9aa89f' }}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Rechercher un produit, une pathologie, une solution"
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e4ebe7] bg-[#f4f8f6] text-sm focus:outline-none focus:ring-2 focus:ring-[#294e46]/20"
                style={{ color: '#17212b' }}
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            {/* Messages */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f4f8f6] transition-colors"
              aria-label="Messagerie"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span
                className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: '#e97123' }}
              >
                3
              </span>
            </button>

            {/* Cart */}
            <button
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f4f8f6] transition-colors"
              aria-label="Panier conseil"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span
                className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ background: '#e97123' }}
              >
                12
              </span>
            </button>

            {/* User zone */}
            <div className="hidden lg:flex items-center gap-2 ml-3 pl-3 border-l border-[#e4ebe7]">
              <span className="text-sm font-medium" style={{ color: '#17212b' }}>
                Pharmacie Aprium Sud Médical
              </span>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{ background: '#e8f3ef', color: '#294e46' }}
              >
                LC
              </div>
            </div>

            {/* Admin link */}
            <Link href="/admin" className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f4f8f6] transition-colors ml-1" aria-label="Administration">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </Link>

            {/* Logout */}
            <button
              className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f4f8f6] transition-colors"
              aria-label="Déconnexion"
            >
              <LogOut className="w-4 h-4" style={{ color: '#667085' }} />
            </button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation row */}
      {!isAdmin && (
        <div
          className="border-t border-[#e4ebe7] transition-colors duration-300"
          style={{ background: isGestion ? '#3d6b5e' : '#ffffff' }}
        >
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between" style={{ height: '68px' }}>

              {/* Gestion label (source shows this in gestion mode) */}
              {isGestion && (
                <span className="hidden md:block text-xs font-semibold uppercase tracking-widest text-white/60 mr-4">
                  Mode gestion
                </span>
              )}

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                      isGestion
                        ? pathname === link.href
                          ? 'text-white bg-white/20'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                        : pathname === link.href
                          ? 'text-[#294e46] bg-[#e8f3ef]'
                          : 'text-[#667085] hover:text-[#17212b] hover:bg-[#f4f8f6]'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mode switch */}
              {showModeSwitch && onModeChange && (
                <div className="ml-auto">
                  <ModeSwitch mode={currentMode} onModeChange={onModeChange} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e4ebe7] bg-white p-4 space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#9aa89f' }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#e4ebe7] bg-[#f4f8f6] text-sm focus:outline-none"
            />
          </div>

          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'px-4 py-3 text-sm font-medium rounded-xl transition-colors',
                  pathname === link.href
                    ? 'text-[#294e46] bg-[#e8f3ef]'
                    : 'text-[#667085] hover:text-[#17212b] hover:bg-[#f4f8f6]'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {showModeSwitch && onModeChange && (
            <div className="pt-2 border-t border-[#e4ebe7]">
              <ModeSwitch mode={currentMode} onModeChange={onModeChange} />
            </div>
          )}

          <div className="flex items-center gap-3 pt-2 border-t border-[#e4ebe7]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: '#e8f3ef', color: '#294e46' }}>
              LC
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#17212b' }}>Pharmacie Aprium Sud Médical</p>
              <p className="text-xs" style={{ color: '#667085' }}>Connecté</p>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
