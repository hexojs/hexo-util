// https://github.com/azer/strip/blob/master/index.js#L5
var rStrip = /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi;

function stripHTML(str){
  if (typeof str !== 'string') str = str.toString();
  return str.replace(rStrip, '').trim();
}

function trim(str){
  if (typeof str !== 'string') str = str.toString();
  return str.trim();
}

// https://github.com/rails/rails/blob/v4.2.0/actionview/lib/action_view/helpers/text_helper.rb#L240
function wordWrap(str, options){
  if (typeof str !== 'string') str = str.toString();
  options = options || {};

  var width = options.line_width || 80;
  var regex = new RegExp('(.{1,' + width + '})(\\s+|$)', 'g');
  var lines = str.split('\n');
  var line = '';

  for (var i = 0, len = lines.length; i < len; i++){
    line = lines[i];

    if (line.length > width){
      lines[i] = line.replace(regex, '$1\n').trim();
    }
  }

  return lines.join('\n');
}

function truncate(str, options){
  if (typeof str !== 'string') str = str.toString();
  options = options || {};

  var length = options.length || 30;
  var omission = options.omission || '...';
  var separator = options.separator;
  var omissionLength = omission.length;

  if (separator){
    var words = str.split(separator);
    var word = '';
    var result = '';
    var resultLength = 0;

    for (var i = 0, len = words.length; i < len; i++){
      word = words[i];

      if (resultLength + word.length + omissionLength < length){
        result += word + separator;
        resultLength = result.length;
      } else {
        return result.substring(0, resultLength - 1) + omission;
      }
    }
  } else {
    return str.substring(0, length - omissionLength) + omission;
  }
}

exports.stripHTML = exports.strip_html = stripHTML;
exports.trim = trim;
exports.titlecase = require('inflection').titleize;
exports.wordWrap = exports.word_wrap = wordWrap;
exports.truncate = truncate;