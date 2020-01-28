'use strict';

const unescapeHTML = str => {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');

  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&#96;/g, '`')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3D;/g, '=');
};

module.exports = unescapeHTML;
