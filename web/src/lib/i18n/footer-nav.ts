// Footer / nav labels in all 24 EU locales. hu+en authored; 22 machine-translated
// + QA-reviewed (mt cookie_settings hand-fixed). Regenerate via footer-nav-i18n-22 workflow.
import { type Locale } from '@/lib/i18n/config';

export interface FooterNav { faq: string; terms: string; privacy: string; cookie: string; cookie_settings: string; }

const FOOTER_NAV: Record<Locale, FooterNav> = {
  hu: {"faq":"GY.I.K.","terms":"ÁSZF","privacy":"Adatvédelem","cookie":"Cookie","cookie_settings":"Cookie-beállítások"},
  en: {"faq":"FAQ","terms":"Terms","privacy":"Privacy","cookie":"Cookies","cookie_settings":"Cookie settings"},
  de: {"faq":"FAQ","terms":"AGB","privacy":"Datenschutz","cookie":"Cookies","cookie_settings":"Cookie-Einstellungen"},
  fr: {"faq":"FAQ","terms":"CGV","privacy":"Confidentialité","cookie":"Cookies","cookie_settings":"Paramètres des cookies"},
  it: {"faq":"FAQ","terms":"Termini","privacy":"Privacy","cookie":"Cookie","cookie_settings":"Impostazioni cookie"},
  es: {"faq":"Preguntas frecuentes","terms":"Términos","privacy":"Privacidad","cookie":"Cookies","cookie_settings":"Configuración de cookies"},
  pl: {"faq":"FAQ","terms":"Regulamin","privacy":"Prywatność","cookie":"Pliki cookie","cookie_settings":"Ustawienia cookie"},
  ro: {"faq":"FAQ","terms":"Termeni","privacy":"Confidențialitate","cookie":"Cookie-uri","cookie_settings":"Setări cookie-uri"},
  nl: {"faq":"FAQ","terms":"Voorwaarden","privacy":"Privacy","cookie":"Cookies","cookie_settings":"Cookie-instellingen"},
  pt: {"faq":"FAQ","terms":"Termos","privacy":"Privacidade","cookie":"Cookies","cookie_settings":"Definições de cookies"},
  cs: {"faq":"FAQ","terms":"Podmínky","privacy":"Soukromí","cookie":"Cookies","cookie_settings":"Nastavení cookies"},
  sk: {"faq":"FAQ","terms":"Podmienky","privacy":"Súkromie","cookie":"Cookies","cookie_settings":"Nastavenia cookies"},
  sv: {"faq":"Vanliga frågor","terms":"Villkor","privacy":"Integritet","cookie":"Cookies","cookie_settings":"Cookie-inställningar"},
  da: {"faq":"FAQ","terms":"Vilkår","privacy":"Privatliv","cookie":"Cookies","cookie_settings":"Cookieindstillinger"},
  fi: {"faq":"UKK","terms":"Käyttöehdot","privacy":"Tietosuoja","cookie":"Evästeet","cookie_settings":"Evästeasetukset"},
  bg: {"faq":"Въпроси","terms":"Условия","privacy":"Поверителност","cookie":"Бисквитки","cookie_settings":"Настройки за бисквитки"},
  hr: {"faq":"Česta pitanja","terms":"Uvjeti","privacy":"Privatnost","cookie":"Kolačići","cookie_settings":"Postavke kolačića"},
  et: {"faq":"KKK","terms":"Tingimused","privacy":"Privaatsus","cookie":"Küpsised","cookie_settings":"Küpsiste seaded"},
  el: {"faq":"Συχνές ερωτήσεις","terms":"Όροι χρήσης","privacy":"Απόρρητο","cookie":"Cookies","cookie_settings":"Ρυθμίσεις cookies"},
  ga: {"faq":"Ceisteanna Coitianta","terms":"Téarmaí","privacy":"Príobháideachas","cookie":"Fianáin","cookie_settings":"Socruithe fianán"},
  lv: {"faq":"BUJ","terms":"Noteikumi","privacy":"Privātums","cookie":"Sīkdatnes","cookie_settings":"Sīkdatņu iestatījumi"},
  lt: {"faq":"DUK","terms":"Sąlygos","privacy":"Privatumas","cookie":"Slapukai","cookie_settings":"Slapukų nustatymai"},
  mt: {"faq":"FAQ","terms":"Termini","privacy":"Privatezza","cookie":"Cookies","cookie_settings":"Issettjar tal-cookies"},
  sl: {"faq":"Pogosta vprašanja","terms":"Pogoji","privacy":"Zasebnost","cookie":"Piškotki","cookie_settings":"Nastavitve piškotkov"},
};

export function getFooterNav(locale: Locale): FooterNav {
  return FOOTER_NAV[locale] ?? FOOTER_NAV.en;
}
