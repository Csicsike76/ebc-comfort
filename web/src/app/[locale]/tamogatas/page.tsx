import { notFound, redirect } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import PublicShell from '@/components/PublicShell';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ done?: string }>;
}

export default async function SupportPage({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { done } = await searchParams;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  async function submitSupportRequest(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const supa = await getSupabaseServerClient();
    const { data: { user } } = await supa.auth.getUser();

    const full_name = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim() || null;
    const phone = String(formData.get('phone') ?? '').trim() || null;
    const reason = String(formData.get('reason') ?? '').trim();

    if (!full_name || !reason) throw new Error('Név és indoklás kötelező.');
    if (reason.length < 30) throw new Error('Az indoklás legalább 30 karakter legyen.');

    const { error } = await supa.from('support_requests').insert({
      user_id: user?.id ?? null,
      full_name,
      email,
      phone,
      reason,
      status: 'pending',
    });
    if (error) throw new Error(error.message);
    redirect(`/${lp}/tamogatas?done=request`);
  }

  async function submitNewsletter(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const supa = await getSupabaseServerClient();
    const { data: { user } } = await supa.auth.getUser();

    const email = String(formData.get('email') ?? '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Érvénytelen email-cím.');
    }
    const topic = String(formData.get('topic') ?? 'donation');

    const { error } = await supa.from('newsletter_subscriptions').upsert(
      {
        email,
        user_id: user?.id ?? null,
        locale: lp,
        topics: [topic],
      },
      { onConflict: 'email' }
    );
    if (error) throw new Error(error.message);
    redirect(`/${lp}/tamogatas?done=newsletter`);
  }

  return (
    <PublicShell locale={locale}>
      <div className="max-w-4xl mx-auto safe-x py-12 sm:py-16 space-y-8">
        <div className="glass-card p-7 sm:p-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Támogatási program</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">
            EBC Wellness elkötelezett amellett, hogy alacsony jövedelmű nőknek is elérhető legyen a
            termék. Minden 20. rendelés árából egy EBC Comfort darabot átadunk egy rászorulónak.
            Pályázni az alábbi űrlapon lehet.
          </p>
        </div>

        {done === 'request' && (
          <div className="glass-card p-5 border-l-4 border-green-500 text-sm">
            ✅ Köszönjük! A kérvényt megkaptuk. 7-14 napon belül e-mailben válaszolunk.
          </div>
        )}
        {done === 'newsletter' && (
          <div className="glass-card p-5 border-l-4 border-green-500 text-sm">
            ✅ Köszönjük a feliratkozást! Értesítünk a launch-kor.
          </div>
        )}

        <section className="glass-card p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-3">Támogatási kérvény</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            Rászorulóknak nyújtott EBC Comfort támogatás. A bírálat egyedi mérlegelés alapján
            történik, válasz 7-14 napon belül.
          </p>
          <form action={submitSupportRequest} className="space-y-4">
            <Field label="Teljes név" name="full_name" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email" name="email" type="email" />
              <Field label="Telefon" name="phone" type="tel" />
            </div>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                Indoklás (min. 30 karakter) <span className="text-red-500">*</span>
              </span>
              <textarea
                name="reason"
                required
                minLength={30}
                rows={6}
                placeholder="Írj röviden a helyzetedről és arról, miért lenne fontos a támogatás."
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              />
            </label>
            <p className="text-xs text-[var(--color-muted)]">
              A megadott adatokat kizárólag a kérvény bírálatára használjuk fel (GDPR 6.(1)(a)
              hozzájárulás). Visszavonás:{' '}
              <a href="mailto:support@ebc-wellness.eu" className="underline">
                support@ebc-wellness.eu
              </a>
              .
            </p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
              >
                Kérvény beküldése
              </button>
            </div>
          </form>
        </section>

        <section className="glass-card p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-3">Adományzás / értesítés</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">
            Szeretnél támogatni minket adományzással, vagy értesítést kérni a launch-ról? Hagyd
            meg az email-címed — amikor elindul, értesítünk.
            <br />
            <em className="text-xs">
              (Stripe-fizetés hamarosan; addig csak email-pledge gyűjtésre megyünk.)
            </em>
          </p>
          <form action={submitNewsletter} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              name="email"
              required
              placeholder="te@email.hu"
              className="flex-1 px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
            />
            <select
              name="topic"
              className="px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              defaultValue="donation"
            >
              <option value="donation">Adományozó vagyok</option>
              <option value="launch">Launch-értesítés</option>
              <option value="general">Általános hírlevél</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              Feliratkozás
            </button>
          </form>
          <p className="text-xs text-[var(--color-muted)] mt-3">
            Leiratkozni bármikor lehet az emailben lévő linken.
          </p>
        </section>
      </div>
    </PublicShell>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
      />
    </label>
  );
}
