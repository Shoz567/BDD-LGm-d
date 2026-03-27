// src/app/chatbot/recommandation/page.tsx
import ChatInterface from '@/components/ChatInterface';

export default function PageRecommandation() {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <header className='bg-[#1B4332] text-white p-4'>
        <h1 className='text-lg font-bold'>
          Trouver mon equipement medical - LGm@d
        </h1>
        <p className='text-sm text-green-200'>
          Quelques questions pour vous orienter vers le bon materiel
        </p>
      </header>
      <div className='flex-1 max-w-2xl w-full mx-auto'>
        <ChatInterface
          mode='recommandation'
          initialMessage="Bonjour ! Je suis votre assistant LGm@d. Pour vous aider, j'ai besoin de quelques informations. Pour commencer : quel est votre age ?"
        />
      </div>
    </div>
  );
}
