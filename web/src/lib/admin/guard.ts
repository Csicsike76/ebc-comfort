import { redirect, notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface AdminContext {
  locale: Locale;
  supa: SupabaseClient;
  userId: string;
  email: string;
  isSuperAdmin: boolean;
}

export async function requireAdmin(
  localeParam: string,
  opts: { allowEditor?: boolean } = {}
): Promise<AdminContext> {
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const supa = await getSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect(`/${locale}/admin/signin`);

  const { data: roles } = await supa
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  const roleSet = new Set((roles ?? []).map((r: { role: string }) => r.role));
  const isAdmin = roleSet.has('admin') || roleSet.has('super_admin');
  const isEditor = isAdmin || roleSet.has('editor');
  const allowed = opts.allowEditor ? isEditor : isAdmin;
  if (!allowed) redirect(`/${locale}`);

  return {
    locale,
    supa: supa as unknown as SupabaseClient,
    userId: user.id,
    email: user.email ?? '',
    isSuperAdmin: roleSet.has('super_admin'),
  };
}

export function formatMoneyCents(cents: number, currency = 'EUR'): string {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat('hu-HU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('hu-HU');
}
