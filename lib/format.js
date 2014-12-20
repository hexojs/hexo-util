// https://github.com/azer/strip/blob/master/index.js#L5
var rStrip = /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi;

exports.stripHtml = function(str){
  if (typeof str !== 'string') str = str.toString();
  return str.replace(rStrip, '').trim();
};

exports.strip_html = exports.stripHtml;

exports.trim = function(str){
  if (typeof str !== 'string') str = str.toString();
  return str.trim();
};

exports.titlecase = require('inflection').titleize;

exports.wordWrap = function(text, width){
  width = width || 80;

  var arr = [];

  for (var i = 0, length = text.length; i < length; i += width){
    arr.push(text.substr(i, width));
  }

  return arr.join('\n');
};

exports.word_wrap = exports.wordWrap;

exports.truncate = function(text, options){
  var length = options.length || 30;
  var omission = options.omission || '...';
  var separator = options.separator;

  if (text.length <= length) return text;

  var result = '';

  if (separator){
    var split = text.split(separator);

    for (var i = 0, len = split.length; i < len; i++){
      var item = split[i];

      if ((result + item + omission).length - 1 <= length){
        result += item + ' ';
      } else {
        break;
      }
    }

    result = result.substring(0, result.length - 1) + omission;
  } else {
    result = text.substring(0, length - omission.length) + omission;
  }


  return result;
};