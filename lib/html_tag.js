'use strict';

const encodeURL = require('./encode_url');
const escapeHTML = require('./escape_html');
const regexUrl = /(cite|download|href|src|url)$/i;

function encSrcset(str) {
  str.split(' ')
    .forEach(subStr => {
      if (subStr.match(/\S/)) {
        subStr = subStr.trim();
        str = str.replace(subStr, encodeURI(subStr));
      }
    });
  return str;
}

function htmlTag(tag, attrs, text, escape = true) {
  if (!tag) throw new TypeError('tag is required!');

  let result = `<${escapeHTML(tag)}`;

  for (const i in attrs) {
    if (attrs[i] === null || typeof attrs[i] === 'undefined') result += '';
    else {
      if (i.match(regexUrl)) result += ` ${escapeHTML(i)}="${encodeURL(attrs[i])}"`;
      else if (attrs[i] === true || i === attrs[i]) result += ` ${escapeHTML(i)}`;
      else if (i.match(/srcset$/i)) result += ` ${escapeHTML(i)}="${encSrcset(attrs[i])}"`;
      else result += ` ${escapeHTML(i)}="${escapeHTML(String(attrs[i]))}"`;
    }
  }

  if (escape && text && tag !== 'style') text = escapeHTML(String(text));
  if (text && tag === 'style') {
    text = text.replace(/url\(['"](.*?)['"]\)/gi, (urlAttr, url) => {
      return `url("${encodeURL(url)}")`;
    });
  }

  if (text === null || typeof text === 'undefined') result += '>';
  else result += `>${text}</${escapeHTML(tag)}>`;

  return result;
}

module.exports = htmlTag;
