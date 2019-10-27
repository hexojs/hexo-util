'use strict';

const { URL, format } = require('url');

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

const encodeURL = (str) => {
  const parsed = urlObj(str);
  if (typeof parsed === 'object') {
    if (parsed.origin === 'null') return str;

    parsed.search = encodeURI(safeDecodeURI(parsed.search));
    // preserve host (international domain name) as is.
    return format(parsed, { unicode: true});
  }

  return encodeURI(safeDecodeURI(str));
};

module.exports = encodeURL;
