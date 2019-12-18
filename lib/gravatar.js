'use strict';

const { createHash } = require('crypto');
const { stringify } = require('querystring');

const cache = {};

function md5(str) {
  return createHash('md5').update(str).digest('hex');
}

function gravatarHelper(email, options) {
  if (typeof options === 'number') {
    options = {s: options};
  }

  const qs = stringify(options);

  const cacheId = `${email}-${qs}`;

  if (cache[cacheId] != null) return cache[cacheId];

  let str = `https://www.gravatar.com/avatar/${md5(email.toLowerCase())}`;

  if (qs) str += `?${qs}`;

  cache[cacheId] = str;
  return str;
}

module.exports = gravatarHelper;
