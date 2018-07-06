'use strict';

const Stream = require('stream');
const Transform = Stream.Transform;
const crypto = require('crypto');

const ALGORITHM = 'sha1';

function HashStream() {
  Transform.call(this, {
    objectMode: true
  });

  this._hash = crypto.createHash(ALGORITHM);
}

require('util').inherits(HashStream, Transform);

HashStream.prototype._transform = function(chunk, enc, callback) {
  const buffer = chunk instanceof Buffer ? chunk : Buffer.from(chunk, enc);

  this._hash.update(buffer);
  callback();
};

HashStream.prototype._flush = function(callback) {
  this.push(this._hash.digest());
  callback();
};

exports.hash = content => {
  const hash = crypto.createHash(ALGORITHM);
  hash.update(content);
  return hash.digest();
};

exports.HashStream = HashStream;
