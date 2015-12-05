'use strict';

var path = require('path');
var fs = require('fs');
var hljs = require('highlight.js');
var languages = hljs.listLanguages();

var dest = path.join(__dirname, '../build/highlight_alias.json');
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

fs.writeFile(dest, JSON.stringify(result), function(err) {
  if (err) return console.error(err);

  console.log('Highlight alias build success');
});
