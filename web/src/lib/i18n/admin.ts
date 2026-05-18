/**
 * Admin-only i18n. Public dictionary covers 24 EU locales; admin UI is a
 * back-office tool used by a small staff, so we maintain HU + EN only and
 * fall back any other locale to EN.
 */
import type { Locale } from './config';

const huAdmin = {
  nav: {
    brand: 'EBC Admin',
    sign_out: 'Kilépés',
    tabs: {
      dashboard: 'Áttekintés',
      products: 'Termékek',
      orders: 'Rendelések',
      support: 'Támogatás',
      articles: 'Edukáció',
      donations: 'Adományok',
      chat: 'AI chat',
      calls: 'Hívások',
      marketing: 'Marketing',
      users: 'Felhasználók',
      i18n: 'Fordítások',
      legal: 'Jogi',
      compliance: 'Compliance',
      settings: 'Beállítások',
    },
  },
  dashboard: {
    title: 'Áttekintés',
    subtitle_prefix: 'EBC NGO platform',
    cards: {
      orders: 'Rendelések',
      donations: 'Adományok',
      support_pending: 'Támogatási kérvény (függőben)',
      chat: 'AI chat beszélgetés',
      articles: 'Cikkek',
      products: 'Termékek',
      users: 'Regisztrált felhasználók',
      audit: 'Audit-log bejegyzés',
      calls: 'Telefonos hívás (Retell)',
    },
    hints: {
      users: 'profilok',
      audit: 'csak hozzáfűzhető',
      calls: 'jövőbeli',
    },
    quick_actions: {
      title: 'Gyors-akciók',
      supabase: 'Supabase Studio',
      auth_users: 'Auth-felhasználók',
      netlify: 'Netlify dashboard',
      gdpr: 'GDPR export/törlés',
    },
  },
  signin: {
    title: 'Admin bejelentkezés',
    email_label: 'E-mail',
    password_label: 'Jelszó',
    submit: 'Belépés',
    forgot: 'Elfelejtett jelszó',
    invalid: 'Hibás e-mail vagy jelszó',
  },
  common: {
    save: 'Mentés',
    cancel: 'Mégse',
    delete: 'Törlés',
    edit: 'Szerkesztés',
    create: 'Létrehozás',
    confirm: 'Megerősítés',
    status: 'Állapot',
    actions: 'Műveletek',
    loading: 'Betöltés…',
    no_data: 'Nincs adat',
  },
};

const enAdmin: typeof huAdmin = {
  nav: {
    brand: 'EBC Admin',
    sign_out: 'Sign out',
    tabs: {
      dashboard: 'Dashboard',
      products: 'Products',
      orders: 'Orders',
      support: 'Support',
      articles: 'Articles',
      donations: 'Donations',
      chat: 'AI chat',
      calls: 'Calls',
      marketing: 'Marketing',
      users: 'Users',
      i18n: 'Translations',
      legal: 'Legal',
      compliance: 'Compliance',
      settings: 'Settings',
    },
  },
  dashboard: {
    title: 'Dashboard',
    subtitle_prefix: 'EBC NGO platform',
    cards: {
      orders: 'Orders',
      donations: 'Donations',
      support_pending: 'Support requests (pending)',
      chat: 'AI chat sessions',
      articles: 'Articles',
      products: 'Products',
      users: 'Registered users',
      audit: 'Audit-log entries',
      calls: 'Phone calls (Retell)',
    },
    hints: {
      users: 'profiles',
      audit: 'append-only',
      calls: 'upcoming',
    },
    quick_actions: {
      title: 'Quick actions',
      supabase: 'Supabase Studio',
      auth_users: 'Auth users',
      netlify: 'Netlify dashboard',
      gdpr: 'GDPR export / erase',
    },
  },
  signin: {
    title: 'Admin sign-in',
    email_label: 'Email',
    password_label: 'Password',
    submit: 'Sign in',
    forgot: 'Forgot password',
    invalid: 'Invalid email or password',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    confirm: 'Confirm',
    status: 'Status',
    actions: 'Actions',
    loading: 'Loading…',
    no_data: 'No data',
  },
};

export type AdminDict = typeof huAdmin;

export function getAdminDict(locale: Locale): AdminDict {
  return locale === 'hu' ? huAdmin : enAdmin;
}
