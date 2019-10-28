'use strict';

const { URL } = require('url');
const { toUnicode } = require('./punycode');

const urlObj = (str) => {
  try {
    return new URL(str);
  } catch (err) {
    return str;
  }
};

const safeDecodeURI = (str) => {
  try {
    return decodeURI(str);
  } catch (err) {
    return str;
  }
};

const decodeURL = (str) => {
  const parsed = urlObj(str);
  if (typeof parsed === 'object') {
    if (parsed.origin === 'null') return str;

    // TODO: refactor to `url.format()` once Node 8 is dropped
    const url = parsed.toString().replace(parsed.hostname, toUnicode(parsed.hostname));
    return safeDecodeURI(url);
  }

  return safeDecodeURI(str);
};

module.exports = decodeURL;
