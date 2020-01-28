'use strict';

const unescapeHTML = require('./unescape_html');

/* const htmlEntityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
  '`': '&#96;',
  '/': '&#x2F;',
  '=': '&#x3D;'
}; */

function escapeHTML(str) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  str = unescapeHTML(str);

  // http://stackoverflow.com/a/12034334
  // return str.replace(/[&<>"'`/=]/g, a => htmlEntityMap[a]);

  // Multiple replacement is faster than map replacement on Node.js 12 or later.
  // Benchmark: https://runkit.com/sukkaw/5e3003ffe7e84c0013f6210d
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .replace(/\//g, '&#x2F;')
    .replace(/=/g, '&#x3D;');
}

module.exports = escapeHTML;
