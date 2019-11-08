'use strict';

const { parse, URL } = require('url');

/**
 * Check whether the link is external
 * @param {String} url The url to check
 * @returns {Boolean} True if the link doesn't have protocol or link has same host with config.url
 */

function isExternalLink(url) {
  const { config } = this;
  const sitehost = parse(config.url).hostname || config.url;
  // Pass a base to new URL
  const data = new URL(url, `http://${sitehost}`);

  if (!sitehost || typeof data === 'string') return false;

  // handle mailto: javascript: vbscript: and so on
  if (data.origin === 'null') return false;

  const host = data.hostname;
  const exclude = Array.isArray(config.external_link.exclude) ? config.external_link.exclude
    : [config.external_link.exclude];

  if (exclude && exclude.length) {
    for (const i of exclude) {
      if (host === i) return false;
    }
  }

  if (host !== sitehost) return true;

  return false;
}

module.exports = isExternalLink;
