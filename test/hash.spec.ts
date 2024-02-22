import { createHash } from 'crypto';
import { hash, createSha1Hash } from '../lib/hash';

function sha1(content) {
  const hash = createHash('sha1');
  hash.update(content);

  return hash.digest();
}

describe('hash', () => {
  it('hash', () => {
    const content = '123456';
    hash(content).should.eql(sha1(content));
  });

  it('createSha1Hash', () => {
    const _sha1 = createSha1Hash();
    const content = '123456';
    _sha1.update(content);
    _sha1.digest().should.eql(sha1(content));
  });

  it('createSha1Hash - streamMode', () => {
    const content1 = '123456';
    const content2 = '654321';
    const stream = createSha1Hash();
    // explicit convert
    stream.write(Buffer.from(content1));
    // implicit convert
    stream.write(content2);
    stream.end();
    stream.read().should.eql(sha1(content1 + content2));
  });
});
