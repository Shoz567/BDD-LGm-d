import type { Metadata } from 'next';
import { Topbar } from '@/components/layout/topbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'LGm@d — Parcours conseil',
  description: 'Parcours conseil MAD — orientez rapidement selon le besoin du patient.',
};

export default function ParcoursLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <main className="flex-1 mx-auto w-[min(1320px,calc(100%-40px))] py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
