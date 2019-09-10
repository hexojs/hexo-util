'use strict';

const { parse, format } = require('url');

function encodeURL(str) {
  if (parse(str).protocol) {
    const obj = Object.assign({}, {
      protocol: parse(str).protocol,
      hostname: parse(str).hostname,
      pathname: encodeURI(decodeURI(parse(str).pathname))
    });

    if (parse(str).hash) {
      Object.assign(obj, { hash: encodeURI(decodeURI(parse(str).hash)) });
    }

    if (parse(str).search) {
      Object.assign(obj, { search: encodeURI(decodeURI(parse(str).search)) });
    }

    return format(obj);
  }

  return encodeURI(str);
}

module.exports = encodeURL;
