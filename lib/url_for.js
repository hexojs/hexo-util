'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const isExternalLink = require('./is_external_link');
const relative_url = require('./relative_url');

function urlForHelper(path = '/', options) {
  if (path.startsWith('#') || path.startsWith('//')) {
    return path;
  }

  const { config } = this;
  const { root } = config;
  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if this is an external link
  if (isExternalLink.call(this, path)) return path;

  options = Object.assign({
    relative: config.relative_link
  }, options);

  // Resolve relative url
  if (options.relative) {
    return relative_url(this.path, path);
  }

  // Prepend root path
  path = encodeURL((root + path).replace(/\/{2,}/g, '/'));

  return path;
}

module.exports = urlForHelper;
