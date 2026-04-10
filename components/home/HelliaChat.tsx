'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Send, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Types pour l'API Web Speech (absent de certaines versions des lib DOM TypeScript)
type ISpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
};
type SpeechRecognitionCtor = new () => ISpeechRecognition;
type WindowWithSpeech = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};

// Détecte si le message exprime l'intention de lancer le questionnaire GIR
const QUESTIONNAIRE_INTENT =
  /questionnaire|évaluation\s*gir|gir\s*(complet|évaluation|test|bilan)|lancer\s*(le\s*)?(gir|questionnaire|bilan)|démarrer|commencer\s*(le\s*)?(gir|questionnaire)|comptoir/i;

// Convertit [HX_REF123] en lien markdown cliquable vers la fiche produit
function linkifyRefs(text: string, basePath = '/catalogue'): string {
  return text.replace(/\[([A-Z][A-Z0-9_\-]{3,})\]/g, (_, ref) =>
    `[${ref}](${basePath}/${encodeURIComponent(ref)})`
  );
}

export function HelliaChat() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (!mounted) return null;

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || isLoading) return;

    // Redirection directe si l'utilisateur veut lancer le questionnaire
    if (QUESTIONNAIRE_INTENT.test(trimmed)) {
      router.push('/comptoir');
      return;
    }

    const userMsg: Message = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat?mode=comptoir-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: 'assistant', content: text },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Je suis temporairement indisponible. Réessayez dans un instant.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    const win = window as WindowWithSpeech;
    const SpeechRecognitionCtor = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + ' ' + transcript : transcript));
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="relative rounded-[28px] overflow-hidden shadow-2xl flex flex-col" style={{ background: 'linear-gradient(145deg, #1a4a3a 0%, #0f3028 60%, #0a2420 100%)' }}>

      {/* Lueur décorative */}
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #4ade80 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="pointer-events-none absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-center gap-4 px-6 pt-5 pb-4">
        <div className="relative flex-shrink-0">
          <Image
            src="/hellia.png"
            alt="Hellia"
            width={52}
            height={52}
            className="rounded-full object-cover ring-2 ring-white/10 shadow-lg"
          />
          <span className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0f3028] shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="text-[18px] font-extrabold text-white leading-none tracking-tight">Hellia</span>
            <span className="rounded-full bg-emerald-400/15 border border-emerald-400/25 px-2 py-0.5 text-[10px] font-bold text-emerald-300 tracking-widest uppercase">
              IA · Bêta
            </span>
          </div>
          <p className="mt-0.5 text-[12px] text-white/45 font-medium">Conseillère MAD · disponible</p>
        </div>
      </div>

      {/* ── Séparateur ── */}
      <div className="relative z-10 mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* ── Messages ── */}
      <div
        ref={messagesContainerRef}
        className="relative z-10 flex-1 overflow-y-auto px-5 py-4 space-y-3"
        style={{ minHeight: '180px', maxHeight: '220px' }}
      >
        {messages.length === 0 ? (
          <div className="flex justify-start">
            <div className="flex items-start gap-2.5 max-w-[88%]">
              <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/15">
                <Image src="/hellia.png" alt="" width={24} height={24} className="object-cover" />
              </div>
              <div className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] leading-relaxed text-white/80" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                Comment puis-je vous aider aujourd'hui ?
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' ? (
                <div className="flex items-start gap-2.5 max-w-[88%]">
                  <div className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/15">
                    <Image src="/hellia.png" alt="" width={24} height={24} className="object-cover" />
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-[13px] leading-relaxed text-white/85"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    {!m.content ? (
                      <span className="flex items-center gap-1 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 animate-bounce" style={{ animationDelay: '120ms' }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70 animate-bounce" style={{ animationDelay: '240ms' }} />
                      </span>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mt-1 mb-1.5 space-y-0.5">{children}</ul>,
                          li: ({ children }) => <li className="text-white/80">{children}</li>,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/25 px-2 py-0.5 rounded-md hover:bg-emerald-400/20 hover:text-emerald-200 transition-colors cursor-pointer"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {linkifyRefs(m.content)}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="max-w-[72%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] font-medium leading-relaxed text-brand-primary shadow-md"
                  style={{ background: 'rgba(255,255,255,0.97)' }}
                >
                  {m.content}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Input ── */}
      <div className="relative z-10 px-5 pb-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-1" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question à Hellia…"
            disabled={isLoading}
            className="flex-1 bg-transparent py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={toggleListening}
            disabled={isLoading}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: isListening ? 'rgba(220,38,38,0.2)' : 'transparent' }}
            aria-label={isListening ? 'Arrêter la dictée' : 'Dicter un message'}
            title={isListening ? 'Arrêter la dictée' : 'Dicter un message'}
          >
            {isListening
              ? <MicOff className="w-3.5 h-3.5 text-red-400" />
              : <Mic className="w-3.5 h-3.5 text-white/40" />}
          </button>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: input.trim() && !isLoading ? 'rgba(52,211,153,0.25)' : 'transparent' }}
            aria-label="Envoyer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-300" />
          </button>
        </div>
      </div>

      {/* ── Bouton questionnaire ── */}
      <div className="relative z-10 px-5 pb-5">
        <Link
          href="/comptoir"
          className="group flex items-center justify-between w-full rounded-2xl px-5 py-4 transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: 'rgba(255,255,255,0.97)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
        >
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-brand-primary leading-none">Lancer un questionnaire guidé</span>
            <span className="mt-0.5 text-[11px] text-brand-primary/50 font-medium">Évaluation GIR complète · ~3 min</span>
          </div>
          <span className="flex items-center justify-center w-8 h-8 rounded-full transition-transform duration-200 group-hover:translate-x-0.5" style={{ background: 'rgba(244,104,56,0.12)' }}>
            <ArrowRight className="w-4 h-4 text-brand-accent" />
          </span>
        </Link>
      </div>
    </div>
  );
}
