import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-base)] mt-auto">
      <div className="mx-auto max-w-[1320px] px-6 py-5">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-brand-primary text-white text-[9px] font-bold">
              LG
            </div>
            <span className="text-sm font-bold text-text-main">LGm@d</span>
            <span className="text-xs text-text-muted">— Plateforme MAD Pharmacies</span>
          </div>

          <div className="flex items-center gap-5 text-xs text-text-muted">
            <Link href="/" className="hover:text-brand-primary transition-colors font-medium">Accueil</Link>
            <Link href="/parcours" className="hover:text-brand-primary transition-colors font-medium">Parcours</Link>
            <Link href="/comptoir" className="hover:text-brand-primary transition-colors font-medium">Comptoir IA</Link>
            <Link href="/gestion" className="hover:text-brand-primary transition-colors font-medium">Gestion</Link>
          </div>

          <p className="text-xs text-text-muted">© 2026 LGm@d · 2 470 références</p>
        </div>
      </div>
    </footer>
  );
}
