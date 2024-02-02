const hljs = require('highlight.js');
const fs = require('fs');

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

const stream = fs.createWriteStream('highlight_alias.json');
stream.write(JSON.stringify(result));
stream.on('end', () => {
  stream.end();
});
