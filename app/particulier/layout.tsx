import Link from 'next/link';
import type { Metadata } from 'next';
import { ParticulierHeader } from '@/components/layout/ParticulierHeader';

export const metadata: Metadata = {
  title: 'LGm@d — Espace Particulier',
  description: 'Trouvez les équipements et les informations pour rester chez vous en toute sécurité.',
};

export default function ParticulierLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(160deg, #f0faf6 0%, #fdf6ee 50%, #f5f0fa 100%)' }}>
      <ParticulierHeader />

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{ padding: '24px 20px', textAlign: 'center', borderTop: '1px solid rgba(41,78,70,0.08)', background: 'rgba(255,255,255,0.6)' }}>
        <p style={{ fontSize: '12px', color: '#7aa087', margin: 0 }}>
          LGm@d — Plateforme de Maintien à Domicile ·{' '}
          <Link href="/" style={{ color: '#294e46', fontWeight: 600, textDecoration: 'none' }}>Espace professionnel</Link>
        </p>
      </footer>
    </div>
  );
}
