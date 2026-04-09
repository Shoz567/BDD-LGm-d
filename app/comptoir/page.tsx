'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
    { label: 'Je réponds pour moi', value: 'Je suis le patient et je réponds pour moi-même.' },
    { label: 'Je réponds pour un proche', value: "Je réponds pour un proche. Je suis son aidant." },
  ],
  metadata: { step: 'welcome' },
};

const WELCOME_MESSAGE = `Bonjour et bienvenue !

Je suis Hellia, votre conseillère en matériel de maintien à domicile. Je vais vous poser quelques questions pour vous orienter vers les équipements les mieux adaptés. Cela prend environ **3 à 5 minutes**.

**Commençons :** répondez-vous pour vous-même ou pour un proche ?`;

// Supprime les emoji éventuellement retournés par le modèle dans les labels
function cleanLabel(label: string): string {
  return label.replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{FE00}-\u{FE0F}]/gu, '').trim();
}

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
  const [, setIsRecommending] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [ordonnanceStepSent, setOrdonnanceStepSent] = useState(false);

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

      const lastAssistantStep = [...messages].reverse().find(m => m.role === 'assistant')?.metadata?.step;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          profil,
          lastStep: lastAssistantStep,
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
        setOrdonnanceStepSent(true);
      } else {
        setShowOrdonnance(false);
      }

      // Garde-fou : si le modèle ne renvoie pas isComplete après l'ordonnance, on force la fin
      const shouldComplete = data.isComplete || (ordonnanceStepSent && data.step === 'ordonnance');
      if (shouldComplete && latestGIR) {
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

  // 15 étapes max, jusqu'à 2 skips possibles → affiche sur 13
  const PROFIL_AGGIR_KEYS = ['respondant','age','sexe','coherence','mobilite','deplacementExterieur','transferts','toilette','habillage','alimentation','elimination','communication','situationRecente','priorites'];
  const completedSteps = PROFIL_AGGIR_KEYS.filter(k => profil[k as keyof typeof profil] !== undefined).length;
  const totalSteps = 13;
  const progress = Math.min((completedSteps / totalSteps) * 100, 100);

  const lastMsg = messages[messages.length - 1];
  const hasQuickActions = lastMsg?.role === 'assistant' && (lastMsg?.quickActions?.length ?? 0) > 0;

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

      {/* Progress bar */}
      <div className="h-[3px] bg-gray-100 w-full flex-shrink-0">
        <div
          className="h-full bg-gradient-to-r from-brand-primary to-brand-accent transition-all duration-700 ease-out"
          style={{ width: completedSteps > 0 ? `${progress}%` : '0%' }}
        />
      </div>

      {/* Header bar */}
      <div className="w-full max-w-[800px] mx-auto px-5 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/hellia.png" width={30} height={30} alt="Hellia" className="rounded-full flex-shrink-0" />
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-text-main">
              {viewMode === 'chat' ? 'Questionnaire autonomie' : 'Bilan clinique'}
            </span>
            {completedSteps > 0 && (
              <span className="text-[12px] text-text-muted hidden sm:inline">· étape {completedSteps}/{totalSteps}</span>
            )}
          </div>
          {gir && <div className="hidden sm:block"><GIRBadge gir={gir} /></div>}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsTTSEnabled(!isTTSEnabled)}
            title={isTTSEnabled ? 'Désactiver la voix' : 'Activer la voix'}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:bg-white hover:text-brand-primary transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            {isTTSEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            onClick={() => { setProfil({}); setGIR(null); setProduits([]); setMessages([{ ...INITIAL_MESSAGE, content: WELCOME_MESSAGE }]); setMessageGlobal(null); setViewMode('chat'); }}
            title="Recommencer"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:bg-white hover:text-brand-primary transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            <RotateCcw size={15} />
          </button>

          <button
            onClick={() => setShowPersonaSelector(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200/80 transition-colors"
          >
            <Settings2 size={13} /> <span className="hidden sm:inline">Démo</span>
          </button>

          {produits.length > 0 && (
            <button
              onClick={() => setViewMode(viewMode === 'chat' ? 'report' : 'chat')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary text-white text-[12px] font-bold hover:bg-brand-primary-light transition-colors shadow-sm"
            >
              {viewMode === 'chat'
                ? <><FileText size={13} /> <span className="hidden sm:inline">Rapport</span></>
                : <><MessageSquare size={13} /> <span className="hidden sm:inline">Chat</span></>}
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
        <main className="flex-1 flex flex-col w-full max-w-[680px] mx-auto px-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto py-6 space-y-3">

            {/* Mode wizard : on affiche uniquement la question courante */}
            {(() => {
              const currentMsg = [...messages].reverse().find(m => m.role === 'assistant');
              if (!currentMsg) return null;
              return (
                <div className="animate-fade-in space-y-3">
                  {/* Question Hellia */}
                  <div className="bg-white rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 px-6 py-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Image src="/hellia.png" width={24} height={24} alt="Hellia" className="rounded-full flex-shrink-0" />
                      <span className="text-[12px] font-bold text-brand-primary">Hellia</span>
                    </div>
                    <div className="text-[15px] leading-relaxed text-text-main markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentMsg.content}</ReactMarkdown>
                    </div>
                  </div>

                  {/* Boutons de réponse */}
                  {currentMsg.quickActions && currentMsg.quickActions.length > 0 && (
                    <div className="space-y-2">
                      {currentMsg.metadata?.step === 'priorites' ? (
                        <>
                          {currentMsg.quickActions.map((action: QuickAction, ai: number) => {
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
                                className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-150 text-left ${
                                  isSelected
                                    ? 'border-brand-accent bg-orange-50 text-brand-accent font-semibold shadow-sm'
                                    : 'border-gray-200 bg-white text-text-main hover:border-brand-primary/30 hover:bg-gray-50'
                                } ${!isSelected && selectedPriorities.length >= 3 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-brand-accent border-brand-accent' : 'border-gray-300'
                                }`}>
                                  {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                                <span className="text-[14px]">{cleanLabel(action.label)}</span>
                              </button>
                            );
                          })}
                          <button
                            onClick={() => { if (selectedPriorities.length > 0) { sendMessage(selectedPriorities.join(', ')); setSelectedPriorities([]); } }}
                            disabled={selectedPriorities.length === 0 || isLoading}
                            className={`w-full mt-1 py-3.5 rounded-xl font-bold text-[14px] transition-all ${
                              selectedPriorities.length > 0 && !isLoading
                                ? 'bg-brand-primary text-white hover:bg-brand-primary-light shadow-md hover:-translate-y-0.5'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            Valider {selectedPriorities.length > 0 ? `(${selectedPriorities.length}/3)` : ''}
                          </button>
                        </>
                      ) : (
                        currentMsg.quickActions.map((action: QuickAction, ai: number) => (
                          <button
                            key={ai}
                            onClick={() => sendMessage(action.label)}
                            disabled={isLoading}
                            className="group w-full flex items-center justify-between px-5 py-3.5 bg-white border border-gray-200 rounded-xl hover:border-brand-primary/40 hover:bg-gray-50 hover:shadow-sm transition-all duration-150 text-left cursor-pointer"
                          >
                            <span className="text-[14px] font-medium text-text-main group-hover:text-brand-primary transition-colors">
                              {cleanLabel(action.label)}
                            </span>
                            <span className="text-gray-300 group-hover:text-brand-primary transition-colors ml-3 flex-shrink-0">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Indicateur de chargement */}
            {isLoading && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <Image src="/hellia.png" width={24} height={24} alt="" className="rounded-full flex-shrink-0 mt-1" />
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '120ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '240ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Ordonnance upload */}
            {showOrdonnance && (
              <div className="bg-white border border-brand-primary/20 rounded-2xl p-5 shadow-sm animate-fade-in">
                <h3 className="font-bold text-text-main mb-4 flex items-center gap-2 text-[14px]">
                  📄 Fournir l'ordonnance <span className="text-text-muted font-normal">(optionnel)</span>
                </h3>
                <OrdonnanceUpload
                  onUploadComplete={(data) => {
                    const ordoMessage = `L'ordonnance a été analysée avec succès.\nMédicaments: ${data.medicaments?.join(', ') || 'aucun'}\nPathologies identifiées: ${data.pathologies?.join(', ') || 'aucune'}\nDispositifs médicaux: ${data.dispositifsMedicaux?.join(', ') || 'aucun'}`;
                    sendMessage(ordoMessage);
                    setShowOrdonnance(false);
                  }}
                />
                <button
                  className="mt-3 w-full text-[13px] font-medium text-text-muted hover:text-text-main py-2 transition-colors rounded-lg hover:bg-gray-50"
                  onClick={() => { setShowOrdonnance(false); sendMessage("Pas d'ordonnance disponible pour l'instant."); }}
                >
                  Continuer sans ordonnance →
                </button>
              </div>
            )}

            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input — uniquement quand pas de quick actions disponibles */}
          {!hasQuickActions && !showOrdonnance && !isLoading && (
            <div className="py-4 flex-shrink-0">
              <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-2.5 focus-within:border-brand-primary/40 focus-within:shadow-md transition-all">
                <button
                  onClick={toggleSTT}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${isSTTListening ? 'bg-orange-100 animate-pulse' : 'text-gray-400 hover:bg-gray-100'}`}
                  title="Dicter"
                >
                  🎤
                </button>
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tapez votre réponse…"
                  rows={1}
                  className="flex-1 py-1.5 bg-transparent border-none text-text-main placeholder:text-gray-400 outline-none resize-none text-[14px] min-h-[36px] max-h-[100px]"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${input.trim() ? 'bg-brand-primary text-white hover:bg-brand-primary-light' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-[11px] text-text-muted pb-4 flex-shrink-0">
            Assistant à l'orientation MAD · pré-évaluation non engageante sur le plan médical.
          </p>
        </main>
      )}
      </div>
    </div>
  );
}
