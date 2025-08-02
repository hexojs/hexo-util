// ESM & CJS compatible test for highlight.js language aliases
import alias from '../../lib/highlight_alias.js';
import hljsCore from 'highlight.js/lib/core';
import highlight_esm from '../../lib/highlight.js';

// Register all languages in alias.languages
export async function loadAllLangHighlight() {
  for (const lang of alias.languages) {
    try {
      const mod = await import(`highlight.js/lib/languages/${lang}`);
      hljsCore.registerLanguage(lang, mod.default);
    } catch (e) {
      // Some languages may not exist in highlight.js package, skip
      // console.warn(`Could not load language module: ${lang}`);
    }
  }
  return hljsCore;
}

async function main() {
  // const hljsCore = await loadHighlight();

  for (const [aliasName, lang] of Object.entries(alias.aliases)) {
    try {
      highlight_esm(`console.log("Hello, ${aliasName}!");`, { lang, hljs: true });
      console.log(`[ESM] Alias '${aliasName}' (lang: '${lang}') successfully highlighted.`);
    } catch (err) {
      console.error(`Error for alias '${aliasName}' (lang: '${lang}')`);
    }
  }
}

main();
