'use strict';

const encodeURL = require('./encode_url');
const escapeHTML = require('./escape_html');

function htmlTag(tag, attrs, text, escape = true) {
  if (!tag) throw new TypeError('tag is required!');

  let result = `<${escapeHTML(tag)}`;

  for (const i in attrs) {
    if (attrs[i] === null || typeof attrs[i] === 'undefined') result += '';
    else {
      if (i === 'href' || i === 'src') result += ` ${i}="${encodeURL(attrs[i])}"`;
      else result += ` ${escapeHTML(i)}="${escapeHTML(String(attrs[i]))}"`;
    }
  }

  if (escape && text) text = escapeHTML(String(text));

  if (text === null || typeof text === 'undefined') result += '>';
  else result += `>${text}</${escapeHTML(tag)}>`

  return result;
}

module.exports = htmlTag;
