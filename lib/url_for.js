'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const relative_url = require('./relative_url');
const prettyUrls = require('./pretty_urls');

const cache = {};

function urlForHelper(path = '/', options) {
  const { config } = this;

  options = Object.assign({
    relative: config.relative_link
  }, options);

  // Resolve relative url
  if (options.relative) {
    return relative_url(this.path, path);
  }

  const { root } = config;
  const prettyUrlsOptions = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, config.pretty_urls);

  // cacheId is designed to works across different hexo.config & options
  const cacheId = `${config.url}-${root}-${prettyUrlsOptions.trailing_index}-${prettyUrlsOptions.trailing_html}-${path}`;
  if (cache[cacheId] != null) return cache[cacheId];

  const pathRegex = /^(#|\/\/|http(s)?:)/;
  if (pathRegex.test(path)) {
    cache[cacheId] = path;
    return path;
  }

  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is an external link or a data url
  if (data.hostname !== sitehost || data.origin === 'null') {
    cache[cacheId] = path;
    return path;
  }

  // Prepend root path
  path = encodeURL((root + path).replace(/\/{2,}/g, '/'));

  path = prettyUrls(path, prettyUrlsOptions);

  cache[cacheId] = path;
  return path;
}

module.exports = urlForHelper;
