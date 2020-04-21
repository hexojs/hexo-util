'use strict';

const { parse, format } = require('url');

const safeDecodeURI = str => {
  try {
    return decodeURI(str);
  } catch (err) {
    return str;
  }
};

const encodeURL = str => {
  if (parse(str).protocol) {
    const parsed = new URL(str);

    // Exit if input is a data url
    if (parsed.origin === 'null') return str;

    parsed.search = encodeURI(safeDecodeURI(parsed.search));
    // preserve IDN
    return format(parsed, { unicode: true });
  }

  return encodeURI(safeDecodeURI(str));
};

module.exports = encodeURL;
