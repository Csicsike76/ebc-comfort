import { notFound, redirect } from 'next/navigation';
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

  // Not authenticated → render the bare child (admin/signin/page is the only
  // public child). The signin page is the entry point; redirecting here
  // would cause a loop.
  if (!user) {
    return <div className="min-h-screen flex flex-col"><main className="flex-1">{children}</main></div>;
  }

  // Authenticated but not admin → kick out to public home. Defense-in-depth:
  // even if a future admin/*/page.tsx forgets requireAdmin(), the layout
  // still rejects the request.
  const { data: roles } = await supa
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id);
  const isAdmin = (roles ?? []).some(
    (r: { role: string }) => r.role === 'admin' || r.role === 'super_admin'
  );
  if (!isAdmin) {
    redirect(`/${locale}`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav locale={locale} email={user.email ?? ''} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
