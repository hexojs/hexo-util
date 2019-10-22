'use strict';

const { URL } = require('url');
const encodeURL = require('./encode_url');

const urlObj = (str) => {
  try {
    return new URL(str);
  } catch (err) {
    return str;
  }
};

function fullUrlForHelper(path = '/') {
  if (path.startsWith('//')) return path;
  const { config } = this;
  const data = urlObj(path);

  // Exit if this is an external path
  if (typeof data === 'object') {
    if (data.origin !== 'null') return path;
  }

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));
  return path;
}

module.exports = fullUrlForHelper;
