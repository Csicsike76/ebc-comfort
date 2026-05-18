import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { requireAdmin, formatDateTime } from '@/lib/admin/guard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}

interface RequestRow {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  reason: string;
  status: string;
  income_proof_url: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

const STATUSES = ['pending', 'approved', 'rejected', 'fulfilled', 'expired'] as const;

export default async function AdminSupport({ params, searchParams }: Props) {
  const { locale: localeParam } = await params;
  const { status } = await searchParams;
  const { locale, supa } = await requireAdmin(localeParam);

  let query = supa
    .from('support_requests')
    .select('id, full_name, email, phone, reason, status, income_proof_url, reviewed_at, notes, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (status && (STATUSES as readonly string[]).includes(status)) {
    query = query.eq('status', status);
  }

  const { data: requests, error } = await query;

  async function review(formData: FormData) {
    'use server';
    const { locale: lp } = await params;
    const { supa: s, userId } = await requireAdmin(lp);
    const reqId = String(formData.get('request_id') ?? '');
    const newStatus = String(formData.get('new_status') ?? '');
    const notes = String(formData.get('notes') ?? '') || null;
    if (!reqId) throw new Error('request_id hiányzik');
    if (!(STATUSES as readonly string[]).includes(newStatus)) {
      throw new Error('Érvénytelen státusz');
    }
    const { error: e } = await s
      .from('support_requests')
      .update({
        status: newStatus,
        notes,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reqId);
    if (e) throw new Error(e.message);
    revalidatePath(`/${lp}/admin/support`);
  }

  return (
    <div className="max-w-6xl mx-auto safe-x py-10">
      <h1 className="text-3xl font-bold mb-2">Támogatási kérvények</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {(requests ?? []).length} kérvény · NGO támogatás-program
      </p>

      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        <Link
          href={`/${locale}/admin/support`}
          className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
            !status ? 'bg-[var(--color-accent)] text-white' : ''
          }`}
        >
          Mind
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/${locale}/admin/support?status=${s}`}
            className={`px-3 py-1.5 rounded-full border border-[var(--color-border)] ${
              status === s ? 'bg-[var(--color-accent)] text-white' : ''
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      {error && (
        <div className="glass-card p-4 mb-4 text-sm text-red-600">DB hiba: {error.message}</div>
      )}

      <div className="space-y-3">
        {((requests ?? []) as RequestRow[]).map((r) => (
          <details key={r.id} className="glass-card p-5">
            <summary className="cursor-pointer flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold">{r.full_name}</div>
                <div className="text-xs text-[var(--color-muted)]">
                  {r.email ?? '—'} · {formatDateTime(r.created_at)}
                </div>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-accent)]/15">
                {r.status}
              </span>
            </summary>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase text-[var(--color-muted)]">Indoklás</div>
                <p className="whitespace-pre-wrap">{r.reason}</p>
              </div>
              {r.phone && (
                <div>
                  <span className="text-xs uppercase text-[var(--color-muted)]">Telefon: </span>
                  {r.phone}
                </div>
              )}
              {r.income_proof_url && (
                <a
                  href={r.income_proof_url}
                  target="_blank"
                  rel="noopener"
                  className="text-[var(--color-accent)] hover:underline text-xs"
                >
                  Jövedelem-igazolás megnyitása →
                </a>
              )}
              {r.notes && (
                <div className="bg-[var(--color-accent)]/5 rounded-xl p-3 text-xs">
                  <span className="font-semibold">Belső jegyzet: </span>
                  {r.notes}
                </div>
              )}

              <form action={review} className="border-t border-[var(--color-border)] pt-3 space-y-3">
                <input type="hidden" name="request_id" value={r.id} />
                <textarea
                  name="notes"
                  defaultValue={r.notes ?? ''}
                  rows={2}
                  placeholder="Belső jegyzet (opcionális)"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs"
                />
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      type="submit"
                      name="new_status"
                      value={s}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                        s === r.status
                          ? 'bg-[var(--color-accent)] text-white opacity-50'
                          : s === 'approved'
                          ? 'bg-green-500/15 text-green-700 hover:bg-green-500/25'
                          : s === 'rejected'
                          ? 'bg-red-500/15 text-red-700 hover:bg-red-500/25'
                          : 'border border-[var(--color-border)] hover:bg-[var(--color-accent)]/10'
                      }`}
                    >
                      → {s}
                    </button>
                  ))}
                </div>
              </form>

              {r.reviewed_at && (
                <p className="text-xs text-[var(--color-muted)]">
                  Felülvizsgálva: {formatDateTime(r.reviewed_at)}
                </p>
              )}
            </div>
          </details>
        ))}
        {(requests ?? []).length === 0 && (
          <div className="glass-card p-10 text-center text-[var(--color-muted)]">
            Nincs ilyen kérvény.
          </div>
        )}
      </div>
    </div>
  );
}
