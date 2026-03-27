'use client';

// components/ChatWidget.tsx
// Widget flottant avec les modes Comptoir et Gestion.
// Importer dans n'importe quelle page/layout : <ChatWidget />
// Il appelle automatiquement /api/chat — assurez-vous que la route est en place.

import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types/chat';

const MODES = {
  comptoir: {
    color: '#1B4332',
    title: 'Comptoir',
    greeting: "Bonjour ! Pour vous aider à trouver le bon équipement, quel est l'âge du patient ?",
  },
  gestion: {
    color: '#264653',
    title: 'Gestion',
    greeting: "Bonjour ! Comment puis-je vous aider avec la plateforme ?",
  },
} as const;

type WidgetMode = keyof typeof MODES;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<WidgetMode>('comptoir');
  const [messages, setMessages] = useState<Record<WidgetMode, Message[]>>({
    comptoir: [{ role: 'assistant', content: MODES.comptoir.greeting }],
    gestion:  [{ role: 'assistant', content: MODES.gestion.greeting }],
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Draggable
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef   = useRef<HTMLDivElement>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pos.x === -1) setPos({ x: window.innerWidth - 420, y: window.innerHeight - 600 });
  }, [pos.x]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, mode]);
  useEffect(() => { if (open && textareaRef.current) textareaRef.current.focus(); }, [open, mode]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, a, textarea, input')) return;
    setDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => setPos({
      x: Math.max(0, Math.min(window.innerWidth  - 390, e.clientX - dragOffset.current.x)),
      y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y)),
    });
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  const currentMessages = messages[mode];
  const cfg = MODES[mode];

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input };
    const newMsgs = [...currentMessages, userMsg];
    setMessages(prev => ({ ...prev, [mode]: newMsgs }));
    setInput('');
    setIsLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMsgs, mode }),
    });

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    setMessages(prev => ({ ...prev, [mode]: [...newMsgs, { role: 'assistant', content: '' }] }));

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      setMessages(prev => ({ ...prev, [mode]: [...newMsgs, { role: 'assistant', content: text }] }));
    }
    setIsLoading(false);
  }

  return (
    <>
      {/* Bouton flottant */}
      {!open && (
        <button onClick={() => setOpen(true)} className="cw-fab" style={{ background: cfg.color }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {/* Fenêtre du widget */}
      {open && (
        <div
          ref={widgetRef}
          className="cw-window"
          style={{ left: pos.x, top: pos.y, cursor: dragging ? 'grabbing' : 'default' }}
        >
          {/* Header */}
          <div className="cw-header" style={{ background: cfg.color }} onMouseDown={onMouseDown}>
            <div style={{ cursor: 'grab', flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cw-header-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Assistant LGm@d</div>
                <div style={{ fontSize: 11, opacity: 0.7, color: 'white' }}>Mode {cfg.title}</div>
              </div>
            </div>

            {/* Sélecteur de mode */}
            <div className="cw-mode-switch">
              {(Object.keys(MODES) as WidgetMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`cw-mode-btn ${mode === m ? 'cw-mode-btn--active' : ''}`}
                >
                  {MODES[m].title}
                </button>
              ))}
            </div>

            {/* Fermer */}
            <button onClick={() => setOpen(false)} className="cw-close-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="cw-messages">
            {currentMessages.map((m, i) => (
              <div key={`${mode}-${i}`} className={`cw-msg ${m.role === 'user' ? 'cw-msg--user' : 'cw-msg--assistant'}`}>
                {m.role === 'assistant' && (
                  <div className="cw-avatar" style={{ background: cfg.color }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M2 12h20"/><path d="M12 2v20"/>
                    </svg>
                  </div>
                )}
                <div
                  className={`cw-bubble ${m.role === 'user' ? 'cw-bubble--user' : 'cw-bubble--assistant'}`}
                  style={m.role === 'user' ? { background: cfg.color } : {}}
                >
                  {m.content || (isLoading && i === currentMessages.length - 1 ? (
                    <span className="cw-typing">
                      <span className="cw-dot" /><span className="cw-dot" /><span className="cw-dot" />
                    </span>
                  ) : '')}
                </div>
              </div>
            ))}
            {isLoading && currentMessages[currentMessages.length - 1]?.role === 'user' && (
              <div className="cw-msg cw-msg--assistant">
                <div className="cw-avatar" style={{ background: cfg.color }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 8V4H8"/><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M2 12h20"/><path d="M12 2v20"/>
                  </svg>
                </div>
                <div className="cw-bubble cw-bubble--assistant">
                  <span className="cw-typing">
                    <span className="cw-dot" /><span className="cw-dot" /><span className="cw-dot" />
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="cw-input-area">
            <div className="cw-input-row">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Écrivez votre message..."
                disabled={isLoading}
                rows={1}
                className="cw-textarea"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="cw-send-btn"
                style={{ background: input.trim() ? cfg.color : undefined }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
