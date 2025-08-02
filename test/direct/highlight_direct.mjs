import hljs from '../../dist/esm/highlight_esm.js';
import alias from '../../dist/esm/highlight_alias.js';

for (const [aliasName, lang] of Object.entries(alias.aliases)) {
  try {
    const result = hljs(`console.log("Hello, ${aliasName}!");`, { lang, hljs: true });
    console.log(`[ESM] Alias '${aliasName}' (lang: '${lang}') successfully highlighted.`);
  } catch (err) {
    console.error(`Error for alias '${aliasName}' (lang: '${lang}')`, err);
  }
}
