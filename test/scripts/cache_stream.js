'use strict';

const { Readable } = require('stream');

describe('CacheStream', () => {
  const CacheStream = require('../../lib/cache_stream');

  it('default', () => {
    const src = new Readable();
    const cacheStream = new CacheStream();
    const content1 = 'test1';
    const content2 = 'test2';

    // explicit convert
    src.push(Buffer.from(content1));

    // implicit convert
    src.push(content2);

    src.push(null);
    src.pipe(cacheStream);

    cacheStream.on('finish', () => {
      cacheStream.getCache().should.eql(Buffer.from(content1 + content2));
    });
  });

  it('destroy', () => {
    const cacheStream = new CacheStream();
    cacheStream._cache = [Buffer.alloc(1)];

    cacheStream.destroy();
    cacheStream._cache.should.have.length(0);
  });
});
