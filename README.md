# EBC Comfort — NGO Wellness Platform

**Live**: https://ebc-comfort.netlify.app
**Tulajdonos**: Balog Ildikó (66%) + Olah Zsolt Péter (33%)
**Termék**: EBC Comfort fűthető komfortbetét (€100, 5 hőfok, 8000 mAh)
**Stack**: Next.js 16 · Tailwind 4 · Supabase · Netlify · Anthropic Claude API · Telegram

## Mappa-struktúra

```
code/
├── web/                       # Next.js 16 frontend (App Router + TS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── [locale]/      # 15 EU nyelv route (HU/EN/DE/FR/IT/ES/PL/RO/NL/PT/CS/SK/SV/DA/FI)
│   │   │   │   ├── admin/     # Admin panel (auth-guard, dashboard, settings)
│   │   │   │   ├── page.tsx   # Landing page
│   │   │   │   └── layout.tsx
│   │   │   ├── auth/callback/ # OAuth magic-link callback
│   │   │   └── api/chat/      # AI chat proxy → Edge Function
│   │   ├── components/        # BrandLogo, LocaleSwitcher, ThemeToggle, AiChatWidget, AdminNav, PalettePicker
│   │   ├── lib/
│   │   │   ├── i18n/          # 15 locale config + dictionary
│   │   │   └── supabase/      # browser + SSR client
│   │   └── middleware.ts      # locale auto-detect + redirect
│   ├── public/
│   │   ├── brand/             # logo PNGs, MP4, bg.jpg (metadata-stripped)
│   │   ├── data/              # palettes-v1.json (14) + palettes-v2.json (15) — 29 paletta
│   │   └── manifest.json      # PWA manifest
│   └── package.json
└── supabase/
    ├── migrations/            # 13 SQL migration (46 tabla + 107 RLS + 4 cron + seed)
    └── functions/             # 4 Edge Function
        ├── ai-chat-completion # Claude Haiku 4.5 HU+EN+DE wellness-only
        ├── telegram-admin-notify  # X-Internal-Secret
        ├── gdpr-export-data
        └── gdpr-erase-data
```

## Brand design system

- **Fonts**: Manrope (display+body) + JetBrains Mono (számok), self-hosted GDPR
- **Bg-image**: `OriginalHattercsere.jpg` (magyar trikolor hímzés a flower-of-life mintán)
- **Logo**: `LuxusLogo.mp4` (animált) + statikus PNG
- **Cards**: opaque surface, 24px rounded, soft shadow (no glass-bleed-through)
- **Theme**: light/dark/system cycle, cookie persist, no-flash bootstrap
- **Color palette**: 29 paletta admin/settings-ben választható (Pantone CoTY 2025+2026, PPG, WGSN, Radix UI, Vercel, Vistaprint trends)

## Compliance (KRITIKUS — wellness fázis)

EBC Comfort egy **wellness-eszköz**, NEM orvosi eszköz. Marketing tilttott szavak:
- ❌ UTI / húgyúti fertőzés / E. coli / antibiotikum / gyógyítás / klinikai
- ✅ komfort / hőmelegítés / wellness / relaxáció / diszkomfort / alhasi meleg

Részletek: `plan/COMPLIANCE_CLAIMS_CHECKLIST.md` (parent folder).

## Backend: Supabase

- **Project**: `kdfoaamnmzhrdbrzawtf` (eu-central-1 Frankfurt)
- **Auth**: email/password + magic-link, super_admin auto-grant 19perro76@gmail.com + notebooklmzsolt@gmail.com
- **RLS**: minden táblán, role-based (customer / admin / super_admin / editor / supporter / beneficiary)
- **Tables**: 46 (identity + e-commerce + edukáció + NGO támogatás + AI chat + i18n + audit + admin)
- **Edge Functions**: 4 deployed (admin: `https://supabase.com/dashboard/project/kdfoaamnmzhrdbrzawtf/functions`)
- **Cron jobs**: 4 (cleanup, audit-pii-redact, support-expire, newsletter-purge)

## Frontend: Netlify

- **URL**: https://ebc-comfort.netlify.app
- **Project**: `ebc-comfort` (team 19perro76/PETER)
- **Auto-deploy**: GitHub-connect után minden push → auto-build

## Local dev

```bash
cd web
npm install
cp ../.env.example ./.env.local  # akkor töltsd ki a NEXT_PUBLIC_SUPABASE_* értékekkel
npm run dev    # → http://localhost:3000
```

Supabase migrations push:
```bash
cd ../
export SUPABASE_ACCESS_TOKEN=<PAT>
export SUPABASE_DB_PASSWORD=<password>
npx supabase link --project-ref kdfoaamnmzhrdbrzawtf
npx supabase db push
npx supabase functions deploy ai-chat-completion
```

## NO PAID SERVICES

- Netlify free tier
- Supabase free tier (Frankfurt EU)
- Anthropic API (~$5-10/hó)
- Telegram bot @Ebcftb_bot (free)
- NO Vercel paid, NO GitHub Actions cron, NO managed cloud — minden ingyenes vagy api-pay-as-go

---

**Üdv**, Olah Zsolt Péter (19perro76@gmail.com) — `Csicsike76` GitHub
