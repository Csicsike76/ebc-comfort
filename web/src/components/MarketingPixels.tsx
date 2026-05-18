'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { readConsentFromCookie } from '@/lib/cookie-consent';

/**
 * Marketing pixels — gated by:
 *   1. env var configured (NEXT_PUBLIC_*_PIXEL_ID non-placeholder)
 *   2. user consent (analytics for GA, marketing for Meta+TikTok+GoogleAds)
 * Reads cookie on mount; until consent decision is made, NO pixel loads.
 */
export default function MarketingPixels() {
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktok = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const googleAds = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

  const metaConfigured = !!meta && !meta.includes('PLACEHOLDER');
  const tiktokConfigured = !!tiktok && !tiktok.includes('PLACEHOLDER');
  const googleAdsConfigured = !!googleAds && !googleAds.includes('PLACEHOLDER');

  const [marketingOk, setMarketingOk] = useState(false);
  const [analyticsOk, setAnalyticsOk] = useState(false);

  useEffect(() => {
    const consent = readConsentFromCookie();
    if (consent) {
      setMarketingOk(consent.marketing);
      setAnalyticsOk(consent.analytics);
    }
  }, []);

  return (
    <>
      {metaConfigured && marketingOk && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`,
          }}
        />
      )}
      {tiktokConfigured && marketingOk && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktok}');ttq.page();}(window,document,'ttq');`,
          }}
        />
      )}
      {googleAdsConfigured && (analyticsOk || marketingOk) && (
        <>
          <Script
            id="google-ads"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAds}`}
          />
          <Script
            id="google-ads-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAds}');`,
            }}
          />
        </>
      )}
    </>
  );
}
