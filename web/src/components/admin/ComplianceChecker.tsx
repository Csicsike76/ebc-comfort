'use client';
import { useState, useTransition } from 'react';

interface CheckResult {
  verdict: 'clean' | 'review_needed' | 'forbidden';
  keyword_hits: string[];
  ai_review: {
    verdict?: string;
    overall_risk_score?: number;
    violations?: Array<{
      snippet: string;
      issue: string;
      severity: string;
      suggestion: string;
    }>;
  } | null;
  ai_error: string | null;
  text_length: number;
}

export default function ComplianceChecker() {
  const [text, setText] = useState('');
  const [context, setContext] = useState<'general' | 'marketing' | 'article' | 'product'>('general');
  const [locale, setLocale] = useState('hu');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handle() {
    setResult(null);
    setError(null);
    if (!text.trim()) {
      setError('Kérlek, add meg a szöveget.');
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch('/api/compliance/check', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text, context, locale }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? 'Hiba');
        } else {
          setResult(data as CheckResult);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'network');
      }
    });
  }

  const badge = (v: CheckResult['verdict']) => {
    const map = {
      clean: 'bg-green-500/15 text-green-700',
      review_needed: 'bg-amber-500/15 text-amber-700',
      forbidden: 'bg-red-500/15 text-red-700',
    };
    const label = {
      clean: '✓ TISZTA',
      review_needed: '⚠️ FELÜLVIZSGÁLAT',
      forbidden: '🛑 TILTOTT',
    };
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${map[v]}`}>
        {label[v]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Kontextus
            </span>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value as typeof context)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
            >
              <option value="general">Általános</option>
              <option value="marketing">Marketing / hirdetés</option>
              <option value="article">Cikk / edukáció</option>
              <option value="product">Termékleírás</option>
            </select>
          </label>
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
              Nyelv
            </span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
            >
              <option value="hu">HU</option>
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Vizsgálandó szöveg ({text.length} karakter)
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Marketing-szöveg, cikk, termékleírás… amit publikálás előtt ellenőrizni szeretnél."
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm font-mono"
          />
        </label>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handle}
            disabled={pending || !text.trim()}
            className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold disabled:opacity-50"
          >
            {pending ? '⏳ Ellenőrzés…' : '🔍 Ellenőriz'}
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">{error}</div>
      )}

      {result && (
        <section className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-lg font-bold">Eredmény</h2>
            {badge(result.verdict)}
          </div>

          {result.keyword_hits.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-red-700 mb-2">
                🛑 Tiltott kulcsszó-egyezések ({result.keyword_hits.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.keyword_hits.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-700 font-mono font-semibold"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.ai_review && (
            <div>
              <h3 className="font-semibold text-sm mb-2">
                🤖 AI nuance-review (kockázat: {result.ai_review.overall_risk_score ?? '—'}/100)
              </h3>
              {result.ai_review.violations && result.ai_review.violations.length > 0 ? (
                <ul className="space-y-3">
                  {result.ai_review.violations.map((v, i) => (
                    <li key={i} className="border-l-4 border-amber-500 pl-3 text-sm">
                      <div className="font-mono text-xs text-[var(--color-muted)] italic">
                        &quot;{v.snippet}&quot;
                      </div>
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                          v.severity === 'high' ? 'bg-red-500/15 text-red-700' :
                          v.severity === 'medium' ? 'bg-amber-500/15 text-amber-700' :
                          'bg-gray-500/15 text-gray-700'
                        }`}>
                          {v.severity}
                        </span>
                        <strong>{v.issue}</strong>
                      </div>
                      <div className="mt-1 text-xs text-[var(--color-muted)]">
                        💡 Javaslat: {v.suggestion}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--color-muted)]">AI nem talált problémát.</p>
              )}
            </div>
          )}

          {result.ai_error && (
            <div className="text-xs text-amber-700 bg-amber-500/10 rounded-xl p-3">
              AI review hiba: {result.ai_error} (csak kulcsszó-ellenőrzés ment lefutott)
            </div>
          )}
        </section>
      )}
    </div>
  );
}
