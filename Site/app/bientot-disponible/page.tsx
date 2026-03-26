import Link from 'next/link'
import { Construction, ArrowLeft } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'

export default function BientotDisponiblePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar showModeSwitch={false} />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="text-center px-4">
          {/* Illustration */}
          <div className="w-32 h-32 bg-gradient-to-br from-primary-soft to-accent-soft rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Construction className="w-16 h-16 text-primary" />
          </div>

          {/* Content */}
          <h1 className="text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            Bientôt disponible
          </h1>
          <p className="text-lg text-text-secondary max-w-md mx-auto mb-8">
            Cette fonctionnalité est en cours de développement. Revenez bientôt pour découvrir les nouveautés.
          </p>

          {/* CTA */}
          <Link href="/">
            <Button className="rounded-xl bg-primary hover:bg-primary-light h-12 px-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
