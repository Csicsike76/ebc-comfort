import { revalidatePath } from 'next/cache';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  locale: string;
  newsletter_opt_in: boolean;
  created_at: string;
}

interface RoleRow {
  user_id: string;
  role: string;
}

const ROLES = [
  'super_admin', 'admin', 'editor', 'customer', 'supporter', 'beneficiary',
] as const;

export default async function AdminUsers({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { q } = await searchParams;
  const { locale, supa, isSuperAdmin, userId: currentUserId } = await requireAdmin(localeParam);

  let pQuery = supa
    .from('profiles')
    .select('id, email, full_name, phone, locale, newsletter_opt_in, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (q) pQuery = pQuery.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  const { data: profiles, error } = await pQuery;

  const ids = (profiles ?? []).map((p: ProfileRow) => p.id);
  const { data: rolesRows } = ids.length
    ? await supa.from('user_roles').select('user_id, role').in('user_id', ids)
    : { data: [] };

  const rolesByUser = new Map<string, string[]>();
  for (const r of (rolesRows ?? []) as RoleRow[]) {
    const arr = rolesByUser.get(r.user_id) ?? [];
    arr.push(r.role);
    rolesByUser.set(r.user_id, arr);
  }

  async function grantRole(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s, isSuperAdmin: superA } = await requireAdmin(lp);
    if (!superA) throw new Error('Csak super_admin oszthat szerepet.');
    const userIdGrant = String(formData.get('user_id') ?? '');
    const role = String(formData.get('role') ?? '');
    if (!userIdGrant || !(ROLES as readonly string[]).includes(role)) {
      throw new Error('Hiányzó user_id vagy érvénytelen role');
    }
    const { error: e } = await s.from('user_roles').insert({ user_id: userIdGrant, role });
    if (e && !/duplicate/i.test(e.message)) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/users`);
  }

  async function revokeRole(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s, isSuperAdmin: superA, userId: meId } = await requireAdmin(lp);
    if (!superA) throw new Error('Csak super_admin vonhat vissza szerepet.');
    const userIdRev = String(formData.get('user_id') ?? '');
    const role = String(formData.get('role') ?? '');
    if (userIdRev === meId && role === 'super_admin') {
      throw new Error('Saját super_admin-od nem vonhatod vissza.');
    }
    const { error: e } = await s
      .from('user_roles')
      .delete()
      .eq('user_id', userIdRev)
      .eq('role', role);
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/users`);
  }

  return (
    <div className="max-w-6xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Felhasználók</h1>
        <p className="text-sm text-[var(--color-muted)]">
          {(profiles ?? []).length} profil · {isSuperAdmin ? 'super_admin (role-grant elérhető)' : 'csak olvasás'}
        </p>
      </div>

      <form className="glass-card p-4 flex gap-3 items-end">
        <label className="flex-1">
          <span className="block text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">
            Keresés (email / név)
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ''}
            placeholder="ildiko@... vagy Balog"
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm"
          />
        </label>
        <button
          type="submit"
          className="px-4 py-2 rounded-full bg-[var(--color-accent)] text-white text-sm font-semibold"
        >
          Keres
        </button>
      </form>

      {error && (
        <div className="glass-card p-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="space-y-3">
        {((profiles ?? []) as ProfileRow[]).map((p) => {
          const userRoles = rolesByUser.get(p.id) ?? [];
          const isMe = p.id === currentUserId;
          return (
            <details key={p.id} className="glass-card p-5">
              <summary className="cursor-pointer flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">
                    {p.full_name ?? <em className="text-[var(--color-muted)]">— névtelen —</em>}
                    {isMe && <span className="ml-2 text-xs text-[var(--color-accent)]">(te)</span>}
                  </div>
                  <div className="text-xs text-[var(--color-muted)]">{p.email}</div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {userRoles.length === 0 ? (
                    <span className="text-xs text-[var(--color-muted)]">— nincs role —</span>
                  ) : (
                    userRoles.map((r) => (
                      <span
                        key={r}
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          r === 'super_admin'
                            ? 'bg-red-500/15 text-red-700'
                            : r === 'admin'
                            ? 'bg-amber-500/15 text-amber-700'
                            : r === 'editor'
                            ? 'bg-blue-500/15 text-blue-700'
                            : 'bg-gray-500/15 text-gray-700'
                        }`}
                      >
                        {r}
                      </span>
                    ))
                  )}
                </div>
              </summary>
              <div className="mt-4 space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--color-muted)]">Telefon: </span>
                    {p.phone ?? '—'}
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Locale: </span>
                    {p.locale}
                  </div>
                  <div>
                    <span className="text-[var(--color-muted)]">Hírlevél: </span>
                    {p.newsletter_opt_in ? 'igen' : 'nem'}
                  </div>
                  <div className="sm:col-span-3">
                    <span className="text-[var(--color-muted)]">Regisztrált: </span>
                    {formatDateTime(p.created_at)}
                  </div>
                </div>

                {isSuperAdmin && (
                  <div className="border-t border-[var(--color-border)] pt-3 space-y-2">
                    <div className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                      Szerep-kiosztás
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((r) => {
                        const has = userRoles.includes(r);
                        return (
                          <form
                            key={r}
                            action={has ? revokeRole : grantRole}
                            className="inline-block"
                          >
                            <input type="hidden" name="user_id" value={p.id} />
                            <input type="hidden" name="role" value={r} />
                            <button
                              type="submit"
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                has
                                  ? 'bg-red-500/15 text-red-700 hover:bg-red-500/25'
                                  : 'border border-[var(--color-border)] hover:bg-[var(--color-accent)]/10'
                              }`}
                            >
                              {has ? `− ${r}` : `+ ${r}`}
                            </button>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </details>
          );
        })}
        {(profiles ?? []).length === 0 && (
          <div className="glass-card p-10 text-center text-[var(--color-muted)]">
            Nincs felhasználó (a szűrőnek megfelelő).
          </div>
        )}
      </div>
    </div>
  );
}
