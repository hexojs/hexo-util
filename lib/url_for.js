'use strict';

const { URL } = require('url');
const encodeURL = require('./encode_url');
const relative_url = require('./relative_url');

const urlObj = (str) => {
  try {
    return new URL(str);
  } catch (err) {
    return str;
  }
};

function urlForHelper(path = '/', options) {
  if (path[0] === '#' || path.startsWith('//')) {
    return path;
  }

  const { config } = this;
  const { root } = config;
  const data = urlObj(path);

  options = Object.assign({
    relative: config.relative_link
  }, options);

  // Exit if this is an external path
  if (typeof data === 'object') {
    if (data.origin !== 'null') return path;
  }

  // Resolve relative url
  if (options.relative) {
    return relative_url(this.path, path);
  }

  // Prepend root path
  path = encodeURL((root + path).replace(/\/{2,}/g, '/'));

  return path;
}

module.exports = urlForHelper;
