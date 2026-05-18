import { getDict, tt } from '@/lib/i18n';
import { Locale } from '@/lib/i18n/config';

const BADGES: Array<{ ico: string; key: string }> = [
  { ico: 'CE', key: 'home.trust.ce' },
  { ico: '✓', key: 'home.trust.iso' },
  { ico: '30', key: 'home.trust.refund' },
  { ico: 'SP', key: 'home.trust.simplepay' },
  { ico: '€', key: 'home.trust.eu' },
];

export default function TrustBadges({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  const t = (key: string) => tt(dict, key);
  return (
    <div className="glass-card trust-badges">
      {BADGES.map((b) => (
        <span key={b.ico} className="trust-badge">
          <span className="trust-badge-ico">{b.ico}</span>
          {t(b.key)}
        </span>
      ))}
    </div>
  );
}
