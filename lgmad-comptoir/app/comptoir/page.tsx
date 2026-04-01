'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, PatientProfile, GIRScore, Product, DemoPersona, QuickAction } from '@/lib/types';
import { calculerGIR } from '@/lib/scoring';
import { GIRBadge } from '@/components/Patient/GIRBadge';
import { ProductCard } from '@/components/Products/ProductCard';
import { OrdonnanceUpload } from '@/components/Patient/OrdonnanceUpload';
import { PersonaSelector } from '@/components/Demo/PersonaSelector';
import { AutonomyRadarChart } from '@/components/Report/AutonomyRadarChart';
import { LABELS_PRIORITES } from '@/lib/prompts';

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

  // Restore consent from localStorage after mount (avoids SSR hydration mismatch)
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

  // TTS: speak assistant messages
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

  // STT toggle
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

      // Update profil — compute new values locally to avoid stale closure in fetchRecommendations
      let latestProfil = profil;
      let latestGIR: GIRScore | null = gir;
      if (data.profilUpdate) {
        latestProfil = { ...profil, ...data.profilUpdate };
        setProfil(latestProfil);
        latestGIR = calculerGIR(latestProfil);
        setGIR(latestGIR);
      }

      // Check if we should show ordonnance upload
      if (data.step === 'ordonnance' && !data.isComplete) {
        setShowOrdonnance(true);
      } else {
        setShowOrdonnance(false);
      }

      // If recommendations complete, fetch products with current (non-stale) values
      if ((data.isComplete || data.step === 'recommandations') && latestGIR) {
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

    const demoMessage: ChatMessage = {
      role: 'assistant',
      content: `🎭 **Cas démo chargé : ${persona.nom}, ${persona.age}**\n\n${persona.scenario}\n\nProfil calculé : **GIR ${persona.girAttendu}**. Je génère les recommandations…`,
      timestamp: new Date(),
    };
    setMessages([{ ...INITIAL_MESSAGE, content: WELCOME_MESSAGE }, demoMessage]);

    // Trigger recommendations with non-stale values
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

  // --- Consent screen ---
  if (showConsent && !consentGiven) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}>
        <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 24px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem',
          }}>
            🏥
          </div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-text)', marginBottom: '8px' }}>
            Assistant LGm@d
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Mode Comptoir — Pharmacie partenaire
          </p>
          <div className="disclaimer" style={{ textAlign: 'left', marginBottom: '24px' }}>
            <p style={{ marginBottom: '8px', fontWeight: 600 }}>⚖️ Consentement RGPD</p>
            <p>
              Les informations collectées sont utilisées uniquement pour vous orienter vers les équipements MAD adaptés.
              Elles peuvent être enregistrées avec votre consentement.
              Aucune décision médicale ne sera prise sur cette base.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn btn-primary w-full"
              style={{ justifyContent: 'center', padding: '14px' }}
              onClick={() => { localStorage.setItem('lgmad_consent', new Date().toISOString()); setConsentGiven(true); setShowConsent(false); }}
            >
              ✓ J&apos;accepte et je commence
            </button>
            <button
              className="btn btn-ghost w-full"
              style={{ justifyContent: 'center', padding: '14px', fontSize: '0.8rem' }}
              onClick={() => { setShowConsent(false); }}
            >
              Continuer sans enregistrement
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Demo persona modal */}
      {showPersonaSelector && (
        <PersonaSelector
          onSelect={loadPersona}
          onClose={() => setShowPersonaSelector(false)}
        />
      )}

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(10, 15, 30, 0.9)',
        backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 40,
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '64px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>
              🏥
            </div>
            <div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text)' }}>LGm@d</span>
              <span style={{
                marginLeft: '8px', fontSize: '0.7rem', color: 'var(--color-text-muted)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border)',
                borderRadius: '999px', padding: '2px 8px',
              }}>
                Mode Comptoir
              </span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {gir && <GIRBadge gir={gir} />}

            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
              onClick={() => setIsTTSEnabled(!isTTSEnabled)}
              title={isTTSEnabled ? 'Désactiver la voix' : 'Activer la voix'}
              aria-label={isTTSEnabled ? 'Désactiver la synthèse vocale' : 'Activer la synthèse vocale'}
              aria-pressed={isTTSEnabled}
            >
              {isTTSEnabled ? '🔊' : '🔇'}
            </button>

            <button
              className="btn btn-primary"
              style={{ fontSize: '0.8rem', padding: '7px 16px' }}
              onClick={() => setShowPersonaSelector(true)}
            >
              🎭 Démo
            </button>

            <button
              className="btn btn-ghost"
              style={{ fontSize: '0.8rem', padding: '7px 14px' }}
              onClick={() => {
                setProfil({});
                setGIR(null);
                setProduits([]);
                setMessages([{ ...INITIAL_MESSAGE, content: WELCOME_MESSAGE }]);
                setMessageGlobal(null);
                setViewMode('chat');
              }}
            >
              ↺ Nouveau
            </button>

            {produits.length > 0 && (
              <button
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '7px 16px', marginLeft: '12px' }}
                onClick={() => setViewMode(viewMode === 'chat' ? 'report' : 'chat')}
              >
                {viewMode === 'chat' ? '📄 Voir le rapport' : '💬 Voir le chat'}
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {completedSteps > 0 && (
          <div style={{ height: '2px', background: 'var(--color-border)', marginBottom: '-1px' }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
              transition: 'width 600ms ease',
            }} />
          </div>
        )}
      </header>

      {/* Main content */}
      {viewMode === 'report' ? (
        <main style={{ flex: 1, padding: '40px 24px', overflowY: 'auto' }}>
          <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header: GIR + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-text)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '2.2rem' }}>📄</span> Bilan d'évaluation & Orientations
              </h1>
              {gir && <GIRBadge gir={gir} showDetails />}
            </div>

            {/* Top Dashboard Row: Profile Summary & Radar Chart */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
              
              {/* Left: Profil Summary */}
              {Object.keys(profil).length > 0 && (
                <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>👤</span> Profil et priorités du patient
                  </h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {profil.age && <span className="chip" style={{ fontSize: '1rem', padding: '8px 16px' }}>Âge: {profil.age} ans</span>}
                    {profil.sexe && <span className="chip" style={{ fontSize: '1rem', padding: '8px 16px', textTransform: 'capitalize' }}>{profil.sexe}</span>}
                    {profil.respondant && <span className="chip" style={{ fontSize: '1rem', padding: '8px 16px' }}>{profil.respondant === 'aidant' ? '🤝 Aidant (Tiers)' : '👤 Patient direct'}</span>}
                    {profil.priorites?.map((p) => (
                      <span key={p} className="chip" style={{ fontSize: '1rem', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.15)', borderColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd' }}>
                        {LABELS_PRIORITES[p]?.icon} Priorité: {LABELS_PRIORITES[p]?.label}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                      Les variables ci-dessus ainsi que les observations cliniques détaillées permettent de dresser le profil d'autonomie AGGIR (à droite) et d'orienter les choix médicaux.
                    </p>
                  </div>
                </div>
              )}

              {/* Right: Autonomy Radar Chart */}
              {gir && (
                <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span>🕸️</span> Profil d'autonomie (AGGIR)
                  </h2>
                  <div style={{ flex: 1, minHeight: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-16px' }}>
                    <AutonomyRadarChart gir={gir} />
                  </div>
                </div>
              )}
            </div>

            {/* Middle Row: Full width Clinical Report */}
            {messageGlobal && (
              <div className="glass-card" style={{ padding: '40px', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '32px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>🩺</span> Compte-rendu clinique détaillé
                </h2>
                <div className="markdown-body" style={{ fontSize: '1.1rem', color: 'var(--color-text)', lineHeight: '1.8' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {messageGlobal}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div style={{ animationDelay: '200ms' }} className="animate-fade-in">
              <h2 style={{ fontSize: '1.3rem', marginBottom: '24px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>📦</span> Équipements MAD recommandés
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {produits.map((product, i) => (
                  <ProductCard key={product.reference ?? i} product={product} />
                ))}
              </div>
            </div>

            <div style={{ marginTop: '40px', padding: '24px', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Ce bilan a été généré par l'Intelligence Artificielle LGm@d.<br/>
                La validation finale du matériel appartient au pharmacien d'officine ou au prestataire de santé.
              </p>
            </div>
          </div>
        </main>
      ) : (
        <main style={{
          flex: 1, display: 'flex',
          maxWidth: '1280px', width: '100%', margin: '0 auto',
          padding: '0', gap: '0',
        }}>
          {/* Chat column */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            minWidth: 0, height: 'calc(100vh - 65px)',
          }}>
            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              <div style={{ maxWidth: '768px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {messages.map((msg, i) => (
                  <div key={i} className="animate-fade-in" style={{
                    display: 'flex',
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    gap: '12px', alignItems: 'flex-start',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #7c3aed, #4f46e5)'
                        : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    }}>
                      {msg.role === 'user' ? '👤' : '🤖'}
                    </div>
  
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Bubble */}
                      <div style={{
                        background: msg.role === 'user'
                          ? '#2563eb'
                          : 'transparent',
                        borderRadius: msg.role === 'user' ? '24px 8px 24px 24px' : '8px 24px 24px 24px',
                        padding: msg.role === 'user' ? '12px 20px' : '4px 8px',
                        maxWidth: '100%',
                        display: 'inline-block',
                      }}>
                        <div className="markdown-body" style={{
                          fontSize: '1.05rem',
                          color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                          lineHeight: '1.7',
                          wordBreak: 'break-word',
                        }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
  
                      {/* Ergonomic Quick actions */}
                      {msg.quickActions && msg.quickActions.length > 0 && i === messages.length - 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '24px', maxWidth: '500px' }}>
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
                                    className="animate-fade-in"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      background: isSelected ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                                      border: `1px solid ${isSelected ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                                      borderRadius: '12px',
                                      padding: '16px 24px',
                                      color: 'var(--color-text)',
                                      cursor: isLoading || (!isSelected && selectedPriorities.length >= 3) ? 'not-allowed' : 'pointer',
                                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                      textAlign: 'left',
                                      fontSize: '1.05rem',
                                      opacity: !isSelected && selectedPriorities.length >= 3 ? 0.5 : 1,
                                    }}
                                  >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                      <input 
                                        type="checkbox" 
                                        checked={isSelected} 
                                        readOnly 
                                        style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                                      />
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
                                className="btn btn-primary"
                                style={{ marginTop: '8px', padding: '16px', justifyContent: 'center', fontSize: '1.05rem' }}
                              >
                                Valider les priorités {selectedPriorities.length > 0 ? `(${selectedPriorities.length}/3)` : ''}
                              </button>
                            </>
                          ) : (
                            msg.quickActions.map((action: QuickAction, ai: number) => (
                              <button
                                key={ai}
                                onClick={() => sendMessage(action.label)}
                                disabled={isLoading}
                                className="animate-fade-in"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  background: 'rgba(255, 255, 255, 0.04)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: '12px',
                                  padding: '16px 24px',
                                  color: 'var(--color-text)',
                                  cursor: isLoading ? 'not-allowed' : 'pointer',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  textAlign: 'left',
                                  fontSize: '1.05rem',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isLoading) {
                                    e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)';
                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isLoading) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                  }
                                }}
                              >
                                <span style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                  <span style={{ 
                                    width: '8px', 
                                    height: '8px', 
                                    background: 'var(--color-primary)', 
                                    borderRadius: '50%',
                                    boxShadow: '0 0 10px var(--color-primary)',
                                    flexShrink: 0
                                  }} />
                                  {action.label}
                                </span>
                                <span style={{ opacity: 0.5, fontSize: '1.2rem', marginLeft: '16px' }}>→</span>
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
                  <div className="animate-fade-in" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                    }}>🤖</div>
                    <div style={{
                      padding: '12px 8px',
                    }}>
                      <div className="typing-dots" style={{ display: 'flex', gap: '6px' }}>
                        <span /><span /><span />
                      </div>
                    </div>
                  </div>
                )}
  
                {/* Ordonnance upload section */}
                {showOrdonnance && (
                  <div className="glass-card animate-fade-in" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-text)' }}>
                      📄 Uploader l&apos;ordonnance (optionnel)
                    </h3>
                    <OrdonnanceUpload
                      onUploadComplete={(data) => {
                        const ordoMessage = `L'ordonnance a été analysée avec succès.\nMédicaments: ${data.medicaments?.join(', ') || 'aucun'}\nPathologies identifiées: ${data.pathologies?.join(', ') || 'aucune'}\nDispositifs médicaux: ${data.dispositifsMedicaux?.join(', ') || 'aucun'}`;
                        sendMessage(ordoMessage);
                        setShowOrdonnance(false);
                      }}
                    />
                    <button
                      className="btn btn-ghost"
                      style={{ marginTop: '12px', width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                      onClick={() => {
                        setShowOrdonnance(false);
                        sendMessage("Pas d'ordonnance disponible pour l'instant.");
                      }}
                    >
                      Continuer sans ordonnance
                    </button>
                  </div>
                )}
  
                <div ref={messagesEndRef} />
              </div>
            </div>
  
            {/* Disclaimer */}
            <div style={{ padding: '0 24px 8px', maxWidth: '728px', margin: '0 auto', width: '100%' }}>
              <p className="disclaimer" style={{ textAlign: 'center' }}>
                ⚠️ Cet outil est une aide à l&apos;orientation — il ne remplace pas un avis médical ou une évaluation GIR officielle.
              </p>
            </div>
  
            {/* Input area */}
            <div style={{
              padding: '20px 24px 32px',
              background: 'linear-gradient(to top, var(--color-bg) 70%, transparent)',
              position: 'relative',
              zIndex: 10,
            }}>
              <div style={{ 
                maxWidth: '768px', margin: '0 auto', display: 'flex', gap: '8px', alignItems: 'flex-end',
                background: '#1e293b', padding: '8px 12px', borderRadius: '28px', border: '1px solid #334155',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
               }}>
                {/* STT button */}
                <button
                  onClick={toggleSTT}
                  style={{
                    flexShrink: 0,
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    background: isSTTListening ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                    color: isSTTListening ? '#3b82f6' : '#94a3b8',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                    animation: isSTTListening ? 'pulse 1s ease infinite' : 'none',
                    transition: 'all 200ms ease',
                  }}
                  title={isSTTListening ? 'Arrêter la dictée' : 'Dicter votre réponse'}
                  aria-label={isSTTListening ? 'Arrêter la reconnaissance vocale' : 'Démarrer la reconnaissance vocale'}
                  aria-pressed={isSTTListening}
                >
                  🎤
                </button>
  
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Message à LGm@d..."
                  rows={1}
                  style={{ 
                    flex: 1, minHeight: '40px', maxHeight: '120px', lineHeight: '1.5', 
                    padding: '8px 4px', background: 'transparent', border: 'none', color: '#f8fafc',
                    outline: 'none', resize: 'none', fontSize: '1rem',
                    fontFamily: 'inherit'
                  }}
                  disabled={isLoading}
                />
  
                <button
                  style={{ 
                    flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%',
                    background: input.trim() ? '#3b82f6' : '#334155',
                    color: '#ffffff', border: 'none', cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms ease',
                    opacity: isLoading ? 0.5 : 1
                  }}
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
  
          {/* Right panel — Profil & Minimal view for chat mode */}
          {(gir || produits.length > 0 || isRecommending) && (
            <aside style={{
              width: '360px', flexShrink: 0,
              borderLeft: '1px solid var(--color-border)',
              overflowY: 'auto',
              padding: '24px 20px',
              height: 'calc(100vh - 65px)',
              background: 'rgba(17, 24, 39, 0.6)',
            }}>
              {/* GIR Card */}
              {gir && (
                <div className="glass-card animate-fade-in" style={{ padding: '20px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Niveau de dépendance
                  </p>
                  <GIRBadge gir={gir} showDetails />
  
                  {/* Profile chips */}
                  {Object.keys(profil).length > 0 && (
                    <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {profil.age && <span className="chip">{profil.age} ans</span>}
                      {profil.sexe && <span className="chip">{profil.sexe}</span>}
                      {profil.respondant && <span className="chip">{profil.respondant === 'aidant' ? '🤝 Aidant' : '👤 Patient'}</span>}
                      {profil.priorites?.map((p) => (
                        <span key={p} className="chip">
                          {LABELS_PRIORITES[p]?.icon} {LABELS_PRIORITES[p]?.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

            {/* Loading Indicator */}
            {isRecommending && (
              <div className="glass-card animate-fade-in" style={{ padding: '24px', textAlign: 'center', marginTop: '24px' }}>
                <div className="typing-dots" style={{ justifyContent: 'center', marginBottom: '16px' }}>
                  <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)' }}/>
                  <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)' }}/>
                  <span style={{ width: '8px', height: '8px', background: 'var(--color-primary)' }}/>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontWeight: 500 }}>
                  Analyse clinique en cours...
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                  Génération du compte-rendu médical et sélection du matériel.
                </p>
              </div>
            )}

            {/* Product recommendations */}
            {produits.length > 0 && (
              <div className="animate-fade-in">
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Recommandations personnalisées
                </p>

                {messageGlobal && (
                  <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                    <div className="markdown-body" style={{ fontSize: '0.85rem', color: 'var(--color-text)', lineHeight: '1.6' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {messageGlobal}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {produits.map((product, i) => (
                    <ProductCard key={product.reference ?? i} product={product} />
                  ))}
                </div>

                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '16px', textAlign: 'center', lineHeight: '1.5' }}>
                  Ces recommandations sont générées par IA. Le pharmacien valide toute commande.
                </p>
              </div>
            )}
          </aside>
        )}
      </main>
      )}
    </div>
  );
}
