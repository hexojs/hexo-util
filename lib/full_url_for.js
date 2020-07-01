'use strict';

const { parse } = require('url');
const encodeURL = require('./encode_url');
const prettyUrls = require('./pretty_urls');

const Cache = require('./cache');
const cache = new Cache();

function fullUrlForHelper(path = '/') {
  const { config } = this;
  const prettyUrlsOptions = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, config.pretty_urls);

  // cacheId is designed to works across different hexo.config & options
  return cache.apply(`${config.url}-${prettyUrlsOptions.trailing_index}-${prettyUrlsOptions.trailing_html}-${path}`, () => {
    if (/^(\/\/|http(s)?:)/.test(path)) return path;
    if (path === '/') return config.url;

    const { host, path: sitePath, protocol } = parse(config.url);
    const data = new URL(path, `http://${host}`);

    // Exit if input is an external link or a data url
    if (data.host !== host || data.origin === 'null') return path;

    path = encodeURL(protocol + '//' + host + (sitePath + `/${path}`).replace(/\/{2,}/g, '/'));
    path = prettyUrls(path, prettyUrlsOptions);

    return path;
  });
}

module.exports = fullUrlForHelper;
