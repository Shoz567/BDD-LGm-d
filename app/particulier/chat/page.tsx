'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const WELCOME = `Bonjour ! Je suis **Hellia**, votre conseillère en équipements de maintien à domicile. 😊

Je suis là pour vous aider à trouver les équipements adaptés à votre situation — que ce soit pour vous ou pour un proche.

**Je vous pose quelques questions simples** pour mieux vous orienter. Pas de termes compliqués, je vous explique tout.

Par quoi voulez-vous commencer ?`;

const SUGGESTIONS = [
  "J'ai du mal à marcher",
  "Je veux sécuriser la salle de bain",
  "Je cherche pour un proche",
  "Je récupère d'une opération",
  "Je veux savoir si je peux être remboursé",
];

export default function ParticulierChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat?mode=particulier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok || !res.body) throw new Error('Erreur réseau');

      const assistantMsg: Message = { role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMsg]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: fullText },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Désolée, une erreur est survenue. Veuillez réessayer.' }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const reset = () => {
    setMessages([{ role: 'assistant', content: WELCOME }]);
    setInput('');
  };

  const showSuggestions = messages.length === 1;

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px - 73px)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/particulier" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: '#fff', border: '1px solid #e3e9e5', color: '#41525d', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ display: 'flex', items: 'center', gap: '10px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🌿
            </div>
            <div style={{ marginLeft: '10px' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#17212b' }}>Hellia</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#7aa087', fontWeight: 600 }}>Conseillère en équipements à domicile</p>
            </div>
          </div>
        </div>
        <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #e3e9e5', background: '#fff', color: '#53636e', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <RotateCcw size={14} /> Nouvelle conversation
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0, marginRight: '10px', alignSelf: 'flex-end' }}>
                🌿
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)'
                : '#fff',
              color: msg.role === 'user' ? '#fff' : '#17212b',
              fontSize: '15px',
              lineHeight: 1.6,
              boxShadow: '0 4px 16px rgba(23,33,43,0.07)',
              border: msg.role === 'assistant' ? '1px solid rgba(41,78,70,0.08)' : 'none',
            }}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p style={{ margin: '0 0 8px' }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#294e46' }}>{children}</strong>,
                    ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p style={{ margin: 0 }}>{msg.content}</p>
              )}
              {isLoading && i === messages.length - 1 && msg.role === 'assistant' && msg.content === '' && (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '20px' }}>
                  {[0, 1, 2].map((j) => (
                    <div key={j} style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7aa087', animation: `bounce 1s ease-in-out ${j * 0.15}s infinite` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Suggestions initiales */}
        {showSuggestions && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', paddingLeft: '46px' }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '999px',
                  border: '1px solid #c6ddd7',
                  background: '#edf5f1',
                  color: '#294e46',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background .15s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        border: '1px solid rgba(41,78,70,0.12)',
        boxShadow: '0 8px 32px rgba(23,33,43,0.08)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
      }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrivez votre message… (Entrée pour envoyer)"
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '15px',
            color: '#17212b',
            background: 'transparent',
            lineHeight: 1.5,
            maxHeight: '120px',
            overflowY: 'auto',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: input.trim() && !isLoading ? 'linear-gradient(135deg, #294e46 0%, #3d7268 100%)' : '#e3e9e5',
            border: 'none',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background .15s',
          }}
        >
          <Send size={16} color={input.trim() && !isLoading ? '#fff' : '#aab2b9'} />
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: '11px', color: '#7aa087', marginTop: '10px', marginBottom: 0 }}>
        Hellia ne remplace pas l&apos;avis d&apos;un médecin. En cas d&apos;urgence, contactez le 15 (SAMU).
      </p>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
