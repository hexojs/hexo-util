'use strict';

var hljs = require('highlight.js');
var languages = hljs.listLanguages();
const fs = require('fs');

var result = {
  languages: languages,
  aliases: {}
};

languages.forEach(function(lang) {
  result.aliases[lang] = lang;

  var def = require('highlight.js/lib/languages/' + lang)(hljs);
  var aliases = def.aliases;

  if (aliases) {
    aliases.forEach(function(alias) {
      result.aliases[alias] = lang;
    });
  }
});

const stream = fs.createWriteStream('highlight_alias.json');
stream.write(JSON.stringify(result));
stream.on('end', () => {
  stream.end();
});

