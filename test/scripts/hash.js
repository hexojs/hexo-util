'use strict';

var should = require('chai').should(); // eslint-disable-line
var crypto = require('crypto');

function sha1(content) {
  var hash = crypto.createHash('sha1');
  hash.update(content);

  return hash.digest();
}

describe('hash', function() {
  var hash = require('../../lib/hash');

  it('hash', function() {
    var content = '123456';
    hash.hash(content).should.eql(sha1(content));
  });

  it('HashStream', function() {
    var content = '123456';
    var stream = new hash.HashStream();

    stream.write(Buffer.from(content));
    stream.end();

    stream.read().should.eql(sha1(content));
  });
});
