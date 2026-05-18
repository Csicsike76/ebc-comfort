import { requireAdmin } from '@/lib/admin/guard';
import ComplianceChecker from '@/components/admin/ComplianceChecker';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function AdminCompliance({ params }: Props) {
  const { locale: localeParam } = await params;
  await requireAdmin(localeParam, { allowEditor: true });

  return (
    <div className="max-w-4xl mx-auto safe-x py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Compliance ellenőrző</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Wellness vs medical claim — pre-flight ellenőrzés bármilyen szövegre, MIELŐTT publikálnánk.
          Kulcsszó-szűrő + Claude AI nuance-review.
        </p>
      </div>

      <ComplianceChecker />

      <section className="glass-card p-6 text-sm">
        <h2 className="font-bold mb-3">📋 Gyors-szabálykör (wellness-launch fázis)</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="font-semibold text-red-600 mb-1">❌ TILTOTT</div>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-muted)]">
              <li>UTI / húgyúti fertőzés / E. coli / baktérium</li>
              <li>Antibiotikum-alternatíva</li>
              <li>Gyógyítás / kezelés / orvosi eszköz</li>
              <li>Specifikus tünet-enyhítés</li>
              <li>Klinikai vizsgálat eredmény nélkül</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-green-600 mb-1">✓ MEGENGEDETT</div>
            <ul className="list-disc pl-5 space-y-1 text-[var(--color-muted)]">
              <li>Alhasi hőkomfort / melegítés</li>
              <li>Wellness-eszköz / komfort-érzés</li>
              <li>Hőterápia (általános koncepció)</li>
              <li>Diszkrét, hordozható, akkus</li>
              <li>"Diszkomfort enyhítése" (általános)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
