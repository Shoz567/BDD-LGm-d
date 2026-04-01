'use client'

import { use } from 'react'
import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { ChatWidget } from '@/components/chat-widget'
import { ProductCard } from '@/components/product-card'
import { pathways, products } from '@/lib/data'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Map pathway names to product categories
const categoryMap: Record<string, string> = {
  'aide-marche': 'Aide à la marche',
  'chambre': 'La chambre',
  'fauteuils': 'Fauteuils roulants',
  'salle-de-bain': 'Salle de bain',
  'toilettes': 'Toilettes',
  'aides-techniques': 'Aides techniques'
}

export default function ParcoursDetailPage({ params }: PageProps) {
  const { slug } = use(params)
  const pathway = pathways.find(p => p.slug === slug)

  if (!pathway) {
    notFound()
  }

  const categoryName = categoryMap[slug] || pathway.nom
  const categoryProducts = products.filter(p => p.categorie === categoryName)

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
            <span className="text-text-tertiary">Parcours conseil</span>
            <ChevronRight className="w-4 h-4 text-text-tertiary" />
            <span className="text-text-primary font-medium">{pathway.nom}</span>
          </nav>

          {/* Hero */}
          <section className="relative bg-gradient-to-br from-primary-soft to-surface-elevated rounded-3xl p-8 lg:p-12 mb-12 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-soft rounded-full mb-4">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Parcours conseil</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4 text-balance">
                  {pathway.nom}
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-lg">
                  {pathway.description}. Découvrez notre sélection de produits adaptés aux besoins de vos patients.
                </p>
              </div>
              
              {/* Illustration placeholder */}
              <div className="hidden lg:flex justify-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/10 to-primary-soft rounded-3xl flex items-center justify-center">
                  <MapPin className="w-20 h-20 text-primary/30" />
                </div>
              </div>
            </div>
          </section>

          {/* Products */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-text-primary">
                Produits du parcours
              </h2>
              <span className="px-3 py-1 bg-primary-soft text-primary text-sm font-medium rounded-full">
                {categoryProducts.length} produits
              </span>
            </div>

            {categoryProducts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {categoryProducts.map((product) => (
                  <ProductCard key={product.reference} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center bg-surface-elevated rounded-2xl border border-border">
                <MapPin className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Aucun produit disponible
                </h3>
                <p className="text-text-secondary">
                  Les produits de ce parcours seront bientôt disponibles.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}

// Generate static params for all pathways
export async function generateStaticParams() {
  return pathways.map((pathway) => ({
    slug: pathway.slug,
  }))
}
