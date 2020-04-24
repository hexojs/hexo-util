'use strict';

require('chai').should();

const { Readable } = require('stream');

describe('CacheStream', () => {
  const CacheStream = require('../lib/cache_stream');

  it('default', () => {
    const src = new Readable();
    const cacheStream = new CacheStream();
    const content = Buffer.from('test');

    src.push(content);
    src.push(null);
    src.pipe(cacheStream);

    cacheStream.on('finish', () => {
      cacheStream.getCache().should.eql(content);
    });
  });
});
