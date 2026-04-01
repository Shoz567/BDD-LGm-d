import Link from 'next/link'

const footerLinks = {
  plateforme: [
    { label: 'Catalogue', href: '/catalogue' },
    { label: 'Parcours conseil', href: '/' },
    { label: 'Questionnaire autonomie', href: '/questionnaire' },
    { label: 'Formations', href: '/bientot-disponible' }
  ],
  support: [
    { label: 'Centre d\'aide', href: '/bientot-disponible' },
    { label: 'Nous contacter', href: '/bientot-disponible' },
    { label: 'Tutoriels', href: '/bientot-disponible' },
    { label: 'FAQ', href: '/bientot-disponible' }
  ],
  legal: [
    { label: 'Mentions légales', href: '/bientot-disponible' },
    { label: 'CGU', href: '/bientot-disponible' },
    { label: 'Politique de confidentialité', href: '/bientot-disponible' },
    { label: 'Cookies', href: '/bientot-disponible' }
  ]
}

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold">LG</span>
              </div>
              <span className="font-bold text-xl">LGm@d</span>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Solution digitale MAD — La plateforme de référence pour le maintien à domicile en pharmacie.
            </p>
          </div>

          {/* Plateforme */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 text-primary-foreground/90">
              Plateforme
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.plateforme.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 text-primary-foreground/90">
              Support
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide mb-4 text-primary-foreground/90">
              Légal
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <p className="text-sm text-primary-foreground/60 text-center">
            © 2026 LGm@d — Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  )
}
