const escapeTestNoEncode = /[<>"'`/=]|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '`': '&#96;',
  '/': '&#x2F;',
  '=': '&#x3D;'
};
const getEscapeReplacement = (ch: string) => escapeReplacements[ch];

function escapeHTML(str: string) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  // https://github.com/markedjs/marked/blob/master/src/helpers.js
  if (escapeTestNoEncode.test(str)) {
    return str.replace(escapeReplaceNoEncode, getEscapeReplacement);
  }
  return str;
}

export = escapeHTML;
