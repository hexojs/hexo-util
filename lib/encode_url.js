'use strict';

const { URL } = require('url');

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
    return parsed.toString();
  }

  return encodeURI(safeDecodeURI(str));
};

module.exports = encodeURL;
