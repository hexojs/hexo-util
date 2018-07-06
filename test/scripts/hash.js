'use strict';

const should = require('chai').should(); // eslint-disable-line
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
    const content = '123456';
    const stream = new hash.HashStream();

    stream.write(Buffer.from(content));
    stream.end();

    stream.read().should.eql(sha1(content));
  });
});
