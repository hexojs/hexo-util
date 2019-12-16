'use strict';

const { createHash } = require('crypto');
const { stringify } = require('querystring');
const LFU = require('node-lfu-cache');
const cache = new LFU(20);

function md5(str) {
  return createHash('md5').update(str).digest('hex');
}

function gravatarHelper(email, options) {
  if (typeof options === 'number') {
    options = {s: options};
  }

  const qs = stringify(options);
  const cacheId = `${email}-${qs}`;

  if (cache.has(cacheId)) return cache.get(cacheId);

  let str = `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}`;
  if (qs) str += `?${qs}`;

  cache.set(cacheId, str);
  return str;
}

module.exports = gravatarHelper;
