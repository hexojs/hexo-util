'use strict';

const { URL } = require('url');

const urlObj = (str) => {
  try {
    return new URL(str);
  } catch (err) {
    return str;
  }
};

/**
 * Check whether the link is external
 * @param {String} url The url to check
 * @returns {Boolean} True if the link doesn't have protocol or link has same host with config.url
 */

function isExternalLink(url) {
  const { config } = this;
  const exclude = Array.isArray(config.external_link.exclude) ? config.external_link.exclude
    : [config.external_link.exclude];
  const data = urlObj(url);
  const host = data.hostname;
  const sitehost = typeof urlObj(config.url) === 'object' ? urlObj(config.url).hostname : config.url;

  if (!sitehost || typeof data === 'string') return false;

  // handle mailto: javascript: vbscript: and so on
  if (data.origin === 'null') return false;

  if (exclude && exclude.length) {
    for (const i of exclude) {
      if (host === i) return false;
    }
  }

  if (host !== sitehost) return true;

  return false;
}

module.exports = isExternalLink;
