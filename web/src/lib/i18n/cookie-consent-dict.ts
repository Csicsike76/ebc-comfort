/**
 * Cookie-consent banner translations — full 24 EU official languages.
 * GDPR + ePrivacy Art. 5(3) require consent UI to be readable to the user.
 */
import type { Locale } from './config';

export interface CookieConsentDict {
  title: string;
  body: string;
  detailsLink: string;
  customize: string;
  acceptAll: string;
  onlyNecessary: string;
  save: string;
  cat_necessary: string;
  cat_necessary_desc: string;
  cat_functional: string;
  cat_functional_desc: string;
  cat_analytics: string;
  cat_analytics_desc: string;
  cat_marketing: string;
  cat_marketing_desc: string;
  settings: string;
}

const en: CookieConsentDict = {
  title: 'Cookie settings',
  body: 'This site uses cookies for operation, experience, and (with consent) analytics + marketing. Details:',
  detailsLink: 'Cookie notice',
  customize: 'Customize',
  acceptAll: 'Accept all',
  onlyNecessary: 'Only necessary',
  save: 'Save',
  cat_necessary: 'Necessary (always on)',
  cat_necessary_desc: 'Login, CSRF, cart contents. Required for the webshop to function.',
  cat_functional: 'Functional',
  cat_functional_desc: 'Theme + palette + language preference memory.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — site-visit measurement.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Meta + TikTok + Google Ads pixels — advertising attribution.',
  settings: 'Cookie settings',
};

const hu: CookieConsentDict = {
  title: 'Cookie-beállítások',
  body: 'A weboldal cookie-kat használ a működéshez, az élmény javításához és (hozzájárulás esetén) statisztikai + marketing célokra. Részletes leírás:',
  detailsLink: 'Cookie-tájékoztató',
  customize: 'Testreszab',
  acceptAll: 'Mind elfogadom',
  onlyNecessary: 'Csak szükségesek',
  save: 'Mentés',
  cat_necessary: 'Szükséges (mindig aktív)',
  cat_necessary_desc: 'Bejelentkezés, biztonsági token, kosár tartalma. Ezek nélkül a webshop nem működik.',
  cat_functional: 'Funkcionális',
  cat_functional_desc: 'Téma + paletta-preferencia, nyelvi beállítás emlékezete.',
  cat_analytics: 'Analitika',
  cat_analytics_desc: 'Google Analytics — látogatottság-mérés.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Meta + TikTok + Google Ads pixelek — reklám-attribució.',
  settings: 'Cookie-beállítások',
};

const de: CookieConsentDict = {
  title: 'Cookie-Einstellungen',
  body: 'Diese Website verwendet Cookies für Betrieb, Komfort und (mit Einwilligung) für Analytics + Marketing. Details:',
  detailsLink: 'Cookie-Hinweis',
  customize: 'Anpassen',
  acceptAll: 'Alle akzeptieren',
  onlyNecessary: 'Nur notwendige',
  save: 'Speichern',
  cat_necessary: 'Notwendig (immer aktiv)',
  cat_necessary_desc: 'Anmeldung, CSRF, Warenkorb. Erforderlich für den Shopbetrieb.',
  cat_functional: 'Funktional',
  cat_functional_desc: 'Theme- und Sprach-Voreinstellungen.',
  cat_analytics: 'Analytik',
  cat_analytics_desc: 'Google Analytics — Besuchsmessung.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Meta + TikTok + Google Ads Pixel — Werbe-Attribution.',
  settings: 'Cookie-Einstellungen',
};

const fr: CookieConsentDict = {
  title: 'Paramètres des cookies',
  body: 'Ce site utilise des cookies pour fonctionner, améliorer l’expérience et (avec consentement) pour l’analytique + le marketing. Détails :',
  detailsLink: 'Notice cookie',
  customize: 'Personnaliser',
  acceptAll: 'Tout accepter',
  onlyNecessary: 'Uniquement nécessaires',
  save: 'Enregistrer',
  cat_necessary: 'Nécessaires (toujours actifs)',
  cat_necessary_desc: 'Connexion, CSRF, contenu du panier. Indispensable au fonctionnement.',
  cat_functional: 'Fonctionnels',
  cat_functional_desc: 'Mémoire des préférences (thème, langue, palette).',
  cat_analytics: 'Analytique',
  cat_analytics_desc: 'Google Analytics — mesure d’audience.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixels Meta + TikTok + Google Ads — attribution publicitaire.',
  settings: 'Paramètres des cookies',
};

const it: CookieConsentDict = {
  title: 'Impostazioni cookie',
  body: 'Questo sito usa cookie per il funzionamento, l’esperienza e (con consenso) per analytics + marketing. Dettagli:',
  detailsLink: 'Informativa cookie',
  customize: 'Personalizza',
  acceptAll: 'Accetta tutto',
  onlyNecessary: 'Solo necessari',
  save: 'Salva',
  cat_necessary: 'Necessari (sempre attivi)',
  cat_necessary_desc: 'Accesso, CSRF, contenuto del carrello. Indispensabili per il funzionamento.',
  cat_functional: 'Funzionali',
  cat_functional_desc: 'Preferenze di tema, palette e lingua.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — misurazione visite.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixel Meta + TikTok + Google Ads.',
  settings: 'Impostazioni cookie',
};

const es: CookieConsentDict = {
  title: 'Configuración de cookies',
  body: 'Este sitio usa cookies para funcionar, mejorar la experiencia y (con consentimiento) para analítica + marketing. Detalles:',
  detailsLink: 'Aviso de cookies',
  customize: 'Personalizar',
  acceptAll: 'Aceptar todo',
  onlyNecessary: 'Solo necesarias',
  save: 'Guardar',
  cat_necessary: 'Necesarias (siempre activas)',
  cat_necessary_desc: 'Inicio de sesión, CSRF, carrito. Imprescindibles.',
  cat_functional: 'Funcionales',
  cat_functional_desc: 'Preferencias de tema, paleta e idioma.',
  cat_analytics: 'Analítica',
  cat_analytics_desc: 'Google Analytics — medición de visitas.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Píxeles de Meta + TikTok + Google Ads.',
  settings: 'Configuración de cookies',
};

const pl: CookieConsentDict = {
  title: 'Ustawienia cookies',
  body: 'Ta strona używa plików cookie do działania, doświadczenia i (za zgodą) do analityki + marketingu. Szczegóły:',
  detailsLink: 'Informacja o cookies',
  customize: 'Dostosuj',
  acceptAll: 'Akceptuj wszystkie',
  onlyNecessary: 'Tylko niezbędne',
  save: 'Zapisz',
  cat_necessary: 'Niezbędne (zawsze aktywne)',
  cat_necessary_desc: 'Logowanie, CSRF, koszyk. Wymagane do działania sklepu.',
  cat_functional: 'Funkcjonalne',
  cat_functional_desc: 'Preferencje motywu, palety, języka.',
  cat_analytics: 'Analityka',
  cat_analytics_desc: 'Google Analytics — pomiar wizyt.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Piksele Meta + TikTok + Google Ads.',
  settings: 'Ustawienia cookies',
};

const ro: CookieConsentDict = {
  title: 'Setări cookie',
  body: 'Acest site folosește cookie-uri pentru funcționare, experiență și (cu consimțământ) pentru analiză + marketing. Detalii:',
  detailsLink: 'Notă cookie',
  customize: 'Personalizează',
  acceptAll: 'Acceptă tot',
  onlyNecessary: 'Doar necesare',
  save: 'Salvează',
  cat_necessary: 'Necesare (mereu active)',
  cat_necessary_desc: 'Autentificare, CSRF, coș. Necesare pentru funcționarea magazinului.',
  cat_functional: 'Funcționale',
  cat_functional_desc: 'Preferințe temă, paletă, limbă.',
  cat_analytics: 'Analiză',
  cat_analytics_desc: 'Google Analytics — măsurare vizite.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixeli Meta + TikTok + Google Ads.',
  settings: 'Setări cookie',
};

const nl: CookieConsentDict = {
  title: 'Cookie-instellingen',
  body: 'Deze site gebruikt cookies voor werking, ervaring en (met toestemming) voor analytics + marketing. Details:',
  detailsLink: 'Cookieverklaring',
  customize: 'Aanpassen',
  acceptAll: 'Alles accepteren',
  onlyNecessary: 'Alleen noodzakelijk',
  save: 'Opslaan',
  cat_necessary: 'Noodzakelijk (altijd aan)',
  cat_necessary_desc: 'Login, CSRF, winkelwagen. Vereist voor de werking.',
  cat_functional: 'Functioneel',
  cat_functional_desc: 'Voorkeuren voor thema, palet, taal.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — bezoekmeting.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Meta + TikTok + Google Ads-pixels.',
  settings: 'Cookie-instellingen',
};

const pt: CookieConsentDict = {
  title: 'Definições de cookies',
  body: 'Este site usa cookies para funcionamento, experiência e (com consentimento) para análise + marketing. Detalhes:',
  detailsLink: 'Aviso de cookies',
  customize: 'Personalizar',
  acceptAll: 'Aceitar tudo',
  onlyNecessary: 'Só necessários',
  save: 'Guardar',
  cat_necessary: 'Necessários (sempre ativos)',
  cat_necessary_desc: 'Início de sessão, CSRF, carrinho. Indispensáveis.',
  cat_functional: 'Funcionais',
  cat_functional_desc: 'Preferências de tema, paleta, idioma.',
  cat_analytics: 'Analítica',
  cat_analytics_desc: 'Google Analytics — medição de visitas.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Píxeis Meta + TikTok + Google Ads.',
  settings: 'Definições de cookies',
};

const cs: CookieConsentDict = {
  title: 'Nastavení cookies',
  body: 'Tato stránka používá cookies pro fungování, zážitek a (se souhlasem) pro analytiku + marketing. Detaily:',
  detailsLink: 'Informace o cookies',
  customize: 'Přizpůsobit',
  acceptAll: 'Přijmout vše',
  onlyNecessary: 'Pouze nezbytné',
  save: 'Uložit',
  cat_necessary: 'Nezbytné (vždy aktivní)',
  cat_necessary_desc: 'Přihlášení, CSRF, košík. Nezbytné pro fungování obchodu.',
  cat_functional: 'Funkční',
  cat_functional_desc: 'Předvolby motivu, palety, jazyka.',
  cat_analytics: 'Analytika',
  cat_analytics_desc: 'Google Analytics — měření návštěv.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixely Meta + TikTok + Google Ads.',
  settings: 'Nastavení cookies',
};

const sk: CookieConsentDict = {
  title: 'Nastavenia cookies',
  body: 'Táto stránka používa cookies na fungovanie, zážitok a (so súhlasom) na analytiku + marketing. Podrobnosti:',
  detailsLink: 'Informácie o cookies',
  customize: 'Prispôsobiť',
  acceptAll: 'Prijať všetko',
  onlyNecessary: 'Iba nevyhnutné',
  save: 'Uložiť',
  cat_necessary: 'Nevyhnutné (vždy aktívne)',
  cat_necessary_desc: 'Prihlásenie, CSRF, košík.',
  cat_functional: 'Funkčné',
  cat_functional_desc: 'Predvoľby motívu, palety, jazyka.',
  cat_analytics: 'Analytika',
  cat_analytics_desc: 'Google Analytics — meranie návštev.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixely Meta + TikTok + Google Ads.',
  settings: 'Nastavenia cookies',
};

const sv: CookieConsentDict = {
  title: 'Cookie-inställningar',
  body: 'Den här webbplatsen använder cookies för drift, upplevelse och (med samtycke) analytics + marknadsföring. Detaljer:',
  detailsLink: 'Cookie-meddelande',
  customize: 'Anpassa',
  acceptAll: 'Acceptera alla',
  onlyNecessary: 'Endast nödvändiga',
  save: 'Spara',
  cat_necessary: 'Nödvändiga (alltid aktiva)',
  cat_necessary_desc: 'Inloggning, CSRF, varukorg.',
  cat_functional: 'Funktionella',
  cat_functional_desc: 'Tema-, palett- och språkpreferenser.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — besöksmätning.',
  cat_marketing: 'Marknadsföring',
  cat_marketing_desc: 'Meta + TikTok + Google Ads-pixlar.',
  settings: 'Cookie-inställningar',
};

const da: CookieConsentDict = {
  title: 'Cookie-indstillinger',
  body: 'Dette site bruger cookies til drift, oplevelse og (med samtykke) til analytics + marketing. Detaljer:',
  detailsLink: 'Cookie-erklæring',
  customize: 'Tilpas',
  acceptAll: 'Accepter alle',
  onlyNecessary: 'Kun nødvendige',
  save: 'Gem',
  cat_necessary: 'Nødvendige (altid aktive)',
  cat_necessary_desc: 'Login, CSRF, indkøbskurv.',
  cat_functional: 'Funktionelle',
  cat_functional_desc: 'Tema-, palet- og sprogpræferencer.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — besøgsmåling.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Meta + TikTok + Google Ads-pixels.',
  settings: 'Cookie-indstillinger',
};

const fi: CookieConsentDict = {
  title: 'Eväste-asetukset',
  body: 'Tämä sivusto käyttää evästeitä toimintaan, kokemukseen ja (suostumuksella) analytiikkaan + markkinointiin. Tiedot:',
  detailsLink: 'Evästetiedote',
  customize: 'Mukauta',
  acceptAll: 'Hyväksy kaikki',
  onlyNecessary: 'Vain välttämättömät',
  save: 'Tallenna',
  cat_necessary: 'Välttämättömät (aina päällä)',
  cat_necessary_desc: 'Kirjautuminen, CSRF, ostoskori.',
  cat_functional: 'Toiminnalliset',
  cat_functional_desc: 'Teema-, paletti- ja kieliasetukset.',
  cat_analytics: 'Analytiikka',
  cat_analytics_desc: 'Google Analytics — kävijämittaus.',
  cat_marketing: 'Markkinointi',
  cat_marketing_desc: 'Meta + TikTok + Google Ads -pikselit.',
  settings: 'Eväste-asetukset',
};

const bg: CookieConsentDict = {
  title: 'Настройки на бисквитки',
  body: 'Този сайт използва бисквитки за работа, опит и (със съгласие) за анализ + маркетинг. Подробности:',
  detailsLink: 'Известие за бисквитки',
  customize: 'Персонализирай',
  acceptAll: 'Приеми всички',
  onlyNecessary: 'Само необходими',
  save: 'Запази',
  cat_necessary: 'Необходими (винаги активни)',
  cat_necessary_desc: 'Вход, CSRF, кошница.',
  cat_functional: 'Функционални',
  cat_functional_desc: 'Предпочитания за тема, палитра, език.',
  cat_analytics: 'Анализ',
  cat_analytics_desc: 'Google Analytics — мерене на посещения.',
  cat_marketing: 'Маркетинг',
  cat_marketing_desc: 'Пиксели Meta + TikTok + Google Ads.',
  settings: 'Настройки на бисквитки',
};

const hr: CookieConsentDict = {
  title: 'Postavke kolačića',
  body: 'Ova stranica koristi kolačiće za rad, iskustvo i (uz pristanak) za analitiku + marketing. Detalji:',
  detailsLink: 'Obavijest o kolačićima',
  customize: 'Prilagodi',
  acceptAll: 'Prihvati sve',
  onlyNecessary: 'Samo nužni',
  save: 'Spremi',
  cat_necessary: 'Nužni (uvijek aktivni)',
  cat_necessary_desc: 'Prijava, CSRF, košarica.',
  cat_functional: 'Funkcionalni',
  cat_functional_desc: 'Preferencije teme, palete, jezika.',
  cat_analytics: 'Analitika',
  cat_analytics_desc: 'Google Analytics — mjerenje posjeta.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Meta + TikTok + Google Ads pikseli.',
  settings: 'Postavke kolačića',
};

const et: CookieConsentDict = {
  title: 'Küpsiste seaded',
  body: 'See sait kasutab küpsiseid toimimiseks, kogemuseks ja (nõusolekul) analüütika + turunduse jaoks. Üksikasjad:',
  detailsLink: 'Küpsiseteade',
  customize: 'Kohanda',
  acceptAll: 'Nõustu kõigiga',
  onlyNecessary: 'Ainult vajalikud',
  save: 'Salvesta',
  cat_necessary: 'Vajalikud (alati aktiivsed)',
  cat_necessary_desc: 'Sisselogimine, CSRF, ostukorv.',
  cat_functional: 'Funktsionaalsed',
  cat_functional_desc: 'Teema, palett, keele eelistused.',
  cat_analytics: 'Analüütika',
  cat_analytics_desc: 'Google Analytics — külastuste mõõtmine.',
  cat_marketing: 'Turundus',
  cat_marketing_desc: 'Meta + TikTok + Google Ads pikslid.',
  settings: 'Küpsiste seaded',
};

const el: CookieConsentDict = {
  title: 'Ρυθμίσεις cookie',
  body: 'Αυτός ο ιστότοπος χρησιμοποιεί cookies για λειτουργία, εμπειρία και (με συγκατάθεση) για analytics + marketing. Λεπτομέρειες:',
  detailsLink: 'Ενημέρωση για cookies',
  customize: 'Προσαρμογή',
  acceptAll: 'Αποδοχή όλων',
  onlyNecessary: 'Μόνο απαραίτητα',
  save: 'Αποθήκευση',
  cat_necessary: 'Απαραίτητα (πάντα ενεργά)',
  cat_necessary_desc: 'Σύνδεση, CSRF, καλάθι.',
  cat_functional: 'Λειτουργικά',
  cat_functional_desc: 'Προτιμήσεις θέματος, παλέτας, γλώσσας.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — μέτρηση επισκέψεων.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixels Meta + TikTok + Google Ads.',
  settings: 'Ρυθμίσεις cookie',
};

const ga: CookieConsentDict = {
  title: 'Socruithe fianán',
  body: 'Úsáideann an suíomh seo fianáin le haghaidh oibríochta, taithí agus (le toiliú) anailísíochta + margaíochta. Sonraí:',
  detailsLink: 'Fógra fianán',
  customize: 'Saincheap',
  acceptAll: 'Glac le gach',
  onlyNecessary: 'Riachtanach amháin',
  save: 'Sábháil',
  cat_necessary: 'Riachtanach (i gcónaí ar siúl)',
  cat_necessary_desc: 'Logáil isteach, CSRF, tralaí.',
  cat_functional: 'Feidhmiúil',
  cat_functional_desc: 'Roghanna téama, pailéid, teanga.',
  cat_analytics: 'Anailísíocht',
  cat_analytics_desc: 'Google Analytics — tomhas cuairteanna.',
  cat_marketing: 'Margaíocht',
  cat_marketing_desc: 'Picseil Meta + TikTok + Google Ads.',
  settings: 'Socruithe fianán',
};

const lv: CookieConsentDict = {
  title: 'Sīkdatņu iestatījumi',
  body: 'Šī vietne izmanto sīkdatnes darbībai, pieredzei un (ar piekrišanu) analītikai + mārketingam. Sīkāka informācija:',
  detailsLink: 'Paziņojums par sīkdatnēm',
  customize: 'Pielāgot',
  acceptAll: 'Pieņemt visu',
  onlyNecessary: 'Tikai nepieciešamās',
  save: 'Saglabāt',
  cat_necessary: 'Nepieciešamās (vienmēr aktīvas)',
  cat_necessary_desc: 'Pieslēgšanās, CSRF, grozs.',
  cat_functional: 'Funkcionālās',
  cat_functional_desc: 'Tēmas, paletes, valodas iestatījumi.',
  cat_analytics: 'Analītika',
  cat_analytics_desc: 'Google Analytics — apmeklējumu mērīšana.',
  cat_marketing: 'Mārketings',
  cat_marketing_desc: 'Meta + TikTok + Google Ads pikseļi.',
  settings: 'Sīkdatņu iestatījumi',
};

const lt: CookieConsentDict = {
  title: 'Slapukų nustatymai',
  body: 'Ši svetainė naudoja slapukus veikimui, patirčiai ir (su sutikimu) analitikai + rinkodarai. Detalės:',
  detailsLink: 'Slapukų pranešimas',
  customize: 'Pritaikyti',
  acceptAll: 'Priimti viską',
  onlyNecessary: 'Tik būtini',
  save: 'Išsaugoti',
  cat_necessary: 'Būtini (visada aktyvūs)',
  cat_necessary_desc: 'Prisijungimas, CSRF, krepšelis.',
  cat_functional: 'Funkciniai',
  cat_functional_desc: 'Temos, paletės, kalbos nustatymai.',
  cat_analytics: 'Analitika',
  cat_analytics_desc: 'Google Analytics — apsilankymų matavimas.',
  cat_marketing: 'Rinkodara',
  cat_marketing_desc: 'Meta + TikTok + Google Ads pikseliai.',
  settings: 'Slapukų nustatymai',
};

const mt: CookieConsentDict = {
  title: 'Settings tal-cookies',
  body: 'Dan is-sit juża cookies għall-operat, l-esperjenza u (bil-kunsens) għall-analytics + il-marketing. Dettalji:',
  detailsLink: 'Avviż dwar cookies',
  customize: 'Personalizza',
  acceptAll: 'Aċċetta kollox',
  onlyNecessary: 'Biss meħtieġa',
  save: 'Salva',
  cat_necessary: 'Meħtieġa (dejjem attivi)',
  cat_necessary_desc: 'Login, CSRF, karrettun.',
  cat_functional: 'Funzjonali',
  cat_functional_desc: 'Preferenzi tat-tema, palett, lingwa.',
  cat_analytics: 'Analytics',
  cat_analytics_desc: 'Google Analytics — kejl taż-żjarat.',
  cat_marketing: 'Marketing',
  cat_marketing_desc: 'Pixels Meta + TikTok + Google Ads.',
  settings: 'Settings tal-cookies',
};

const sl: CookieConsentDict = {
  title: 'Nastavitve piškotkov',
  body: 'Ta stran uporablja piškotke za delovanje, izkušnjo in (s soglasjem) za analitiko + trženje. Podrobnosti:',
  detailsLink: 'Obvestilo o piškotkih',
  customize: 'Prilagodi',
  acceptAll: 'Sprejmi vse',
  onlyNecessary: 'Samo nujne',
  save: 'Shrani',
  cat_necessary: 'Nujne (vedno aktivne)',
  cat_necessary_desc: 'Prijava, CSRF, košarica.',
  cat_functional: 'Funkcionalne',
  cat_functional_desc: 'Nastavitve teme, palete, jezika.',
  cat_analytics: 'Analitika',
  cat_analytics_desc: 'Google Analytics — meritev obiskov.',
  cat_marketing: 'Trženje',
  cat_marketing_desc: 'Piksli Meta + TikTok + Google Ads.',
  settings: 'Nastavitve piškotkov',
};

const DICTS: Record<Locale, CookieConsentDict> = {
  hu, en, de, fr, it, es, pl, ro, nl, pt, cs, sk, sv, da, fi,
  bg, hr, et, el, ga, lv, lt, mt, sl,
};

export function getCookieConsentDict(locale: Locale): CookieConsentDict {
  return DICTS[locale] ?? en;
}
