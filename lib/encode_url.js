'use strict';

const { parse, format } = require('url');

function encodeURL(str) {
  if (parse(str).protocol) {
    return format({
      protocol: parse(str).protocol,
      hostname: parse(str).hostname,
      pathname: encodeURI(decodeURI(parse(str).pathname))
    });
  }

  return encodeURI(str);
}

module.exports = encodeURL;
