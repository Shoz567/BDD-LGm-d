'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { CartButton } from '@/components/layout/CartDrawer';

const NAV_COMPTOIR = [
  { href: '/', label: 'Accueil', exact: true },
  { href: '/comptoir', label: 'Comptoir IA' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/parcours', label: 'Parcours conseil' },
];

const NAV_GESTION = [
  { href: '/gestion', label: 'Dashboard', exact: true },
  { href: '/gestion/catalogue', label: 'Catalogue' },
  { href: '/gestion/commandes', label: 'Commandes' },
  { href: '/gestion/clients', label: 'Patients' },
  { href: '/gestion/chat', label: 'Assistant IA' },
];

interface TopbarProps {
  mode?: 'comptoir' | 'gestion';
}

function ModeSwitchPill({ isGestion }: { isGestion: boolean }) {
  const router = useRouter();

  return (
    <div className="relative flex items-center rounded-full border border-white/20 bg-white/10 p-1 gap-0.5">
      {/* Slider animé */}
      <div
        className="absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out shadow-md"
        style={{
          left: isGestion ? 'calc(50%)' : '4px',
          background: isGestion
            ? 'rgba(255,255,255,0.18)'
            : 'rgba(255,255,255,0.22)',
        }}
      />

      {/* Bouton Comptoir */}
      <button
        onClick={() => router.push('/')}
        aria-pressed={!isGestion}
        className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold transition-colors duration-200 whitespace-nowrap ${
          !isGestion ? 'text-white' : 'text-white/55 hover:text-white/80'
        }`}
      >
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all ${!isGestion ? 'bg-brand-accent opacity-100' : 'opacity-0'}`} />
        Mode comptoir
      </button>

      {/* Bouton Gestion */}
      <button
        onClick={() => router.push('/gestion')}
        aria-pressed={isGestion}
        className={`relative z-10 flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-semibold transition-colors duration-200 whitespace-nowrap ${
          isGestion ? 'text-white' : 'text-white/55 hover:text-white/80'
        }`}
      >
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full transition-all ${isGestion ? 'bg-brand-accent opacity-100' : 'opacity-0'}`} />
        Mode gestion
      </button>
    </div>
  );
}

export function Topbar({ mode }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const isGestion = mode === 'gestion' || (!mode && pathname.startsWith('/gestion'));
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');

  const navLinks = isGestion ? NAV_GESTION : NAV_COMPTOIR;

  return (
    <>
      {/* ── Topbar principale ── */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'linear-gradient(135deg, #1a3d35 0%, #294e46 50%, #1a3d35 100%)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        <div className="mx-auto grid max-w-[1320px] grid-cols-[200px_1fr_auto] items-center gap-4 px-6 py-2.5">

          {/* Logo */}
          <Link href="/" className="flex items-center justify-start hover:opacity-85 transition-opacity">
            <Image
              src="/LGmad-logo.png"
              alt="LGm@d"
              width={120}
              height={48}
              className="h-[42px] w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = search.trim();
              if (!q) return;
              setSearch('');
              router.push(`/catalogue?q=${encodeURIComponent(q)}`);
            }}
            className="flex h-[40px] items-center overflow-hidden rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm focus-within:bg-white/18 focus-within:border-white/30 transition-all"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit, une pathologie…"
              className="flex-1 w-full bg-transparent px-4 text-[14px] outline-none text-white placeholder:text-white/45"
            />
            <button type="submit" className="px-3 text-white/60 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </button>
          </form>

          {/* User zone */}
          <div className="flex items-center gap-2.5 whitespace-nowrap">
            {/* Lien espace particulier */}
            <Link
              href="/particulier"
              className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold text-white/60 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
              title="Espace Particulier"
            >
              <span>👤</span>
              <span>Particulier</span>
            </Link>

            {/* Mode switch */}
            <ModeSwitchPill isGestion={isGestion} />

            {/* Séparateur */}
            <div className="h-7 w-px bg-white/15 mx-1" />

            {/* Pharmacie label */}
            <span className="hidden lg:block text-[13px] font-semibold text-white/70 px-1">
              Aprium
            </span>

            {/* Avatar */}
            <div className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-white/15 border border-white/20 font-extrabold text-white text-[13px]">
              AP
            </div>

            <CartButton />

            <Link
              href="/gestion/admin"
              className="grid h-[36px] w-[36px] place-items-center rounded-[10px] bg-white/10 border border-white/15 text-white/70 transition hover:bg-white/20 hover:text-white"
              title="Administration"
            >
              <Settings className="h-[16px] w-[16px]" />
            </Link>

            <button
              className="grid h-[36px] w-[36px] place-items-center rounded-[10px] bg-white/10 border border-white/15 text-white/70 transition hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30"
              aria-label="Déconnexion"
            >
              <LogOut className="h-[16px] w-[16px]" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Barre de navigation secondaire ── */}
      <nav
        className="sticky z-40 border-b transition-all duration-300"
        style={{
          top: '61px',
          background: isGestion
            ? 'linear-gradient(90deg, #1a3d35 0%, #294e46 100%)'
            : 'rgba(255,255,255,0.92)',
          borderColor: isGestion ? 'rgba(255,255,255,0.10)' : 'rgba(228,235,231,0.8)',
          backdropFilter: isGestion ? 'none' : 'blur(12px)',
        }}
      >
        <div className="mx-auto flex max-w-[1320px] items-center gap-1 px-6 py-1.5">
          {navLinks.map((link) => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center rounded-lg px-4 py-2 text-[14px] font-semibold transition-all duration-200 ${
                  isGestion
                    ? active
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                    : active
                      ? 'bg-brand-primary/8 text-brand-primary'
                      : 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
