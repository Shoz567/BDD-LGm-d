'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ChatWidgetProps {
  /** Title shown in the chat panel header */
  title?: string
  /** Subtitle/status shown in header */
  status?: string
}

/**
 * Floating chat widget component.
 * This is a placeholder component designed to be swappable.
 * Teammates can replace the inner chat logic while keeping the shell.
 */
export function ChatWidget({ 
  title = 'Assistant LGm@d',
  status = 'En ligne'
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const handleSend = () => {
    if (message.trim()) {
      // Placeholder: In production, this would send to chat API
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full',
          'flex items-center justify-center shadow-warm-lg',
          'transition-all duration-200 ease-out hover:scale-105 active:scale-95',
          'animate-pulse-subtle',
          isOpen && 'opacity-0 pointer-events-none'
        )}
        aria-label="Ouvrir l'assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Panel Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-sm transition-opacity duration-200',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full sm:w-[400px]',
          'bg-surface-elevated shadow-warm-lg',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-label="Chat avec l'assistant"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-soft rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">{title}</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-success rounded-full" />
                <span className="text-xs text-text-secondary">{status}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="rounded-xl hover:bg-surface-muted"
          >
            <X className="w-5 h-5" />
            <span className="sr-only">Fermer</span>
          </Button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100%-140px)]">
          {/* Placeholder welcome message */}
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">
              Comment puis-je vous aider ?
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              Posez-moi vos questions sur les produits, les parcours conseils ou l&apos;autonomie de vos patients.
            </p>
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-surface-elevated">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Écrivez votre message..."
                className="pr-10 bg-surface-muted border-0 rounded-xl h-11"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-surface-muted shrink-0"
              aria-label="Enregistrer un message vocal"
            >
              <Mic className="w-5 h-5 text-text-secondary" />
            </Button>
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="rounded-xl h-11 px-4 bg-primary hover:bg-primary-light"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 0 0 rgba(41, 78, 70, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(41, 78, 70, 0); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
