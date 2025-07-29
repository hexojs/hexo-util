import { parse } from 'url';
import encodeURL from './encode_url.js';
import prettyUrls from './pretty_urls.js';
import Cache from './cache.js';
const cache = new Cache<string>();

export function fullUrlForHelper(path = '/') {
  // Safe destructuring to avoid errors if `this` is undefined
  const { config = {} } = this || {};
  const prettyUrlsOptions = Object.assign({
    trailing_index: true,
    trailing_html: true
  }, config.pretty_urls);

  // cacheId is designed to works across different hexo.config & options
  return cache.apply(`${config.url}-${prettyUrlsOptions.trailing_index}-${prettyUrlsOptions.trailing_html}-${path}`, () => {
    if (/^(\/\/|http(s)?:)/.test(path)) return path;

    const sitehost = parse(config.url).hostname || config.url;
    const data = new URL(path, `http://${sitehost}`);

    // Exit if input is an external link or a data url
    if (data.hostname !== sitehost || data.origin === 'null') return path;

    path = encodeURL(config.url + `/${path}`.replace(/\/{2,}/g, '/'));
    path = prettyUrls(path, prettyUrlsOptions);

    return path;
  });
}


// For ESM compatibility
export default fullUrlForHelper;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = fullUrlForHelper;
  // For ESM compatibility
  module.exports.default = fullUrlForHelper;
}
