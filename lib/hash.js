'use strict';

var Transform = require('stream').Transform;
var crypto = require('crypto');

var ALGORITHM = 'sha1';

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
  callback(null, this._hash.digest());
};

exports.hash = function(content) {
  var hash = crypto.createHash(ALGORITHM);
  hash.update(content);
  return hash.digest();
};

exports.HashStream = HashStream;
