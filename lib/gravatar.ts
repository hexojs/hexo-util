import { BinaryLike, createHash } from 'crypto';
import { ParsedUrlQueryInput, stringify } from 'querystring';
import Cache from './cache.js';
const cache = new Cache();

function md5(str: BinaryLike) {
  return createHash('md5').update(str).digest('hex');
}

export function gravatarHelper(email: string, options?: ParsedUrlQueryInput | number) {
  if (typeof options === 'number') {
    options = {s: options};
  }

  const hash = cache.has(email) ? cache.get(email) : md5(email.toLowerCase());
  let str = `https://www.gravatar.com/avatar/${hash}`;

  const qs = stringify(options);

  if (qs) str += `?${qs}`;

  cache.set('email', hash);

  return str;
}


// For ESM compatibility
export default gravatarHelper;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = gravatarHelper;
  // For ESM compatibility
  module.exports.default = gravatarHelper;
}
