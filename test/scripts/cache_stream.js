'use strict';

var Readable = require('stream').Readable;

describe('CacheStream', function() {
  var CacheStream = require('../../lib/cache_stream');

  it('default', function() {
    var src = new Readable();
    var cacheStream = new CacheStream();
    var content = Buffer.from('test');

    src.push(content);
    src.push(null);
    src.pipe(cacheStream);

    cacheStream.on('finish', function() {
      cacheStream.getCache().should.eql(content);
    });
  });

  it('destroy', function() {
    var cacheStream = new CacheStream();
    cacheStream._cache = [Buffer.alloc(1)];

    cacheStream.destroy();
    cacheStream._cache.should.have.length(0);
  });
});
