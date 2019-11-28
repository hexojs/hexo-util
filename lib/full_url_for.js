'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');

function fullUrlForHelper(path = '/') {
  if (path.startsWith('//')) return path;

  const { config } = this;
  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is an external link or a data url
  if (data.hostname !== sitehost || data.origin === 'null') return path;

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));

  const { trailing_index } = Object.assign({
    trailing_index: true
  }, config.pretty_urls);

  if (!trailing_index) path = path.replace(/index\.html$/, '');

  return path;
}

module.exports = fullUrlForHelper;
