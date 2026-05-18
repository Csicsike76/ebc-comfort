'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getAdminDict } from '@/lib/i18n/admin';

const MSG_HU = {
  intro: 'Csak Zsolt + Ildi férnek hozzá. Más kísérlet automatikusan elutasítva.',
  password_tab: 'Jelszó',
  magic_tab: 'Magic-link',
  email_placeholder: 'te@email.hu',
  busy: 'Folyamatban…',
  magic_send: 'Magic-link küldése',
  magic_sent: 'Magic-link elküldve. Nézd meg az e-mail-edet.',
  back: '← Vissza a főoldalra',
};
const MSG_EN: typeof MSG_HU = {
  intro: 'Restricted to Zsolt + Ildi only. Other attempts are rejected automatically.',
  password_tab: 'Password',
  magic_tab: 'Magic link',
  email_placeholder: 'you@email.com',
  busy: 'Working…',
  magic_send: 'Send magic link',
  magic_sent: 'Magic link sent. Check your inbox.',
  back: '← Back to home',
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default function SignInPage({ params }: Props) {
  const { locale: localeParam } = use(params);
  const locale = (isValidLocale(localeParam) ? localeParam : 'hu') as Locale;
  const dict = getAdminDict(locale);
  const msgs = locale === 'hu' ? MSG_HU : MSG_EN;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'magic'>('signin');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const supa = getSupabaseBrowserClient();
    try {
      if (mode === 'signin') {
        const { error } = await supa.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(`/${locale}/admin`);
      } else {
        const { error } = await supa.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/admin` },
        });
        if (error) throw error;
        setMsg(msgs.magic_sent);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md glass-card p-8">
        <h1 className="text-2xl font-bold mb-2">{dict.signin.title}</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          {msgs.intro}
        </p>

        <div className="flex gap-2 mb-6 text-sm">
          <button
            onClick={() => setMode('signin')}
            className={`px-3 py-1.5 rounded-full ${mode === 'signin' ? 'bg-[var(--color-accent)] text-white' : 'border border-[var(--color-border)]'}`}
          >
            {msgs.password_tab}
          </button>
          <button
            onClick={() => setMode('magic')}
            className={`px-3 py-1.5 rounded-full ${mode === 'magic' ? 'bg-[var(--color-accent)] text-white' : 'border border-[var(--color-border)]'}`}
          >
            {msgs.magic_tab}
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">{dict.signin.email_label}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none"
              placeholder={msgs.email_placeholder}
            />
          </div>
          {mode === 'signin' && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">{dict.signin.password_label}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] focus:border-[var(--color-accent)] outline-none"
                placeholder="••••••••"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full px-7 py-3 rounded-full bg-[var(--color-accent)] text-white font-semibold hover:bg-[var(--color-accent-2)] disabled:opacity-50"
          >
            {busy ? msgs.busy : mode === 'signin' ? dict.signin.submit : msgs.magic_send}
          </button>
        </form>

        {msg && (
          <div className="mt-4 p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)] text-sm">
            {msg}
          </div>
        )}

        <p className="mt-6 text-xs text-[var(--color-muted)] text-center">
          <a href={`/${locale}`} className="hover:text-[var(--color-accent-2)]">{msgs.back}</a>
        </p>
      </div>
    </div>
  );
}
