'use client';
import { useState, useTransition } from 'react';

export default function GenerateIdeasButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handle(channel: string) {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/marketing/ideas', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ count: 3, channel, notify_telegram: true }),
        });
        const data = await res.json();
        if (!res.ok) {
          setResult(`❌ ${data.error ?? 'hiba'}`);
        } else {
          setResult(
            `✅ ${data.count} ötlet generálva${data.telegram_sent ? ' + Telegram-be kiküldve' : ''}`
          );
        }
      } catch (e) {
        setResult(`❌ ${e instanceof Error ? e.message : 'network'}`);
      }
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {(['mixed', 'instagram', 'tiktok', 'youtube', 'facebook'] as const).map((c) => (
          <button
            key={c}
            type="button"
            disabled={pending}
            onClick={() => handle(c)}
            className="px-3 py-1.5 rounded-full border border-[var(--color-border)] text-sm hover:bg-[var(--color-accent)]/10 disabled:opacity-50"
          >
            {pending ? '⏳' : '🎯'} {c}
          </button>
        ))}
      </div>
      {result && (
        <div className="text-xs text-[var(--color-muted)]">{result}</div>
      )}
    </div>
  );
}
