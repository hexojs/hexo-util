'use strict';

import crypto from 'crypto';

const ALGORITHM = 'sha1';

function createSha1Hash() {
  return crypto.createHash(ALGORITHM);
}

function hash(content) {
  const hash = createSha1Hash();
  hash.update(content);
  return hash.digest();
}

export {hash, createSha1Hash};