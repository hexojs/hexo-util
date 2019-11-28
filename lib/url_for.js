'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const relative_url = require('./relative_url');

function urlForHelper(path = '/', options) {
  if (path.startsWith('#') || path.startsWith('//')) return path;

  const { config } = this;
  const { root } = config;
  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is an external link or a data url
  if (data.hostname !== sitehost || data.origin === 'null') return path;

  options = Object.assign({
    relative: config.relative_link
  }, options);

  // Resolve relative url
  if (options.relative) {
    return relative_url(this.path, path);
  }

  // Prepend root path
  path = encodeURL((root + path).replace(/\/{2,}/g, '/'));

  const { trailing_index } = Object.assign({
    trailing_index: true
  }, config.pretty_urls);

  if (!trailing_index) path = path.replace(/index\.html$/, '');

  return path;
}

module.exports = urlForHelper;
