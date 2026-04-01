'use client'

import { useState } from 'react'
import { Send, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

interface HelliaChatProps {
  className?: string
}

/**
 * Hellia AI Assistant - Comptoir mode chatbot placeholder.
 * This component is designed to be modular and swappable.
 * Teammates can replace the inner chat logic while keeping the shell.
 */
export function HelliaChat({ className }: HelliaChatProps) {
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      // Placeholder: In production, this would send to Hellia AI
      console.log('Hellia message:', message)
      setMessage('')
    }
  }

  return (
    <section className={className}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="relative bg-gradient-to-br from-primary-soft via-surface-elevated to-primary-soft/50 rounded-3xl p-8 lg:p-12 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            {/* Avatar */}
            <div className="relative inline-flex mb-6">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-warm-md">
                <Sparkles className="w-10 h-10 text-primary-foreground" />
              </div>
              {/* Online status */}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full border-4 border-surface-elevated" />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-soft rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-sm font-medium text-primary">IA · bêta</span>
            </div>

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
              Rencontrez Hellia
            </h2>

            {/* Speech bubble */}
            <div className="bg-surface-elevated rounded-2xl p-6 shadow-warm mb-6 text-left">
              <p className="text-lg text-text-primary leading-relaxed">
                &ldquo;Comment puis-je vous conseiller aujourd&apos;hui ? Je peux vous aider à trouver le bon équipement pour vos patients ou répondre à vos questions sur le MAD.&rdquo;
              </p>
            </div>

            {/* Input */}
            <div className="flex items-center gap-3 mb-6">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question à Hellia..."
                className="flex-1 h-12 bg-surface-elevated border-border-strong rounded-xl px-4"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                className="h-12 px-6 bg-primary hover:bg-primary-light rounded-xl"
              >
                <Send className="w-4 h-4" />
                <span className="sr-only">Envoyer</span>
              </Button>
            </div>

            {/* Link to questionnaire */}
            <Link 
              href="/questionnaire"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
            >
              <span>Lancer un questionnaire personnalisé</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
