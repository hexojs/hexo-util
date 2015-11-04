'use strict';

var Entities = require('html-entities').XmlEntities;
var entities = new Entities();
var hljs;

module.exports = function(str, options) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');
  options = options || {};

  if (!hljs) initHighlight();

  var gutter = options.hasOwnProperty('gutter') ? options.gutter : true;
  var wrap = options.hasOwnProperty('wrap') ? options.wrap : true;
  var firstLine = options.hasOwnProperty('firstLine') ? +options.firstLine : 1;
  var caption = options.caption;
  var tab = options.tab;
  var data = highlight(str, options);

  if (!wrap) return data.value;

  var lines = data.value.split('\n');
  var numbers = '';
  var content = '';
  var result = '';
  var line;

  for (var i = 0, len = lines.length; i < len; i++) {
    line = lines[i];
    if (tab) line = replaceTabs(line, tab);

    numbers += '<span class="line">' + (firstLine + i) + '</span><br>';
    content += '<span class="line">' + line + '</span><br>';
  }

  result += '<figure class="highlight' + (data.language ? ' ' + data.language : '') + '">';

  if (caption) {
    result += '<figcaption>' + caption + '</figcaption>';
  }

  result += '<table><tr>';

  if (gutter) {
    result += '<td class="gutter"><pre>' + numbers + '</pre></td>';
  }

  result += '<td class="code"><pre>' + content + '</pre></td>';
  result += '</tr></table></figure>';

  return result;
};

function initHighlight() {
  hljs = require('highlight.js');

  hljs.configure({
    classPrefix: ''
  });
}

function encodePlainString(str) {
  return entities.encode(str);
}

function replaceTabs(str, tab) {
  return str.replace(/^\t+/, function(match) {
    var result = '';

    for (var i = 0, len = match.length; i < len; i++) {
      result += tab;
    }

    return result;
  });
}

function highlight(str, options) {
  var lang = options.lang;
  var autoDetect = options.hasOwnProperty('autoDetect') ? options.autoDetect : false;

  if (!lang) {
    if (autoDetect) {
      return hljs.highlightAuto(str);
    }

    lang = 'plain';
  }

  var result = {
    value: encodePlainString(str),
    language: lang.toLowerCase()
  };

  if (result.language === 'plain') {
    return result;
  }

  if (!hljs.getLanguage(result.language)) {
    result.language = 'plain';
    return result;
  }

  return tryHighlight(str, result.language) || result;
}

function tryHighlight(str, lang) {
  try {
    return hljs.highlight(lang, str);
  } catch (err) {
    return;
  }
}
