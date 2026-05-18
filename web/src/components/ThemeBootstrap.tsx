// Inline script to apply theme before page renders → avoids flash
// Reads ebc_theme cookie or prefers-color-scheme

export default function ThemeBootstrap() {
  const code = `
(function() {
  try {
    var m = document.cookie.split('; ').find(function(c){return c.indexOf('ebc_theme=')===0;});
    var pref = m ? m.split('=')[1] : 'system';
    var resolved = pref === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : pref;
    document.documentElement.setAttribute('data-theme', resolved);
  } catch (e) {}
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
