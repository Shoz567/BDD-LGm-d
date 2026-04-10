'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ClipboardList, ArrowLeftRight } from 'lucide-react';
import { useCart } from '@/lib/cart';

const NAV = [
  { href: '/particulier/catalogue', label: 'Équipements' },
  { href: '/particulier/droits', label: 'Mes droits' },
  { href: '/particulier/conseils', label: 'Conseils' },
];

export function ParticulierHeader() {
  const { count } = useCart();

  return (
    <header style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(41,78,70,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <Link href="/particulier" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Image src="/LGmad-logo.png" alt="LGm@d" width={110} height={44} style={{ height: '38px', width: 'auto', objectFit: 'contain' }} priority />
          <span style={{ fontSize: '11px', color: '#7aa087', fontWeight: 600, borderLeft: '1px solid #e3e9e5', paddingLeft: '10px', whiteSpace: 'nowrap' }}>Espace particulier</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Retour espace pro */}
          <div style={{ display: 'flex', gap: '4px', marginRight: '8px', paddingRight: '12px', borderRight: '1px solid #e3e9e5' }}>
            <Link
              href="/"
              title="Mode Comptoir"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#53636e', background: '#f6fbf8', border: '1px solid #e3e9e5', textDecoration: 'none' }}
            >
              <ArrowLeftRight size={13} />
              Comptoir
            </Link>
            <Link
              href="/gestion"
              title="Mode Gestion"
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, color: '#53636e', background: '#f6fbf8', border: '1px solid #e3e9e5', textDecoration: 'none' }}
            >
              <ArrowLeftRight size={13} />
              Gestion
            </Link>
          </div>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="particulier-nav-link"
              style={{ padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#41525d', textDecoration: 'none' }}
            >
              {item.label}
            </Link>
          ))}
          {/* Ma liste */}
          <Link
            href="/particulier/panier"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#294e46',
              background: count > 0 ? '#edf5f1' : 'transparent',
              border: count > 0 ? '1px solid #c6ddd7' : '1px solid transparent',
              textDecoration: 'none',
              transition: 'all .15s',
            }}
          >
            <ClipboardList size={15} />
            Ma liste
            {count > 0 && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '18px',
                height: '18px',
                borderRadius: '999px',
                background: '#e97123',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 800,
                padding: '0 4px',
              }}>
                {count}
              </span>
            )}
          </Link>

          <Link
            href="/particulier/chat"
            style={{
              padding: '9px 18px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#fff',
              background: 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(41,78,70,0.2)',
              marginLeft: '4px',
            }}
          >
            💬 Hellia
          </Link>
        </nav>
      </div>

      <style>{`
        .particulier-nav-link:hover { background: #f0faf6; }
      `}</style>
    </header>
  );
}
