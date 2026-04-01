'use client'

import { useState, useMemo } from 'react'
import { Search, Package } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { ChatWidget } from '@/components/chat-widget'
import { ProductCard } from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { products, pathways } from '@/lib/data'

const categories = ['Tous', ...pathways.map(p => p.nom)]

export default function CataloguePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('Tous')
  const [visibleCount, setVisibleCount] = useState(8)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = searchQuery === '' || 
        product.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.categorie.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = activeCategory === 'Tous' || 
        product.categorie === activeCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, activeCategory])

  const visibleProducts = filteredProducts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredProducts.length

  const loadMore = () => {
    setVisibleCount(prev => prev + 8)
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar showModeSwitch={false} />

      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
                Catalogue produits
              </h1>
              <span className="px-3 py-1 bg-primary-soft text-primary text-sm font-medium rounded-full">
                {products.length} produits
              </span>
            </div>

            {/* Search bar */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setVisibleCount(8)
                }}
                placeholder="Rechercher par nom, référence, catégorie..."
                className="pl-12 h-12 bg-surface-elevated border-border-strong rounded-xl text-base"
              />
            </div>
          </div>

          {/* Category filters */}
          <div className="mb-8 -mx-4 px-4 overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setActiveCategory(category)
                    setVisibleCount(8)
                  }}
                  className={cn(
                    'shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                    activeCategory === category
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-elevated border border-border text-text-secondary hover:text-text-primary hover:border-border-strong'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products grid */}
          {visibleProducts.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.reference} product={product} />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={loadMore}
                    variant="outline"
                    className="rounded-xl border-border-strong px-8"
                  >
                    Charger plus
                  </Button>
                  <p className="mt-2 text-sm text-text-tertiary">
                    {visibleProducts.length} sur {filteredProducts.length} produits
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="py-16 text-center">
              <div className="w-20 h-20 bg-surface-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-text-tertiary" />
              </div>
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-text-secondary max-w-md mx-auto">
                Essayez de modifier votre recherche ou de sélectionner une autre catégorie.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setActiveCategory('Tous')
                }}
                variant="outline"
                className="mt-6 rounded-xl"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <ChatWidget />
    </div>
  )
}
