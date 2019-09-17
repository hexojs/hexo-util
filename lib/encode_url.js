'use strict';

const { parse, format } = require('url');

function encodeURL(str) {
  const parsed = parse(str);
  if (parsed.protocol) {
    const obj = Object.assign({}, {
      auth: parsed.auth,
      protocol: parsed.protocol,
      host: parsed.host,
      pathname: encodeURI(safeDecodeURI(parsed.pathname))
    });

    if (parsed.hash) {
      Object.assign(obj, { hash: encodeURI(safeDecodeURI(parsed.hash)) });
    }

    if (parsed.search) {
      Object.assign(obj, { search: encodeURI(safeDecodeURI(parsed.search)) });
    }

    return format(obj);
  }

  return encodeURI(safeDecodeURI(str));
}

function safeDecodeURI(str) {
  try {
    return decodeURI(str);
  } catch (err) {
    return str;
  }
}

module.exports = encodeURL;
