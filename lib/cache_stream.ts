import { Transform } from 'stream';

class CacheStream extends Transform {
  _cache: Buffer[];

  constructor() {
    super();

    this._cache = [];
  }

  _transform(chunk, enc, callback) {
    const buf = chunk instanceof Buffer ? chunk : Buffer.from(chunk, enc);
    this._cache.push(buf);
    this.push(buf);
    callback();
  }

  getCache() {
    return Buffer.concat(this._cache);
  }
}


// For ESM compatibility
export default CacheStream;
// For CommonJS compatibility
if (typeof module !== 'undefined' && typeof module.exports === 'object' && module.exports !== null) {
  module.exports = CacheStream;
  // For ESM compatibility
  module.exports.default = CacheStream;
}
