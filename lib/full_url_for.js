'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const prettyUrls = require('./pretty_urls');

function fullUrlForHelper(path = '/') {
  const pathRegex = /^(\/\/|http(s)?:)/;
  if (pathRegex.test(path)) return path;

  const { config } = this;
  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is an external link or a data url
  if (data.hostname !== sitehost || data.origin === 'null') return path;

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));

  const prettyUrlsOptions = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, config.pretty_urls);

  path = prettyUrls(path, prettyUrlsOptions);

  return path;
}

module.exports = fullUrlForHelper;
