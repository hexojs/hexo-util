const { convertCjs } = require('../utils.cjs');
convertCjs(); // Ensure CJS files are converted before running tests

const hljs = require('../../dist/cjs/highlight.cjs');
const alias = require('../../dist/cjs/highlight_alias.cjs');

for (const [aliasName, lang] of Object.entries(alias.aliases)) {
  try {
    const result = hljs(`console.log("Hello, ${aliasName}!");`, { lang, hljs: true });
    console.log(`[CJS] Alias '${aliasName}' (lang: '${lang}') successfully highlighted.`);
  } catch (err) {
    console.error(`Error for alias '${aliasName}' (lang: '${lang}')`, err);
  }
}
