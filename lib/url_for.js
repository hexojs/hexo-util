'use strict';

const { parse, URL } = require('url');
const encodeURL = require('./encode_url');
const relative_url = require('./relative_url');
const prettyUrls = require('./pretty_urls');

const LFU = require('node-lfu-cache');
const cache = new LFU(100);

function urlForHelper(path = '/', options) {
  const pathRegex = /^(#|\/\/|http(s)?:)/;
  if (pathRegex.test(path)) return path;

  const { config } = this;
  const { root } = config;

  options = Object.assign({
    relative: config.relative_link
  }, options);

  // Resolve & return relative url before being cached
  if (options.relative) {
    return relative_url(this.path, path);
  }

  const prettyUrlsOptions = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, config.pretty_urls);

  // cacheId is designed to works across different hexo.config & options
  const cacheId = `${config.url}-${root}-${prettyUrlsOptions.trailing_index}-${prettyUrlsOptions.trailing_html}-${path}`;

  if (cache.has(cacheId)) return cache.get(cacheId);

  const sitehost = parse(config.url).hostname || config.url;
  const data = new URL(path, `http://${sitehost}`);

  // Exit if input is an external link or a data url
  if (data.hostname !== sitehost || data.origin === 'null') return path;

  // Prepend root path
  path = encodeURL((root + path).replace(/\/{2,}/g, '/'));

  path = prettyUrls(path, prettyUrlsOptions);

  cache.set(cacheId, path);
  return path;
}

module.exports = urlForHelper;
