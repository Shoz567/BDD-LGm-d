// src/app/chatbot/support/page.tsx
import ChatInterface from '@/components/ChatInterface';

export default function PageSupport() {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <header className='bg-[#264653] text-white p-4'>
        <h1 className='text-lg font-bold'>
          Support LGm@d - Espace Pharmacien
        </h1>
        <p className='text-sm text-blue-200'>
          Questions sur la plateforme, commandes, catalogue, devis
        </p>
      </header>
      <div className='flex-1 max-w-2xl w-full mx-auto'>
        <ChatInterface
          mode='support'
          initialMessage="Bonjour ! Je suis l'assistant LGm@d. Comment puis-je vous aider avec la plateforme ?"
        />
      </div>
    </div>
  );
}
