'use strict';

const { Transform } = require('stream');
const crypto = require('crypto');

const ALGORITHM = 'sha1';

function HashStream() {
  Transform.call(this);

  this._hash = crypto.createHash(ALGORITHM);
}

require('util').inherits(HashStream, Transform);

HashStream.prototype._transform = function(chunk, enc, callback) {
  this._hash.update(chunk);
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
