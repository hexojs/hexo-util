import { parse } from 'url';
import encodeURL from './encode_url.js';
import relative_url from './relative_url.js';
import prettyUrls from './pretty_urls.js';
import Cache from './cache.js';
const cache = new Cache<string>();

/**
 * url_for options type
 * @example
 * // to call this type
 * type urlOpt = Parameters<typeof import('hexo-util')['url_for']>[1];
 */
interface UrlForOptions {
  relative?: boolean;
}

/**
 * get url relative to base URL (config_yml.url)
 * @param path relative path inside `source` folder (config_yml.source_dir)
 * @param options
 * @returns
 * @example
 * // global `hexo` must be exist when used this function inside plugin
 * const Hutil = require('hexo-util')
 * console.log(Hutil.url_for.bind(hexo)('path/to/file/inside/source.css')); // https://example.com/path/to/file/inside/source.css
 */
function urlForHelper(path = '/', options: UrlForOptions | null = {}) {
  if (/^(#|\/\/|http(s)?:)/.test(path)) return path;

  // Safe destructuring to avoid errors if `this` is undefined
  const { config = {} } = this || {};

  options = Object.assign(
    {
      relative: config.relative_link
    },
    // fallback empty object when options filled with NULL
    options || {}
  );

  // Resolve relative url
  if (options.relative) {
    return relative_url(this.path, path);
  }

  const { root } = config;
  const prettyUrlsOptions = Object.assign(
    {
      trailing_index: true,
      trailing_html: true
    },
    config.pretty_urls
  );

  // cacheId is designed to works across different hexo.config & options
  return cache.apply(
    `${config.url}-${root}-${prettyUrlsOptions.trailing_index}-${prettyUrlsOptions.trailing_html}-${path}`,
    () => {
      const urlString = typeof config.url === 'string' ? config.url : '';
      const sitehost = parse(urlString).hostname || urlString;
      let data: URL;
      try {
        data = new URL(path, `http://${sitehost}`);
      } catch (e) {
        return path;
      }

      // Exit if input is an external link or a data url
      if (data.hostname !== sitehost || data.origin === 'null') {
        return path;
      }

      // Prepend root path
      path = encodeURL((root + path).replace(/\/{2,}/g, '/'));

      path = prettyUrls(path, prettyUrlsOptions);

      return path;
    }
  );
}

export default urlForHelper;
