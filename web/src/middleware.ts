import { NextRequest, NextResponse } from 'next/server';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, isValidLocale, resolveLocaleFromHeader } from '@/lib/i18n/config';

const LOCALE_COOKIE = 'ebc_locale';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for assets, api, _next, favicon, auth callback.
  // `/auth/callback` MUST stay un-prefixed because Supabase magic-link
  // emails point at the bare path; redirecting it through locale prefix
  // breaks the OAuth code-exchange.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/brand') ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Already has locale segment? pass through
  const firstSeg = pathname.split('/')[1];
  if (isValidLocale(firstSeg)) {
    // Persist preference cookie if not set or different
    const res = NextResponse.next();
    if (req.cookies.get(LOCALE_COOKIE)?.value !== firstSeg) {
      res.cookies.set(LOCALE_COOKIE, firstSeg, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }
    return res;
  }

  // Resolve locale: cookie > accept-language > default
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  const locale = cookieLocale && isValidLocale(cookieLocale)
    ? cookieLocale
    : resolveLocaleFromHeader(req.headers.get('accept-language'));

  const target = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, req.url);
  target.search = req.nextUrl.search;
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ['/((?!_next|api|auth|brand|.*\\..*).*)'],
};
