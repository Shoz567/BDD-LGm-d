'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, PatientProfile, GIRScore, Product, DemoPersona, QuickAction } from '@/lib/types';
import { calculerGIR } from '@/lib/scoring';
import { GIRBadge } from '@/components/chat/GIRBadge';
import { ProductCard } from '@/components/chat/ProductCard';
import { OrdonnanceUpload } from '@/components/chat/OrdonnanceUpload';
import { PersonaSelector } from '@/components/chat/PersonaSelector';
import { AutonomyRadarChart } from '@/components/chat/AutonomyRadarChart';
import { LABELS_PRIORITES } from '@/lib/prompts';
import { Settings2, Volume2, VolumeX, RotateCcw, FileText, MessageSquare } from 'lucide-react';
import { Topbar } from '@/components/layout/topbar';

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: '',
  timestamp: new Date(),
  quickActions: [
    { label: '👤 Je réponds pour moi', value: 'Je suis le patient et je réponds pour moi-même.' },
    { label: '🤝 Je réponds pour un proche', value: "Je réponds pour un proche. Je suis son aidant." },
  ],
  metadata: { step: 'welcome' },
};

const WELCOME_MESSAGE = `Bonjour et bienvenue ! 👋

Je suis l'assistant LGm@d, votre conseiller en matériel médical de maintien à domicile.

Je vais vous poser quelques questions pour vous proposer les équipements les plus adaptés à votre situation. Cela prend environ **3 à 5 minutes**.

**Commençons par une première question :** répondez-vous pour vous-même ou pour un proche ?`;

export default function ComptoirPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { ...INITIAL_MESSAGE, content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profil, setProfil] = useState<Partial<PatientProfile>>({});
  const [gir, setGIR] = useState<GIRScore | null>(null);
  const [produits, setProduits] = useState<(Product & { justification?: string })[]>([]);
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [showConsent, setShowConsent] = useState(true);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('lgmad_consent')) {
      setShowConsent(false);
      setConsentGiven(true);
    }
  }, []);
  
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isSTTListening, setIsSTTListening] = useState(false);
  const [messageGlobal, setMessageGlobal] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'report'>('chat');
  const [isRecommending, setIsRecommending] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speak = useCallback((text: string) => {
    if (!isTTSEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '').replace(/[#*]/g, ''));
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = () => {};
    utterance.onerror = (e) => {
      if (e.error !== 'interrupted') console.error('TTS error:', e.error);
    };
    window.speechSynthesis.speak(utterance);
  }, [isTTSEnabled]);

  const toggleSTT = useCallback(() => {
    if (typeof window === 'undefined') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (isSTTListening) {
      recognitionRef.current?.stop();
      setIsSTTListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev: string) => prev + transcript);
    };
    recognition.onend = () => setIsSTTListening(false);
    recognition.onerror = (event: { error: string }) => {
      console.error('STT error:', event.error);
      setIsSTTListening(false);
      if (event.error === 'not-allowed') {
        alert('Accès au microphone refusé. Veuillez autoriser le microphone dans les paramètres de votre navigateur.');
      }
    };
    recognition.start();
    setIsSTTListening(true);
  }, [isSTTListening]);

  const sendMessage = useCallback(async (rawContent: string | number | undefined | null) => {
    if (rawContent === undefined || rawContent === null || isLoading) return;
    const content = String(rawContent);
    if (!content.trim()) return;
    const trimmed = content.trim().slice(0, 2000);

    const userMessage: ChatMessage = { role: 'user', content: trimmed, timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          profil,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data = await response.json();

      let latestProfil = profil;
      let latestGIR: GIRScore | null = gir;
      if (data.profilUpdate) {
        latestProfil = { ...profil, ...data.profilUpdate };
        setProfil(latestProfil);
        latestGIR = data.gir ?? null;
        setGIR(latestGIR);
      }

      if (data.step === 'ordonnance' && !data.isComplete) {
        setShowOrdonnance(true);
      } else {
        setShowOrdonnance(false);
      }

      if (data.isComplete && latestGIR) {
        fetchRecommendations(latestProfil, latestGIR);
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        quickActions: data.quickActions,
        metadata: { step: data.step, girScore: data.gir },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      speak(data.message);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, profil, isLoading, speak]);

  const fetchRecommendations = useCallback(async (currentProfil: Partial<PatientProfile>, currentGIR: GIRScore) => {
    setIsRecommending(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profil: currentProfil, gir: currentGIR }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur recommandations (${response.status})`);
      }

      const data = await response.json();
      if (data.produits) {
        setProduits(data.produits);
        setMessageGlobal(data.messageGlobal);
        setTimeout(() => setViewMode('report'), 500);
      }
    } catch (error) {
      console.error('Recommend error:', error);
    } finally {
      setIsRecommending(false);
    }
  }, []);

  const loadPersona = useCallback((persona: DemoPersona) => {
    const newProfil = { ...persona.profil } as Partial<PatientProfile>;
    setProfil(newProfil);
    const newGIR = calculerGIR(newProfil);
    setGIR(newGIR);
    setProduits([]);
    setMessageGlobal(null);
    setViewMode('chat');

    const demoMessage: ChatMessage = {
      role: 'assistant',
      content: `🎭 **Cas démo chargé : ${persona.nom}, ${persona.age}**\n\n${persona.scenario}\n\nProfil calculé : **GIR ${persona.girAttendu}**. Je génère les recommandations…`,
      timestamp: new Date(),
    };
    setMessages([{ ...INITIAL_MESSAGE, content: WELCOME_MESSAGE }, demoMessage]);

    setTimeout(() => fetchRecommendations(newProfil, newGIR), 500);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const completedSteps = Object.keys(profil).length;
  const totalSteps = 10;
  const progress = Math.min((completedSteps / totalSteps) * 100, 100);

  if (showConsent && !consentGiven) {
    return (
      <div className="min-h-screen flex flex-col">
        <Topbar mode="comptoir" />
        <div className="flex-1 flex items-center justify-center p-6">
        <div className="glass-panel-strong max-w-[480px] w-full p-10 text-center rounded-3xl animate-fade-in shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-brand-primary to-brand-accent rounded-3xl flex items-center justify-center text-3xl shadow-lg">
            🏥
          </div>
          <h1 className="text-2xl font-bold text-text-main mb-2">Assistant LGm@d</h1>
          <p className="text-text-muted mb-8 text-[0.95rem]">Mode Comptoir — Pharmacie partenaire</p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-left mb-8 shadow-inner">
            <p className="mb-2 font-bold text-orange-800 flex items-center gap-2"><span>⚖️</span> Consentement RGPD</p>
            <p className="text-orange-700 text-[0.85rem] leading-relaxed">
              Les informations collectées sont utilisées uniquement pour vous orienter vers les équipements MAD adaptés. 
              Aucune décision médicale ne sera prise sur cette base exclusive sans validation de votre pharmacien.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              className="btn-primary w-full shadow-lg"
              onClick={() => { localStorage.setItem('lgmad_consent', new Date().toISOString()); setConsentGiven(true); setShowConsent(false); }}
            >
              ✓ J'accepte et je commence
            </button>
            <button
              className="btn-secondary w-full"
              onClick={() => { setShowConsent(false); }}
            >
              Continuer sans enregistrer
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar mode="comptoir" />
      <div className="flex flex-col relative flex-1" style={{ height: 'calc(100vh - 113px)' }}>
      {showPersonaSelector && (
        <PersonaSelector onSelect={loadPersona} onClose={() => setShowPersonaSelector(false)} />
      )}

      {/* Trailing progress bar */}
      {completedSteps > 0 && (
        <div className="h-1 bg-gray-100 w-full absolute top-0 left-0 z-50">
          <div 
            className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700 ease-out rounded-r-full shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Secondary Actions Bar */}
      <div className="w-full max-w-[1400px] mx-auto px-4 md:px-6 pt-4 pb-2 z-40 flex justify-between items-center relative">
        <div className="text-[14px] font-bold text-text-main flex items-center gap-2 opacity-80">
          {viewMode === 'chat' ? (
            <><MessageSquare size={16} className="text-brand-primary" /> Assistant LGm@d</>
          ) : (
            <><FileText size={16} className="text-brand-primary" /> Bilan Clinique</>
          )}
        </div>
        
        <div className="flex items-center gap-1.5 md:gap-2">
          {gir && <div className="px-2 border-r border-[var(--border-subtle)] mr-1 hidden sm:block"><GIRBadge gir={gir} /></div>}
          
          <button
            className="flex items-center justify-center p-1.5 rounded-lg text-text-muted hover:bg-white hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20 backdrop-blur-sm bg-white/40 border border-white/60 shadow-sm"
            onClick={() => setIsTTSEnabled(!isTTSEnabled)}
            title={isTTSEnabled ? 'Désactiver la voix' : 'Activer la voix'}
          >
            {isTTSEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          
          <button
            className="flex items-center justify-center p-1.5 rounded-lg text-text-muted hover:bg-white hover:text-brand-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary/20 backdrop-blur-sm bg-white/40 border border-white/60 shadow-sm"
            onClick={() => {
              setProfil({}); setGIR(null); setProduits([]);
              setMessages([{ ...INITIAL_MESSAGE, content: WELCOME_MESSAGE }]);
              setMessageGlobal(null); setViewMode('chat');
            }}
            title="Recommencer"
          >
            <RotateCcw size={18} />
          </button>

          <button
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-orange-700 hover:text-orange-800 transition-colors font-bold text-[0.8rem] ml-1 bg-white/50 hover:bg-white/80 border border-orange-200/60 shadow-sm backdrop-blur-sm"
            onClick={() => setShowPersonaSelector(true)}
          >
            <Settings2 size={14} /> <span className="hidden sm:inline">Démo</span>
          </button>

          {produits.length > 0 && (
            <button
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-brand-primary-light transition-colors font-bold text-[0.8rem] shadow-sm ml-1 md:ml-2"
              onClick={() => setViewMode(viewMode === 'chat' ? 'report' : 'chat')}
            >
              {viewMode === 'chat' ? (
                <><FileText size={14} /> <span className="hidden sm:inline">Rapport</span></>
              ) : (
                <><MessageSquare size={14} /> <span className="hidden sm:inline">Chat</span></>
              )}
            </button>
          )}
        </div>
      </div>

      {viewMode === 'report' ? (
        <main className="flex-1 overflow-y-auto px-6 pt-8 pb-12">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header: GIR + Actions */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h1 className="text-3xl font-extrabold text-brand-primary flex items-center gap-3">
                <span className="text-4xl">📄</span> Bilan & Orientations MAD
              </h1>
              {gir && <GIRBadge gir={gir} showDetails />}
            </div>

            {/* Dashboard Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.keys(profil).length > 0 && (
                <div className="glass-panel-strong p-8 rounded-3xl flex flex-col">
                  <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                    <span className="text-2xl">👤</span> Profil & Priorités
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {profil.age && <span className="text-[14px] font-bold px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 shadow-sm">{profil.age} ans</span>}
                    {profil.sexe && <span className="text-[14px] font-bold px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 shadow-sm capitalize">{profil.sexe}</span>}
                    {profil.respondant && <span className="text-[14px] font-bold px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-800 shadow-sm">{profil.respondant === 'aidant' ? '🤝 Aidant' : '👤 Patient'}</span>}
                    {profil.priorites?.map((p) => (
                      <span key={p} className="text-[14px] font-bold px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-full text-orange-800 shadow-sm flex items-center gap-1.5">
                        {LABELS_PRIORITES[p]?.icon} {LABELS_PRIORITES[p]?.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto pt-6 border-t border-gray-100/50">
                    <p className="text-[0.95rem] text-text-muted leading-relaxed">
                      Ce profil a permis le calcul estimatif de l'autonomie et l'orientation des recommandations cliniques selon les directives MAD.
                    </p>
                  </div>
                </div>
              )}

              {gir && (
                <div className="glass-panel-strong p-8 rounded-3xl flex flex-col">
                  <h2 className="text-xl font-bold text-brand-primary mb-2 flex items-center gap-2">
                    <span className="text-2xl">🕸️</span> Radar Autonomie (AGGIR)
                  </h2>
                  <div className="flex-1 min-h-[300px] flex items-center justify-center -mt-4">
                    <AutonomyRadarChart gir={gir} />
                  </div>
                </div>
              )}
            </div>

            {messageGlobal && (
              <div className="glass-panel-strong p-8 rounded-3xl shadow-md border-l-4 border-l-brand-accent">
                <h2 className="text-xl font-bold text-brand-primary mb-6 flex items-center gap-2">
                  <span className="text-2xl">🩺</span> Synthèse clinique
                </h2>
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{messageGlobal}</ReactMarkdown>
                </div>
              </div>
            )}

            <div className="animate-fade-in pt-4">
              <h2 className="text-2xl font-bold text-brand-primary mb-6 flex items-center gap-2 px-2">
                <span className="text-3xl">📦</span> Équipements Recommandés
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produits.map((product, i) => (
                  <ProductCard key={product.reference ?? i} product={product} />
                ))}
              </div>
            </div>

            <div className="mt-12 py-6 border-t border-gray-200 text-center">
              <p className="text-text-muted text-sm font-medium">
                Document généré par LGm@d IA. La validation finale appartient au pharmacien d'officine.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex max-w-[1400px] w-full mx-auto relative overflow-hidden">
          {/* Chat column */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-8 pt-20 pb-32 scroll-smooth">
              <div className="max-w-3xl mx-auto flex flex-col gap-8">
                {messages.map((msg, i) => (
                  <div key={i} className={`animate-fade-in flex ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} gap-4 items-end`}>
                    {/* Avatar */}
                    <div className={`w-[42px] h-[42px] rounded-2xl flex-shrink-0 flex items-center justify-center text-lg shadow-lg relative bottom-1 ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-brand-primary-light to-brand-primary text-white' 
                        : 'bg-gradient-to-br from-brand-accent-light to-brand-accent text-white'
                    }`}>
                      {msg.role === 'user' ? '👤' : <Image src="/hellia.png" width={42} height={42} alt="IA" className="rounded-2xl object-cover border-2 border-white/20"/>}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col">
                      {/* Bubble */}
                      <div className={`inline-block px-5 py-4 max-w-[90%] shadow-md backdrop-blur-md ${
                        msg.role === 'user'
                          ? 'bg-brand-primary text-white self-end rounded-2xl rounded-br-sm'
                          : 'glass-panel text-text-main self-start rounded-2xl rounded-bl-sm border-white/60'
                      }`}>
                        <div className="markdown-body" style={{ color: msg.role === 'user' ? '#fff' : 'inherit' }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
  
                      {/* Quick actions */}
                      {msg.quickActions && msg.quickActions.length > 0 && i === messages.length - 1 && (
                        <div className="flex flex-col gap-3 mt-4 max-w-xl self-start w-full">
                          {msg.metadata?.step === 'priorites' ? (
                            <>
                              {msg.quickActions.map((action: QuickAction, ai: number) => {
                                const isSelected = selectedPriorities.includes(action.label);
                                return (
                                  <button
                                    key={ai}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedPriorities(prev => prev.filter(p => p !== action.label));
                                      } else if (selectedPriorities.length < 3) {
                                        setSelectedPriorities(prev => [...prev, action.label]);
                                      }
                                    }}
                                    disabled={isLoading}
                                    className={`animate-fade-in flex gap-4 items-center p-4 border rounded-2xl transition-all duration-200 text-left ${
                                      isSelected
                                        ? 'border-brand-accent bg-orange-50 shadow-md text-brand-accent font-bold'
                                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm text-text-main'
                                    } ${!isSelected && selectedPriorities.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                  >
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors flex-shrink-0 ${
                                      isSelected ? 'bg-brand-accent border-brand-accent' : 'border-gray-300 bg-white'
                                    }`}>
                                      {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className="text-[14px] leading-tight flex-1">
                                      {action.label}
                                    </span>
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => {
                                  if (selectedPriorities.length > 0) {
                                    sendMessage(selectedPriorities.join(', '));
                                    setSelectedPriorities([]);
                                  }
                                }}
                                disabled={selectedPriorities.length === 0 || isLoading}
                                className={`mt-2 py-3.5 px-6 rounded-xl font-bold text-white transition-all shadow-md ${
                                  selectedPriorities.length > 0 && !isLoading
                                    ? 'bg-brand-primary hover:bg-brand-primary-light hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5'
                                    : 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                                }`}
                              >
                                Valider la sélection {selectedPriorities.length > 0 ? `(${selectedPriorities.length}/3)` : ''}
                              </button>
                            </>
                          ) : (
                            msg.quickActions.map((action: QuickAction, ai: number) => (
                              <button
                                key={ai}
                                onClick={() => sendMessage(action.label)}
                                disabled={isLoading}
                                className="animate-fade-in flex justify-between items-center p-4 border border-gray-200 bg-white rounded-2xl transition-all duration-200 text-left hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer shadow-sm group"
                              >
                                <span className="font-bold text-[14px] text-text-main group-hover:text-brand-primary transition-colors flex-1">
                                  {action.label}
                                </span>
                                <span className="text-brand-accent opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all font-bold">
                                  →
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
  
                {/* Typing indicator */}
                {isLoading && (
                  <div className="animate-fade-in flex flex-row gap-4 items-end">
                    <div className="w-[42px] h-[42px] rounded-2xl flex-shrink-0 flex items-center justify-center text-lg shadow-lg relative bottom-1 bg-gradient-to-br from-brand-accent-light to-brand-accent">
                      <Image src="/hellia.png" width={42} height={42} alt="IA" className="rounded-2xl object-cover border-2 border-white/20"/>
                    </div>
                    <div className="glass-panel px-5 py-4 max-w-[90%] border-white/60 self-start rounded-2xl rounded-bl-sm flex items-center">
                      <div className="typing-dots flex gap-1.5 text-text-muted">
                        <span/><span/><span/>
                      </div>
                    </div>
                  </div>
                )}
  
                {/* Ordonnance upload */}
                {showOrdonnance && (
                  <div className="premium-card p-6 border-l-4 border-l-brand-primary animate-fade-in mt-4">
                    <h3 className="font-bold text-text-main mb-4 flex items-center gap-2">
                      📄 Fournir l'ordonnance (Optionnel)
                    </h3>
                    <OrdonnanceUpload
                      onUploadComplete={(data) => {
                        const ordoMessage = `L'ordonnance a été analysée avec succès.\\nMédicaments: ${data.medicaments?.join(', ') || 'aucun'}\\nPathologies identifiées: ${data.pathologies?.join(', ') || 'aucune'}\\nDispositifs médicaux: ${data.dispositifsMedicaux?.join(', ') || 'aucun'}`;
                        sendMessage(ordoMessage);
                        setShowOrdonnance(false);
                      }}
                    />
                    <button
                      className="mt-4 w-full text-sm font-semibold text-text-muted hover:text-text-main py-2 transition-colors rounded-lg hover:bg-gray-50"
                      onClick={() => { setShowOrdonnance(false); sendMessage("Pas d'ordonnance disponible pour l'instant."); }}
                    >
                      Continuer sans ordonnance →
                    </button>
                  </div>
                )}
  
                <div ref={messagesEndRef} className="h-4" />
              </div>
            </div>
  
            {/* Input area */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-brand-page via-brand-page to-transparent pb-8">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-3 bg-white p-2.5 rounded-3xl border border-gray-200 shadow-xl focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
                  <button
                    onClick={toggleSTT}
                    className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                      isSTTListening ? 'bg-orange-100 text-brand-accent shadow-inner animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-brand-primary'
                    }`}
                    title="Dicter"
                  >
                    🎤
                  </button>

                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tapez ou dictez votre réponse…"
                    rows={1}
                    className="flex-1 py-3 px-2 min-h-[44px] max-h-[120px] bg-transparent border-none text-text-main placeholder:text-gray-400 outline-none resize-none font-sans text-[15px]"
                    disabled={isLoading}
                  />

                  <button
                    className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-xl font-black transition-all duration-300 ${
                      input.trim() && !isLoading
                        ? 'bg-brand-primary text-white shadow-lg hover:bg-brand-primary-light hover:scale-105 cursor-pointer'
                        : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    }`}
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || !input.trim()}
                  >
                    ↑
                  </button>
                </div>
                <p className="text-center text-[11px] text-text-muted font-medium mt-3 px-4">
                  Cet outil est un assistant à l'orientation MAD. Il génère des pré-évaluations non engageantes sur le plan médical.
                </p>
              </div>
            </div>
          </div>
  
          {/* Right panel — Contextual info */}
          {(produits.length > 0 || isRecommending) && (
            <aside className="hidden lg:flex w-[380px] flex-col border-l border-gray-200/80 bg-white/40 backdrop-blur-md flex-shrink-0 h-full overflow-y-auto p-6 scroll-smooth">

              {isRecommending && (
                <div className="premium-card p-6 text-center mt-4 animate-fade-in border-brand-accent/30 bg-orange-50/50">
                  <div className="flex justify-center mb-4 text-brand-accent">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
                  </div>
                  <h4 className="font-bold text-text-main">Analyse clinique...</h4>
                  <p className="text-xs text-text-muted mt-2">Corrélation du profil avec le catalogue MAD.</p>
                </div>
              )}

              {produits.length > 0 && (
                <div className="animate-fade-in mt-2 flex flex-col min-h-0">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-4 sticky top-0 bg-white/70 py-1 backdrop-blur-md z-10 w-full rounded-t-lg">
                    Recommandations MAD
                  </p>

                  <div className="flex flex-col gap-4 pb-12">
                    {produits.map((product, i) => (
                      <ProductCard key={product.reference ?? i} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          )}
        </main>
      )}
      </div>
    </div>
  );
}
