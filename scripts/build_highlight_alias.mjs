import hljs from 'highlight.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const languages = hljs.listLanguages();
const result = {
  languages: languages,
  aliases: {}
};

languages.forEach(lang => {
  result.aliases[lang] = lang;

  const aliases = hljs.getLanguage(lang).aliases;

  if (aliases) {
    aliases.forEach(alias => {
      result.aliases[alias] = lang;
    });
  }
});

const outputPaths = [
  path.join(__dirname, '../highlight_alias.json'),
  path.join(__dirname, '../dist/highlight_alias.json')
];

outputPaths.forEach(outputPath => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result));
});
