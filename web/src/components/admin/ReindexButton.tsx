'use client';
import { useState, useTransition } from 'react';

interface Props {
  source_type: 'article' | 'product' | 'faq';
  source_id: string;
  locale: string;
  content: string;
  metadata?: Record<string, unknown>;
  label?: string;
}

export default function ReindexButton({
  source_type,
  source_id,
  locale,
  content,
  metadata,
  label,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function handle() {
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch('/api/kb/embed', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ source_type, source_id, locale, content, metadata }),
        });
        const data = await res.json();
        if (!res.ok) {
          setResult(`❌ ${data.error ?? 'hiba'}`);
        } else if (data.placeholder) {
          setResult('⚠️ Embedding API placeholder — kihagyva');
        } else {
          setResult(`✅ ${data.chunks_inserted}/${data.chunks_total} chunk (${data.model ?? '?'})`);
        }
      } catch (e) {
        setResult(`❌ ${e instanceof Error ? e.message : 'network'}`);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handle}
        disabled={pending}
        className="px-3 py-1.5 rounded-full border border-[var(--color-border)] text-xs hover:bg-[var(--color-accent)]/10 disabled:opacity-50"
      >
        {pending ? '⏳ Indexelés…' : `🧠 ${label ?? `RAG re-index (${locale})`}`}
      </button>
      {result && <span className="text-xs text-[var(--color-muted)]">{result}</span>}
    </span>
  );
}
