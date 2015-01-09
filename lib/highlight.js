var hljs = require('highlight.js');

hljs.configure({
  classPrefix: ''
});

module.exports = function(str, options){
  if (typeof str !== 'string') throw new TypeError('str must be a string!');
  options = options || {};

  var gutter = options.hasOwnProperty('gutter') ? options.gutter : true;
  var wrap = options.hasOwnProperty('wrap') ? options.wrap : true;
  var firstLine = options.hasOwnProperty('firstLine') ? +options.firstLine : 1;
  var lang = options.lang;
  var caption = options.caption;
  var tab = options.tab;
  var data = highlight(str, lang);

  if (!wrap) return data.value;

  var lines = data.value.split('\n');
  var numbers = '';
  var content = '';
  var result = '';
  var line;

  for (var i = 0, len = lines.length; i < len; i++){
    line = lines[i];
    if (tab) line = replaceTabs(line, tab);

    numbers += '<span class="line">' + (firstLine + i) + '</span>\n';
    content += '<span class="line">' + line + '</span>\n';
  }

  result += '<figure class="highlight ' + data.language + '">';

  if (caption){
    result += '<figcaption>' + caption + '</figcaption>';
  }

  result += '<table><tr>';

  if (gutter){
    result += '<td class="gutter"><pre>' + numbers + '</pre></td>';
  }

  result += '<td class="code"><pre>' + content + '</pre></td>';
  result += '</tr></table></figure>';

  return result;
};

function replaceTabs(str, tab){
  return str.replace(/^\t+/, function(match){
    var result = '';

    for (var i = 0, len = match.length; i < len; i++){
      result += tab;
    }

    return result;
  });
}

function highlight(str, lang){
  if (!lang) return hljs.highlightAuto(str);

  if (lang === 'plain'){
    return {language: lang, value: str};
  }

  try {
    return hljs.highlight(lang.toLowerCase(), str);
  } catch (err){
    return hljs.highlightAuto(str);
  }
}