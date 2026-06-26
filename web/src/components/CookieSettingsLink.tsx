'use client';

// Label comes from the localized footer-nav dict (passed by PublicShell) so
// all 24 locales are covered, not just the few hardcoded here before.
export default function CookieSettingsLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('ebc:open-cookie-settings'))}
      className="hover:underline cursor-pointer text-inherit"
    >
      {label}
    </button>
  );
}
