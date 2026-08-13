import Cache from './cache';
const cache = new Cache<boolean>();

/**
 * Check whether the link is external
 * @param {String} input The url to check
 * @param {String} input The hostname / url of website
 * @param {Array} input Exclude hostnames. Specific subdomain is required when applicable, including www.
 * @returns {Boolean} True if the link doesn't have protocol or link has same host with config.url
 */

function isExternalLink(input: string, sitehost: string, exclude?: string | string[]): boolean {
  return cache.apply(`${input}-${sitehost}-${exclude}`, () => {
    // Return false early for internal link
    if (!/^(\/\/|http(s)?:)/.test(input)) return false;

    sitehost = URL.parse(sitehost)?.hostname || sitehost;

    if (!sitehost) return false;

    // handle relative url and invalid url
    const data = URL.parse(input, `http://${sitehost}`);

    // if input is invalid url, data should be null
    if (!data) return false;

    // handle mailto: javascript: vbscript: and so on
    if (data.origin === 'null') return false;

    const host = data.hostname;

    if (exclude) {
      exclude = Array.isArray(exclude) ? exclude : [exclude];

      if (exclude && exclude.length) {
        for (const i of exclude) {
          if (host === i) return false;
        }
      }
    }

    if (host !== sitehost) return true;

    return false;
  });
}

export = isExternalLink;
