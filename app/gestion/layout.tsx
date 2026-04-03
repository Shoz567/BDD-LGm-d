import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/topbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'LGm@d — Mode Gestion',
  description: 'Pilotage économique de votre activité MAD. Commandes, catalogue, KPIs et support IA.',
};

export default function GestionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar mode="gestion" />
      <main className="flex-1 mx-auto w-[min(1320px,calc(100%-40px))] py-8 px-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
