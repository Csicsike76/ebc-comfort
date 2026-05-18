'use client';
import { useEffect, useRef, useState } from 'react';
import { FONTS, FONT_GROUPS, findFont } from '@/lib/fonts';

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
  light: TokenSet;
  dark: TokenSet;
}

const ROTATE_INTERVALS = [
  { label: '5 mp', ms: 5000 },
  { label: '10 mp', ms: 10000 },
  { label: '30 mp', ms: 30000 },
  { label: '1 perc', ms: 60000 },
  { label: '5 perc', ms: 300000 },
  { label: '1 óra', ms: 3600000 },
  { label: '3 óra', ms: 10800000 },
  { label: '6 óra', ms: 21600000 },
  { label: '12 óra', ms: 43200000 },
  { label: '24 óra', ms: 86400000 },
] as const;

const COOKIE_FONT = 'ebc_font';
const COOKIE_RADIUS = 'ebc_radius';
const COOKIE_GLOBE = 'ebc_globe';

function setCookie(key: string, value: string, days = 365) {
  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}; samesite=lax`;
}

function readCookie(key: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.split('; ').find((c) => c.startsWith(`${key}=`));
  return m ? decodeURIComponent(m.slice(key.length + 1)) : null;
}

function applyTokens(tokens: TokenSet) {
  const r = document.documentElement.style;
  r.setProperty('--color-bg', tokens.bg);
  r.setProperty('--color-surface', tokens.surface);
  r.setProperty('--color-text', tokens.text);
  r.setProperty('--color-muted', tokens.muted);
  r.setProperty('--color-accent', tokens.accent);
  r.setProperty('--color-accent2', tokens.accent2);
  r.setProperty('--color-border', tokens.border);
}

function setPaletteCookie(id: string, tokens: { light: TokenSet; dark: TokenSet }) {
  document.cookie = `ebc_palette=${id}; path=/; max-age=${365 * 86400}; samesite=lax`;
  // localStorage write triggers 'storage' event in OTHER tabs of the same browser
  // → public-tab PaletteSync listens + applies tokens live (no reload)
  localStorage.setItem(
    'ebc_palette_data',
    JSON.stringify({ id, tokens, ts: Date.now() })
  );
}

function loadFontStylesheet(font: { key: string; googleQuery: string }) {
  const existing = document.querySelector(`link[data-ebc-font="${font.key}"]`);
  if (existing) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font.googleQuery}&display=swap`;
  link.dataset.ebcFont = font.key;
  document.head.appendChild(link);
}

export default function DevControls() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [fontKey, setFontKey] = useState('manrope');
  const [autoRotate, setAutoRotate] = useState(false);
  const [intervalMs, setIntervalMs] = useState<number>(30000);
  const [radiusPx, setRadiusPx] = useState<number>(24);
  const [globeVmin, setGlobeVmin] = useState<number>(135);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/palettes-v1.json').then((r) => r.json()),
      fetch('/data/palettes-v2.json').then((r) => r.json()),
    ])
      .then(([v1, v2]: [{ palettes: Palette[] }, { palettes: Palette[] }]) => {
        setPalettes([...(v2.palettes ?? []), ...(v1.palettes ?? [])]);
      })
      .catch(() => undefined);

    const f = readCookie(COOKIE_FONT);
    if (f) {
      setFontKey(f);
      const fo = findFont(f);
      if (fo) {
        loadFontStylesheet(fo);
        document.documentElement.style.setProperty('--font-sans', fo.family);
      }
    }
    const r = readCookie(COOKIE_RADIUS);
    if (r) {
      const v = parseInt(r, 10);
      if (!Number.isNaN(v)) {
        setRadiusPx(v);
        applyRadius(v);
      }
    }
    const g = readCookie(COOKIE_GLOBE);
    if (g) {
      const v = parseInt(g, 10);
      if (!Number.isNaN(v)) {
        setGlobeVmin(v);
        applyGlobe(v);
      }
    }
  }, []);

  function applyGlobe(v: number) {
    document.documentElement.style.setProperty('--globe-size-vmin', String(v));
  }

  function pickGlobe(v: number) {
    setGlobeVmin(v);
    applyGlobe(v);
    setCookie(COOKIE_GLOBE, String(v));
    // Cross-tab sync: write to localStorage triggers storage event in other tabs
    localStorage.setItem('ebc_globe_vmin', JSON.stringify({ v, ts: Date.now() }));
  }

  function applyRadius(v: number) {
    const r = document.documentElement.style;
    r.setProperty('--radius-card', `${v}px`);
    r.setProperty('--radius-feature', `${v + 4}px`);
    r.setProperty('--radius-how-wrap', `${Math.min(v * 2, 56)}px`);
    r.setProperty('--radius-disclaimer', `${Math.min(v + 8, 40)}px`);
  }

  function pickFont(key: string) {
    setFontKey(key);
    const fo = findFont(key);
    if (!fo) return;
    loadFontStylesheet(fo);
    document.documentElement.style.setProperty('--font-sans', fo.family);
    setCookie(COOKIE_FONT, key);
    // Cross-tab sync trigger
    localStorage.setItem(
      'ebc_font_key',
      JSON.stringify({ key, family: fo.family, googleQuery: fo.googleQuery, ts: Date.now() })
    );
  }

  function pickRadius(v: number) {
    setRadiusPx(v);
    applyRadius(v);
    setCookie(COOKIE_RADIUS, String(v));
    // Cross-tab sync trigger
    localStorage.setItem('ebc_radius_px', JSON.stringify({ v, ts: Date.now() }));
  }

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!autoRotate || palettes.length === 0) return;
    timerRef.current = setInterval(() => {
      const current = readCookie('ebc_palette');
      const idx = palettes.findIndex((p) => p.id === current);
      const next = palettes[(idx + 1) % palettes.length];
      const theme = document.documentElement.getAttribute('data-theme') ?? 'light';
      const tokens = theme === 'dark' ? next.dark : next.light;
      applyTokens(tokens);
      setPaletteCookie(next.id, { light: next.light, dark: next.dark });
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRotate, intervalMs, palettes]);

  return (
    <section className="glass-card p-6 space-y-5">
      <header>
        <h2 className="text-lg font-bold">⚙️ Dev kontroll-panel</h2>
        <p className="text-xs text-[var(--color-muted)]">
          {palettes.length} paletta · {FONTS.length} font · auto-rotáció + kerekítés-slider
        </p>
      </header>

      {/* Font picker */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-[var(--color-muted)]">
          Betűforma ({fontKey})
        </label>
        <select
          value={fontKey}
          onChange={(e) => pickFont(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
        >
          {FONT_GROUPS.map((g) => (
            <optgroup key={g.group} label={g.label}>
              {FONTS.filter((f) => f.group === g.group).map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="text-xs text-[var(--color-muted)]">
          Cookie-ba mentve (1 év). Google Fonts CDN-ről on-demand betölt.
        </p>
      </div>

      {/* Radius slider */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-[var(--color-muted)]">
          Kártya-kerekítés ({radiusPx}px)
        </label>
        <input
          type="range"
          min={8}
          max={48}
          value={radiusPx}
          onChange={(e) => pickRadius(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>

      {/* Globe size slider */}
      <div className="space-y-2">
        <label className="block text-xs uppercase tracking-wider text-[var(--color-muted)]">
          🌍 Háttér-földgömb mérete ({globeVmin}vmin)
        </label>
        <input
          type="range"
          min={60}
          max={170}
          value={globeVmin}
          onChange={(e) => pickGlobe(parseInt(e.target.value, 10))}
          className="w-full accent-[var(--color-accent)]"
        />
        <p className="text-xs text-[var(--color-muted)]">
          A főoldal forgó földgömbjének zoom-szintje. 60% = pici, 135% = default, 170% = maximális.
        </p>
      </div>

      {/* Auto-rotation */}
      <div className="space-y-2 pt-3 border-t border-[var(--color-border)]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          <span className="font-semibold">🎨 Automatikus paletta-rotáció</span>
        </label>
        <div className="grid grid-cols-5 gap-1 mt-2">
          {ROTATE_INTERVALS.map((iv) => (
            <button
              key={iv.ms}
              type="button"
              onClick={() => setIntervalMs(iv.ms)}
              disabled={!autoRotate}
              className={`px-2 py-1.5 rounded-full text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                intervalMs === iv.ms
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'border border-[var(--color-border)] hover:bg-[var(--color-accent)]/10'
              }`}
            >
              {iv.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Ha bekapcsolod, {ROTATE_INTERVALS.find((i) => i.ms === intervalMs)?.label}-onként
          automatikusan vált a {palettes.length}-paletta listán.
        </p>
      </div>

      <p className="text-[10px] text-[var(--color-muted)] italic pt-2 border-t border-[var(--color-border)]">
        Ez a panel az admin-felület része, csak super_admin/admin férhet hozzá. A választott
        beállítások az aktuális böngészőre vonatkoznak (cookie + localStorage), NEM kerülnek
        push-ba a publikus oldalakra.
      </p>
    </section>
  );
}
