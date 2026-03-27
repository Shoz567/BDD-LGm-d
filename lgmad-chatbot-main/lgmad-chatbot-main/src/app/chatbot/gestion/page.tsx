// src/app/chatbot/gestion/page.tsx
import ChatInterface from '@/components/ChatInterface';

export default function PageGestion() {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <header className='bg-[#264653] text-white p-4'>
        <div className='max-w-2xl mx-auto'>
          <p className='text-xs text-blue-300 font-semibold uppercase tracking-wider mb-1'>Mode Gestion</p>
          <h1 className='text-lg font-bold'>Support Pharmacien — LGm@d</h1>
          <p className='text-sm text-blue-200'>
            Commandes, catalogue, devis, navigation sur la plateforme
          </p>
        </div>
      </header>
      <div className='flex-1 max-w-2xl w-full mx-auto'>
        <ChatInterface
          mode='gestion'
          initialMessage="Bonjour ! Je suis l'assistant LGm@d. Comment puis-je vous aider avec la plateforme ?"
        />
      </div>
    </div>
  );
}
