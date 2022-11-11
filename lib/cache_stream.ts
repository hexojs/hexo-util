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

export = CacheStream;
