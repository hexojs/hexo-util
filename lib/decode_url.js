'use strict';

const { parse, format } = require('url');

const safeDecodeURI = str => {
  try {
    return decodeURI(str);
  } catch (err) {
    return str;
  }
};

const decodeURL = str => {
  if (parse(str).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    const url = format(parsed, { unicode: true });
    return safeDecodeURI(url);
  }

  return safeDecodeURI(str);
};

module.exports = decodeURL;
