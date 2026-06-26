import { notFound, redirect } from 'next/navigation';
import { pageAlternates } from '@/lib/seo';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getUi } from '@/lib/i18n/ui-strings';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { sendSupportReceived } from '@/lib/email/send';
import PublicShell from '@/components/PublicShell';
import { getPublicPagesDict } from '@/lib/i18n/public-pages';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ done?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<import('next').Metadata> {
  const { locale } = await params;
  return { alternates: pageAlternates(locale, '/tamogatas') };
}

export default async function SupportPage({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { done } = await searchParams;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;
  const dict = getPublicPagesDict(locale).tamogatas;

  async function submitSupportRequest(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const loc = isValidLocale(lp) ? lp : 'hu';
    const ui = getUi(loc);
    const supa = await getSupabaseServerClient();
    const { data: { user } } = await supa.auth.getUser();

    const full_name = String(formData.get('full_name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim() || null;
    const phone = String(formData.get('phone') ?? '').trim() || null;
    const reason = String(formData.get('reason') ?? '').trim();

    if (!full_name || !reason) throw new Error(ui.err_name_reason_required);
    if (reason.length < 30) throw new Error(ui.err_reason_min);
    const { error } = await supa.from('support_requests').insert({
      user_id: user?.id ?? null,
      full_name,
      email,
      phone,
      reason,
      status: 'pending',
      locale: loc,
    });
    if (error) throw new Error(error.message);

    if (email) {
      await sendSupportReceived({
        locale: loc,
        email,
        full_name,
        reason,
        user_id: user?.id ?? null,
      }).catch(() => undefined);
    }
    redirect(`/${lp}/tamogatas?done=request`);
  }

  async function submitNewsletter(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const supa = await getSupabaseServerClient();
    const { data: { user } } = await supa.auth.getUser();

    const email = String(formData.get('email') ?? '').trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(getUi(isValidLocale(lp) ? lp : 'hu').err_invalid_email);
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
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{dict.title}</h1>
          <p className="text-base text-[var(--color-muted)] leading-relaxed">{dict.subtitle}</p>
        </div>

        {done === 'request' && (
          <div className="glass-card p-5 border-l-4 border-green-500 text-sm">
            ✅ {dict.submitted_ok}
          </div>
        )}
        {done === 'newsletter' && (
          <div className="glass-card p-5 border-l-4 border-green-500 text-sm">
            ✅ {dict.submitted_ok}
          </div>
        )}

        <section className="glass-card p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-3">{dict.form_section_title}</h2>
          <form action={submitSupportRequest} className="space-y-4">
            <Field label={dict.field_full_name} name="full_name" required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label={dict.field_email} name="email" type="email" />
              <Field label={dict.field_phone} name="phone" type="tel" />
            </div>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
                {dict.field_reason} <span className="text-red-500">*</span>
              </span>
              <textarea
                name="reason"
                required
                minLength={30}
                rows={6}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              />
            </label>
            <p className="text-xs text-[var(--color-muted)]">{dict.program_note}</p>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
              >
                {dict.submit}
              </button>
            </div>
          </form>
        </section>

        <section className="glass-card p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-3">{dict.newsletter_title}</h2>
          <p className="text-sm text-[var(--color-muted)] mb-6">{dict.newsletter_intro}</p>
          <form action={submitNewsletter} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              name="email"
              required
              placeholder={dict.newsletter_email}
              aria-label={dict.newsletter_email}
              className="flex-1 px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
            />
            <select
              name="topic"
              aria-label={dict.newsletter_topic}
              className="px-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
              defaultValue="donation"
            >
              <option value="donation">Donation</option>
              <option value="launch">Launch</option>
              <option value="general">General</option>
            </select>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
            >
              {dict.newsletter_submit}
            </button>
          </form>
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
