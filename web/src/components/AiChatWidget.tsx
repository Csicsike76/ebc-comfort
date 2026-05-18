'use client';

import { useState, useRef, useEffect } from 'react';
import { getDict, tt } from '@/lib/i18n';
import { Locale, DEFAULT_LOCALE } from '@/lib/i18n/config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  locale?: Locale;
}

export default function AiChatWidget({ locale = DEFAULT_LOCALE }: Props) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_id: conversationId,
          locale,
        }),
      });
      const data = await res.json();
      if (data.conversation_id) setConversationId(data.conversation_id);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply ?? '⚠️ Hiba.' }]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: '⚠️ Kapcsolat-hiba. Próbáld újra.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button — bottom-right; bottom-right corner-globe moved up so no collision */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('chat.title')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[var(--color-accent)] text-white shadow-lg hover:bg-[var(--color-accent-2)] transition-colors flex items-center justify-center z-40"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          id="chat"
          className="fixed bottom-24 right-6 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] glass-card flex flex-col z-40 overflow-hidden"
        >
          <header className="px-4 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <div className="font-semibold text-sm">{t('chat.title')}</div>
            <button
              onClick={() => setOpen(false)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)]"
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </header>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-sm"
          >
            {messages.length === 0 && (
              <div className="text-[var(--color-muted)] text-xs italic text-center pt-6">
                {t('chat.disclaimer')}
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-br-sm'
                      : 'bg-[var(--color-bg)] border border-[var(--color-border)] rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-muted)]">
                  …
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="border-t border-[var(--color-border)] px-3 py-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 px-3 py-2 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold hover:bg-[var(--color-accent-2)] disabled:opacity-50"
            >
              {t('chat.send')}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
