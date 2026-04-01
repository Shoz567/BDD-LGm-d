// src/app/chatbot/comptoir/page.tsx
import ChatInterface from '@/components/ChatInterface';

export default function PageComptoir() {
  return (
    <div className='min-h-screen flex flex-col bg-gray-50'>
      <header className='bg-[#1B4332] text-white p-4'>
        <div className='max-w-2xl mx-auto'>
          <p className='text-xs text-green-300 font-semibold uppercase tracking-wider mb-1'>Mode Comptoir</p>
          <h1 className='text-lg font-bold'>Assistant Recommandation Patient</h1>
          <p className='text-sm text-green-200'>
            Quelques questions pour orienter vers le bon materiel medical
          </p>
        </div>
      </header>
      <div className='flex-1 max-w-2xl w-full mx-auto'>
        <ChatInterface
          mode='comptoir'
          initialMessage="Bonjour ! Je suis votre assistant LGm@d. Pour vous aider a trouver le bon equipement, j'ai besoin de quelques informations. Pour commencer : quel est l'age du patient ?"
        />
      </div>
    </div>
  );
}
