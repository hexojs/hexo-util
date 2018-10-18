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

  it('createSha1Hash', function() {
    var _sha1 = hash.createSha1Hash();
    var content = '123456';
    _sha1.update(content);
    _sha1.digest().should.eql(sha1(content));
  });

  it('createSha1Hash - streamMode', function() {
    var content1 = '123456';
    var content2 = '654321';
    var stream = hash.createSha1Hash();
    // explicit convert
    stream.write(Buffer.from(content1));
    // implicit convert
    stream.write(content2);
    stream.end();
    stream.read().should.eql(sha1(content1 + content2));
  });
});
