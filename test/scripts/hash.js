'use strict';

require('chai').should();
const crypto = require('crypto');

function sha1(content) {
  const hash = crypto.createHash('sha1');
  hash.update(content);

  return hash.digest();
}

describe('hash', () => {
  const hash = require('../../lib/hash');

  it('hash', () => {
    const content = '123456';
    hash.hash(content).should.eql(sha1(content));
  });

  it('HashStream', () => {
    const content1 = '123456';
    const content2 = '654321';
    const stream = new hash.HashStream();

    // explicit convert
    stream.write(Buffer.from(content1));

    // implicit convert
    stream.write(content2);
    stream.end();

    stream.read().should.eql(sha1(content1 + content2));
  });
});
