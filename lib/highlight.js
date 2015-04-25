'use strict';

var ent = require('ent');
var hljs;

module.exports = function(str, options){
  if (typeof str !== 'string') throw new TypeError('str must be a string!');
  options = options || {};

  if (!hljs) initHighlight();

  var auto_detect = options.hasOwnProperty('auto_detect') ? options.auto_detect : true;
  var gutter = options.hasOwnProperty('gutter') ? options.gutter : true;
  var wrap = options.hasOwnProperty('wrap') ? options.wrap : true;
  var firstLine = options.hasOwnProperty('firstLine') ? +options.firstLine : 1;
  var lang = options.lang;
  var caption = options.caption;
  var tab = options.tab;
  var data = highlight(str, lang, auto_detect);

  if (!wrap) return data.value;

  var lines = data.value.split('\n');
  var numbers = '';
  var content = '';
  var result = '';
  var line;

  for (var i = 0, len = lines.length; i < len; i++){
    line = lines[i];
    if (tab) line = replaceTabs(line, tab);

    numbers += '<span class="line">' + (firstLine + i) + '</span><br>';
    content += '<span class="line">' + line + '</span><br>';
  }

  result += '<figure class="highlight' + (data.language ? ' ' + data.language : '') + '">';

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

function initHighlight(){
  hljs = require('highlight.js');

  hljs.configure({
    classPrefix: ''
  });
}

function replaceTabs(str, tab){
  return str.replace(/^\t+/, function(match){
    var result = '';

    for (var i = 0, len = match.length; i < len; i++){
      result += tab;
    }

    return result;
  });
}

function highlight(str, lang, auto_detect){
  auto_detect = (typeof auto_detect === 'undefined') ? true : auto_detect;
  if (!lang) {
    if (auto_detect) {
      return hljs.highlightAuto(str);
    } else {
      lang = 'plain';
    }
  }

  var result = {value: ent.encode(str)};
  lang = lang.toLowerCase();

  if (lang === 'plain'){
    result.language = lang;
    return result;
  }

  if (!hljs.getLanguage(lang)){
    return result;
  }

  return tryHighlight(str, lang) || result;
}

function tryHighlight(str, lang){
  try {
    return hljs.highlight(lang, str);
  } catch (err){
    return;
  }
}
