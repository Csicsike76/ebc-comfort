import { notFound } from 'next/navigation';
import { isValidLocale, Locale } from '@/lib/i18n/config';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();
  const locale = localeParam as Locale;

  const supa = await getSupabaseServerClient();
  const { data: { user } } = await supa.auth.getUser();

  const isAdmin = user
    ? await (async () => {
        const { data: roles } = await supa
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        return (roles ?? []).some(
          (r: { role: string }) => r.role === 'admin' || r.role === 'super_admin'
        );
      })()
    : false;

  return (
    <div className="min-h-screen flex flex-col">
      {user && isAdmin && <AdminNav locale={locale} email={user.email ?? ''} />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
