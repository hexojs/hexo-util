import chai from 'chai';
import { Readable } from 'stream';
import CacheStream from '../lib/cache_stream';

chai.should();

describe('CacheStream', () => {
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
