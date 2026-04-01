import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LGm@d — Assistant Conseil Comptoir',
  description:
    'Assistant virtuel IA pour l\'orientation en matériel médical de maintien à domicile. Powered by LGm@d.',
  keywords: ['MAD', 'maintien à domicile', 'matériel médical', 'pharmacie', 'dépendance'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
