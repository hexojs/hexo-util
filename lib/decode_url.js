'use strict';

// To be refactored to WHATWG URL API
// after support for Node 8 is dropped.
// url.format(WHATWG URL object) in Node 8 doesn't support port number

const { parse, format } = require('url');
const { toUnicode } = require('./punycode');

const safeDecodeURI = (str) => {
  try {
    return decodeURI(str);
  } catch (err) {
    return str;
  }
};

const decodeURL = (str) => {
  const parsed = parse(str);
  if (parsed.protocol) {
    const obj = Object.assign({}, {
      auth: parsed.auth,
      protocol: parsed.protocol,
      host: toUnicode(parsed.host),
      pathname: safeDecodeURI(parsed.pathname)
    });

    if (parsed.hash) {
      Object.assign(obj, { hash: safeDecodeURI(parsed.hash) });
    }

    if (parsed.search) {
      Object.assign(obj, { search: safeDecodeURI(parsed.search) });
    }

    return format(obj);
  }

  return safeDecodeURI(str);
};

module.exports = decodeURL;
