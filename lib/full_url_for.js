'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');

function fullUrlForHelper(path = '/') {
  if (path.startsWith('//')) return path;

  const { config } = this;
  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is a data url or external link
  if (data.origin === 'null' || data.hostname !== sitehost) return path;

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));
  return path;
}

module.exports = fullUrlForHelper;
