'use strict';

require('chai').should();
const crypto = require('crypto');

function sha1(content) {
  const hash = crypto.createHash('sha1');
  hash.update(content);

  return hash.digest();
}

describe('hash', () => {
  const hash = require('../lib/hash');

  it('hash', () => {
    const content = '123456';
    hash.hash(content).should.eql(sha1(content));
  });

  it('createSha1Hash', () => {
    const _sha1 = hash.createSha1Hash();
    const content = '123456';
    _sha1.update(content);
    _sha1.digest().should.eql(sha1(content));
  });

  it('createSha1Hash - streamMode', () => {
    const content1 = '123456';
    const content2 = '654321';
    const stream = hash.createSha1Hash();
    // explicit convert
    stream.write(Buffer.from(content1));
    // implicit convert
    stream.write(content2);
    stream.end();
    stream.read().should.eql(sha1(content1 + content2));
  });
});
