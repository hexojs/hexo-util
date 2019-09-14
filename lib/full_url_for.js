'use strict';

const { parse } = require('url');
const encodeURL = require('./encode_url');

function fullUrlForHelper(path = '/') {
  if (path.startsWith('//')) return path;
  const { config } = this;
  const data = parse(path);

  // Exit if this is an external path
  if (data.protocol) return path;

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));
  return path;
}

module.exports = fullUrlForHelper;
