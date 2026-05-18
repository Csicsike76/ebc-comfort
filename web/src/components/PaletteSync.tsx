'use client';
import { useEffect } from 'react';

/**
 * Cross-tab palette + design-token sync.
 * Listens to localStorage 'storage' events from other tabs of the same browser.
 * When admin (in /admin/settings DevControls) rotates the palette / changes
 * font / radius / globe-size, the public tab applies it live (no reload).
 *
 * Note: 'storage' events fire ONLY in OTHER tabs (not the originating tab).
 * Cross-browser / cross-device sync requires server-side broadcast (Supabase
 * Realtime) — not implemented; that's an explicit per-browser demo limit.
 */

interface TokenSet {
  bg: string;
  surface: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  border: string;
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

export default function PaletteSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function onStorage(e: StorageEvent) {
      if (!e.key) return;

      if (e.key === 'ebc_palette_data' && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (!data?.tokens) return;
          const theme = document.documentElement.getAttribute('data-theme') ?? 'light';
          const tokens: TokenSet | undefined = theme === 'dark' ? data.tokens.dark : data.tokens.light;
          if (tokens) applyTokens(tokens);
        } catch {
          /* ignore parse */
        }
      }

      if (e.key === 'ebc_radius_px' && e.newValue) {
        try {
          const { v } = JSON.parse(e.newValue);
          if (typeof v !== 'number') return;
          const r = document.documentElement.style;
          r.setProperty('--radius-card', `${v}px`);
          r.setProperty('--radius-feature', `${v + 4}px`);
          r.setProperty('--radius-how-wrap', `${Math.min(v * 2, 56)}px`);
          r.setProperty('--radius-disclaimer', `${Math.min(v + 8, 40)}px`);
        } catch {
          /* ignore */
        }
      }

      if (e.key === 'ebc_globe_vmin' && e.newValue) {
        try {
          const { v } = JSON.parse(e.newValue);
          if (typeof v !== 'number') return;
          document.documentElement.style.setProperty('--globe-size-vmin', String(v));
        } catch {
          /* ignore */
        }
      }
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return null;
}
