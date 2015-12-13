'use strict';

// https://github.com/azer/strip/blob/master/index.js#L5
var rStrip = /<\/?([a-z][a-z0-9]*)\b[^>]*>?/gi;

function stripHTML(str) {
  if (typeof str !== 'string') throw new TypeError('str must be a string!');
  return str.replace(rStrip, '').trim();
}

module.exports = stripHTML;
