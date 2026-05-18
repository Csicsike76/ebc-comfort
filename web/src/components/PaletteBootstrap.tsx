// Inline script: apply selected palette from cookie before page renders (no flash)

export default function PaletteBootstrap() {
  const code = `
(function() {
  try {
    var m = document.cookie.split('; ').find(function(c){return c.indexOf('ebc_palette=')===0;});
    if (!m) return;
    var paletteId = m.split('=')[1];
    var stored = localStorage.getItem('ebc_palette_data');
    if (!stored) return;
    var data = JSON.parse(stored);
    if (!data || data.id !== paletteId) return;
    var theme = document.documentElement.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var tokens = data.tokens && data.tokens[theme];
    if (!tokens) return;
    var root = document.documentElement.style;
    Object.keys(tokens).forEach(function(k) {
      var cssVar = '--color-' + (k === 'accent2' ? 'accent2' : k);
      root.setProperty(cssVar, tokens[k]);
    });
  } catch (e) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
