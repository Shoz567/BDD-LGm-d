import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/topbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'LGm@d — Catalogue Comptoir',
  description: 'Catalogue des équipements pour le Maintien À Domicile.',
};

export default function CatalogueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 mx-auto w-[min(1320px,calc(100%-40px))] py-8 px-0 animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  );
}
