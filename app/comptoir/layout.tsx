import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LGm@d — Mode Comptoir IA',
  description: 'Assistant virtuel pour l\'orientation en matériel médical de maintien à domicile.',
};

export default function ComptoirLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
