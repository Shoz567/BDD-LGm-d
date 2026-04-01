'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { 
  ChevronRight, 
  Package, 
  Check, 
  FileText, 
  Download,
  Sparkles,
  Heart,
  Users,
  Lightbulb,
  ClipboardList,
  GraduationCap,
  Folder,
  Copy
} from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { ChatWidget } from '@/components/chat-widget'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getProductByReference, products } from '@/lib/data'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ reference: string }>
}

export default function ProductDetailPage({ params }: PageProps) {
  const { reference } = use(params)
  const product = getProductByReference(reference)
  const [showReimbursement, setShowReimbursement] = useState(false)
  const [isALD, setIsALD] = useState(true)

  if (!product) {
    notFound()
  }

  const reimbursementRate = isALD ? 1 : 0.6
  const reimbursement = product.baseLPPR * reimbursementRate
  const remaining = product.prixTTC - reimbursement

  const copyPrescription = () => {
    if (product.libellePrescription) {
      navigator.clipboard.writeText(product.libellePrescription)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar showModeSwitch={false} />

      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Fil d'Ariane">
            <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-4 h-4 text-text-tertiary" />
            <Link href="/catalogue" className="text-text-secondary hover:text-text-primary transition-colors">
              Catalogue
            </Link>
            <ChevronRight className="w-4 h-4 text-text-tertiary" />
            <span className="text-text-primary font-medium">{product.nom}</span>
          </nav>

          {/* Main content - Two columns */}
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 mb-16">
            {/* Left column - 65% */}
            <div className="lg:col-span-3 space-y-8">
              {/* Image gallery */}
              <div>
                <div className="aspect-square bg-surface-muted rounded-2xl flex items-center justify-center mb-4">
                  <Package className="w-24 h-24 text-text-tertiary" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="aspect-square bg-surface-muted rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 ring-primary transition-all"
                    >
                      <Package className="w-8 h-8 text-text-tertiary" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <section>
                <h2 className="text-xl font-bold text-text-primary mb-4">Description</h2>
                <p className="text-text-secondary leading-relaxed">{product.description}</p>
              </section>

              {/* Points forts */}
              <section>
                <h2 className="text-xl font-bold text-text-primary mb-4">Points forts</h2>
                <ul className="space-y-3">
                  {product.pointsForts.map((point, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-success" />
                      </div>
                      <span className="text-text-secondary">{point}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Caractéristiques techniques */}
              <section>
                <h2 className="text-xl font-bold text-text-primary mb-4">Caractéristiques techniques</h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  {Object.entries(product.caracteristiques).map(([key, value], i) => (
                    <div 
                      key={key}
                      className={cn(
                        'flex justify-between px-4 py-3',
                        i % 2 === 0 ? 'bg-surface-elevated' : 'bg-surface-muted'
                      )}
                    >
                      <span className="text-text-secondary">{key}</span>
                      <span className="font-medium text-text-primary">{value}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Documents */}
              {product.documents.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-text-primary mb-4">Documents</h2>
                  <div className="space-y-2">
                    {product.documents.map((doc, i) => (
                      <a 
                        key={i}
                        href={doc.url}
                        className="flex items-center justify-between p-4 bg-surface-elevated rounded-xl border border-border hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-text-tertiary" />
                          <span className="text-text-primary group-hover:text-primary transition-colors">
                            {doc.nom}
                          </span>
                        </div>
                        <Download className="w-5 h-5 text-text-tertiary group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right column - 35% (sticky) */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-36 space-y-6">
                {/* Product info card */}
                <div className="bg-surface-elevated rounded-2xl border border-border p-6 shadow-warm">
                  <h1 className="text-2xl font-bold text-text-primary mb-2">{product.nom}</h1>
                  <p className="text-sm text-text-tertiary mb-4">Réf. {product.reference}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.badges.map((badge) => (
                      <span
                        key={badge}
                        className={cn(
                          'px-3 py-1 text-sm font-medium rounded-lg',
                          badge === 'vente' && 'bg-success/10 text-success',
                          badge === 'location' && 'bg-accent-soft text-accent',
                          badge === 'prestataire' && 'bg-surface-muted text-text-secondary'
                        )}
                      >
                        {badge === 'vente' && 'Vente'}
                        {badge === 'location' && 'Location'}
                        {badge === 'prestataire' && 'Prestataire'}
                      </span>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-sm text-text-secondary mb-1">Prix public TTC</p>
                    <p className="text-3xl font-bold text-text-primary">
                      {product.prixTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </p>
                    {product.baseLPPR > 0 && (
                      <p className="text-sm text-text-secondary mt-1">
                        Base LPPR : {product.baseLPPR.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} 
                        {product.codeLPPR && ` (${product.codeLPPR})`}
                      </p>
                    )}
                  </div>

                  {/* Reimbursement calculator */}
                  {product.baseLPPR > 0 && (
                    <div className="mb-6">
                      <button
                        onClick={() => setShowReimbursement(!showReimbursement)}
                        className="text-sm font-medium text-primary hover:text-primary-light transition-colors"
                      >
                        {showReimbursement ? 'Masquer' : 'Voir'} la prise en charge
                      </button>

                      {showReimbursement && (
                        <div className="mt-4 p-4 bg-surface-muted rounded-xl">
                          {/* ALD toggle */}
                          <div className="flex items-center gap-3 mb-4">
                            <button
                              onClick={() => setIsALD(true)}
                              className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                                isALD ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated text-text-secondary'
                              )}
                            >
                              ALD (100%)
                            </button>
                            <button
                              onClick={() => setIsALD(false)}
                              className={cn(
                                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                                !isALD ? 'bg-primary text-primary-foreground' : 'bg-surface-elevated text-text-secondary'
                              )}
                            >
                              Hors ALD (60%)
                            </button>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Remboursement</span>
                              <span className="font-medium text-success">
                                {reimbursement.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Reste à charge</span>
                              <span className="font-medium text-text-primary">
                                {remaining.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                              </span>
                            </div>
                          </div>

                          <p className="mt-3 text-xs text-text-tertiary">
                            Le reste à charge peut être pris en charge par une mutuelle.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="space-y-3">
                    <Button className="w-full h-12 bg-primary hover:bg-primary-light rounded-xl text-base font-medium">
                      Ajouter au devis
                    </Button>
                    <Button variant="outline" className="w-full h-12 rounded-xl text-base font-medium border-border-strong">
                      Commander
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI-Enriched Sections */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-primary" />
              Informations enrichies par l&apos;IA
            </h2>

            {/* Argumentaire de vente */}
            {product.argumentaireVente && (
              <AISection
                icon={<Sparkles className="w-5 h-5" />}
                title="Argumentaire de vente"
                variant="primary"
              >
                <p className="text-text-secondary leading-relaxed">{product.argumentaireVente}</p>
              </AISection>
            )}

            {/* Usage médical */}
            {product.usageMedical && (
              <AISection
                icon={<Heart className="w-5 h-5" />}
                title="Usage et indications médicales"
              >
                <p className="text-text-secondary leading-relaxed">{product.usageMedical}</p>
              </AISection>
            )}

            {/* Profils patients */}
            {product.profilsPatients && product.profilsPatients.length > 0 && (
              <AISection
                icon={<Users className="w-5 h-5" />}
                title="Profils de patients cibles"
              >
                <div className="flex flex-wrap gap-2">
                  {product.profilsPatients.map((profil, i) => (
                    <span 
                      key={i}
                      className="px-4 py-2 bg-surface-muted rounded-xl text-text-secondary text-sm"
                    >
                      {profil}
                    </span>
                  ))}
                </div>
              </AISection>
            )}

            {/* Conseils d'utilisation */}
            {product.conseilsUtilisation && product.conseilsUtilisation.length > 0 && (
              <AISection
                icon={<Lightbulb className="w-5 h-5" />}
                title="Conseils d'utilisation"
              >
                <ol className="space-y-3">
                  {product.conseilsUtilisation.map((conseil, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary-soft rounded-full flex items-center justify-center shrink-0 text-sm font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="text-text-secondary">{conseil}</span>
                    </li>
                  ))}
                </ol>
              </AISection>
            )}

            {/* Caractéristiques IA */}
            {product.caracteristiquesIA && Object.keys(product.caracteristiquesIA).length > 0 && (
              <AISection
                icon={<ClipboardList className="w-5 h-5" />}
                title="Caractéristiques"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.caracteristiquesIA).map(([key, value]) => (
                    <div key={key} className="bg-surface-muted rounded-xl p-4">
                      <p className="text-sm text-text-tertiary mb-1">{key}</p>
                      <p className="font-medium text-text-primary">{value}</p>
                    </div>
                  ))}
                </div>
              </AISection>
            )}

            {/* Mot de l'expert */}
            {product.motExpert && (
              <AISection
                icon={<GraduationCap className="w-5 h-5" />}
                title="Le mot de l'expert"
              >
                <div className="flex gap-4">
                  <div className="w-1 bg-primary rounded-full shrink-0" />
                  <div>
                    <blockquote className="text-text-secondary italic leading-relaxed mb-4">
                      &ldquo;{product.motExpert}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-soft rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">JD</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">Jean Dupont</p>
                        <p className="text-xs text-text-tertiary">Pharmacien expert MAD</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AISection>
            )}

            {/* Libellé de prescription */}
            {product.libellePrescription && (
              <AISection
                icon={<FileText className="w-5 h-5" />}
                title="Libellé de prescription"
                variant="accent"
              >
                <div className="flex items-start justify-between gap-4">
                  <p className="text-text-primary font-mono text-sm leading-relaxed">
                    {product.libellePrescription}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyPrescription}
                    className="shrink-0 rounded-lg hover:bg-accent/10"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="sr-only">Copier</span>
                  </Button>
                </div>
              </AISection>
            )}

            {/* Documents IA */}
            {product.documentsIA && product.documentsIA.length > 0 && (
              <AISection
                icon={<Folder className="w-5 h-5" />}
                title="Documents"
              >
                <div className="space-y-2">
                  {product.documentsIA.map((doc, i) => (
                    <a 
                      key={i}
                      href={doc.url}
                      className="flex items-center justify-between p-4 bg-surface-muted rounded-xl hover:bg-surface-muted/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-text-tertiary" />
                        <span className="text-text-primary">{doc.nom}</span>
                      </div>
                      <Download className="w-5 h-5 text-text-tertiary group-hover:text-primary transition-colors" />
                    </a>
                  ))}
                </div>
              </AISection>
            )}
          </div>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}

// AI Section component
interface AISectionProps {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'accent'
}

function AISection({ icon, title, children, variant = 'default' }: AISectionProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border p-6 lg:p-8',
        variant === 'primary' && 'bg-primary-soft/50 border-primary/20',
        variant === 'accent' && 'bg-accent-soft border-accent/20',
        variant === 'default' && 'bg-surface-elevated border-border'
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          variant === 'primary' && 'bg-primary text-primary-foreground',
          variant === 'accent' && 'bg-accent text-accent-foreground',
          variant === 'default' && 'bg-primary-soft text-primary'
        )}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        <span className="ml-auto flex items-center gap-1.5 px-2 py-1 bg-surface-muted rounded-lg text-xs text-text-tertiary">
          <Sparkles className="w-3 h-3" />
          Généré par IA
        </span>
      </div>
      {children}
    </section>
  )
}

// Generate static params for all products
export async function generateStaticParams() {
  return products.map((product) => ({
    reference: product.reference,
  }))
}
