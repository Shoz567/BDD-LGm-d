import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LGm@d — Plateforme MAD',
  description:
    'Solution digitale de Maintien à Domicile pour les pharmacies. Mode Comptoir IA et Mode Gestion intégrés.',
  keywords: ['MAD', 'maintien à domicile', 'matériel médical', 'pharmacie', 'dépendance', 'LGm@d'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

import AnimatedBackground from '@/components/layout/AnimatedBackground';
import { CartProvider } from '@/lib/cart';

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body suppressHydrationWarning>
        <AnimatedBackground />
        <CartProvider>
          <div className="relative z-0">
            {children}
          </div>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
