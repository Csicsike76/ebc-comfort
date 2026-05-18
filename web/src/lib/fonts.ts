/**
 * 23 webfont catalog (from reference HTML).
 * Each entry maps a font-key (data-font attribute) to a CSS font-family stack.
 * The font itself is loaded on-demand via Google Fonts link injection
 * (only when admin/dev-controls picks it — production never loads all 23).
 */

export interface FontEntry {
  key: string;
  label: string;
  group: 'sans' | 'serif' | 'script';
  family: string;
  googleQuery: string;
}

export const FONTS: FontEntry[] = [
  // Modern Sans
  { key: 'manrope', label: 'Manrope (default)', group: 'sans', family: "'Manrope', system-ui, sans-serif", googleQuery: 'Manrope:wght@400;500;600;700;800' },
  { key: 'inter', label: 'Inter', group: 'sans', family: "'Inter', system-ui, sans-serif", googleQuery: 'Inter:wght@400;500;600;700' },
  { key: 'space-grotesk', label: 'Space Grotesk', group: 'sans', family: "'Space Grotesk', system-ui, sans-serif", googleQuery: 'Space+Grotesk:wght@400;500;700' },
  { key: 'dm-sans', label: 'DM Sans', group: 'sans', family: "'DM Sans', system-ui, sans-serif", googleQuery: 'DM+Sans:wght@400;500;700' },
  { key: 'plus-jakarta', label: 'Plus Jakarta', group: 'sans', family: "'Plus Jakarta Sans', system-ui, sans-serif", googleQuery: 'Plus+Jakarta+Sans:wght@400;500;700' },
  { key: 'outfit', label: 'Outfit', group: 'sans', family: "'Outfit', system-ui, sans-serif", googleQuery: 'Outfit:wght@400;500;700' },
  { key: 'sora', label: 'Sora', group: 'sans', family: "'Sora', system-ui, sans-serif", googleQuery: 'Sora:wght@400;500;700' },
  { key: 'lexend', label: 'Lexend', group: 'sans', family: "'Lexend', system-ui, sans-serif", googleQuery: 'Lexend:wght@400;500;700' },
  { key: 'figtree', label: 'Figtree', group: 'sans', family: "'Figtree', system-ui, sans-serif", googleQuery: 'Figtree:wght@400;500;700' },
  { key: 'unbounded', label: 'Unbounded — display', group: 'sans', family: "'Unbounded', system-ui, sans-serif", googleQuery: 'Unbounded:wght@500;700' },
  // Elegant Serif
  { key: 'fraunces', label: 'Fraunces', group: 'serif', family: "'Fraunces', Georgia, serif", googleQuery: 'Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500' },
  { key: 'playfair', label: 'Playfair Display', group: 'serif', family: "'Playfair Display', Georgia, serif", googleQuery: 'Playfair+Display:ital,wght@0,400;0,700;1,500' },
  { key: 'cormorant', label: 'Cormorant Garamond', group: 'serif', family: "'Cormorant Garamond', Georgia, serif", googleQuery: 'Cormorant+Garamond:ital,wght@0,500;0,600;1,400' },
  { key: 'eb-garamond', label: 'EB Garamond', group: 'serif', family: "'EB Garamond', Georgia, serif", googleQuery: 'EB+Garamond:ital,wght@0,400;0,600;1,500' },
  { key: 'bodoni', label: 'Bodoni Moda', group: 'serif', family: "'Bodoni Moda', Georgia, serif", googleQuery: 'Bodoni+Moda:ital,wght@0,500;0,700;1,500' },
  { key: 'dm-serif', label: 'DM Serif Display', group: 'serif', family: "'DM Serif Display', Georgia, serif", googleQuery: 'DM+Serif+Display:ital@0;1' },
  { key: 'instrument', label: 'Instrument Serif', group: 'serif', family: "'Instrument Serif', Georgia, serif", googleQuery: 'Instrument+Serif:ital@0;1' },
  { key: 'lora', label: 'Lora', group: 'serif', family: "'Lora', Georgia, serif", googleQuery: 'Lora:ital,wght@0,400;0,600;1,500' },
  // Script / Hand-written
  { key: 'caveat', label: 'Caveat', group: 'script', family: "'Caveat', cursive", googleQuery: 'Caveat:wght@500;600;700' },
  { key: 'dancing', label: 'Dancing Script', group: 'script', family: "'Dancing Script', cursive", googleQuery: 'Dancing+Script:wght@500;700' },
  { key: 'pacifico', label: 'Pacifico', group: 'script', family: "'Pacifico', cursive", googleQuery: 'Pacifico' },
  { key: 'sacramento', label: 'Sacramento', group: 'script', family: "'Sacramento', cursive", googleQuery: 'Sacramento' },
  { key: 'kalam', label: 'Kalam', group: 'script', family: "'Kalam', cursive", googleQuery: 'Kalam:wght@400;700' },
];

export const FONT_GROUPS: Array<{ group: 'sans' | 'serif' | 'script'; label: string }> = [
  { group: 'sans', label: 'Modern Sans' },
  { group: 'serif', label: 'Elegant Serif' },
  { group: 'script', label: 'Írott / Script' },
];

export function findFont(key: string): FontEntry | undefined {
  return FONTS.find((f) => f.key === key);
}
