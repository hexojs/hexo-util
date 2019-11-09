'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const isExternalLink = require('./is_external_link');

function fullUrlForHelper(path = '/') {
  if (path.startsWith('//')) return path;

  const { config } = this;
  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if this is an external link
  if (isExternalLink.call(this, path)) return path;

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));
  return path;
}

module.exports = fullUrlForHelper;
