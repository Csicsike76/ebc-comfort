'use client';
import { useEffect, useState } from 'react';

interface TokenSet {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  border: string;
}

interface Palette {
  id: string;
  name: string;
  source?: string;
  font?: string;
  family?: string;
  light: TokenSet;
  dark: TokenSet;
}

interface PaletteFile {
  palettes: Palette[];
}

const KEYS: (keyof TokenSet)[] = ['bg', 'surface', 'text', 'muted', 'accent', 'accent2', 'border'];

function applyTokens(tokens: TokenSet) {
  const root = document.documentElement.style;
  root.setProperty('--color-bg', tokens.bg);
  root.setProperty('--color-surface', tokens.surface);
  root.setProperty('--color-text', tokens.text);
  root.setProperty('--color-muted', tokens.muted);
  root.setProperty('--color-accent', tokens.accent);
  root.setProperty('--color-accent2', tokens.accent2);
  root.setProperty('--color-border', tokens.border);
}

function clearTokens() {
  const root = document.documentElement.style;
  KEYS.forEach((k) => {
    const v = k === 'accent2' ? '--color-accent2' : `--color-${k}`;
    root.removeProperty(v);
  });
}

export default function PalettePicker() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    Promise.all([
      fetch('/data/palettes-v1.json').then((r) => r.json()),
      fetch('/data/palettes-v2.json').then((r) => r.json()),
    ])
      .then(([v1, v2]: [PaletteFile, PaletteFile]) => {
        const merged = [...(v2.palettes ?? []), ...(v1.palettes ?? [])];
        setPalettes(merged);
      })
      .catch((e) => console.error('palette load failed', e));

    const cookie = document.cookie
      .split('; ')
      .find((c) => c.startsWith('ebc_palette='))
      ?.split('=')[1];
    if (cookie) setActiveId(cookie);

    const theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') setMode('dark');
  }, []);

  function pick(p: Palette) {
    setActiveId(p.id);
    const tokens = mode === 'dark' ? p.dark : p.light;
    applyTokens(tokens);
    document.cookie = `ebc_palette=${p.id}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    localStorage.setItem(
      'ebc_palette_data',
      JSON.stringify({ id: p.id, tokens: { light: p.light, dark: p.dark } })
    );
  }

  function resetToDefault() {
    setActiveId(null);
    clearTokens();
    document.cookie = `ebc_palette=; path=/; max-age=0`;
    localStorage.removeItem('ebc_palette_data');
  }

  if (palettes.length === 0) {
    return <div className="text-sm text-[var(--color-muted)]">Loading palettes…</div>;
  }

  return (
    <div>
      <div className="flex gap-2 items-center mb-4 text-sm">
        <span className="text-[var(--color-muted)]">Preview mode:</span>
        <button
          onClick={() => setMode('light')}
          className={`px-3 py-1 rounded-full ${mode === 'light' ? 'bg-[var(--color-accent)] text-white' : 'border border-[var(--color-border)]'}`}
        >
          ☀️ Light
        </button>
        <button
          onClick={() => setMode('dark')}
          className={`px-3 py-1 rounded-full ${mode === 'dark' ? 'bg-[var(--color-accent)] text-white' : 'border border-[var(--color-border)]'}`}
        >
          🌙 Dark
        </button>
        <button
          onClick={resetToDefault}
          className="ml-auto px-3 py-1 rounded-full border border-[var(--color-border)] text-xs"
        >
          Visszaállítás default-ra
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {palettes.map((p) => {
          const t = mode === 'dark' ? p.dark : p.light;
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => pick(p)}
              className={`text-left rounded-2xl p-4 border-2 transition-all ${
                isActive ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30' : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
              }`}
              style={{
                background: t.bg,
                color: t.text,
              }}
            >
              <div className="font-bold text-sm mb-1">{p.name}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-3">{p.id}</div>
              <div className="flex gap-1 mb-3">
                {([t.accent, t.accent2, t.surface, t.muted, t.border] as string[]).map((c, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md border"
                    style={{ background: c, borderColor: t.border }}
                  />
                ))}
              </div>
              {p.source && (
                <div className="text-[10px] opacity-50 truncate">{p.source}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
