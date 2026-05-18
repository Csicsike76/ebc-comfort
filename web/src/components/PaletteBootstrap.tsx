// Inline script: apply selected palette + radius + globe-size from cookies
// before page renders (no flash).

export default function PaletteBootstrap() {
  const code = `
(function() {
  try {
    var root = document.documentElement.style;
    var cookies = {};
    document.cookie.split('; ').forEach(function(c){
      var i = c.indexOf('=');
      if (i > 0) cookies[c.slice(0, i)] = decodeURIComponent(c.slice(i + 1));
    });

    // Palette
    var paletteId = cookies['ebc_palette'];
    if (paletteId) {
      var stored = localStorage.getItem('ebc_palette_data');
      if (stored) {
        var data = JSON.parse(stored);
        if (data && data.id === paletteId) {
          var theme = document.documentElement.getAttribute('data-theme') ||
            (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          var tokens = data.tokens && data.tokens[theme];
          if (tokens) {
            Object.keys(tokens).forEach(function(k) {
              var cssVar = '--color-' + (k === 'accent2' ? 'accent2' : k);
              root.setProperty(cssVar, tokens[k]);
            });
          }
        }
      }
    }

    // Card radius
    var r = parseInt(cookies['ebc_radius'], 10);
    if (!isNaN(r)) {
      root.setProperty('--radius-card', r + 'px');
      root.setProperty('--radius-feature', (r + 4) + 'px');
      root.setProperty('--radius-how-wrap', Math.min(r * 2, 56) + 'px');
      root.setProperty('--radius-disclaimer', Math.min(r + 8, 40) + 'px');
    }

    // Globe size (vmin %)
    var g = parseInt(cookies['ebc_globe'], 10);
    if (!isNaN(g)) {
      root.setProperty('--globe-size-vmin', String(g));
    }

    // Font (read from localStorage ebc_font_key, fall back to ebc_font cookie key)
    try {
      var fontRaw = localStorage.getItem('ebc_font_key');
      if (fontRaw) {
        var fontData = JSON.parse(fontRaw);
        if (fontData && fontData.family && cookies['ebc_font'] === fontData.key) {
          if (fontData.googleQuery && !document.querySelector('link[data-ebc-font="' + fontData.key + '"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=' + fontData.googleQuery + '&display=swap';
            link.dataset.ebcFont = fontData.key;
            document.head.appendChild(link);
          }
          root.setProperty('--font-sans', fontData.family);
        }
      }
    } catch (e2) {}
  } catch (e) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
