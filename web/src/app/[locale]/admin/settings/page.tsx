import { redirect, notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import PalettePicker from '@/components/admin/PalettePicker';
import DevControls from '@/components/admin/DevControls';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminSettings({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const supa = await getSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect(`/${locale}/admin/signin`);

  const { data: roles } = await supa.from('user_roles').select('role').eq('user_id', user.id);
  const isAdmin = (roles ?? []).some(
    (r: { role: string }) => r.role === 'admin' || r.role === 'super_admin'
  );
  if (!isAdmin) redirect(`/${locale}`);

  return (
    <div className="max-w-7xl mx-auto safe-x py-10">
      <h1 className="text-3xl font-bold mb-2">Beállítások</h1>
      <p className="text-sm text-[var(--color-muted)] mb-8">
        Színpaletta, megjelenés és helyi beállítások.
      </p>

      <h2 className="text-lg font-bold mb-2">Színpaletta</h2>
      <p className="text-sm text-[var(--color-muted)] mb-6 max-w-2xl">
        35 paletta forrás: Pantone CoTY · PPG · WGSN · Radix UI · Vercel · Vistaprint 2026 trends · Magyar zászló · Rio · Sunset Beach · Botanical · Carnival · Mineral. Kattints egyre → live preview, mentés a böngészőben.
      </p>
      <PalettePicker />

      <div className="mt-12">
        <DevControls />
      </div>
    </div>
  );
}
