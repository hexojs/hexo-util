'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const prettyUrls = require('./pretty_urls');

const cache = {};

function fullUrlForHelper(path = '/') {
  const pathRegex = /^(\/\/|http(s)?:)/;
  if (pathRegex.test(path)) return path;

  const { config } = this;
  const prettyUrlsOptions = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, config.pretty_urls);

  // cacheId is designed to works across different hexo.config & options
  const cacheId = `${config.url}-${prettyUrlsOptions.trailing_index}-${prettyUrlsOptions.trailing_html}-${path}`;
  if (cache[cacheId] != null) return cache[cacheId];

  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is an external link or a data url
  if (data.hostname !== sitehost || data.origin === 'null') return path;

  path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));

  path = prettyUrls(path, prettyUrlsOptions);

  cache[cacheId] = path;
  return path;
}

module.exports = fullUrlForHelper;
