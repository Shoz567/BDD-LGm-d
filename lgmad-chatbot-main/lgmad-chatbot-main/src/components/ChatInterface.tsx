// src/components/ChatInterface.tsx
'use client'; // OBLIGATOIRE

import { useState, useRef, useEffect } from 'react';
import type { Message, ChatMode } from '@/types/chat';

interface Props {
  mode: ChatMode;
  initialMessage?: string;
}

export default function ChatInterface({ mode, initialMessage }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<{ b64: string; mime: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Message d'accueil au demarrage
  useEffect(() => {
    if (initialMessage)
      setMessages([{ role: 'assistant', content: initialMessage }]);
  }, [initialMessage]);

  // Scroll automatique vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      setImage({ b64, mime: file.type });
    };
    reader.readAsDataURL(file);
  }

  async function sendMessage() {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput('');
    setIsLoading(true);

    // Appel a la Route API Next.js (jamais directement a Mistral !)
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newMsgs,
        mode,
        imageBase64: image?.b64,
        imageMime: image?.mime,
      }),
    });

    // Lecture du stream token par token
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    let text = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: text },
      ]);
    }
    setIsLoading(false);
  }

  return (
    <div className='flex flex-col h-full bg-white'>
      {/* Zone d'affichage des messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.map((m, i) => (
          <div key={i} className={`flex
            ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-sm px-4 py-2 rounded-2xl text-sm
              ${m.role === 'user'
                ? 'bg-[#1B4332] text-white rounded-br-sm'
                : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
              {m.content || (isLoading ? '...' : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className='border-t p-4 flex gap-2'>
        <label className='cursor-pointer bg-gray-100 px-3 py-2 rounded-full text-sm hover:bg-gray-200 transition-colors'>
          Ordonnance
          <input type='file' accept='image/*,.pdf'
            className='hidden' onChange={handleUpload} />
        </label>
        {image && (
          <span className='text-xs text-green-600 self-center'>Ordonnance chargee</span>
        )}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder='Ecrivez votre message...'
          disabled={isLoading}
          className='flex-1 border rounded-full px-4 py-2 text-sm text-black
            focus:outline-none focus:ring-2 focus:ring-[#1B4332]'
        />
        <button
          onClick={sendMessage}
          disabled={isLoading}
          className='bg-[#1B4332] text-white px-5 py-2 rounded-full
            text-sm hover:bg-[#2D6A4F] disabled:opacity-50 transition-colors'
        >
          {isLoading ? '...' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
